// src/server/data/yelp/api.js
import yelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

console.log("Initializing Yelp API");


export const yelpApi = {
  async searchBusinesses(term, location = 'CA', longitude, latitude) {
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
  async getBusinessFood(searchParams) {
    try {
      
      // const searchParams = {
      //   storeId,
      //   // storeAlias,
      // };
      const storeId = searchParams.storeId;
      // console.log("[yelpApi.getBusinessServices] Fetching for ID:", businessId);
      const data = await yelpClient.getBusinessFood(storeId);
      return data;
      // console.log("[yelpApi.getBusinessServices] Services received:", data);
    } catch (error) {
      console.error("[yelpApi.getBusinessServices] Error:", error);
      return null;
    }
  }
};
