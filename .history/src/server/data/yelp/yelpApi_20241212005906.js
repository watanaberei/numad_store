//'./src/server/data/yelp/yelpApi.js'

import YelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";
// src/server/data/yelp/yelpApi.js

console.log("Initializing Yelp API");

export const YelpApi = {
  async searchBusinesses(term, location) {
    try {
      const data = await YelpClient.searchBusinesses(term, location);
      return data;
    } catch (error) {
      console.error("Error searching businesses:", error);
      throw error;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      const data = await YelpClient.getBusinessDetails(businessId);
      return data;
    } catch (error) {
      console.error("Error fetching business details:", error);
      throw error;
    }
  },

  async getBusinessReviews(businessId) {
    try {
      const reviews = await YelpClient.getBusinessReviews(businessId);
      return reviews;
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      throw error;
    }
  },

  async getStoreData(businessId) {
    try {
      const data = await YelpClient.getBusinessDetails(businessId);
      return YelpClient.transformBusinessData(data);
    } catch (error) {
      console.error("Error getting store data:", error);
      throw error;
    }
  },


  async getStoreData(businessId) {
    try {
      const data = await YelpClient.getBusinessDetails(businessId);
      return YelpClient.transformBusinessData(businessId);
    } catch (error) {
      console.error("Error getting store data:", error);
      return null;
    }
  },

  transformYelpHours(YelpData) {
  return YelpClient.transformYelpHours(YelpData);
  },

  transformBusinessData(YelpData) {
    return YelpClient.transformBusinessData(YelpData);
  },

  transformLocationAttributes(YelpData) {
    return YelpClient.transformLocationAttributes(YelpData);
  },

  transformGalleryData(YelpData) {
    return YelpClient.transformGalleryData(YelpData);
  },
  
  getBusinessStatus(YelpData) {
    return YelpClient.getBusinessStatus(YelpData);
  }

  // transformGalleryData(YelpData) {
  //   if (!YelpData) return null;
  //   return {
  //     hero: {
  //       url: "/gallery",
  //       gallery: YelpData.photos || []
  //     }
  //   };
  // },
};