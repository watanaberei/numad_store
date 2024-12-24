// src/screens/DineScreen.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/map/MapApi.js";
import { geojsonStore } from "../components/map/geo/GeojsonStores.js";
import { createMapMarker } from "../components/map/MapMarker.js";
import { createGeojsonListing } from "../components/map/geo/GeojsonListing.js";
import { createGeojsonStoreListing } from "../components/map/geo/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../components/map/geo/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../components/map/geo/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../components/map/geo/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/map/geo/GeocoderInput.js";
// import AllBlog from "../components/AllBlog.js";
import HeaderHome from "../components/header/HeaderHome.js";
import mapRoute from "../components/map/mapRoute.js";
import { geoPopup } from "../components/map/geo/GeoPopup.js";
import polyline from "@mapbox/polyline";
import { getStore } from "../client/api.js";

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

  async render() {
    try {
      const stores = await getStore(); // Make sure this returns data
      console.log('Stores data:', stores); // Debug log

      if (!stores || !stores.features) {
        console.warn('No store features found');
        return `<div>No stores available</div>`;
      }

      this.stores = stores.features;
      
      return `
        // ... your template
      `;
    } catch (error) {
      console.error('Error rendering HomeScreen:', error);
      return `<div>Error loading stores</div>`;
    }
  }
}
