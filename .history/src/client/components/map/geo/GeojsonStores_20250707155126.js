//src/components/GeojsonStores.js
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../../../API/apiContentful.js";
import DataPost from "../../../data/DataPost.js";
import ContentfulData from "../../../../server/data/contentful/contentful.js";
import * as Geolocate from "./Geolocate.js";
import * as GeolocationRange from "./GeolocationRange.js"
// import * as data from "../../../../server/data/data.js";
import { storeApi, transformStoreToGeoJSON } from '../../../api/dataApi.js';

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
    // 2. Initialize StoreData and get store data
    const storeData =  await storeApi.getAll(options);
    // console.log("%03:[StoreScreen.render] StoreData initialized:", storeData);

    // 3. Get store data using slug
    const store = await storeData.store()

    const Data = await contenfulData.getData();
    console.log("contenfulData in geojsonStores.js", Data);  

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




