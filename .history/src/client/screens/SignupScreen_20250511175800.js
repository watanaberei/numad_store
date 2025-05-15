// src/screens/Signup.js
import mapboxgl from "mapbox-gl";
// import { initMap } from "../components/MapApi.js";
// import { geojsonStore } from "../components/GeojsonStores.js";
// import { createMapMarker } from "../components/MapMarker.js";
// import { createGeojsonListing } from "../components/GeojsonListing.js";
// import { createGeojsonStoreListing } from "../components/GeojsonStoreListing.js";
// import { createGeojsonReviewListing } from "../components/GeojsonReviewListing.js";
// import { createGeojsonArticleListing } from "../components/GeojsonArticleListing.js";
// import { createGeojsonBlogListing } from "../components/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/map/geo/GeocoderInput.js";
// import AllBlog from "../components/AllBlog.js";
// import storeSelectedLocation from "../components/header/Header.js";
import mapRoute from "../components/map/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../components/header/HeaderHome.js";
import { createAuth0Client } from '@auth0/auth0-spa-js';
import * as modals from '../components/modal/modal.js';


const SignupScreen = {
  render: async () => {
    // Instead of rendering a signup page, trigger the modalAuth popup
    const { modalAuth: modalAuthHTML } = await modals.modalAuth();
    // Inject modal HTML if not already present
    if (!document.getElementById('myModalAuth')) {
      document.body.insertAdjacentHTML('beforeend', modalAuthHTML);
    }
    // Show the modal
    setTimeout(() => {
      const modal = document.getElementById('myModalAuth');
      if (modal) modal.style.display = 'block';
    }, 0);
    return '';
  },

  after_render: async () => {
    // Call modalAuth after_render to set up event listeners
    const { after_render } = await modals.modalAuth();
    after_render();
  }
};
export default SignupScreen;