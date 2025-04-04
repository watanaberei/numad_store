// src/server/data/yelp/api.js
import yelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

console.log("Initializing Yelp API");

export const yelpApi = {
  async searchBusinesses(term, location = 'CA', longitude, latitude) {
    console.log("[yelpApi.searchBusinesses] Starting search with params:", { term, location, longitude, latitude });
    try {
      // Normalize search parameters
      const searchParams = {
        term: term?.trim(),
        location: (location || 'CA')?.trim(),
        limit: 1,
        longitude: parseFloat(longitude) || undefined,
        latitude: parseFloat(latitude) || undefined
      };
      
      // Validate required parameters
      if (!searchParams.term) {
        throw new Error('Search term is required');
      }
      
      console.log("[yelpApi.searchBusinesses] Normalized params:", searchParams);
      const data = await yelpClient.searchBusinesses(searchParams);
      
      if (!data?.businesses?.length) {
        console.log("[yelpApi.searchBusinesses] No businesses found for:", searchParams);
        return null;
      }
      
      console.log("[yelpApi.searchBusinesses] Found business:", data.businesses[0].name);
      return data;
    } catch (error) {
      console.error("[yelpApi.searchBusinesses] Error:", error.message);
      return null;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      console.log("[yelpApi.getBusinessDetails] Fetching for ID:", businessId);
      const data = await yelpClient.getBusinessDetails(businessId);
      
      if (!data) {
        console.log("[yelpApi.getBusinessDetails] No data found for ID:", businessId);
        return null;
      }
      
      console.log("[yelpApi.getBusinessDetails] Data received for:", data.name);
      return data;
    } catch (error) {
      console.error("[yelpApi.getBusinessDetails] Error:", error.message);
      return null;
    }
  },

  async getBusinessReviews(businessId) {
    try {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      console.log("[yelpApi.getBusinessReviews] Fetching for ID:", businessId);
      const reviews = await yelpClient.getBusinessReviews(businessId);
      
      if (!reviews?.reviews?.length) {
        console.log("[yelpApi.getBusinessReviews] No reviews found for ID:", businessId);
        return null;
      }
      
      console.log("[yelpApi.getBusinessReviews] Found reviews:", reviews.reviews.length);
      return reviews;
    } catch (error) {
      console.error("[yelpApi.getBusinessReviews] Error:", error.message);
      return null;
    }
  },
  
  async getBusinessFood(businessId) {
    try {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      console.log("[yelpApi.getBusinessFood] Fetching for ID:", businessId);
      const services = await yelpClient.getBusinessFood(businessId);
      
      if (!services) {
        console.log("[yelpApi.getBusinessFood] No food data found for ID:", businessId);
        return null;
      }
      
      console.log("[yelpApi.getBusinessFood] Food data received");
      return services;
    } catch (error) {
      console.error("[yelpApi.getBusinessFood] Error:", error.message);
      return null;
    }
  }
};
