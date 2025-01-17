// Import required modules
import { heroData, attributesData, footerData, location } from '../../data.js';

// Template for store data structure
export const storeData = {
  // Basic store information
  slug: "", // URL-friendly store identifier
  headline: {
    text: "" // Store name/headline
  },
  location: {
    address: "", // Full address
    city: "", // City name
    state: "", // State abbreviation
    geolocation: {
      lat: 0,
      lng: 0
    }
  },

  // Hero section data
  hero: [{
    rating: heroData.rating,
    costEstimate: heroData.costEstimate,
    storeType: heroData.storeType,
    distance: heroData.distance,
    city: heroData.city,
    state: heroData.state,
    storeName: heroData.storeName,
    distanceMiles: heroData.distanceMiles,
    status: heroData.status,
    galleryImages: [...heroData.galleryImages]
  }],

  // Attributes and tags
  attributes: {
    bestfor: [...attributesData.bestfor],
    working: [...attributesData.working],
    environment: [...attributesData.environment],
    facility: [...attributesData.facility]
  },

  // Location specific data
  locationAttributes: {
    ...location.locations[0].attrtags.reduce((acc, section) => ({
      ...acc,
      [section.title.toLowerCase()]: section.attributes
    }), {})
  },

  // Footer metrics for each section
  metrics: {
    overview: { ...footerData.overview },
    experience: { ...footerData.experience },
    service: { ...footerData.service },
    business: { ...footerData.business },
    location: { ...footerData.location }
  },

  // Yelp data integration structure
  yelpData: {
    name: "",
    rating: 0,
    review_count: 0,
    price: "",
    phone: "",
    photos: [],
    hours: [{
      is_open_now: false,
      open: [
        {
          day: 0,
          start: "0000",
          end: "0000",
          isCurrent: false,
          isWithinHours: false
        }
      ]
    }],
    // Transformed hours data structure
    transformedHours: {
      storeName: "",
      isOpen: false,
      currentTime: "",
      schedule: [
        {
          day: 0,
          start: "0000",
          end: "0000",
          isCurrent: false,
          isWithinHours: false
        }
      ]
    }
  },

  // Additional metadata
  metadata: {
    lastUpdated: new Date().toISOString(),
    version: "1.0",
    source: ["contentful", "yelp", "user-generated"]
  }
};

// Helper function to merge different data sources into the template
export const mergeStoreData = (contentfulData, yelpData, userGeneratedData) => {
  const merged = { ...storeData };
  
  // Merge logic here
  if (contentfulData) {
    Object.assign(merged, contentfulData);
  }
  
  if (yelpData) {
    merged.yelpData = {
      ...merged.yelpData,
      ...yelpData,
      transformedHours: transformYelpHours(yelpData)
    };
  }
  
  if (userGeneratedData) {
    // Merge user generated data
    merged.metrics = {
      ...merged.metrics,
      ...userGeneratedData.metrics
    };
  }
  
  return merged;
};

// Helper function to transform Yelp hours (copied from StoreData class)
const transformYelpHours = (yelpData) => {
  if (!yelpData?.hours?.[0]?.open) {
    console.warn("[storeData.transformYelpHours] No hours data available");
    return null;
  }

  const hoursData = yelpData.hours[0].open;
  const isCurrentlyOpen = yelpData.hours[0].is_open_now;

  // Get current time in military format
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
        currentTime <= slot.end
    }))
  };
};
