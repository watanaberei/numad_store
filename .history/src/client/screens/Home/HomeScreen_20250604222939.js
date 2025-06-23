///////////////////////// START FIXED HOMESCREEN COMPONENT /////////////////////////
// src/screens/HomeScreen.js - FIXED VERSION WITH BETTER LOADING AND ERROR HANDLING

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
import HeaderHome from "../../components/header/HeaderHome.js";
import mapRoute from "../../components/map/mapRoute.js";
import { geoPopup } from "../../components/map/geo/GeoPopup.js";
import polyline from "@mapbox/polyline";
import { getStore } from "../../API/api.js";

const HomeScreen = {
  render: async () => {
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    
    return `
      <container class="col03 grid03 primary">
        <div class="col03 container">
          <div class="col03 title">
            <span class="text03">
              primary
            </span>
          </div>
          <div class="col03 grid03 container">
            <div id="postStores" class="gridCollection col03 postStores list"> 
            </div>
            
            <div class="list col03 grid03" id="listing-blog">
              <div class="col03 heading">
                <span class="header01">Blog</span>
                ${isAuthenticated ? `
                  <div class="blog-actions">
                    <a href="/post" class="btn-create-post">
                      <i class="icon-plus"></i> Create Post
                    </a>
                    <a href="/blogs" class="btn-view-all">View All</a>
                  </div>
                ` : `
                  <div class="blog-actions">
                    <a href="/blogs" class="btn-view-all">View All</a>
                  </div>
                `}
              </div>
              <div id="postBlog" class="grid03 col03 postBlog card-blog">
              </div>
            </div>

            <div class="list" id="grid03 col03 listing-article">
              <div class="col03 heading">
                <span class="header01">Article</span>
              </div>
              <div id="postArticle" class="grid03 col03 postArticle card-article">
              </div>
            </div>

            <div class="list" id="grid03 col03 listing-review">
              <div class="col03 heading">
                <span class="header01">Reviewed</span>
              </div>
              <div id="postReview" class="grid03 col03 postReview card-review">
              </div>
            </div>

            <div class="list" id="grid03 col03 listing-store">
              <div class="col03 heading">
                <span class="header01">Nearby Stores</span>
              </div>
              <div id="postListing" class="grid03 col03 postListing card-listing">
              </div>
            </div>

          </div>
        </div>
      </container>


<!--
    <div class="main">
      <div class="map-container map-discover-container  grid platinum postContainer">
        <div class="m sidebar">
          <div class="sidebar-container">

            <div class="listing-item" id="listing-store">
              <div class="heading">
                <span class="header01">21 Stores</span>
              </div>
              <div id="postStores" class="postStores card-store">
              </div>
            </div>

            <div class="listing-item" id="listing-blog">
              <div class="heading">
                <span class="header01">Blog</span>
              </div>
              <div id="postBlog" class="postBlog card-blog">
              </div>
            </div>

            <div class="listing-item" id="listing-article">
              <div class="heading">
                <span class="header01">Article</span>
              </div>
              <div id="postArticle" class="postArticle card-article">
              </div>
            </div>

            <div class="listing-item" id="listing-review">
              <div class="heading">
                <span class="header01">Reviewed</span>
              </div>
              <div id="postReview" class="postReview card-review">
              </div>
            </div>

            <div class="listing-item" id="listing-store">
              <div class="heading">
                <span class="header01">Nearby Stores</span>
              </div>
              <div id="postListing" class="postListing card-listing">
              </div>
            </div>

          </div>
        </div>
        <div class="s map map-discover" id="map map-discover">
          <div id="map-container" class="fullBleed"></div>
        </div>
      </div>
    </div>
    -->

    <container class="col02 vh100 panel persistent secondary">
      <div class="col02 content">
        <div class="col02 title">
          <span class="text03">
            secondary
          </span>
        </div>
        <div class="col02 row01 container">
          <div class="col02 item">
            <div id="map map-discover" class="col02 s map map-discover">
              <div id="map-container" class="col02 fullBleed"></div>
            </div>
          </div>
        </div>
      </div>
    </container>
    `;
  },

  // COMPLETELY REWRITTEN: Better error handling and sequential loading
  after_render: async () => {
    // PREVENT MULTIPLE INITIALIZATIONS
    if (homeScreenInitialized) {
      console.log('[HomeScreen] Already initialized, skipping');
      return;
    }
    homeScreenInitialized = true;

    const startTime = Date.now();
    console.log('[HomeScreen] Starting after_render at:', new Date().toISOString());
    
    // CANCEL ANY EXISTING REQUESTS
    if (requestController) {
      requestController.abort();
    }
    requestController = new AbortController();
    
    // Get UI elements
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-container');
    const retryButton = document.getElementById('retry-button');
    
    // Show loading state
    showLoading();
    
    try {
      // FIXED: Sequential loading with proper error handling and timeouts
      console.log('[HomeScreen] Step 1: Initializing map...');
      const map = await initializeMap();
      
      if (!map) {
        throw new Error('Failed to initialize map');
      }
      
      console.log('[HomeScreen] Step 2: Loading content with rate limiting...');
      const [storeFeatures, blogFeatures] = await loadContent();
      
      console.log('[HomeScreen] Step 3: Processing features...');
      const allFeatures = [...storeFeatures, ...blogFeatures];
      console.log(`[HomeScreen] Total features loaded: ${allFeatures.length}`);
      
      // FIXED: Initialize additional components with error handling
      console.log('[HomeScreen] Step 4: Setting up map components...');
      await setupMapComponents(map, allFeatures);
      
      // Hide loading and show content
      hideLoading();
      showContent();
      
      const endTime = Date.now();
      console.log(`[HomeScreen] Successfully completed after_render in ${endTime - startTime}ms`);
      
    } catch (error) {
      console.error('[HomeScreen] Critical error in after_render:', error);
      showError(error.message);
      
      // Set up retry functionality
      if (retryButton) {
        retryButton.onclick = () => {
          console.log('[HomeScreen] Retrying after_render...');
          homeScreenInitialized = false; // Reset flag for retry
          window.location.reload();
        };
      }
    }
    
    // Helper functions
    function showLoading() {
      if (loadingIndicator) loadingIndicator.style.display = 'block';
      if (errorContainer) errorContainer.style.display = 'none';
      
      const sections = ['postStores', 'listing-blog', 'listing-article', 'listing-review', 'listing-store'];
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
      });
    }
    
    function hideLoading() {
      if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
    
    function showContent() {
      const sections = ['postStores', 'listing-blog', 'listing-article', 'listing-review', 'listing-store'];
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
      });
    }
    
    function showError(message) {
      hideLoading();
      if (errorContainer) {
        errorContainer.style.display = 'block';
        const errorMessage = errorContainer.querySelector('.error-message span');
        if (errorMessage) {
          errorMessage.textContent = `Error: ${message}`;
        }
      }
    }
  }
};


// IMPROVED: Initialize map with better error handling
async function initializeMap() {
  try {
    console.log('[HomeScreen] Initializing map safely...');
    
    const mapPromise = new Promise((resolve, reject) => {
      try {
        const map = initMap();
        if (!map) {
          reject(new Error('Map initialization returned null'));
          return;
        }
        
        if (map.loaded()) {
          resolve(map);
        } else {
          const loadHandler = () => {
            map.off('load', loadHandler);
            map.off('error', errorHandler);
            resolve(map);
          };
          
          const errorHandler = (e) => {
            map.off('load', loadHandler);
            map.off('error', errorHandler);
            reject(new Error(`Map load error: ${e.error?.message || 'Unknown error'}`));
          };
          
          map.on('load', loadHandler);
          map.on('error', errorHandler);
        }
      } catch (error) {
        reject(error);
      }
    });
    
    // FIXED: 10 second timeout for map initialization
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Map initialization timeout')), 10000);
    });
    
    const map = await Promise.race([mapPromise, timeoutPromise]);
    console.log('[HomeScreen] Map initialized successfully');
    return map;
    
  } catch (error) {
    console.error('[HomeScreen] Map initialization error:', error);
    throw new Error(`Failed to initialize map: ${error.message}`);
  }
}

// FIXED: Safe content loading with rate limiting
async function loadContent() {
  try {
    console.log('[HomeScreen] Loading content with safety measures...');
    
    // FIXED: Load content with proper concurrency control
    const results = await Promise.allSettled([
      loadStoreDataWithRetry(),
      loadBlogDataWithRetry()
    ]);
    
    const storeFeatures = results[0].status === 'fulfilled' ? results[0].value : [];
    const blogFeatures = results[1].status === 'fulfilled' ? results[1].value : [];
    
    if (results[0].status === 'rejected') {
      console.warn('[HomeScreen] Store data loading failed:', results[0].reason);
    }
    
    if (results[1].status === 'rejected') {
      console.warn('[HomeScreen] Blog data loading failed:', results[1].reason);
    }
    
    console.log(`[HomeScreen] Content loaded: ${storeFeatures.length} stores, ${blogFeatures.length} blogs`);
    return [storeFeatures, blogFeatures];
    
  } catch (error) {
    console.error('[HomeScreen] Content loading error:', error);
    return [[], []]; // Return empty arrays as fallback
  }
}


// IMPROVED: Load store data with retry mechanism
async function loadStoreDataWithRetry(maxRetries = 3) {
  const cacheKey = 'store-data';
  
  // Check cache first
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[HomeScreen] Using cached store data');
    return cached.data;
  }
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[HomeScreen] Loading store data, attempt ${attempt}/${maxRetries}`);
      
      // FIXED: Check if we can make this request
      if (activeRequests.size >= MAX_CONCURRENT_REQUESTS) {
        throw new Error('Too many concurrent requests');
      }
      
      const requestId = `store-data-${Date.now()}`;
      activeRequests.add(requestId);
      
      try {
        const storeDataPromise = geojsonStore();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Store data timeout')), 15000);
        });
        
        const storeData = await Promise.race([storeDataPromise, timeoutPromise]);
        
        if (storeData && storeData.features) {
          console.log(`[HomeScreen] Store data loaded successfully: ${storeData.features.length} features`);
          
          // Cache the result
          requestCache.set(cacheKey, {
            data: storeData.features,
            timestamp: Date.now()
          });
          
          return storeData.features;
        } else {
          throw new Error('Invalid store data format');
        }
      } finally {
        activeRequests.delete(requestId);
      }
      
    } catch (error) {
      console.error(`[HomeScreen] Store data load attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.warn('[HomeScreen] All store data load attempts failed, returning empty array');
        return [];
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// IMPROVED: Load blog data with retry mechanism
async function loadBlogDataWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[HomeScreen] Loading blog data, attempt ${attempt}/${maxRetries}`);
      
      const blogData = await Promise.race([
        loadBlogFeatures(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Blog data timeout')), 15000))
      ]);
      
      if (Array.isArray(blogData)) {
        console.log(`[HomeScreen] Blog data loaded successfully: ${blogData.length} features`);
        return blogData;
      } else {
        throw new Error('Invalid blog data format');
      }
    } catch (error) {
      console.error(`[HomeScreen] Blog data load attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.warn('[HomeScreen] All blog data load attempts failed, continuing with empty array');
        return [];
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// IMPROVED: Load blog features from API with better error handling
async function loadBlogFeatures() {
  try {
    console.log('[HomeScreen] Fetching blog features from API...');
    
    const response = await fetch('/api/geojson/blogs', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[HomeScreen] Blog API response:', data);
      
      if (data && data.features && Array.isArray(data.features)) {
        console.log(`[HomeScreen] Blog features loaded: ${data.features.length} items`);
        return data.features;
      } else {
        console.warn('[HomeScreen] Invalid blog data structure:', data);
        return [];
      }
    } else {
      console.error('[HomeScreen] Blog API request failed:', response.status, response.statusText);
      
      // Try to read the response as text to see what we're getting
      try {
        const responseText = await response.text();
        console.error('[HomeScreen] Blog API error response:', responseText.substring(0, 200));
      } catch (e) {
        console.error('[HomeScreen] Could not read error response');
      }
      
      return [];
    }
  } catch (error) {
    console.error('[HomeScreen] Error loading blog features:', error);
    return [];
  }
}

// IMPROVED: Initialize geocoder with error handling
async function initializeGeocoder(map) {
  try {
    const geocoder = createGeocoderInput(HeaderHome.getLastSelectedResult());
    
    geocoder.on("result", (result) => {
      try {
        handleGeocoderResult(result, map);
      } catch (error) {
        console.error('[HomeScreen] Geocoder result handler error:', error);
      }
    });
    
    geocoder.on("clear", () => {
      try {
        const results = document.getElementById("results");
        if (results) results.innerText = "";
      } catch (error) {
        console.error('[HomeScreen] Geocoder clear handler error:', error);
      }
    });
    
    return geocoder;
  } catch (error) {
    console.error('[HomeScreen] Geocoder initialization failed:', error);
    throw error;
  }
}

// IMPROVED: Add markers to map with error handling
async function addMarkersToMap(map, features) {
  const markers = [];
  
  if (!features || features.length === 0) {
    console.log('[HomeScreen] No features to add as markers');
    return markers;
  }
  
  console.log(`[HomeScreen] Adding ${features.length} markers to map`);
  
  features.forEach((feature, index) => {
    try {
      // Validate feature structure
      if (!feature || !feature.geometry || !feature.geometry.coordinates) {
        console.warn(`[HomeScreen] Invalid feature at index ${index}:`, feature);
        return;
      }
      
      const coordinates = feature.geometry.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        console.warn(`[HomeScreen] Invalid coordinates for feature at index ${index}:`, coordinates);
        return;
      }
      
      const [lng, lat] = coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        console.warn(`[HomeScreen] Invalid coordinate values for feature at index ${index}:`, { lng, lat });
        return;
      }
      
      // Create marker element
      const el = document.createElement("div");
      el.className = "marker";
      
      // Create popup content
      const popupContent = `
        <h3>${feature.properties?.title || 'Untitled'}</h3>
        <p>
          <div id="category">${feature.properties?.categoryType || feature.properties?.variant || 'Unknown'}</div>
          ${feature.properties?.address || ''}
        </p>
      `;
      
      // Create and add marker
      const newMarker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
        .addTo(map);
      
      markers.push({ marker: newMarker, feature: feature });
      
    } catch (error) {
      console.error(`[HomeScreen] Error creating marker for feature at index ${index}:`, error);
    }
  });
  
  console.log(`[HomeScreen] Successfully added ${markers.length} markers to map`);
  return markers;
}

// IMPROVED: Set up map event handlers
function setupMapEventHandlers(map, allFeatures, markers) {
  try {
    // Map moveend event listener
    map.on("moveend", function () {
      try {
        const mapBounds = map.getBounds();
        const center = map.getCenter();
        const filteredFeatures = filterFeaturesInBounds(allFeatures, mapBounds);
        const sortedFeatures = sortFeaturesByDistance(filteredFeatures, center);

        // Render different types of features
        renderFeatures(sortedFeatures, map);
      } catch (error) {
        console.error('[HomeScreen] Error in moveend handler:', error);
      }
    });
    
    // Map click event listener
    map.on('click', function(e) {
      try {
        const features = map.queryRenderedFeatures(e.point);
    
        if (features.length > 0) {
          const feature = features[0];
          
          if (['city-boundaries', 'counties', 'admin-1'].includes(feature.source)) {
            flyToCity(map, feature);
          }
          
          const bbox = [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5],
          ];
          
          const selectedFeatures = map.queryRenderedFeatures(bbox, {
            layers: ["counties"],
          });
          
          const fips = selectedFeatures.map((feature) => feature.properties.FIPS);
          map.setFilter("counties-highlighted", ["in", "FIPS", ...fips]);
    
          if (features.length > 0) {
            const feature = features[0];
    
            let color;
            switch (feature.source) {
              case "counties":
                color = "#FF0000";
                break;
              case "admin-1":
                color = "#00FF00";
                break;
              case "city-boundaries":
                color = "#0000FF";
                break;
              default:
                color = "#000000";
            }
            
            if (['city-boundaries', 'counties', 'admin-1'].includes(feature.source)) {
              flyToCity(map, feature);
            }
            
            geoPopup(feature, map);
    
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                '<pre style="color: ' +
                  color +
                  ';">' +
                  JSON.stringify(feature.properties, null, 2) +
                  "</pre>"
              )
              .addTo(map);
          }
        }
      } catch (error) {
        console.error('[HomeScreen] Error in click handler:', error);
      }
    });
    
    console.log('[HomeScreen] Map event handlers set up successfully');
  } catch (error) {
    console.error('[HomeScreen] Error setting up map event handlers:', error);
  }
}

// IMPROVED: Set up search functionality
function setupSearchFunctionality(map, markers) {
  try {
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        try {
          const location = HeaderHome.getLastSelectedResult();
          const categoryElement = document.getElementById("category");
          const categoryType = categoryElement ? categoryElement.value : null;
          
          if (categoryType || location) {
            markers.forEach((m) => {
              const el = m.marker.getElement();
              if (el) {
                el.id =
                  !categoryType ||
                  m.feature.properties.categoryType?.toLowerCase() !==
                    categoryType.toLowerCase()
                    ? "markerInactive"
                    : "markerActive";
              }
            });

            if (location && location.geometry && location.geometry.coordinates) {
              map.flyTo({ center: location.geometry.coordinates, zoom: 15 });
            }
          } else {
            alert("Please enter a categoryType or select a location");
          }
        } catch (error) {
          console.error('[HomeScreen] Error in search button handler:', error);
        }
      });
    }
    
    console.log('[HomeScreen] Search functionality set up successfully');
  } catch (error) {
    console.error('[HomeScreen] Error setting up search functionality:', error);
  }
}

// IMPROVED: Initialize user location with better error handling
async function initializeUserLocation(map, features) {
  try {
    console.log('[HomeScreen] Initializing user location...');
    
    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
          enableHighAccuracy: false
        });
      });
      
      const userCoordinates = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      
      console.log('[HomeScreen] User location obtained:', userCoordinates);
      
      const userLocationMarker = createUserLocationMarker(userCoordinates, map);

      const mapBounds = map.getBounds();
      const filteredFeatures = filterFeaturesInBounds(features, mapBounds);
      const sortedFeatures = sortFeaturesByDistance(filteredFeatures, userCoordinates);
      
      renderFeatures(sortedFeatures, map);
      zoomToShowAtLeastThreePins(map, features, userCoordinates);
      
    } else {
      console.log('[HomeScreen] Geolocation not available, rendering all features');
      renderFeatures(features.slice(0, 20), map); // Show first 20 features
    }
  } catch (error) {
    console.error('[HomeScreen] Error getting user location:', error);
    // Fallback: render features without geolocation
    if (features.length > 0) {
      renderFeatures(features.slice(0, 20), map);
    }
  }
}

// IMPROVED: Render features with better error handling
function renderFeatures(features, map) {
  console.log('[HomeScreen] Rendering features:', features?.length || 0);

  const elements = {
    postListing: document.getElementById("postListing"),
    postStores: document.getElementById("postStoresContent"), // Updated to use content div
    postReview: document.getElementById("postReview"),
    postArticle: document.getElementById("postArticle"),
    postBlog: document.getElementById("postBlog"),
  };

  // Clear existing content
  Object.values(elements).forEach(el => {
    if (el) el.innerHTML = '';
  });

  if (!features || features.length === 0) {
    console.log('[HomeScreen] No features to render');
    // Show empty state messages
    Object.entries(elements).forEach(([key, el]) => {
      if (el) {
        el.innerHTML = '<div class="empty-state"><span class="text02">No content available</span></div>';
      }
    });
    return;
  }

  let rendered = { stores: 0, blogs: 0, articles: 0, reviews: 0 };

  features.forEach((feature, index) => {
    try {
      console.log(`[HomeScreen] Processing feature ${index}:`, feature?.properties?.variant);
      
      if (!feature || !feature.properties || !feature.properties.variant) {
        console.warn('[HomeScreen] Invalid feature format:', feature);
        return;
      }

      let element;
      const variant = feature.properties.variant;
      const containerName = `post${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
      const container = elements[containerName];

      if (!container) {
        console.warn(`[HomeScreen] No container found for variant: ${variant}`);
        return;
      }

      const userCoordinates = getUserCoordinates();

      switch (variant) {
        case "stores":
          element = createGeojsonStoreListing(feature, map, userCoordinates);
          rendered.stores++;
          break;
        case "reviews":
          element = createGeojsonReviewListing(feature, map, userCoordinates);
          rendered.reviews++;
          break;
        case "articles":
          element = createGeojsonArticleListing(feature, map, userCoordinates);
          rendered.articles++;
          break;
        case "blogs":
          element = createGeojsonBlogListing(feature, map, userCoordinates);
          rendered.blogs++;
          break;
        default:
          console.warn("[HomeScreen] Unknown feature variant:", variant);
          return;
      }

      if (element) {
        container.appendChild(element);
        console.log(`[HomeScreen] Added ${variant} element to container`);
      } else {
        console.warn(`[HomeScreen] Failed to create element for ${variant}`);
      }
    } catch (error) {
      console.error(`[HomeScreen] Error processing feature ${index}:`, error);
      // Continue with next feature
    }
  });

  console.log('[HomeScreen] Rendering complete:', rendered);
}

// Helper functions (unchanged but with error handling)
function getUserCoordinates() {
  // This should return the user's current coordinates
  // For now, return a default value or implement geolocation
  return [0, 0];
}

function flyToCity(map, feature) {
  try {
    map.flyTo({
      center: feature.geometry.coordinates[0][0], // Assuming the city's coordinates are the first coordinates of the geometry
      zoom: 6,
      essential: true,
    });
  } catch (error) {
    console.error('[HomeScreen] Error flying to city:', error);
  }
}

function createUserLocationMarker(userCoordinates, map) {
  try {
    const marker = document.createElement("div");
    marker.className = "icon-mapMarker-userLocation";
    return new mapboxgl.Marker(marker).setLngLat(userCoordinates).addTo(map);
  } catch (error) {
    console.error('[HomeScreen] Error creating user location marker:', error);
    return null;
  }
}

function zoomToShowAtLeastThreePins(map, features, center) {
  try {
    const zoomOut = () => {
      const mapBounds = map.getBounds();
      const filteredFeatures = filterFeaturesInBounds(features, mapBounds);
      if (filteredFeatures.length < 15) {
        map.zoomOut(1, { around: center });
        setTimeout(zoomOut, 100);
      } else {
        renderFeatures(filteredFeatures, map);
      }
    };
    zoomOut();
  } catch (error) {
    console.error('[HomeScreen] Error in zoom function:', error);
  }
}

function filterFeaturesInBounds(features, bounds) {
  try {
    return features.filter((feature) => {
      if (!feature?.geometry?.coordinates) return false;
      const coordinates = feature.geometry.coordinates;
      return bounds.contains(coordinates);
    });
  } catch (error) {
    console.error('[HomeScreen] Error filtering features:', error);
    return [];
  }
}

function sortFeaturesByDistance(features, center) {
  try {
    return features.sort((a, b) => {
      const distanceA = getDistance(center, a.geometry.coordinates);
      const distanceB = getDistance(center, b.geometry.coordinates);
      return distanceA - distanceB;
    });
  } catch (error) {
    console.error('[HomeScreen] Error sorting features:', error);
    return features;
  }
}

function getDistance(coord1, coord2) {
  try {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371e3; // Earth's radius in meters
    const lat1 = toRadians(coord1[1]);
    const lat2 = toRadians(coord2[1]);
    const deltaLat = toRadians(coord2[1] - coord1[1]);
    const deltaLng = toRadians(coord2[0] - coord1[0]);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  } catch (error) {
    console.error('[HomeScreen] Error calculating distance:', error);
    return Infinity;
  }
}

function handleGeocoderResult(result, map) {
  try {
    HeaderHome(result);
    const searchedCityName = result.result.text;
    const cityBoundaryFeatures = map.querySourceFeatures("city-boundaries", {
      filter: ["==", "NAME", searchedCityName],
    });

    if (cityBoundaryFeatures.length > 0) {
      const cityBoundary = cityBoundaryFeatures[0];
      const cityBoundaryCoordinates = cityBoundary.geometry.coordinates;
      const bounds = cityBoundaryCoordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(
          cityBoundaryCoordinates[0][0],
          cityBoundaryCoordinates[0][0]
        )
      );
      map.fitBounds(bounds, { padding: 50, duration: 1000 });

      if (map.getLayer("searched-city-boundary")) {
        map.removeLayer("searched-city-boundary");
      }
      if (map.getLayer("searched-city-fill")) {
        map.removeLayer("searched-city-fill");
      }
      map.addLayer({
        id: "searched-city-boundary",
        type: "line",
        source: "city-boundaries",
        filter: ["==", "NAME", searchedCityName],
      });
      map.addLayer({
        id: "searched-city-fill",
        type: "fill",
        source: "city-boundaries",
        filter: ["==", "NAME", searchedCityName],
      });
    } else {
      const store = {
        geometry: { coordinates: result.result.geometry.coordinates },
      };
      const bbox = result.result.bbox;
      flyToSearch(store, map, bbox);
    }
  } catch (error) {
    console.error('[HomeScreen] Error handling geocoder result:', error);
  }
}

function flyToSearch(store, map, bbox) {
  try {
    if (bbox) {
      map.fitBounds(bbox, {
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
        maxZoom: 15,
        essential: true,
      });
    } else {
      map.flyTo({
        center: store.geometry.coordinates,
        zoom: 15,
        essential: true,
      });
    }
  } catch (error) {
    console.error('[HomeScreen] Error flying to search:', error);
  }
}

export default HomeScreen;

///////////////////////// END FIXED HOMESCREEN COMPONENT /////////////////////////