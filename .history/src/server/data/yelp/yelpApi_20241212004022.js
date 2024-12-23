//'./src/server/data/yelp/yelpApi.js'

import YelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

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
    if (!YelpData) return null;

    return {
      name: YelpData.name,
      hours: [
        {
          is_open_now: YelpData.hours?.[0]?.is_open_now || false,
          open: YelpData.hours?.[0]?.open || []
        }
      ],
      location: {
        address: YelpData.location?.address1,
        city: YelpData.location?.city,
        state: YelpData.location?.state,
        area: YelpData.location?.neighborhood || ""
      }
    };
  },

  transformLocationAttributes(YelpData) {
    if (!YelpData) return null;
    return {
      geotags: [
        {
          title: "Location",
          attributes: [
            {
              label: "Rating",
              score: YelpData.rating || 0,
              count: YelpData.review_count || 0
            },
            {
              label: "Price",
              score: YelpData.price?.length || 1,
              count: YelpData.review_count || 0
            }
          ]
        }
      ]
    };
  },

  transformGalleryData(YelpData) {
    if (!YelpData) return null;
    return {
      hero: {
        url: "/gallery",
        gallery: YelpData.photos || []
      }
    };
  },

  getBusinessStatus(YelpData) {
    if (!YelpData?.hours?.[0]) return "Status unavailable";
    return YelpData.hours[0].is_open_now ? "Open" : "Closed";
  }
};