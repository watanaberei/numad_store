// src/client/components/header/HeaderHome.js
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import DineScreen from '../../../client/screens/Home/DineScreen.js';
import { modals, auth } from '../modal/modal.js'; // Fixed import path
import * as components from '../../components/components.js';
import * as elements from '../../components/elements.js'; // Fixed import path

import userApi from '../../API/apiUser.js';

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
    console.log('[HeaderHome.js line 24] Rendering header');
    
    // Check authentication and get username
    const isAuthenticated = userApi.isAuthenticated();
    const username = userApi.getCurrentUsername() || '';
    const userEmail = userApi.getCurrentUserEmail() || '';
    
    console.log('[HeaderHome.js line 31] Auth state:', { isAuthenticated, username, userEmail });
    
    // Display username if available, otherwise email
    const displayName = username || userEmail || 'User';

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
                      <button id="btn-user" class="btn-nav" data-username="${username}">@${displayName}</button>
                      <button id="btn-logout" class="btn-nav">Log out</button>
                    ` : `
                      <button id="btn-login" class="btn-nav modal-btn" data-target="auth-modal">Login</button>
                    `}
                  </div>
                </div>

              </section>
            </nav>

            <!-- Auth Modal will be created dynamically by modal.js -->
      `;
  },
  
  after_render: async (map) => {
    console.log('[HeaderHome.js line 122] Initializing after_render');
    
    // Initialize geocoder
    if (geocoder._map) {
      geocoder.remove();
    }
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
    
    const isAuthenticated = userApi.isAuthenticated();
    console.log('[HeaderHome.js line 131] Is authenticated:', isAuthenticated);

    if (isAuthenticated) {
      // Post button event listener
      const postBtn = document.getElementById('btn-post');
      if (postBtn) {
        postBtn.addEventListener('click', function() {
          console.log('[HeaderHome.js line 138] Post button clicked');
          window.location.href = '/post';
        });
      }
      
      // User profile button - navigate to user's own profile
      const userBtn = document.getElementById('btn-user');
      if (userBtn) {
        userBtn.addEventListener('click', function() {
          const username = this.getAttribute('data-username');
          console.log('[HeaderHome.js line 148] User button clicked', { username });
          if (username) {
            window.location.href = `/@${username}`;
          } else {
            window.location.href = '/@user';
          }
        });
      }
      
      // Logout button
      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          console.log('[HeaderHome.js line 162] Logout button clicked');
          auth.logout();
        });
      }
    }
    
    // Initialize modals
    console.log('[HeaderHome.js line 169] Initializing modals');
    modals.init();

    ///////////////////////// START EVENT LISTENERS /////////////////////////
    // Listen for authentication state changes to update header
    window.addEventListener('user-authenticated', async (e) => {
      console.log('[HeaderHome.js line 175] User authenticated event received');
      console.log('[HeaderHome.js line 176] Event detail:', e.detail);
      
      // Re-render the header to show the updated username
      const header = document.getElementById("header");
      if (header) {
        console.log('[HeaderHome.js line 181] Re-rendering header');
        header.innerHTML = await HeaderHome.render();
        await HeaderHome.after_render(map);
      }
    });
    
    window.addEventListener('user-unauthenticated', async () => {
      console.log('[HeaderHome.js line 188] User unauthenticated event received');
      
      // Re-render the header to show login button
      const header = document.getElementById("header");
      if (header) {
        console.log('[HeaderHome.js line 193] Re-rendering header');
        header.innerHTML = await HeaderHome.render();
        await HeaderHome.after_render(map);
      }
    });
    ///////////////////////// END EVENT LISTENERS /////////////////////////
    
    // Search button functionality
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        console.log('[HeaderHome.js line 204] Search button clicked');
        const category = document.getElementById('category').value;
        const location = lastSelectedResult;
        console.log('[HeaderHome.js line 207] Search params:', { category, location });
        
        if (category && location) {
          // Implement search functionality
          console.log('[HeaderHome.js line 211] Performing search with:', { category, location });
        }
      });
    }
  },
  
  getLastSelectedResult: () => lastSelectedResult
};

export default HeaderHome;

  // },
//   getLastSelectedResult: () => lastSelectedResult
// };
