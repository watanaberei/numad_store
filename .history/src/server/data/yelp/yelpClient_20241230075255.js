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
  }

  async fetchYelpAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${queryString ? "?" + queryString : ""}`;


    console.log("!!!!!! Fetching Yelp API", { url, params });
    console.log("00", this.API_KEY, this.BASE_URL);
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });
      console.log("01", response);

      if (!response.ok) {
        throw new Error(`Yelp API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Yelp API Response", data);
      return data;
    } catch (error) {
      console.log("Yelp API Error", error);
      throw error;
    }
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