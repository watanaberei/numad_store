// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import ContenfulData from "../../server/data/contentful/contentful.js";
import { sendImpression } from "../../server/data/contentful/contentfulApi.js";
import * as data from "../../server/data/data.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils/utils.js";
import * as yelpApi from "../../server/data/yelp/yelpApi.js";

import {
  getStoresNeumadsReview,
  getArticleNeumadsTrail,
  getArticlePost,
  getStore,
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

let contenful = "";
let Contentful = new ContenfulData();
const socket = io('http://localhost:4000');



// const socket = io('http://localhost:4000');
const StoreScreen = {
  render: async () => {
    const request = parseRequestUrl();

    // CONTENTFUL
    const contentfulData = await Contentful.getData();
    console.log("contentfulData", contentfulData);
    const validStores = contentfulData.filter((contentfulData) => contentfulData.slug);
    console.log("Valid stores:", validStores);
    contenful = validStores.find((contenful) => contenful.slug === request.slug);
    console.log("slug", contenful.slug);
    console.log("store", contenful);

    // DATA
    const storeData = data.store?.item?.[0];
    console.log("debug log: store-init01 - Initial store data:", storeData);
    const storeOverviewData = data.store?.item?.[0]?.overview?.[0];
    const storeServiceData = data.store?.item?.[0]?.service?.[0];
    const storeExperienceData = data.store?.item?.[0]?.experience?.[0];
    const storeHeroData = data.store?.item?.[0]?.hero?.[0];
    const storeLocationData = data.store?.item?.[0]?.location;
    const storeBusinessData = yelpApi.yelpApi;
    console.log("debug log: store-init02 - Extracted data structures:", {
      overview: storeOverviewData,
      service: storeServiceData,
      experience: storeExperienceData,
      location: storeLocationData,
      hero: storeHeroData,
      business: storeBusinessData,
    });
    

    // DISTANCE
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
    const coordinateStore = Geolocate.coordinateStore(contenful);
    const storeLocation = [
      contenful.location.geolocation.lon,
      contenful.location.geolocation.lat,
    ];

    const userLocation = await coordinateUser();

    let location = [
      { name: "userLocation", coordinates: userLocation },
      { name: "storeLocation", coordinates: storeLocation },
    ];
    const storeRange = GeolocationRange.storeRange.render(location);
    const storeDistance = GeolocationRange.storeDistance.render(location);
    console.log("%%%%%%%%%%%%%%%%storeDistance%%%%%%%%%%%%%%%%", storeDistance);

    // const calculateDistance = MapDistance.calculateDistance(
    //   userLocation,
    //   storeLocation
    // );
    // const storeRange = getStoreRange(calculateDistance);

    // MEDIA
    const mediaArea =
    contenful.media.area &&
      Array.isArray(contenful.media.area) &&
      contenful.media.area.length
        ? contenful.media.area
        : [];
    const mediaGallery =
    contenful.media.gallery &&
      Array.isArray(contenful.media.gallery) &&
      contenful.media.gallery.length
        ? contenful.media.gallery
        : [];
    const mediaService =
    contenful.media.service &&
      Array.isArray(contenful.media.service) &&
      contenful.media.service.length
        ? contenful.media.service
        : [];
    // CAROUSEL
    const carouselArea = generateMediaCarouselHTML(mediaArea, 5);
    const carouselServices = generateMediaCarouselHTML(mediaService, 6);
    const carouselGallery = generateMediaCarouselHTML(mediaGallery, 3);

    //////////////////////////// SNIPPET ////////////////////////////
    const snippetOverview = contenful.snippet.overview || [];
    const snippetFacility = contenful.snippet.facility || [];
    const snippetExperience = contenful.snippet.experience || [];
    const snippetService = contenful.snippet.service || [];
    const snippetLocation = contenful.snippet.location || [];
    const snippetHours = contenful.snippet.hours || [];

    const popularTimesData = contenful.popularTimes || [];

    const thumbnails = contenful?.media?.thumbnail;
    const heroModuleHtml = hero.heroModule.render(contenful.media.hero);
    const neustar = contenful.neustar;
    const headline = contenful?.headline?.text;
    const locationRegion = contenful?.location?.region;
    // console.log("!#$#%#@$%!$#%$!#", headline, locationRegion);

    const limitedBest02 = contenful?.summary?.best?.length
      ? contenful.summary.best.slice(0, 3)
      : [];
    // ATTRIBUTES
    function generateAttributesArray() {
      let attributesArray = "";
      limitedBest02.forEach((best) => {
        attributesArray += `
        <div class="item">
            <div class="text">
              
              <span class="ink03 bold text03">${best}</span>
              <i class="glyph glyph-check-15"></i>
            </div>
        </div>`;
      });
      return attributesArray;
    }

    const attributesArray = generateAttributesArray();
    let headlineObject = {
      headlineText: contenful.headline.text,
      locationRegion: contenful.location.region,
      attributesArrays: attributesArray,
    };

    const storeCoordinates = Geolocate.coordinateStore(contenful);

    let storeObject = {
        mediaArea:
          contenful.media.area &&
          Array.isArray(contenful.media.area) &&
          contenful.media.area.length
            ? contenful.media.area
            : [],
        mediaTopThree:
          contenful.media.service &&
          Array.isArray(contenful.media.service) &&
          contenful.media.service.length
            ? contenful.media.service
            : [],
        galleryImages:
        contenful.media.gallery &&
          Array.isArray(contenful.media.gallery) &&
          contenful.media.gallery.length
            ? contenful.media.gallery
            : [],
      mediaPlatinum: thumbnail,
      mediaGallery: mediaGallery,
      neustar: neustar,
      buttonFloating: "labelButton",
      storeName: contenful?.headline?.text || "Default Headline", // Provide a default value
      city: contenful?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,
      storeRegion: contenful.region,
      storeURL: contenful.url,
      // userLocation: coordinateUser,
      //   currentDistance: MapDistance.calculateDistance(
      //     userLocation,
      //     storeLocation
      //   ),
      //   storeRange: getStoreRange(calculateDistance),
      storeRange: storeRange,
      distanceMiles: storeDistance,
      storeTypes: contenful.category.genre,
      storeType: contenful.category.categoryType,
      storeCategory: contenful.location.type,

      // ATTRIBUTES
      attributesBest: contenful?.summary?.best?.length
        ? contenful.summary.best.slice(0, 3)
        : [],
      attributesFacility:
        contenful.summary.facility && contenful.summary.facility.length
          ? contenful.summary.facility
          : [],
      attributesExperience:
        contenful.summary.experience && contenful.summary.experience.length
          ? contenful.summary.experience
          : [],
      attributesOverview:
        contenful.summary && contenful.summary.text && contenful.summary.text.length
          ? contenful.summary.text
          : [],
      attributeService:
        contenful.summary.service && contenful.summary.service.length
          ? contenful.summary.service
          : [],

      // MEDIA
      mediaArea:
        contenful.media.area &&
        Array.isArray(contenful.media.area) &&
        contenful.media.area.length
          ? contenful.media.area
          : [],
      storeArea: contenful?.media?.area?.description || [],
      snippetOverview: contenful.snippet.overview || [],
      snippetFacility: contenful.snippet.facility || [],
      snippetExperience: contenful.snippet.experience || [],
      snippetService: contenful.snippet.service || [],

      // SUGGESTIONS
      suggestThumbnailURL01: "store.suggestThumbnailURL01",
      suggestTitle01: "store.suggestTitle01",
      suggestTitle01: "store.suggestNeustarHTML01",
      suggestStoreDistanceHTML01: "store.suggestStoreDistanceHTML01",
      suggestGenre01: "store.suggestGenre01",
      suggestRegion01: "store.suggestRegion01",
      suggestCurrentStatus01: " store.suggestCurrentStatus01",
      suggestCurrentHoursHTML01: "store.suggestCurrentHoursHTML01",
      suggestEnvironment01: "store.suggestEnvironment01",
      suggestNoiseLevel01: "store.suggestNoiseLevel01",
      suggestParking01: " store.suggestParking01[0]",
    };
    // console.log("storeObject", storeObject);

    let heroMediaHTML = hero.mediaHero.render(storeObject);
    let eyebrowHeroHTML = eyebrow.eyebrowHero.render(storeObject);
    let overviewSection = await section.section.render(storeObject);
    let experienceSection = experience.experiences.render(storeObject);
    //////////////////////////////////////////////////////////////
    //////////////////////////// HERO ////////////////////////////
    //////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////
    ////////////////////////// OVERVIEW //////////////////////////
    //////////////////////////////////////////////////////////////
    // const experienceSections = experience.experienceSection.render(store);

    const recommendFacilityTextTemp = `
  <div class="item">
      <a class="coffee-bar">Coffee Bar</a>
      <span class="div">,</span>
  </div>
  <div class="item">
      <a class="main-room">Main Room</a>
      <span class="div">,</span>
  </div>
  <div class="item">
      <a class="back-corner-room">Back Corner Room</a>
      <span class="div">,</span>
  </div>
  <div class="item">
      <a class="outdoor-patio">Outdoor Patio</a>
      <span class="div">,</span>
  </div>
  <div class="item">
      <a class="bathroom">Bathroom</a>
  </div>`;

    const recommendFacilityPictogramTemp = `
                  <div class="pictogram">
                      <i class="pictogram-facility-indoor-30"></i>
                  </div>
                  <div class="pictogram">
                    <i class="pictogram-facility-outdoor-30"></i>
                </div>
                `;

    let storeIntro = {
      recommendFacilityText: recommendFacilityTextTemp,
      recommendFacilityPictogram: recommendFacilityPictogramTemp,
      recommendValue: "90%",
      snippetOverview: contenful.summaryDetails,
      title: contenful.summaryText,
      neustar: neustar,
      buttonFloating: "labelButton",
      headlineText: contenful?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: contenful?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,
      storeType: contenful.category.categoryType,
      storeCategory: contenful.location.type,
    };
    // const overviewSection = section.section.render(store);
    //////////////////////////////////////////////////////////////
    ////////////////////////// OVERVIEW //////////////////////////
    //////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////
    /////////////////////////// SERVICE ///////////////////////////
    ///////////////////////////////////////////////////////////////

    let storeServices = {
      recommendFacilityText: recommendFacilityTextTemp,
      recommendFacilityPictogram: recommendFacilityPictogramTemp,
      recommendValue: "90%",
      snippetOverview: contenful.summaryDetails,
      title: contenful.summaryText,
      neustar: neustar,
      buttonFloating: "labelButton",
      headlineText: contenful?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: contenful?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,
      attributeService:
        contenful.summary.service && contenful.summary.service.length
          ? contenful.summary.service
          : [],
      snippetService: contenful.snippet.service || [],
      mediaTopThree:
        contenful.media.service &&
        Array.isArray(contenful.media.service) &&
        contenful.media.service.length
          ? contenful.media.service
          : [],
      mediaGallery:
        contenful.media.gallery &&
        Array.isArray(contenful.media.gallery) &&
        contenful.media.gallery.length
          ? contenful.media.gallery
          : [],
      storeType: contenful.category.categoryType,
      storeCategory: contenful.location.type,
    };
    const sectionServiceHTML = service.services.render(storeServices);
    ///////////////////////////////////////////////////////////////
    /////////////////////////// SERVICE ///////////////////////////
    ///////////////////////////////////////////////////////////////

    const nearbyStore = contenful.nearbyStore || [];
    const nearbyHeadline = nearbyStore.headline;
    const nearbyHours = nearbyStore.hours;
    const nearbyLocation = nearbyStore.nearbyLocation;
    const nearbyStores = contenful.nearbyStore || [];
    const nearbyLogoData =
      nearbyStores.nearbyLogo &&
      Array.isArray(nearbyStores.nearbyLogo) &&
      nearbyStores.nearbyLogo.length
        ? nearbyStores.nearbyLogo
        : [];
    const nearbyGalleryHTML = generateLogoCarouselHTML(nearbyLogoData);
    // console.log("nearby", nearbyStore, nearbyHeadline, nearbyHours, nearbyLocation, nearbyStores, nearbyLogoData, nearbyGalleryHTML);
    function generateLogoCarouselHTML(nearbyLogo) {
      let nearbyLogoHTML = "";
      nearbyLogo.slice(0, 3).forEach((nearbyLogoItem) => {
        nearbyLogoHTML += `
                <img src="${nearbyLogoItem}" class="galleryItem" alt="" />
      `;
      });
      return nearbyLogoHTML;
    } // Generate the HTML for the carousel

    ////////////////////////////////////////////////////////////////
    /////////////////////////// FACILITY ///////////////////////////
    ////////////////////////////////////////////////////////////////

    let storeFacility = {
      recommendFacilityText: recommendFacilityTextTemp,
      recommendFacilityPictogram: recommendFacilityPictogramTemp,
      recommendValue: "90%",
      snippetOverview: contenful.summaryDetails,
      title: contenful.summaryText,
      neustar: neustar,
      buttonFloating: "labelButton",
      headlineText: contenful?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: contenful?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,

      headlineText: contenful?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: contenful?.location?.region || "Default Region", // Provide a default value
      storeRegion: contenful.region,
      //   currentDistance: MapDistance.calculateDistance(
      //     userLocation,
      //     storeLocation
      //   ),
      //   storeRange: getStoreRange(calculateDistance),
      storeRange: storeRange,
      storeDistance: storeDistance,
      storeTypes: contenful.category.genre,
      storeType: contenful.category.categoryType,
      storeCategory: contenful.location.type,

      nearbyStore: contenful.nearbyStore || [],
      nearbyHeadlines: contenful.nearbyStore.nearbyHeadline || [],
      nearbyHeadline:
        contenful.nearbyStoresCollection.items.nearbyHeadline &&
        Array.isArray(contenful.nearbyStoresCollection.items.nearbyHeadline) &&
        contenful.nearbyStoresCollection.items.nearbyHeadline.length
          ? contenful.nearbyStoresCollection.items.nearbyHeadline
          : [],

      // ATTRIBUTES
      attributesFacility:
        contenful.summary.facility && contenful.summary.facility.length
          ? contenful.summary.facility
          : [],
      mediaArea:
        contenful.media.area &&
        Array.isArray(contenful.media.area) &&
        contenful.media.area.length
          ? contenful.media.area
          : [],
      snippetFacility: contenful.snippet.facility || [],
      popularTimes: contenful.popularTimes || [],

      storeType: contenful.category.categoryType,
      storeCategory: contenful.location.type,
    };

    const sectionFacilityHTML = facility.facilities.render(storeFacility);
    ////////////////////////////////////////////////////////////////
    /////////////////////////// FACILITY ///////////////////////////
    ////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////////
    /////////////////////////// POPULAR TIMES ///////////////////////////
    /////////////////////////////////////////////////////////////////////
    const popularTimesHTML = await storePopularTimes(popularTimesData);
    // console.log("popularTimesHTML", popularTimesHTML);
    // console.log("popularTimesData", popularTimesData);
    /////////////////////////////////////////////////////////////////////
    /////////////////////////// POPULAR TIMES ///////////////////////////
    /////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////
    /////////////////////////// DETAILS ///////////////////////////
    ///////////////////////////////////////////////////////////////
    let storeDetails = {
      storeGenre: contenful.category.genre,
      storeType: contenful.category.categoryType,
      storeContact: contenful.contact,
      storeAddress: contenful?.location.address || [],
      storeLocatedIn: contenful.location.locatedIn,
      storeRegion: contenful?.location?.region || "Default Region", // Provide a default value
      //   currentDistance: MapDistance.calculateDistance(
      //     userLocation,
      //     storeLocation
      //   ),
      //   storeRange: getStoreRange(calculateDistance),
      storeRange: storeRange,
      storeDistance: storeDistance,
      storeName: contenful?.headline?.text || "Default Headline", // Provide a default value
      storeHours: contenful?.hours,
      storeRatings: contenful.ratings[0].key || [],
      storeRatingGoogle: contenful.googleRatings,
      storeRatingYelp: contenful.yelpRatings,
      storeHandle: contenful.handles,
      storeReviews: contenful.ratings[0].value || [],
      storeBest: attributesArray,
      storeLogo: contenful.media.logo,
      storeNeustar: contenful.neustar,
    };

    console.log("storeDetails", storeDetails);

    // const detailsPanel = panel.panel.render(storeDetails);

    ///////////////////////////////////////////////////////////////
    /////////////////////////// DETAILS ///////////////////////////
    ///////////////////////////////////////////////////////////////





    const storeDetailsHTML = sidebar.storeDetails.render(storeData);
    const storeHeroHTML = components.storeHero.render(storeObject);
    const storeOverviewHTML = components.storeOverview.render(
      storeData.overview[0].header,
      storeData.overview[0].text,
      storeData.overview[0].summary,
      storeData.overview[0].footer
    );
    const storeExperienceHTML = components.storeExperience.render(
      storeExperienceData.header,
      storeExperienceData.text,
      storeExperienceData.footer,
      storeExperienceData.area,
      storeExperienceData.attribute
    );
    const storeServiceHTML = components.storeService.render(
      storeServiceData.header,
      storeServiceData.text,
      storeData.serviceCategoryData,
      storeServiceData.footer
    );
    const storeBusinessHTML = components.storeBusiness.render(storeData);
    const storeLocationHTML = components.storeLocation.render(
      storeData.location.city,
      storeData.location.attribute,
      storeData.location.footer
    );


    return `
        
          <div id="store" class="main grid05">
    
            <div id="section" class="hero col05">.
              <div class="col05 array content" id="store-hero">
                ${storeHeroHTML}
              </div>
            </div>
            
            <div id="container" class="content col05 ">
              
              <div id="container" class=" primary col04 store">

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
                  <div class="grid04-overflow array" id="business-hours">
                    ${storeBusinessHTML}
                  </div>
                  <div class="footer col04">
                  </div>
                  <div class=" col04 array content" id="store-business">
                  
                  </div> 
                </div>
                <div id="section" class="section col04">
                  <div class=" col04 array content" id="store-location">
                    ${storeLocationHTML}
                  </div> 
                </div>
                <div id="section" class="section col04">
                  <div class=" col04 array content" id="card-gallery-item">
                  
                  </div> 
                </div>
              </div>
            
              <div id="store-details" class="secondary col01 store store-details">
                ${storeDetailsHTML}
              </div>
        
            </div>
          </div>
        `;
      },

      after_render: async () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });

        try {
          // Hero Section
          const storeHero = document.getElementById("store-hero");
          if (storeHero && contenful.hero?.[0]) {
            // storeHero.innerHTML = components.storeHero.render(store.hero[0].hero);
            storeHero.innerHTML = components.storeHero.render(contenful);
            components.storeHero.afterRender?.();
          }

          // Overview Section
          const storeOverview = document.getElementById("store-overview");
          if (storeOverview && storeData.overview?.[0]) {
            storeOverview.innerHTML = components.storeOverview.render(
              storeData.overview[0].header,
              storeData.overview[0].text,
              storeData.overview[0].summary,
              storeData.overview[0].footer
            );
          }

          // Experience Section
          const storeExperience = document.getElementById("store-experience");
          if (storeExperience && store.experience?.[0]) {
            storeExperience.innerHTML = components.storeExperience.render(
              storeData.experience[0].header,
              storeData.experience[0].text,
              storeData.experience[0].footer,
              storeData.experience[0].area,
              storeData.experience[0].attribute
            );
            array.create.initializeCarousel("area");
          }

          // Service Section
          const storeService = document.getElementById("store-service");
          if (storeService && storeData.service?.[0]) {
            storeService.innerHTML = components.storeService.render(
              storeData.service[0].header,
              storeData.service[0].text,
              storeData.service[0].category,
              storeData.service[0].footer
            );
          }

          // Business Section
          const storeBusiness = document.getElementById("store-business");
          if (storeBusiness && store.hours) {
            storeBusiness.innerHTML = components.storeBusiness.render(storeData);
            components.storeBusiness.afterRender();
          }

          // Location Section
          const storeLocation = document.getElementById("store-location");
          if (storeLocation && storeData.location) {
            const storeLocationHeader = `${storeData.location.city},${storeData.location.area}`;
            storeLocation.innerHTML = components.storeLocation.render(
              storeLocationHeader,
              storeData.location.attribute,
              storeData.location.footer
            );
          }

          // Store Details Sidebar
          const storeDetails = document.getElementById("store-details");
          if (storeDetails) {
            storeDetails.innerHTML = sidebar.storeDetails.render(storeData);
          }

          // Initialize map if needed
          if (document.getElementById("map-container")) {
            initMap({
              container: "map-container",
              style: "mapbox://styles/mapbox/streets-v11",
              center: [storeData.location.geolocation.lon, storeData.location.geolocation.lat],
              zoom: 13,
              attributionControl: false,
            });
          }

        } catch (error) {
          console.error("Error in after_render:", error);
        }

        // Fetch user data
        // Fetch user data
        const accessToken = localStorage.getItem('accessToken');
        let userData = null;
        try {
          const userResponse = await fetch('http://localhost:4000/api/user', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          if (userResponse.ok) {
            userData = await userResponse.json();
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }

        // Now pass the userData to userControl.render
        const userControlsHTML = userControl.render(store, {
          totalLikes: userData?.totalLikes || 0,
          totalDislikes: userData?.totalDislikes || 0,
          rating: userData?.rating || 0,  // Add this line if 'rating' is needed
        });

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

        if (!store || !store.someProperty) {
          // Handle error or missing data
          const popularTime = store.popularTimes || [];
          const popularTimes = store.popularTimes || [];
          // const storeLocation = [store.location.geolocation.lat,store.location.geolocation.lon];
          // const storeLocation = store.location.geolocation || [];
          const storeLocation =
            store.location && store.location.geolocation
              ? {
                  lat: store.location.geolocation.lat,
                  lon: store.location.geolocation.lon,
                }
              : { lat: 0, lon: 0 }; // Default values if location is not defined
          // Initialize the map object
          // console.log("storeLocation",storeLocation);
          // // console.log("store.location.geolocation",[store.location.geolocation.lat,store.location.geolocation.lon]);
          // // console.log("popularTime",popularTime);
          // // console.log("popularTimes",popularTimes);

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
            style: "mapbox://styles/mapbox/streets-v11", // your map style here
            center: storeLocation, // Center the map on the store's location
            zoom: 13, // Adjust zoom as needed
            attributionControl: false,
          });

          const modal = modals.init();

          if (document.getElementById("myBtn")) {
            document.addEventListener("DOMContentLoaded", () => {
              modals.init();
            });
          } else {
            console.error("myBtn element not found");
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
  contenful.summary && contenful.summary.text && contenful.summary.text.length
      ? contenful.summary.text
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