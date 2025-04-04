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
    this.rateLimitDelay = 3000; // 3 seconds between requests
    this.lastRequestTime = 0;
    this.maxRetries = 3;
    this.pendingRequests = new Map(); // Track pending requests by URL
  }

  getCacheKey(url) {
    return `yelp:${url}`;
  }

  async getCached(key) {
    return this.cache.get(key);
  }

  async setCache(key, value) {
    this.cache.set(key, value);
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject, retries = 0 } = this.requestQueue.shift();
      
      try {
        // Check if we have a pending request for this URL
        if (this.pendingRequests.has(url)) {
          console.log(`[YelpClient] Request already pending for: ${url}`);
          // Wait for the pending request to complete
          const pendingResult = await this.pendingRequests.get(url);
          resolve(pendingResult);
          continue;
        }

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
      } finally {
        this.pendingRequests.delete(url);
      }
    }
    this.isProcessing = false;
  }

  async fetchYelpAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${queryString ? "?" + queryString : ""}`;

    // Check cache first
    const cacheKey = this.getCacheKey(url);
    const cachedData = await this.getCached(cacheKey);
    if (cachedData) {
      console.log(`[YelpClient] Cache hit for: ${url}`);
      return cachedData;
    }

    // Check if we have a pending request for this URL
    if (this.pendingRequests.has(url)) {
      console.log(`[YelpClient] Request already pending for: ${url}`);
      return this.pendingRequests.get(url);
    }

    // Create a promise for this request
    const requestPromise = new Promise((resolve, reject) => {
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

    // Store the promise in pending requests
    this.pendingRequests.set(url, requestPromise);

    return requestPromise;
  }

  async searchBusinesses(params = {}) {
    return this.fetchYelpAPI('/businesses/search', params);
  }

  async getBusinessDetails(businessId) {
    return this.fetchYelpAPI(`/businesses/${businessId}`);
  }

  async getBusinessReviews(businessId) {
    return this.fetchYelpAPI(`/businesses/${businessId}/reviews`);
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