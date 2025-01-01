//'./src/client/components/components.js'

import * as glyph from './icon/glyph.js';
// import * as style from '../styles/style.js';
import * as icon from './icon/icon.js';
import * as Pictogram from './icon/pictogram.js';
import * as Tag from './tags/tag.js';
import * as geotag from  './tags/geotag.js';
import * as objtag from './tags/objtag.js';
import * as amtag from './tags/amtag.js';
import * as attrtag from './tags/attrtag.js';
import * as array from './array/array.js';
import { getStatsScore } from './function/function.js';
import { initMap } from './map/map.js';
import * as cards from './cards/cards.js';
import * as text from './text/text.js';
// Add to your imports at the top of components.js
import * as places from './datavis/datavisTimeline.js';
// import * as style from './styles/styles.js'; // Ensure this path is correct';


// export const storeBusiness = {
//  render: (data) => {
//    console.log('Rendering business hours:', data);
//    return `
//      <div class="business-hours-container col04">
//        <div class="business-hours-title">
//          <h3 class="text03">Business Hours</h3>
//        </div>
//        ${places.businessHours.render(data)}
//        ${places.businessHourDetails.render(data)}
//      </div>
//    `;
//  },
//  afterRender: () => {
//    array.create.initializeTimeline('business-hours');
//  }
// };

export const storeHero = {
 render: (hero) => {
   console.log('storeHero rendering with data:', hero);
  
   return `
     <div class="grid05 array" id="store-detail">
       ${hero ? storeDetail.render(hero) : ''}
     </div>
     <div class="col05 body">
       <div class="col05" id="hero-gallery">
         ${hero ? heroGallery.render(hero) : ''}
       </div>
       ${dividerComponent.render()}
       <div class="col05" id="hero-headline">
         ${hero ? storeHeadline.render(hero) : ''}
       </div>
     </div>
   `;
 },
 afterRender: () => {
   console.log('storeHero afterRender called');
   // Initialize any needed gallery interactions
   const galleryContainer = document.querySelector('#hero-gallery');
   if (galleryContainer) {
     console.log('Found gallery container, initializing interactions');
     // Add hover listeners to gallery images
     const images = galleryContainer.querySelectorAll('.gallery-image');
     images.forEach(image => {
       image.addEventListener('mouseenter', (e) => {
         console.log('Image hover:', e.target.style.backgroundImage);
         e.target.classList.add('hover');
       });
       image.addEventListener('mouseleave', (e) => {
         e.target.classList.remove('hover');
       });
     });
   }
       // Initialize user action buttons
       const actionButtons = document.querySelectorAll('.user-action');
       actionButtons.forEach(button => {
         button.addEventListener('click', (e) => {
           console.log('Action button clicked:', e.target.closest('.user-action').querySelector('span').textContent);
           // Add interaction feedback
           button.classList.add('active');
           setTimeout(() => button.classList.remove('active'), 200);
         });
       });
 }
};

export const storeOverview = {
 render: (headerData, textData, overviewSummaryData, footerData) => {
   return `
       <div class="col04 array" id="header">
         ${headerData ? sectionHeader.render(headerData) : ''}
       </div>
      
       <div class="col04 container body">
         ${overviewSummaryData ? storeSummary.render(overviewSummaryData) : ''}
         ${dividerComponent.render()}
         <div class="col04 " id="text">
           ${textData ? textBlock.render(textData) : ''}
         </div>
       </div>
      
    
       <div class="col04" id="footer">
         ${footerData ? sectionFooter.render(footerData) : ''}
       </div>


   `;
 },
 afterRender: () => {
   text.textBlock.afterRender();
 }
};

export const storeService = {
 render: (serviceHeaderData, serviceTextData, serviceCategoryData, serviceFooterData) => {     
   console.log('storeService render with serviceCategoryData:', serviceCategoryData);
  
   return `
     <div class="col04 array" id="header">
       ${serviceHeaderData ? sectionHeader.render(serviceHeaderData) : ''}
     </div>
   
     <div class="col04 container body">
       <div class="col04 array content">
         ${(() => {
           console.log('Category data:', serviceCategoryData);
           return storeCategory.render(serviceCategoryData);
         })()}
       </div>
       ${dividerComponent.render()}
       <div class="col04" id="text">
         ${serviceTextData ? textBlock.render(serviceTextData) : ''}
       </div>
     </div>
    
     <div class="col04" id="footer">
       ${serviceFooterData ? sectionFooter.render(serviceFooterData) : ''}
     </div>
   `;
 },
 afterRender: () => {
   text.textBlock.afterRender();
   array.create.initializeCarousel('category');
 }
};

export const storeBusiness = {
  render: (data) => {
    console.log("Rendering business hours:", data);
    return `
      <div class="business-hours col04">
        <div class="business-hours-title">
          <h3 class="text03">Business Hours</h3>
        </div>
        ${places.businessHours.render(data.hours)}
        ${places.businessHourDetails.render(data)}
      </div>
    `;
  },
  afterRender: () => {
    const container = document.getElementById("business-hours");
    if (container) {
      console.log("Initializing timeline in business-hours");
      array.create.initializeTimeline("business-hours");
    } else {
      console.warn("Timeline container not found for business-hours");
    }
  }
};

// Update the storeLocation component to pass coordinates
export const storeLocation = {
  render: (header, attribute, footer) => {
    console.log('storeLocation render with data:', { header, attribute, footer });
    return `
      <div class="col04 array" id="header">
        ${header ? sectionHeader.render(header) : ''}
      </div>
      
      <div class="col04 container body">
        <div class="col04">
          ${mapNearby.render(attribute)}
        </div>
        ${dividerComponent.render()}
        <div class="col04" id="attributes">
          ${attribute ? locationAttributes.render(attribute) : ''}
        </div>
      </div>
      
      <div class="col04" id="footer">
        ${footer ? sectionFooter.render(footer) : ''}
      </div>
    `;
  },
  afterRender: (data) => {
    console.log('debug log: storeLocation10 - Running afterRender');
    const coordinates = {
      lat: data.location.latitude || data?.geolocation?.lat,
      lon: data.location.longitude || data?.geolocation?.lon
    };
    mapNearby.afterRender(coordinates);
    locationAttributes.afterRender();
  }
};

// Logging helper for debugging data flow
function logStoreLocationData() {
 console.log('Store Data:', {
   location: data.store?.location?.[0],
   locationAttributes: data.store?.location?.[0]?.attribute,
   city: data.store?.item?.[0]?.location?.city
 });
}

export const storeExperience = {
 render: (headerData,  textData, areaData, attributesData, footerData) => {     
   console.log('storeExperience render with areaData:', areaData);
  
   return `
     <div class="col04 array" id="header">
       ${headerData ? sectionHeader.render(headerData) : ''}
     </div>
    
     <div class="col04 container body">
       <div class="col04 array content">
         ${areaData ? storeArea.render(areaData) : ''}
       </div>
       ${dividerComponent.render()}
       <div class="col04" id="attributes">
       ${attributesData ? storeAttributes.render(attributesData) : ''}
       </div>
       <div class="col04" id="text">
       <!--$ {attributesData ? storeAttributes.render(attributesData) : ''}-->
         ${textData ? textBlock.render(textData) : ''}
       </div>
     </div>
    
     <div class="col04" id="footer">
       ${footerData ? sectionFooter.render(footerData) : ''}
     </div>
   `;
 },
 afterRender: () => {
   text.textBlock.afterRender();
   array.create.initializeCarousel('area');
 }
};

export const storeArea = {
 render: (data) => {
   console.log('Rendering store area:', data);
  
   // Format areas array from the item array
   const areas = Array.isArray(data.item) ? data.item.map(area => ({
     area: area.area,
     images: area.images,
     links: area.links || {}
   })) : [];


   console.log('Formatted areas:', areas);
  
   return array.create.createCarousel(
     {
       render: (areaData) => {
         console.log('Rendering area item:', areaData);
         return cards.cardGalleryItem.render(areaData);
       }
     },
     areas,
     'area',
     'regular',
     'area-carousel',
     6
   );
 }
};

export const storeGallery = {
 render: (data, type = 'gallery', sort = 'popularity', size = 'regular', limit = 6) => {
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
             ${item.source?.logo ? `
               <div class="badge">
                 <img src="${item.source.logo}" alt="Partner logo" class="partner-logo-thumbnail" width="15" height="15">
               </div>
             ` : ''}
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
     config.type || 'gallery',
     'popularity',
     config.style || 'regular',
     config.limit || '1/-1'
   );
 }
};

export const storeAttributes = {
 render: store => {
   return `
     ${store.bestfor ? cards.cardStoreAttributes.render(store.bestfor, "Best For", "BestFor") : ""}
     ${store.working ? cards.cardStoreAttributes.render(store.working, "Working", "Working") : ""}
     ${store.environment ? cards.cardStoreAttributes.render(store.environment, "Environment", "Environment") : ""}
     ${store.facility ? cards.cardStoreAttributes.render(store.facility, "Facility", "Facility") : ""}
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
   const amtagButtons = document.querySelectorAll('.amtag');
   amtagButtons.forEach(button => {
     button.addEventListener('mouseenter', (e) => {
       button.classList.add('hovered');
     });
     button.addEventListener('mouseleave', (e) => {
       button.classList.remove('hovered');
     });
    
     const scoreIcons = button.querySelectorAll('.score-icon');
     scoreIcons.forEach(icon => {
       icon.addEventListener('click', (e) => {
         e.stopPropagation();
         const newScore = parseInt(icon.getAttribute('data-score'));
         button.setAttribute('data-score', newScore);
         scoreIcons.forEach((si, index) => {
           si.classList.toggle('active', index <= newScore);
         });
         button.classList.add('selected');
         button.querySelector('.single-icon').innerHTML = icon.innerHTML;
       });
     });
   });
 }
};

export const storeSummary = {
 render: (data) => {
   const limit = 2; // Maximum number of lines for tags
   const overviewSummaryData = [
     {
       title: 'Experience',
       score: data.experienceScore,
       tags: data.experience.sort((a, b) => b.user - a.user)
     },
     {
       title: 'Service',
       score: data.serviceScore,
       tags: data.service.sort((a, b) => b.user - a.user)
     },
     {
       title: 'Business',
       score: data.businessScore,
       tags: data.business.sort((a, b) => b.user - a.user)
     },
     {
       title: 'Location',
       score: data.locationScore,
       tags: data.location.sort((a, b) => b.user - a.user)
     }
   ].filter(item => item.tags && item.tags.length > 0);


   return `


       ${array.create.create(cards.cardSummaryItem, overviewSummaryData.map(item => ({...item, limit})), 'nest', '1/-1')}


   `;
 }
};

export const summaryComponent = {
  render: (data) => {
    return `
      <div class="summary-component">
        ${array.create.createArray(cardSummaryItem, [
          { title: 'Experience', score: data.experienceScore, tags: data.experience },
          { title: 'Service', score: data.serviceScore, tags: data.service },
          { title: 'Business', score: data.businessScore, tags: data.business },
          { title: 'Location', score: data.locationScore, tags: data.location }
        ], 'nest', '1/-1')}
      </div>
    `;
  }
};

export const storeCategory = {
 render: (data) => {
   console.log('Rendering storeCategory:', data);
  
   // Format data for carousel
   const categories = Object.entries(data).map(([key, value]) => ({
     category: value.category,
     items: value.items,
     url: value.url
   }));


   console.log('Formatted categories:', categories);
  
   return array.create.createCarousel(
     {
       render: (categoryData) => {
         console.log('Rendering category:', categoryData);
         return cardCategoryItem.render(categoryData);
       }
     },
     categories,
     'category',
     'regular',
     'category-carousel',
     6
   );
 }
};

// Update cardCategoryItem to match cardSummaryItem pattern
export const cardCategoryItem = {
 render: (data) => {
   console.log('cardCategoryItem rendering with data:', data);
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
    console.log('mapNearby render with data:', data);
    return `
      <div class="location col04">
        <div class="map-container col04">
          <div id="map" class="map col04">
            <div class="overlay col04">
              <div class="search col01">
                <div class="text02">
                  ${data?.address || ''}
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
  afterRender: () => {
    console.log('debug log: mapNearby01 - Running afterRender');
    const mapElement = document.getElementById('map');
    if (mapElement) {
      console.log('debug log: mapNearby02 - Found map element');
      initMap({
        container: 'map',
        center: [-118.2437, 34.0522], // Default to LA if no coordinates
        zoom: 13
      });
    } else {
      console.warn('Map element not found');
    }
  }
};


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
document.addEventListener('DOMContentLoaded', () => {
 const mapContainer = document.getElementById('map-container');
 if (mapContainer) {
   mapContainer.innerHTML = mapRadiusComponent.render();
   mapRadiusComponent.afterRender();
 }
});

export const seperatorLetters = {
  render: () => {
    return `
      <span class="divider word">-</span>
    `;
  } 
}

export const seperatorWords = {
  render: () => {
    return `
      <span class="divider word">,</span>
    `;
  } 
}

export const seperatorStatus = {
  render: () => {
    return `
      <span class="divider word">|</span>
    `;
  } 
}

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
   console.log('debug log: storeLocation09 - Location data received:', data);


   if (!data.attrtags || !Array.isArray(data.attrtags)) {
     console.warn('No attrtags data found');
     return '';
   }


   const visibleSections = data.attrtags.slice(0, 3);
   const hiddenSectionsCount = Math.max(0, data.attrtags.length - 3);


   return `
     <div class="location-attributes-container  col04">
       <div class="title">
         <span class="text03">
           The Area
         </span>
       </div>
       ${visibleSections.map(section => {
         console.log('debug log: storeLocation10 - Processing section:', section);
        
         if (!section.attributes || section.attributes.length === 0) {
           return '';
         }


         const limit = 2;
         const tagsPerLine = 3;
         const visibleTags = section.attributes.slice(0, limit * tagsPerLine);
         const hiddenTagsCount = section.attributes.length - visibleTags.length;
         const title = section.title;
         const count = section.attributes.reduce((total, attr) => total + attr.count, 0);
         let geotagData = {
           geotag: title,
           count: count
         };
         console.log('debug log: storeLocation11 - title:', title);
         return `
           <div class="tag-line line col04">


             ${geotag.geotagCountItem.render(geotagData)}


             <div class="tag-line">
               ${attrtag.attrtagScore.render({
                 tags: visibleTags.map(attr => ({
                   label: attr.label,
                   score: attr.score,
                   count: attr.count
                 })),
                 limit
               })}
               ${hiddenTagsCount > 0 ? `
                 <button class="button-more tag-more">
                   ${glyph.glyphSymbolPlus}
                   <span class="text02" id="count">
                     ${hiddenTagsCount}
                   </span>
                   <span class="text02">
                     more
                   </span>
                 </button>
               ` : ''}
             </div>
           </div>
         `;
       }).join('')}
       ${hiddenSectionsCount > 0 ? `
         <button class="button-more sections-more">
           ${glyph.glyphSymbolPlus}
           <span class="text02" id="sections-count">
             ${hiddenSectionsCount}
           </span>
           <span class="text02">
             more sections
           </span>
         </button>
       ` : ''}
     </div>
   `;
 },
 afterRender: () => {
   console.log('debug log: storeLocation11 - Running afterRender');
  
   // Existing geotag button handlers
   const amtagButtons = document.querySelectorAll('.amtag');
   console.log('debug log: storeLocation12 - Found geotag buttons:', amtagButtons.length);
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
   const sectionMoreButton = document.querySelector('.sections-more');
   if (sectionMoreButton) {
     console.log('debug log: storeLocation14 - Found sections-more button');
     sectionMoreButton.addEventListener('click', () => {
       console.log('debug log: storeLocation15 - Show more sections clicked');
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
       ${data.map(item => geotagAttribute.render(item)).join('')}
     </div>
   </div>
   `;
 }
};

export const locationTitle ={
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
   console.log('storeDetail rendering with data:', data);
  
   return `
     <div class="hero-detail array col04">
       <div class="hero-primary tag-array">
         ${geotag.geotagRating.render({ rating: data.rating })}
         ${geotag.geotagCostEstimate.render({ priceRange: data.costEstimate })}            
       </div>
       <div class="hero-secondary tag-array">
         <span class="objtag info-type text02">${data.storeType}</span>
         <span class="objtag info-distance text02">${data.distance} away in</span>
         <span class="objtag info-city text02">${data.city}, ${data.state}</span>
       </div>
     </div>
     <div class="hero-controls array col01">
       <button class="user-action share">
         ${glyph.glyphControlShare}
         <span class="text02">Share</span>
       </button>
       <button class="user-action save">
         ${glyph.glyphControlSave}
         <span class="text02">Save</span>
       </button>
       <button class="user-action checkin">
         ${glyph.glyphControlCheckin}
         <span class="text02">Check in</span>
       </button>
     </div>
   `;
 }
};

export const heroGallery = {
 render: (data) => {
   console.log('heroGallery rendering with data:', data);
  
   // Ensure we have gallery images before rendering
   if (!data.galleryImages || !data.galleryImages.length) {
     console.warn('No gallery images provided');
     return '';
   }


   return `
     <div class="hero-gallery00 grid05-overflow">
       ${data.galleryImages.slice(0, 4).map((image, index) => `
         <div
           class="gallery-image ${index < 2 ? 'col03' : 'col02'}"
           style="background-image: url(${image});"
           data-index="${index}"
         ></div>
       `).join('')}
     </div>
   `;
 }
};

export const storeHeadline = {
 render: (data) => {
   console.log('storeHeadline rendering with data:', data);
  
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
   return `
     <div class="info sentance alignV-center text02 col02">
       <span class="impression-item text02 glyph">
         ${user}
         <span class="count">
           ${data?.contributionsCount || 0}
         </span>
       </span>
       <div class="dividerV"></div>
       <div class="sentance">
         Modified ${data?.modifiedDate || 'N/A'}, ${data?.modifiedTime || 0} min
       </div>
     </div>
     <div class="controls col02 array  alignH-right">
       <span class="impression-item text02 glyph">
         ${comment}
         Comments
         <span class="count">
           ${data?.commentsCount || 0}
         </span>
       </span>
       <span class="impression-item text02 glyph">
         ${review}
         Reviews
         <span class="count">
           ${data?.reviewsCount || 0}
         </span>
       </span>
       <div class="divider"></div>
       <div class="impressions pair">
         <span class="impression-item text02 glyph">
           ${like}
           ${data?.likesCount || 0}
         </span>
         <span class="impression-item text02 glyph">
           ${dislike}
           ${data?.dislikesCount || 0}
         </span>
       </div>
     </div>
   `;
 }
};