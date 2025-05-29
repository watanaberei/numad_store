// src/screens/LoginScreen.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../../components/map/MapApi.js";
import { geojsonStore } from "../../components/map/geo/GeojsonStores.js";
import { createMapMarker } from "../../components/map/MapMarker.js";
import { createGeojsonListing } from "../../components/map/geo/GeojsonListing.js";
import { createGeojsonStoreListing } from "../../components/map/geo/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../../components/map/geo/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../../components/map/geo/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../../components/map/geo/GeojsonBlogListing.js";
import { createGeocoderInput } from "../../components/map/geo/GeocoderInput.js";
// import AllBlog from "../components/AllBlog.js";
import HeaderHome from "../../components/header/HeaderHome.js";
import mapRoute from "../../components/map/mapRoute.js";
import { geoPopup } from "../../components/map/geo/GeoPopup.js";
import polyline from "@mapbox/polyline";


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