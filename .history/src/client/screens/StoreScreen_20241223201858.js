// src/screens/StoreScreen.js
// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import { sendImpression } from "../../api.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../../utils.js";
import { serviceCategoryData } from "../../server/data/data.js";

import {
  getStoresNeumadsReview,
  getArticleNeumadsTrail,
  getArticlePost,
} from "../../api.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";

// Component imports with corrected paths
import * as hero from "../../components/hero/hero.js";
import * as eyebrow from "../../components/eyebrow/eyebrow.js";
import * as MapDistance from "../../components/map/MapDistance.js";
import * as Geolocate from "../../components/map/geo/Geolocate.js";
import * as section from "../../components/section/section.js";
import * as experience from "../../components/experience/experience.js";
import * as GeolocationRange from "../../components/map/geo/GeolocationRange.js";
import * as service from "../../components/service/service.js";
import * as facility from "../../components/facility/facility.js";
import * as panel from "../../components/panel/panel.js";
import * as suggestion from "../../components/suggestion/suggestion.js";
import { modals } from "../../components/modal/modal.js";
import { userControl } from "../../components/controls/UserControls.js";

import mapboxgl from "mapbox-gl";
import { initMap } from "../../components/map/MapApi.js";
import { storePopularTimes } from "../../components/store/StorePopularTimes.js";
import { thumbnail } from "../../components/media/media.js";
import * as components from "../../components/components.js";
import * as array from "../../components/array/array.js";




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



const socket = io('http://localhost:4000');

// const socket = io('http://localhost:4000');

const StoreScreen = {
  render: async () => {
    try {
      // Get store data from the new data source
      const request = parseRequestUrl();
      const store = data.store?.item?.[0]; // Use data from data.js instead of DataBlog

      if (!store) {
        return `<div>Error: Store not found</div>`;
      }

      // ... rest of the render code using store data ...
    } catch (error) {
      console.error("Error in render:", error);
      return `<div>Error loading store</div>`;
    }
  },

  after_render: async () => {
    try {
      const store = data.store?.item?.[0]; // Use data from data.js

      // Update DOM elements with store data
      const storeHero = document.getElementById("store-hero");
      if (storeHero) {
        storeHero.innerHTML = hero.heroModule.render(store.media.hero);
      }

      // ... rest of the after_render code ...

    } catch (error) {
      console.error("Error in after_render:", error);
    }
  },

  handleImpression: async (storeId, action) => {
    try {
      const response = await sendImpression(storeId, action);
      if (response.message === 'Impression added successfully') {
        StoreScreen.updateImpressionUI(storeId, response.likes, response.dislikes);
      } else {
        throw new Error(response.message || 'Failed to update impression');
      }
    } catch (error) {
      console.error('Error sending impression:', error);
      alert(error.message);
    }
  },

  updateImpressionUI: (storeId, likes, dislikes) => {
    const likeButton = document.querySelector(`.impression-button.like[data-store-id="${storeId}"]`);
    const dislikeButton = document.querySelector(`.impression-button.dislike[data-store-id="${storeId}"]`);

    if (likeButton) {
      likeButton.querySelector('.count').textContent = likes;
    }
    if (dislikeButton) {
      dislikeButton.querySelector('.count').textContent = dislikes;
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