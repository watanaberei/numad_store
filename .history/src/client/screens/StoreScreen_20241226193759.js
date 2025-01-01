// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import { sendImpression } from "../api.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils/utils.js";
import { serviceCategoryData } from "../../server/data/data.js";
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost } from "../api.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/map/MapApi.js";
import DataPost from "../data/DataPost.js";
import * as components from "../components/components.js";
import * as array from "../components/array/array.js";
import * as data from "../../server/data/data.js";
import * as yelpApi from "../../server/data/yelp/yelpApi.js";
import * as sidebar from "../components/sidebar/sidebar.js";




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
    },
  },
};



let store = ""; //dynamic store
let dataPost = new DataPost();
const socket = io('http://localhost:4000');

// const socket = io('http://localhost:4000');

const StoreScreen = {
  async init() {
    try {
      console.log("debug log: Initializing application");
      
      // Get store data using DataPost
      const storeData = await dataPost.getStoreId();
      
      console.log("debug log: Initializing application");
      // Extract data structures from the fetched store data
      const store = storeData?.features?.[0]?.properties;
      
      if (!store) {
        throw new Error('Store data not found');
      }

      const storeCity = store.city;
   
   


    // Extract data structures
    this.storeOverviewData = data.store?.item?.[0]?.overview?.[0];
    this.storeServiceData = data.store?.item?.[0]?.service?.[0];
    this.storeExperienceData = data.store?.item?.[0]?.experience?.[0];
    this.storeHeroData = data.store?.item?.[0]?.hero?.[0];
    this.storeLocationData = data.store?.item?.[0]?.location;
    this.storeBusinessData = yelpApi.yelpApi;

    console.log("debug log: store-init02 - Extracted data structures:", {
      overview: this.storeOverviewData,
      service: this.storeServiceData,
      experience: this.storeExperienceData,
      location: this.storeLocationData,
      hero: this.storeHeroData,
      business: this.storeBusinessData,
    });
  } catch (error) {
    console.error('Error initializing store:', error);
    throw error;
  }
},

  render: async () => {
    try {
      await StoreScreen.init();
      const { storeData } = await data.initializeData();
      const request = parseRequestUrl();

      console.log('debug log: storeScreen init15 Store request:', request); // Debug log

      console.log("debug log: store-init03 - Store data:", storeData);

      return `
        <div id="store" class="main grid05">
          <div id="section" class="hero col05">
            <div class="col05 array content" id="store-hero"></div>
          </div>
          
          <div id="container" class="content col05">
            <div id="container" class="primary col04 store">
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-overview"></div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-experience"></div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-service"></div>
              </div>
              <div id="section" class="section col04">
                <div class="grid04-overflow array" id="business-hours"></div>
                <div class="footer col04"></div>
                <div class="col04 array content" id="store-business"></div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-location"></div>
              </div>
            </div>
            
            <div id="store-details" class="secondary col01 store store-details">
              sidebar here
            </div>
          </div>
        </div>`;
    } catch (error) {
      console.error("Error in render:", error);
      return `<div>Error loading store</div>`;
    }
  },

  after_render: async () => {
    try {
      const { storeData } = await data.initializeData();
      const store = data.store?.item?.[0];

      // Store Details
      const storeDetails = document.getElementById("store-details");
      if (storeDetails && storeData) {
        storeDetails.innerHTML = sidebar.storeDetails.render(storeData);
      }

      // Hero Section
      const storeHero = document.getElementById("store-hero");
      if (storeHero && StoreScreen.storeHeroData) {
        storeHero.innerHTML = components.storeHero.render(store.hero?.[0].hero);
        components.storeHero.afterRender?.();
      }

      // Overview Section
      const storeOverview = document.getElementById("store-overview");
      if (storeOverview && StoreScreen.storeOverviewData) {
        storeOverview.innerHTML = components.storeOverview.render(
          StoreScreen.storeOverviewData.header,
          StoreScreen.storeOverviewData.text,
          StoreScreen.storeOverviewData.summary,
          StoreScreen.storeOverviewData.footer
        );
      }

      // Service Section
      const storeService = document.getElementById("store-service");
      if (storeService && StoreScreen.storeServiceData) {
        storeService.innerHTML = components.storeService.render(
          StoreScreen.storeServiceData.header,
          StoreScreen.storeServiceData.text,
          data.serviceCategoryData,
          StoreScreen.storeServiceData.footer
        );
      }

      // Experience Section
      const storeExperience = document.getElementById("store-experience");
      if (storeExperience && StoreScreen.storeExperienceData) {
        storeExperience.innerHTML = components.storeExperience.render(
          StoreScreen.storeExperienceData.header,
          StoreScreen.storeExperienceData.text,
          StoreScreen.storeExperienceData.footer,
          StoreScreen.storeExperienceData.area,
          StoreScreen.storeExperienceData.attribute
        );
        array.create.initializeCarousel("area");
      }

      // Location Section
      const storeLocation = document.getElementById("store-location");
      if (storeLocation && StoreScreen.storeLocationData) {
        const storeLocationHeader = `${store.location.city},${store.location.area}`;
        storeLocation.innerHTML = components.storeLocation.render(
          storeLocationHeader,
          StoreScreen.storeLocationData.attribute,
          StoreScreen.storeLocationData.footer
        );
      }

      // Business Section
      const storeBusiness = document.getElementById("store-business");
      if (storeBusiness && storeData?.hours) {
        storeBusiness.innerHTML = components.storeBusiness.render(storeData);
        components.storeBusiness.afterRender();
      }

      // Other UI Components
      this.renderUIComponents(store, storeData);

      console.log("debug log: Application initialization complete");
    } catch (error) {
      console.error("Error in after_render:", error);
    }
  },

  renderUIComponents: (store, storeData) => {
    // Footer
    const footerContainer = document.getElementById("section-footer");
    if (footerContainer) {
      footerContainer.innerHTML = components.sectionFooter.render(data.footerData);
    }

    // Store Details
    const storeDetailContainer = document.getElementById("store-detail");
    if (storeDetailContainer) {
      storeDetailContainer.innerHTML = components.storeDetail.render(data.heroData);
    }

    // Category
    const categoryContainer = document.getElementById("store-category");
    if (categoryContainer) {
      categoryContainer.innerHTML = components.storeCategory.render(data.serviceCategoryData);
      array.create.initializeCarousel("category");
    }

    // Map
    const mapNearby = document.getElementById("map-nearby");
    if (mapNearby) {
      mapNearby.innerHTML = components.mapNearby.render(data.mapRadiusData);
      initMap();
    }

    // Store Attributes
    const storeAttributes = document.getElementById("card-attributes");
    if (storeAttributes && store?.location?.attribute) {
      storeAttributes.innerHTML = components.storeAttributes.render(
        store.location.attribute
      );
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
    store.summary && store.summary.text && store.summary.text.length
      ? store.summary.text
      : [];
  // console.log("SUMMARYDETAILS", summaryText);
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
    if (saveButton.classList.contains('saved')) {
      saveButton.classList.remove('saved');
      saveButton.querySelector('span').textContent = 'Save';
      alert(`${storeName} removed from favorites`);
    } else {
      saveButton.classList.add('saved');
      saveButton.querySelector('span').textContent = 'Saved';
      alert(`${storeName} added to favorites`);
    }
    // Here you would typically update the user's saved stores in your application state
  },

  toggleCheckInStore: function(storeName) {
    const checkinButton = document.getElementById('storeControls-checkin');
    const userImpression = document.getElementById('userImpression');
    if (checkinButton.classList.contains('checked-in')) {
      checkinButton.classList.remove('checked-in');
      checkinButton.querySelector('span').textContent = 'Check-in';
      userImpression.classList.add('disabled');
      alert(`Checked out from ${storeName}`);
    } else {
      checkinButton.classList.add('checked-in');
      checkinButton.querySelector('span').textContent = 'Checked-in';
      userImpression.classList.remove('disabled');
      alert(`Checked in to ${storeName}`);
    }
    // Here you would typically update the user's check-in status in your application state
  },

  toggleImpression: async function(storeId, type) {
    const impressionButton = document.querySelector(`.impression-button.${type}`);
    const otherType = type === 'like' ? 'dislike' : 'like';
    const otherButton = document.querySelector(`.impression-button.${otherType}`);
    
    try {
      const response = await fetch('http://localhost:4000/api/impression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ storeId, action: type })
      });
      const data = await response.json();
      
      if (data.success) {
        if (impressionButton.classList.contains('active')) {
          impressionButton.classList.remove('active');
        } else {
          impressionButton.classList.add('active');
          otherButton.classList.remove('active');
        }
        
        this.updateImpressionCount('like', data.likes);
        this.updateImpressionCount('dislike', data.dislikes);
      } else {
        alert(data.message || 'Failed to update impression. Please try again.');
      }
    } catch (error) {
      console.error('Error updating impression:', error);
      alert('An error occurred. Please try again.');
    }
  },
  
  updateImpressionCount: function(type, count) {
    const button = document.querySelector(`.impression-button.${type}`);
    const countSpan = button.querySelector('.count');
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
    window.addEventListener('beforeunload', () => this.syncWithServer());
  },

  toggleImpression(storeId, type) {
    const impressionButton = document.querySelector(`.impression-button.${type}`);
    const otherType = type === 'like' ? 'dislike' : 'like';
    const otherButton = document.querySelector(`.impression-button.${otherType}`);
    
    // Optimistic UI update
    if (impressionButton.classList.contains('active')) {
      impressionButton.classList.remove('active');
      this.updateImpressionCount(type, -1);
      this.queueImpression(storeId, `un${type}`);
    } else {
      impressionButton.classList.add('active');
      this.updateImpressionCount(type, 1);
      this.queueImpression(storeId, type);
      if (otherButton.classList.contains('active')) {
        otherButton.classList.remove('active');
        this.updateImpressionCount(otherType, -1);
        this.queueImpression(storeId, `un${otherType}`);
      }
    }
  },

  updateImpressionCount(type, change) {
    const button = document.querySelector(`.impression-button.${type}`);
    const countSpan = button.querySelector('.count');
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
      const response = await fetch('/api/sync-impressions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ impressions: impressionsToSync })
      });
      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to sync impressions:', data.message);
        // Re-queue failed impressions
        this.queue = [...this.queue, ...impressionsToSync];
      }
    } catch (error) {
      console.error('Error syncing impressions:', error);
      // Re-queue all impressions on error
      this.queue = [...this.queue, ...impressionsToSync];
    }

    this.lastSyncTime = Date.now();
  }
};

// Initialize the impression handler
document.addEventListener('DOMContentLoaded', () => {
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