// src/client/components/header/HeaderHome.js
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import DineScreen from '../../../client/screens/DineScreen.js';
import { modals } from '../modal/modal.js';
import * as components from '../../components/components.js';
import * as elements from '../../components/elements.js';

import userApi from '../../API/userApi.js';


let lastSelectedResult = null;
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  placeholder: 'Location',
  flyTo: false
});


geocoder.on('result', function(e) {
  lastSelectedResult = e.result;
});

const HeaderHome = {
  render: async () => {
    // Get user profile by username
    const userData = await userApi.getUserProfile(username);

    // Get current user data (authenticated)
    const currentUser = await userApi.getCurrentUser();

    
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    const userEmail = localStorage.getItem('userEmail') || '';

    // Update for HeaderHome.js to add Post button next to user email
    const UserAccount = isAuthenticated ? `
    
      <button id="btn-post" class="btn-nav">
        <i class="icon-plus"></i> Post
      </button>
      <button id="btn-user" class="btn-nav">${userEmail}</button>
      <button id="btn-logout" class="btn-nav">Log out</button>

    ` : `
      <button id="btn-login" class="btn-nav modal-btn" data-target="auth-modal">Login</button>
    `;


    return `
      <nav id="HeaderHome" class="nav navigation container nav-top">
        <section class="grid05 base nav-main">
            
              <div class="col01 nav-main-left left">
                    <div class="nav-main-logo">
                        <!-- hamburger --> 
          
                        <a class="nav-topbar-logo-container" href="/">
                            <i class="brand-logomark-18px"></i>                   
                            <span class="text03 bold">✸</span>
                        </a>
                    </div>
                </div>
                <div class="col03 nav-main-center search-container">
                

                <div class="search-input">
                  <div class="search">

                  <!--CATEGORY-->
                    <div class="searchBar-categoryType">
                      <div class="searchBar-categoryType-container category">
                          <div class="categoryType-text">
                              <span class="text03">
                                  <input class="text03 bold" type="text" id="category" placeholder="Category" />
                              </span>
                          </div>

                      </div>
                    </div>

                    <!--FILLER-->
                    <div class="search-filler">
                      <div class="filler">
                        <div class="cta-input">
                          <span class="text03 field-text">
                            in
                          </span>
                        </div>
                      </div>
                    </div>
                    <!--FILLER-->

                    <!--LOCATION-->
                    <div class="searchBar-location">
                      <div id='geocoder' class='geocoder text03'></div>
                        <!--<div class="text03" id="geocoder"></div>-->
                        <pre  class="text03 bold" id="result"></pre>
                      </div>
                    </div>
                    <!--LOCATION-->

                    <!--CTA-->
                    <div class="searchBar-cta">
                      <div class="searchBar-cta-container">
                        <button id="search-btn"><i class="cta menu-icon icon-Search-21px"></i></button>
                      </div>
                    </div>
                    <!--CTA-->

                  </div>
                </div>

                <div class="nav-main-right right">
                  <div class="nav-main-right-container">
                    ${isAuthenticated ? `
                      <button id="btn-post" class="btn-nav">
                        <i class="icon-plus"></i> Post
                      </button>
                      <button id="btn-user" class="btn-nav">${userEmail}</button>
                      <button id="btn-logout" class="btn-nav">Log out</button>
                    ` : `
                      <button id="btn-login" class="btn-nav modal-btn" data-target="auth-modal">Login</button>
                    `}
                  </div>
                </div>

              </section>
            </nav>

            <!-- Auth Modal -->
            <div id="auth-modal" class="modal">
              <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div id="auth-form">
                  <div id="auth-form-content">
                    <h2>Enter Your Email</h2>
                    <form id="email-check-form">
                      <input type="email" id="email-check" placeholder="Email" required />
                      <button type="submit">Next</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
      `;

  },
  after_render: async (map) => {
    if (geocoder._map) {
      geocoder.remove();
    }
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
    
    const isAuthenticated = localStorage.getItem('accessToken') !== null;

    if (isAuthenticated) {
      // Post button event listener
      document.getElementById('btn-post').addEventListener('click', function() {
        window.location.href = '/post';
      });
      
      // User profile button
      document.getElementById('btn-user').addEventListener('click', function() {
        window.location.href = '/user';
      });
      
      // Logout button
      document.getElementById('btn-logout').addEventListener('click', function() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/';
      });
    } else {
      // Login button for non-authenticated users
      document.getElementById('btn-login').addEventListener('click', function() {
        console.log('Modal opened from HeaderHome login button');
      });
    }
    
    // Initialize modals
    modals.init();
  },
  getLastSelectedResult: () => lastSelectedResult
};

export default HeaderHome;


  // },
//   getLastSelectedResult: () => lastSelectedResult
// };
