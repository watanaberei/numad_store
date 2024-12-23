// src/server/data/yelp/api.js
import yelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

console.log("Initializing Yelp API");

export const yelpApi = {
  async searchBusinesses(params) {
    try {
      const data = await yelpClient.searchBusinesses(params);
      console.log("Search response:", data);
      return data;
    } catch (error) {
      console.error("Search error:", error);
      return null;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      const data = await yelpClient.getBusinessDetails(businessId);
      console.log("+++++Business details:", data);
      return data;
    } catch (error) {
      console.error("Details error:", error);
      return null;
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
  },

  async getStoreData(businessId) {
    try {
      console.log(`Fetching store data for business ID: ${businessId}`);
      const data = await this.getBusinessDetails(businessId);
      const transformedData = this.transformBusinessData(data);
      console.log("Transformed store data:", transformedData); // Debugging
      return transformedData;
    } catch (error) {
      console.error("Error getting store data:", error);
      return null;
    }
  }, 
  
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
          currentTime <= slot.end,
      })),
    };
  },

  transformBusinessData(yelpData) {
    console.log("Transforming business data:", yelpData); // Debugging
    if (!yelpData) return null;

    return {
      name: yelpData.name,
      hours: [
        {
          is_open_now: yelpData.hours?.[0]?.is_open_now || false,
          open: yelpData.hours?.[0]?.open || [],
        },
      ],
      location: {
        address: yelpData.location?.address1,
        city: yelpData.location?.city,
        state: yelpData.location?.state,
        area: yelpData.location?.neighborhood || "",
      },
    };
  },

  transformLocationAttributes(yelpData) {
    console.log("Transforming location attributes:", yelpData); // Debugging
    if (!yelpData) return null;
    return {
      geotags: [
        {
          title: "Location",
          attributes: [
            {
              label: "Rating",
              score: yelpData.rating || 0,
              count: yelpData.review_count || 0,
            },
            {
              label: "Price",
              score: yelpData.price?.length || 1,
              count: yelpData.review_count || 0,
            },
          ],
        },
      ],
    };
  },
  
  transformGalleryData(yelpData) {
    console.log("Transforming gallery data:", yelpData); // Debugging
    if (!yelpData) return null;
    return {
      hero: {
        url: "/gallery",
        gallery: yelpData.photos || [],
      },
    };
  },

  getBusinessStatus(yelpData) {
    console.log("Checking business status:", yelpData); // Debugging
    if (!yelpData?.hours?.[0]) return "Status unavailable";
    return yelpData.hours[0].is_open_now ? "Open" : "Closed";
  },
};


  
  