//'./src/server/data/yelp/client.js'
import * as config from "../../config/config.js";

class YelpClient {
  constructor() {
    const getConfig = config.getConfig;
    this.API_KEY = getConfig().YELP_API_KEY;
    this.BASE_URL = getConfig().YELP_BASE_URL;
  }

  async fetchYelpAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}${endpoint}${
      queryString ? "?" + queryString : ""
    }`;

    console.log("Fetching Yelp API", { url, params });
    console.log("___", this.API_KEY, this.BASE_URL);
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
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, expires } = JSON.parse(item);
      if (expires && expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      console.log("Cache get error", error);
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
  transformYelpHours(yelpData) {
    console.log("Processing Yelp hours data:", yelpData?.hours?.[0]?.open);

    if (!yelpData?.hours?.[0]?.open) {
      console.warn("No hours data available");
      return null;
    }
  

    const hoursData = yelpData.hours[0].open;
    const isCurrentlyOpen = yelpData.hours[0].is_open_now;

    // Get current time for comparison
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}${currentMinute}`;
    const currentDay = now.getDay();

    return {
      storeName: yelpData.name,
      isOpen: isCurrentlyOpen,
      currentTime: currentTime,
      schedule: hoursData.map((slot) => ({
        day: slot.day,
        start: slot.start,
        end: slot.end,
        isCurrent: slot.day === currentDay,
        isWithinHours:
          slot.day === currentDay &&
          currentTime >= slot.start &&
          currentTime <= slot.end
      }))
    };
  }

  transformBusinessData(yelpData) {
    if (!yelpData) return null;

    return {
      name: yelpData.name,
      hours: [
        {
          is_open_now: yelpData.hours?.[0]?.is_open_now || false,
          open: yelpData.hours?.[0]?.open || []
        }
      ],
      location: {
        address: yelpData.location?.address1,
        city: yelpData.location?.city,
        state: yelpData.location?.state,
        area: yelpData.location?.neighborhood || ""
      }
    };
  }

  transformLocationAttributes(yelpData) {
    if (!yelpData) return null;
    return {
      geotags: [
        {
          title: "Location",
          attributes: [
            {
              label: "Rating",
              score: yelpData.rating || 0,
              count: yelpData.review_count || 0
            },
            {
              label: "Price",
              score: yelpData.price?.length || 1,
              count: yelpData.review_count || 0
            }
          ]
        }
      ]
    };
  }

  transformGalleryData(yelpData) {
    if (!yelpData) return null;
    return {
      hero: {
        url: "/gallery",
        gallery: yelpData.photos || []
      }
    };
  }

  getBusinessStatus(yelpData) {
    if (!yelpData?.hours?.[0]) return "Status unavailable";
    return yelpData.hours[0].is_open_now ? "Open" : "Closed";
  }
};


export default new YelpClient();