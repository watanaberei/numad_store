// src/screens/StoreScreen.js
import { io } from "socket.io-client";
import ContenfulData from "../../server/data/contentful/contentful.js";
import { sendImpression } from "../../server/data/contentful/contentfulApi.js";
import * as data from "../../server/data/data.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils/utils.js";
import * as YelpApi from "../../server/data/yelp/yelpApi.js";
import { matchBusiness } from "../components/function/functionMatch.js";

import {
  getStoresNeumadsReview,
  getArticleNeumadsTrail,
  getArticlePost,
  getStore
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
    }
  }
};

let store = "";

let contentfulData = "";
let Contentful = new ContenfulData();

const socket = io("http://localhost:4000");

let storeData = data.store?.item?.[0];

let yelpData = YelpApi.yelpApi;
console.log("yelpData", yelpData);





// const storeOverviewData = data.store?.item?.[0]?.overview?.[0];
// const storeServiceData = data.store?.item?.[0]?.service?.[0];
// const storeExperienceData = data.store?.item?.[0]?.experience?.[0];
// const storeHeroData = data.store?.item?.[0]?.hero?.[0];
// const storeLocationData = data.store?.item?.[0]?.location;
// const yelpData = yelpApi.yelpApi;





// const socket = io('http://localhost:4000');
const StoreScreen = {
  render: async () => {
    // Around line 90-100, after getting currentStore
const request = parseRequestUrl();
const contentfulData = await Contentful.getData();
console.log("debug log: store-init02 - Contentful data:", contentfulData);

const validStores = contentfulData.filter((store) => store.slug);
const currentStore = validStores.find(
  (store) => store.slug === request.slug
);

// Prepare location data for Yelp matching
const matchStoreLocation = {
  address: currentStore?.location?.address,
  city: currentStore?.location?.locatedIn || currentStore?.location?.city,
  state: "CA", // From the slug pattern ca_city_name
  geolocation: currentStore?.location?.geolocation,
  region: currentStore?.location?.region
};


    // const validStores = contentfulData.filter((store) => store.slug);
    // const currentStore = validStores.find(
    //   (contentfulData) => contentfulData.slug === request.slug
    // ); 
    // Around line 99-116, update the Yelp matching code
console.log("debug log: store-init03 - Current store location:", {
  all: currentStore,
  city: currentStore?.location?.city,
  state: currentStore?.location?.state,
  title: currentStore?.overviewTitle
});

// YELP MATCH
console.log("debug log: store-init03 - Attempting Yelp match with:", {
  name: currentStore?.overviewTitle,
  location: storeLocation
});

const yelpMatch = await matchBusiness(
  currentStore?.overviewTitle,
  storeLocation
);

console.log("debug log: store-init04 - Yelp match result:", {
  success: !!yelpMatch,
  matchData: yelpMatch
});

// Store the Yelp data for use in the render
const yelpData = yelpMatch?.basic || null;

    
    const yelpSearch = await YelpApi.yelpApi.searchBusinesses(searchRequest);
    console.log("StoreScreen.js DATA - Yelp search:", yelpSearch);

    
    const matchedLocation = currentStore.locations?.find(
      (loc) => loc.storeCity === storeCity
    );
    const yelp = YelpApi.yelpApi;
    const yelpData = await yelp.getStoreData(businessId);
    
    console.log("StoreScreen.js DATA - Yelp data:", yelpData);

    // LOCAL DATA
    const localData = data.store?.item?.[0];
    console.log("StoreScreen.js DATA - Local data:", localData);






    // DISTANCE
    let userCoordinates = null;
    const coordinateUser = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              userCoordinates = [
                position.coords.longitude,
                position.coords.latitude
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
    const coordinateStore = Geolocate.coordinateStore(currentStore);
    const storeLocation = [
      currentStore.location.geolocation.lon,
      currentStore.location.geolocation?.lat
    ];
    const userLocation = await coordinateUser();
    let location = [
      { name: "userLocation", coordinates: userLocation },
      { name: "storeLocation", coordinates: storeLocation }
    ];
    const storeRange = GeolocationRange.storeRange.render(location);
    const storeDistance = GeolocationRange.storeDistance.render(location);
    console.log("%%%%%%%%%%%%%%%%storeDistance%%%%%%%%%%%%%%%%", storeDistance);




    //HERO
    const storeHeroData = {
      storeName: currentStore.overviewTitle,
      storeCity: currentStore.location?.city,
      distanceMiles: storeDistance,
      neustar: currentStore?.neustar || 0,

      galleryImages: currentStore?.galleryImages || [],

      rating: currentStore.rating,
      priceRange: currentStore.costEstimate,
      storeType: currentStore.storeType,
      distance: currentStore.distance,
      distanceMiles: storeDistance,
      city: currentStore.location.city,
      state: currentStore.location.state,
      neustar: currentStore?.neustar || 0
    };
    console.log("StoreScreen.js contentful currentStore", storeHeroData);

    const storeOverviewData = {
      headerData: "Overview",
      textData: currentStore.overview.text, 
      overviewSummaryData: storeOverviewData,
      footer: {
        contributionsCount:
          data.store?.item?.[0]?.location?.stats?.contributions,
        modifiedDate: data.store?.item?.[0]?.location?.modified?.date,
        modifiedTime: data.store?.item?.[0]?.location?.modified?.time,
        commentsCount: data.store?.item?.[0]?.location?.stats?.comments,
        reviewsCount: data.store?.item?.[0]?.location?.stats?.reviews,
        likesCount: data.store?.item?.[0]?.location?.stats?.likes,
        dislikesCount: data.store?.item?.[0]?.location?.stats?.dislikes
      },
    }
    const storeExperienceData = {
      headerData: "Experience",
      textData: currentStore.overview.text,
      areaData: currentStore.experience.area,
      attributesData: {
        // ATTRIBUTES
        attributesBest: currentStore?.summary?.best?.length
        ? currentStore.summary.best.slice(0, 3)
        : [],
        facility:
          currentStore.summary.facility &&
          currentStore.summary.facility.length
            ? currentStore.summary.facility
            : [],
        environment:
          currentStore.summary.experience &&
          currentStore.summary.experience.length
            ? currentStore.summary.experience
            : [],
        working:
          currentStore.summary &&
          currentStore.summary.text &&
          currentStore.summary.text.length
            ? currentStore.summary.text
            : [],
      },

      
      footerData: {
        contributionsCount:
          data.store?.item?.[0]?.location?.stats?.contributions,
        modifiedDate: data.store?.item?.[0]?.location?.modified?.date,
        modifiedTime: data.store?.item?.[0]?.location?.modified?.time,
        commentsCount: data.store?.item?.[0]?.location?.stats?.comments,
        reviewsCount: data.store?.item?.[0]?.location?.stats?.reviews,
        likesCount: data.store?.item?.[0]?.location?.stats?.likes,
        dislikesCount: data.store?.item?.[0]?.location?.stats?.dislikes
      },
    }
    const storeServiceData = {
      header: "Service",
      
      footer: {
        contributionsCount:
          data.store?.item?.[0]?.location?.stats?.contributions,
        modifiedDate: data.store?.item?.[0]?.location?.modified?.date,
        modifiedTime: data.store?.item?.[0]?.location?.modified?.time,
        commentsCount: data.store?.item?.[0]?.location?.stats?.comments,
        reviewsCount: data.store?.item?.[0]?.location?.stats?.reviews,
        likesCount: data.store?.item?.[0]?.location?.stats?.likes,
        dislikesCount: data.store?.item?.[0]?.location?.stats?.dislikes
      },
    }
    const storeBusinessData = {
      header: "Business",
      
      footer: {
        contributionsCount:
          data.store?.item?.[0]?.location?.stats?.contributions,
        modifiedDate: data.store?.item?.[0]?.location?.modified?.date,
        modifiedTime: data.store?.item?.[0]?.location?.modified?.time,
        commentsCount: data.store?.item?.[0]?.location?.stats?.comments,
      
        t: data.store?.item?.[0]?.location?.stats?.reviews,
        likesCount: data.store?.item?.[0]?.location?.stats?.likes,
        dislikesCount: data.store?.item?.[0]?.location?.stats?.dislikes
      },
    }

    //LOCATION
    const storeLocationData = {
      header: {
        title:
          currentStore?.location?.city +
          ", " +
          currentStore?.location?.area,
        neustar: currentStore?.neustar || 0
      },
      address: data.store?.item?.[0]?.location?.attribute,
      // coordinates: [
      //   currentStore.location.geolocation.lon,
      //   currentStore.location.geolocation.lat 
      // ],
      footer: {
        contributionsCount:
          data.store?.item?.[0]?.location?.stats?.contributions,
        modifiedDate: data.store?.item?.[0]?.location?.modified?.date,
        modifiedTime: data.store?.item?.[0]?.location?.modified?.time,
        commentsCount: data.store?.item?.[0]?.location?.stats?.comments,
        reviewsCount: data.store?.item?.[0]?.location?.stats?.reviews,
        likesCount: data.store?.item?.[0]?.location?.stats?.likes,
        dislikesCount: data.store?.item?.[0]?.location?.stats?.dislikes
      }
    };
    console.log("StoreScreen.js contentful currentStore", storeLocationData);
    
    
    // const yelpData = YelpApi.yelpApi;
    console.log("debug log: store-init02 - Extracted data structures:", {
      overview: storeOverviewData,
      service: storeServiceData,
      experience: storeExperienceData,
      location: storeLocationData,
      hero: storeHeroData,
      business: yelpData
    });

    




    

    // const storeOverviewData = data.store?.item?.[0]?.overview?.[0];
    // const storeServiceData = data.store?.item?.[0]?.service?.[0];
    // const storeExperienceData = data.store?.item?.[0]?.experience?.[0];
    // const storeHeroData = data.store?.item?.[0]?.hero?.[0];

    //   storeHeadline: {
    //     storeName: currentStore?.overviewTitle,
    //     storeCity: currentStore?.location?.city,
    //     distanceMiles: storeDistance,
    //     neustar: currentStore?.neustar || 0,
    //   },
    //   heroGallery: {
    //     galleryImages: currentStore?.galleryImages,
    //   },
    //   storeDetail: {
    //     rating: currentStore?.rating,
    //     priceRange: currentStore?.costEstimate,
    //     storeType: currentStore?.storeType,
    //     distance: currentStore?.distance,
    //     distanceMiles: storeDistance,
    //     city: currentStore?.location?.city,
    //     state: currentStore?.location?.state,
    //     neustar: currentStore?.neustar || 0,
    //   },
    // };

    // const calculateDistance = MapDistance.calculateDistance(
    //   userLocation,
    //   storeLocation
    // );
    // const storeRange = getStoreRange(calculateDistance);

    // MEDIA
    const mediaArea =
      currentStore.media.area &&
      Array.isArray(currentStore.media.area) &&
      currentStore.media.area.length
        ? currentStore.media.area
        : [];
    const mediaGallery =
      currentStore.media.gallery &&
      Array.isArray(currentStore.media.gallery) &&
      currentStore.media.gallery.length
        ? currentStore.media.gallery
        : [];
    const mediaService =
      currentStore.media.service &&
      Array.isArray(currentStore.media.service) &&
      currentStore.media.service.length
        ? currentStore.media.service
        : [];
    // CAROUSEL
    const carouselArea = generateMediaCarouselHTML(mediaArea, 5);
    const carouselServices = generateMediaCarouselHTML(mediaService, 6);
    const carouselGallery = generateMediaCarouselHTML(mediaGallery, 3);

    //////////////////////////// SNIPPET ////////////////////////////
    const snippetOverview = currentStore.snippet.overview || [];
    const snippetFacility = currentStore.snippet.facility || [];
    const snippetExperience = currentStore.snippet.experience || [];
    const snippetService = currentStore.snippet.service || [];
    const snippetLocation = currentStore.snippet.location || [];
    const snippetHours = currentStore.snippet.hours || [];

    const popularTimesData = currentStore.popularTimes || [];

    const thumbnails = currentStore?.media?.thumbnail;
    const heroModuleHtml = hero.heroModule.render(currentStore.media.hero);
    const neustar = currentStore.neustar;
    const headline = currentStore?.headline?.text;
    const locationRegion = currentStore?.location?.region;
    // console.log("!#$#%#@$%!$#%$!#", headline, locationRegion);

    const limitedBest02 = currentStore?.summary?.best?.length
      ? currentStore.summary.best.slice(0, 3)
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
      headlineText: currentStore.headline.text,
      locationRegion: currentStore.location.region,
      attributesArrays: attributesArray
    };

    const storeCoordinates = Geolocate.coordinateStore(currentStore);

    let storeObject = {
      mediaArea:
        currentStore.media.area &&
        Array.isArray(currentStore.media.area) &&
        currentStore.media.area.length
          ? currentStore.media.area
          : [],
      mediaTopThree:
        currentStore.media.service &&
        Array.isArray(currentStore.media.service) &&
        currentStore.media.service.length
          ? currentStore.media.service
          : [],
      galleryImages:
        currentStore.media.gallery &&
        Array.isArray(currentStore.media.gallery) &&
        currentStore.media.gallery.length
          ? currentStore.media.gallery
          : [],
      mediaPlatinum: thumbnail,
      mediaGallery: mediaGallery,
      neustar: neustar,
      buttonFloating: "labelButton",
      storeName: currentStore?.headline?.text || "Default Headline", // Provide a default value
      city: currentStore?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,
      storeRegion: currentStore.region,
      storeURL: currentStore.url,
      // userLocation: coordinateUser,
      //   currentDistance: MapDistance.calculateDistance(
      //     userLocation,
      //     storeLocation
      //   ),
      //   storeRange: getStoreRange(calculateDistance),
      storeRange: storeRange,
      distanceMiles: storeDistance,
      storeTypes: currentStore.category.genre,
      storeType: currentStore.category.categoryType,
      storeCategory: currentStore.location.type,

      // ATTRIBUTES
      attributesBest: currentStore?.summary?.best?.length
        ? currentStore.summary.best.slice(0, 3)
        : [],
      attributesFacility:
        currentStore.summary.facility &&
        currentStore.summary.facility.length
          ? currentStore.summary.facility
          : [],
      attributesExperience:
        currentStore.summary.experience &&
        currentStore.summary.experience.length
          ? currentStore.summary.experience
          : [],
      attributesOverview:
        currentStore.summary &&
        currentStore.summary.text &&
        currentStore.summary.text.length
          ? currentStore.summary.text
          : [],
      attributeService:
        currentStore.summary.service && currentStore.summary.service.length
          ? currentStore.summary.service
          : [],

      // MEDIA
      mediaArea:
        currentStore.media.area &&
        Array.isArray(currentStore.media.area) &&
        currentStore.media.area.length
          ? currentStore.media.area
          : [],
      storeArea: currentStore?.media?.area?.description || [],
      snippetOverview: currentStore?.snippet?.overview || [],
      snippetFacility: currentStore?.snippet?.facility || [],
      snippetExperience: currentStore?.snippet?.experience || [],
      snippetService: currentStore?.snippet?.service || [],

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
      suggestParking01: " store.suggestParking01[0]"
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
      snippetOverview: currentStore.summaryDetails,
      title: currentStore.summaryText,
      neustar: neustar,
      buttonFloating: "labelButton",
      headlineText: currentStore?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: currentStore?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,
      storeType: currentStore.category.categoryType,
      storeCategory: currentStore.location.type
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
      snippetOverview: currentStore.summaryDetails,
      title: currentStore.summaryText,
      neustar: neustar,
      buttonFloating: "labelButton",
      headlineText: currentStore?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: currentStore?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,
      attributeService:
        currentStore?.summary?.service &&
        currentStore?.summary?.service?.length
          ? currentStore?.summary?.service
          : [],
      snippetService: currentStore?.snippet?.service || [],
      mediaTopThree:
        currentStore.media.service &&
        Array.isArray(currentStore.media.service) &&
        currentStore.media.service.length
          ? currentStore.media.service
          : [],
      mediaGallery:
        currentStore.media.gallery &&
        Array.isArray(currentStore.media.gallery) &&
        currentStore.media.gallery.length
          ? currentStore.media.gallery
          : [],
      storeType: currentStore.category.categoryType,
      storeCategory: currentStore.location.type
    };
    const sectionServiceHTML = service.services.render(storeServices);
    ///////////////////////////////////////////////////////////////
    /////////////////////////// SERVICE ///////////////////////////
    ///////////////////////////////////////////////////////////////

    const nearbyStore = currentStore.nearbyStore || [];
    const nearbyHeadline = nearbyStore.headline;
    const nearbyHours = nearbyStore.hours;
    const nearbyLocation = nearbyStore.nearbyLocation;
    const nearbyStores = currentStore.nearbyStore || [];
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
      snippetOverview: currentStore?.summaryDetails,
      title: currentStore?.summaryText,
      neustar: neustar,
      buttonFloating: "labelButton",
      headlineText: currentStore?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: currentStore?.location?.region || "Default Region", // Provide a default value
      attributesArrays: attributesArray,

      headlineText: currentStore?.headline?.text || "Default Headline", // Provide a default value
      locationRegion: currentStore?.location?.region || "Default Region", // Provide a default value
      storeRegion: currentStore.region,
      //   currentDistance: MapDistance.calculateDistance(
      //     userLocation,
      //     storeLocation
      //   ),
      //   storeRange: getStoreRange(calculateDistance),
      storeRange: storeRange,
      storeDistance: storeDistance,
      storeTypes: currentStore?.category?.genre,
      storeType: currentStore?.category?.categoryType,
      storeCategory: currentStore?.location?.type,

      nearbyStore: currentStore?.nearbyStore || [],
      nearbyHeadlines: currentStore?.nearbyStore?.nearbyHeadline || [],
      nearbyHeadline:
        currentStore?.nearbyStoresCollection?.items?.nearbyHeadline &&
        Array.isArray(
          currentStore?.nearbyStoresCollection?.items?.nearbyHeadline
        ) &&
        currentStore?.nearbyStoresCollection?.items?.nearbyHeadline?.length
          ? currentStore?.nearbyStoresCollection?.items?.nearbyHeadline
          : [],

      // ATTRIBUTES
      attributesFacility:
        currentStore?.summary?.facility &&
        currentStore?.summary?.facility?.length
          ? currentStore?.summary?.facility
          : [],
      mediaArea:
        currentStore?.media?.area &&
        Array.isArray(currentStore?.media?.area) &&
        currentStore?.media?.area?.length
          ? currentStore?.media?.area
          : [],
      snippetFacility: currentStore.snippet.facility || [],
      popularTimes: currentStore.popularTimes || [],

      storeType: currentStore?.category?.categoryType,
      storeCategory: currentStore?.location?.type
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
      storeGenre: currentStore?.category?.genre,
      storeType: currentStore?.category?.categoryType,
      storeContact: currentStore?.contact,
      storeAddress: currentStore?.location?.address || [],
      storeLocatedIn: currentStore?.location?.locatedIn,
      storeRegion: currentStore?.location?.region || "Default Region", // Provide a default value
      //   currentDistance: MapDistance.calculateDistance(
      //     userLocation,
      //     storeLocation
      //   ),
      //   storeRange: getStoreRange(calculateDistance),
      storeRange: storeRange,
      storeDistance: storeDistance,
      storeName: currentStore?.headline?.text || "Default Headline", // Provide a default value
      storeHours: currentStore?.hours,
      storeRatings: currentStore.ratings[0].key || [],
      storeRatingGoogle: currentStore.googleRatings,
      storeRatingYelp: currentStore.yelpRatings,
      storeHandle: currentStore.handles,
      storeReviews: currentStore.ratings[0].value || [],
      storeBest: attributesArray,
      storeLogo: currentStore.media.logo,
      storeNeustar: currentStore.neustar
    };

    console.log("storeDetails", storeDetails);

    // const detailsPanel = panel.panel.render(storeDetails);

    ///////////////////////////////////////////////////////////////
    /////////////////////////// DETAILS ///////////////////////////
    ///////////////////////////////////////////////////////////////

    let StoreHeroData = {
      rating: storeData.rating,
      costEstimate: storeData.costEstimate,
      storeType: storeData.storeType,
      distance: storeData.distance,
      city: storeData.city,
      state: storeData.state,
      galleryImages: storeObject.galleryImages
    };

    const storeLocationHeader =
      storeData.location.city + "," + storeData.location.area;

    const storeDetailsHTML = sidebar.storeDetails.render(storeData);

    const storeHeroHTML = components.storeHero.render(storeHeroData);
    const storeOverviewHTML = components.storeOverview.render(storeOverviewData);
    const storeExperienceHTML = components.storeExperience.render(storeExperienceData); 
    const storeServiceHTML = components.storeService.render(storeServiceData);
    const storeBusinessHTML = components.storeBusiness.render(yelpData);
    const storeLocationHTML = components.storeLocation.render(storeLocationData);

    // const storeLocationHTML = components.storeLocation.render(
    //   storeData,
    //   storeData.location,
    //   storeData?.location?.city
    // );
    // const city = storeData?.location?.city;
    // const matchedLocation = data.location?.locations?.find(
    //   (loc) => loc.city === city
    // );
    // console.log("debug log: location02 - Location matching:", {
    //   cityToMatch: city,
    //   matchedLocation
    // });

    // if (matchedLocation) {
    //   // const locationData = {
    //   //   header: store.location.header || "Location",
    //   //   text: store.location.text,
    //   //   attribute: matchedLocation,
    //   //   footer: data.footerData?.location
    //   // };
    //   const storeLocationHeader =
    //   storeData.location.city + "," + storeData.location.area;
    //   console.log(
    //     "debug log: location15 - Rendering service with:",
    //     storeLocationHeader
    //   );
    //   console.log(
    //     "debug log: service01 - Rendering service with:",
    //     storeServiceData
    //   );
    //   try {
    //     storeLocation.innerHTML = components.storeLocation.render(
    //       storeLocationHeader,
    //       storeLocationData.attribute,
    //       storeLocationData.footer
    //     );
    //   } catch (error) {
    //     console.error("Error rendering service:", error);
    //   }
    // }
    // Location Section
    // const storeLocationHTML = document.getElementById("store-location");
    // if (storeLocationHTML && storeLocationData) {
    //   try {
    //     storeLocationHTML.innerHTML = components.storeLocation.render(
    //       storeLocationData.header,
    //       storeLocationData.attribute,
    //       storeLocationData.footer
    //     );

    //     // Pass the full storeLocationData to afterRender
    //     components.storeLocation.afterRender(storeLocationData);
    //   } catch (error) {
    //     console.error("Error rendering location section:", error);
    //   }
    // }
    // const storeOverviewHTML = components.storeOverview.render(
    //   storeOverviewData.header,
    //   storeOverviewData.text,
    //   storeOverviewData.summary,
    //   storeOverviewData.footer
    // );
    // const storeExperienceHTML = components.storeExperience.render(
    //   storeExperienceData.header,
    //   storeExperienceData.text,
    //   storeExperienceData.footer,
    //   storeExperienceData.area,
    //   storeExperienceData.attribute
    // );
    // const storeServiceHTML = components.storeService.render(
    //   storeServiceData.header,
    //   storeServiceData.text,
    //   storeServiceData.attributes,
    //   storeServiceData.footer
    // );
    // const storeBusinessHTML = components.storeBusiness.render(storeData);
    // const storeLocationHTML = components.storeLocation.render(
    //   storeLocationHeader,
    //   storeLocationData.attribute,
    //   storeLocationData.footer
    // );

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
                    $ {storeOverviewHTML}
                  </div>
                </div>
                <div id="section" class="section col04">
                  <div class="col04 array content" id="store-experience">
                    $ {storeExperienceHTML}
                  </div>
                </div>
                <div id="section" class="section col04">
                  <div class="col04 array content" id="store-service">
                    $ {storeServiceHTML}
                  </div> 
                </div>
                <div id="section" class="section col04">
                  <div class="grid04-overflow array" id="business-hours">
                    $ {storeBusinessHTML}
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
      behavior: "smooth"
    });

    const storeData = data.store?.item?.[0];

    // window.onload = function() {
    //   initSections();
    // }
    // function initSections() {
    //   try {
    //     // Hero Section
    //     const storeHero = document.getElementById("store-hero");
    //     if (storeHero && currentStore.hero?.[0]) {
    //       // storeHero.innerHTML = components.storeHero.render(store.hero[0].hero);
    //       storeHero.innerHTML = components.storeHero.render(contentfulData);
    //       components.storeHero.afterRender?.();
    //     }

    //     // Overview Section
    //     const storeOverview = document.getElementById("store-overview");
    //     if (storeOverview && storeData. overview?.[0]) {
    //       storeOverview.innerHTML = components.storeOverview.render(
    //         storeData.overview[0].header,
    //         storeData.overview[0].text,
    //         storeData.overview[0].summary,
    //         storeData.overview[0].footer
    //       );
    //     }

    //     // Experience Section
    //     const storeExperience = document.getElementById("store-experience");
    //     if (storeExperience && store.experience?.[0]) {
    //       storeExperience.innerHTML = components.storeExperience.render(
    //         storeData.experience[0].header,
    //         storeData.experience[0].text,
    //         storeData.experience[0].footer,
    //         storeData.experience[0].area,
    //         storeData.experience[0].attribute
    //       );
    //       array.create.initializeCarousel("area");
    //     }

    //     // Service Section
    //     const storeService = document.getElementById("store-service");
    //     if (storeService && storeData.service?.[0]) {
    //       storeService.innerHTML = components.storeService.render(
    //         storeServiceData.header,
    //         storeServiceData.text,
    //         storeData.serviceCategoryDataf,
    //         storeServiceData.footer
    //       );
    //     }

    //     // Business Section
    //     const storeBusiness = document.getElementById("store-business");
    //     if (storeBusiness && store.hours) {
    //       storeBusiness.innerHTML = components.storeBusiness.render(storeData);
    //       components.storeBusiness.afterRender();
    //     }

    //     // Location Section
    //     const storeLocation = document.getElementById("store-location");
    //     if (storeLocation && storeData.location) {
    //       const storeLocationHeader = `${storeData.location.city},${storeData.location.area}`;
    //       storeLocation.innerHTML = components.storeLocation.render(
    //         storeLocationHeader,
    //         storeData.location.attribute,
    //         storeData.location.footer
    //       );
    //     }

    //     // Store Details Sidebar
    //     const storeDetails = document.getElementById("store-details");
    //     if (storeDetails) {
    //       storeDetails.innerHTML = sidebar.storeDetails.render(storeData);
    //     }

    //     // Initialize map if needed
    //     if (document.getElementById("map-container")) {

    //         initMap({
    //           container: "map-container",
    //           style: "mapbox://styles/mapbox/streets-v11",
    //           center: [storeData.location.geolocation.lon, storeData.location.geolocation.lat],
    //           zoom: 13,
    //           attributionControl: false,
    //         });

    //     }

    //   } catch (error) {
    //     console.error("Error in after_render:", error);
    //   }
    // };

    // Fetch user data
    // Fetch user data
    const accessToken = localStorage.getItem("accessToken");
    let userData = null;
    try {
      const userResponse = await fetch("http://localhost:4000/api/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (userResponse.ok) {
        userData = await userResponse.json();
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Now pass the userData to userControl.render
    const userControlsHTML = userControl.render(store, {
      totalLikes: userData?.totalLikes || 0,
      totalDislikes: userData?.totalDislikes || 0,
      rating: userData?.rating || 0 // Add this line if 'rating' is needed
    });

    // Update the impression button event listener
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

    if (!store || !store.someProperty) {
      // Handle error or missing data
      const popularTime = store.popularTimes || [];
      const popularTimes = store.popularTimes || [];
      // const storeLocation = [store.location.geolocation.lat,store.location.geolocation.lon];
      // const storeLocation = store.location.geolocation || [];
      // const storeLocation =
      //   store.location && store.location.geolocation
      //     ? {
      //         lat: store.location.geolocation.lat,
      //         lon: store.location.geolocation.lon,
      //       }
      //     : { lat: 0, lon: 0 }; // Default values if location is not defined
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

      // const map = initMap({
      //   container: "map-container",
      //   style: "mapbox://styles/mapbox/streets-v11", // your map style here
      //   center: storeLocation, // Center the map on the store's location
      //   zoom: 13, // Adjust zoom as needed
      //   attributionControl: false,
      // });

      const modal = modals.init();

      if (document.getElementById("myBtn")) {
        document.addEventListener("DOMContentLoaded", () => {
          modals.init();
        });
      } else {
        console.error("myBtn element not found");
      }

      // new mapboxgl.Marker()
      //   .setLngLat([storeLocation.lon, storeLocation.lat])
      //   .addTo(map);
      // const bounds = new mapboxgl.LngLatBounds();
      // bounds.extend(new mapboxgl.LngLat(storeLocation.lon, storeLocation.lat));
      // map.fitBounds(bounds, { padding: 50, duration: 1000 });
    }
  },
  handleImpression: async (storeId, action) => {
    try {
      const response = await sendImpression(storeId, action);
      if (response.message === "Impression added successfully") {
        StoreScreen.updateImpressionUI(
          storeId,
          response.likes,
          response.dislikes
        );
      } else {
        throw new Error(response.message || "Failed to update impression");
      }
    } catch (error) {
      console.error("Error sending impression:", error);
      alert(error.message);
    }
  },

  updateImpressionUI: (storeId, likes, dislikes) => {
    const likeButton = document.querySelector(
      `.impression-button.like[data-store-id="${storeId}"]`
    );
    const dislikeButton = document.querySelector(
      `.impression-button.dislike[data-store-id="${storeId}"]`
    );

    if (likeButton) {
      likeButton.querySelector(".count").textContent = likes;
    }
    if (dislikeButton) {
      dislikeButton.querySelector(".count").textContent = dislikes;
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
  shareStore: function (storeURL) {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this store!",
          url: storeURL
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(storeURL)
        .then(() => {
          alert("Store link copied to clipboard!");
        })
        .catch(console.error);
    }
  },

  toggleSaveStore: function (storeName) {
    const saveButton = document.getElementById("storeControls-save");
    if (saveButton.classList.contains("saved")) {
      saveButton.classList.remove("saved");
      saveButton.querySelector("span").textContent = "Save";
      alert(`${storeName} removed from favorites`);
    } else {
      saveButton.classList.add("saved");
      saveButton.querySelector("span").textContent = "Saved";
      alert(`${storeName} added to favorites`);
    }
    // Here you would typically update the user's saved stores in your application state
  },

  toggleCheckInStore: function (storeName) {
    const checkinButton = document.getElementById("storeControls-checkin");
    const userImpression = document.getElementById("userImpression");
    if (checkinButton.classList.contains("checked-in")) {
      checkinButton.classList.remove("checked-in");
      checkinButton.querySelector("span").textContent = "Check-in";
      userImpression.classList.add("disabled");
      alert(`Checked out from ${storeName}`);
    } else {
      checkinButton.classList.add("checked-in");
      checkinButton.querySelector("span").textContent = "Checked-in";
      userImpression.classList.remove("disabled");
      alert(`Checked in to ${storeName}`);
    }
    // Here you would typically update the user's check-in status in your application state
  },

  toggleImpression: async function (storeId, type) {
    const impressionButton = document.querySelector(
      `.impression-button.${type}`
    );
    const otherType = type === "like" ? "dislike" : "like";
    const otherButton = document.querySelector(
      `.impression-button.${otherType}`
    );

    try {
      const response = await fetch("http://localhost:4000/api/impression", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ storeId, action: type })
      });
      const data = await response.json();

      if (data.success) {
        if (impressionButton.classList.contains("active")) {
          impressionButton.classList.remove("active");
        } else {
          impressionButton.classList.add("active");
          otherButton.classList.remove("active");
        }

        this.updateImpressionCount("like", data.likes);
        this.updateImpressionCount("dislike", data.dislikes);
      } else {
        alert(data.message || "Failed to update impression. Please try again.");
      }
    } catch (error) {
      console.error("Error updating impression:", error);
      alert("An error occurred. Please try again.");
    }
  },

  updateImpressionCount: function (type, count) {
    const button = document.querySelector(`.impression-button.${type}`);
    const countSpan = button.querySelector(".count");
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
    window.addEventListener("beforeunload", () => this.syncWithServer());
  },

  toggleImpression(storeId, type) {
    const impressionButton = document.querySelector(
      `.impression-button.${type}`
    );
    const otherType = type === "like" ? "dislike" : "like";
    const otherButton = document.querySelector(
      `.impression-button.${otherType}`
    );

    // Optimistic UI update
    if (impressionButton.classList.contains("active")) {
      impressionButton.classList.remove("active");
      this.updateImpressionCount(type, -1);
      this.queueImpression(storeId, `un${type}`);
    } else {
      impressionButton.classList.add("active");
      this.updateImpressionCount(type, 1);
      this.queueImpression(storeId, type);
      if (otherButton.classList.contains("active")) {
        otherButton.classList.remove("active");
        this.updateImpressionCount(otherType, -1);
        this.queueImpression(storeId, `un${otherType}`);
      }
    }
  },

  updateImpressionCount(type, change) {
    const button = document.querySelector(`.impression-button.${type}`);
    const countSpan = button.querySelector(".count");
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
      const response = await fetch("/api/sync-impressions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ impressions: impressionsToSync })
      });
      const data = await response.json();

      if (!data.success) {
        console.error("Failed to sync impressions:", data.message);
        // Re-queue failed impressions
        this.queue = [...this.queue, ...impressionsToSync];
      }
    } catch (error) {
      console.error("Error syncing impressions:", error);
      // Re-queue all impressions on error
      this.queue = [...this.queue, ...impressionsToSync];
    }

    this.lastSyncTime = Date.now();
  }
};

// Initialize the impression handler
document.addEventListener("DOMContentLoaded", () => {
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
