//'./src/server/data/yelp/client.js'
import * as config from "../../config/config.js";

class YelpClient {
  constructor() {
    const getConfig = config.getConfig();
    this.API_KEY = getConfig.YELP_API_KEY;
    this.BASE_URL = getConfig.YELP_BASE_URL;
  }

  async fetchYelpAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${
      queryString ? "?" + queryString : ""
    }`;

    log("Fetching Yelp API", { url, params });
    console.log("___", this.API_KEY, this)
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Yelp API Error: ${response.status}`);
      }

      const data = await response.json();
      log("Yelp API Response", data);
      return data;
    } catch (error) {
      log("Yelp API Error", error);
      throw error;
    }
  }

  // Cache implementation using localStorage for browser
  async getCached(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, expires } = JSON.parse(item);
      if (expires && expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      log("Cache get error", error);
      return null;
    }
  }

  async setCache(key, value, expiresIn = 3600000) {
    // Default 1 hour
    try {
      const item = {
        value,
        expires: Date.now() + expiresIn
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      log("Cache set error", error);
    }
  }

  async getBusinessDetails(businessId) {
    const cacheKey = `yelp:business:${businessId}`;

    try {
      // Try cache first
      const cached = await this.getCached(cacheKey);
      if (cached) {
        log("Cache hit for business", businessId);
        return cached;
      }

      // Fetch from API
      const data = await this.fetchYelpAPI(`/businesses/${businessId}`);
      await this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      log("Error fetching business details", error);
      throw error;
    }
  }

  async searchBusinesses(params = {}) {
    const cacheKey = `yelp:search:${JSON.stringify(params)}`;

    try {
      const cached = await this.getCached(cacheKey);
      if (cached) {
        log("Cache hit for search", params);
        return cached;
      }

      const data = await this.fetchYelpAPI("/businesses/search", params);
      await this.setCache(cacheKey, data, 1800000); // 30 minutes cache for search
      return data;
    } catch (error) {
      log("Error searching businesses", error);
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
      log("Error fetching reviews", error);
      throw error;
    }
  }
}

export default new YelpClient();