// src/components/HeaderHome.js
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
// import { modals } from './modal.js';
import * as modals from '../modal/modal.js';

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
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    const userEmail = localStorage.getItem('userEmail') || '';

    return `
      <nav class="nav navigation container nav-top">
        <section class="grid base nav-main">
          <div class="nav-main-left left">
            <div class="nav-main-logo">
              <a class="nav-topbar-logo-container" href="/">
                <i class="brand-logomark-18px"></i>                   
                <span class="text03 bold">TheNeumad</span>
              </a>
            </div>
          </div>
          
          <div class="nav-main-center search-container">
            <!-- Search content here -->
          </div>
          
          <div class="nav-main-right right">
            <div class="nav-main-right-container">
              ${isAuthenticated ? `
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
        console.log('Modal opened from HeaderHome login button');
      });
    }

    const modals = await modals.modalAuth();
    
    // Initialize modals
    modals.init();
  },
  getLastSelectedResult: () => lastSelectedResult
};

export default HeaderHome;