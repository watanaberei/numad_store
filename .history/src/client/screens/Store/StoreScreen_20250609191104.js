///////////////////////// START StoreScreen.js /////////////////////////
// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import * as data from "../../../server/data/data.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../../utils/utils.js";
import { matchBusiness } from "../../components/function/functionMatch.js";

import {
  getStoresNeumadsReview,
  getArticleNeumadsTrail,
  getArticlePost,
  getStore
} from "../../API/api.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";

import * as hero from "../../components/_archive/hero.js";
import * as eyebrow from "../../components/_archive/eyebrow.js";
import * as MapDistance from "../../components/map/MapDistance.js";
import * as Geolocate from "../../components/map/geo/Geolocate.js";
import * as section from "../../components/_archive/section.js";
import * as experience from "../../components/_archive/experience.js";
import * as GeolocationRange from "../../components/map/geo/GeolocationRange.js";
import * as service from "../../components/_archive/service.js";
import * as facility from "../../components/_archive/facility.js";
import * as panel from "../../components/_archive/panel.js";
import * as sidebar from "../../components/sidebar/sidebar.js";
import * as suggestion from "../../components/_archive/suggestion.js";
import { modals } from "../../components/modal/modal.js";
import { controlUser } from "../../components/controls/controls.js";
import * as components from "../../components/components.js";

import mapboxgl from "mapbox-gl";
import { initMap } from "../../components/map/MapApi.js";
import { storePopularTimes } from "../../components/_archive/StorePopularTimes.js";
import { thumbnail } from "../../components/media/_archive/media.js";
import * as array from "../../components/array/array.js";
import { getDatabase } from "../../../server/data/mongodb/mongodb.js";

import userApi from '../../API/userApi.js';

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
      // Adjust the code as per your actual data structure and needs
    },
    [INLINES.HYPERLINK]: (node, next) => {
      // Adjust the code as per your actual data structure and needs
    },
    [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
      // Adjust the code as per your actual data structure and needs
    }
  }
};

let store = "";

// Fix socket connection - use correct port
const socket = io("http://localhost:4500");

const StoreScreen = {
  render: async () => {
    try {
      // 1. Get the request parameters
      const request = parseRequestUrl();
      console.log("[StoreScreen] Getting store for slug:", request.slug);

      let store = null;
      
      // 2. First try to fetch from MongoDB
      try {
        console.log("[StoreScreen] Checking MongoDB for store data...");
        const mongoResponse = await fetch(
          `http://localhost:4500/api/stores/${request.slug}`
        );
        
        if (mongoResponse.ok) {
          const mongoData = await mongoResponse.json();
          if (mongoData.success && mongoData.store) {
            console.log("[StoreScreen] Found store in MongoDB:", mongoData.store.hero?.storeName);
            store = mongoData.store;
          }
        }
      } catch (error) {
        console.error("[StoreScreen] Error fetching from MongoDB:", error);
      }

      // 3. If not in MongoDB, fetch from local data source
      if (!store) {
        console.log("[StoreScreen] Store not in MongoDB, fetching from local data...");
        const storeData = new data.StoreData();
        store = await storeData.store(request.slug);
        
        if (!store) {
          console.log("[StoreScreen] Store not found in local data either, creating placeholder");
          store = createPlaceholderStore(request.slug);
        }
        
        // 4. Save to MongoDB for future use
        await syncStoreToMongoDB(store, request.slug);
      }

      // 5. Extract and validate data sections
      const {
        hero = {},
        overview = [],
        service = {},
        experience = {},
        location = {},
        business = {},
        categoryData = {},
        mapRadiusData = {}
      } = store || {};

      // Ensure overview is an array
      const overviewData = Array.isArray(overview) ? overview[0] || {} : overview;

      console.log("[StoreScreen] Store sections:", {
        hero: hero,
        overview: overviewData,
        service: service,
        experience: experience,
        location: location,
        business: business
      });

      // 6. Handle distance calculation
      let storeDistance = "Unknown";
      try {
        const userCoordinates = await getUserCoordinates();
        if (userCoordinates && location?.neighborhood?.geolocation) {
          const storeLocation = [
            location.neighborhood.geolocation.lon,
            location.neighborhood.geolocation.lat
          ];
          
          const locations = [
            { name: "userLocation", coordinates: userCoordinates },
            { name: "storeLocation", coordinates: storeLocation }
          ];
          
          storeDistance = GeolocationRange.storeDistance.render(locations);
        }
      } catch (error) {
        console.error("[StoreScreen] Error calculating distance:", error);
      }

      // 7. Generate HTML
      return `
        <div id="store" class="main col05 grid05">
          <div id="section" class="store hero col05">
            <div class="col05 array content" id="store-hero">
              ${components.storeHero.render(hero)}
            </div>
          </div>
          
          <div id="container" class="content col05">
            <div id="container" class="primary col04 store">
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-overview">
                  ${components.storeOverview.render(overviewData)}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-experience">
                  ${components.storeExperience.render(experience)}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-service">
                  ${components.storeService.render(service)}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-business">
                  ${components.storeBusiness.render(business)}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-location">
                  ${components.storeLocation.render({
                    ...location,
                    mapRadius: mapRadiusData
                  })}
                </div>
              </div>
            </div>
            <div id="store-details" class="secondary col01 store store-details">
              ${sidebar.storeDetails.render(hero)}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error("[StoreScreen] Error:", error);
      return `<div class="error-container">Error loading store: ${error.message}</div>`;
    }
  },

  after_render: async () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    sidebar.storeDetails.afterRender();

    // Get current store slug
    const request = parseRequestUrl();
    const storeSlug = request.slug;

    // Initialize user state
    await initializeUserState(storeSlug);

    // Setup event listeners
    setupEventListeners(storeSlug);

    // Setup socket listeners
    setupSocketListeners(storeSlug);

    // Initialize map if needed
    initializeMap();

    // Initialize modals
    initializeModals();
  }
};

// Helper functions

function createPlaceholderStore(slug) {
  console.log(`[StoreScreen] Creating placeholder store for slug: ${slug}`);
  
  const parts = slug.split('_');
  const state = parts[0] || 'ca';
  const location = parts.length > 1 ? parts[1].replace(/-/g, ' ') : 'Unknown Location';
  const storeName = parts.length > 2 ? parts[2].replace(/-/g, ' ') : 'Unknown Store';
  
  return {
    slug: slug,
    hero: {
      storeName: storeName.charAt(0).toUpperCase() + storeName.slice(1),
      storeType: "Coffee Shop",
      rating: "0",
      price: "$$",
      costEstimate: "5-10",
      distance: "Unknown",
      city: location.charAt(0).toUpperCase() + location.slice(1),
      state: state.toUpperCase(),
      gallery: []
    },
    overview: [{
      header: "Overview",
      summary: {
        experienceScore: "0",
        experience: [],
        serviceScore: "0",
        service: [],
        businessScore: "0",
        business: [],
        locationScore: "0",
        location: []
      },
      text: {
        title: "Store Information",
        content: "Store information is currently being collected."
      },
      footer: {
        contributionsCount: 0,
        modifiedDate: new Date().toLocaleDateString(),
        modifiedTime: "0",
        commentsCount: 0,
        reviewsCount: 0,
        likesCount: 0,
        dislikesCount: 0
      }
    }],
    experience: {
      header: "Experience",
      area: { item: [] },
      attribute: {
        bestfor: [],
        working: [],
        environment: [],
        facility: []
      },
      text: {
        title: "Experience",
        content: "Experience details coming soon."
      },
      footer: {
        contributionsCount: 0,
        modifiedDate: new Date().toLocaleDateString()
      }
    },
    service: {
      header: "Service",
      category: {},
      text: {
        title: "Service",
        content: "Service details coming soon."
      },
      footer: {
        contributionsCount: 0,
        modifiedDate: new Date().toLocaleDateString()
      }
    },
    business: {
      header: "Business",
      footer: {
        contributionsCount: 0,
        modifiedDate: new Date().toLocaleDateString()
      }
    },
    location: {
      header: location.charAt(0).toUpperCase() + location.slice(1),
      neighborhood: {
        address: "Address information coming soon",
        city: location.charAt(0).toUpperCase() + location.slice(1),
        state: state.toUpperCase(),
        geolocation: { lat: 33.6, lon: -117.9 }
      },
      mapRadius: {},
      footer: {
        contributionsCount: 0,
        modifiedDate: new Date().toLocaleDateString()
      }
    }
  };
}

async function syncStoreToMongoDB(store, slug) {
  try {
    console.log("[StoreScreen] Syncing store data to MongoDB...");
    
    const completeStoreData = {
      ...store,
      slug: slug,
      lastUpdated: new Date()
    };

    const response = await fetch(
      `http://localhost:4500/api/stores/sync/${slug}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(completeStoreData)
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("[StoreScreen] Store synced to MongoDB:", result);
    } else {
      console.error("[StoreScreen] Failed to sync to MongoDB:", response.status);
    }
  } catch (error) {
    console.error("[StoreScreen] Error syncing to MongoDB:", error);
  }
}

async function getUserCoordinates() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          console.log("[StoreScreen] User coordinates:", coords);
          resolve(coords);
        },
        (error) => {
          console.error("[StoreScreen] Geolocation error:", error);
          resolve(null);
        }
      );
    } else {
      console.log("[StoreScreen] Geolocation not available");
      resolve(null);
    }
  });
}

async function initializeUserState(storeSlug) {
  const accessToken = localStorage.getItem("accessToken");
  
  if (!accessToken) {
    console.log("[StoreScreen] No access token, user not logged in");
    return;
  }

  try {
    // Check user's check-in status
    const checkInResponse = await fetch(
      "http://localhost:4500/api/store/checkin/status",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (checkInResponse.ok) {
      const data = await checkInResponse.json();
      console.log("[StoreScreen] Check-in status:", data);

      if (data.success && data.checkedInStore === storeSlug) {
        updateCheckInUI(true);
        window.userCheckedInStatus = true;
      } else {
        window.userCheckedInStatus = false;
      }
    }

    // Get user's impression data
    const impressionResponse = await fetch(
      `http://localhost:4500/api/user/impressions/${storeSlug}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (impressionResponse.ok) {
      const userData = await impressionResponse.json();
      console.log("[StoreScreen] User impression data:", userData);

      if (userData.success) {
        updateImpressionUI(userData.hasLiked, userData.hasDisliked);
      }
    }
  } catch (error) {
    console.error("[StoreScreen] Error initializing user state:", error);
  }
}

function updateCheckInUI(isCheckedIn) {
  const checkinButton = document.getElementById("storeControls-checkin");
  const impressionsContainer = document.getElementById("impressions");

  if (checkinButton) {
    if (isCheckedIn) {
      checkinButton.classList.add("checked-in");
      checkinButton.querySelector("span").textContent = "Checked-in";
    } else {
      checkinButton.classList.remove("checked-in");
      checkinButton.querySelector("span").textContent = "Check-in";
    }
  }

  if (impressionsContainer) {
    if (isCheckedIn) {
      impressionsContainer.classList.remove("disabled");
      const buttons = impressionsContainer.querySelectorAll(".impression-button");
      buttons.forEach(button => {
        button.removeAttribute("disabled");
        button.classList.remove("disabled");
      });
    } else {
      impressionsContainer.classList.add("disabled");
      const buttons = impressionsContainer.querySelectorAll(".impression-button");
      buttons.forEach(button => {
        button.setAttribute("disabled", "disabled");
        button.classList.add("disabled");
      });
    }
  }
}

function updateImpressionUI(hasLiked, hasDisliked) {
  if (hasLiked) {
    const likeButton = document.getElementById("userImpressionslike");
    if (likeButton) likeButton.classList.add("active");
  }

  if (hasDisliked) {
    const dislikeButton = document.getElementById("userImpressionsdislike");
    if (dislikeButton) dislikeButton.classList.add("active");
  }
}

function setupEventListeners(storeSlug) {
  // Impression button listeners
  const impressionButtons = document.querySelectorAll(".impression-button");
  impressionButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const action = button.classList.contains("like") ? "like" : "dislike";
      await handleImpression(storeSlug, action);
    });
  });
}

function setupSocketListeners(storeSlug) {
  socket.on("impression_update", (data) => {
    console.log("[Socket] Received impression update:", data);
    if (data && data.storeId === storeSlug) {
      updateImpressionCounts(data.likes, data.dislikes);
    }
  });

  socket.on("user_checkin", (data) => {
    console.log(`[Socket] User checked in to store ${data.storeId}`);
    if (data.storeId === storeSlug) {
      updateCheckInUI(true);
    }
  });

  socket.on("user_checkout", (data) => {
    console.log(`[Socket] User checked out from store ${data.storeId}`);
    if (data.storeId === storeSlug) {
      updateCheckInUI(false);
    }
  });
}

function updateImpressionCounts(likes, dislikes) {
  const likeButton = document.getElementById("userImpressionslike");
  const dislikeButton = document.getElementById("userImpressionsdislike");

  if (likeButton) {
    const countElement = likeButton.querySelector(".count");
    if (countElement) countElement.textContent = likes || 0;
  }

  if (dislikeButton) {
    const countElement = dislikeButton.querySelector(".count");
    if (countElement) countElement.textContent = dislikes || 0;
  }
}

async function handleImpression(storeId, action) {
  try {
    const result = await SendImpression(storeId, action, "overview");
    if (result.success) {
      updateImpressionCounts(result.likes, result.dislikes);
      updateImpressionUI(result.userLiked, result.userDisliked);
    } else {
      alert(result.message || "Failed to update impression");
    }
  } catch (error) {
    console.error("[StoreScreen] Error handling impression:", error);
    alert(error.message || "An error occurred");
  }
}

function initializeMap() {
  if (!document.getElementById("map-container")) return;

  try {
    const map = initMap({
      container: "map-container",
      style: "mapbox://styles/neumad/cm65tcurg005b01stfucq7qil",
      center: [-117.9, 33.6], // Default center
      zoom: 13,
      attributionControl: false
    });

    // Add store marker if location available
    const request = parseRequestUrl();
    // You would get the actual store location from the store data here
  } catch (error) {
    console.error("[StoreScreen] Error initializing map:", error);
  }
}

function initializeModals() {
  const modal = modals.init();
  if (document.getElementById("modal")) {
    modal.init();
  }
}

// Export SendImpression function
export const SendImpression = async (storeId, action, sectionId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('You need to be logged in');
    }
    
    const response = await fetch('http://localhost:4500/api/store/impression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        storeId, 
        action, 
        section: sectionId || 'overview'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('[StoreScreen] Error sending impression:', error);
    throw error;
  }
};

// Store actions
window.storeActions = {
  shareStore: function(storeURL) {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this store!',
        url: storeURL
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(storeURL).then(() => {
        alert('Store link copied to clipboard!');
      }).catch(console.error);
    }
  },

  toggleSaveStore: function(storeName) {
    const saveButton = document.getElementById('storeControls-save');
    if (!saveButton) return;

    if (saveButton.classList.contains('saved')) {
      saveButton.classList.remove('saved');
      saveButton.querySelector('span').textContent = 'Save';
      alert(`${storeName} removed from favorites`);
    } else {
      saveButton.classList.add('saved');
      saveButton.querySelector('span').textContent = 'Saved';
      alert(`${storeName} added to favorites`);
    }
  },

  toggleCheckInStore: async function(storeName) {
    const checkinButton = document.getElementById('storeControls-checkin');
    if (!checkinButton) {
      console.error('[StoreScreen] Check-in button not found');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('You need to be logged in to check in. Please log in first.');
      return;
    }

    // Prevent multiple clicks
    if (checkinButton.dataset.processing === 'true') {
      return;
    }
    checkinButton.dataset.processing = 'true';

    const request = parseRequestUrl();
    const storeId = request.slug;
    const isCheckingOut = checkinButton.classList.contains('checked-in');
    const action = isCheckingOut ? 'checkout' : 'checkin';

    // Update UI optimistically
    updateCheckInUI(!isCheckingOut);

    try {
      const response = await fetch('http://localhost:4500/api/store/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          storeId: storeId,
          action: action
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[StoreScreen] Check-in response:', data);
      
      // Update global state
      window.userCheckedInStatus = !isCheckingOut;
      
    } catch (error) {
      console.error('[StoreScreen] Check-in error:', error);
      // Revert UI on error
      updateCheckInUI(isCheckingOut);
      alert(`Error: ${error.message}. Please try again.`);
    } finally {
      checkinButton.dataset.processing = 'false';
    }
  },

  toggleImpression: async function(storeId, type, section = "overview") {
    const impressionButton = document.getElementById(`userImpressions${type}`);
    const otherType = type === 'like' ? 'dislike' : 'like';
    const otherButton = document.getElementById(`userImpressions${otherType}`);

    if (!impressionButton) {
      console.error(`[StoreScreen] Impression button not found: userImpressions${type}`);
      return;
    }

    // Check if user is checked in
    if (!window.userCheckedInStatus) {
      alert('You need to check in to the store first before liking or disliking!');
      return;
    }

    const isActive = impressionButton.classList.contains('active');

    // Optimistic UI update
    if (isActive) {
      impressionButton.classList.remove('active');
    } else {
      impressionButton.classList.add('active');
      if (otherButton && otherButton.classList.contains('active')) {
        otherButton.classList.remove('active');
      }
    }

    try {
      const result = await SendImpression(storeId, type, section);
      
      if (result.success) {
        updateImpressionCounts(result.likes, result.dislikes);
        updateImpressionUI(result.userLiked, result.userDisliked);
      } else {
        // Revert UI on failure
        if (isActive) {
          impressionButton.classList.add('active');
        } else {
          impressionButton.classList.remove('active');
          if (otherButton && !isActive) {
            otherButton.classList.add('active');
          }
        }
        alert(result.message || 'Failed to update impression');
      }
    } catch (error) {
      console.error('[StoreScreen] Error updating impression:', error);
      // Revert UI on error
      if (isActive) {
        impressionButton.classList.add('active');
      } else {
        impressionButton.classList.remove('active');
        if (otherButton && !isActive) {
          otherButton.classList.add('active');
        }
      }
      alert(error.message || 'An error occurred. Please try again.');
    }
  }
};

export default StoreScreen;
///////////////////////// END StoreScreen.js /////////////////////////