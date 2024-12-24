// src/screens/LoginScreen.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/MapApi.js";
import { geojsonStore } from "../components/GeojsonStores.js";
import { createMapMarker } from "../components/MapMarker.js";
import { createGeojsonListing } from "../components/GeojsonListing.js";
import { createGeojsonStoreListing } from "../components/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../components/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../components/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../components/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/GeocoderInput.js";
import AllBlog from "../components/AllBlog.js";
import storeSelectedLocation from "../components/Header.js";
import mapRoute from "../components/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../components/HeaderHome.js";

//////////////////////////////// ./src/screens/LoginScreen.js
const LoginScreen = {
  render: async () => {
    return `
    <!------ LOGIN SCREEN ------> 
    LOGOUT
    <!------ LOGIN SCREEN ------> 
    `;
  },

  after_render: async () => {

    // setCurrentLocation(map, features);
  },
};
export default LoginScreen;