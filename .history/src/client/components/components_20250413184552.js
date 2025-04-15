//'./src/client/components/components.js'

import * as glyph from "./icon/glyph.js";
// import * as style from '../styles/style.js';
import * as icon from "./icon/icon.js";
import * as Pictogram from "./icon/pictogram.js";
import * as Tag from "./tags/tag.js";
import * as geotag from "./tags/geotag.js";
import * as objtag from "./tags/objtag.js";
import * as amtag from "./tags/amtag.js";
import * as attrtag from "./tags/attrtag.js";
import * as array from "./array/array.js";
import { getStatsScore } from "./function/function.js";
// import { businessHours } from "./map/map.js";
import * as cards from "./cards/cards.js";
import * as text from "./text/text.js";
import * as sidebar from "./sidebar/sidebar.js";
// Add to your imports at the top of components.js
import * as map from "./map/map.js";
import * as datavis from "./datavis/datavisTimeline.js";
import * as controls from "./controls/controls.js";
// import * as style from './styles/styles.js'; // Ensure this path is correct';

export const detailsHours = {
  render: (data) => {
    console.log("[components.detailsHours] Rendering hours:", hours);
    if (!hours) {
      console.warn("[components.detailsHours] No hours data provided");
      return "";
    }
    const sidebar = sidebar.storeDetails.render(data);
    // Add your hours rendering logic here
    return `<div class="hours">...</div>`;
  }
};

// export const storeBusiness = {
//  render: (data) => {
//    console.log('Rendering business hours:', data);
//    return `
//      <div class="business-hours-container col04">
//        <div class="business-hours-title">
//          <h3 class="text03">Business Hours</h3>
//        </div>
//        ${datavis.businessHours.render(data)}
//        ${datavis.businessHourDetails.render(data)}
//      </div>
//    `;
//  },
//  afterRender: () => {
//    array.create.initializeTimeline('business-hours');
//  }
// };
export const heroHeadline = {
  render: (store) => {
    const header = element.header;
    return `
            <div class="header">
              ${header.render(store.headlineText)}
              <div class="headline">
                <span class="header03">
                    <span class="header03 ink03 primary"> ${store.headlineText}</span>
                    <span class="header03 accent03 secondary"> ${store.locationRegion}</span>
                </span>
              </div>
              <div class="controls">
                ${storeControl.render(store)}
              </div>
            </div>

            `;
  },
};


export const storeHero = {
  render: (hero) => {
    console.log("storeHero rendering with data:", hero);

    return `
     <div class="grid05 array" id="store-detail">
       ${hero ? storeDetail.render(hero) : ""}
     </div>
     <div class="col05 body">
       <div class="col05" id="hero-gallery">
         ${hero ? heroGallery.render(hero) : ""}
       </div>
       ${dividerComponent.render()}
       <div class="col05" id="hero-headline">
         ${hero ? storeHeadline.render(hero) : ""}
       </div>
     </div>
   `;
  },
  afterRender: () => {
    console.log("storeHero afterRender called");
    // Initialize any needed gallery interactions
    const galleryContainer = document.querySelector("#hero-gallery");
    if (galleryContainer) {
      console.log("Found gallery container, initializing interactions");
      // Add hover listeners to gallery images
      const images = galleryContainer.querySelectorAll(".gallery-image");
      images.forEach((image) => {
        image.addEventListener("mouseenter", (e) => {
          console.log("Image hover:", e.target.style.backgroundImage);
          e.target.classList.add("hover");
        });
        image.addEventListener("mouseleave", (e) => {
          e.target.classList.remove("hover");
        });
      });
    }
    // Initialize user action buttons
    const actionButtons = document.querySelectorAll(".user-action");
    actionButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        console.log(
          "Action button clicked:",
          e.target.closest(".user-action").querySelector("span").textContent
        );
        // Add interaction feedback
        button.classList.add("active");
        setTimeout(() => button.classList.remove("active"), 200);
      });
    });
  }
};

export const storeOverview = {
  render: (data) => {
    const overviewData = data;
    const overview = {
      header: data[0]?.header || {},
      summary: data[0]?.summary || {},
      text: data[0]?.text || {},
      footer: data[0]?.footer || {}
    };
    const { header = {}, summary = {}, text = {}, footer = {} } = overview;
    console.log("(00: overviewData", overview);
    return `
       <div class="col04 array" id="header">
         ${sectionHeader.render(header)}
       </div>
      
       <div class="col04 container body">
         ${storeSummary.render(summary)}
         ${dividerComponent.render()}
         <div class="col04 " id="text">
           ${textBlock.render(text)}
         </div>
       </div>
      
    
       <div class="col04" id="footer">
        <div class="user-controls content col04">
          ${sectionFooter.render(footer)}
        </div>
       </div>


   `;
  },
  afterRender: () => {
    text.textBlock.afterRender();
  }
};

export const storeService = {
  render: (data) => {
    console.log("storeService render with data:", data);
    const serviceData = data;
    const header = serviceData?.header;
    const category = serviceData?.category;
    const text = serviceData?.text;
    const footer = serviceData?.footer;

    return `
      <div class="col04 array" id="header">
        ${header ? sectionHeader.render(header) : ""}
      </div>
      
      <div class="col04 container body">
        <div class="col04 array content">
          ${
            category
              ? array.create.createCarousel(
                  cardCategoryItem,
                  category,
                  "category",
                  "popularity",
                  "regular",
                  6
                )
              : ""
          }
        </div>
        ${dividerComponent.render()}
        <div class="col04" id="text">
          ${text ? textBlock.render(text) : ""}
        </div>
      </div>
      
      <div class="col04" id="footer">
        ${footer ? sectionFooter.render(footer) : ""}
      </div>
    `;
  },
  afterRender: () => {
    text.textBlock.afterRender();
    array.create.initializeCarousel("category");
  }
};

export const storeBusinessTimeline = {
  render: (data) => {
    if (data?.hours) {
      console.log("Rendering business hours with data:", data.hours);
      const businessHoursContainer = document.getElementById("business-hours");
      if (!businessHoursContainer) {
        console.error("Element with ID 'business-hours' not found.");
        return;
      }

      businessHoursContainer.innerHTML = datavis.businessHours.render(
        data.hours
      );
      // datavis.businessHourDetails.render(data);
    }
    console.log("Rendering business hours:", data);
    return `
      <div class="business-hours col04" id="business-hours">
      Business hours
      </div>
    `;
  },
  afterRender: () => {
    const container = document.getElementById("business-hours");
    console.log("debug log: Initializing application data");
    if (container) {
      console.log("Initializing timeline in business-hours");
      array.create.initializeTimeline("business-hours");
    } else {
      console.warn("Timeline container not found for business-hours");
    }
    const businessHoursContainer = document.getElementById("business-hours");
    if (businessHoursContainer && data?.hours) {
      console.log("Rendering business hours with data:", data.hours);
      businessHoursContainer.innerHTML = datavis.businessHours.render(
        data.hours
      );
      datavis.businessHours.afterRender(container);
    } else {
      console.warn("Timeline container not found for business-hours");
    }
  }
};

// export const storeBusiness = {
//   render: (data) => {
//     console.log("Rendering business hours:", data);
//     return `
//       <div class="business-hours col04">
//         <div class="business-hours-title">
//           <h3 class="text03">Business Hours</h3>
//         </div>
//         ${datavis.businessHours.render(data.hours)}
//         ${datavis.businessHourDetails.render(data)}
//       </div>
//     `;
//   },
//   afterRender: () => {
//     const container = document.getElementById("business-hours");
//     if (container) {
//       console.log("Initializing timeline in business-hours");
//       array.create.initializeTimeline("business-hours");
//     } else {
//       console.warn("Timeline container not found for business-hours");
//     }
//   }
// };

export const storeBusiness = {
  render: (data) => {
    console.log("Rendering business hours:", data);
    const businessData = data;
    const header = businessData?.header;
    const timeline = businessData?.timeline;
    const footer = businessData?.footer;

    return `
      <div class="col04 array" id="header">
        ${header ? sectionHeader.render(header) : ""}
      </div>
      <div class="grid04-overflow array" id="business-hours">
      
      <div class="business-hours col04">
        <div class="business-hours-title">
          <h3 class="text03">Business Hours</h3>
        </div>
        ${datavis.businessHours.render(timeline.hours)}
        ${datavis.businessHourDetails.render(timeline)}
      </div>


        $ {timeline ? storeBusinessTimeline.render(timeline) : ""}

      <div class="col04" id="footer">
        ${footer ? sectionFooter.render(footer) : ""}
      </div>
    `;
  },
  afterRender: () => {
    const container = document.getElementById("business-hours");
    if (container) {
      console.log("Initializing business hours timeline");
      array.create.initializeTimeline("business-hours");
    }
  }
};

// Update the storeLocation component to pass coordinates
// export const storeLocation = {
//   render: (data) => {
//     const header = data?.header;
//     const neighborhood = data?.neighborhoodData;
//     const attribute = data?.attribute;
//     const footer = data?.footer;
//     console.log('storeLocation render with data:', { header, attribute, footer });
//     return `
//       <div class="col04 array" id="header">
//         ${header ? sectionHeader.render(header) : ''}
//       </div>

//       <div class="col04 container body">
//         <div class="col04">
//           ${mapNearby.render(neighborhood)}
//         </div>
//         ${dividerComponent.render()}
//         <div class="col04" id="attributes">
//           ${attribute ? locationAttributes.render(attribute) : ''}
//         </div>
//       </div>

//       <div class="col04" id="footer">
//         ${footer ? sectionFooter.render(footer) : ''}
//       </div>
//     `;
//   },
//   afterRender: (data) => {
//     console.log('debug log: storeLocation10 - Running afterRender');
//     const coordinates = {
//       lat: data.location.latitude || data?.geolocation?.lat,
//       lon: data.location.longitude || data?.geolocation?.lon
//     };
//     mapNearby.afterRender(coordinates);
//     locationAttributes.afterRender();
//   }
// };
// Update the storeLocation component to pass coordinates
export const storeLocation = {
  render: (data) => {
    console.log("-00:storeLocation render with data:", data);
    const neighborhood = data?.neighborhood;
    console.log("-02:neighborhood:", neighborhood);
    const header = neighborhood.city + ', ' + neighborhood.state  ;
    console.log("-01:header:", header);
    const attribute = data?.attribute;
    console.log("-03:attribute:", attribute);
    const footer = data?.footer;
    console.log("-04:storeLocation render with data:", {
      header,
      attribute,
      neighborhood,
      footer
    });
    return `
      <div class="col04 array" id="header">
        ${header ? sectionHeader.render(header) : ""}
      </div>
      
      <div class="col04 container body">
        <div class="col04">
          ${neighborhood ? mapNearby.render(neighborhood) : ""}
        </div>
        ${dividerComponent.render()}
        <div class="col04" id="attributes">
          ${attribute ? locationAttributes.render(attribute) : ""}
        </div>
      </div>
      
      <div class="col04" id="footer">
        ${footer ? sectionFooter.render(footer) : ""}
      </div>
    `;
  },
  afterRender: (data) => {
    console.log("-09:storeLocation afterRender");
    const coordinates = {
      lat: data.geolocation.latitude || data?.geolocation?.lat,
      lon: data.geolocation.longitude || data?.geolocation?.lon
    };
    console.log("-10:storeLocation coordinates:", coordinates);
    mapNearby.afterRender(coordinates);
    console.log("-11:storeLocation afterRender locationAttributes");
    locationAttributes.afterRender();
    console.log("-12:storeLocation afterRender footer");
  }
};

// Logging helper for debugging data flow
function logStoreLocationData() {
  console.log("Store Data:", {
    location: data.store?.location?.[0],
    locationAttributes: data.store?.location?.[0]?.attribute,
    city: data.store?.item?.[0]?.location?.city
  });
}

export const storeExperience = {
  render: (data) => {
    console.log("storeExperience render with area:", data);
    const experienceData = data;
    const header = experienceData.header;
    const area = experienceData.area;
    const attribute = experienceData.attribute;
    const text = experienceData.text;
    const footer = experienceData.footer;
    console.log("storeExperience", header, area, attribute, text, footer);

    return `
     <div class="col04 array" id="header">
       ${header ? sectionHeader.render(header) : ""}
     </div>
    
     <div class="col04 container body">
       <div class="col04 array content">
         ${area ? storeArea.render(area) : ""}
       </div>
       ${dividerComponent.render()}
       <div class="col04" id="attributes">
       ${attribute ? storeAttributes.render(attribute) : ""}
       </div>
       <div class="col04" id="text">
       <!--$ {attribute ? storeAttributes.render(attribute) : ''}-->
         ${text ? textBlock.render(text) : ""}
       </div>
     </div>
    
     <div class="col04" id="footer">
       ${footer ? sectionFooter.render(footer) : ""}
     </div>
   `;
  },
  afterRender: () => {
    text.textBlock.afterRender();
    array.create.initializeCarousel("area");
  }
};

export const storeArea = {
  render: (data) => {
    console.log("Rendering store area:", data);

    // Format areas array from the item array
    const areas = Array.isArray(data.item)
      ? data.item.map((area) => ({
          area: area.area,
          images: area.images,
          links: area.links || {}
        }))
      : [];

    console.log("Formatted areas:", areas);

    return array.create.createCarousel(
      {
        render: (area) => {
          console.log("Rendering area item:", area);
          return cards.cardGalleryItem.render(area);
        }
      },
      areas,
      "area",
      "regular",
      "area-carousel",
      6
    );
  }
};


export const storeThumbnail = {
  render: (data, limit) => {
    console.log("Rendering store thumbnail:", data);

    // Format areas array from the item array
    const thumbnail = Array.isArray(data.item)
      ? data.item.map((thumbnail) => ({
          thumbnail: thumbnail.thumbnail,
          images: thumbnail.images,
          links: thumbnail.links || {}
        }))
      : [];

    console.log("Formatted thumbnail:", thumbnail);

        
    return cards.cardGalleryItem.render(thumbnail);
      
  }
};

export const storeGallery = {
  render: (
    data,
    type = "gallery",
    sort = "popularity",
    size = "regular",
    limit = 12
  ) => {
    return array.create.create.createCarousel(
      cardGalleryItem,
      data,
      type,
      sort,
      size,
      limit
    );
  }
};

export const cardGalleryItem = {
  render: (config) => {
    return array.create.createCarousel(
      {
        render: (item) => `
         <div class="card-gallery col01">
           <div class="primary">
             ${amtag.amtagGroup.render({ category: item.type })}
             ${
               item.source?.logo
                 ? `
               <div class="badge">
                 <img src="${item.source.logo}" alt="Partner logo" class="partner-logo-thumbnail" width="15" height="15">
               </div>
             `
                 : ""
             }
           </div>
           <div class="content">
             <img src="${item.thumbnail}" alt="${item.name}" />
             <div class="item-info">
               <span class="name text02">${item.name}</span>
               <span class="type text02">${item.type}</span>
             </div>
           </div>
         </div>
       `
      },
      config.items,
      config.type || "gallery",
      "popularity",
      config.style || "regular",
      "12"
      // config.limit || "1/-1"
    );
  }
};

export const storeAttributes = {
  render: (store) => {
    console.log("storeAttributes render start");
    return `
     ${
       store.bestfor
         ? cards.cardStoreAttributes.render(
             store.bestfor,
             "Best For",
             "BestFor"
           )
         : ""
     }
     ${
       store.working
         ? cards.cardStoreAttributes.render(store.working, "Working", "Working")
         : ""
     }
     ${
       store.environment
         ? cards.cardStoreAttributes.render(
             store.environment,
             "Environment",
             "Environment"
           )
         : ""
     }
     ${
       store.facility
         ? cards.cardStoreAttributes.render(
             store.facility,
             "Facility",
             "Facility"
           )
         : ""
     }
   `;
  }
};

export const cardSubStoreItem = {
  render: (data) => {
    return cards.cardSubStoreItem.render(data);
  }
};

export const cardSummaryItem = {
  render: (data) => {
    return cards.cardSummaryItem.render(data);
  },
  afterRender: () => {
    const amtagButtons = document.querySelectorAll(".amtag");
    amtagButtons.forEach((button) => {
      button.addEventListener("mouseenter", (e) => {
        button.classList.add("hovered");
      });
      button.addEventListener("mouseleave", (e) => {
        button.classList.remove("hovered");
      });

      const scoreIcons = button.querySelectorAll(".score-icon");
      scoreIcons.forEach((icon) => {
        icon.addEventListener("click", (e) => {
          e.stopPropagation();
          const newScore = parseInt(icon.getAttribute("data-score"));
          button.setAttribute("data-score", newScore);
          scoreIcons.forEach((si, index) => {
            si.classList.toggle("active", index <= newScore);
          });
          button.classList.add("selected");
          button.querySelector(".single-icon").innerHTML = icon.innerHTML;
        });
      });
    });
  }
};

export const storeSummary = {
  render: (data = {}) => {
    const limit = 2; // Maximum number of lines for tags
    
    // Ensure data properties exist and are arrays before sorting
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const service = Array.isArray(data.service) ? data.service : [];
    const business = Array.isArray(data.business) ? data.business : [];
    const location = Array.isArray(data.location) ? data.location : [];
    
    const overviewSummaryData = [
      {
        title: "Experience",
        score: data.experienceScore || "0",
        tags: experience.sort((a, b) => (b.user || 0) - (a.user || 0))
      },
      {
        title: "Service",
        score: data.serviceScore || "0",
        tags: service.sort((a, b) => (b.user || 0) - (a.user || 0))
      },
      {
        title: "Business",
        score: data.businessScore || "0",
        tags: business.sort((a, b) => (b.user || 0) - (a.user || 0))
      },
      {
        title: "Location",
        score: data.locationScore || "0",
        tags: location.sort((a, b) => (b.user || 0) - (a.user || 0))
      }
    ].filter((item) => item.tags && item.tags.length > 0);

    // If we have no valid data, return a placeholder message
    if (overviewSummaryData.length === 0) {
      return `
        <div class="summary-placeholder">
          <p>Store summary information is not yet available.</p>
        </div>
      `;
    }

    return `
      ${array.create.create(
        cards.cardSummaryItem,
        overviewSummaryData.map((item) => ({ ...item, limit })),
        "nest",
        "1/-1"
      )}
    `;
  }
};
// export const storeSummary = {
//   render: (data) => {
//     const limit = 2; // Maximum number of lines for tags
//     const overviewSummaryData = [
//       {
//         title: "Experience",
//         score: data.experienceScore,
//         tags: data.experience.sort((a, b) => b.user - a.user)
//       },
//       {
//         title: "Service",
//         score: data.serviceScore,
//         tags: data.service.sort((a, b) => b.user - a.user)
//       },
//       {
//         title: "Business",
//         score: data.businessScore,
//         tags: data.business.sort((a, b) => b.user - a.user)
//       },
//       {
//         title: "Location",
//         score: data.locationScore,
//         tags: data.location.sort((a, b) => b.user - a.user)
//       }
//     ].filter((item) => item.tags && item.tags.length > 0);

//     return `


//        ${array.create.create(
//          cards.cardSummaryItem,
//          overviewSummaryData.map((item) => ({ ...item, limit })),
//          "nest",
//          "1/-1"
//        )}


//    `;
//   }
// };

export const storeCardThumbnail = {
  render: (data) => {
    return array.create.createCarousel(
      {
        render: (item) => `
         <div class="card-gallery col01">
           <div class="primary">
             ${amtag.amtagGroup.render({ category: item.type })}
             ${
               item.source?.logo
                 ? `
               <div class="badge">
                 <img src="${item.source.logo}" alt="Partner logo" class="partner-logo-thumbnail" width="15" height="15">
               </div>
             `
                 : ""
             }
           </div>
           <div class="content">
             <img src="${item.thumbnail}" alt="${item.name}" />
             <div class="item-info">
               <span class="name text02">${item.name}</span>
               <span class="type text02">${item.type}</span>
             </div>
           </div>
         </div>
       `
      },
      data.items,
      data.type || "gallery",
      "popularity",
      data.style || "regular",
      data.limit || "1/-1"
    );
  }
};

export const summaryComponent = {
  render: (data) => {
    return `
      <div class="summary-component">
        ${array.create.createArray(
          cardSummaryItem,
          [
            {
              title: "Experience",
              score: data.experienceScore,
              tags: data.experience
            },
            { title: "Service", score: data.serviceScore, tags: data.service },
            {
              title: "Business",
              score: data.businessScore,
              tags: data.business
            },
            {
              title: "Location",
              score: data.locationScore,
              tags: data.location
            }
          ],
          "nest",
          "1/-1"
        )}
      </div>
    `;
  }
};

export const storeCategory = {
  render: (data) => {
    console.log("-06: Rendering storeCategory:", data);

    // Format data for carousel
    const categories = Object.entries(data).map(([key, value]) => ({
      category: value.category,
      items: value.items,
      url: value.url
    }));

    console.log("-07: Formatted categories:", categories);

    return array.create.createCarousel(
      {
        render: (categoryData) => {
          console.log("-08:Rendering category:", categoryData);
          return cardCategoryItem.render(categoryData);
        }
      },
      categories,
      "category",
      "regular",
      "category-carousel",
      6
    );
  }
};

// Update cardCategoryItem to match cardSummaryItem pattern
export const cardCategoryItem = {
  render: (data) => {
    console.log("-09:cardCategoryItem rendering with data:", data);
    return cards.cardCategoryItem.render(data);
  }
};

export const itemTag = {
  render: (data) => {
    const arrow = glyph.glyphActionArrow;
    return `
     <div class="item-tag">
       <div class="label">
         ${arrow}
         <span class="text02">${data.label}</span>
       </div>
     </div>
  
     `;
  }
};

export const mapNearby = {
  render: (data) => {
    console.log('-10:mapNearby render with data:', data);
    return `
      <div class="location col04">
        <div id="map-container" class="map-container col04">
          <div class="map col04">
            <div class="overlay col04">
              <div class="search col01">
                <div class="text02">
                  ${data?.address || ''}
                  <div id="map"></div>
                </div>
                ${icon.iconActionCopy}
              </div>
            </div>
          </div>
        </div>
        <div class="sidebar col04">
          <div id="listings" class="listings grid08-overflow span04 row01"></div>
        </div>
      </div>
    `;
  },
  afterRender: (data) => {
    console.log('-11: debug log: mapNearby01 - Running afterRender');
    const mapElement = document.getElementById('map');
    const lat = data.geolocation.lat;
    console.log("lat", lat);
    const lon = data.geolocation.lon;
    console.log("lon", lon);
    const Coordinates = [lon, lat];
    console.log("Coordinates",Coordinates);
    const coordinates = Coordinates;
    console.log("coordinates", coordinates);
    if (mapElement) {
      console.log('-12: debug log: mapNearby02 - Found map element');
      const mapData = {
        container: 'map',
        center: coordinates, // Default to LA if no coordinates
        zoom: 13,
        store: data
      }
      console.log("-13:mapData", mapData);
      // businessHours(mapData);
      // afterRender: () => {
        //     console.log('debug log: mapNearby01 - Running afterRender');
        //     const mapElement = document.getElementById('map');
        //     if (mapElement) {
        //       console.log('debug log: mapNearby02 - Found map element');
        //       initMap({
        //         container: 'map',
        //         center: [-118.2437, 34.0522], // Default to LA if no coordinates
        //         zoom: 13
        //       });
        //     } else {
        //       console.warn('Map element not found');
        //     }
        //   }
        // };
    mapElement.addEventListener("load", async () => {
      try {
        const mapData = await map.initMap({
            container: "map",
            center: coordinates,
            zoom: 13,
            store: data
        });
        console.log("-14: Map initialized successfully", mapData);
      } catch (error) {
        console.error("-15: Error initializing map:", error);
      }
    });
    } else {
      console.warn('-16:Map element not found');
    }
  }
};

// export const mapNearby = {
//   render: (data) => {
//     console.log("mapNearby render with data:", data);
//     return `
//       <div class="location col04">
//         <div class="map-container col04">
//           <div id="map" class="map col04">
//             <div class="overlay col04">
//               <div class="search col01">
//                 <div class="text02">
//                   ${data?.address || ""}
//                 </div>
//                 ${icon.iconActionCopy}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div class="sidebar col04">
//           <div id="listings" class="listings grid08-overflow span04 row01"></div>
//         </div>
//       </div>
//     `;
//   },
//   afterRender: (data) => {
//     console.log('debug log: storeLocation10 - Running afterRender');
//     const coordinates = {
//       lat: data.geolocation.latitude || data?.geolocation?.lat,
//       lon: data.geolocation.longitude || data?.geolocation?.lon
//     };
//     mapNearby.afterRender(coordinates);
//     locationAttributes.afterRender();
//   }
//   afterRender: () => {
//     console.log("debug log: mapNearby01 - Running afterRender");
//     const mapElement = document.getElementById("map");
//     if (mapElement) {
//       console.log("debug log: mapNearby02 - Found map element");
//       initMap({
//         container: "map",
//         center: [-118.2437, 34.0522], // Default to LA if no coordinates
//         zoom: 13
//       });
//     } else {
//       console.warn("Map element not found");
//     }
//   }
// };

// export const mapNearby = {
//   render: (data) => {
//     console.log('mapNearby render with data:', data);
//     return `
//       <div class="location col04">
//         <div class="map-container col04">
//           <div id="map" class="map col04">
//             <div class="overlay col04">
//               <div class="search col01">
//                 <div class="text02">
//                   ${data?.address || ''}
//                 </div>
//                 ${icon.iconActionCopy}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div class="sidebar col04">
//           <div id="listings" class="listings grid08-overflow span04 row01"></div>
//         </div>
//       </div>
//     `;
//   },
//   afterRender: () => {
//     console.log('debug log: mapNearby01 - Running afterRender');
//     const mapElement = document.getElementById('map');
//     if (mapElement) {
//       console.log('debug log: mapNearby02 - Found map element');
//       initMap({
//         container: 'map',
//         center: [-118.2437, 34.0522], // Default to LA if no coordinates
//         zoom: 13
//       });
//     } else {
//       console.warn('Map element not found');
//     }
//   }
// };

// Render the component on page load
document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map-container");
  if (mapContainer) {
    mapContainer.innerHTML = mapNearby.render();
    mapNearby.afterRender();
  }
});

export const seperatorLetters = {
  render: () => {
    return `
      <span class="divider word">-</span>
    `;
  }
};

export const seperatorWords = {
  render: () => {
    return `
      <span class="divider word">,</span>
    `;
  }
};

export const seperatorStatus = {
  render: () => {
    return `
      <span class="divider word">|</span>
    `;
  }
};

export const dividerComponent = {
  render: () => {
    return `
     <div class="col04 divider-v"></div>
   `;
  }
};

export const titleComponent = {
  render: (data) => {
    return `
     <div class="title stretch span04">
       <div class="primary left">
         <button class="category">
           <span class="span">${data.title}</span>
           ${glyph.glyphActionArrow}
         </button>
       </div>
       <div class="secondary array right">
         <div class="pagination">
           <div class="pagination2">
             <div class="ellipse"></div>
             <div class="ellipse inactive"></div>
             <div class="ellipse inactive"></div>
           </div>
         </div>
         <div class="controls array">
           <button class="controls-button">${icon.iconActionPrev}</button>
           <button class="controls-button">${icon.iconActionNext}</button>
         </div>
       </div>
     </div>
   `;
  }
};

export const locationAttributes = {
  render: (data) => {
    console.log("debug log: storeLocation09 - Location data received:", data);

    if (!data || !Array.isArray(data)) {
      console.warn("No attrtags data found");
      return "";
    }

    const visibleSections = data.slice(0, 3);
    const hiddenSectionsCount = Math.max(0, data.length - 3);

    return `
     <div class="location-attributes-container  col04">
       <div class="title">
         <span class="text03">
           The Area
         </span>
       </div>
       ${visibleSections
         .map((section) => {
           console.log(
             "debug log: storeLocation10 - Processing section:",
             section
           );

           if (!section.attributes || section.attributes.length === 0) {
             return "";
           }

           const limit = 2;
           const tagsPerLine = 3;
           const visibleTags = section.attributes.slice(0, limit * tagsPerLine);
           const hiddenTagsCount =
             section.attributes.length - visibleTags.length;
           const title = section.title;
           const count = section.attributes.reduce(
             (total, attr) => total + attr.count,
             0
           );
           let geotagData = {
             geotag: title,
             count: count
           };
           console.log("debug log: storeLocation11 - title:", title);
           return `
           <div class="tag-line line col04">


             ${geotag.geotagCountItem.render(geotagData)}


             <div class="tag-line">
               ${attrtag.attrtagScore.render({
                 tags: visibleTags.map((attr) => ({
                   label: attr.label,
                   score: attr.score,
                   count: attr.count
                 })),
                 limit
               })}
               ${
                 hiddenTagsCount > 0
                   ? `
                 <button class="button-more tag-more">
                   ${glyph.glyphSymbolPlus}
                   <span class="text02" id="count">
                     ${hiddenTagsCount}
                   </span>
                   <span class="text02">
                     more
                   </span>
                 </button>
               `
                   : ""
               }
             </div>
           </div>
         `;
         })
         .join("")}
       ${
         hiddenSectionsCount > 0
           ? `
         <button class="button-more sections-more">
           ${glyph.glyphSymbolPlus}
           <span class="text02" id="sections-count">
             ${hiddenSectionsCount}
           </span>
           <span class="text02">
             more sections
           </span>
         </button>
       `
           : ""
       }
     </div>
   `;
  },
  afterRender: () => {
    console.log("debug log: storeLocation11 - Running afterRender");

    // Existing geotag button handlers
    const amtagButtons = document.querySelectorAll(".amtag");
    console.log(
      "debug log: storeLocation12 - Found geotag buttons:",
      amtagButtons.length
    );
    attrtag.attrtagScore.initialize();
    //  amtagButtons.forEach(button => {
    //    button.addEventListener('mouseenter', (e) => {
    //      button.classList.add('hovered');
    //    });
    //    button.addEventListener('mouseleave', (e) => {
    //      button.classList.remove('hovered');
    //    });

    //    const scoreIcons = button.querySelectorAll('.score-icon');
    //    console.log('debug log: storeLocation13 - Score icons for button:', scoreIcons.length);

    //    scoreIcons.forEach(icon => {
    //      icon.addEventListener('click', (e) => {
    //        e.stopPropagation();
    //        const newScore = parseInt(icon.getAttribute('data-score'));
    //        button.setAttribute('data-score', newScore);
    //        scoreIcons.forEach((si, index) => {
    //          si.classList.toggle('active', index <= newScore);
    //        });
    //        button.classList.add('selected');
    //        button.querySelector('.single-icon').innerHTML = icon.innerHTML;
    //      });
    //    });
    //  });

    // New section more button handler
    const sectionMoreButton = document.querySelector(".sections-more");
    if (sectionMoreButton) {
      console.log("debug log: storeLocation14 - Found sections-more button");
      sectionMoreButton.addEventListener("click", () => {
        console.log("debug log: storeLocation15 - Show more sections clicked");
        // Add your show more sections logic here
      });
    }
  }
};

export const geotagAttributes = {
  render: (data) => {
    const geotagAttribute = geotag.geotagScore;
    const amtagScore = "s";
    return `
   <div class="array">
     ${geotagAttribute}
     <div class="tag-array">
       ${data.map((item) => geotagAttribute.render(item)).join("")}
     </div>
   </div>
   `;
  }
};

export const locationTitle = {
  render: (data) => {
    const geotagAttribute = geotag.geotagScore;
    const area = data.area;
    const city = data.city;
    return `
     <div class="tag-array">
       <span class="sentence text02">${area}, ${city}</span>
     </div>
   `;
  }
};

export const storeDetail = {
  render: (data) => {
    console.log("storeDetail rendering with data:", data);
    const store = data;
    const storeType = Array.isArray(data.storeType)
      ? data.storeType.map((type) => type.title).join(", ")
      : "";
    const costEstimate = data.costEstimate || "";
    console.log("&&& log: storeDetail11 - costEstimate:", costEstimate);
    return `
     <div class="hero-detail array col04">
       <div class="hero-primary tag-array">
         ${geotag.geotagRating.render({ rating: data.rating })}
         ${geotag.geotagCostEstimate.render({
           costEstimate: data.costEstimate
         })}            
       </div>
       <div class="hero-secondary tag-array sentance">
         <span class="objtag info-type text02 sentance">${storeType}</span>
         <span class="objtag info-distance text02">${
           data.distance
         } away in</span>
         <span class="objtag info-city text02 sentance">${data.city}, ${
      data.state
    }</span>
       </div>
     </div>
     <div class="store-controls   hero-controls array col01">
        <button class="store-controls    user-action share"    id="storeControls-share" onclick="storeActions.shareStore('${store.storeURL}')">
          ${glyph.glyphControlShare}
          <span class="text03">Share</span>
        </button>
        <button class="store-controls    user-action save"    id="storeControls-save" onclick="storeActions.toggleSaveStore('${store.headlineText}')">
          ${glyph.glyphControlSave}
          <span class="text03">Save</span>
        </button>
        <button class="store-controls    user-action checkin"    id="storeControls-checkin" onclick="storeActions.toggleCheckInStore('${store.headlineText}')">
          ${glyph.glyphControlCheckin}
          <span class="text03">Check-in</span>
        </button>
      </div>
      <!--
      <div class="hero-controls array col01">
        <button class="user-action share">
          $ {glyph.glyphControlShare}
          <span class="text02">Share</span>
        </button>
        <button class="user-action save">
          $ {glyph.glyphControlSave}
          <span class="t ext02">Save</span>
        </button>
        <button id="storeControls-checkin" class="user-action checkin">
          $ {glyph.glyphControlCheckin}
          <span class="text02">Check in</span>
        </button>
      </div>
      -->
   `;
  }
};

export const heroGallery = {
  render: (data) => {
    console.log("heroGallery rendering with data:", data);

    // Ensure we have gallery images before rendering
    if (!data.gallery || !data.gallery.length) {
      console.warn("No gallery images provided");
      return "";
    }

    return `
     <div class="hero-gallery grid05-overflow">
       ${data.gallery
         .slice(0, 4)
         .map(
           (image, index) => `
         <div
          id="modal-gallery"
          class="gallery-image ${index < 2 ? "col03" : "col02"}"
          style="background-image: url(${image});"
          data-index="${index}"
         ></div>
       `
         )
         .join("")}
     </div>
   `;
  }
};

export const storeHeadline = {
  render: (data) => {
    console.log("storeHeadline rendering with data:", data);

    return `
     <span class="hero-title array span04">
       <span class="store-name text05">${data.storeName}</span>
       <span class="store-city text05">${data.city}</span>
     </span>
     <div class="hero-distance word col01">
       <span class="glyph05 glyph-location-pin">${glyph.glyphLocationPin}</span>
       <span class="distance-value text05">${data.distanceMiles}</span>
       <span class="distance-unit text05">mi</span>
     </div>
     ${geotag.geotagStatus.render({ status: data.status })}
   `;
  }
};

export const sectionHeader = {
  render: (data) => {
    console.log("sectionHeader start", data);
    return text.textHeader.render(data || {});
  }
};

export const textBlock = {
  render: (data) => {
    return text.textBlock.render(data || {});
  },
  afterRender: text.textBlock.afterRender
};

export const sectionFooter = {
  render: (data) => {
    const user = icon.iconUserRating;
    const comment = icon.iconUserComment;
    const review = icon.iconUserReview;
    const like = icon.iconUserImpressionsLike;
    const dislike = icon.iconUserImpressionsDislike;
    const store = data;
    const controlUser = controls.controlUser.render(store);


    // return controlUser;
    return `
      ${controlUser}
    `;
  }
};
  //   return `
  //    <div class="info sentance alignV-center text02 col02">

  //      <span class="impression-item text02 glyph">
  //        ${user}
  //        <span class="count">
  //          ${data?.contributionsCount || 0}
  //        </span>
  //      </span>

  //      <div class="dividerV"></div>

  //      <div class="sentance">
  //        Modified ${data?.modifiedDate || "N/A"}, ${data?.modifiedTime || 0} min
  //      </div>
  
  //    </div>




  //    <div class="controls col02 array  alignH-right">
  //      <span class="impression-item text02 glyph">
  //        ${comment}
  //        Comments
  //        <span class="count">
  //          ${data?.commentsCount || 0}
  //        </span>
  //      </span>
  //      <span class="impression-item text02 glyph">
  //        ${review}
  //        Reviews
  //        <span class="count">
  //          ${data?.reviewsCount || 0}
  //        </span>
  //      </span>

  //      <div class="divider"></div>

  //      <div class="impressions pair">
  //        <span class="impression-item text02 glyph">
  //          ${like}
  //          ${data?.likesCount || 0}
  //        </span>
  //        <span class="impression-item text02 glyph">
  //          ${dislike}
  //          ${data?.dislikesCount || 0}
  //        </span>
  //      </div>
  //    </div>
  //  `;
//   }
// };
