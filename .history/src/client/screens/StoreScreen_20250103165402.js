// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import ContenfulData from "../../server/data/contentful/contentful.js";
import { sendImpression } from "../../server/data/contentful/contentfulApi.js";
import * as data from "../../server/data/data.js";
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
    console.log("[StoreScreen.render] Starting render");
    
    try {
      // 1. Get the request parameters
      const request = parseRequestUrl();
      console.log("[StoreScreen.render] Request params:", request);

      // 2. Get store data from data.js
      const storeData = new data.StoreData();
      const store = await storeData.getStoreBySlug(request.slug);
      
      if (!store) {
        return `<div>Store not found</div>`;
      }

      // Extract store data sections
      const storeHeroData = store;
      const storeOverviewData = store?.overview;
      const storeServiceData = store?.service;
      const storeExperienceData = store?.experience;
      const storeLocationData = store?.location;
      const storeBusinessData = store?.business;
      const storeDetailData = store?.detail;

      // Generate HTML for each section
      const storeDetailsHTML = components.storeDetails.render(storeDetailData);
      const storeHeroHTML = components.storeHero.render(storeHeroData);
      const storeOverviewHTML = components.storeOverview.render(storeOverviewData);
      const storeExperienceHTML = components.storeExperience.render(storeExperienceData);
      const storeServiceHTML = components.storeService.render(storeServiceData);

      return `
        <div id="store" class="main grid05">
          <div id="section" class="hero col05">
            <div class="col05 array content" id="store-hero">
              ${storeHeroHTML}
            </div>
          </div>
          
          <div id="container" class="content col05">
            <div id="container" class="primary col04 store">
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-overview">
                  ${storeOverviewHTML}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-experience">
                  ${storeExperienceHTML}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-service">
                  ${storeServiceHTML}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-business">
                  ${components.storeBusiness.render(storeBusinessData)}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-location">
                  ${components.storeLocation.render(storeLocationData)}
                </div>
              </div>
            </div>
          </div>
          
          <div id="store-details" class="secondary col01 store store-details">
            ${storeDetailsHTML}
          </div>
        </div>
      `;

    } catch (error) {
      console.error("[StoreScreen.render] Error:", error);
      return `<div>Error loading store</div>`;
    }
  },

  after_render: async () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    try {
      const accessToken = localStorage.getItem("accessToken");
      let userData = null;
      
      if (accessToken) {
        const userResponse = await fetch("http://localhost:4000/api/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (userResponse.ok) {
          userData = await userResponse.json();
        }
      }

      // Update UI with user data
      const userControlsHTML = components.userControl.render(store, {
        totalLikes: userData?.totalLikes || 0,
        totalDislikes: userData?.totalDislikes || 0,
        rating: userData?.rating || 0
      });

      // Set up impression tracking
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

    } catch (error) {
      console.error("[StoreScreen.after_render] Error:", error);
    }
  },

  handleImpression: async (storeId, action) => {
    try {
      const response = await sendImpression(storeId, action);
      if (response.message === "Impression added successfully") {
        StoreScreen.updateImpressionUI(storeId, response.likes, response.dislikes);
      } else {
        throw new Error(response.message || "Failed to update impression");
      }
    } catch (error) {
      console.error("Error sending impression:", error);
      alert(error.message);
    }
  },

  updateImpressionUI: (storeId, likes, dislikes) => {
    const likeButton = document.querySelector(`.impression-button.like[data-store-id="${storeId}"]`);
    const dislikeButton = document.querySelector(`.impression-button.dislike[data-store-id="${storeId}"]`);

    if (likeButton) {
      likeButton.querySelector(".count").textContent = likes;
    }
    if (dislikeButton) {
      dislikeButton.querySelector(".count").textContent = dislikes;
    }
  }
};

export default StoreScreen;
