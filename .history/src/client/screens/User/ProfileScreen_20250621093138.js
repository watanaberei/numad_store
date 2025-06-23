///////////////////////// START FIXED PROFILE SCREEN WITH PROPER NAVIGATION /////////////////////////
// src/screens/User/ProfileScreen.js - FIXED with proper settings navigation

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
import AllBlog from "../../components/blog/AllBlog.js";
import storeSelectedLocation from "../../components/header/Header.js";
import mapRoute from "../../components/map/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../../components/header/HeaderHome.js"; 
import { createAuth0Client } from '@auth0/auth0-spa-js';
import * as element from "../../components/elements.js";
import createStoreCard from "../../components/cards/cardStore.js";
import { fieldText } from "../../components/form/Form.js";
import { parseRequestUrl } from "../../utils/utils.js";
import userApi from '../../API/userApi.js';

// API Configuration - FIXED: Using correct ports from your setup
const AUTHSERVER_URL = 'http://localhost:4000';  // Authentication server
const SERVER_URL = 'http://localhost:4500';  // Main server

const ProfileScreen = {
  render: async () => {
    console.log('[ProfileScreen] Starting render...');
    
    // Parse the URL to get the username - works with both /@username and /user/username patterns
    const request = parseRequestUrl();
    const usernameFromUrl = ProfileScreen.request?.username || ProfileScreen.request?.resource || request.username || request.resource;
    
    console.log('[ProfileScreen] URL parsed:', { usernameFromUrl, request, ProfileScreenRequest: ProfileScreen.request });
    
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    const currentUsername = localStorage.getItem('username');
    
    // Determine if this is the current user's profile or someone else's
    const isOwnProfile = accessToken && currentUsername && currentUsername === usernameFromUrl;
    const isAuthenticated = !!accessToken;
    
    console.log('[ProfileScreen] Profile context:', { 
      isOwnProfile, 
      isAuthenticated, 
      currentUsername, 
      usernameFromUrl 
    });
    
    const header = element.header;
    const title = element.title;
    const titleCounter = element.titleCounter;

    // Profile edit form fields based on user documentation
    const profileFields = [
      { label: 'First Name', id: 'firstName', placeholder: 'First Name', type: 'text', value: '' },
      { label: 'Last Name', id: 'lastName', placeholder: 'Last Name', type: 'text', value: '' },
      { label: 'Full Name', id: 'fullName', placeholder: 'Full Name', type: 'text', value: '' },
      { label: 'Description', id: 'description', placeholder: 'Tell us about yourself...', type: 'textarea', value: '' },
      { label: 'Headline', id: 'headline', placeholder: 'Professional headline', type: 'text', value: '' },
      { label: 'Profession', id: 'profession', placeholder: 'Your profession', type: 'text', value: '' },
      { label: 'Industry', id: 'industry', placeholder: 'Your industry', type: 'text', value: '' },
      { label: 'Company', id: 'company', placeholder: 'Company name', type: 'text', value: '' },
      { label: 'Location', id: 'location', placeholder: 'City, State', type: 'text', value: '' },
      { label: 'Website', id: 'website', placeholder: 'https://yourwebsite.com', type: 'url', value: '' },
      { label: 'Phone Number', id: 'phoneNumber', placeholder: 'Phone Number', type: 'tel', value: '' },
      { label: 'Birthdate', id: 'birthdate', placeholder: 'Birthdate', type: 'date', value: '' }
    ];

    return `
      <!------ PROFILE SCREEN ------> 
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
            <p class="text03" id="error-message-text">The user profile you're looking for could not be found.</p>
            <a href="/" class="btn-back">Go Home</a>
          </div>
        </div>

        <!-- Profile Container -->
        <div id="profile-container" class="col05 profile-container" style="display: none;">
          
          <!-- 1. HEADER SECTION -->
          <section class="profile-header-section">
            <div class="profile-cover">
              <div id="profile-cover-image" class="cover-image" style="display: none;">
                <img id="cover-img" src="" alt="Cover" />
              </div>
            </div>
            
            <div class="profile-header-content">
              <!-- Profile Picture -->
              <div class="profile-avatar">
                <div class="avatar-container">
                  <div id="profile-avatar-img" class="avatar-image" style="display: none;">
                    <img id="avatar-img" src="" alt="Profile" />
                  </div>
                  <div id="profile-avatar-text" class="avatar-placeholder">
                    <span class="avatar-text"></span>
                  </div>
                  ${isOwnProfile ? `
                    <button id="change-avatar-btn" class="avatar-edit-btn" title="Change profile picture">
                      <i class="icon-camera"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
              
              <!-- Profile Info -->
              <div class="profile-info">
                <div class="profile-identity">
                  <h1 id="profile-username" class="profile-username"></h1>
                  <div id="profile-verified" class="verified-badge" style="display: none;">
                    <i class="icon-verified"></i>
                  </div>
                </div>
                
                <h2 id="profile-fullname" class="profile-fullname" style="display: none;"></h2>
                <p id="profile-headline" class="profile-headline" style="display: none;"></p>
                <p id="profile-description" class="profile-description" style="display: none;"></p>
                
                <!-- Professional Info -->
                <div class="profile-professional" id="profile-professional" style="display: none;">
                  <div class="professional-item" id="profession-container" style="display: none;">
                    <i class="icon-briefcase"></i>
                    <span id="profile-profession"></span>
                  </div>
                  <div class="professional-item" id="company-container" style="display: none;">
                    <i class="icon-building"></i>
                    <span id="profile-company"></span>
                  </div>
                  <div class="professional-item" id="industry-container" style="display: none;">
                    <i class="icon-industry"></i>
                    <span id="profile-industry"></span>
                  </div>
                </div>
                
                <!-- Profile Meta -->
                <div class="profile-meta">
                  <div class="meta-item" id="location-container" style="display: none;">
                    <i class="icon-location"></i>
                    <span id="profile-location"></span>
                  </div>
                  <div class="meta-item" id="website-container" style="display: none;">
                    <i class="icon-link"></i>
                    <a id="profile-website" href="" target="_blank" rel="noopener noreferrer"></a>
                  </div>
                  <div class="meta-item">
                    <i class="icon-calendar"></i>
                    <span id="profile-joined"></span>
                  </div>
                  <div class="meta-item" id="neumadic-stars-container">
                    <i class="icon-star"></i>
                    <span id="neumadic-stars">0 Neumadic Stars</span>
                  </div>
                </div>
                
                <!-- Profile Actions - FIXED: Only show Edit Profile for own profile -->
                <div class="profile-actions">
                  ${isOwnProfile ? `
                    <button id="edit-profile-btn" class="btn-primary">Edit Profile</button>
                  ` : `
                    <button id="follow-btn" class="btn-primary">Follow</button>
                    <button id="message-btn" class="btn-secondary">Message</button>
                    <button id="endorse-btn" class="btn-secondary">Endorse</button>
                  `}
                </div>
              </div>
            </div>
          </section>
          
          <!-- 2. STATS ROW -->
          <section class="profile-stats-section">
            <div class="stats-container">
              <div class="stat-item" id="places-stat">
                <span class="stat-number" id="places-count">0</span>
                <span class="stat-label">Places</span>
              </div>
              <div class="stat-item" id="contributions-stat">
                <span class="stat-number" id="contributions-count">0</span>
                <span class="stat-label">Contributions</span>
              </div>
              <div class="stat-item" id="followers-stat">
                <span class="stat-number" id="followers-count">0</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat-item" id="following-stat">
                <span class="stat-number" id="following-count">0</span>
                <span class="stat-label">Following</span>
              </div>
              <div class="stat-item" id="reviews-stat">
                <span class="stat-number" id="reviews-count">0</span>
                <span class="stat-label">Reviews</span>
              </div>
              <div class="stat-item" id="endorsements-stat">
                <span class="stat-number" id="endorsements-count">0</span>
                <span class="stat-label">Endorsements</span>
              </div>
            </div>
          </section>

          <!-- Profile Edit Form (Own Profile Only) - REMOVED INLINE FORM -->
          <!-- Form will be handled by settings page instead -->

          <!-- 5. CONTENT NAVIGATION TABS -->
          <section class="profile-tabs-section">
            <div class="tabs-container">
              <nav class="profile-tabs">
                <button class="tab-btn active" data-tab="activity">
                  <i class="icon-activity"></i>
                  <span>Activity</span>
                </button>
                <button class="tab-btn" data-tab="places">
                  <i class="icon-map-pin"></i>
                  <span>Places</span>
                </button>
                <button class="tab-btn" data-tab="posts">
                  <i class="icon-edit"></i>
                  <span>Posts</span>
                </button>
              </nav>
              
              <!-- Filter Controls -->
              <div class="tab-filters" id="tab-filters">
                <div class="filter-group">
                  <select id="distance-filter" class="filter-select">
                    <option value="all">All Distances</option>
                    <option value="nearby">Nearby</option>
                    <option value="walking">Walking Distance</option>
                    <option value="5km">Within 5km</option>
                    <option value="10km">Within 10km</option>
                  </select>
                  
                  <select id="category-filter" class="filter-select">
                    <option value="all">All Categories</option>
                    <option value="dine">Dine</option>
                    <option value="work">Work</option>
                    <option value="stay">Stay</option>
                    <option value="play">Play</option>
                  </select>
                  
                  <button id="clear-filters-btn" class="btn-clear">Clear All</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 6. CONTENT FEED -->
          <section class="profile-content-section">
            
            <!-- Activity Tab -->
            <div id="activity-tab" class="tab-content active">
              <div class="content-container">
                <div id="activity-content" class="activity-content">
                  <div class="loading-placeholder">Loading activity...</div>
                </div>
              </div>
            </div>
            
            <!-- Places Tab -->
            <div id="places-tab" class="tab-content">
              <div class="content-container">
                <!-- Places Categories -->
                <div class="places-categories">
                  <div class="category-nav">
                    <button class="category-btn active" data-category="visited">Visited</button>
                    <button class="category-btn" data-category="want-to-visit">Want to Visit</button>
                    <button class="category-btn" data-category="bookmarked">Bookmarked</button>
                    <button class="category-btn" data-category="reviewed">Reviewed</button>
                    <button class="category-btn" data-category="favorited">Favorited</button>
                    <button class="category-btn" data-category="recommended">Recommended</button>
                  </div>
                </div>
                
                <div id="places-content" class="places-content">
                  <div class="loading-placeholder">Loading places...</div>
                </div>
              </div>
            </div>
            
            <!-- Posts Tab -->
            <div id="posts-tab" class="tab-content">
              <div class="content-container">
                <div id="posts-content" class="posts-content">
                  <div class="loading-placeholder">Loading posts...</div>
                </div>
              </div>
            </div>
            
          </section>
        </div>
      </div>
      <!------ PROFILE SCREEN ------> 
      `;
    },
    
    after_render: async () => {
      console.log('[ProfileScreen] Starting after_render...');
      
      // Parse the URL to get the username
      const request = parseRequestUrl();
      const usernameFromUrl = ProfileScreen.request?.username || ProfileScreen.request?.resource || request.username || request.resource;
      
      console.log('[ProfileScreen] Processing profile for username:', usernameFromUrl);
      
      if (!usernameFromUrl) {
        console.error('[ProfileScreen] No username provided in URL');
        showError('No username provided in URL');
        return;
      }
      
      // Check if user is logged in
      const accessToken = localStorage.getItem('accessToken');
      const currentUsername = localStorage.getItem('username');
      
      // Determine if this is the current user's profile or someone else's
      const isOwnProfile = accessToken && currentUsername && currentUsername === usernameFromUrl;
      
      console.log('[ProfileScreen] Profile context:', { 
        isOwnProfile, 
        currentUsername, 
        usernameFromUrl 
      });
      
      // Get UI elements
      const profileLoading = document.getElementById('profile-loading');
      const profileError = document.getElementById('profile-error');
      const profileContainer = document.getElementById('profile-container');
      
      try {
        // Show loading
        showLoading();
        
        // Fetch user profile data
        console.log('[ProfileScreen] Fetching profile data for:', usernameFromUrl);
        
        let userData;
        if (isOwnProfile) {
          // Fetch detailed profile data for own profile from auth server
          userData = await fetchOwnProfileData();
        } else {
          // Fetch public profile data for other users from auth server
          userData = await fetchPublicProfileData(usernameFromUrl);
        }
        
        if (!userData) {
          throw new Error('User not found');
        }
        
        console.log('[ProfileScreen] Profile data loaded:', userData);
        
        // Populate profile header
        populateProfileHeader(userData, isOwnProfile);
        
        // Load profile stats
        await loadProfileStats(userData, isOwnProfile);
        
        // Load profile content based on type
        if (isOwnProfile) {
          await loadOwnProfileContent();
          setupProfileEditHandlers(); // FIXED: Set up handlers for own profile
        } else {
          await loadPublicProfileContent(usernameFromUrl);
          setupPublicProfileHandlers(usernameFromUrl);
        }
        
        // Setup tab navigation
        setupTabNavigation();
        
        // Setup filtering
        setupFiltering();
        
        // Hide loading and show content
        hideLoading();
        showProfile();
        
        console.log('[ProfileScreen] Profile loaded successfully');
        
      } catch (error) {
        console.error('[ProfileScreen] Error loading profile:', error);
        showError(error.message || 'Failed to load profile');
      }
      
      // Helper functions
      function showLoading() {
        if (profileLoading) profileLoading.style.display = 'block';
        if (profileError) profileError.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'none';
      }
      
      function hideLoading() {
        if (profileLoading) profileLoading.style.display = 'none';
      }
      
      function showProfile() {
        if (profileContainer) profileContainer.style.display = 'block';
      }
      
      function showError(message) {
        hideLoading();
        if (profileError) {
          profileError.style.display = 'block';
          const errorMessage = profileError.querySelector('#error-message-text');
          if (errorMessage) {
            errorMessage.textContent = message;
          }
        }
      }
      
      // Fetch own profile data (authenticated) from auth server
      async function fetchOwnProfileData() {
        try {
          console.log('[ProfileScreen] Fetching own profile data from auth server...');
          
          const response = await fetch(`${AUTHSERVER_URL}/profile`, {
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
          console.log('[ProfileScreen] Own profile data:', data);
          return data;
          
        } catch (error) {
          console.error('[ProfileScreen] Error fetching own profile:', error);
          throw error;
        }
      }
      
      // Fetch public profile data (no authentication required) from auth server
      async function fetchPublicProfileData(username) {
        try {
          console.log('[ProfileScreen] Fetching public profile for:', username);
          
          const response = await fetch(`${AUTHSERVER_URL}/user/${username}`, {
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
          console.log('[ProfileScreen] Public profile data:', data);
          return data.user; // The API returns { success: true, user: {...} }
          
        } catch (error) {
          console.error('[ProfileScreen] Error fetching public profile:', error);
          throw error;
        }
      }
      
      // Populate profile header with user data
      function populateProfileHeader(userData, isOwn) {
        try {
          console.log('[ProfileScreen] Populating profile header with:', userData);
          
          // Set avatar (first letter of username or profile picture)
          const avatarText = document.getElementById('profile-avatar-text');
          const avatarImg = document.getElementById('profile-avatar-img');
          
          if (userData.profilePicture && userData.profilePicture.url) {
            if (avatarImg) {
              const img = avatarImg.querySelector('#avatar-img');
              if (img) {
                img.src = userData.profilePicture.url;
                avatarImg.style.display = 'block';
                if (avatarText) avatarText.style.display = 'none';
              }
            }
          } else if (avatarText && userData.username) {
            avatarText.querySelector('.avatar-text').textContent = userData.username.charAt(0).toUpperCase();
          }
          
          // Set username
          const usernameEl = document.getElementById('profile-username');
          if (usernameEl) {
            usernameEl.textContent = `@${userData.username}`;
          }
          
          // Set verified badge
          const verifiedEl = document.getElementById('profile-verified');
          if (verifiedEl && userData.isVerified) {
            verifiedEl.style.display = 'inline-block';
          }
          
          // Set full name
          const fullnameEl = document.getElementById('profile-fullname');
          if (fullnameEl) {
            const fullName = userData.fullName || userData.additionalName ||
                            (userData.firstName && userData.lastName ? 
                             `${userData.firstName} ${userData.lastName}` : '');
            if (fullName) {
              fullnameEl.textContent = fullName;
              fullnameEl.style.display = 'block';
            }
          }
          
          // Set headline
          const headlineEl = document.getElementById('profile-headline');
          if (headlineEl && userData.headline) {
            headlineEl.textContent = userData.headline;
            headlineEl.style.display = 'block';
          }
          
          // Set description
          const descriptionEl = document.getElementById('profile-description');
          if (descriptionEl && (userData.description || userData.overview)) {
            descriptionEl.textContent = userData.description || userData.overview;
            descriptionEl.style.display = 'block';
          }
          
          // Set professional info
          const professionalEl = document.getElementById('profile-professional');
          let hasProfessionalInfo = false;
          
          if (userData.profession) {
            const professionEl = document.getElementById('profile-profession');
            const container = document.getElementById('profession-container');
            if (professionEl && container) {
              professionEl.textContent = userData.profession;
              container.style.display = 'flex';
              hasProfessionalInfo = true;
            }
          }
          
          if (userData.company) {
            const companyEl = document.getElementById('profile-company');
            const container = document.getElementById('company-container');
            if (companyEl && container) {
              companyEl.textContent = userData.company;
              container.style.display = 'flex';
              hasProfessionalInfo = true;
            }
          }
          
          if (userData.industry) {
            const industryEl = document.getElementById('profile-industry');
            const container = document.getElementById('industry-container');
            if (industryEl && container) {
              industryEl.textContent = userData.industry;
              container.style.display = 'flex';
              hasProfessionalInfo = true;
            }
          }
          
          if (hasProfessionalInfo && professionalEl) {
            professionalEl.style.display = 'block';
          }
          
          // Set location
          const locationEl = document.getElementById('profile-location');
          const locationContainer = document.getElementById('location-container');
          if (locationEl && locationContainer) {
            const location = userData.location || userData.city || userData.country;
            if (location) {
              locationEl.textContent = location;
              locationContainer.style.display = 'flex';
            }
          }
          
          // Set website
          const websiteEl = document.getElementById('profile-website');
          const websiteContainer = document.getElementById('website-container');
          if (websiteEl && websiteContainer && userData.website) {
            const website = userData.website.startsWith('http') ? userData.website : `https://${userData.website}`;
            websiteEl.href = website;
            websiteEl.textContent = userData.website;
            websiteContainer.style.display = 'flex';
          }
          
          // Set joined date
          const joinedEl = document.getElementById('profile-joined');
          if (joinedEl) {
            const joinedDate = userData.joinedAt || userData.createdAt;
            if (joinedDate) {
              const date = new Date(joinedDate);
              joinedEl.textContent = `Joined ${date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}`;
            }
          }
          
          console.log('[ProfileScreen] Profile header populated successfully');
          
        } catch (error) {
          console.error('[ProfileScreen] Error populating profile header:', error);
        }
      }
      
      // Load profile stats
      async function loadProfileStats(userData, isOwn) {
        try {
          console.log('[ProfileScreen] Loading profile stats...');
          
          // Calculate stats from userData
          const stats = {
            places: (userData.visitHistory?.length || 0) + (userData.savedStores?.length || 0),
            contributions: (userData.impressionsLiked?.length || 0) + (userData.impressionsDisliked?.length || 0),
            followers: userData.followers?.length || 0,
            following: userData.following?.length || 0,
            reviews: userData.impressionsLiked?.length || 0,
            endorsements: userData.endorsements?.length || 0
          };
          
          // Update stat elements
          const placesCount = document.getElementById('places-count');
          const contributionsCount = document.getElementById('contributions-count');
          const followersCount = document.getElementById('followers-count');
          const followingCount = document.getElementById('following-count');
          const reviewsCount = document.getElementById('reviews-count');
          const endorsementsCount = document.getElementById('endorsements-count');
          
          if (placesCount) placesCount.textContent = stats.places;
          if (contributionsCount) contributionsCount.textContent = stats.contributions;
          if (followersCount) followersCount.textContent = stats.followers;
          if (followingCount) followingCount.textContent = stats.following;
          if (reviewsCount) reviewsCount.textContent = stats.reviews;
          if (endorsementsCount) endorsementsCount.textContent = stats.endorsements;
          
          // Update Neumadic Stars (karma system)
          const neuradicStars = document.getElementById('neumadic-stars');
          if (neuradicStars) {
            const starCount = userData.neuradicStars || Math.floor((stats.contributions * 2) + (stats.reviews * 5));
            neuradicStars.textContent = `${starCount} Neumadic Stars`;
          }
          
          console.log('[ProfileScreen] Stats loaded:', stats);
          
        } catch (error) {
          console.error('[ProfileScreen] Error loading stats:', error);
        }
      }
      
      // Load own profile content (authenticated user)
      async function loadOwnProfileContent() {
        try {
          console.log('[ProfileScreen] Loading own profile content...');
          
          // Load activity content
          await loadActivityContent(true);
          
          // Load places content  
          await loadPlacesContent(true);
          
          // Load posts content
          await loadPostsContent(true);
          
        } catch (error) {
          console.error('[ProfileScreen] Error loading own profile content:', error);
        }
      }
      
      // Load public profile content (other users)
      async function loadPublicProfileContent(username) {
        try {
          console.log('[ProfileScreen] Loading public profile content for:', username);
          
          // Load public activity content
          await loadActivityContent(false, username);
          
          // Load public places content  
          await loadPlacesContent(false, username);
          
          // Load public posts content
          await loadPostsContent(false, username);
          
        } catch (error) {
          console.error('[ProfileScreen] Error loading public profile content:', error);
        }
      }
      
      // Load activity content
      async function loadActivityContent(isOwn, username = null) {
        try {
          const activityContent = document.getElementById('activity-content');
          if (!activityContent) return;
          
          if (isOwn) {
            // Load own activity from main server
            const response = await fetch(`${AUTHSERVER_URL}/api/user/store`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log('[ProfileScreen] Activity data:', data);
              
              let activityHTML = '<div class="activity-feed">';
              
              // Current check-in
              if (data.currentStore) {
                activityHTML += `
                  <div class="activity-item current-checkin">
                    <div class="activity-icon">
                      <i class="icon-check-circle"></i>
                    </div>
                    <div class="activity-content">
                      <h4>Currently checked in</h4>
                      <p>You're currently at a location</p>
                      <span class="activity-time">Now</span>
                    </div>
                  </div>
                `;
              }
              
              // Recent check-ins
              if (data.checkedInStores && data.checkedInStores.length > 0) {
                data.checkedInStores.forEach(checkIn => {
                  const storeInfo = data.stores?.find(store => store.storeId === checkIn.storeId);
                  activityHTML += `
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="icon-map-pin"></i>
                      </div>
                      <div class="activity-content">
                        <h4>Checked in to ${storeInfo?.storeInfo?.storeName || checkIn.storeId}</h4>
                        <p>${storeInfo?.storeInfo?.city || ''}, ${storeInfo?.storeInfo?.state || ''}</p>
                        <span class="activity-time">${new Date(checkIn.checkedInAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  `;
                });
              }
              
              activityHTML += '</div>';
              
              if (data.checkedInStores?.length === 0 && !data.currentStore) {
                activityHTML = '<div class="empty-state"><p>No recent activity</p></div>';
              }
              
              activityContent.innerHTML = activityHTML;
            } else {
              activityContent.innerHTML = '<div class="error-state"><p>Failed to load activity</p></div>';
            }
          } else {
            // Load public activity
            activityContent.innerHTML = '<div class="empty-state"><p>Public activity coming soon</p></div>';
          }
          
        } catch (error) {
          console.error('[ProfileScreen] Error loading activity:', error);
          const activityContent = document.getElementById('activity-content');
          if (activityContent) {
            activityContent.innerHTML = '<div class="error-state"><p>Error loading activity</p></div>';
          }
        }
      }
      
      // Load places content
      async function loadPlacesContent(isOwn, username = null) {
        try {
          const placesContent = document.getElementById('places-content');
          if (!placesContent) return;
          
          if (isOwn) {
            // Load own places from main server
            const response = await fetch(`${SERVER_URL}/api/user/store`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              
              let placesHTML = '<div class="places-grid">';
              
              if (data.stores && data.stores.length > 0) {
                for (const store of data.stores) {
                  try {
                    const storeCardHTML = await createStoreCard.render(store);
                    placesHTML += storeCardHTML;
                  } catch (cardError) {
                    console.warn('[ProfileScreen] Error creating store card:', cardError);
                    placesHTML += `
                      <div class="store-card-fallback">
                        <h5>${store.storeInfo?.storeName || 'Unknown Store'}</h5>
                        <p>${store.storeInfo?.city || ''}, ${store.storeInfo?.state || ''}</p>
                      </div>
                    `;
                  }
                }
              } else {
                placesHTML = '<div class="empty-state"><p>No places visited yet</p></div>';
              }
              
              placesHTML += '</div>';
              placesContent.innerHTML = placesHTML;
              
              // Initialize card effects
              try {
                await createStoreCard.after_render();
              } catch (afterRenderError) {
                console.warn('[ProfileScreen] Error in card after_render:', afterRenderError);
              }
            } else {
              placesContent.innerHTML = '<div class="error-state"><p>Failed to load places</p></div>';
            }
          } else {
            // Load public places
            placesContent.innerHTML = '<div class="empty-state"><p>Public places coming soon</p></div>';
          }
          
        } catch (error) {
          console.error('[ProfileScreen] Error loading places:', error);
          const placesContent = document.getElementById('places-content');
          if (placesContent) {
            placesContent.innerHTML = '<div class="error-state"><p>Error loading places</p></div>';
          }
        }
      }
      
      // Load posts content  
      async function loadPostsContent(isOwn, username = null) {
        try {
          const postsContent = document.getElementById('posts-content');
          if (!postsContent) return;
          
          // TODO: Implement blog posts loading from main server
          postsContent.innerHTML = '<div class="empty-state"><p>Blog posts coming soon</p></div>';
          
        } catch (error) {
          console.error('[ProfileScreen] Error loading posts:', error);
          const postsContent = document.getElementById('posts-content');
          if (postsContent) {
            postsContent.innerHTML = '<div class="error-state"><p>Error loading posts</p></div>';
          }
        }
      }
      
      // FIXED: Set up profile editing handlers (own profile only) - Navigate to settings page
      function setupProfileEditHandlers() {
        try {
          console.log('[ProfileScreen] Setting up profile edit handlers...');
          
          const editProfileBtn = document.getElementById('edit-profile-btn');
          
          // FIXED: Edit profile button - Navigate to settings page
          if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
              console.log('[ProfileScreen] Edit profile clicked - navigating to settings');
              // Navigate to settings page using SPA routing
              window.history.pushState({}, '', `/@${currentUsername}/setting`);
              // Trigger router to handle the route change
              window.dispatchEvent(new PopStateEvent('popstate'));
            });
          }
          
          console.log('[ProfileScreen] Profile edit handlers set up successfully');
          
        } catch (error) {
          console.error('[ProfileScreen] Error setting up profile edit handlers:', error);
        }
      }
      
      // Set up public profile handlers (other users)
      function setupPublicProfileHandlers(username) {
        try {
          console.log('[ProfileScreen] Setting up public profile handlers for:', username);
          
          const followBtn = document.getElementById('follow-btn');
          const messageBtn = document.getElementById('message-btn');
          const endorseBtn = document.getElementById('endorse-btn');
          
          // Follow button
          if (followBtn) {
            followBtn.addEventListener('click', () => {
              console.log('[ProfileScreen] Follow clicked for:', username);
              // TODO: Implement follow functionality
              alert('Follow functionality coming soon!');
            });
          }
          
          // Message button
          if (messageBtn) {
            messageBtn.addEventListener('click', () => {
              console.log('[ProfileScreen] Message clicked for:', username);
              // TODO: Implement messaging functionality
              alert('Messaging functionality coming soon!');
            });
          }
          
          // Endorse button
          if (endorseBtn) {
            endorseBtn.addEventListener('click', () => {
              console.log('[ProfileScreen] Endorse clicked for:', username);
              // TODO: Implement endorsement functionality
              alert('Endorsement functionality coming soon!');
            });
          }
          
          console.log('[ProfileScreen] Public profile handlers set up successfully');
          
        } catch (error) {
          console.error('[ProfileScreen] Error setting up public profile handlers:', error);
        }
      }
      
      // Setup tab navigation
      function setupTabNavigation() {
        try {
          console.log('[ProfileScreen] Setting up tab navigation...');
          
          const tabButtons = document.querySelectorAll('.tab-btn');
          const tabContents = document.querySelectorAll('.tab-content');
          
          tabButtons.forEach(button => {
            button.addEventListener('click', () => {
              const tabName = button.getAttribute('data-tab');
              
              // Remove active class from all buttons and contents
              tabButtons.forEach(btn => btn.classList.remove('active'));
              tabContents.forEach(content => content.classList.remove('active'));
              
              // Add active class to clicked button and corresponding content
              button.classList.add('active');
              const targetContent = document.getElementById(`${tabName}-tab`);
              if (targetContent) {
                targetContent.classList.add('active');
              }
              
              console.log('[ProfileScreen] Switched to tab:', tabName);
            });
          });
          
          console.log('[ProfileScreen] Tab navigation set up successfully');
          
        } catch (error) {
          console.error('[ProfileScreen] Error setting up tab navigation:', error);
        }
      }
      
      // Setup filtering
      function setupFiltering() {
        try {
          console.log('[ProfileScreen] Setting up filtering...');
          
          const distanceFilter = document.getElementById('distance-filter');
          const categoryFilter = document.getElementById('category-filter');
          const clearFiltersBtn = document.getElementById('clear-filters-btn');
          
          // Distance filter
          if (distanceFilter) {
            distanceFilter.addEventListener('change', () => {
              const value = distanceFilter.value;
              console.log('[ProfileScreen] Distance filter changed:', value);
              // TODO: Implement distance filtering
            });
          }
          
          // Category filter
          if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
              const value = categoryFilter.value;
              console.log('[ProfileScreen] Category filter changed:', value);
              // TODO: Implement category filtering
            });
          }
          
          // Clear filters
          if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
              console.log('[ProfileScreen] Clear filters clicked');
              if (distanceFilter) distanceFilter.value = 'all';
              if (categoryFilter) categoryFilter.value = 'all';
              // TODO: Reset filtered content
            });
          }
          
          console.log('[ProfileScreen] Filtering set up successfully');
          
        } catch (error) {
          console.error('[ProfileScreen] Error setting up filtering:', error);
        }
      }
    }
  };

export default ProfileScreen;

///////////////////////// END FIXED PROFILE SCREEN WITH PROPER NAVIGATION /////////////////////////