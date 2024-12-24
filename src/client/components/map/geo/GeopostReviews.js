// src/components/GeopostReviews.js

import * as turf from '@turf/turf';
import { getStoresNeumadsReview, getArticleNeumadsTrail } from '../api.js';

class GeopostReviews {
  constructor() {
    this.data = [];
  }

  async initializeMap() {
    this.stores = await this.getStoreData();
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/neumad/cli7nxj9700wz01r50nn9d19d',
      center: [this.stores.location[0].geolocation.coordinates.lat, this.stores.location[0].geolocation.coordinates.lng],
      zoom: 13,
      scrollZoom: true
    });
    // console.log("map:",map);
    // console.log("stores:",stores[0]);
    

    // Proceed with the same map functionalities as in the MapApi.js file...
  }

  async getStoreData(searchResult) {
    try {
      const data = await getArticleNeumadsTrail();
      if (data) {
        const processedData = data.map(store => {
          if (store.storeNeumadsReviewCollection && store.storeNeumadsReviewCollection.location) {
            let lat = store.location.geolocation.lat;
            console.log("lat:",lat);
            let lng = store.location.geolocation.lng;
            let coordinates = [lng, lat];
            let from = turf.point(searchResult);
            let to = turf.point(coordinates);
            let options = {units: 'miles'};
            let distance = turf.distance(from, to, options);


            console.log("coordinates:",coordinates[0]);
            
            // Construct a GeoJSON feature for each store
            return {
              type: 'Feature',
              properties: {
                ...store,
                distance
              },
              geometry: {
                type: 'Point',
                coordinates
              }
            };


            
          } else {
            console.warn('Review does not have valid storeGeolocation data.');
            return null;
          }
        }).filter(item => item !== null);  // Filter out null items
        
        // Construct a GeoJSON feature collection
        this.data = {
          type: 'FeatureCollection',
          features: processedData
        };
        console.error('data', data);
      }
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    }
  }
}

export default GeopostReviews;
