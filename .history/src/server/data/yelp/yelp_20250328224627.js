import { yelpApi } from "./yelpApi.js";
import { StoreModel } from "../mongodb/mongodb.js";

export class Yelp {
  static async getStoreData(store) {
    try {
      // console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // If we have a Yelp ID, use it directly
      if (store.yelpId) {
        console.log("[Yelp.getStoreData] Using existing Yelp ID:", store.yelpId);
        const businessData = await yelpApi.getBusinessDetails(store.yelpId);
        // console.log("[Yelp.getStoreData] Business details:", businessData);
        return businessData;
      }
      
      // Otherwise, search for the business
      const storeName = store.storeName;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLongitude = store.storeLongitude;
      const storeLatitude = store.storeLatitude;
       
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses(storeName, storeLocation, storeLongitude, storeLatitude);
      // console.log("[Yelp.getStoreData] Search results:", yelpData);

      if (!yelpData?.businesses?.[0]?.id) {
        throw new Error('No matching business found');
      }

      // Get detailed business data using ID from search results
      const businessId = yelpData.businesses[0].id;
      const businessData = await yelpApi.getBusinessDetails(businessId);
      // console.log("[Yelp.getStoreData] Business details:", businessData);

      // Save the Yelp ID to the store
      if (store.slug) {
        try {
          await StoreModel.findOneAndUpdate(
            { slug: store.slug },
            { 
              $set: { 
                yelpId: businessId,
                lastYelpSync: new Date()
              }
            }
          );
          console.log("[Yelp.getStoreData] Saved Yelp ID to store:", businessId);
        } catch (error) {
          console.error("[Yelp.getStoreData] Error saving Yelp ID:", error);
        }
      }

      return businessData;

    } catch (error) {
      console.error("[Yelp.getStoreData] Error:", error);
      return null;
    }
  }

  static async getNearbyStoreData(store) {
    try {
      // console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // Extract store details
      const storeName = store.storeName;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLongitude = store.storeLongitude;
      const storeLatitude = store.storeLatitude;
       
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses({
        term: storeName,
        location: storeLocation,
        longitude: storeLongitude,
        latitude: storeLatitude,
        limit: 16
      });
      // console.log("[Yelp.getStoreData] Search results:", yelpData);

      if (!yelpData?.businesses?.[0]?.id) {
        throw new Error('No matching business found');
      }
      const limit = 16;

      // Get detailed business data using ID from search results
      const businessId = yelpData.businesses[0].id;
      const rawBusinessData = await yelpApi.getBusinessDetails(businessId);
      // console.log("[Yelp.getStoreData] Business details:", rawBusinessData);

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
      // console.log("[Yelp.getStoreData] Starting with store:", store);
      
      // Extract store details
      const storeAlias = store.storeAlias;
      const storeCity = store.storeCity;
      const storeState = store.storeState;
      const storeLongitude = store.storeLongitude;
      const storeLatitude = store.storeLatitude;
       
      const storeLocation = storeCity + ', ' + storeState;
      
      // Search for business
      const yelpData = await yelpApi.searchBusinesses(storeName, storeLocation, storeLongitude, storeLatitude);
      // console.log("[Yelp.getStoreData] Search results:", yelpData);

      if (!yelpData?.businesses?.[0]?.id) {
        throw new Error('No matching business found');
      }

      // Get detailed business data using ID from search results
      const businessId = yelpData.businesses[0].id;
      const businessData = await yelpApi.getBusinessDetails(businessId);
      // console.log("[Yelp.getStoreData] Business details:", businessData);

      return businessData;

    } catch (error) {
      console.error("[Yelp.getStoreData] Error:", error);
      return null;
    }
  }

  // Add new methods for each Yelp API endpoint
  // static async getFusionData(store) {
  static async getFusionData(storeParams) {
    try {
      // console.log("[Yelp.getFusionData] Starting search for:", store);
      // const businessData = await yelpApi.searchBusinesses(store);
      console.log("[Yelp.getFusionData] Starting search for:", storeParams);
      
      // Fix parameter formatting
      const searchParams = {
        term: storeParams.storeName,
        location: `${storeParams.storeCity}, ${storeParams.storeState}`,
        longitude: storeParams.storeLongitude,
        latitude: storeParams.storeLatitude
      };

      const businessData = await yelpApi.searchBusinesses(searchParams);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getFusionData] Error:", error);
      return null;
    }
  }

  static async getPhoneSearchData(store) {
    try {
      console.log("[Yelp.getPhoneSearchData] Starting phone search for:", store);
      const businessData = await yelpApi.searchByPhone(store);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getPhoneSearchData] Error:", error);
      return null;
    }
  }

  static async getBusinessMatchData(store) {
    try {
      console.log("[Yelp.getBusinessMatchData] Starting match for:", store);
      const businessData = await yelpApi.matchBusiness(store);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getBusinessMatchData] Error:", error);
      return null;
    }
  }

  static async getBusinessDetailsData(store) {
    try {
      console.log("[Yelp.getBusinessDetailsData] Getting details for:", store);
      const businessData = await yelpApi.getBusinessDetails(store);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getBusinessDetailsData] Error:", error);
      return null;
    }
  }

  static async getFoodDeliverySearchData(store) {
    try {
      console.log("[Yelp.getFoodDeliverySearchData] Starting delivery search for:", store);
      const businessData = await yelpApi.searchDelivery(store);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getFoodDeliverySearchData] Error:", error);
      return null;
    }
  }

  static async getServiceOfferingsData(store) {
    try {
      console.log("[Yelp.getServiceOfferingsData] Getting services for:", store);
      const businessData = await yelpApi.getServiceOfferings(store);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getServiceOfferingsData] Error:", error);
      return null;
    }
  }

  static async getBusinessInsightsData(store) {
    try {
      console.log("[Yelp.getBusinessInsightsData] Getting insights for:", store);
      const businessData = await yelpApi.getBusinessInsights(store);
      return businessData;
    } catch (error) {
      console.error("[Yelp.getBusinessInsightsData] Error:", error);
      return null;
    }
  }

  // Add new search method
  static async getSearchData(storeParams) {
    try {
      console.log("[Yelp.getSearchData] Starting search with params:", storeParams);
      
      // Format search params properly
      const searchParams = {
        term: storeParams.storeName,
        location: `${storeParams.storeCity}, ${storeParams.storeState}`,
        longitude: storeParams.storeLongitude,
        latitude: storeParams.storeLatitude
      };

      const searchData = await yelpApi.searchBusinesses(searchParams);
      return searchData;
    } catch (error) {
      console.error("[Yelp.getSearchData] Error:", error);
      return null;
    }
  }
}
