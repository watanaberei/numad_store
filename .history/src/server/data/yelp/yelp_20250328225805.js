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

  static async getFoodData(storeParams) {
    try {
      console.log("[Yelp.getFoodData] Starting with params:", storeParams);
      
      // Format params for API call
      const searchParams = {
        storeName: storeParams.storeName,
        storeCity: storeParams.storeCity,
        storeState: storeParams.storeState,
        storeLongitude: storeParams.storeLongitude,
        storeLatitude: storeParams.storeLatitude,
        storeId: storeParams.storeId
      };

      const foodData = await yelpApi.getFoodData(searchParams);
      console.log("[Yelp.getFoodData] Food data received:", foodData);
      return foodData;

    } catch (error) {
      console.error("[Yelp.getFoodData] Error:", error);
      return null;
    }
  }

  static async getFusionData(storeParams) {
    try {
      console.log("[Yelp.getFusionData] Starting search with params:", storeParams);
      
      const searchParams = {
        term: storeParams.storeName,
        location: `${storeParams.storeCity}, ${storeParams.storeState}`,
        longitude: storeParams.storeLongitude,
        latitude: storeParams.storeLatitude
      };

      const fusionData = await yelpApi.searchBusinesses(searchParams);
      console.log("[Yelp.getFusionData] Fusion data received:", fusionData);
      return fusionData;
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

  static async getBusinessMatchData(storeParams) {
    try {
      console.log("[Yelp.getBusinessMatchData] Starting with params:", storeParams);
      
      const searchParams = {
        storeName: storeParams.storeName,
        storeAddress: storeParams.storeAddress,
        storeCity: storeParams.storeCity,
        storeState: storeParams.storeState
      };

      const matchData = await yelpApi.getBusinessMatchData(searchParams);
      console.log("[Yelp.getBusinessMatchData] Match data received:", matchData);
      return matchData;
    } catch (error) {
      console.error("[Yelp.getBusinessMatchData] Error:", error);
      return null;
    }
  }

  static async getBusinessDetailsData(storeParams) {
    try {
      console.log("[Yelp.getBusinessDetailsData] Starting with params:", storeParams);
      
      const searchParams = {
        storeId: storeParams.storeId
      };

      const detailsData = await yelpApi.getBusinessDetailsData(searchParams);
      console.log("[Yelp.getBusinessDetailsData] Details received:", detailsData);
      return detailsData;
    } catch (error) {
      console.error("[Yelp.getBusinessDetailsData] Error:", error);
      return null;
    }
  }

  static async getFoodDeliverySearchData(storeParams) {
    try {
      console.log("[Yelp.getFoodDeliverySearchData] Starting with params:", storeParams);
      
      const searchParams = {
        storeName: storeParams.storeName,
        storeCity: storeParams.storeCity,
        storeState: storeParams.storeState,
        storeLongitude: storeParams.storeLongitude,
        storeLatitude: storeParams.storeLatitude
      };

      const deliveryData = await yelpApi.getFoodDeliverySearchData(searchParams);
      console.log("[Yelp.getFoodDeliverySearchData] Delivery data received:", deliveryData);
      return deliveryData;
    } catch (error) {
      console.error("[Yelp.getFoodDeliverySearchData] Error:", error);
      return null;
    }
  }

  static async getServiceOfferingsData(storeParams) {
    try {
      console.log("[Yelp.getServiceOfferingsData] Starting with params:", storeParams);
      
      const searchParams = {
        storeId: storeParams.storeId
      };

      const servicesData = await yelpApi.getServiceOfferingsData(searchParams);
      console.log("[Yelp.getServiceOfferingsData] Services received:", servicesData);
      return servicesData;
    } catch (error) {
      console.error("[Yelp.getServiceOfferingsData] Error:", error);
      return null;
    }
  }

  static async getBusinessInsightsData(storeParams) {
    try {
      console.log("[Yelp.getBusinessInsightsData] Starting with params:", storeParams);
      
      const searchParams = {
        storeId: storeParams.storeId
      };

      const insightsData = await yelpApi.getBusinessInsightsData(searchParams);
      console.log("[Yelp.getBusinessInsightsData] Insights received:", insightsData);
      return insightsData;
    } catch (error) {
      console.error("[Yelp.getBusinessInsightsData] Error:", error);
      return null;
    }
  }

  static async getSearchData(storeParams) {
    try {
      console.log("[Yelp.getSearchData] Starting with params:", storeParams);
      
      const searchParams = {
        term: storeParams.storeName,
        location: `${storeParams.storeCity}, ${storeParams.storeState}`,
        longitude: storeParams.storeLongitude,
        latitude: storeParams.storeLatitude
      };

      const searchData = await yelpApi.searchBusinesses(
        searchParams.term,
        searchParams.location,
        searchParams.longitude,
        searchParams.latitude
      );
      console.log("[Yelp.getSearchData] Search data received:", searchData);
      return searchData;
    } catch (error) {
      console.error("[Yelp.getSearchData] Error:", error);
      return null;
    }
  }
}
