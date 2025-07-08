///////////////////////// START FIXED USER SCREEN COMPONENT /////////////////////////
// src/screens/UserScreen.js - FIXED VERSION FOR @username USER PROFILES

import mapboxgl from "mapbox-gl";
import { initMap } from "../../components/map/MapApi.js";
import { geojsonStore } from "../../components/cards/user/GeojsonStores.js";
import { createMapMarker } from "../../components/map/MapMarker.js";
import { createGeojsonListing } from "../../components/map/geo/GeojsonListing.js";
import { createGeojsonStoreListing } from "../../components/cards/store/cardStoreGeojson.js";
import { createGeojsonReviewListing } from "../../components/map/geo/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../../components/map/geo/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../../components/cards/blog/cardBlogGeojson.js";
import { createGeocoderInput } from "../../components/map/geo/GeocoderInput.js";
import AllBlog from "../../components/blog/AllBlog.js";
import storeSelectedLocation from "../../components/header/Header.js";
import mapRoute from "../../components/map/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../../components/header/HeaderHome.js"; 
import { createAuth0Client } from '@auth0/auth0-spa-js';
import * as element from "../../components/elements.js";
import createStoreCard from "../../components/cards/store/cardStore.js";
import createUserCard from "../../components/cards/user/cardUser.js";
import createBlogCard from "../../components/cards/blog/cardBlog.js";
import { fieldText } from "../../components/form/Form.js";
import { parseRequestUrl } from "../../utils/utils.js";
import userApi from '../../API/apiUser.js';

const API_URL = 'http://localhost:4000';

const UserScreen = {
  render: async () => {
    console.log('[UserScreen] Starting render...');
    
    // Get username from the request object set by router
    const usernameFromUrl = UserScreen.request?.username || parseRequestUrl().username;
    
    console.log('[UserScreen] URL parsed:', { usernameFromUrl });
    
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    const currentUsername = localStorage.getItem('username');
    
    // Determine if this is the current user's profile or someone else's
    const isOwnProfile = accessToken && currentUsername && currentUsername === usernameFromUrl;
    const isAuthenticated = !!accessToken;
    
    console.log('[UserScreen] Profile context:', { 
      isOwnProfile, 
      isAuthenticated, 
      currentUsername, 
      usernameFromUrl 
    });
    
    const header = element.header;
    const title = element.title;
    const titleCounter = element.titleCounter;

    const fields = [
      { label: 'First Name', placeholder: 'First Name', type: 'text', required: true, value: '' },
      { label: 'Last Name', placeholder: 'Last Name', type: 'text', required: true, value: '' },
      { label: 'Birthdate', placeholder: 'Birthdate', type: 'date', required: true, value: '' },
      { label: 'Description', placeholder: 'Description', type: 'text', required: true, value: '' },
      { label: 'Location', placeholder: 'Location', type: 'text', required: true, value: '' },
      { label: 'Website', placeholder: 'Website', type: 'text', required: true, value: '' },
      { label: 'Full Name', placeholder: 'Full Name', type: 'text', required: true, value: '' },
      { label: 'Phone Number', placeholder: 'Phone Number', type: 'text', required: true, value: '' }
    ];

    return `
      <!------ USER SCREEN ------> 
      <div class="main col05">
        
        <!-- Loading indicator -->
        <div id="profile-loading" class="loading-container" style="display: block;">
          <div class="loading-spinner"></div>
          <span class="text03">Loading profile...</span>
        </div>
        
        <!-- Error container -->
        <div id="profile-error" class="error-container" style="display: none;">
          <div class="error-message">
            <h2>Profile Not Found</h2>
            <p class="text03">The user profile you're looking for could not be found.</p>
            <a href="/" class="btn-back">Go Home</a>
          </div>
        </div>

        <!-- Profile header -->
        <div id="profile-header" class="col05 profile-header" style="display: none;">
          <div class="profile-header-content">
            <div class="profile-avatar">
              <div class="avatar-placeholder">
                <span id="profile-avatar-text" class="avatar-text"></span>
              </div>
            </div>
            <div class="profile-info">
              <h1 id="profile-username" class="profile-username"></h1>
              <p id="profile-fullname" class="profile-fullname text02"></p>
              <p id="profile-description" class="profile-description text03"></p>
              <div class="profile-meta">
                <span id="profile-location" class="profile-location text01"></span>
                <span id="profile-website" class="profile-website text01"></span>
                <span id="profile-joined" class="profile-joined text01"></span>
              </div>
              ${isOwnProfile ? `
                <div class="profile-actions">
                  <a href="/@${usernameFromUrl}/setting" class="btn-edit-profile">Edit Profile</a>
                  <button id="logout-btn" class="btn-logout">Logout</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!----------- USER CONTENT ----------->
        <div id="profile-content" class="col03 auth-container activity-detail" style="display: none;">
            <div class="col03 activity-container">
              <!------ HERO ------> 
              <section class="col03 activity">
                      <!------ USER HEADER ------>
                      <div class="col03 activity-header">

                          <!------ HEADLINE ------>
                          <div class="activity-headline">

                            ${isOwnProfile ? `
                              <!----------- CHECKED IN STORES (Own Profile Only) ----------->
                              <div class="col03 container">
                                <div id="checkedInStores" class="grid03 postStores list"> 
                                  ${title.render('Checked-in')}
                                  <div id="checkedInStoresContent" class="col03">
                                    <span class="text02 medium">Loading check-in history...</span>
                                  </div>
                                </div>
                              </div>

                              <!----------- VISIT HISTORY (Own Profile Only) ----------->
                              <div class="col03 container">
                                <div id="recentlyVisited" class="grid03postStores list"> 
                                  ${title.render('Recently Visited')}
                                  <div id="recentlyVisitedContent" class="col03">
                                    <span class="text02 medium">Loading visit history...</span>
                                  </div>
                                </div>
                              </div>

                              <!----------- SAVED STORES (Own Profile Only) ----------->
                              <div class="col03 container">
                                <div id="savedStores" class="grid03 postStores list"> 
                                  ${title.render('Saved')}
                                  <div id="savedStoresContent" class="col03">
                                    <span class="text02 medium">Loading saved stores...</span>
                                  </div>
                                </div>
                              </div>
                            ` : `
                              <!----------- PUBLIC PROFILE CONTENT ----------->
                              <div class="col03 container">
                                <div id="publicActivity" class="grid03 postStores list"> 
                                  ${title.render('Activity')}
                                  <div id="publicActivityContent" class="col03">
                                    <span class="text02 medium">Loading public activity...</span>
                                  </div>
                                </div>
                              </div>
                            `}
                            
                          </div>
                          <!------ HEADLINE ------>

                      </div>
                      <!------ USER HEADER ------>

              </section>
              <!------ HERO ------>

            </div>
        </div>
        
        <!----------- USER CONTENT ----------->
        
      </div>
      <!------ USER SCREEN ------> 
      `;
    },
    
    after_render: async () => {
      console.log('[UserScreen] Starting after_render...');
      
      // Get username from the request object set by router
      const usernameFromUrl = UserScreen.request?.username || parseRequestUrl().username;
      
      console.log('[UserScreen] Processing profile for username:', usernameFromUrl);
      
      if (!usernameFromUrl) {
        console.error('[UserScreen] No username provided in URL');
        showError('No username provided in URL');
        return;
      }
      
      // Check if user is logged in
      const accessToken = localStorage.getItem('accessToken');
      const currentUsername = localStorage.getItem('username');
      
      // Determine if this is the current user's profile or someone else's
      const isOwnProfile = accessToken && currentUsername && currentUsername === usernameFromUrl;
      
      console.log('[UserScreen] Profile context:', { 
        isOwnProfile, 
        currentUsername, 
        usernameFromUrl 
      });
      
      // Get UI elements
      const profileLoading = document.getElementById('profile-loading');
      const profileError = document.getElementById('profile-error');
      const profileHeader = document.getElementById('profile-header');
      const profileContent = document.getElementById('profile-content');
      
      try {
        // Show loading
        showLoading();
        
        // Fetch user profile data
        console.log('[UserScreen] Fetching profile data for:', usernameFromUrl);
        
        let userData;
        if (isOwnProfile) {
          // Fetch detailed profile data for own profile
          userData = await fetchOwnProfileData();
        } else {
          // Fetch public profile data for other users
          userData = await fetchPublicProfileData(usernameFromUrl);
        }
        
        if (!userData) {
          throw new Error('User not found');
        }
        
        console.log('[UserScreen] Profile data loaded:', userData);
        
        // Populate profile header
        populateProfileHeader(userData, isOwnProfile);
        
        // Load profile content based on type
        if (isOwnProfile) {
          await loadOwnProfileContent();
          setupProfileEditHandlers(usernameFromUrl);
        } else {
          await loadPublicProfileContent(usernameFromUrl);
        }
        
        // Hide loading and show content
        hideLoading();
        showProfile();
        
        console.log('[UserScreen] Profile loaded successfully');
        
      } catch (error) {
        console.error('[UserScreen] Error loading profile:', error);
        showError(error.message || 'Failed to load profile');
      }
      
      // Helper functions
      function showLoading() {
        if (profileLoading) profileLoading.style.display = 'block';
        if (profileError) profileError.style.display = 'none';
        if (profileHeader) profileHeader.style.display = 'none';
        if (profileContent) profileContent.style.display = 'none';
      }
      
      function hideLoading() {
        if (profileLoading) profileLoading.style.display = 'none';
      }
      
      function showProfile() {
        if (profileHeader) profileHeader.style.display = 'block';
        if (profileContent) profileContent.style.display = 'block';
      }
      
      function showError(message) {
        hideLoading();
        if (profileError) {
          profileError.style.display = 'block';
          const errorMessage = profileError.querySelector('.error-message p');
          if (errorMessage) {
            errorMessage.textContent = message;
          }
        }
      }
      
      // Fetch own profile data (authenticated)
      async function fetchOwnProfileData() {
        try {
          console.log('[UserScreen] Fetching own profile data...');
          
          const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Token expired, redirect to login
              localStorage.clear();
              window.location.href = '/login';
              return null;
            }
            throw new Error(`Failed to fetch profile: ${response.status}`);
          }

          const data = await response.json();
          console.log('[UserScreen] Own profile data:', data);
          return data;
          
        } catch (error) {
          console.error('[UserScreen] Error fetching own profile:', error);
          throw error;
        }
      }
      
      // Fetch public profile data (no authentication required)
      async function fetchPublicProfileData(username) {
        try {
          console.log('[UserScreen] Fetching public profile for:', username);
          
          const response = await fetch(`${API_URL}/user/${username}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('User not found');
            }
            throw new Error(`Failed to fetch profile: ${response.status}`);
          }

          const data = await response.json();
          console.log('[UserScreen] Public profile data:', data);
          return data.user; // The API returns { success: true, user: {...} }
          
        } catch (error) {
          console.error('[UserScreen] Error fetching public profile:', error);
          throw error;
        }
      }
      
      // Populate profile header with user data
      function populateProfileHeader(userData, isOwn) {
        try {
          console.log('[UserScreen] Populating profile header with:', userData);
          
          // Set avatar (first letter of username)
          const avatarText = document.getElementById('profile-avatar-text');
          if (avatarText && userData.username) {
            avatarText.textContent = userData.username.charAt(0).toUpperCase();
          }
          
          // Set username
          const usernameEl = document.getElementById('profile-username');
          if (usernameEl) {
            usernameEl.textContent = `@${userData.username}`;
          }
          
          // Set full name
          const fullnameEl = document.getElementById('profile-fullname');
          if (fullnameEl) {
            const fullName = userData.fullName || 
                            (userData.firstName && userData.lastName ? 
                             `${userData.firstName} ${userData.lastName}` : '');
            fullnameEl.textContent = fullName;
            fullnameEl.style.display = fullName ? 'block' : 'none';
          }
          
          // Set description
          const descriptionEl = document.getElementById('profile-description');
          if (descriptionEl) {
            descriptionEl.textContent = userData.description || '';
            descriptionEl.style.display = userData.description ? 'block' : 'none';
          }
          
          // Set location
          const locationEl = document.getElementById('profile-location');
          if (locationEl) {
            locationEl.textContent = userData.location ? `📍 ${userData.location}` : '';
            locationEl.style.display = userData.location ? 'inline' : 'none';
          }
          
          // Set website
          const websiteEl = document.getElementById('profile-website');
          if (websiteEl && userData.website) {
            const website = userData.website.startsWith('http') ? userData.website : `https://${userData.website}`;
            websiteEl.innerHTML = `🔗 <a href="${website}" target="_blank" rel="noopener noreferrer">${userData.website}</a>`;
            websiteEl.style.display = 'inline';
          } else if (websiteEl) {
            websiteEl.style.display = 'none';
          }
          
          // Set joined date
          const joinedEl = document.getElementById('profile-joined');
          if (joinedEl) {
            const joinedDate = userData.joinedAt || userData.createdAt;
            if (joinedDate) {
              const date = new Date(joinedDate);
              joinedEl.textContent = `📅 Joined ${date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}`;
            }
          }
          
          console.log('[UserScreen] Profile header populated successfully');
          
        } catch (error) {
          console.error('[UserScreen] Error populating profile header:', error);
        }
      }
      
      // Load own profile content (authenticated user)
      async function loadOwnProfileContent() {
        try {
          console.log('[UserScreen] Loading own profile content...');
          
          const checkedInStoresContent = document.getElementById('checkedInStoresContent');
          const recentlyVisitedContent = document.getElementById('recentlyVisitedContent');
          const savedStoresContent = document.getElementById('savedStoresContent');
          
          if (!checkedInStoresContent) {
            console.error('[UserScreen] Could not find checkedInStoresContent element');
            return;
          }
          
          // Fetch both user data and store data
          const [userResponse, storeResponse] = await Promise.all([
            fetch(`${API_URL}/api/user`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            }),
            fetch(`${API_URL}/api/user/store`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            })
          ]);

          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user data: ${userResponse.status}`);
          }
          if (!storeResponse.ok) {
            throw new Error(`Failed to fetch store data: ${storeResponse.status}`);
          }

          const [userData, storeData] = await Promise.all([
            userResponse.json(),
            storeResponse.json()
          ]);

          console.log('[UserScreen] User activity data:', userData);
          console.log('[UserScreen] Store data:', storeData);

          // Display currently checked-in store
          if (userData.checkedInStore && storeData.stores) {
            const currentStoreData = storeData.stores.find(store => store.storeId === userData.checkedInStore);
            console.log('[UserScreen] Current store data:', currentStoreData);
            
            if (currentStoreData) {
              try {
                const storeCardHTML = await createStoreCard.render(currentStoreData);
                checkedInStoresContent.innerHTML = `
                  <div class="grid03 current-checkin">
                    <span class="text06">Currently Checked In</span>
                    ${storeCardHTML}
                  </div>
                `;
              } catch (cardError) {
                console.error('[UserScreen] Error creating store card:', cardError);
                checkedInStoresContent.innerHTML = `
                  <div class="current-checkin">
                    <h3>Currently Checked In</h3>
                    <p>${currentStoreData.storeInfo?.storeName || 'Unknown Store'}</p>
                  </div>
                `;
              }
            } else {
              checkedInStoresContent.innerHTML = '<p>Store information not available</p>';
            }
          } else {
            checkedInStoresContent.innerHTML = '<p>Not currently checked in to any store</p>';
          }

          // Display check-in history
          if (storeData.checkedInStores && storeData.checkedInStores.length > 0) {
            const historySection = document.createElement('div');
            historySection.className = 'grid03 store-history';
            historySection.innerHTML = '<span class="text06">Recent Check-ins</span>';

            try {
              // Create cards for each store in history
              const historyCards = await Promise.all(
                storeData.checkedInStores.slice(0, 6).map(async (checkIn) => {
                  const storeInfo = storeData.stores.find(store => store.storeId === checkIn.storeId);
                  if (storeInfo) {
                    try {
                      return await createStoreCard.render(storeInfo);
                    } catch (cardError) {
                      console.error('[UserScreen] Error creating history card:', cardError);
                      return `<div class="store-card-fallback">
                        <h5>${storeInfo.storeInfo?.storeName || checkIn.storeId}</h5>
                        <p>Checked in: ${new Date(checkIn.checkedInAt).toLocaleDateString()}</p>
                      </div>`;
                    }
                  }
                  return null;
                })
              );

              // Filter out null values and join the cards
              const historyHTML = historyCards.filter(Boolean).join('');
              historySection.innerHTML += `<div class="col03 grid03 history-grid">${historyHTML}</div>`;
              checkedInStoresContent.appendChild(historySection);
              
              // Initialize card effects after rendering
              try {
                await createStoreCard.after_render();
              } catch (afterRenderError) {
                console.warn('[UserScreen] Error in card after_render:', afterRenderError);
              }
              
            } catch (historyError) {
              console.error('[UserScreen] Error creating history cards:', historyError);
              historySection.innerHTML += '<p>Error loading check-in history</p>';
              checkedInStoresContent.appendChild(historySection);
            }
          }

          // Handle recently visited and saved stores
          if (recentlyVisitedContent) {
            recentlyVisitedContent.innerHTML = '<p>Recently visited stores coming soon...</p>';
          }
          
          if (savedStoresContent) {
            savedStoresContent.innerHTML = '<p>Saved stores coming soon...</p>';
          }

        } catch (error) {
          console.error('[UserScreen] Error loading own profile content:', error);
          const checkedInStoresContent = document.getElementById('checkedInStoresContent');
          if (checkedInStoresContent) {
            checkedInStoresContent.innerHTML = `<p>Error loading data: ${error.message}</p>`;
          }
        }
      }
      
      // Load public profile content (other users)
      async function loadPublicProfileContent(username) {
        try {
          console.log('[UserScreen] Loading public profile content for:', username);
          
          const publicActivityContent = document.getElementById('publicActivityContent');
          if (publicActivityContent) {
            publicActivityContent.innerHTML = '<p>Public activity coming soon...</p>';
          }
          
        } catch (error) {
          console.error('[UserScreen] Error loading public profile content:', error);
          const publicActivityContent = document.getElementById('publicActivityContent');
          if (publicActivityContent) {
            publicActivityContent.innerHTML = `<p>Error loading activity: ${error.message}</p>`;
          }
        }
      }
      
      // Set up profile editing handlers (own profile only)
      function setupProfileEditHandlers(username) {
        try {
          console.log('[UserScreen] Setting up profile edit handlers...');
          
          // Logout button
          const logoutBtn = document.getElementById('logout-btn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
              console.log('[UserScreen] Logout clicked');
              if (confirm('Are you sure you want to logout?')) {
                localStorage.clear();
                window.location.href = '/';
              }
            });
          }
          
          console.log('[UserScreen] Profile edit handlers set up successfully');
          
        } catch (error) {
          console.error('[UserScreen] Error setting up profile edit handlers:', error);
        }
      }
    }
  };

export default UserScreen;

///////////////////////// END FIXED USER SCREEN COMPONENT /////////////////////////