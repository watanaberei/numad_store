// src/screens/DineScreen.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/MapApi.js";
import { geojsonStore } from "../components/GeojsonStores.js";
import { createMapMarker } from "../components/MapMarker.js";
import { createGeojsonListing } from "../components/GeojsonListing.js";
import { createGeojsonStoreListing } from "../components/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../components/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../components/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../components/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/GeocoderInput.js";
import AllBlog from "../components/AllBlog.js";
import HeaderHome from "../components/HeaderHome.js";
import mapRoute from "../components/mapRoute.js";
import { geoPopup } from "../components/GeoPopup.js";
import polyline from "@mapbox/polyline";

const DineScreen = {
  render: async () => {
    return `
    
      <container class="primary">
        <div class="content">
          <div class="title">
            <span class="text03">
              primary
            </span>
          </div>
          <div class="container">
            <div id="postStores" class="postStores list"> 
            </div>
            
        


       
            <div class="list" id="listing-blog">
              <div class="heading">
                <span class="header01">Blog</span>
              </div>
              <div id="postBlog" class="postBlog card-blog">
              </div>
            </div>

            <div class="list" id="listing-article">
              <div class="heading">
                <span class="header01">Article</span>
              </div>
              <div id="postArticle" class="postArticle card-article">
              </div>
            </div>

            <div class="list" id="listing-review">
              <div class="heading">
                <span class="header01">Reviewed</span>
              </div>
              <div id="postReview" class="postReview card-review">
              </div>
            </div>

            <div class="list" id="listing-store">
              <div class="heading">
                <span class="header01">Nearby Stores</span>
              </div>
              <div id="postListing" class="postListing card-listing">
              </div>
            </div>
     


          </div>

        </div>

      </container>

      <container class="secondary">
        <div class="content">
          <div class="title">
            <span class="text03">
              secondary
            </span>
          </div>
          <div class="container">
            <div class="item">
              <div class="s map map-discover" id="map map-discover">
                <div id="map-container" class="fullBleed"></div>
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

    `;
  },
  after_render: async () => {
    const map = initMap();
    window.map = map;
    const { features } = await geojsonStore();

    // Initialize the geocoder object
    const geocoder = createGeocoderInput(HeaderHome.getLastSelectedResult());
    geocoder.on("result", handleGeocoderResult);
    geocoder.on("clear", () => {
      results.innerText = "";
    });

    // Add marker logic from DineScreen
    var markers = [];
    features.forEach(function (marker) {
      var el = document.createElement("div");
      el.className = "marker";
      var newMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            "<h3>" +
              marker.properties.title +
              "</h3><p>" +
              '<div id="category">' +
              marker.properties.categoryType +
              "</div>" +
              marker.properties.address +
              "</p>"
          )
        )
        .addTo(map);
      markers.push({ marker: newMarker, feature: marker });
    });

    const categories = markers.map((m) => m.feature.properties.categoryType);
    var allMarkers = markers;

    document
      .getElementById("search-btn")
      .addEventListener("click", function () {
        var location = HeaderHome.getLastSelectedResult();
        var categoryType = document.getElementById("category").value;
        if (categoryType || location) {
          allMarkers.forEach((m) => {
            var el = m.marker.getElement();
            el.id =
              !categoryType ||
              m.feature.properties.categoryType.toLowerCase() !==
                categoryType.toLowerCase()
                ? "markerInactive"
                : "markerActive";
          });

          if (location) {
            map.flyTo({ center: location.geometry.coordinates, zoom: 15 });
          }
        } else {
          alert("Please enter a categoryType or select a location");
        }
      });

    map.on("moveend", function () {
      const mapBounds = map.getBounds();
      const center = map.getCenter();
      const filteredFeatures = filterFeaturesInBounds(features, mapBounds);
      const sortedFeatures = sortFeaturesByDistance(filteredFeatures, center);

      // Example call to renderFeatures with a specific container ID
      renderFeatures(sortedFeatures, map, "postListing");
    });
    map.on('click', function(e) {
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
              color = "#FF0000"; // Red
              break;
            case "admin-1":
              color = "#00FF00"; // Green
              break;
            case "city-boundaries":
              color = "#0000FF"; // Blue
              break;
            default:
              color = "#000000"; // Black
          }
          if (['city-boundaries', 'counties', 'admin-1'].includes(feature.source)) {
            flyToCity(map, feature);
          }
          geoPopup(feature, map); // Pass the map object to the geoPopup function
    
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
    });
    
    setCurrentLocation(map, features);
  },
};

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
        console.error(`Failed to fetch route data: ${error}`);
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

function renderFeatures(features, map) {
  // References to DOM elements
  const elements = {
    postListing: document.getElementById("postListing"),
    postStores: document.getElementById("postStores"),
    postReview: document.getElementById("postReview"),
    postArticle: document.getElementById("postArticle"),
    postBlog: document.getElementById("postBlog"),
  };

  // Clear out old listings
  for (let key in elements) {
    if (elements[key]) {
      elements[key].innerHTML = "";
    }
  }

  features.forEach((feature) => {
    let element;
    console.log("feature.properties.variant", feature.properties.type);
    switch (feature.properties.variant) {
      case "stores":
        element = createGeojsonStoreListing(feature);
        elements.postStores.appendChild(element);
        break;
      case "reviews":
        element = createGeojsonReviewListing(feature);
        elements.postReview.appendChild(element);
        break;
      case "articles":
        element = createGeojsonArticleListing(feature);
        elements.postArticle.appendChild(element);
        break;
      case "blogs":
        element = createGeojsonBlogListing(feature);
        elements.postBlog.appendChild(element);
        break;
      // Include additional cases as necessary
      default:
        console.warn("Unknown feature type:", feature.properties.type);
    }
  });
}

function flyToStore(store, map) {
  map.flyTo({
    center: store.geometry.coordinates,
    zoom: 15,
    essential: true,
  });
}

function flyToCity(map, feature) {
  map.flyTo({
    center: feature.geometry.coordinates[0][0], // Assuming the city's coordinates are the first coordinates of the geometry
    zoom: 6,
    essential: true, // This option enables the animation even if the user has prefers-reduced-motion enabled
  });
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

// function geoPopup(feature) {
//   // Get the map container
//   const mapContainer = document.getElementById('map-container');

//   // Remove the existing card if there is one
//   const existingCard = mapContainer.querySelector('.geo-popup-card');
//   if (existingCard) {
//     mapContainer.removeChild(existingCard);
//   }

//   // Create a new div element for the card
//   const card = document.createElement('div');
//   card.className = 'geo-popup-card';

//   // Create a new div element for the card content
//   const content = document.createElement('div');
//   content.className = 'geo-popup-content';
//   content.innerHTML = '<pre>' + JSON.stringify(feature.properties, null, 2) + '</pre>';
//   card.appendChild(content);

//   // Create a new button element for the close button
//   const closeButton = document.createElement('button');
//   closeButton.className = 'geo-popup-close-button';
//   closeButton.innerHTML = 'Close';
//   closeButton.onclick = function() {
//     card.style.display = 'none';
//   };
//   card.appendChild(closeButton);

//   // Append the card to the map container
//   mapContainer.appendChild(card);
// }

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

export default DineScreen;




































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
//         console.error(`Failed to fetch route data: ${error}`);
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
//         console.warn('Unknown feature type:', feature.properties.type);
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
//       // console.log(decoded);
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
//         console.error(`Failed to fetch route data: ${error}`);
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
//       console.error(`Container with ID ${containerId} not found`);
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
//               console.warn(`Ignored unknown feature type: ${feature.properties.type}`);
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
//       console.error(`Container with ID ${containerId} not found`);
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
//               console.error(`Unknown feature type: ${feature.properties.type}`);
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

// export default DineScreen;
