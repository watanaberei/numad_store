//'./src/server/data/yelp/client.js'
import * as config from "../../config/config.js";
import NodeCache from "node-cache";

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
    this.rateLimitDelay = 1000; // Increase to 1 second between requests
    this.lastRequestTime = 0;
  }

  // Add rate limiting queue processor
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

        const response = await fetch(url, options);
        this.lastRequestTime = Date.now();
        console.log("Response status:", response.status);
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 2;
          const waitTime = parseInt(retryAfter) * 1000;
          console.log(`Rate limited, retrying in ${waitTime}ms...`);
          
          if (retries < 3) {
            await new Promise(r => setTimeout(r, waitTime));
            this.requestQueue.unshift({ url, options, resolve, reject, retries: retries + 1 });
            continue;
          } else {
            throw new Error('Max retries exceeded');
          }
        }

        if (!response.ok) {
          throw new Error(`Yelp API Error: ${response.status}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        console.error("API request failed:", error);
        reject(error);
      }
    }
    this.isProcessing = false;
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

  async getCached(key) {
    try {
      const value = this.cache.get(key);
      if (value) {
        console.log(`[YelpClient] Cache hit for ${key}`);
        return value;
      }
    } catch (error) {
      console.error('[YelpClient] Cache error:', error);
    }
    return null;
  }

  async setCache(key, value, ttl = 3600) {
    try {
      this.cache.set(key, value, ttl);
      console.log(`[YelpClient] Cached data for ${key}`);
    } catch (error) {
      console.error('[YelpClient] Cache set error:', error);
    }
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