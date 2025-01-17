import { yelpApi } from "./yelpApi.js";

export class Yelp {
  static async getStoreData(store) {
    try {
      console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // Extract store details
      const storeName = store.storeName;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses(storeName, storeLocation);
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
