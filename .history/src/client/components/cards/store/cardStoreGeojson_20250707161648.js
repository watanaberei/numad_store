// src/components/GeojsonStoreListing.js
import createStoreCard from "./card-store.js";
import * as Address from "../../map/geo/address.js";
import * as Geolocate from "../../map/geo/Geolocate.js";
import * as GeolocationRange from "../../map/geo/GeolocationRange.js"
import * as MapRoute from "../../map/mapRoute.js";
import * as components from "../../components.js"

function getStoreCurrentStatusHTML(popularTimes) {
  return popularTimes.map(() => {
    const container = document.createElement("div");
    container.className = "chart-container";
    return container;
  });
}

export function createGeojsonStoreListing(store, map, userCoordinates) {
  console.log("[GeojsonStoreListing.js:17] Creating store listing for:", store); // Line 17
  
  if (!store || !store.properties) {
    console.log("[GeojsonStoreListing.js:20] No properties found for store"); // Line 20
    return null; // Return null if there are no properties
  }
  
  const {
    lat,
    lon,
    popularTimes,
    best: originalBest,
    neustar,
    headline,
    title,
    seriesName,
    region,
    address,
    tag: originalTag,
    slug,
    variant,
    thumbnail,
    gallery: originalGallery,
    nearbyStore,
    logo,
    area,
    service,
    storeType,
    environment,
    noiseLevel,
    parking,
    storeRange,
    categoryType,
    genre,
    text,
    subtext,
    eyebrow,
    location,
    hours,
    summary,
    ratings,
    storeAttributes,
    publishedAt,
  } = store.properties;
  
  console.log("[GeojsonStoreListing.js:63] Store properties extracted, storeRange:", storeRange); // Line 63

  const popularTime = popularTimes || [];
  const limitedBest03 =
    originalBest && originalBest.length ? originalBest.slice(0, 3) : [];
  const limitedTags03 =
    originalTag && originalTag.length ? originalTag[0].tags.slice(0, 3) : [];
  const galleryData =
    originalGallery && Array.isArray(originalGallery) && originalGallery.length
      ? originalGallery
      : [];
  const galleryHTML = generateGalleryHTML(galleryData);
  const gallery = galleryData;
  const galleryUrl = galleryData.url;
  const galleryLimit = 3;
  const currentHour = new Date().getHours();
  const metaTagLabel = [
    "metaTagLabel01",
    "metaTagLabel02",
    "metaTagLabel03",
    "metaTagLabel04",
    "metaTagLabel05",
  ];
  const metaTagLimit = 3;
  const tagAttributes = storeAttributes || [];
  const tagLimit = 3;
  
  console.log("[GeojsonStoreListing.js:90] tagAttributes:", tagAttributes); // Line 90
  
  const currentDay = new Date().getDay();

  const storeAddress = address;
  console.log("[GeojsonStoreListing.js:95] storeAddress:", storeAddress); // Line 95
  
  const storeRegion = store.storeRegion;
  console.log("[GeojsonStoreListing.js:98] storeRegion:", storeRegion); // Line 98
  
  const storeCity = Address.city(storeAddress);
  console.log("[GeojsonStoreListing.js:101] storeCity:", storeCity); // Line 101
  
  const designator = Address.designator(storeAddress);
  console.log("[GeojsonStoreListing.js:104] designator:", designator); // Line 104
  
  const storeAddressMin = Address.address(storeAddress);
  console.log("[GeojsonStoreListing.js:107] storeAddressMin:", storeAddressMin); // Line 107

  ///////////////////////// START FIX - Initialize storeRanges properly /////////////////////////
  // Initialize storeRanges with the value from properties or null
  const storeRanges = storeRange || null;
  console.log("[GeojsonStoreListing.js:112] storeRanges initialized:", storeRanges); // Line 112
  ///////////////////////// END FIX - Initialize storeRanges properly /////////////////////////

  let storeStatus = "";
  if (
    popularTime &&
    popularTime[currentDay] &&
    popularTime[currentDay][currentHour + 1]
  ) {
    const currentValue = parseInt(popularTime[currentDay][currentHour + 1]);
    storeStatus = getStoreStatus(currentValue);
  }

  let bestHTML = "";
  limitedBest03.forEach((best) => {
    bestHTML += `
    <div class="metadata-tag">
      <span class="metadata-tag-text text01 bold">${best}</span>
    </div>`;
  });

  const storeCurrentStatusHTML = getStoreCurrentStatusHTML(popularTime);
  const storeCurrentStatusHTMLs = storeCurrentStatusHTML;

  storeCurrentStatusHTML.forEach((chartsContainer, idx) => {
    // Check if there is data for the current index
    if (
      !popularTime[idx] ||
      !Array.isArray(popularTime[idx]) ||
      popularTime[idx].length < 2
    )
      return;

    for (let dayIndex = 1; dayIndex < popularTime[idx][0].length; dayIndex++) {
      // Additional safety checks to ensure we're not accessing data that doesn't exist
      if (
        !popularTime[idx][currentHour + 1] ||
        typeof popularTime[idx][currentHour + 1][dayIndex] === "undefined"
      ) {
        continue;
      }

      const currentValue = parseInt(
        popularTime[idx][currentHour + 1][dayIndex]
      );

      const dayContainer = document.createElement("div");
      dayContainer.classList.add("chart");

      const header = document.createElement("div");
      header.classList.add("day-title");

      dayContainer.appendChild(header);

      if (dayIndex === currentDay + 1) {
        const currentStatus = document.createElement("div");
        currentStatus.classList.add("status");

        if (currentValue >= 0 && currentValue <= 5) {
          currentStatus.textContent = "NOT BUSY";
          currentStatus.classList.add("not-busy");
        } else if (currentValue > 5 && currentValue <= 10) {
          currentStatus.textContent = "MODERATELY BUSY";
          currentStatus.classList.add("moderately-busy");
        } else if (currentValue > 10 && currentValue <= 12) {
          currentStatus.textContent = "BUSY";
          currentStatus.classList.add("busy");
        } else {
          currentStatus.textContent = "PACKED";
          currentStatus.classList.add("packed");
        }

        dayContainer.appendChild(currentStatus);
      }
      chartsContainer.appendChild(dayContainer);
    }
  });

  // Function to generate the Neustar icons
  const generateNeustarIcons = (neustar) => {
    let iconsHTML = "";
    for (let i = 1; i <= 3; i++) {
      if (i <= neustar) {
        iconsHTML += '<i class="icon-neustar-active12"></i>';
      } else {
        iconsHTML += '<i class="icon-neustar-inactive12"></i>';
      }
    }
    return iconsHTML;
  };

  const carousel = document.createElement("a");
  carousel.className = "store card col01";
  carousel.href = "/" + slug;
  carousel.rel = "noopener noreferrer nofollow";
  carousel.target = "_blank" + categoryType + "-${store.sys.id}";
  carousel.onclick = function () {
    MapRoute.mapRoute(userCoordinates, store.geometry.coordinates);
  };

  const neustarHTML = `${store.properties.neustar} ${generateNeustarIcons(
    store.properties.neustar
  )}`;

  function generateStoreStatus() {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    let statusHTML = "";

    if (currentDay < popularTimes[0].length - 1) {
      const currentValue = parseInt(
        popularTimes[currentHour + 1][currentDay + 1]
      );
      if (currentValue >= 0 && currentValue <= 5) {
        statusHTML = 'Not Busy';
      } else if (currentValue > 5 && currentValue <= 10) {
        statusHTML = 'Moderately Busy';
      } else if (currentValue > 10 && currentValue <= 12) {
        statusHTML = 'Busy';
      } else {
        statusHTML = 'Packed';
      }
    }

    return statusHTML;
  }

  ///////////////////////// START REMOVED DUPLICATE CODE /////////////////////////
  // Removed duplicate storeRanges assignment that was causing the error
  // const storeRanges = storeRange; // This line was causing the error
  ///////////////////////// END REMOVED DUPLICATE CODE /////////////////////////

  if (variant === "stores") {
    carousel.className += " " + "listingStore-item";

    const data = popularTime;

    const chartsContainer = document.getElementById("chartsContainer");
    const storeStatus = generateStoreStatus();

    const storeContentData = {
      thumbnail: thumbnail,
      logo: logo,
      title: title,
      gallery: gallery,
      galleryHTML: galleryHTML,
      galleryURL: galleryUrl,
      galleryLimit: galleryLimit,
      tagLimit: tagLimit,
      headline: headline,
      publishedAt: publishedAt,
      storeType: storeType,
      environment: environment,
      noiseLevel: noiseLevel,
      parking: parking,
      title: text,
      neustar: neustar,
      neustarHTML: neustarHTML,
      categoryType: categoryType,
      storeCurrentStatusHTML: storeCurrentStatusHTML
        .map((container) => container.outerHTML)
        .join(""),
      region: region,
      storeCurrentStatus: storeStatus,
      bestHTML: bestHTML,
      genre: genre,
      best: originalBest,
      nearby: nearbyStore,
      ratings: ratings,
      address: storeAddress,
      region: storeRegion,
      city: storeCity,
      designator: designator,
      metaTagLabel: metaTagLabel,
      metaTagLimit: metaTagLimit,
      storeRange: storeRanges,
      storeAttributes: storeAttributes,
      tagAttributes: tagAttributes,
      tagLimit: tagLimit,
      addressMin: storeAddressMin,
    };
    
    console.log("[GeojsonStoreListing.js:299] storeStatus:", storeStatus); // Line 299
    console.log("[GeojsonStoreListing.js:300] Creating store card with data"); // Line 300

    ///////////////////////// START FIXED SYNC RENDER /////////////////////////
    // Changed to work with synchronous render method
    try {
      const storeContent = createStoreCard.render(storeContentData);
      console.log("[GeojsonStoreListing.js:304] Store card rendered successfully"); // Line 304
      carousel.innerHTML = storeContent;
      
      // Add loading state
      carousel.classList.add('loading');
      
      // Remove loading state after content is loaded
      setTimeout(() => {
        carousel.classList.remove('loading');
      }, 500);
    } catch (error) {
      console.error('[GeojsonStoreListing.js:316] An error occurred:', error); // Line 316
      carousel.innerHTML = '<div class="error">Error loading store</div>';
    }
    ///////////////////////// END FIXED SYNC RENDER /////////////////////////
  }

  return carousel;
}

function getStoreStatus(currentValue) {
  if (currentValue >= 0 && currentValue <= 5) {
    return "NOT BUSY";
  } else if (currentValue > 5 && currentValue <= 10) {
    return "MODERATELY BUSY";
  } else if (currentValue > 10 && currentValue <= 12) {
    return "BUSY";
  } else {
    return "PACKED";
  }
}

function generateCarouselItem(content) {
  const carouselItem = document.createElement("div");
  carouselItem.className = "container gridCard";
  carouselItem.innerHTML = content;
  return carouselItem;
}

function generateGalleryHTML(gallery) {
  console.log("!00: gallery", gallery);
  let galleryHTML = "";
  gallery.slice(0, 3).forEach((galleryItem) => {
    galleryHTML += `
                <img src="${galleryItem.url}" class="galleryItem ratio1x1" alt="" />
      `;
  });
  return galleryHTML;
}