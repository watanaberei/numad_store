// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import ContenfulData from "../../server/data/contentful/contentful.js";
import { sendImpression } from "../../server/data/contentful/contentfulApi.js";
import * as data from "../../server/data/data.js";
// import * as data from "../../server/data/data_TEMP.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils/utils.js";
import * as yelp from "../../server/data/yelp/yelp.js";
import { matchBusiness } from "../components/function/functionMatch.js";

import {
  getStoresNeumadsReview,
  getArticleNeumadsTrail,
  getArticlePost,
  getStore
} from "../api.js";
// import DataBlog from "../components/DataPost.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";

import * as hero from "../components/_archive/hero.js";
import * as eyebrow from "../components/_archive/eyebrow.js";
import * as MapDistance from "../components/map/MapDistance.js";
import * as Geolocate from "../components/map/geo/Geolocate.js";
import * as section from "../components/_archive/section.js";
import * as experience from "../components/_archive/experience.js";
import * as GeolocationRange from "../components/map/geo/GeolocationRange.js";
import * as service from "../components/_archive/service.js";
import * as facility from "../components/_archive/facility.js";
import * as panel from "../components/_archive/panel.js";
import * as sidebar from "../components/sidebar/sidebar.js";
import * as suggestion from "../components/_archive/suggestion.js";
import { modals } from "../components/modal/modal.js";
import { userControl } from "../components/controls/_archive/UserControls.js";

// import mapNearby from "..components/mapNearby.js";
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/map/MapApi.js";
import { storePopularTimes } from "../components/_archive/StorePopularTimes.js";
import { thumbnail } from "../components/media/_archive/media.js";
import * as components from "../components/components.js";
import * as array from "../components/array/array.js";
import { getDatabase } from "../../server/data/mongodb/mongodb.js";

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

// let Data = new data.store();
// let contentfulData = "";
// let Contentful = new ContenfulData();
// console.log("Contentful", Contentful);

const socket = io("http://localhost:4000");

// let storeData = store;
// console.log("storeData", storeData);

// let yelpData = yelp;
// console.log("yelpData", yelpData);





// const storeOverviewData = store?.overview;
// const storeServiceData = store?.service;
// const storeExperienceData = store?.experience;
// const storeHeroData = store?.hero;
// const yelpData = yelpApi.yelpApi;


// const Data = data.store;
// console.log("storeData", storeData);

// const socket = io('http://localhost:4000');
const StoreScreen = {
  render: async () => {
    console.log("%01:[StoreScreen.render] Starting render");
    
    try {
      // 1. Get the request parameters
      const request = parseRequestUrl();
      console.log("%02:[StoreScreen.render] Request params:", request);

      // 2. Initialize StoreData and get store data
      const storeData = new data.StoreData();
      console.log("%03:[StoreScreen.render] StoreData initialized:", storeData);

      // 3. Get store data using slug
      const store = await storeData.store(request.slug);
      console.log("%04:[StoreScreen.render] Store data:", store);

      if (!store) {
        return `<div>Store not found</div>`;
      }

      // 4. Extract data from store object
      const {
        hero,
        overview,
        service,
        experience,
        location,
        business,
        serviceCategoryData,
        mapRadiusData
      } = store;

      console.log("%05:Store sections:", {
        hero,
        overview,
        service,
        experience,
        location,
        business,
        serviceCategoryData,
        mapRadiusData
      });

      // 5. Generate HTML for each section
      return `
        <div id="store" class="main grid05">
          <div id="section" class="her  o col05">
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
                  ${components.storeService.render({ 
                    ...service,
                    categories: serviceCategoryData?.categories || []
                  })}
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
          </div>
          
          <div id="store-details" class="secondary col01 store store-details">
            ${sidebar.storeDetails.render(hero)}
          </div>
        </div>
      `;

    } catch (error) {
      console.error("[StoreScreen.render] Error:", error);
      return `<div>Error loading store: ${error.message}</div>`;
    }
  },

  after_render: async () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    const StoreData = store;
    // Fetch user data
    const accessToken = localStorage.getItem("accessToken");
    let userData = null;
    try {
      const userResponse = await fetch("http://localhost:4000/api/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (userResponse.ok) {
        userData = await userResponse.json();
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Now pass the userData to userControl.render
    const userControlsHTML = userControl.render(store, {
      totalLikes: userData?.totalLikes || 0,
      totalDislikes: userData?.totalDislikes || 0,
      rating: userData?.rating || 0 // Add this line if 'rating' is needed
    });

    // Update the impression button event listener
    const impressionButtons = document.querySelectorAll(".impression-button");
    impressionButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const storeId = button.dataset.storeId;
        const action = button.classList.contains("like") ? "like" : "dislike";
        await StoreScreen.handleImpression(storeId, action);
      });
    });

    // Socket.io listener for real-time updates
    socket.on("impression_update", (data) => {
      StoreScreen.updateImpressionUI(data.storeId, data.likes, data.dislikes);
    });

    if (!store || !store.someProperty) {
      // Handle error or missing data
      const popularTime = store.popularTimes || [];
      const popularTimes = store.popularTimes || [];
      
      // Ensure storePopularTimes is called after the DOM is fully loaded
      if (document.getElementById("chartsContainer")) {
        // const popularTimesData = [popularTimes]; // Replace with actual data
        const popularTimesData = popularTimes ? [popularTimes] : []; // Replace with actual data
        // // console.log("popularTimesData",popularTimesData);
        storePopularTimes(popularTimesData);
      } else {
        console.error("chartsContainer element not found");
      }

      const modal = modals.init();

      if (document.getElementById("myBtn")) {
        document.addEventListener("DOMContentLoaded", () => {
          modals.init();
        });
      } else {
        console.error("myBtn element not found");
      }
    }

    try {
      // Get MongoDB connection
      const db = await getDatabase();
      const impressions = db.Store('impressions');
      
      // Initialize impression tracking
      const storeId = parseRequestUrl().slug;
      console.log("Tracking impressions for store:", storeId);

      // Record store view impression
      await impressions.insertOne({
        storeId,
        type: 'view',
        timestamp: new Date(),
        // Add any other relevant data
      });
      
      console.log("Store view impression recorded");

    } catch (error) {
      console.error("Error recording impression:", error);
    }
  },
  handleImpression: async (storeId, action) => {
    try {
      const response = await sendImpression(storeId, action);
      if (response.message === "Impression added successfully") {
        StoreScreen.updateImpressionUI(
          storeId,
          response.likes,
          response.dislikes
        );
      } else {
        throw new Error(response.message || "Failed to update impression");
      }
    } catch (error) {
      console.error("Error sending impression:", error);
      alert(error.message);
    }
  },

  updateImpressionUI: (storeId, likes, dislikes) => {
    const likeButton = document.querySelector(
      `.impression-button.like[data-store-id="${storeId}"]`
    );
    const dislikeButton = document.querySelector(
      `.impression-button.dislike[data-store-id="${storeId}"]`
    );

    if (likeButton) {
      likeButton.querySelector(".count").textContent = likes;
    }
    if (dislikeButton) {
      dislikeButton.querySelector(".count").textContent = dislikes;
    }
  }
};

export default StoreScreen;

function getStoreRange(currentRange) {
  if (currentRange >= 0 && currentRange <= 1) {
    return "Closeby";
  } else if (currentRange > 1 && currentRange <= 3) {
    return "Nearby";
  } else if (currentRange > 3 && currentRange <= 6) {
    return "Quick Drive";
  } else if (currentRange > 6 && currentRange <= 12) {
    return "Driving Distance";
  } else if (currentRange > 12 && currentRange <= 21) {
    return "~2hr Drive";
  } else if (currentValue > 12 && currentValue <= 21) {
    return "1hr+ Drive";
  } else {
    return "PACKED";
  }
}

function generateMediaCarouselHTML(mediaGallery, limit) {
  let mediaGalleryHTML = "";
  const summaryText =
    contentfulData.summary &&
    contentfulData.summary.text &&
    contentfulData.summary.text.length
      ? contentfulData.summary.text
      : [];
  // // console.log("SUMMARYDETAILS", summaryText);
  mediaGallery.slice(0, limit).forEach((mediaGalleryItem) => {
    mediaGalleryHTML += `
        <div class="gallery-item">
            <img src="${mediaGalleryItem.url}" class="gallery-item-img" alt="" />
            <div class="gallery-item-details">
                <span class="text03">
                    ${mediaGalleryItem.description}
                </span>
            </div>
        </div>

  `;
  });
  return mediaGalleryHTML;
}

window.storeActions = {
  shareStore: function (storeURL) {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this store!",
          url: storeURL
        })
        .then(() => {
          // console.log("Thanks for sharing!");
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
    // Here you would typically update the user's saved stores in your application state
  },

  toggleCheckInStore: function (storeName) {
    const checkinButton = document.getElementById("storeControls-checkin");
    const userImpression = document.getElementById("userImpression");
    if (checkinButton.classList.contains("checked-in")) {
      checkinButton.classList.remove("checked-in");
      checkinButton.querySelector("span").textContent = "Check-in";
      userImpression.classList.add("disabled");
      alert(`Checked out from ${storeName}`);
    } else {
      checkinButton.classList.add("checked-in");
      checkinButton.querySelector("span").textContent = "Checked-in";
      userImpression.classList.remove("disabled");
      alert(`Checked in to ${storeName}`);
    }
    // Here you would typically update the user's check-in status in your application state
  },

  toggleImpression: async function (storeId, type) {
    const impressionButton = document.querySelector(
      `.impression-button.${type}`
    );
    const otherType = type === "like" ? "dislike" : "like";
    const otherButton = document.querySelector(
      `.impression-button.${otherType}`
    );

    try {
      const response = await fetch("http://localhost:4000/api/impression", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ storeId, action: type })
      });
      const data = await response.json();

      if (data.success) {
        if (impressionButton.classList.contains("active")) {
          impressionButton.classList.remove("active");
        } else {
          impressionButton.classList.add("active");
          otherButton.classList.remove("active");
        }

        this.updateImpressionCount("like", data.likes);
        this.updateImpressionCount("dislike", data.dislikes);
      } else {
        alert(data.message || "Failed to update impression. Please try again.");
      }
    } catch (error) {
      console.error("Error updating impression:", error);
      alert("An error occurred. Please try again.");
    }
  },

  updateImpressionCount: function (type, count) {
    const button = document.querySelector(`.impression-button.${type}`);
    const countSpan = button.querySelector(".count");
    countSpan.textContent = count;
  }
};

// Make ImpressionHandler globally accessible
window.ImpressionHandler = {
  queue: [],
  syncInterval: 5000, // Sync every 5 seconds
  lastSyncTime: 0,

  init() {
    setInterval(() => this.syncWithServer(), this.syncInterval);
    window.addEventListener("beforeunload", () => this.syncWithServer());
  },

  toggleImpression(storeId, type) {
    const impressionButton = document.querySelector(
      `.impression-button.${type}`
    );
    const otherType = type === "like" ? "dislike" : "like";
    const otherButton = document.querySelector(
      `.impression-button.${otherType}`
    );

    // Optimistic UI update
    if (impressionButton.classList.contains("active")) {
      impressionButton.classList.remove("active");
      this.updateImpressionCount(type, -1);
      this.queueImpression(storeId, `un${type}`);
    } else {
      impressionButton.classList.add("active");
      this.updateImpressionCount(type, 1);
      this.queueImpression(storeId, type);
      if (otherButton.classList.contains("active")) {
        otherButton.classList.remove("active");
        this.updateImpressionCount(otherType, -1);
        this.queueImpression(storeId, `un${otherType}`);
      }
    }
  },

  updateImpressionCount(type, change) {
    const button = document.querySelector(`.impression-button.${type}`);
    const countSpan = button.querySelector(".count");
    let count = parseInt(countSpan.textContent) || 0;
    count += change;
    countSpan.textContent = count;
  },

  queueImpression(storeId, action) {
    this.queue.push({ storeId, action, timestamp: Date.now() });
    if (Date.now() - this.lastSyncTime > this.syncInterval) {
      this.syncWithServer();
    }
  },

  async syncWithServer() {
    if (this.queue.length === 0) return;

    const impressionsToSync = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch("/api/sync-impressions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ impressions: impressionsToSync })
      });
      const data = await response.json();

      if (!data.success) {
        console.error("Failed to sync impressions:", data.message);
        // Re-queue failed impressions
        this.queue = [...this.queue, ...impressionsToSync];
      }
    } catch (error) {
      console.error("Error syncing impressions:", error);
      // Re-queue all impressions on error
      this.queue = [...this.queue, ...impressionsToSync];
    }

    this.lastSyncTime = Date.now();
  }
};

// Initialize the impression handler
document.addEventListener("DOMContentLoaded", () => {
  window.ImpressionHandler.init();
});

// // Impression handler
// const ImpressionHandler = {
//   queue: [],
//   syncInterval: 5000, // Sync every 5 seconds
//   lastSyncTime: 0,

//   init() {
//     setInterval(() => this.syncWithServer(), this.syncInterval);
//     window.addEventListener('beforeunload', () => this.syncWithServer());
//   },

//   toggleImpression(storeId, type) {
//     const impressionButton = document.querySelector(`.impression-button.${type}`);
//     const otherType = type === 'like' ? 'dislike' : 'like';
//     const otherButton = document.querySelector(`.impression-button.${otherType}`);

//     // Optimistic UI update
//     if (impressionButton.classList.contains('active')) {
//       impressionButton.classList.remove('active');
//       this.updateImpressionCount(type, -1);
//       this.queueImpression(storeId, `un${type}`);
//     } else {
//       impressionButton.classList.add('active');
//       this.updateImpressionCount(type, 1);
//       this.queueImpression(storeId, type);
//       if (otherButton.classList.contains('active')) {
//         otherButton.classList.remove('active');
//         this.updateImpressionCount(otherType, -1);
//         this.queueImpression(storeId, `un${otherType}`);
//       }
//     }
//   },

//   updateImpressionCount(type, change) {
//     const button = document.querySelector(`.impression-button.${type}`);
//     const countSpan = button.querySelector('.count');
//     let count = parseInt(countSpan.textContent) || 0;
//     count += change;
//     countSpan.textContent = count;
//   },

//   queueImpression(storeId, action) {
//     this.queue.push({ storeId, action, timestamp: Date.now() });
//     if (Date.now() - this.lastSyncTime > this.syncInterval) {
//       this.syncWithServer();
//     }
//   },

//   async syncWithServer() {
//     if (this.queue.length === 0) return;

//     const impressionsToSync = [...this.queue];
//     this.queue = [];

//     try {
//       const response = await fetch('/api/sync-impressions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//         },
//         body: JSON.stringify({ impressions: impressionsToSync })
//       });
//       const data = await response.json();

//       if (!data.success) {
//         console.error('Failed to sync impressions:', data.message);
//         // Re-queue failed impressions
//         this.queue = [...this.queue, ...impressionsToSync];
//       }
//     } catch (error) {
//       console.error('Error syncing impressions:', error);
//       // Re-queue all impressions on error
//       this.queue = [...this.queue, ...impressionsToSync];
//     }

//     this.lastSyncTime = Date.now();
//   }
// };

// // Initialize the impression handler
// ImpressionHandler.init();

// // Update the onclick handlers in your HTML
// // <button class="impression-button like" onclick="ImpressionHandler.toggleImpression('${store.storeId}', 'like')">
// // <button class="impression-button dislike" onclick="ImpressionHandler.toggleImpression('${store.storeId}', 'dislike')">
