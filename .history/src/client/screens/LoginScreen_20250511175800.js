// src/screens/LoginScreen.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/map/MapApi.js";
import { geojsonStore } from "../components/map/geo/GeojsonStores.js";
import { createMapMarker } from "../components/map/MapMarker.js";
import { createGeojsonListing } from "../components/map/geo/GeojsonListing.js";
import { createGeojsonStoreListing } from "../components/map/geo/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../components/map/geo/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../components/map/geo/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../components/map/geo/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/map/geo/GeocoderInput.js";
// import AllBlog from "../components/map/AllBlog.js";
// import storeSelectedLocation from "../components/header/Header.js";
import mapRoute from "../components/map/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../components/header/HeaderHome.js";
import { createAuth0Client } from '@auth0/auth0-spa-js';
import * as modals from '../components/modal/modal.js';



//////////////////////////////// ./src/screens/LoginScreen.js
const LoginScreen = {
  render: async () => {
    // Instead of rendering a login page, trigger the modalAuth popup
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

export default LoginScreen;


// const loginForm = document.getElementById('login-form');
//     loginForm.addEventListener('submit', async (e) => {
//       e.preventDefault();

//       const email = document.getElementById('email').value;
//       const password = document.getElementById('password').value;

//       const response = await fetch('http://localhost:4000/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await response.json();
//       if (response.ok) {
        
//         // Handle successful login
//     // Store the access token and refresh token in localStorage
//     localStorage.setItem('accessToken', accessToken);
//     localStorage.setItem('refreshToken', refreshToken);

//     // Redirect to the user page
//     window.location.href = '/user';
//       } else {
//         // Handle error
//         console.error(data);
//       }
//     });
//   }