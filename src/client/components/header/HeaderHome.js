// ../components/HeaderHome.js
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import DineScreen from '../../../client/screens/DineScreen.js';
import * as modals from '../modal/modal.js';
// import { modalAuth } from './modal.js';



let modalAuthButton;
// let modals;
// Initialize the geocoder only once
let lastSelectedResult = null;
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  placeholder: 'Location',
  flyTo: false
});

// Attach the 'result' event listener only once
geocoder.on('result', function(e) {
  lastSelectedResult = e.result;
});

const HeaderHome = {
  render: async () => {
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    const userEmail = localStorage.getItem('userEmail') || '';
    const { modalAuth: modalAuthHTML } = await modals.modalAuth();
    // const modalAuthButtonHTML = await modalAuthButton.render();
    // console.log("!!!!modalAuthButtonHTML", modalAuthButtonHTML);
    // console.log("!!!!modalAuthButton", modalAuthButton);
  
    return `
    <nav id="HeaderHome" class="nav navigation container nav-top">
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
                ${isAuthenticated ? `
                  <button id="btn-user" class="btn-nav">${userEmail}</button>
                  <button id="btn-logout" class="btn-nav">Log out</button>
                ` : `
                  <button id="btn-login" class="btn-nav">Login</button>
                `}
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
    if (geocoder._map) {
      geocoder.remove();
    }
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

     const { after_render } = await modals.modalAuth();
 
    console.log('after_render function called');
    // Detach the geocoder from any previous map instance


    // Attach the geocoder to the new map instance
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
    document.getElementById('search-btn').addEventListener('click', function() {
      // Your search button click handler code here...
    });
    
    
    const { modalAuth: modalAuthHTML } = await modals.modalAuth();
    document.body.innerHTML += modalAuthHTML; // or however you're adding modalAuth to the DOM

    // await modalAuthButton.after_render(); // Now modalAuthButton is accessible here
    
    // document.addEventListener('DOMContentLoaded', () => {
    //   const modals = modal.modals();
    //   modals.modal.init();
    // });


    // const modalAuth = modal.modalAuth();

    // modal.modals.init();

    // if (isAuthenticated) {
    //   document.getElementById('btn-logout').addEventListener('click', function() {
    //     console.log('Logout button clicked');
    //     // Log out the user
    //     localStorage.removeItem('accessToken');
    //     localStorage.removeItem('refreshToken');

    //     // Redirect to the home page
    //     window.location.href = '/';
    //   });
    // } else {
    //   const accountBtn = document.getElementById('account-btn');
    //   if(accountBtn) {
    //     accountBtn.addEventListener('click', function(event) {
    //       console.log('Account button clicked');
    //       event.preventDefault();
      
    //       // Use modals.modalAuth to initialize the modal
    //       const modals = modal.modals();
    //       modals.modal.init();
    //     });
    //   } else {
    //     console.log('Account button not found');
    //   }
    // }

    const isAuthenticated = localStorage.getItem('accessToken') !== null;

    if (isAuthenticated) {
      document.getElementById('btn-user').addEventListener('click', function() {
        window.location.href = '/user';
      });
      document.getElementById('btn-logout').addEventListener('click', function() {
        console.log('Logout button clicked');
        // Log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to the home page
        window.location.href = '/';
      });
    } else {
      const accountBtn = document.getElementById('btn-account');
      if(accountBtn) {
        accountBtn.addEventListener('click', function(event) {
          console.log('Account button clicked');
          event.preventDefault();
          modalAccount();
        });
      } else {
        console.log('Account button not found');
      }
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


    if (isAuthenticated) {
      document.getElementById('btn-user').addEventListener('click', function() {
        window.location.href = '/user';
      });
      document.getElementById('btn-logout').addEventListener('click', function() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/';
      });
    } else {
      document.getElementById('btn-login').addEventListener('click', function() {
        window.location.href = '/login';
      });
    }
  },
  getLastSelectedResult: () => lastSelectedResult
};

export default HeaderHome;