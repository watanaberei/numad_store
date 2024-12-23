import * as components from "./components/components.js";
import * as data from "../server/data/data.js";
import { glyph } from "./icon/glyph.js";
import { initMap } from "./map/map.js";
import { TextBlock } from "./text/text.js";
import * as array from "./components/array.js";
import * as control from "./components/controls.js";
import '../client/styles/style.js';

console.log("debug log: Initializing application");

// Main data access constants
const store = data.store?.item?.[0];
const storeLocation = store?.location?.[0];
const storeCity = store?.city;

console.log("debug log: store-init01 - Initial store data:", store);

// Extracted data structures
const storeOverviewData = data.store?.item?.[0]?.overview?.[0];
const storeServiceData = data.store?.item?.[0]?.service?.[0];
const storeExperienceData = data.store?.item?.[0]?.experience?.[0];
const storeHeroData = data.store?.item?.[0]?.hero?.[0];
const storeLocationData = data.store?.item?.[0]?.location;

console.log("debug log: Extracted data:", {
  overview: storeOverviewData,
  service: storeServiceData,
  experience: storeExperienceData,
  location: storeLocationData,
  hero: storeHeroData,
});

console.log("debug log: Initializing application");





document.addEventListener("DOMContentLoaded", async () => {
  console.log("debug log: DOM content loaded");


  try {
    // Initialize the business hours section using initializeDatavis
    array.create.initializeDatavis("datavis");

    console.log("debug log: Initializing application data");
    const { storeData } = await data.initializeData();

    const businessHoursContainer = document.getElementById("datavis");
    if (businessHoursContainer && storeData?.hours) {
      console.log("Rendering business hours with data:", storeData.hours[0]);
      businessHoursContainer.innerHTML =
        components.storeBusinessHours.render(storeData);
      components.storeBusinessHours.afterRender();
    }

    if (storeData?.hours) {
      console.log("Rendering business hours with data:", storeData.hours[0]);
      const businessHoursContainer = document.getElementById("datavis");
      if (!businessHoursContainer) {
        console.error("Element with ID 'datavis' not found.");
        return;
      }
      businessHoursContainer.innerHTML = components.storeBusinessHours.render(storeData);
      components.storeBusinessHours.afterRender();
    }

    // Render other sections
    const sections = [
      { id: "store-hero", data: storeHeroData, render: components.storeHero },
      { id: "store-overview", data: storeOverviewData, render: components.storeOverview },
      { id: "store-service", data: storeServiceData, render: components.storeService },
      { id: "store-experience", data: storeExperienceData, render: components.storeExperience },
      { id: "store-location", data: storeLocationData, render: components.storeLocation },
    ];

    for (const section of sections) {
      const container = document.getElementById("datavis");      
      if (!container && section.data) {
        console.error("Element with ID 'datavis' not found.");
        try {
          container.innerHTML = section.render.render(section.data);
          section.render.afterRender?.();
        } catch (error) {
          console.error(`Error rendering ${section.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error initializing application:", error);
  }
    // Initialize remaining components
    const mapNearby = document.getElementById("map-nearby");
    if (mapNearby) {
      mapNearby.innerHTML = components.mapNearby.render(data.mapRadiusData);
      initMap();
    }

    console.log("debug log: Application initialization complete");
  



  try {
    const { storeData } = await data.initializeData();

    if (storeData?.hours) {
      console.log("Rendering business hours with data:", storeData.hours[0]);
      const businessHoursContainer = document.getElementById("datavis");
      if (!businessHoursContainer) {
        console.error("Element with ID 'datavis' not found.");
        return;
      }
      businessHoursContainer.innerHTML = components.storeBusinessHours.render(storeData);
      components.storeBusinessHours.afterRender();
    }

    // Render other sections
    const sections = [
      { id: "store-hero", data: storeData.hero, render: components.storeHero },
      { id: "store-overview", data: storeData.overview, render: components.storeOverview },
      { id: "store-service", data: storeData.service, render: components.storeService },
      { id: "store-experience", data: storeData.experience, render: components.storeExperience },
      { id: "store-location", data: storeData.location, render: components.storeLocation },
    ];

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

    // Initialize remaining components
    const mapNearby = document.getElementById("map-nearby");
    if (mapNearby) {
      mapNearby.innerHTML = components.mapNearby.render(data.mapRadiusData);
      initMap();
    }

    // Initialize the business hours section using initializeDatavis
    array.create.initializeDatavis("datavis");

    console.log("debug log: Application initialization complete");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});