// src/screens/HomeScreen.js
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
// import AllBlog from "../../components/AllBlog.js";
import HeaderHome from "../../components/header/HeaderHome.js";
  import mapRoute from "../../components/map/mapRoute.js";
import { geoPopup } from "../../components/map/geo/GeoPopup.js";
import polyline from "@mapbox/polyline";
import { getStore } from "../../API/api.js";
import { Geolocate } from "../../components/map/geo/Geolocate.js";

const HomeScreen = {
  render: async () => {
    return `
    
      <container class="col03 grid03 primary">

          <div class="col03 title">
            <span class="text03">
              primary
            </span>
          </div>
          <div class="col03 grid03 container">
            <div id="postStores" class="gridCollection col03 postStores list"> 
            </div>
            
        


       
            <div class="list col03 grid03" id=" listing-blog">
              <div class="col03 heading">
                <span class=" header01">Blog</span>
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

    // Add marker logic from HomeScreen
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

function renderFeatures(features, map) {
  console.log('Rendering features:', features); // Debug log

  const elements = {
    postListing: document.getElementById("postListing"),
    postStores: document.getElementById("postStores"),
    postReview: document.getElementById("postReview"),
    postArticle: document.getElementById("postArticle"),
    postBlog: document.getElementById("postBlog"),
  };

  // Clear existing content
  Object.values(elements).forEach(el => {
    if (el) el.innerHTML = '';
  });

  features.forEach(async (feature) => {
    console.log('Processing feature:', feature); // Debug log
    
    if (!feature.properties || !feature.properties.variant) {
      console.warn('Invalid feature format:', feature);
      return;
    }

    let element;
    const container = elements[`post${feature.properties.variant.charAt(0).toUpperCase() + feature.properties.variant.slice(1)}`];

    if (!container) {
      console.warn(`No container found for variant: ${feature.properties.variant}`);
      return;
    }

    try {
      switch (feature.properties.variant) {
        case "stores":
          // Get user coordinates for store range calculation
          const userCoordinates = await Geolocate.coordinateUser();
          element = createGeojsonStoreListing(feature, map, userCoordinates);
          break;
        case "reviews":
          element = createGeojsonReviewListing(feature);
          break;
        case "articles":
          element = createGeojsonArticleListing(feature);
          break;
        case "blogs":
          element = createGeojsonBlogListing(feature);
          break;
        default:
          console.warn("Unknown feature variant:", feature.properties.variant);
          return;
      }

      if (element) {
        container.appendChild(element);
      }
    } catch (error) {
      console.error('Error rendering feature:', error);
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
