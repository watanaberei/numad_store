//'./src/server/data/yelp/client.js'
import * as config from "../../config/config.js";



class YelpClient {
  constructor() {
    const getConfig = config.getConfig;
    this.API_KEY = getConfig().YELP_API_KEY;
    this.BASE_URL = getConfig().YELP_BASE_URL;
    // this.API_KEY = process.env.YELP_API_KEY;
    // this.BASE_URL = process.env.YELP_BASE_URL;
    this.cache = new Map(); // Add in-memory cache
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 100; // 100ms between requests
  }

  // Add rate limiting queue processor
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject, retries = 0 } = this.requestQueue.shift();
      
      try {
        const response = await fetch(url, options);
        console.log("Response status:", response.status);
        
        if (response.status === 429 && retries < 3) {
          // If rate limited, wait and retry
          console.log("Rate limited, retrying in 1 second...");
          await new Promise(r => setTimeout(r, 1000));
          this.requestQueue.unshift({ url, options, resolve, reject, retries: retries + 1 });
          continue;
        }

        if (!response.ok) {
          throw new Error(`Yelp API Error: ${response.status}`);
        }

        const data = await response.json();
        await new Promise(r => setTimeout(r, this.rateLimitDelay));
        resolve(data);
      } catch (error) {
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

  // Cache implementation using localStorage for browser
  async getCached(key) {
    try {
      // Try memory cache first
      if (this.cache.has(key)) {
        const item = this.cache.get(key);
        if (item.expires > Date.now()) {
          console.log("Memory cache hit for", key);
          return item.value;
        }
        this.cache.delete(key); // Clear expired item
      }

      // Try localStorage as backup
      const stored = localStorage.getItem(key);
      if (stored) {
        const item = JSON.parse(stored);
        if (item.expires > Date.now()) {
          console.log("LocalStorage cache hit for", key);
          // Update memory cache
          this.cache.set(key, item);
          return item.value;
        }
        localStorage.removeItem(key); // Clear expired item
      }
    } catch (error) {
      console.log("Cache get error", error);
    }
    return null;
  }

  async setCache(key, value, expiresIn) {
    try {
      const item = {
        value,
        expires: Date.now() + expiresIn
      };
      // Set both memory and localStorage
      this.cache.set(key, item);
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.log("Cache set error", error);
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
}

export default new YelpClient();