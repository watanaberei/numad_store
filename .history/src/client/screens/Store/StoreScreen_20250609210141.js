///////////////////////// START FIXED StoreScreen.js /////////////////////////
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

// FIX 1: Correct socket connection to server port
console.log("[StoreScreen] Initializing socket connection to port 4500");
const socket = io("http://localhost:4500");

let store = "";

const StoreScreen = {
  render: async () => {
    try {
      // 1. Get the request parameters
      const request = parseRequestUrl();
      console.log("[StoreScreen] Getting store for slug:", request.slug);

      // 2. Initialize StoreData and get store data
      const storeData = new data.StoreData();
      
      // FIX 2: First try to get data from MongoDB
      let store = null;
      console.log("[StoreScreen] Checking MongoDB first for store data...");
      
      try {
        const mongoResponse = await fetch(
          `http://localhost:4500/api/stores/${request.slug}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        
        if (mongoResponse.ok) {
          const mongoData = await mongoResponse.json();
          if (mongoData.success && mongoData.store) {
            console.log("[StoreScreen] Found store in MongoDB:", mongoData.store.title);
            store = mongoData.store;
          }
        }
      } catch (mongoError) {
        console.log("[StoreScreen] MongoDB fetch failed, will try local data:", mongoError.message);
      }

      // 3. If not in MongoDB, get from local data
      if (!store) {
        console.log("[StoreScreen] Fetching from local data source...");
        store = await storeData.store(request.slug);
        console.log("[StoreScreen] Store data from local:", store);
      }

      // 4. If we have store data (from either source), sync to MongoDB
      if (store && store.hero) {
        try {
          console.log("[StoreScreen] Syncing store data to MongoDB...");
          
          const syncResponse = await fetch(
            `http://localhost:4500/api/stores/sync/${request.slug}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(store)
            }
          );
          
          if (syncResponse.ok) {
            const syncResult = await syncResponse.json();
            console.log("[StoreScreen] Store synced to MongoDB:", syncResult);
          } else {
            console.error("[StoreScreen] Failed to sync to MongoDB:", syncResponse.status);
          }
        } catch (syncError) {
          console.error("[StoreScreen] Error syncing to MongoDB:", syncError);
          // Continue rendering even if sync fails
        }
      }

      // 5. If still no store data, create a placeholder
      if (!store || !store.hero) {
        console.warn(`[StoreScreen] No store data found for slug: ${request.slug}, creating placeholder`);
        store = storeData.createDefaultStore(request.slug);
      }

      // 6. Record store visit if user is logged in
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken && store) {
        try {
          const visitResponse = await fetch(
            `http://localhost:4500/api/stores/${request.slug}/visit`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (visitResponse.ok) {
            console.log("[StoreScreen] Visit recorded");
          }
        } catch (error) {
          console.error("[StoreScreen] Failed to record visit:", error);
        }
      }

      // 7. Extract and format data for components - with proper fallbacks
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

      console.log("[StoreScreen] Store sections ready for rendering:", {
        hero: !!hero,
        overview: !!overview,
        service: !!service,
        experience: !!experience,
        location: !!location,
        business: !!business
      });

      ////////////// DISTANCE CALCULATION //////////////
      let userCoordinates = null;
      const coordinateUser = () => {
        return new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                userCoordinates = [
                  position.coords.longitude,
                  position.coords.latitude
                ];
                resolve(userCoordinates);
              },
              (error) => {
                console.warn("[StoreScreen] Geolocation error:", error);
                resolve(null); // Resolve with null instead of rejecting
              }
            );
          } else {
            console.log("[StoreScreen] Geolocation not available");
            resolve(null);
          }
        });
      };

      // FIX 3: Safely access location data
      const storeLocation = location?.neighborhood?.geolocation ? [
        location.neighborhood.geolocation.lon || -117.9,
        location.neighborhood.geolocation.lat || 33.6
      ] : [-117.9, 33.6]; // Default to Southern California

      const userLocation = await coordinateUser();
      
      let storeDistance = "Unknown";
      if (userLocation && storeLocation) {
        const Location = [
          { name: "userLocation", coordinates: userLocation },
          { name: "storeLocation", coordinates: storeLocation }
        ];
        
        try {
          storeDistance = GeolocationRange.storeDistance.render(Location);
          console.log("[StoreScreen] Calculated distance:", storeDistance);
        } catch (error) {
          console.error("[StoreScreen] Error calculating distance:", error);
        }
      }

      // 8. Generate HTML for each section
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
                  ${components.storeOverview.render(overview)}
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
      console.error("[StoreScreen] Critical error:", error);
      return `
        <div class="error-container">
          <h2>Error Loading Store</h2>
          <p>We encountered an error loading this store. Please try again later.</p>
          <p class="error-details">${error.message}</p>
        </div>
      `;
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

    // FIX 4: Update all API calls to use correct port
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        // Check if user is already checked-in to this store
        const response = await fetch(
          "http://localhost:4500/api/store/checkin/status",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("[StoreScreen] Check-in status:", data);

          if (data.success && data.checkedInStore === storeSlug) {
            console.log(`[StoreScreen] User is already checked in to ${storeSlug}`);

            // Update UI to show checked-in state
            const checkinButton = document.getElementById("storeControls-checkin");
            const impressions = document.getElementById("impressions");

            if (checkinButton && !checkinButton.classList.contains("checked-in")) {
              checkinButton.classList.add("checked-in");
              checkinButton.querySelector("span").textContent = "Checked-in";
            }

            if (impressions && impressions.classList.contains("disabled")) {
              impressions.classList.remove("disabled");
              
              // Enable impression buttons
              const impressionButtons = document.querySelectorAll(".impression-button");
              impressionButtons.forEach((button) => {
                button.removeAttribute("disabled");
                button.classList.remove("disabled");
              });
            }

            window.userCheckedInStatus = true;
          } else {
            console.log(`[StoreScreen] User is not checked in to ${storeSlug}`);
            window.userCheckedInStatus = false;
          }
        }
      } catch (error) {
        console.error("Error fetching check-in status:", error);
      }
    }

    // Also fetch user impression data
    if (accessToken) {
      try {
        const userResponse = await fetch(
          `http://localhost:4500/api/user/impressions/${storeSlug}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("[StoreScreen] User impression data:", userData);

          // Update impression buttons based on user data
          if (userData.success) {
            if (userData.hasLiked) {
              const likeButton = document.getElementById("userImpressionslike");
              if (likeButton) likeButton.classList.add("active");
            }

            if (userData.hasDisliked) {
              const dislikeButton = document.getElementById("userImpressionsdislike");
              if (dislikeButton) dislikeButton.classList.add("active");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user impression data:", error);
      }
    }

    // Update impression button event listeners
    const impressionButtons = document.querySelectorAll(".impression-button");
    impressionButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const storeId = button.dataset.storeId || storeSlug;
        const action = button.classList.contains("like") ? "like" : "dislike";
        await StoreScreen.handleImpression(storeId, action);
      });
    });

    // Socket.io listeners for real-time updates
    socket.on("impression_update", (data) => {
      console.log("[StoreScreen] Received impression update:", data);
      if (data && data.storeId) {
        StoreScreen.updateImpressionUI(data.storeId, data.likes, data.dislikes);
      }
    });

    socket.on("user_checkin", (data) => {
      console.log(`[StoreScreen] User checked in to store ${data.storeId}`);
      const currentStoreSlug = parseRequestUrl().slug;
      if (data.storeId === currentStoreSlug) {
        const impressionsContainer = document.getElementById("impressions");
        if (impressionsContainer) {
          impressionsContainer.classList.remove("disabled");
        }
      }
    });

    socket.on("user_checkout", (data) => {
      console.log(`[StoreScreen] User checked out from store ${data.storeId}`);
      const currentStoreSlug = parseRequestUrl().slug;
      if (data.storeId === currentStoreSlug) {
        const impressionsContainer = document.getElementById("impressions");
        if (impressionsContainer) {
          impressionsContainer.classList.add("disabled");
        }
      }
    });

    // Initialize map if store location is available
    try {
      const mapContainer = document.getElementById("map-container");
      if (mapContainer) {
        // Get store location from the page data
        const storeData = window.storeData || {};
        const location = storeData.location || {};
        const storeCoords = location.neighborhood?.geolocation || { lat: 33.6, lon: -117.9 };
        
        const map = initMap({
          container: "map-container",
          style: "mapbox://styles/neumad/cm65tcurg005b01stfucq7qil",
          center: [storeCoords.lon, storeCoords.lat],
          zoom: 13,
          attributionControl: false
        });

        new mapboxgl.Marker()
          .setLngLat([storeCoords.lon, storeCoords.lat])
          .addTo(map);
          
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(new mapboxgl.LngLat(storeCoords.lon, storeCoords.lat));
        map.fitBounds(bounds, { padding: 50, duration: 1000 });
      }
    } catch (error) {
      console.error("[StoreScreen] Error initializing map:", error);
    }

    // Initialize modals
    const modal = modals.init();

    // Initialize popular times chart if container exists
    const chartsContainer = document.getElementById("chartsContainer");
    if (chartsContainer) {
      try {
        const popularTimesData = store?.popularTimes || [];
        if (popularTimesData.length > 0) {
          storePopularTimes(popularTimesData);
        }
      } catch (error) {
        console.error("[StoreScreen] Error initializing popular times:", error);
      }
    }
  },

  handleImpression: async (storeId, action) => {
    try {
      const response = await SendImpression(storeId, action);
      if (response.success) {
        StoreScreen.updateImpressionUI(storeId, response.likes, response.dislikes);
      } else {
        throw new Error(response.message || "Failed to update impression");
      }
    } catch (error) {
      console.error("[StoreScreen] Error sending impression:", error);
      alert(error.message);
    }
  },

  updateImpressionUI: (storeId, likes, dislikes) => {
    const likeButton = document.getElementById("userImpressionslike");
    const dislikeButton = document.getElementById("userImpressionsdislike");

    if (likeButton) {
      const countElement = likeButton.querySelector(".count");
      if (countElement) {
        countElement.textContent = likes || 0;
      }
    }
    
    if (dislikeButton) {
      const countElement = dislikeButton.querySelector(".count");
      if (countElement) {
        countElement.textContent = dislikes || 0;
      }
    }
  }
};

export default StoreScreen;

// FIX 5: Update SendImpression to use correct port
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

// FIX 6: Update all storeActions to use correct port
window.storeActions = {
  init() {
    // Initialize if needed
  },

  shareStore: function (storeURL) {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this store!",
          url: storeURL
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(storeURL)
        .then(() => {
          alert("Store link copied to clipboard!");
        })
        .catch(console.error);
    }
  },

  toggleSaveStore: function (storeName) {
    const saveButton = document.getElementById("storeControls-save");
    if (saveButton.classList.contains("saved")) {
      saveButton.classList.remove("saved");
      saveButton.querySelector("span").textContent = "Save";
      alert(`${storeName} removed from favorites`);
    } else {
      saveButton.classList.add("saved");
      saveButton.querySelector("span").textContent = "Saved";
      alert(`${storeName} added to favorites`);
    }
  },

  toggleCheckInStore: function (storeName) {
    const checkinButton = document.getElementById("storeControls-checkin");
    const impressions = document.getElementById("impressions");

    const request = parseRequestUrl();
    const storeId = request.slug;

    if (!checkinButton) {
      console.error("[StoreActions] Check-in button not found");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You need to be logged in to check in. Please log in first.");
      return;
    }

    const isCheckingOut = checkinButton.classList.contains("checked-in");
    const action = isCheckingOut ? "checkout" : "checkin";

    // Update UI immediately
    if (isCheckingOut) {
      checkinButton.classList.remove("checked-in");
      checkinButton.querySelector("span").textContent = "Check-in";
      if (impressions) {
        impressions.classList.add("disabled");
      }

      const impressionButtons = document.querySelectorAll(".impression-button");
      impressionButtons.forEach((button) => {
        button.setAttribute("disabled", "disabled");
        button.classList.add("disabled");
      });
    } else {
      checkinButton.classList.add("checked-in");
      checkinButton.querySelector("span").textContent = "Checked-in";
      if (impressions) {
        impressions.classList.remove("disabled");
      }

      const impressionButtons = document.querySelectorAll(".impression-button");
      impressionButtons.forEach((button) => {
        button.removeAttribute("disabled");
        button.classList.remove("disabled");
      });
    }

    // Send request to server with correct port
    fetch("http://localhost:4500/api/store/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        storeId: storeId,
        action: action
      })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("[StoreActions] Check-in response:", data);
        window.userCheckedInStatus = !isCheckingOut;
      })
      .catch((error) => {
        console.error("[StoreActions] Check-in error:", error);
        // Revert UI changes
        if (isCheckingOut) {
          checkinButton.classList.add("checked-in");
          checkinButton.querySelector("span").textContent = "Checked-in";
          if (impressions) {
            impressions.classList.remove("disabled");
          }
        } else {
          checkinButton.classList.remove("checked-in");
          checkinButton.querySelector("span").textContent = "Check-in";
          if (impressions) {
            impressions.classList.add("disabled");
          }
        }
        alert(`Error: ${error.message}. Please try again.`);
      });
  },

  toggleImpression: async function (storeId, type, section = "overview") {
    const impressionButton = document.getElementById(`userImpressions${type}`);
    const otherType = type === "like" ? "dislike" : "like";
    const otherButton = document.getElementById(`userImpressions${otherType}`);

    if (!impressionButton) {
      console.error(`[StoreActions] Impression button #userImpressions${type} not found`);
      return;
    }

    // Check if user is checked in
    if (!window.userCheckedInStatus) {
      try {
        const response = await fetch(
          "http://localhost:4500/api/store/checkin/status",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (!data.success || data.checkedInStore !== storeId) {
            alert("You need to check in to the store first before liking or disliking!");
            return;
          }
          window.userCheckedInStatus = true;
        } else {
          alert("You need to check in to the store first before liking or disliking!");
          return;
        }
      } catch (error) {
        console.error("[StoreActions] Error checking check-in status:", error);
        alert("You need to check in to the store first before liking or disliking!");
        return;
      }
    }

    const isActive = impressionButton.classList.contains("active");

    // Optimistically update UI
    if (isActive) {
      impressionButton.classList.remove("active");
    } else {
      impressionButton.classList.add("active");
      if (otherButton && otherButton.classList.contains("active")) {
        otherButton.classList.remove("active");
      }
    }

    try {
      const result = await SendImpression(storeId, type, section);

      if (result.success) {
        const likeCount = document.querySelector(`#userImpressionslike .count`);
        const dislikeCount = document.querySelector(`#userImpressionsdislike .count`);

        if (likeCount) {
          likeCount.textContent = result.likes || 0;
        }
        if (dislikeCount) {
          dislikeCount.textContent = result.dislikes || 0;
        }

        impressionButton.classList.toggle("active", 
          type === "like" ? result.userLiked : result.userDisliked
        );

        if (otherButton) {
          otherButton.classList.toggle("active",
            otherType === "like" ? result.userLiked : result.userDisliked
          );
        }
      } else {
        this.revertUIState(impressionButton, otherButton, isActive);
        alert(result.message || "Failed to update impression. Please try again.");
      }
    } catch (error) {
      console.error("[StoreActions] Error updating impression:", error);
      this.revertUIState(impressionButton, otherButton, isActive);
      alert(error.message || "An error occurred. Please try again.");
    }
  },

  revertUIState: function (button, otherButton, wasActive) {
    if (!button) return;

    if (wasActive) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
      if (otherButton && otherButton.classList.contains("active")) {
        otherButton.classList.add("active");
      }
    }
  },

  updateImpressionCount: function (type, count) {
    const button = document.querySelector(`#userImpressions${type}`);
    if (!button) return;

    const countElement = button.querySelector(".count");
    if (countElement) {
      countElement.textContent = count;
    }
  },

  handleImpressionUpdate: function (data) {
    if (!data || !data.storeId) return;
    this.updateImpressionCount("like", data.likes);
    this.updateImpressionCount("dislike", data.dislikes);
  }
};

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  window.storeActions.init();
});
///////////////////////// END FIXED StoreScreen.js /////////////////////////