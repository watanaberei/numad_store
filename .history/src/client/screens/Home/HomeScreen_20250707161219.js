// src/screens/HomeScreen.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../../components/map/MapApi.js";
import { geojsonStore } from "../../components/map/geo/GeojsonStores.js";
import { createMapMarker } from "../../components/map/MapMarker.js";
import { createGeojsonListing } from "../../components/map/geo/GeojsonListing.js";
import { createGeojsonStoreListing } from "../../components/cards/store/cardStoreGeojson.js";
import { createGeojsonReviewListing } from "../../components/map/geo/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../../components/map/geo/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../../components/cards/blog/cardBlogGeojson.js";
import { createGeocoderInput } from "../../components/map/geo/GeocoderInput.js";
// import AllBlog from "../components/AllBlog.js";
import HeaderHome from "../../components/header/HeaderHome.js";
import mapRoute from "../../components/map/mapRoute.js";
import { geoPopup } from "../../components/map/geo/GeoPopup.js";
import polyline from "@mapbox/polyline";
import { getStore } from "../../API/apiContentful.js";

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
              ///////////////////////// START FIXED CONTAINER /////////////////////////
              <div id="postBlogs" class="grid03 col03 postBlogs card-blog">
              </div>
              ///////////////////////// END FIXED CONTAINER /////////////////////////
            </div>

            <div class="list" id="grid03 col03 listing-article">
              <div class="col03 heading">
                <span class="header01">Article</span>
              </div>
              ///////////////////////// START FIXED CONTAINER /////////////////////////
              <div id="postArticles" class="grid03 col03 postArticles card-article">
              </div>
              ///////////////////////// END FIXED CONTAINER /////////////////////////
            </div>

            <div class="list" id="grid03 col03 listing-review">
              <div class="col03 heading">
                <span class="header01">Reviewed</span>
              </div>
              ///////////////////////// START FIXED CONTAINER /////////////////////////
              <div id="postReviews" class="grid03 col03 postReviews card-review">
              </div>
              ///////////////////////// END FIXED CONTAINER /////////////////////////
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

// FIXED after_render method - add proper error handling and sequencing
after_render: async () => {
  try {
    console.log('[HomeScreen] Starting after_render...');
    
    // Initialize map first
    const map = initMap();
    window.map = map;
    
    // Initialize features arrays
    let storeFeatures = [];
    let blogFeatures = [];
    
    // Load store data with error handling
    try {
      console.log('[HomeScreen] Loading store features...');
      const storeData = await geojsonStore();
      storeFeatures = storeData.features || [];
      console.log('[HomeScreen] Store features loaded:', storeFeatures.length);
    } catch (error) {
      console.error('[HomeScreen] Error loading store features:', error);
      storeFeatures = [];
    }
    
    // Load blog data with error handling
    try {
      console.log('[HomeScreen] Loading blog features...');
      blogFeatures = await loadBlogFeatures();
      console.log('[HomeScreen] Blog features loaded:', blogFeatures.length);
    } catch (error) {
      console.error('[HomeScreen] Error loading blog features:', error);
      blogFeatures = [];
    }
    
    // Combine all features
    const allFeatures = [...storeFeatures, ...blogFeatures];
    console.log('[HomeScreen] Total features:', allFeatures.length);
    
    // Initialize the geocoder with error handling
    try {
      const geocoder = createGeocoderInput(HeaderHome.getLastSelectedResult());
      geocoder.on("result", handleGeocoderResult);
      geocoder.on("clear", () => {
        const results = document.getElementById("results");
        if (results) results.innerText = "";
      });
    } catch (error) {
      console.error('[HomeScreen] Error initializing geocoder:', error);
    }
    
    // Add markers to map
    var markers = [];
    
    if (allFeatures.length > 0) {
      allFeatures.forEach(function (marker) {
        try {
          var el = document.createElement("div");
          el.className = "marker";
          var newMarker = new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                "<h3>" +
                  (marker.properties.title || 'Untitled') +
                  "</h3><p>" +
                  '<div id="category">' +
                  (marker.properties.categoryType || 'Unknown') +
                  "</div>" +
                  (marker.properties.address || '') +
                  "</p>"
              )
            )
            .addTo(map);
          markers.push({ marker: newMarker, feature: marker });
        } catch (error) {
          console.error('[HomeScreen] Error creating marker:', error);
        }
      });
    }
    
    const categories = markers.map((m) => m.feature.properties.categoryType).filter(Boolean);
    var allMarkers = markers;
    
    // Search button event listener
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        try {
          var location = HeaderHome.getLastSelectedResult();
          var categoryElement = document.getElementById("category");
          var categoryType = categoryElement ? categoryElement.value : null;
          
          if (categoryType || location) {
            allMarkers.forEach((m) => {
              var el = m.marker.getElement();
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
    
    // Map moveend event listener
    map.on("moveend", function () {
      try {
        const mapBounds = map.getBounds();
        const center = map.getCenter();
        const filteredFeatures = filterFeaturesInBounds(allFeatures, mapBounds);
        const sortedFeatures = sortFeaturesByDistance(filteredFeatures, center);

        // Render different types of features
        renderFeatures(sortedFeatures, map, "postListing");
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

    // Set current location with error handling
    try {
      setCurrentLocation(map, allFeatures);
    } catch (error) {
      console.error('[HomeScreen] Error setting current location:', error);
      // Fallback: render features without geolocation
      if (allFeatures.length > 0) {
        renderFeatures(allFeatures.slice(0, 20), map);
      }
    }
    
    console.log('[HomeScreen] after_render completed successfully');
    
  } catch (error) {
    console.error('[HomeScreen] Critical error in after_render:', error);
  }
},
};

// Function to load blog features from API
async function loadBlogFeatures() {
  try {
    console.log('[HomeScreen] Loading blog features...');
    const response = await fetch('/api/geojson/blogs');
    
    if (response.ok) {
      const data = await response.json();
      console.log('[HomeScreen] Blog features loaded:', data.features?.length || 0);
      return data.features || [];
    } else {
      console.error('[HomeScreen] Failed to load blog features:', response.status, response.statusText);
      
      // Try to read the response as text to see what we're getting
      const responseText = await response.text();
      console.error('[HomeScreen] Response text:', responseText.substring(0, 200));
      
      return [];
    }
  } catch (error) {
    console.error('[HomeScreen] Error loading blog features:', error);
    return [];
  }
}


function handleGeocoderResult(result) {
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

    map.addLayer(
      {
        id: "counties",
        type: "fill",
        source: "counties",
        "source-layer": "original",
        paint: {
          "fill-outline-color": "rgba(0,0,0,0.1)",
          "fill-color": "rgba(0,0,0,0.1)",
        },
      },
      "building"
    );
    map.addLayer(
      {
        id: "counties-highlighted",
        type: "fill",
        source: "counties",
        "source-layer": "original",
        paint: {
          "fill-outline-color": "#484896",
          "fill-color": "#6e599f",
          "fill-opacity": 0.75,
        },
        filter: ["in", "FIPS", ""],
      },
      "building"
    );
  } else {
    const store = {
      geometry: { coordinates: result.result.geometry.coordinates },
    };
    const bbox = result.result.bbox;
    flyToSearch(store, map, bbox);
  }
}


function setCurrentLocation(map, features) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userCoordinates = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      const userLocationMarker = createUserLocationMarker(userCoordinates, map);

      const mapBounds = map.getBounds();
      const filteredFeatures = filterFeaturesInBounds(features, mapBounds);
      const sortedFeatures = sortFeaturesByDistance(
        filteredFeatures,
        userCoordinates
      );
      renderFeatures(sortedFeatures, map);

      zoomToShowAtLeastThreePins(map, features, userCoordinates);
    });
  } else {
    renderFeatures(features, map);
  }
}

function mapRoutes(userCoordinates, features) {
  features.forEach((feature, index) => {
    const YOUR_MAPBOX_ACCESS_TOKEN =
      "pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsa3R6aG93YzAyeDUzZXBoY2h6ZDBjN2gifQ.ef675JLTqdzPlw1tu_wHOA";
    let userLonLat = [userCoordinates[1], userCoordinates[0]];
    let featureLonLat = [
      feature.geometry.coordinates[1],
      feature.geometry.coordinates[0],
    ];

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLonLat[0]}%2C${userLonLat[1]}%3B${featureLonLat[0]}%2C${featureLonLat[1]}?alternatives=false&geometries=polyline&language=en&overview=simplified&steps=true&access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`;

    fetch(directionsUrl)
      .then((response) => response.json())
      .then((data) => {
        const route = data.routes[0].geometry;
        const routeId = `route-${index}`;
        const decoded = polyline.toGeoJSON(route);
        if (map.getLayer(routeId)) {
          map.removeLayer(routeId);
          map.removeSource(routeId);
        }
        map.addLayer({
          id: routeId,
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: decoded,
            },
          },
          paint: {
            "line-width": 2,
            "line-color": "#007cbf",
          },
        });
      })
      .catch((error) => {
        //console.error(`Failed to fetch route data: ${error}`);
      });
  });
}

function filterFeaturesInBounds(features, bounds) {
  return features.filter((feature) => {
    const coordinates = feature.geometry.coordinates;
    return bounds.contains(coordinates);
  });
}

function sortFeaturesByDistance(features, center) {
  return features.sort((a, b) => {
    const distanceA = getDistance(center, a.geometry.coordinates);
    const distanceB = getDistance(center, b.geometry.coordinates);
    return distanceA - distanceB;
  });
}

///////////////////////// START FIXED RENDER FEATURES /////////////////////////
function renderFeatures(features, map) {
  console.log('[HomeScreen] Rendering features:', features.length);

  const elements = {
    postListing: document.getElementById("postListing"),
    postStores: document.getElementById("postStores"),
    postReviews: document.getElementById("postReviews"),     // Fixed plural
    postArticles: document.getElementById("postArticles"),   // Fixed plural
    postBlogs: document.getElementById("postBlogs"),         // Fixed plural
  };

  // Clear existing content
  Object.values(elements).forEach(el => {
    if (el) el.innerHTML = '';
  });

  if (!features || features.length === 0) {
    console.log('[HomeScreen] No features to render');
    return;
  }

  features.forEach((feature, index) => {
    try {
      console.log(`[HomeScreen] Processing feature ${index}:`, feature);
      
      if (!feature.properties || !feature.properties.variant) {
        console.warn('[HomeScreen] Invalid feature format:', feature);
        return;
      }

      let element;
      // Map variant to correct container name with plural form
      const variantMapping = {
        'stores': 'postStores',
        'reviews': 'postReviews',
        'articles': 'postArticles', 
        'blogs': 'postBlogs'
      };
      
      const containerName = variantMapping[feature.properties.variant];
      const container = elements[containerName];

      if (!container) {
        console.warn(`[HomeScreen] No container found for variant: ${feature.properties.variant}`);
        return;
      }

      const userCoordinates = getUserCoordinates();

      switch (feature.properties.variant) {
        case "stores":
          element = createGeojsonStoreListing(feature, map, userCoordinates);
          break;
        case "reviews":
          element = createGeojsonReviewListing(feature, map, userCoordinates);
          break;
        case "articles":
          element = createGeojsonArticleListing(feature, map, userCoordinates);
          break;
        case "blogs":
          element = createGeojsonBlogListing(feature, map, userCoordinates);
          break;
        default:
          console.warn("[HomeScreen] Unknown feature variant:", feature.properties.variant);
          return;
      }

      if (element) {
        container.appendChild(element);
        console.log(`[HomeScreen] Added ${feature.properties.variant} element to container`);
      } else {
        console.warn(`[HomeScreen] Failed to create element for ${feature.properties.variant}`);
      }
    } catch (error) {
      console.error(`[HomeScreen] Error processing feature ${index}:`, error);
      // Continue with next feature
    }
  });
}
///////////////////////// END FIXED RENDER FEATURES /////////////////////////

function getUserCoordinates() {
  // This should return the user's current coordinates
  // For now, return a default value or implement geolocation
  return [0, 0];
}

function flyToCity(map, feature) {
  map.flyTo({
    center: feature.geometry.coordinates[0][0], // Assuming the city's coordinates are the first coordinates of the geometry
    zoom: 6,
    essential: true, // This option enables the animation even if the user has prefers-reduced-motion enabled
  });
}

function flyToSearch(store, map, bbox) {
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
}

function createUserLocationMarker(userCoordinates, map) {
  const marker = document.createElement("div");
  marker.className = "icon-mapMarker-userLocation";
  return new mapboxgl.Marker(marker).setLngLat(userCoordinates).addTo(map);
}

function zoomToShowAtLeastThreePins(map, features, center) {
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
}

function filterFeaturesInBound(features, bounds, currentLocation) {
  const MAX_FEATURES = 6;
  let featureLists = {
    stores: [],
    blogs: [],
    articles: [],
    reviews: [],
  };

  for (let feature of features) {
    if (bounds.contains(feature.geometry.coordinates)) {
      // Calculate the distance from the current location to the feature
      let distance = calculateDistance(
        currentLocation,
        feature.geometry.coordinates
      );

      // Add the feature to the appropriate list, along with its distance
      featureLists[feature.type].push({ feature, distance });
    }
  }

  // For each type of feature, sort the features by distance and take the closest MAX_FEATURES
  for (let type in featureLists) {
    featureLists[type].sort((a, b) => a.distance - b.distance);
    featureLists[type] = featureLists[type]
      .slice(0, MAX_FEATURES)
      .map((item) => item.feature);
  }

  // Combine all the feature lists into one array
  let filteredFeatures = [].concat(...Object.values(featureLists));

  return filteredFeatures;
}

function getDistance(coord1, coord2) {
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
}

export default HomeScreen;



































// function mapRoutes(userCoordinates, features) {
//     features.forEach((feature, index) => {
//       const YOUR_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsa3R6aG93YzAyeDUzZXBoY2h6ZDBjN2gifQ.ef675JLTqdzPlw1tu_wHOA";
//       let userLonLat = [userCoordinates[1], userCoordinates[0]];
//       let featureLonLat = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

//       const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLonLat[0]}%2C${userLonLat[1]}%3B${featureLonLat[0]}%2C${featureLonLat[1]}?alternatives=false&geometries=polyline&language=en&overview=simplified&steps=true&access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`;

//       fetch(directionsUrl)
//       .then(response => response.json())
//       .then(data => {
//         const route = data.routes[0].geometry;
//         const routeId = `route-${index}`;
//         const decoded = polyline.toGeoJSON(route);
//         if (map.getLayer(routeId)) {
//           map.removeLayer(routeId);
//           map.removeSource(routeId);
//         }
//         map.addLayer({
//           id: routeId,
//           type: 'line',
//           source: {
//             type: 'geojson',
//             data: {
//               type: 'Feature',
//               geometry: decoded,
//             },
//           },
//           paint: {
//             'line-width': 2,
//             'line-color': '#007cbf',
//           },
//         });
//       })
//       .catch(error => {
//         //console.error(`Failed to fetch route data: ${error}`);
//       });
//     });
//   }

// function filterFeaturesInBounds(features, bounds) {
//   return features.filter((feature) => {
//     const coordinates = feature.geometry.coordinates;
//     return bounds.contains(coordinates);
//   });
// }

// function sortFeaturesByDistance(features, center) {
//   return features.sort((a, b) => {
//     const distanceA = getDistance(center, a.geometry.coordinates);
//     const distanceB = getDistance(center, b.geometry.coordinates);
//     return distanceA - distanceB;
//   });
// }

// function renderFeatures(features, map) {
//   // References to DOM elements
//   const elements = {
//     postListing: document.getElementById("postListing"),
//     postStores: document.getElementById("postStores"),
//     postReview: document.getElementById("postReview"),
//     postArticle: document.getElementById("postArticle"),
//     postBlog: document.getElementById("postBlog")
//   };

//   // Clear out old listings
//   for (let key in elements) {
//     if (elements[key]) {
//       elements[key].innerHTML = "";
//     }
//   }

//   features.forEach((feature) => {
//     let element;
//     switch (feature.properties.type) {
//       case 'store':
//         element = createGeojsonStoreListing(feature);
//         elements.postStores.appendChild(element);
//         break;
//       case 'review':
//         element = createGeojsonReviewListing(feature);
//         elements.postReview.appendChild(element);
//         break;
//       case 'article':
//         element = createGeojsonArticleListing(feature);
//         elements.postArticle.appendChild(element);
//         break;
//       case 'blog':
//         element = createGeojsonBlogListing(feature);
//         elements.postBlog.appendChild(element);
//         break;
//       // Include additional cases as necessary
//       default:
//         //console.warn('Unknown feature type:', feature.properties.type);
//     }
//   });
// }

// function mapRoutes(userCoordinates, features) {
//   features.forEach((feature, index) => {
//     const YOUR_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNla3R6aG93YzAyeDUzZXBoY2h6ZDBjN2gifQ.ef675JLTqdzPlw1tu_wHOA";
//     let userLonLat = [userCoordinates[1], userCoordinates[0]];
//     let featureLonLat = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

//     const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLonLat[0]}%2C${userLonLat[1]}%3B${featureLonLat[0]}%2C${featureLonLat[1]}?alternatives=false&geometries=polyline&language=en&overview=simplified&steps=true&access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`;

//     fetch(directionsUrl)
//       .then(response => response.json())
//       .then(data => {
//         const route = data.routes[0].geometry;
//         const routeId= `route-${index}`; // Unique id for each layer
//       const decoded = polyline.toGeoJSON(route);
//       // //console.log(decoded);
//       // If layer already exists, remove it
//       if (map.getLayer(routeId)) {
//         map.removeLayer(routeId);
//         map.removeSource(routeId);
//       }

//         // Add new layer
//         map.addLayer({
//           id: routeId,
//           type: 'line',
//           source: {
//             type: 'geojson',
//             data: {
//               type: 'Feature',
//               geometry: decoded,  // Use decoded geometry here
//             },
//           },
//           paint: {
//             'line-width': 2,
//             'line-color': '#007cbf',
//           },
//         });

//       })
//       .catch(error => {
//         //console.error(`Failed to fetch route data: ${error}`);
//       });
//   });
// }
// function filterFeaturesInBounds(features, bounds) {
//   return features.filter((feature) => {
//     const coordinates = feature.geometry.coordinates;
//     return bounds.contains(coordinates);
//   });
// }
// function sortFeaturesByDistance(features, center) {
//   return features.sort((a, b) => {
//     const distanceA = getDistance(center, a.geometry.coordinates);
//     const distanceB = getDistance(center, b.geometry.coordinates);
//     return distanceA - distanceB;
//   });
// }

// function renderSection(containerId, features) {
//   const container = document.getElementById(containerId);
//   if (!container) {
//       //console.error(`Container with ID ${containerId} not found`);
//       return;
//   }

//   container.innerHTML = ''; // Clear the container

//   features.forEach(feature => {
//       let element;
//       switch (feature.properties.type) {
//           case 'series':
//               element = createGeojsonArticleListing(feature);
//               break;
//           case 'store':
//               element = createGeojsonStoreListing(feature);
//               break;
//           case 'reviewed':
//               element = createGeojsonReviewListing(feature);
//               break;
//           case 'blog':
//               element = createGeojsonBlogListing(feature);
//               break;
//           default:
//               // If an unknown type is encountered, it's ignored
//               //console.warn(`Ignored unknown feature type: ${feature.properties.type}`);
//               break;
//       }

//       if (element) {
//           container.appendChild(element);
//       }
//   });
// }

// function renderFeatures(features, map, containerId) {
//   const container = document.getElementById(containerId);
//   if (!container) {
//       //console.error(`Container with ID ${containerId} not found`);
//       return;
//   }

//   container.innerHTML = ''; // Clear the container

//   features.forEach(feature => {
//       let element;
//       // Determine the type of feature and create the appropriate listing element
//       switch (feature.properties.type) {
//           case 'series':
//               element = createGeojsonArticleListing(feature);
//               break;
//           case 'store':
//               element = createGeojsonStoreListing(feature);
//               break;
//           case 'reviewed':
//               element = createGeojsonReviewListing(feature);
//               break;
//           case 'blog':
//               element = createGeojsonBlogListing(feature);
//               break;
//           default:
//               //console.error(`Unknown feature type: ${feature.properties.type}`);
//               return;
//       }

//       if (element) {
//           container.appendChild(element);
//       }
//   });
// }

// // function renderFeatures(features, map) {
// //   const elements = {
// //     postListing: document.getElementById("postListing"),
// //     postStores: document.getElementById("postStores"),
// //     postReview: document.getElementById("postReview"),
// //     postArticle: document.getElementById("postArticle"),
// //     postBlog: document.getElementById("postBlog")
// //   };

// //   // Clear out old listings
// //   for (let key in elements) {
// //     elements[key].innerHTML = "";
// //   }

// //   features.forEach((store) => {
// //     const listings = {
// //       postListing: createGeojsonListing(store),
// //       postStores: createGeojsonStoreListing(store),
// //       postReview: createGeojsonReviewListing(store),
// //       postArticle: createGeojsonArticleListing(store),
// //       postBlog: createGeojsonBlogListing(store)
// //     };

// //     for (let key in listings) {
// //       if (listings[key] && listings[key].innerHTML.trim() !== "") {
// //         elements[key].appendChild(listings[key]);
// //       }
// //     }
// //   });
// // }

// function flyToStore(store, map) {
//   map.flyTo({
//     center: store.geometry.coordinates,
//     zoom: 15,
//     // pitch: 80,
//     bearing: 41,
//     essential: true,
//   });

//   map.once("moveend", () => {
//     map.on("move", () => {
//       const pitch = map.getPitch();
//       const bearing = map.getBearing();

//       if (pitch > 0) {
//         map.setPitch(pitch - 1);
//       }

//       if (bearing !== 0) {
//         map.setBearing(bearing - 1);
//       }
//     });
//   });
// }
// function flyToSearch(store, map, bbox) {
//   if (bbox) {
//     map.fitBounds(bbox, {
//       padding: { top: 10, bottom: 10, left: 10, right: 10 },
//       maxZoom: 15,
//       essential: true,
//     });
//   } else {
//     map.flyTo({
//       center: store.geometry.coordinates,
//       zoom: 15,
//       essential: true,
//     });
//   }
// }
// function createPopUp(store, map) {
//   const popup = new mapboxgl.Popup({ closeOnClick: true, offset: 50 })
//     .setLngLat(store.geometry.coordinates)
//     .setHTML(
//       `
//       <div class="title">
//         <span class="header03">${store.properties.headline}</span>
//       </div>
//       <div class="subtitle">
//         <span class="text01">${store.properties.address}</span>
//       </div>
//       <div class="subtitle">
//       <i class="icon-${store.properties.categoryType}"></i>
//         <span class="text01">${store.properties.categoryType}</span>
//       </div>
//       `
//     )

//     .addTo(map);
// }

// // function createUserLocationMarker(userLocation, map) {
// //   createMapMarker(userLocation, map, someClickHandlerFunction);
// //   const marker = document.createElement("div");
// //   marker.className = "icon-mapMarker-userLocation";
// //   return new mapboxgl.Marker(marker).setLngLat(coordinates).addTo(map);
// // }
// function createUserLocationMarker(userCoordinates, map) {
//   const marker = document.createElement("div");
//   marker.className = "icon-mapMarker-userLocation";
//   return new mapboxgl.Marker(marker).setLngLat(userCoordinates).addTo(map);
// }
// function zoomToShowAtLeastThreePins(map, features, center) {
//   const zoomOut = () => {
//     const mapBounds = map.getBounds();
//     const filteredFeatures = filterFeaturesInBounds(features, mapBounds);
//     if (filteredFeatures.length < 3) {
//       map.zoomOut(1, { around: center });
//       setTimeout(zoomOut, 100);
//     } else {
//       renderFeatures(filteredFeatures, map);
//     }
//   };
//   zoomOut();
// }
// function getDistance(coord1, coord2) {
//   const toRadians = (degrees) => degrees * (Math.PI / 180);
//   const R = 6371e3; // Earth's radius in meters
//   const lat1 = toRadians(coord1[1]);
//   const lat2 = toRadians(coord2[1]);
//   const deltaLat = toRadians(coord2[1] - coord1[1]);
//   const deltaLng = toRadians(coord2[0] - coord1[0]);
//   const a =
//     Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//     Math.cos(lat1) *
//       Math.cos(lat2) *
//       Math.sin(deltaLng / 2) *
//       Math.sin(deltaLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// export default HomeScreen;
