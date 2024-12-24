// src/components/GeojsonStoreListing.js
import createStoreCard from "./card-store.js";
import * as Address from "./address.js";
import * as Geolocate from "./Geolocate.js";
import * as GeolocationRange from "./GeolocationRange.js"

function getStoreCurrentStatusHTML(popularTimes) {
  return popularTimes.map(() => {
    const container = document.createElement("div");
    container.className = "chart-container";
    return container;
  });
}

export function createGeojsonStoreListing(store, map, userCoordinates) {
  if (!store.properties) {
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
  console.log("store", store);
  console.log("storeRange", storeRange);
  console.log("store.properties", store.properties);

  const popularTime = popularTimes || [];
  // console.log(popularTime);
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
  console.log("tagAttributes", tagAttributes);
  // const storeRatings = ratings[0].key || [];
  // const storeReviews = ratings[0].value || [];
  const currentDay = new Date().getDay();

  const storeAddress = address;
  console.log("storeAddress", storeAddress);
  const storeRegion = store.storeRegion;
  console.log("storeRegion", storeRegion);
  const storeCity = Address.city(storeAddress);
  console.log("storeCity", storeCity);
  const designator = Address.designator(storeAddress);
  console.log("designator", designator);
  const storeAddressMin = Address.address(storeAddress);
  console.log("storeAddressMin", storeAddressMin);




  
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
      // Logging for debugging
      // console.log("Index:", idx, "Data:", popularTime[idx]);

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

  const listing = document.createElement("a");
  listing.className = " " + "card-postListing-item";
  listing.href = "/" + variant + "/" + slug;
  listing.rel = "noopener noreferrer nofollow";
  listing.target = categoryType + "-${store.sys.id}";
  listing.onclick = function () {
    mapRoute(userCoordinates, store.geometry.coordinates);
  };
  const carousel = document.createElement("a");
  carousel.className = "card-store";
  carousel.href = "/" + variant + "/" + slug;
  carousel.rel = "noopener noreferrer nofollow";
  carousel.target = categoryType + "-${store.sys.id}";
  carousel.onclick = function () {
    mapRoute(userCoordinates, store.geometry.coordinates);
  };
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";

  const neustarHTML = `${store.properties.neustar} ${generateNeustarIcons(
    store.properties.neustar
  )}`;

  // function generateStoreStatus() {
  //   const currentHour = new Date().getHours();
  //   const currentDay = new Date().getDay();
  //   let statusHTML = "";

  //   if (currentDay < popularTimes[0].length - 1) {
  //     const currentValue = parseInt(
  //       popularTimes[currentHour + 1][currentDay + 1]
  //     );
  //     if (currentValue >= 0 && currentValue <= 5) {
  //       statusHTML = '<div class="status not-busy">NOT BUSY</div>';
  //     } else if (currentValue > 5 && currentValue <= 10) {
  //       statusHTML =
  //         '<div class="status moderately-busy">MODERATELY BUSY</div>';
  //     } else if (currentValue > 10 && currentValue <= 12) {
  //       statusHTML = '<div class="status busy">BUSY</div>';
  //     } else {
  //       statusHTML = '<div class="status packed">PACKED</div>';
  //     }
  //   }

  //   return statusHTML;
  // }
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
        statusHTML =
          'Moderately Busy';
      } else if (currentValue > 10 && currentValue <= 12) {
        statusHTML = 'Busy';
      } else {
        statusHTML = 'Packed';
      }
    }

    return statusHTML;
  }





  // DISTANCE
  // let userCoordinates = null;
  //    const coordinateUser = () => {
  //      return new Promise((resolve, reject) => {
  //        if (navigator.geolocation) {
  //          navigator.geolocation.getCurrentPosition(
  //            (position) => {
  //              userCoordinates = [
  //                position.coords.longitude,
  //                position.coords.latitude,
  //              ];
  //              // console.log("WORKS userCoordinates geolocate", userCoordinates);
  //              resolve(userCoordinates);
  //              return [userCoordinates[0], userCoordinates[1]];
  //            },
  //            (error) => {
  //              reject(error);
  //            }
  //          );
  //        } else {
  //          console.log("Geolocation not available");
  //          reject(new Error("Geolocation not available"));
  //        }
  //      });
  //    };
  //    const coordinateStore = Geolocate.coordinateStore(store);
  //    const storeLocation = [
  //      store.location.geolocation.lon,
  //      store.location.geolocation.lat,
  //    ];
  //    const userLocation = Geolocate.coordinateUser();
  
    //  const userLocation = await coordinateUser();
  
    //  let locations = [
    //    { name: 'userLocation', coordinates: userLocation },
    //    { name: 'storeLocation', coordinates: storeLocation }
    //  ];
    //  const storeRange = GeolocationRange.storeRange.render(locations);
    //  const storeDistance = GeolocationRange.storeDistance.render(locations);
    const storeRanges = storeRange;
    console.log("storeRanges", storeRanges);
  






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
    console.log("storeStatus", storeStatus);


    createStoreCard.render(storeContentData)
    .then(storeContent => {
      const storeCarouselItem = generateCarouselItem(storeContent);
      cardContainer.appendChild(storeCarouselItem);
      carousel.appendChild(cardContainer);

      // Add 'loading' class to the elements
      storeCarouselItem.classList.add('loading');
      cardContainer.classList.add('loading');
      carousel.classList.add('loading');

      // Remove 'loading' class after a specified time (e.g., 5000ms)
      setTimeout(() => {
        storeCarouselItem.classList.remove('loading');
        cardContainer.classList.remove('loading');
        carousel.classList.remove('loading');
      }, 5000);
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
    // const storeContent = createStoreCard.render(storeContentData);
    // const storeCarouselItem = generateCarouselItem(storeContent);
    // cardContainer.appendChild(storeCarouselItem);
    // carousel.appendChild(cardContainer);
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
  carouselItem.className = "card card-store item";
  carouselItem.innerHTML = content;
  return carouselItem;
}

function generateGalleryHTML(gallery) {
  let galleryHTML = "";
  gallery.slice(0, 3).forEach((galleryItem) => {
    galleryHTML += `
                <img src="${galleryItem.url}" class="galleryItem ratio1x1" alt="" />
      `;
  });
  return galleryHTML;
}
