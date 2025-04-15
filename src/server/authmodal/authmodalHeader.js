// ../components/HeaderHome.js
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import DineScreen from '../screens/DineScreen.js';
import * as modal from '../components/modal.js';
// import { modalAccount } from './modal.js';


let lastSelectedResult = null;
let modalAccountButton;
// let modals;
// Initialize the geocoder only once
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
    const { modalAccount: modalAccountHTML } = await modal.modalAccount();
    // const modalAccountButtonHTML = await modalAccountButton.render();
    // console.log("!!!!modalAccountButtonHTML", modalAccountButtonHTML);
    // console.log("!!!!modalAccountButton", modalAccountButton);
    
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
                  <!--<a href="/account">
                    <button id="btn-account">
                      Account
                    </button>
                  </a>-->
                  ${modalAccountHTML}
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
     const { after_render } = await modal.modalAccount();
    after_render();
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
    
    
    const { modalAccount: modalAccountHTML } = await modal.modalAccount();
    document.body.innerHTML += modalAccountHTML; // or however you're adding modalAccount to the DOM

    // await modalAccountButton.after_render(); // Now modalAccountButton is accessible here
    
    // document.addEventListener('DOMContentLoaded', () => {
    //   const modals = modal.modals();
    //   modals.modal.init();
    // });

    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    // const modalAccount = modal.modalAccount();

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
      
    //       // Use modals.modalAccount to initialize the modal
    //       const modals = modal.modals();
    //       modals.modal.init();
    //     });
    //   } else {
    //     console.log('Account button not found');
    //   }
    // }


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