// ../components/HeaderHome.js
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import DineScreen from '../screens/DineScreen.js';
import { modalAccount } from '../components/modal.js';

let lastSelectedResult = null;
// Initialize the geocoder only once
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  placeholder: 'Location',
  flyTo: false
});

// const login = async () => {
//   await auth0.loginWithRedirect({
//       redirect_uri: window.location.href
//   });
// };

// const signup = () => {
//   console.log('signup function called.');
//   console.log('Signup button clicked.');

//   // Redirect to the signup page
//   window.location.href = '/signup';

//   console.log('Redirecting to /signup...');
// };

// Attach the 'result' event listener only once
geocoder.on('result', function(e) {
  lastSelectedResult = e.result;
});

const HeaderHome = {
  render: async () => {
    const isAuthenticated = localStorage.getItem('accessToken') !== null;

    return `
          <nav class="nav navigation container nav-top">
            <section class="grid base nav-main">
          
            <div class="nav-main-left left">
                  <div class="nav-main-logo">
                      <!-- hamburger --> 
        
                      <a class="nav-topbar-logo-container" href="/">
                          <i class="brand-logomark-18px"></i>                   
                          <span class="text03 bold">TheNeumad</div>
                      </a>
                  </div>
              </div>
              <div class="nav-main-center search-container">
              
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
                  <a href="/account">
                    <button id="btn-account">
                      Account
                    </button>
                  </a>
                  ${localStorage.getItem('accessToken') !== null ? `
                    <button id="btn-logout">
                      Log out
                    </button>
                  ` : ''}
                </div>
              </div>
            </section>
          </nav>
         


<!--
      <div id="search-bar">
        <input type="text" id="category" placeholder="Category" />
        <div id='geocoder' class='geocoder'></div>
        <button id="search-btn">Search</button>
      </div>
-->
    `;
  },
  after_render: async (map) => {
    console.log('after_render function called');
    // Detach the geocoder from any previous map instance

    
    if (geocoder._map) {
      geocoder.remove();
    }

    // Attach the geocoder to the new map instance
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
    document.getElementById('search-btn').addEventListener('click', function() {
      // Your search button click handler code here...
    });
    
    

    // // Add event listener to the login button
    // document.getElementById('btn-signup').addEventListener('click', function() {
    //   console.log('Signup button clicked.');

    //   // Redirect to the login page
    //   window.signup = signup;

    //   console.log('Redirecting to /signup...');
    // });

    //  // Log the result of document.getElementById('btn-signup')
    // console.log('btn-signup element:', document.getElementById('btn-signup'));
    const btnAccount = document.getElementById('btn-account');



    const isAuthenticated = localStorage.getItem('accessToken') !== null;

    if (isAuthenticated) {
      document.getElementById('btn-logout').addEventListener('click', function() {
        // Log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to the home page
        window.location.href = '/';
      });
    } else {
      document.getElementById('btn-account').addEventListener('click', function() {
        // Redirect to the account page
        window.location.href = '/account';
      });
    }


    if (localStorage.getItem('accessToken') !== null) {
      document.getElementById('btn-logout').addEventListener('click', function() {
        // Log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to the home page
        window.location.href = '/';
      });
    }

  },
  





  getLastSelectedResult: () => lastSelectedResult
};

export default HeaderHome;