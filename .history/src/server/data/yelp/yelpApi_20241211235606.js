
import YelpClient from "./yelpClient.js";
import { getConfig, log } from "../../config/config.js";

console.log("Initializing Yelp API");

export const YelpApi = {
  async searchBusinesses(params) {
    try {
      const data = await YelpClient.searchBusinesses(params);
      console.log("Search response:", data);
      return data;
    } catch (error) {
      console.error("Search error:", error);
      return null;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      const data = await YelpClient.getBusinessDetails(businessId);
      console.log("Business details:", data);
      return data;
    } catch (error) {
      console.error("Details error:", error);
      return null;
    }
  },

  async getBusinessReviews(businessId) {
    try {
      console.log("Getting reviews for:", businessId);
      const reviews = await YelpClient.getBusinessReviews(businessId);
      return reviews;
    } catch (error) {
      console.error("Error in getBusinessReviews:", error);
      return null;
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
    console.log("Processing Yelp hours data:", YelpData?.hours?.[0]?.open);

    if (!YelpData?.hours?.[0]?.open) {
      console.warn("No hours data available");
      return null;
    }

    const hoursData = YelpData.hours[0].open;
    const isCurrentlyOpen = YelpData.hours[0].is_open_now;

    // Get current time for comparison
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}${currentMinute}`;
    const currentDay = now.getDay();

    return {
      storeName: YelpData.name,
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