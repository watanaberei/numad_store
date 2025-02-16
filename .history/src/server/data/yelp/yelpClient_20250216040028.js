//'./src/server/data/yelp/client.js'
import * as config from "../../config/config.js";
import NodeCache from "node-cache";
import fs from 'fs';
import path from 'path';

class YelpClient {
  constructor() {
    const getConfig = config.getConfig;
    this.API_KEY = getConfig().YELP_API_KEY;
    this.BASE_URL = getConfig().YELP_BASE_URL;
    // this.API_KEY = process.env.YELP_API_KEY;
    // this.BASE_URL = process.env.YELP_BASE_URL;
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 2000; // 2 seconds between requests
    this.lastRequestTime = 0;
    this.maxRetries = 3;

    // Create cache directory if it doesn't exist
    this.cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async getCached(key) {
    try {
      // Try memory cache first
      const memValue = this.cache.get(key);
      if (memValue) {
        console.log(`[YelpClient] Memory cache hit for ${key}`);
        return memValue;
      }

      // Try file cache as backup
      const filePath = path.join(this.cacheDir, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (fileData.expires > Date.now()) {
          console.log(`[YelpClient] File cache hit for ${key}`);
          this.cache.set(key, fileData.value);
          return fileData.value;
        }
        fs.unlinkSync(filePath); // Remove expired cache file
      }
    } catch (error) {
      console.error('[YelpClient] Cache error:', error);
    }
    return null;
  }

  async setCache(key, value, ttl = 3600) {
    try {
      // Set memory cache
      this.cache.set(key, value, ttl);

      // Set file cache
      const filePath = path.join(this.cacheDir, `${key}.json`);
      const fileData = {
        value,
        expires: Date.now() + (ttl * 1000)
      };
      fs.writeFileSync(filePath, JSON.stringify(fileData));
      console.log(`[YelpClient] Cached data for ${key}`);
    } catch (error) {
      console.error('[YelpClient] Cache set error:', error);
    }
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject, retries = 0 } = this.requestQueue.shift();
      
      try {
        // Ensure minimum time between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
          await new Promise(r => setTimeout(r, this.rateLimitDelay - timeSinceLastRequest));
        }

        console.log(`[YelpClient] Making request to: ${url}`);
        const response = await fetch(url, options);
        this.lastRequestTime = Date.now();
        
        if (response.status === 429) {
          const waitTime = this.rateLimitDelay * (retries + 1); // Exponential backoff
          console.log(`[YelpClient] Rate limited, waiting ${waitTime}ms`);
          await new Promise(r => setTimeout(r, waitTime));
          
          if (retries < this.maxRetries) {
            this.requestQueue.unshift({ 
              url, 
              options, 
              resolve, 
              reject, 
              retries: retries + 1 
            });
            continue;
          }
          
          // If max retries reached, return cached data if available
          // const cacheKey = this.getCacheKey(url);
          const cacheKey = url.split('?')[0];
          const cachedData = await this.getCached(cacheKey);
          if (cachedData) {
            console.log('[YelpClient] Returning cached data after rate limit');
            resolve(cachedData);
            continue;
          }
          
          throw new Error('Rate limit exceeded and no cache available');
        }

        if (!response.ok) {
          throw new Error(`Yelp API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache successful responses
        const cacheKey = this.getCacheKey(url);
        await this.setCache(cacheKey, data);
        
        resolve(data);
      } catch (error) {
        console.error("[YelpClient] API request failed:", error);
        reject(error);
      }
    }
    this.isProcessing = false;
  }

  getCacheKey(url) {
    // Create a unique cache key from the URL
    const urlObj = new URL(url);
    return urlObj.pathname.replace(/\//g, '_') + 
           '_' + 
           urlObj.searchParams.toString().replace(/[=&]/g, '_');
  }

  async fetchYelpAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${queryString ? "?" + queryString : ""}`;

    console.log("Fetching Yelp API", { url, params });

    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        options: {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        },
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  async getBusinessDetails(businessId) {
    const cacheKey = `yelp:business:${businessId}`;

    try {
      // Try cache first
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log("Cache hit for business", businessId);
        return cached;
      }

      // Fetch from API
      const data = await this.fetchYelpAPI(`/businesses/${businessId}`);
      await this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.log("Error fetching business details", error);
      throw error;
    }
  }

  async searchBusinesses(params = {}) {
    const cacheKey = `yelp:search:${JSON.stringify(params)}`;

    try {
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log("Cache hit for search", params);
        return cached;
      }

      const data = await this.fetchYelpAPI("/businesses/search", params);
      await this.setCache(cacheKey, data, 1800000); // 30 minutes cache for search
      return data;
    } catch (error) {
      console.log("Error searching businesses", error);
      throw error;
    }
  }

  async getBusinessReviews(businessId) {
    const cacheKey = `yelp:reviews:${businessId}`;

    try {
      const cached = await this.getCached(cacheKey);
      if (cached) return cached;

      const data = await this.fetchYelpAPI(`/businesses/${businessId}/reviews`);
      await this.setCache(cacheKey, data, 3600000); // 1 hour cache for reviews
      return data;
    } catch (error) {
      console.log("Error fetching reviews", error);
      throw error;
    }
  }
  
  async getBusinessFood(businessId) {
    const cacheKey = `yelp:business:${businessId}`;

    try {
      // Try cache first
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log("Cache hit for business", businessId);
        return cached;
      }

      // Fetch from API
      const data = await this.fetchYelpAPI(`/businesses/${businessId}/insights/food_and_drinks`, options);
      await this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.log("Error fetching business details", error);
      throw error;
    }
  }
}

export default new YelpClient();