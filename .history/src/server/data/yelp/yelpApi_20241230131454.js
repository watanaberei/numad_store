// src/server/data/yelp/api.js
import yelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

console.log("Initializing Yelp API");

export const yelpApi = {
  async searchBusinesses(params) {
    try {
      console.log("Starting business search with params:", params);
      const data = await yelpClient.searchBusinesses(params);
      console.log("Search response received, businesses found:", data?.businesses?.length);
      return data;
    } catch (error) {
      console.error("Error in searchBusinesses:", error);
      throw error;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      console.log("Fetching business details for:", businessId);
      const data = await yelpClient.getBusinessDetails(businessId);
      console.log("Business details received");
      return data;
    } catch (error) {
      console.error("Error getting business details:", error);
      throw error;
    }
  },

  async getBusinessReviews(businessId) {
    try {
      console.log("Getting reviews for:", businessId);
      const reviews = await yelpClient.getBusinessReviews(businessId);
      return reviews;
    } catch (error) {
      console.error("Error in getBusinessReviews:", error);
      return null;
    }
  }
};
