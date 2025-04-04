// src/server/data/yelp/api.js
import yelpClient from "./yelpClient.js";
import * as config from "../../config/config.js";


// class YelpClient {
//   constructor() {
//     const getConfig = config.getConfig;
//     this.API_KEY = getConfig().YELP_API_KEY;
//     this.API_BASE_URL = getConfig().YELP_BASE_URL;
//     // this.API_KEY = process.env.YELP_API_KEY;
//     // this.BASE_URL = process.env.YELP_BASE_URL;
//     this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
//     this.requestQueue = [];
//     this.isProcessing = false;
//     this.rateLimitDelay = 1000; // 2 seconds between requests
//     this.lastRequestTime = 0;
//     this.maxRetries = 1;
//   }


export const yelpApi = {
  async searchBusinesses(term, location = 'CA', longitude, latitude) {

      const getConfig = config.getConfig;
      const API_KEY = getConfig().YELP_API_KEY;
      const API_BASE_URL = getConfig().YELP_BASE_URL;
      // API_KEY = process.env.YELP_API_KEY;
      // BASE_URL = process.env.YELP_BASE_URL;
    
    console.log("Starting business search with params:", { term, location });
    try {
      // Ensure location is not undefined
      const searchParams = {
        term,
        location: location || 'CA', // Fallback to CA if location is undefined
        limit: 1,
        longitude,
        latitude
      };
      
      const data = await yelpClient.searchBusinesses(searchParams);
      return data;
    } catch (error) {
      console.error("Error in searchBusinesses:", error);
      return null;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      console.log("[yelpApi.getBusinessDetails] Fetching for ID:", businessId);
      const data = await yelpClient.getBusinessDetails(businessId);
      // console.log("[yelpApi.getBusinessDetails] Data received:", data);
      return data;
    } catch (error) {
      console.error("[yelpApi.getBusinessDetails] Error:", error);
      return null;
    }
  },

  async getBusinessReviews(businessId) {
    try {
      // console.log("[yelpApi.getBusinessReviews] Fetching for ID:", businessId);
      const reviews = await yelpClient.getBusinessReviews(businessId);
      // console.log("[yelpApi.getBusinessReviews] Reviews received:", reviews);
      return reviews;
    } catch (error) {
      console.error("[yelpApi.getBusinessReviews] Error:", error);
      return null;
    }
  },
  async getBusinessFood(businessId) {
    try {
      // console.log("[yelpApi.getBusinessServices] Fetching for ID:", businessId);
      const services = await yelpClient.getBusinessFood(businessId);
      // console.log("[yelpApi.getBusinessServices] Services received:", services);
      return services;
    } catch (error) {
      console.error("[yelpApi.getBusinessServices] Error:", error);
      return null;
    }
  },
  async getFoodData(params) {
    try {
      const getConfig = config.getConfig;
      const API_KEY = getConfig().YELP_API_KEY;
      const API_BASE_URL = getConfig().YELP_BASE_URL;
      console.log("[yelpApi.getFoodData] Starting search with params:", params);
      const response = await fetch(`${API_BASE_URL}/businesses/search/food`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          term: params.storeName,
          location: `${params.storeCity}, ${params.storeState}`,
          longitude: params.storeLongitude,
          latitude: params.storeLatitude,
          categories: 'food,restaurants'
        }
      });

      if (!response.ok) {
        throw new Error(`Food search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("[yelpApi.getFoodData] Response:", data);
      return data;
    } catch (error) {
      console.error("[yelpApi.getFoodData] Error:", error);
      return null;
    }
  },

async getBusinessInsightsData(params) {
  try {
    const getConfig = config.getConfig;
    const API_KEY = getConfig().YELP_API_KEY;
    const API_BASE_URL = getConfig().YELP_BASE_URL;
    console.log("[yelpApi.getBusinessInsightsData] Starting search with params:", params);
    const response = await fetch(`${API_BASE_URL}/businesses/${params.storeId}/insights`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Business insights failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[yelpApi.getBusinessInsightsData] Response:", data);
    return data;
  } catch (error) {
    console.error("[yelpApi.getBusinessInsightsData] Error:", error);
    return null;
  }
},

async getServiceOfferingsData(params) {
  try {
    const getConfig = config.getConfig;
    const API_KEY = getConfig().YELP_API_KEY;
    const API_BASE_URL = getConfig().YELP_BASE_URL;
    console.log("[yelpApi.getServiceOfferingsData] Starting search with params:", params);
    const response = await fetch(`${API_BASE_URL}/businesses/${params.storeId}/services`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Service offerings failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[yelpApi.getServiceOfferingsData] Response:", data);
    return data;
  } catch (error) {
    console.error("[yelpApi.getServiceOfferingsData] Error:", error);
    return null;
  }
},

async getFoodDeliverySearchData(params) {
  try {
    const getConfig = config.getConfig;
    const API_KEY = getConfig().YELP_API_KEY;
    const API_BASE_URL = getConfig().YELP_BASE_URL;
    console.log("[yelpApi.getFoodDeliverySearchData] Starting search with params:", params);
    const response = await fetch(`${API_BASE_URL}/businesses/search/delivery`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        term: params.storeName,
        location: `${params.storeCity}, ${params.storeState}`,
        longitude: params.storeLongitude,
        latitude: params.storeLatitude
      }
    });

    if (!response.ok) {
      throw new Error(`Food delivery search failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[yelpApi.getFoodDeliverySearchData] Response:", data);
    return data;
  } catch (error) {
    console.error("[yelpApi.getFoodDeliverySearchData] Error:", error);
    return null;
  }
},

async getBusinessDetailsData(params) {
  try {
    const getConfig = config.getConfig;
    const API_KEY = getConfig().YELP_API_KEY;
    const API_BASE_URL = getConfig().YELP_BASE_URL;
    console.log("[yelpApi.getBusinessDetailsData] Starting search with params:", params);
    const response = await fetch(`${API_BASE_URL}/businesses/${params.storeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Business details failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[yelpApi.getBusinessDetailsData] Response:", data);
    return data;
  } catch (error) {
    console.error("[yelpApi.getBusinessDetailsData] Error:", error);
    return null;
  }
},

async getBusinessMatchData(params) {
  try {
    const getConfig = config.getConfig;
    const API_KEY = getConfig().YELP_API_KEY;
    const API_BASE_URL = getConfig().YELP_BASE_URL;
    console.log("[yelpApi.getBusinessMatchData] Starting search with params:", params);
    const response = await fetch(`${API_BASE_URL}/businesses/matches`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        name: params.storeName,
        address1: params.storeAddress,
        city: params.storeCity,
        state: params.storeState,
        country: 'US'
      }
    });

    if (!response.ok) {
      throw new Error(`Business match failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("[yelpApi.getBusinessMatchData] Response:", data);
    return data;
  } catch (error) {
    console.error("[yelpApi.getBusinessMatchData] Error:", error);
    return null;
  }
}
};

