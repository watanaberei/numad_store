// src/server/data/yelp/api.js
import yelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

console.log("Initializing Yelp API");

export const yelpApi = {
  async searchBusinesses(params) {
    try {
      console.log("[yelpApi.searchBusinesses] Starting with params:", params);
      const data = await yelpClient.searchBusinesses(params);
      console.log("[yelpApi.searchBusinesses] Response received:", data?.businesses?.length);
      return data;
    } catch (error) {
      console.error("[yelpApi.searchBusinesses] Error:", error);
      throw error;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      console.log("[yelpApi.getBusinessDetails] Fetching for ID:", businessId);
      const data = await yelpClient.getBusinessDetails(businessId);
      console.log("[yelpApi.getBusinessDetails] Data received:", data);
      return data;
    } catch (error) {
      console.error("[yelpApi.getBusinessDetails] Error:", error);
      throw error;
    }
  },

  async getBusinessReviews(businessId) {
    try {
      console.log("[yelpApi.getBusinessReviews] Fetching for ID:", businessId);
      const reviews = await yelpClient.getBusinessReviews(businessId);
      console.log("[yelpApi.getBusinessReviews] Reviews received:", reviews);
      return reviews;
    } catch (error) {
      console.error("[yelpApi.getBusinessReviews] Error:", error);
      return null;
    }
  }
};
