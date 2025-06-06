// main.js

import * as components from './components/components.js';
import * as data from '../server/data/data.js';
import { style } from './style/style.js';
import { glyph } from './icon/glyph.js';
import { initMap } from './map/map.js';
import { TextBlock } from './text/text.js';
import * as array from './components/array.js';
import * as control from "./components/controls.js";
import './style/style.js';

console.log("debug log: Initializing application");

const store = data.store?.item?.[0];
const storeLocation = store?.location?.[0]; // Access first location item in array
const storeCity = store.city;

console.log("debug log: store-init01 - Initial store data:", store);

const storeOverviewData = data.store?.item?.[0]?.overview?.[0];
const storeServiceData = data.store?.item?.[0]?.service?.[0];
const storeExperienceData = data.store?.item?.[0]?.experience?.[0];
const storeHeroData = data.store?.item?.[0]?.hero?.[0];
const storeLocationData = data.store?.item?.[0]?.location;
console.log("debug log: location13 - Extracted data structures:", {
  storeLocationData
});

console.log("debug log: Extracted data:", {
  overview: storeOverviewData,
  service: storeServiceData,
  experience: storeExperienceData,
  location: storeLocationData,
  hero: storeHeroData,
});

document.addEventListener("DOMContentLoaded", async () => {
  console.log("debug log: DOM content loaded");

  try {
    // Initialize the business hours section using initializeTimeline
    array.create.initializeTimeline("business-hours");

    console.log("debug log: Initializing application data");
    const { storeData } = await data.initializeData();

    const businessHoursContainer = document.getElementById("business-hours");
    if (businessHoursContainer && storeData?.hours) {
      console.log("Rendering business hours with data:", storeData.hours[0]);
      businessHoursContainer.innerHTML =
        components.storeBusinessHours.render(storeData);
      components.storeBusinessHours.afterRender();
    }

    if (storeData?.hours) {
      console.log("Rendering business hours with data:", storeData.hours[0]);
      const businessHoursContainer = document.getElementById("business-hours");
      if (!businessHoursContainer) {
        console.error("Element with ID 'business-hours' not found.");
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
      const container = document.getElementById("business-hours");      
      if (!container && section.data) {
        console.error("Element with ID 'business-hours' not found.");
        try {
          container.innerHTML = section.render.render(section.data);
          section.render.afterRender?.();
        } catch (error) {
          console.error(`Error rendering ${section.id}:`, error);
        }
      }
    }

    // Initialize remaining components
    const mapNearby = document.getElementById("map-nearby");
    if (mapNearby) {
      mapNearby.innerHTML = components.mapNearby.render(data.mapRadiusData);
      initMap();
    }

    console.log("debug log: Application initialization complete");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});