
import * as components from "./components/components.js";
import * as data from "../server/data/data.js";
import { glyph } from "./icon/glyph.js";
import { initMap } from "./map/map.js";
import { TextBlock } from "./text/text.js";
import * as array from "./components/array.js";
import * as control from "./components/controls.js";
import '../client/styles/style.js';

console.log("debug log: Initializing application");


const store = data.store?.item?.[0];
// const storeLocation = store?.location?.[0]; // Access first location item in array
const storeCity = store.city;

console.log("debug log: store-init01 - Initial store data:", store);

const storeOverviewData = data.store?.item?.[0]?.overview?.[0];
const storeServiceData = data.store?.item?.[0]?.service?.[0];
const storeExperienceData = data.store?.item?.[0]?.experience?.[0];
const storeHeroData = data.store?.item?.[0]?.hero?.[0];
const storeLocationData = data.store?.item?.[0]?.location;

// Log extracted data structures
console.log("debug log: store-init02 - Extracted data structures:", {
  overview: storeOverviewData,
  service: storeServiceData,
  experience: storeExperienceData,
  location: storeLocationData,
  hero: storeHeroData,
});

console.log("debug log: Initializing application");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Initializing application data");
    // Get data first
    const { storeData } = await data.initializeData();


    // Hero Section
    const storeHero = document.getElementById("store-hero");
    if (storeHero && storeHeroData) {
      console.log(
        "debug log: hero01 - Rendering hero with:",
        store.hero?.[0].hero
      );
      try {
        storeHero.innerHTML = components.storeHero.render(store.hero?.[0].hero);
        components.storeHero.afterRender?.();
      } catch (error) {
        console.error("Error rendering hero:", error);
      }
    }

    // Overview Section
    const storeOverview = document.getElementById("store-overview");
    if (storeOverview && storeOverviewData) {
      console.log(
        "debug log: overview01 - Rendering overview with:",
        storeOverviewData
      );
      try {
        storeOverview.innerHTML = components.storeOverview.render(
          storeOverviewData.header,
          storeOverviewData.text,
          storeOverviewData.summary,
          storeOverviewData.footer
        );
      } catch (error) {
        console.error("Error rendering overview:", error);
      }
    }

    // Service Section
    const storeService = document.getElementById("store-service");
    if (storeService && storeServiceData) {
      console.log(
        "debug log: service01 - Rendering service with:",
        storeServiceData
      );
      try {
        storeService.innerHTML = components.storeService.render(
          storeServiceData.header,
          storeServiceData.text,
          data.serviceCategoryData,
          storeServiceData.footer
        );
      } catch (error) {
        console.error("Error rendering service:", error);
      }
    }

    // Experience Section
    const storeExperience = document.getElementById("store-experience");
    if (storeExperience && storeExperienceData) {
      console.log(
        "debug log: experience01 - Rendering experience with:",
        storeExperienceData
      );
      try {
        storeExperience.innerHTML = components.storeExperience.render(
          storeExperienceData.header,
          storeExperienceData.text,
          storeExperienceData.footer,
          storeExperienceData.area,
          storeExperienceData.attribute
        );
        array.create.initializeCarousel("area");
      } catch (error) {
        console.error("Error rendering experience:", error);
    }
    }

    // Location Section
    const storeLocation = document.getElementById("store-location");
    if (storeLocation && storeLocationData) {
      console.log("debug log: location01 - Location data:", {
        storeData: store,
        locationData: store.location,
        city: store?.location?.city
      });

      const storeData = store;
      const locationData = store.location;
      const city = store?.location?.city;
      const area = store?.location?.area;
      const locationList = data.location;
      // console.log('debug log: location03 - Location matching:', store?.item?.[0].location?.city);

      // const matchedLocation = location.locations.find(loc => loc.city === storeCity);
      // const matchedLocation = location.locations.find(loc => loc.city === storeCity)?.city
      const matchedLocation = data.location?.locations?.find(
        (loc) => loc.city === city
      );

      console.log("debug log: location02 - Location matching:", {
        cityToMatch: city,
        matchedLocation
      });

      if (matchedLocation) {
        // const locationData = {
        //   header: store.location.header || "Location",
        //   text: store.location.text,
        //   attribute: matchedLocation,
        //   footer: data.footerData?.location
        // };
        const storeLocationHeader =
          store.location.city + "," + store.location.area;
        console.log(
          "debug log: location15 - Rendering service with:",
          storeLocationHeader
        );
        console.log(
          "debug log: service01 - Rendering service with:",
          storeServiceData
        );
        try {
          storeLocation.innerHTML = components.storeLocation.render(
            storeLocationHeader,
            storeLocationData.attribute,
            storeLocationData.footer
          );
        } catch (error) {
          console.error("Error rendering service:", error);
        }
      }
    }


    // business Section
    const storeBusiness = document.getElementById("store-business");
    if (storeData?.hours) {
      console.log("Rendering business hours with data:", storeData.hours[0]);
      try {
        storeBusiness.innerHTML = components.storeBusiness.render(storeData);
      components.storeBusiness.afterRender();
      // Initialize the business hours section using initializeDatavis
      } catch (error) {
        console.error("Error rendering hero:", error);
      }
    }

    
    // Other UI Components

      // Footer
      const footerContainer = document.getElementById("section-footer");
      if (footerContainer) {
        footerContainer.innerHTML = components.sectionFooter.render(
          data.footerData
        );
      }

      // Store Details
      const storeDetailContainer = document.getElementById("store-detail");
      if (storeDetailContainer) {
        storeDetailContainer.innerHTML = components.storeDetail.render(
          data.heroData
        );
      }

      // Category
      const categoryContainer = document.getElementById("store-category");
      if (categoryContainer) {
        categoryContainer.innerHTML = components.storeCategory.render(
          data.serviceCategoryData
        );
        array.create.initializeCarousel("category");
      }

      // Map
      const mapNearby = document.getElementById("map-nearby");
      if (mapNearby) {
        mapNearby.innerHTML = components.mapNearby.render(data.mapRadiusData);
        initMap();
      }

      // Store Attributes
      const storeAttributes = document.getElementById("card-attributes");
      if (storeAttributes && store?.location?.attribute) {
        storeAttributes.innerHTML = components.storeAttributes.render(
          store.location.attribute
        );
      }

      
    for (const section of sections) {
      const container = document.getElementById(section.id);
      if (!container && section.data) {
        console.error(`Element with ID '${section.id}' not found.`);
        continue;
      }
      try {
        container.innerHTML = section.render.render(section.data);
        section.render.afterRender?.();
      } catch (error) {
        console.error(`Error rendering ${section.id}:`, error);
      }
    }

    

    console.log("debug log: Application initialization complete");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});