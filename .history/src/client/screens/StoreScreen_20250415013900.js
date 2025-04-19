
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
// import { sendImpression } from "../api.js";
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
import { controlUser } from "../components/controls/controls.js";
import * as components from "../components/components.js";

// import mapNearby from "..components/mapNearby.js";
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/map/MapApi.js";
import { storePopularTimes } from "../components/_archive/StorePopularTimes.js";
import { thumbnail } from "../components/media/_archive/media.js";
// import * as components from "../components/components.js";
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

// const socket = io("http://localhost:6000");
const socket = io("http://localhost:4000");

const StoreScreen = {
  render: async () => {
    try {
      // 1. Get the request parameters
      const request = parseRequestUrl();
      console.log("[StoreScreen] Getting store for slug:", request.slug);
  
      // 2. Initialize StoreData and get store data
      const storeData = new data.StoreData();
  
      // 3. Get store data using slug
      console.log("[StoreScreen] Fetching store data...");
      let store = await storeData.store(request.slug);
      console.log("[StoreScreen] Store data:", store);
      
      // 4. If no store data, try to fetch from MongoDB first
      if (!store) {
        console.log("[StoreScreen] Store not found in data.js, visited MongoDB...");
        
        
        try {
          console.log("[StoreScreen] Checking MongoDB for store data...");
          
           // Record store visit if user is logged in
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            try {
             



          // const mongoResponse = await fetch(`http://localhost:6000/api/stores/${request.slug}`);
          const mongoResponse = await fetch(`http://localhost:4500/api/stores/${request.slug}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('[StoreScreen] Visit recorded');
              if (!respomongoResponsense.ok) {
                throw new Error(`Failed to record visit: ${mongoResponse.statusText}`);
              }
              // Parse the response if needed
              const result = await mongoResponse.json();
              console.log('[StoreScreen] Visit recorded:', result);

          
          

          const mongoData = await mongoResponse.json();
          
          if (mongoResponse.ok && mongoData.success && mongoData.store) {
            console.log("[StoreScreen] Found store in MongoDB:", mongoData.store);
            store = mongoData.store;
          } else {
            console.log("[StoreScreen] Store not found in MongoDB either, creating placeholder");
            // Create a well-structured placeholder store
            const parts = request.slug.split('_');
            const location = parts.length > 1 ? parts[1].replace(/-/g, ' ') : 'Unknown Location';
            const storeName = parts.length > 2 ? parts[2].replace(/-/g, ' ') : 'Unknown Store';
            
            store = {
              slug: request.slug,
              hero: {
                storeName: storeName.charAt(0).toUpperCase() + storeName.slice(1),
                storeType: "Coffee Shop",
                rating: "0",
                price: "$$",
                distance: "Unknown",
                city: location.charAt(0).toUpperCase() + location.slice(1),
                state: parts[0] === 'ca' ? 'CA' : 'Unknown',
                gallery: []
              },
              overview: [{
                header: "Overview",
                summary: {
                  experienceScore: "0",
                  experience: [], // Initialize as empty array
                  serviceScore: "0",
                  service: [], // Initialize as empty array
                  businessScore: "0",
                  business: [], // Initialize as empty array
                  locationScore: "0",
                  location: [] // Initialize as empty array
                },
              // overview: [{
              //   header: "Overview",
              //   summary: {
              //     experienceScore: "0",
              //     experience: [],
              //     serviceScore: "0",
              //     service: [],
              //     businessScore: "0",
              //     business: [],
              //     locationScore: "0",
              //     location: []
              //   },
                text: { 
                  title: "Store Information", 
                  content: "Store information is currently unavailable." 
                },
                footer: {
                  contributionsCount: 0,
                  modifiedDate: new Date().toLocaleDateString(),
                  modifiedTime: "0",
                  commentsCount: 0,
                  reviewsCount: 0,
                  likesCount: 0,
                  dislikeCount: 0
                }
              }],
              experience: {
                header: "Experience",
                area: [],
                attribute: {
                  bestfor: [],
                  working: [],
                  environment: [],
                  facility: []
                },
                text: {
                  title: "Experience",
                  content: "Experience information coming soon."
                },
                footer: {
                  contributionsCount: 0,
                  modifiedDate: new Date().toLocaleDateString(),
                  modifiedTime: "0",
                  commentsCount: 0,
                  reviewsCount: 0,
                  likesCount: 0,
                  dislikeCount: 0
                }
              },
              service: {
                header: "Service",
                category: {},
                text: {
                  title: "Service",
                  content: "Service information coming soon."
                },
                footer: {
                  contributionsCount: 0,
                  modifiedDate: new Date().toLocaleDateString(),
                  modifiedTime: "0",
                  commentsCount: 0,
                  reviewsCount: 0,
                  likesCount: 0,
                  dislikeCount: 0
                }
              },
              business: {
                header: "Business",
                footer: {
                  contributionsCount: 0,
                  modifiedDate: new Date().toLocaleDateString(),
                  modifiedTime: "0",
                  commentsCount: 0,
                  reviewsCount: 0,
                  likesCount: 0,
                  dislikeCount: 0
                }
              },
              location: {
                header: "Location",
                address: "Address unknown",
                geolocation: { lat: 33.6, lon: -117.9 },
                neighborhood: {
                  city: location.charAt(0).toUpperCase() + location.slice(1)
                },
                footer: {
                  contributionsCount: 0,
                  modifiedDate: new Date().toLocaleDateString(),
                  modifiedTime: "0",
                  commentsCount: 0,
                  reviewsCount: 0,
                  likesCount: 0,
                  dislikeCount: 0
                }
              }
            };
          }
        } catch (mongoError) {
          console.error("[StoreScreen] Error fetching from MongoDB:", mongoError);
          // Create the same placeholder store as above if the MongoDB call fails
          // (Repeat the store creation code here)
        
      
        }
        
      }
                    
    } catch (error) {
      console.error('[StoreScreen] Failed to record visit:', error);
    }
  }
  
  


      // 5. Now try to save the store data to MongoDB
      try {
        console.log("[StoreScreen] Saving store data to MongoDB...");
        // console.log("[StoreScreen] Store data to save:", store);
         //  // In StoreScreen.js, before the fetch call
        //  console.log(`[StoreScreen] Preparing to save store data for: ${store.hero?.storeName || request.slug}`);
        //  console.log(`[StoreScreen] Data size: ${JSON.stringify(store).length} bytes`);
 
        //  const response = await fetch(`http://localhost:6000/apistores/${request.slug}`, {
        // const response = await fetch(`http://localhost:6000/api/stores/${request.slug}`, {
        
        // const response = await fetch(`http://localhost:6000/api/stores/sync/${request.slug}`, {
        // Ensure all data sections are included
        const completeStoreData = {
          ...store,
          // Core sections
          hero: store.hero || {},
          overview: store.overview || [],
          service: store.service || {},
          experience: store.experience || {},
          location: store.location || {},
          business: store.business || {},
          
          // Additional data sections
          categoryData: store.categoryData || {},
          mapRadiusData: store.mapRadiusData || {},
          
          // Yelp data sections
          yelpData: store.yelpData || null,
          yelpFoodData: store.yelpFoodData || null,
          yelpFusionData: store.yelpFusionData || null,
          yelpSearchData: store.yelpSearchData || null,
          yelpPhoneData: store.yelpPhoneData || null,
          yelpMatchData: store.yelpMatchData || null,
          yelpDetailsData: store.yelpDetailsData || null,
          yelpDeliveryData: store.yelpDeliveryData || null,
          yelpServiceData: store.yelpServiceData || null,
          yelpInsightData: store.yelpInsightData || null,
          
          // Metadata
          lastUpdated: new Date(),
          slug: store.slug || request.slug
        };

        console.log("[StoreScreen] Complete store data to save:", completeStoreData);
        
        const response = await fetch(`http://localhost:4500/api/stores/sync/${request.slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          // body: JSON.stringify({ storeData: store })
          // body: JSON.stringify(store)  // Send the store object directly
          body: JSON.stringify(completeStoreData)
        });
        // After response
        console.log(`[StoreScreen] Server response:`, response);

        
        // Add retry logic
        console.log("[StoreScreen] Server response status:", response.status);
        
        if (!response.ok) {
        //   // Try once more after a short delay
        //   await new Promise(resolve => setTimeout(resolve, 1000));
        //   const retryResponse = await fetch(`http://localhost:6000/api/stores/${request.slug}`, {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ storeData: store })
        //   });
          
        //   if (!retryResponse.ok) {
        //     throw new Error(`HTTP error ${response.status}`);
        //   }
          
        //   const responseData = await retryResponse.json();
        //   console.log(`[StoreScreen] Store data saved to MongoDB on retry: ${responseData.store?.title || request.slug}`);
        // } else {
        //   const responseData = await response.json();
        //   console.log(`[StoreScreen] Store data saved to MongoDB: ${responseData.store?.title || request.slug}`);
        // }
          const errorData = await response.json();
          // console.error("[StoreScreen] Server error:", errorData);
          console.error("[StoreScreen] Server error response:", errorData);
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        const responseData = await response.json();
        console.log("[StoreScreen] MongoDB save response:", responseData);
        
      } catch (syncError) {
        console.error("[StoreScreen] Error saving to MongoDB:", syncError);
        if (syncError.message.includes("Failed to fetch")) {
          // console.error("[StoreScreen] Connection error - make sure server is running on port 6000");
          // console.error("[StoreScreen] Server URL:", `http://localhost:6000/api/stores/sync/${request.slug}`);
          console.error("[StoreScreen] Connection error - make sure server is running on port 4500");
          console.error("[StoreScreen] Server URL:", `http://localhost:4500/api/stores/sync/${request.slug}`);
        }
        // Continue rendering even if sync fails
      }
      
      // 6. Extract and format data for components
      const {
        hero = {},
        overview = {},
        service = {},
        experience = {},
        location = {},
        business = {},
        serviceCategoryData = {},
        mapRadiusData = {}
      } = store || {};
  
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



      ////////////// DISTANCE //////////////
      let userCoordinates = null;
      const coordinateUser = () => {
        return new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                userCoordinates = [
                  position.coords.longitude,
                  position.coords.latitude,
                ];
                // console.log("WORKS userCoordinates geolocate", userCoordinates);
                resolve(userCoordinates);
                return [userCoordinates[0], userCoordinates[1]];
              },
              (error) => {
                reject(error);
              }
            );
          } else {
            console.log("Geolocation not available");
            reject(new Error("Geolocation not available"));
          }
        });
      };
      const coordinateStore = Geolocate.coordinateStore(store);
      const storeLocation = [
        location.neighborhood.geolocation.lon,
        location.neighborhood.geolocation.lat,
      ];

      const userLocation = await coordinateUser();

      let Location = [
        { name: "userLocation", coordinates: userLocation },
        { name: "storeLocation", coordinates: storeLocation },
      ];
      const storeRange = GeolocationRange.storeRange.render(Location);
      const storeDistance = GeolocationRange.storeDistance.render(Location);
      console.log("%%%%%%%%%%%%%%%%storeDistance%%%%%%%%%%%%%%%%", storeDistance);
      ////////////// DISTANCE //////////////



      const ExperienceData = experience[0];
      const experienceData = {
        header: experience.header,
        area: experience.area,
        attribute: experience.attribute,
        text: experience.text,
        footer: experience.footer
      };
      console.log("!!!experienceData", experienceData);
      console.log("!!!experience", experience);
      console.log("!!!business", business);
      console.log("!!!service", service);

      // 5. Generate HTML for each section
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
                  <!--$ {components.storeService.render({ 
                    ...service,
                    categories: serviceCategoryData?.categories || []
                  })}-->
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-business">
                  ${components.storeBusiness.render(business)}
                </div>
              </div>
              <div id="section" class="section col04">
                <div class="col04 array content" id="store-location">
                  <!--$ {components.storeLocation.render(location)}-->
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
      return `<div>Error loading store</div>`;
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
    
    // Fetch user data including visited status
    const accessToken = localStorage.getItem("accessToken");
    
    if (accessToken) {
      try {
        // Check if user is already visited to this store
        const response = await fetch("http://localhost:4000/api/store/visit/status", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("[StoreScreen] Visited status:", data);
          
          if (data.success && data.checkedInStore === storeSlug) {
            // Update UI to show visited state
            const visitedButton = document.getElementById('storeControls-visited');
            const userImpression = document.getElementById('userImpression');
            
            if (visitedButton) {
              visitedButton.classList.add('visited');
              visitedButton.querySelector('span').textContent = 'Visited';
            }
            
            if (userImpression) {
              userImpression.classList.remove('disabled');
              
              // Enable impression buttons
              const impressionButtons = document.querySelectorAll('.impression-button');
              impressionButtons.forEach(button => {
                button.removeAttribute('disabled');
                button.classList.remove('disabled');
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching visited status:", error);
      }
    }
  
    // Also fetch user impression data
    if (accessToken) {
      try {
        const userResponse = await fetch("http://localhost:4000/api/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("[StoreScreen] User data:", userData);
          
          // Update user controls with data
          const userControlsHTML = userControl.render(store, {
            totalLikes: userData.totalLikes || 0,
            totalDislikes: userData.totalDislikes || 0,
            rating: userData.rating || 0
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    
    // Update the impression button event listener
    const impressionButtons = document.querySelectorAll('.impression-button');
    impressionButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const storeId = button.dataset.storeId;
        const action = button.classList.contains('like') ? 'like' : 'dislike';
        await StoreScreen.handleImpression(storeId, action);
      });
    });
  
    // Socket.io listener for real-time updates
    socket.on('impression_update', (data) => {
      StoreScreen.updateImpressionUI(data.storeId, data.likes, data.dislikes);
    });
    
    // Add socket listeners for visited events
    socket.on('user_visited', (data) => {
      console.log(`[Socket] User checked in to store ${data.storeId}`);
      // Update UI if needed for real-time visited updates
    });
    
    socket.on('user_checkout', (data) => {
      console.log(`[Socket] User checked out from store ${data.storeId}`);
      // Update UI if needed for real-time check-out updates
    });


    if (!store || !store.someProperty) {
      // Handle error or missing data
      const popularTime = store.popularTimes || [];
      const popularTimes = store.popularTimes || [];
      // const storeLocation = [store.location.geolocation.lat,store.location.geolocation.lon];
      // const storeLocation = store.location.geolocation || [];
      const storeLocation =
        store.Location && store.Location.geolocation
          ? {
              lat: store.Location.geolocation.lat,
              lon: store.Location.geolocation.lon
            }
          : { lat: 0, lon: 0 }; // Default values if location is not defined

      // Ensure storePopularTimes is called after the DOM is fully loaded
      if (document.getElementById("chartsContainer")) {
        // const popularTimesData = [popularTimes]; // Replace with actual data
        const popularTimesData = popularTimes ? [popularTimes] : []; // Replace with actual data
        // console.log("popularTimesData",popularTimesData);
        storePopularTimes(popularTimesData);
      } else {
        console.error("chartsContainer element not found");
      }

      const map = initMap({
        container: "map-container",
        style: "mapbox://styles/neumad/cm65tcurg005b01stfucq7qil",
        center: storeLocation, // Center the map on the store's location
        zoom: 13, // Adjust zoom as needed
        attributionControl: false
      });

      // Modal //
      const modal = modals.init();

      if (document.getElementById("modal")) {
        document.addEventListener("DOMContentLoaded", () => {
          modal.init();
        });
      } else {
        console.error("myBtn element not found");
      }

      // Gallery Modal //
      if (document.getElementById("modal-gallery")) {
        document.addEventListener("DOMContentLoaded", () => {
          console.log("gallery-modal");
          modal.init();
        });
      } else {
        console.error("gallery-modal element not found");
      }

      new mapboxgl.Marker()
        .setLngLat([storeLocation.lon, storeLocation.lat])
        .addTo(map);
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(new mapboxgl.LngLat(storeLocation.lon, storeLocation.lat));
      map.fitBounds(bounds, { padding: 50, duration: 1000 });
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

// window.storeActions = {
//   shareStore: function (storeURL) {
//     if (navigator.share) {
//       navigator
//         .share({
//           title: "Check out this store!",
//           url: storeURL
//         })
//         .then(() => {
//           // console.log("Thanks for sharing!");
//         })
//         .catch(console.error);
//     } else {
//       navigator.clipboard
//         .writeText(storeURL)
//         .then(() => {
//           alert("Store link copied to clipboard!");
//         })
//         .catch(console.error);
//     }
//   },

//   toggleSaveStore: function (storeName) {
//     const saveButton = document.getElementById("storeControls-save");
//     if (saveButton.classList.contains("saved")) {
//       saveButton.classList.remove("saved");
//       saveButton.querySelector("span").textContent = "Save";
//       alert(`${storeName} removed from favorites`);
//     } else {
//       saveButton.classList.add("saved");
//       saveButton.querySelector("span").textContent = "Saved";
//       alert(`${storeName} added to favorites`);
//     }
//     // Here you would typically update the user's saved stores in your application state
//   },

//   toggleVisitedStore: function (storeName) {
//     const checkinButton = document.getElementById("storeControls-checkin");
//     const userImpression = document.getElementById("userImpression");
//     if (checkinButton.classList.contains("visited")) {
//       checkinButton.classList.remove("visited");
//       checkinButton.querySelector("span").textContent = "Visited";
//       userImpression.classList.add("disabled");
//       alert(`Checked out from ${storeName}`);
//     } else {
//       checkinButton.classList.add("visited");
//       checkinButton.querySelector("span").textContent = "Checked-in";
//       userImpression.classList.remove("disabled");
//       alert(`Checked in to ${storeName}`);
//     }
//     // Here you would typically update the user's visited status in your application state
//   },

//   toggleImpression: async function (storeId, type) {
//     const impressionButton = document.querySelector(
//       `.impression-button.${type}`
//     );
//     const otherType = type === "like" ? "dislike" : "like";
//     const otherButton = document.querySelector(
//       `.impression-button.${otherType}`
//     );

//     try {
//       // const response = await fetch("http://localhost:6000/api/impression", {
//       const response = await fetch("http://localhost:4000/api/impression", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`
//         },
//         body: JSON.stringify({ storeId, action: type })
//       });
//       const data = await response.json();

//       if (data.success) {
//         if (impressionButton.classList.contains("active")) {
//           impressionButton.classList.remove("active");
//         } else {
//           impressionButton.classList.add("active");
//           otherButton.classList.remove("active");
//         }

//         this.updateImpressionCount("like", data.likes);
//         this.updateImpressionCount("dislike", data.dislikes);
//       } else {
//         alert(data.message || "Failed to update impression. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error updating impression:", error);
//       alert("An error occurred. Please try again.");
//     }
//   },

//   updateImpressionCount: function (type, count) {
//     const button = document.querySelector(`.impression-button.${type}`);
//     const countSpan = button.querySelector(".count");
//     countSpan.textContent = count;
//   }
// };

// // Make ImpressionHandler globally accessible
// window.ImpressionHandler = {
//   queue: [],
//   syncInterval: 5000, // Sync every 5 seconds
//   lastSyncTime: 0,

//   init() {
//     setInterval(() => this.syncWithServer(), this.syncInterval);
//     window.addEventListener("beforeunload", () => this.syncWithServer());
//   },

//   toggleImpression(storeId, type) {
//     const impressionButton = document.querySelector(
//       `.impression-button.${type}`
//     );
//     const otherType = type === "like" ? "dislike" : "like";
//     const otherButton = document.querySelector(
//       `.impression-button.${otherType}`
//     );

//     // Optimistic UI update
//     if (impressionButton.classList.contains("active")) {
//       impressionButton.classList.remove("active");
//       this.updateImpressionCount(type, -1);
//       this.queueImpression(storeId, `un${type}`);
//     } else {
//       impressionButton.classList.add("active");
//       this.updateImpressionCount(type, 1);
//       this.queueImpression(storeId, type);
//       if (otherButton.classList.contains("active")) {
//         otherButton.classList.remove("active");
//         this.updateImpressionCount(otherType, -1);
//         this.queueImpression(storeId, `un${otherType}`);
//       }
//     }
//   },

//   updateImpressionCount(type, change) {
//     const button = document.querySelector(`.impression-button.${type}`);
//     const countSpan = button.querySelector(".count");
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
//       const response = await fetch("/api/sync-impressions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`
//         },
//         body: JSON.stringify({ impressions: impressionsToSync })
//       });
//       const data = await response.json();

//       if (!data.success) {
//         console.error("Failed to sync impressions:", data.message);
//         // Re-queue failed impressions
//         this.queue = [...this.queue, ...impressionsToSync];
//       }
//     } catch (error) {
//       console.error("Error syncing impressions:", error);
//       // Re-queue all impressions on error
//       this.queue = [...this.queue, ...impressionsToSync];
//     }

//     this.lastSyncTime = Date.now();
//   }
// };

// Initialize the impression handler
document.addEventListener("DOMContentLoaded", () => {
  window.ImpressionHandler.init();
});

// Save store data to MongoDB
const saveStoreData = async (storeData) => {
  try {
    console.log('[StoreScreen] Saving store data to MongoDB...');
    console.log('[StoreScreen] Preparing to save store data for:', storeData.hero?.storeName);
    console.log('[StoreScreen] Data size:', JSON.stringify(storeData).length, 'bytes');

    // const response = await fetch(`http://localhost:6000/api/stores/sync/${storeData.slug}`, {      
    const response = await fetch(`http://localhost:4500/api/stores/sync/${storeData.slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save store data');
    }

    const result = await response.json();
    console.log('[StoreScreen] Store data saved successfully:', result);
    return result;
  } catch (error) {
    console.error('[StoreScreen] Error saving to MongoDB:', error);
    if (error.message.includes('Failed to fetch')) {
      console.error('[StoreScreen] Connection error - make sure server is running on port 4500');
    }
    throw error;
  }
};




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

  // Updated toggleVisitedStore function for StoreScreen.js line ~965
  toggleVisitedStore: function(storeName) {
    const visitedButton = document.getElementById('storeControls-visits');
    const userImpression = document.getElementById('userImpression');
    
    // Get current store slug from URL
    const request = parseRequestUrl();
    const storeId = request.slug;
    
    if (!visitedButton) {
      console.error('[StoreScreen.js.toggleVisitedStore] Visited button not found');
      return;
    }
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('You need to be logged in to visit. Please log in first.');
      return;
    }

    const hasVisited = visitedButton.classList.contains('visited');
    const action = hasVisited ? 'checkout' : 'visited';

    // Update UI immediately for better user experience
    if (hasVisited) {
      visitedButton.classList.remove('visited');
      visitedButton.querySelector('span').textContent = 'Visited';
      if (userImpression) userImpression.classList.add('disabled');
      
      // Disable impression buttons
      const impressionButtons = document.querySelectorAll('.impression-button');
      impressionButtons.forEach(button => {
        button.setAttribute('disabled', 'disabled');
        button.classList.add('disabled');
      });
    } else {
      visitedButton.classList.add('visited');
      visitedButton.querySelector('span').textContent = 'Visited';
      if (userImpression) userImpression.classList.remove('disabled');
      
      // Enable impression buttons
      const impressionButtons = document.querySelectorAll('.impression-button');
      impressionButtons.forEach(button => {
        button.removeAttribute('disabled');
        button.classList.remove('disabled');
      });
    }
    
    // Send request to server
    fetch('http://localhost:4000/api/store/visited', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        storeId: storeId,
        action: action 
      })
    })
    .then(response => {
      if (response.status === 401 || response.status === 403) {
        // Authentication error
        console.log("Authentication error:", response.status);
        localStorage.removeItem('accessToken'); // Clear invalid token
        throw new Error(`Authentication error. Please log in again.`);
      }
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('[StoreScreen.js.toggleVisitedStore] Server response:', data);
      // Server responded successfully, no need to revert UI as we've already updated it
    })
    .catch(error => {
      console.error('[StoreScreen.js.toggleVisitedStore] Error:', error);
      // Revert UI changes
      if (hasVisited) {
        // Revert to visited state
        visitedButton.classList.add('visited');
        visitedButton.querySelector('span').textContent = 'Visited';
        if (userImpression) userImpression.classList.remove('disabled');
        
        // Re-enable impression buttons
        const impressionButtons = document.querySelectorAll('.impression-button');
        impressionButtons.forEach(button => {
          button.removeAttribute('disabled');
          button.classList.remove('disabled');
        });
      } else {
        // Revert to checked-out state
        visitedButton.classList.remove('visited');
        visitedButton.querySelector('span').textContent = 'Visited';
        if (userImpression) userImpression.classList.add('disabled');
        
        // Disable impression buttons
        const impressionButtons = document.querySelectorAll('.impression-button');
        impressionButtons.forEach(button => {
          button.setAttribute('disabled', 'disabled');
          button.classList.add('disabled');
        });
      }
      
      // Show appropriate error message
      if (error.message.includes('Authentication')) {
        alert(error.message);
      } else {
        alert(`Error: ${error.message}. Please try again.`);
      }
    });
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


// window.storeActions = {
//   shareStore: function(storeURL) {
//     if (navigator.share) {
//       navigator.share({
//         title: 'Check out this store!',
//         url: storeURL
//       }).then(() => {
//         console.log('Thanks for sharing!');
//       }).catch(console.error);
//     } else {
//       navigator.clipboard.writeText(storeURL).then(() => {
//         alert('Store link copied to clipboard!');
//       }).catch(console.error);
//     }
//   },

//   toggleSaveStore: function(storeName) {
//     const saveButton = document.getElementById('storeControls-save');
//     if (saveButton.classList.contains('saved')) {
//       saveButton.classList.remove('saved');
//       saveButton.querySelector('span').textContent = 'Save';
//       alert(`${storeName} removed from favorites`);
//     } else {
//       saveButton.classList.add('saved');
//       saveButton.querySelector('span').textContent = 'Saved';
//       alert(`${storeName} added to favorites`);
//     }
//     // Here you would typically update the user's saved stores in your application state
//   },

//   toggleVisitedStore: function(storeName) {
//     const checkinButton = document.getElementById('storeControls-checkin');
//     const userImpression = document.getElementById('userImpression');
//     if (checkinButton.classList.contains('visited')) {
//       console.log("[StoreScreen.js.toggleVisitedStore] visited");
//       checkinButton.classList.remove('visited');
//       checkinButton.querySelector('span').textContent = 'Visited';
//       userImpression.classList.add('disabled');
//       alert(`Checked out from ${storeName}`);
//     } else {
//       console.log("[StoreScreen.js.toggleVisitedStore] visited");
//       checkinButton.classList.add('visited');
//       checkinButton.querySelector('span').textContent = 'Checked-in';
//       userImpression.classList.remove('disabled');
//       alert(`Checked in to ${storeName}`);
//     }
//     // Here you would typically update the user's visited status in your application state
//   },

//   toggleImpression: async function(storeId, type) {
//     const impressionButton = document.querySelector(`.impression-button.${type}`);
//     const otherType = type === 'like' ? 'dislike' : 'like';
//     const otherButton = document.querySelector(`.impression-button.${otherType}`);
    
//     try {
//       const response = await fetch('http://localhost:4000/api/impression', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//         },
//         body: JSON.stringify({ storeId, action: type })
//       });
//       const data = await response.json();
      
//       if (data.success) {
//         if (impressionButton.classList.contains('active')) {
//           impressionButton.classList.remove('active');
//         } else {
//           impressionButton.classList.add('active');
//           otherButton.classList.remove('active');
//         }
        
//         this.updateImpressionCount('like', data.likes);
//         this.updateImpressionCount('dislike', data.dislikes);
//       } else {
//         alert(data.message || 'Failed to update impression. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error updating impression:', error);
//       alert('An error occurred. Please try again.');
//     }
//   },
  
//   updateImpressionCount: function(type, count) {
//     const button = document.querySelector(`.impression-button.${type}`);
//     const countSpan = button.querySelector('.count');
//     countSpan.textContent = count;
//   }
// };





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




// // Make ImpressionHandler globally accessible
// window.ImpressionHandler = {
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
// document.addEventListener('DOMContentLoaded', () => {
//   window.ImpressionHandler.init();
// });

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