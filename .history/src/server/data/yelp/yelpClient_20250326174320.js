//'./src/server/data/yelp/client.js'
import * as config from "../../config/config.js";
import NodeCache from "node-cache";

class YelpClient {
  constructor() {
    const getConfig = config.getConfig;
    this.API_KEY = 'WmSyCzoKK7dD-RmAqIKuA0PWEXtREkpsgBCVtmiUy86oWZHApy9eZ7Q-zrTT_Yy01CUeXhkKoo_3ZUIE5mZJWF30gr-bjbqz9rcmgFnW8GMnVy6zUzp-QZJGv5PkZ3Yx'; // Use the new API key
    this.BASE_URL = 'https://api.yelp.com/v3';
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 3000; // 3 seconds between requests
    this.lastRequestTime = 0;
    this.maxRetries = 3;
    this.dailyRequestCount = 0;
    this.dailyRequestLimit = 300; // Yelp's daily limit
    this.resetTime = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000; // Next midnight
  }

  async getCached(key) {
    try {
      // Try memory cache
      const value = this.cache.get(key);
      if (value) {
        console.log(`[YelpClient] Cache hit for ${key}`);
        return value;
      }

      // Try session storage if available
      if (typeof sessionStorage !== 'undefined') {
        const stored = sessionStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.expires > Date.now()) {
            console.log(`[YelpClient] SessionStorage hit for ${key}`);
            this.cache.set(key, data.value);
            return data.value;
          }
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('[YelpClient] Cache error:', error.message);
    }
    return null;
  }

  async setCache(key, value, ttl = 3600) {
    try {
      // Set memory cache
      this.cache.set(key, value, ttl);

      // Set session storage if available
      if (typeof sessionStorage !== 'undefined') {
        const data = {
          value,
          expires: Date.now() + (ttl * 1000)
        };
        sessionStorage.setItem(key, JSON.stringify(data));
      }
      
      console.log(`[YelpClient] Cached data for ${key}`);
    } catch (error) {
      console.error('[YelpClient] Cache set error:', error.message);
    }
  }

  checkRateLimit() {
    const now = Date.now();

    // Reset daily count if we've passed the reset time
    if (now > this.resetTime) {
      this.dailyRequestCount = 0;
      this.resetTime = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
    }

    // Check if we've hit the daily limit
    if (this.dailyRequestCount >= this.dailyRequestLimit) {
      throw new Error('Daily API limit reached');
    }

    // Check time since last request
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      return this.rateLimitDelay - timeSinceLastRequest;
    }

    return 0;
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject, retries = 0 } = this.requestQueue.shift();
      
      try {
        // Check rate limits
        const waitTime = this.checkRateLimit();
        if (waitTime > 0) {
          await new Promise(r => setTimeout(r, waitTime));
        }

        console.log(`[YelpClient] Making request to: ${url}`);
        const response = await fetch(url, options);
        this.lastRequestTime = Date.now();
        this.dailyRequestCount++;
        
        if (response.status === 429) {
          // Get retry-after header or use exponential backoff
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(this.rateLimitDelay * Math.pow(2, retries), 30000);
          
          console.log(`[YelpClient] Rate limited, waiting ${waitTime}ms before retry ${retries + 1}/${this.maxRetries}`);
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
          const cacheKey = this.getCacheKey(url);
          const cachedData = await this.getCached(cacheKey);
          if (cachedData) {
            console.log('[YelpClient] Returning cached data after max retries');
            resolve(cachedData);
            continue;
          }
          
          throw new Error(`Rate limit exceeded after ${this.maxRetries} retries`);
        }

        if (!response.ok) {
          throw new Error(`Yelp API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache successful responses
        const cacheKey = this.getCacheKey(url);
        await this.setCache(cacheKey, data);
        
        resolve(data);
      } catch (error) {
        console.error("[YelpClient] API request failed:", error.message);
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