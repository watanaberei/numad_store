//src/components/GeojsonStores.js
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../../../API/apiContentful.js";
import DataPost from "../../../data/DataPost.js";
import ContentfulData from "../../../../server/data/contentful/contentful.js";
import * as Geolocate from "./Geolocate.js";
import * as GeolocationRange from "./GeolocationRange.js"
// import * as data from "../../../../server/data/data.js";
import { storeApi, transformStoreToGeoJSON } from '../../../api/apiData.js';

console.log('[GeojsonStores] Loading client-safe GeoJSON stores module');

// Cache for store data
let storesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


let store = "";
// let contenfulData = new DataPost();
let contenfulData = new ContentfulData();


export async function geojsonStore() {
  try {
    console.log('[GeojsonStores] Getting stores for GeoJSON');
    
    // Check cache first
    if (storesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      console.log('[GeojsonStores] Using cached store data');
      return storesCache;
    }
    
    // Fetch stores from API
    const stores = await storeApi.getAll(options);
    // console.log(`[GeojsonStores] Fetched ${stores.length} stores from API`);
    
    // 2. Initialize StoreData and get store data
    const storeData =  await storeApi.getAll(options);
    // console.log("%03:[StoreScreen.render] StoreData initialized:", storeData);

    // 3. Get store data using slug
    const store =  await storeApi.getAll(options);

    // const Data = await contenfulData.getData();
    const Data =  await storeApi.getAll(options);
    console.log("contenfulData in geojsonStores.js", Data);  

    console.log(`[GeojsonStores] Fetched ${stores.length} stores from API`);


    // Additional logging for store details, URLs, and product details as per blogData.log
    if (Data && Data.stores) {
        Data.stores.forEach(store => {
            console.log("Console Store Name: ", store.name);
            console.log("Console Store Location: ", store.location);
            console.log("Console Store Description: ", store.description);
        });
    }

    if (Data && Data.urls) {
        Data.urls.forEach(url => {
            console.log("Console URL: ", url);
        });
    }

    if (Data && Data.products) {
        Data.products.forEach(product => {
            console.log("Console Product Name: ", product.name);
            console.log("Console Product Category: ", product.category);
        });
    }


    
    
    // Log the raw data you're receiving from the API
    // console.log("Raw Data: ", JSON.stringify(Data, null, 2));

    const features = Data.map((store) => {
      // Extract properties from the store object
      // console.log("nearbyStoresCollection", store.nearbyStore.nearbyHeadline);
      const {
        title,
        headline: { subtext, text, eyebrow},
        publishedAt,
        slug, 
        storeAttributes,
        popularTimes,
        location: { region, address, geolocation: { lat, lon }, type }, // Change here
        category: { categoryType, genre },
        summary: { best, noise, parking, environment},
        series: {seriesName},
        hours, 
        neustar,
  
        // ratings,
        nearbyStore,
        // nearbyStoresCollection : nearbyStores,
        // nearbyStoresCollection: { nearbyHeadline: nearbyHeadline, hours: nearbyHours... },
        variant,
        ratings,
        media: { 
          thumbnail,
          logo,
          gallery,
          area,
          service  
        },
        snippet: { 
          text: snippet 
        },
        tag,
      } = store;
      const storeRange = Geolocate.GeolocateToStore(store);
      console.log("%%%%%%%%%%%%%%%%storeDistance%%%%%%%%%%%%%%%%", storeRange);


      const rangeHTML = storeRange ? `
      <div class="store-range">
        <span class="text01">${storeRange} miles away</span>
      </div>
      ` : '';

      // Log the store object and the extracted properties
      // console.log("Store object: ", JSON.stringify(store, null, 2));
      
    return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [lon, lat], // And here
        },
        "properties": {
          publishedAt,
          title,
          variant,
          nearbyStore,
          // nearbyHeadline,
          // nearbyHours,
          // nearbyLogo,
          // nearbyLocation,
          location,
          text,
          subtext,
          eyebrow,
          slug,
          address,
          seriesName,
          region,
          lat, 
          lon, // And here
          type,
          hours,
          popularTimes,
          storeAttributes,
          best, 
          noise,
          parking,
          neustar,
          environment,
          categoryType,
          storeRange,
          ratings,
          genre,
          thumbnail,
          logo,
          gallery,
          area,
          service,
          snippet,
          tag,
        },
      };
    });

    // Log the formatted features as raw JSON
    // console.log("Formatted features: ", JSON.stringify(features, null, 2));
    return { features };
    
  } catch (error) {
    console.error("Error in geojsonStore: ", error);
  }
}



// Get stores near a specific location
export async function getStoresNearLocation(lat, lng, radius = 5) {
  try {
    console.log(`[GeojsonStores] Getting stores near ${lat}, ${lng}`);
    
    const stores = await storeApi.getNearby(lat, lng, radius);
    console.log(`[GeojsonStores] Found ${stores.length} stores nearby`);
    
    return transformStoreToGeoJSON(stores);
  } catch (error) {
    console.error('[GeojsonStores] Error getting nearby stores:', error);
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
}


// Search stores
export async function searchStores(query, options = {}) {
  try {
    console.log(`[GeojsonStores] Searching stores: ${query}`);
    
    const stores = await storeApi.search(query, options);
    console.log(`[GeojsonStores] Found ${stores.length} stores`);
    
    return transformStoreToGeoJSON(stores);
  } catch (error) {
    console.error('[GeojsonStores] Error searching stores:', error);
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
}

// Get a single store by slug
export async function getStoreBySlug(slug) {
  try {
    console.log(`[GeojsonStores] Getting store by slug: ${slug}`);
    
    const store = await storeApi.getBySlug(slug);
    
    if (!store) {
      console.log(`[GeojsonStores] Store not found: ${slug}`);
      return null;
    }
    
    const geojson = transformStoreToGeoJSON([store]);
    return geojson.features[0]; // Return single feature
  } catch (error) {
    console.error('[GeojsonStores] Error getting store:', error);
    return null;
  }
}

// Clear cache
export function clearStoresCache() {
  console.log('[GeojsonStores] Clearing stores cache');
  storesCache = null;
  cacheTimestamp = null;
}

// Get stores from cache without fetching
export function getCachedStores() {
  if (storesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return storesCache;
  }
  return null;
}

// Filter stores by type
export function filterStoresByType(geojson, storeTypes) {
  if (!geojson || !geojson.features) {
    return geojson;
  }
  
  const filteredFeatures = geojson.features.filter(feature => {
    const types = feature.properties.storeType || [];
    return storeTypes.some(type => types.includes(type));
  });
  
  return {
    type: 'FeatureCollection',
    features: filteredFeatures
  };
}

// Sort stores by distance
export function sortStoresByDistance(geojson, centerLat, centerLng) {
  if (!geojson || !geojson.features) {
    return geojson;
  }
  
  const featuresWithDistance = geojson.features.map(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    const distance = calculateDistance(centerLat, centerLng, lat, lng);
    
    return {
      ...feature,
      properties: {
        ...feature.properties,
        calculatedDistance: distance
      }
    };
  });
  
  featuresWithDistance.sort((a, b) => 
    a.properties.calculatedDistance - b.properties.calculatedDistance
  );
  
  return {
    type: 'FeatureCollection',
    features: featuresWithDistance
  };
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}

// Default export for backward compatibility
export default geojsonStore;

///////////////////////// END FIXED GEOJSON STORES MODULE /////////////////////////



