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
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
    this.maxRetries = 1;
    this.requestCounts = new Map(); // Track requests per IP
    this.MAX_REQUESTS_PER_MINUTE = 1; // Limit to 1 request per minute per IP
  }

  async getCached(key) {
    try {
      // Try memory cache
      const value = this.cache.get(key);
      if (value) {
        console.log(`[YelpClient] Cache hit for ${key}`);
        return value;
      }

      // Try session storage if available (browser)
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
      console.error('[YelpClient] Cache error:', error);
    }
    return null;
  }

  async setCache(key, value, ttl = 3600) {
    try {
      // Set memory cache
      this.cache.set(key, value, ttl);

      // Set session storage if available (browser)
      if (typeof sessionStorage !== 'undefined') {
        const data = {
          value,
          expires: Date.now() + (ttl * 1000)
        };
        sessionStorage.setItem(key, JSON.stringify(data));
      }
      
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
          const cacheKey = this.getCacheKey(url);
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

  // Add new method for rate limiting
  checkRateLimit(ipAddress) {
    const now = Date.now();
    const userRequests = this.requestCounts.get(ipAddress) || { count: 0, timestamp: now };

    // Reset counter if a minute has passed
    if (now - userRequests.timestamp > 60000) {
      userRequests.count = 0;
      userRequests.timestamp = now;
    }

    // Check if user has exceeded rate limit
    if (userRequests.count >= this.MAX_REQUESTS_PER_MINUTE) {
      console.log(`[YelpClient] Rate limit exceeded for IP: ${ipAddress}`);
      return false;
    }

    // Increment counter
    userRequests.count++;
    this.requestCounts.set(ipAddress, userRequests);
    console.log(`[YelpClient] Request count for IP ${ipAddress}: ${userRequests.count}`);
    return true;
  }

  // Add new method to get client IP
  getClientIP(req) {
    return req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
  }

  // Modify fetchYelpAPI to include rate limiting
  async fetchYelpAPI(endpoint, params = {}, req) {
    const clientIP = this.getClientIP(req);
    
    if (!this.checkRateLimit(clientIP)) {
      throw new Error('Rate limit exceeded. Please try again after a minute.');
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${queryString ? "?" + queryString : ""}`;

    console.log("[YelpClient] Fetching Yelp API", { url, params, clientIP });

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

  async getBusinessDetails(businessId, req) {
    const cacheKey = `yelp:business:${businessId}`;

    try {
      // Try cache first
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log("[YelpClient] Cache hit for business", businessId);
        return cached;
      }

      // Fetch from API with rate limiting
      const data = await this.fetchYelpAPI(`/businesses/${businessId}`, {}, req);
      await this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.log("[YelpClient] Error fetching business details", error);
      throw error;
    }
  }

  async searchBusinesses(params = {}, req) {
    const cacheKey = `yelp:search:${JSON.stringify(params)}`;

    try {
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log("[YelpClient] Cache hit for search", params);
        return cached;
      }

      const data = await this.fetchYelpAPI("/businesses/search", params, req);
      await this.setCache(cacheKey, data, 1800000); // 30 minutes cache for search
      return data;
    } catch (error) {
      console.log("[YelpClient] Error searching businesses", error);
      throw error;
    }
  }

  async getBusinessReviews(businessId, req) {
    const cacheKey = `yelp:reviews:${businessId}`;

    try {
      const cached = await this.getCached(cacheKey);
      if (cached) return cached;

      const data = await this.fetchYelpAPI(`/businesses/${businessId}/reviews`, {}, req);
      await this.setCache(cacheKey, data, 3600000); // 1 hour cache for reviews
      return data;
    } catch (error) {
      console.log("[YelpClient] Error fetching reviews", error);
      throw error;
    }
  }
  
  async getBusinessFood(businessId, req) {
    const cacheKey = `yelp:business:${businessId}`;

    try {
      // Try cache first
      const cached = await this.getCached(cacheKey);
      if (cached) {
        console.log("[YelpClient] Cache hit for business", businessId);
        return cached;
      }

      // Fetch from API with rate limiting
      const data = await this.fetchYelpAPI(`/businesses/${businessId}/insights/food_and_drinks`, {}, req);
      await this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.log("[YelpClient] Error fetching business details", error);
      throw error;
    }
  }
}

export default new YelpClient();