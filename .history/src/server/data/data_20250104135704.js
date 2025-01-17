// src/server/data/data.js
import { Yelp } from "./yelp/yelp.js";
import * as contentfulApi from "./contentful/contentfulApi.js";
import ContentfulData from "./contentful/contentful.js";
import DataPost from "../../client/data/DataPost.js";
import * as address from "../../client/components/map/geo/address.js";
import { io } from "socket.io-client";

// Debug logging helper
const debugLog = (location, message, data) => {
  console.log(`[DEBUG][${location}]`, message, data ? data : '');
};

// Initialize global objects
let store = null;

export class StoreData {
  constructor() {
    this.activeTags = [];
    this.yelp = Yelp;
    this.socket = io("http://localhost:4000");
  }

  async getStoreBySlug(slug) {
    try {
      debugLog('getStoreBySlug', 'Starting fetch for slug:', slug);

      // 1. Get store data from DataPost
      const dataBlog = new DataPost();
      const storeData = await dataBlog.getData();
      debugLog('getStoreBySlug', 'All stores:', storeData?.length);

      // 2. Filter for valid stores and find matching store
      const validStores = storeData.filter((store) => store.slug);
      debugLog('getStoreBySlug', 'Valid stores:', validStores?.length);

      const matchedStore = validStores.find((s) => s.slug === slug);
      debugLog('getStoreBySlug', 'Found matching store:', matchedStore);

      if (!matchedStore) {
        console.error('getStoreBySlug', 'Store not found for slug:', slug);
        return null;
      }

      const storeParams = {
        storeName: matchedStore.headline?.text,
        storeAddress: matchedStore.location?.address,
        storeCity: address.city(matchedStore.location?.address),
        storeState: address.state(matchedStore.location?.address),
        storeLongitude: matchedStore.location?.geolocation?.lon,
        storeLatitude: matchedStore.location?.geolocation?.lat
      };
      debugLog('getStoreBySlug', 'Store params:', storeParams);

      // 3. Get Yelp data using store details
      const yelpStore = await this.yelp.getStoreData(storeParams);
      debugLog('getStoreBySlug', 'Yelp data:', yelpStore);

      // 4. Combine the data and make store data globally available
      const combinedStore = {
        ...matchedStore,
        yelpData: yelpStore
          ? {
              ...yelpStore,
              hours: this.transformYelpHours(yelpStore)
            }
          : null
      };

      // Make store data globally available
      store = combinedStore;
      debugLog('getStoreBySlug', 'Setting global store data:', store);

      // Update heroData with the new store data
      this.updateHeroData();

      debugLog('getStoreBySlug', 'Combined store data:', combinedStore);
      return combinedStore;
    } catch (error) {
      console.error('getStoreBySlug', 'Error:', error);
      return null;
    }
  }

  // Helper function to transform Yelp hours data
  transformYelpHours(yelpData) {
    if (!yelpData?.hours?.[0]?.open) {
      console.warn("[StoreData.transformYelpHours] No hours data available");
      return null;
    }

    const hoursData = YelpData.hours[0].open;
    const isCurrentlyOpen = YelpData.hours[0].is_open_now;

    // Get current time in military format
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
  }

  // Helper function to update heroData with Yelp data
  updateHeroData() {
    debugLog('updateHeroData', 'Starting update with store:', store);

    if (store?.yelpData) {
      const yelpData = store.yelpData;
      debugLog('updateHeroData', 'Using Yelp data:', yelpData);

      // Update each field and log the change
      const updateField = (field, newValue, oldValue) => {
        heroData[field] = newValue || oldValue;
        debugLog('updateHeroData', `Updated ${field}:`, heroData[field]);
      };

      updateField('rating', yelpData.rating?.toString(), heroData.rating);
      updateField('review_count', yelpData.review_count?.toString(), heroData.review_count);
      updateField('price', yelpData.price, heroData.price);
      updateField('costEstimate', yelpData.price?.length?.toString(), heroData.costEstimate);
      updateField('storeType', yelpData.categories?.[0]?.title, heroData.storeType);
      updateField('distance', `${(yelpData.distance / 1609.34).toFixed(1)}mi`, heroData.distance);
      updateField('city', yelpData.location?.city, heroData.city);
      updateField('state', yelpData.location?.state, heroData.state);
      updateField('storeName', yelpData.name, heroData.storeName);
      updateField('status', yelpData.hours?.[0]?.is_open_now ? "Open" : "Closed", heroData.status);

      if (yelpData.photos?.length) {
        const newGalleryImages = [
          yelpData.image_url,
          ...yelpData.photos,
          ...heroData.galleryImages.slice(-1)
        ].filter(Boolean);
        updateField('galleryImages', newGalleryImages, heroData.galleryImages);
      }
    } else {
      debugLog('updateHeroData', 'No store data available, using default values');
    }

    debugLog('updateHeroData', 'Final heroData:', heroData);
  }
}

// Export heroData with store-based values
export const heroData = {
  // Fields used by storeDetail component
  rating: store?.yelpData?.rating || "0.00",
  review_count: store?.yelpData?.review_count || "0",
  price: store?.yelpData?.price || "$$",
  costEstimate: store?.yelpData?.price?.length?.toString() || "3-6",
  storeType: store?.yelpData?.categories?.[0]?.title || "Coffee Shop",
  distance: store?.yelpData?.distance 
    ? `${(store.yelpData.distance / 1609.34).toFixed(1)}mi` 
    : "1.5mi",
  city: store?.yelpData?.location?.city || "Cerritos",
  state: store?.yelpData?.location?.state || "CA",
  
  // Fields used by storeHeadline component
  storeName: store?.yelpData?.name || "Smoking Tiger Bread Factory",
  distanceMiles: store?.yelpData?.distance 
    ? (store.yelpData.distance / 1609.34).toFixed(1) 
    : "1.1",
  status: store?.yelpData?.hours?.[0]?.is_open_now ? "Open" : "Closed",
  
  // Fields used by heroGallery component
  galleryImages: [
    store?.yelpData?.image_url,
    ...(store?.yelpData?.photos || []),
    "https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png"
  ].filter(Boolean)
};

// Export necessary functions and data
export { store };
