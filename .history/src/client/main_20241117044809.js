// main.js

import * as components from './components/components.js';
import * as data from '../server/data/data.js';
import { style } from './style/style.js';
import { glyph } from './icon/glyph.js';
import { initMap } from './map/map.js';
import { TextBlock } from './text/text.js';
import * as array from './components/array.js';




// Sample data (replace with actual data from your database)
// Sample data extracted from store.overview=
const storeOverview = data.store?.overview ? data.store.overview[0] : null;
const overviewHeaderData = storeOverview?.header || null;
const overviewTextData = storeOverview?.text || null;
const overviewFooterData = storeOverview?.footer || null;
const overviewSummaryData = data.overviewSummaryData;


const storeHero = data.store?.hero ? data.store.hero[0] : null;

const storeService = data.store?.service ? data.store.service[0] : null;
const serviceHeaderData = storeService?.header || null;
const serviceTextData = storeService?.text || null;
const serviceFooterData = storeService?.footer || null;
const serviceCategoryData = data.serviceCategoryData;


const storeExperience = data.store?.experience ? data.store.experience[0] : null;
const experienceHeaderData = storeExperience?.header || null;
const experienceTextData = storeExperience?.text || null;
const experienceFooterData = storeExperience?.footer || null;
const experienceAreaData = storeExperience?.area || null;
const experienceAttributesData = storeExperience?.attribute || null;



const storeLocation = data.store?.location ? data.store.location[0] : null;


const footerData = data.footerData;
const SubStoreData = data.subStoreData;
const HeroData = data.heroData;
const textBlockData = data.textBlockData;
const textHeaderData = data.store;
const attributesData = data.attributesData;
const mapRadiusData = data.mapRadiusData;


// Render components

document.addEventListener('DOMContentLoaded', () => {
  console.log('debug log: storeLocation01 - Full store data structure:', {
    storeItemExists: !!data.store?.item,
    storeItemType: typeof data.store?.item,
    firstItem: data.store?.item?.[0],
    location: data.store?.item?.[0]?.Location // Note: Capital 'L' in Location based on your data structure
  });

 // Store Hero Section - Following pattern from storeOverview/storeService
 const storeHeroContainer = document.getElementById('store-hero');
 if (storeHeroContainer && data.store?.hero?.[0]) {
   const heroData = data.store.hero[0];
   console.log('Rendering store hero with data:', heroData);

   try {
     storeHeroContainer.innerHTML = components.storeHero.render(
       heroData.hero
     );
     console.log('Store hero rendered:', storeHeroContainer.innerHTML);
     
     // Initialize interactions after render
     components.storeHero.afterRender?.();
     
   } catch (error) {
     console.error('Error rendering store hero:', error);
     storeHeroContainer.innerHTML = '<div class="error">Error loading hero content</div>';
   }
 } else {
   console.warn('Store hero container or data not found');
 }

  // Render store overview
  const storeOverview = document.getElementById('store-overview');
  if (storeOverview && data.store?.overview?.[0]) {
    const overviewData = data.store.overview[0];
    storeOverview.innerHTML = components.storeOverview.render(
      overviewData.header,
      overviewData.text,
      overviewData.summary,
      overviewData.footer
    );
  }
    // Render store overview
    const storeService= document.getElementById('store-service');
    if (storeService && data.store?.service?.[0]) {
      const serviceData = data.store.service[0];
      console.log("serviceData:", serviceData)
      storeService.innerHTML = components.storeService.render(
        serviceHeaderData,
        serviceTextData,
        serviceCategoryData,
        serviceFooterData
      );
    }

    const storeExperience = document.getElementById('store-experience');
    if (storeExperience && data.store?.experience?.[0]) {
      const experienceData = data.store.experience[0];
      console.log("experienceData:", experienceData);
      
      storeExperience.innerHTML = components.storeExperience.render(
        experienceData.header,
        experienceData.text,
        experienceData.footer,
        experienceData.area,  // Pass the area data directly
        experienceData.attribute
      );
      
      // Initialize carousel after rendering
      array.create.initializeCarousel('area');
    }
  
    // Initialize card gallery - using cardPopularyData instead of cardPopularData
    // const cardGalleryContainer = document.getElementById('card-gallery');
    // if (cardGalleryContainer) {
    //   cardGalleryContainer.innerHTML = components.cardGallery.render(
    //     data.cardPopularyData,
    //     'gallery',
    //     'popularity',
    //     'regular',
    //     6
    //   );
    // }
    // const categoryContainer = document.getElementById('store-category');
    // if (categoryContainer) {
    //   categoryContainer.innerHTML = components.storeCategory.render(data.serviceCategoryData);
    //   components.cardCategoryItem.afterRender();
    //   array.create.initializeCarousel('category');
    // }

    const categoryContainer = document.getElementById('store-category');
    if (categoryContainer) {
      console.log('Category data:', data.serviceCategoryData);
      categoryContainer.innerHTML = components.storeCategory.render(data.serviceCategoryData);
      // components.cardCategoryItem.afterRender();
      array.create.initializeCarousel('category');
    }


    const storeLocation = document.getElementById('store-location');
    if (storeLocation && data.store?.location?.[0]) {
      console.log('Found store-location element, initializing...');
      const locationData = data.store.location[0];
      console.log('Location data:', locationData);
      
      try {
        storeLocation.innerHTML = components.storeLocation.render(
          locationData.header,
          locationData.text,
          locationData.attribute,
          locationData.footer
        );
        console.log('Store location rendered successfully');
  
        // Initialize any after-render functionality
        components.storeLocation.afterRender?.();
      } catch (error) {
        console.error('Error rendering store location:', error);
        storeLocation.innerHTML = '<div class="error">Error loading location content</div>';
      }
    // } else {
    //   console.warn('store-location element not found or location data missing');
    // }
  }
  

  

  
  // const overviewHeader = document.getElementById('overview-header');
  // if (overviewHeader) {
  //   overviewHeader.innerHTML = components.sectionHeader.render(overviewHeaderData);
  // }
  // const overviewText = document.getElementById('overview-header');
  // if (overviewText) {
  //   overviewText.innerHTML = components.textBlock.render(overviewTextData);
  // }
  // const overviewFooter = document.getElementById('overview-footer');
  // if (overviewFooter) {
  //   overviewFooter.innerHTML = components.sectionFooter.render(overviewFooterData);
  // }
  // // REPLACE




  const footerContainer = document.getElementById('section-footer');
  if (footerContainer) {
    footerContainer.innerHTML = components.sectionFooter.render(footerData);
  }

  const cardSubStoreItem = document.getElementById('card-substore-item');
  if (cardSubStoreItem) {
    cardSubStoreItem.innerHTML = components.cardSubStoreItem.render(SubStoreData);
  }
  const storeDetailContainer = document.getElementById('store-detail');
  if (storeDetailContainer) {
    storeDetailContainer.innerHTML = components.storeDetail.render(HeroData);
  }
  const heroGalleryContainer = document.getElementById('hero-gallery');
  if (heroGalleryContainer) {
    heroGalleryContainer.innerHTML = components.heroGallery.render(HeroData);
  }
  const heroContainer = document.getElementById('store-headline'); 
  if (heroContainer) {
    heroContainer.innerHTML = components.storeHeadline.render(HeroData);
  }
  const cardCategoryContainer = document.getElementById('card-category-item');
  if (cardCategoryContainer) {
    cardCategoryContainer.innerHTML = components.cardCategoryItem.render(serviceCategoryData);
  }
  const summaryCard = document.getElementById('card-summary-item'); 
  if (summaryCard) {
    summaryCard.innerHTML = components.storeSummary.render(overviewSummaryData);
  }
  const textBlock = document.getElementById('text-block');
  if (textBlock) {
    textBlock.innerHTML = components.textBlock.render(textBlockData);
  }
  const textHeader = document.getElementById('section-header');
  if (textHeader) {
    textHeader.innerHTML = components.sectionHeader.render(textHeaderData);
  }
  const mapNearby = document.getElementById('map-nearby');
  if (mapNearby) {
    mapNearby.innerHTML = components.mapNearby.render(mapRadiusData);
    initMap();  // Initialize the map from map.js when DOM is loaded
  }
  const storeAttributes = document.getElementById('card-attributes');
  if (storeAttributes) {
    storeAttributes.innerHTML = components.storeAttributes.render(attributesData);
  }
  const titleContainer = document.getElementById('title-container');
  if (titleContainer) {
    titleContainer.innerHTML = components.titleComponent.render(data.titleData);
  }
  // const cardGallery = document.getElementById('card-gallery-item');
  // if (cardGallery) {
  //   cardGallery.innerHTML = components.cardGalleryItem.render(data.cardGalleryData);
  // }

  const cardGallery = document.getElementById('card-gallery-item');
  if (cardGallery) {
    const galleryData = Object.values(data.cardGalleryData || {});
    cardGallery.innerHTML = components.cardGalleryItem.render({
      items: galleryData,
      type: 'gallery',
      style: 'regular',
      limit: 6
    });
  }
  // TextBlock.textblock.initialize();

  console.log('debug log: storeLocation01 - DOM loaded, data available:', {
    storeData: !!data.store,
    locationData: !!data.store?.location,
    firstLocationItem: data.store?.location?.[0]
  });

  const storeLocationElement = document.getElementById('store-location');
  if (storeLocationElement) {
    // Get current store's city
    const currentStore = data.store?.item?.[0];
    const currentCity = currentStore?.location?.city;
    
    console.log('debug log: storeLocation03 - Current store city:', currentCity);
    console.log('debug log: storeLocation04 - Available locations:', data.location?.locations);

    // Find matching location data
    const matchedLocation = data.location?.locations?.find(loc => loc.city === currentCity);
    console.log('debug log: storeLocation05 - Matched location data:', matchedLocation);

    try {
      if (matchedLocation) {
        const locationData = {
          header: currentStore?.location?.header || "Location",
          text: currentStore?.location?.text,
          attribute: matchedLocation,
          footer: data.footerData?.location
        };

        console.log('debug log: storeLocation06 - Constructed location data:', locationData);

        storeLocationElement.innerHTML = components.storeLocation.render(
          locationData.header,
          locationData.text,
          locationData.attribute,
          locationData.footer
        );
      } else {
        console.log('debug log: storeLocation07 - No matching location data found');
      }
    } catch (error) {
      console.error('debug log: storeLocation08 - Render error:', error);
    }
  }
  
  const storeLocationElement = document.getElementById('store-location');
  if (storeLocationElement) {
    // Fix: Access Location with capital 'L' based on your data structure
    const currentStore = data.store?.item?.[0];
    const currentCity = currentStore?.Location?.city; // Changed from location to Location
    
    console.log('debug log: storeLocation02 - Location data check:', {
      currentStore,
      currentCity,
      availableLocations: data.location?.locations?.map(loc => loc.city)
    });

        // Find matching location data
        const matchedLocation = data.location?.locations?.find(loc => loc.city === currentCity);
        console.log('debug log: storeLocation03 - Location matching:', {
          searchingFor: currentCity,
          found: !!matchedLocation,
          matchedData: matchedLocation
        });
    
        try {
          if (matchedLocation) {
            const locationData = {
              header: currentStore?.Location?.header || "Location",
              text: currentStore?.Location?.text,
              attribute: matchedLocation,
              footer: data.footerData?.location
            };
    
            console.log('debug log: storeLocation04 - Final location data:', locationData);
    
            storeLocationElement.innerHTML = components.storeLocation.render(
              locationData.header,
              locationData.text,
              locationData.attribute,
              locationData.footer
            );
          }
        } catch (error) {
          console.error('debug log: storeLocation05 - Render error:', error);
        }
      }
    });
