import { yelpApi } from "./yelpApi.js";

export class Yelp {
  static async getStoreData(store) {
    try {
      console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // Extract store details
      const storeName = store.storeName;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLongitude = store.storeLongitude;
      const storeLatitude = store.storeLatitude;
       
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses(storeName, storeLocation, storeLongitude, storeLatitude);
      console.log("[Yelp.getStoreData] Search results:", yelpData);

      if (!yelpData?.businesses?.[0]?.id) {
        throw new Error('No matching business found');
      }

      // Get detailed business data using ID from search results
      const businessId = yelpData.businesses[0].id;
      const businessData = await yelpApi.getBusinessDetails(businessId);
      console.log("[Yelp.getStoreData] Business details:", businessData);

      return businessData;

    } catch (error) {
      console.error("[Yelp.getStoreData] Error:", error);
      return null;
    }
  }

  static async getNearbyStoreData(store) {
    try {
      console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // Extract store details
      const storeName = store.storeName;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLongitude = store.storeLongitude;
      const storeLatitude = store.storeLatitude;
       
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses({
        location: storeLocation,
        longitude: storeLongitude,
        latitude: storeLatitude,
        limit: 16
      });
      console.log("[Yelp.getStoreData] Search results:", yelpData);

      if (!yelpData?.businesses?.[0]?.id) {
        throw new Error('No matching business found');
      }
      const limit = 16;

      // Get detailed business data using ID from search results
      const businessId = yelpData.businesses[0].id;
      const rawBusinessData = await yelpApi.getBusinessDetails(businessId);
      console.log("[Yelp.getStoreData] Business details:", rawBusinessData);

      // Extract required fields
      const businessData = {
        name: rawBusinessData.name,
        photo: rawBusinessData.photos ? rawBusinessData.photos[0] : null,
        image_url: rawBusinessData.image_url,
        price: rawBusinessData.price,
        rating: rawBusinessData.rating,
        review_count: rawBusinessData.review_count,
        id: rawBusinessData.id,
        categories: rawBusinessData.categories
      };

      return businessData;

    } catch (error) {
      console.error("[Yelp.getNearbyStoreData] Error:", error);
      return null;
    }
  }

  static async getFoodData(store) {
    try {
      console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // Extract store details
      const storeName = store.storeName;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLongitude = store.storeLongitude;
      const storeLatitude = store.storeLatitude;
       
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses(storeName, storeLocation, storeLongitude, storeLatitude);
      console.log("[Yelp.getStoreData] Search results:", yelpData);

      if (!yelpData?.businesses?.[0]?.id) {
        throw new Error('No matching business found');
      }

      // Get detailed business data using ID from search results
      const businessId = yelpData.businesses[0].id;
      const businessData = await yelpApi.getBusinessDetails(businessId);
      console.log("[Yelp.getStoreData] Business details:", businessData);

      return businessData;

    } catch (error) {
      console.error("[Yelp.getStoreData] Error:", error);
      return null;
    }
  }
}
