//src/components/GeojsonStores.js
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../../../api.js";
import DataPost from "../../../data/DataPost.js";
import ContentfulData from "../../../../server/data/contentful/contentful.js";
import * as Geolocate from "./Geolocate.js";
import * as GeolocationRange from "./GeolocationRange.js";
import createStoreCard from "../../cards/_archive/card-store.js";

let contenfulData = new ContentfulData();

export async function geojsonStore() {
  try {
    const Data = await contenfulData.getData();
    console.log("~01:geojsonStore Data:", Data);

    const features = Data.map((store) => {
      console.log("~02:Processing store:", store);
      console.log("~03:Store gallery data:", store.media?.gallery);

      const {
        title,
        headline: { subtext, text, eyebrow },
        publishedAt,
        slug,
        storeAttributes,
        popularTimes,
        location: { region, address, geolocation: { lat, lon }, type },
        category: { categoryType, genre },
        summary: { best, noise, parking, environment },
        series: { seriesName },
        hours,
        neustar,
        ratings,
        nearbyStore,
        variant,
        media: {
          thumbnail,
          logo,
          gallery = [],
          area,
          service
        },
        snippet: {
          text: snippet
        },
        tag,
      } = store;

      const storeRange = Geolocate.GeolocateToStore(store);
      console.log("~02:storeRange:", storeRange);

      // Prepare store data for card rendering
      const storeCardData = {
        title,
        ratingScore: ratings?.[0]?.key || 0,
        type,
        distance: storeRange,
        gallery: Array.isArray(gallery) ? gallery.map(item => {
          return typeof item === 'string' ? item : item.url;
        }) : [thumbnail],
        ...store // Include other store data needed by card
      };

      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [lon, lat],
        },
        "properties": {
          storeCardData, // Include data needed for card rendering
          publishedAt,
          title,
          variant,
          nearbyStore,
          location,
          text,
          subtext,
          eyebrow,
          slug,
          address,
          seriesName,
          region,
          lat,
          lon,
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

    console.log("~04:Final features:", features);
    return { features };

  } catch (error) {
    console.error("Error in geojsonStore:", error);
    return { features: [] };
  }
}




