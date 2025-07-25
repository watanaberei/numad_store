import { format, parseISO } from "date-fns";
import * as media from "../../media/media.js";
import * as tag from "../../tags/_archive/tag.js";   
import * as card from "../card.js";
import * as amtag from "../../tags/amtag.js";
import * as geotag from "../../tags/geotag.js";
import * as icon from "../../icon/glyph.js"
import * as attrtag from "../../tags/attrtag.js";
import * as component from "../../components.js";

const createStoreCard = {
  ///////////////////////// START FIXED ASYNC RENDER /////////////////////////
  // Changed render to return a string directly, not a promise
  render: (data) => {
    console.log("[cardStore.js:14] Card Store Data:", data); // Debug log


    // Extract data with proper default values and structure
    const {
      // Basic info
      slug,
      title = 'Unknown Store',
      thumbnail = '',
      logo = '',
      
      // Gallery and media
      gallery = [],
      galleryHTML = '',
      galleryURL = '',
      galleryLimit = 3,
      
      // Store attributes
      storeType,
      categoryType,
      environment,
      noiseLevel,
      parking,
      
      // Text content
      text = '',
      headline = '',
      publishedAt,
      
      // Ratings and metrics
      neustar,
      neustarHTML = '',
      ratings = [],
      review_count = 0,
      rating = 0,
      
      // Location info
      city = 'Unknown',
      region = 'CA', 
      state = 'CA',
      address = '',
      addressMin = '',
      storeRegion,
      
      // Store status
      storeCurrentStatus = '',
      storeCurrentStatusHTML = '',
      storeRange = null,
      
      // Attributes and tags
      best = [],
      bestHTML = '',
      genre,
      nearby,
      designator,
      metaTagLabel = [],
      metaTagLimit = 3,
      storeAttributes = [],
      tagAttributes = [],
      tagLimit = 3,
      tagLimit: attrTagLimit = 3,
    } = data;

    console.log("[cardStore.js:78] Processing store card for:", title); // Line 78

    // Generate store rating data with fallbacks
    const storeRatingData = {
      review: ratings.length > 0 ? ratings[0].value : (review_count || 0),
      rating: ratings.length > 0 ? ratings[0].key : (rating || 0),
      glyph: 'glyph-rating-star',
    };

    // Generate store title data
    const storeTitleData = {
      title: title || text || 'Unknown Store',
      location: addressMin || `${city}, ${region || state}`
    };
   
    // Generate store type data - handle both string and array formats
    let storeTypeDisplay = '';
    if (storeType) {
      if (typeof storeType === 'string') {
        storeTypeDisplay = storeType;
      } else if (Array.isArray(storeType) && storeType.length > 0) {
        // If it's an array of objects with 'alias' property
        if (storeType[0].alias) {
          storeTypeDisplay = storeType[0].alias;
        } else {
          storeTypeDisplay = storeType[0];
        }
      }
    } else if (categoryType) {
      storeTypeDisplay = categoryType;
    } else {
      storeTypeDisplay = 'store';
    }

    // Generate store type data
    const storeTypeData = {
      type: storeTypeDisplay
    };

    console.log("[cardStore.js:113] Store type resolved to:", storeTypeDisplay); // Line 113

    // Generate components
    const storeTitle = geotag.geotagStore.render(storeTitleData);
    const storeRating = geotag.geotagRating.render(storeRatingData);
    const storeTypeComponent = geotag.geotagType.render(storeTypeData);
    
    // Handle gallery/thumbnail with proper fallbacks
    let mediaThumbnail = '';
    if (gallery && gallery.length > 0) {
      console.log("[cardStore.js:123] Using gallery image:", gallery[0]); // Line 123
      mediaThumbnail = media.mediaThumbnail.render(gallery[0]);
    } else if (thumbnail) {
      console.log("[cardStore.js:126] Using thumbnail:", thumbnail); // Line 126
      mediaThumbnail = media.mediaThumbnail.render(thumbnail);
    } else {
      console.log("[cardStore.js:129] No image available, using placeholder"); // Line 129
      mediaThumbnail = media.mediaThumbnail.render('/images/placeholder-store.jpg');
    }

    // Generate attributes pills (max 3)
    const attributes = (best || []).slice(0, 3).map(item => ({
      text: item,
      icon: 'glyph-check-15'
    }));

    const attrTagData = {
      data: attributes,
      limit: attrTagLimit
    };

    // const attrTag = tag.attrTag.render(attrTagData);

    // Generate attributes pills from best array (max 3)
    let attrTag = '';
    if (best && Array.isArray(best) && best.length > 0) {
      const attributes = best.slice(0, 3).map(item => {
        // Handle both string and object formats
        if (typeof item === 'string') {
          return {
            text: item,
            icon: 'glyph-check-15'
          };
        } else if (item.label) {
          return {
            text: item.label,
            icon: 'glyph-check-15'
          };
        }
        return null;
      }).filter(Boolean);

      if (attributes.length > 0) {
        const attrTagData = {
          data: attributes,
          limit: attrTagLimit
        };
        attrTag = tag.attrTag.render(attrTagData);
      }
    }

    // Generate store status if available
    const statusHTML = storeCurrentStatus ? `
      <div class="status ${storeCurrentStatus.toLowerCase().replace(' ', '-')}">
        ${storeCurrentStatus}
      </div>
    ` : '';

    // Generate store range if available
    const rangeHTML = storeRange ? `
      <div class="store-range">
        <span class="text01">${storeRange} miles away</span>
      </div>
    ` : '';

    console.log("[cardStore.js:118] Generating card HTML"); // Line 118

    // Generate the store URL - use slug if available, otherwise create from title
    const storeUrl = slug ? `/${slug}` : `/${title?.toLowerCase().replace(/\s+/g, '-') || 'store'}`;

    return `
    card
    <a href="${storeUrl}" class="store card col01">
      <div class="col01 grid02 card-store">
        <div class="col01 background media">
          ${mediaThumbnail}
          ${attrTag ? `
            <div class="tag-container">
              <div class="tag">
                ${attrTag}
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="col01 row01 overlay">
          <div class="col01 row01 grid02 top primary">
            <div class="col01 row01 pill left">
              ${storeRating}
              ${statusHTML}
            </div>
            <div class="col01 row01 pill right">
              ${storeTypeComponent}
              ${rangeHTML}
            </div>
          </div>
          
          ${attrTag ? `
            <div class="col01 row01 middle tertiary">
              <div class="subtitle">
                <div class="attributes">
                  ${attrTag}
                </div>
              </div>
            </div>
          ` : ''}

          <div class="col01 row01 bottom secondary">
            <div class="pill">
              ${storeTitle}
            </div>
          </div>
        </div>
      </div>
    </a>
  `;
},
  ///////////////////////// END FIXED ASYNC RENDER /////////////////////////

  after_render: async () => {
    console.log("[cardStore.js:165] Running after_render"); // Line 165
    
    // Add hover effects and image cycling
    const cards = document.querySelectorAll('.card-store');
    
    cards.forEach(card => {
      const mediaContainer = card.querySelector('.background.media');
      const images = mediaContainer?.querySelectorAll('.media-img-m');
      
      if (!images || images.length === 0) return;
      
      let currentImageIndex = 0;
      let interval;

      // Function to cycle through images
      const cycleImages = () => {
        images.forEach((img, index) => {
          img.style.opacity = index === currentImageIndex ? '1' : '0';
        });
        currentImageIndex = (currentImageIndex + 1) % images.length;
      };

      // Start cycling on hover
      card.addEventListener('mouseenter', () => {
        if (images.length > 1) {
          interval = setInterval(cycleImages, 3000); // Change image every 3 seconds
        }
        card.classList.add('hover');
      });

      // Stop cycling on mouse leave
      card.addEventListener('mouseleave', () => {
        if (interval) {
          clearInterval(interval);
        }
        card.classList.remove('hover');
        // Reset to first image
        images.forEach((img, index) => {
          img.style.opacity = index === 0 ? '1' : '0';
        });
        currentImageIndex = 0;
      });

      // Add click tracking
      card.addEventListener('click', (e) => {
        console.log("[cardStore.js:269] Store card clicked:", card.href); // Line 269
      });
    });
    
    console.log("[cardStore.js:273] Store cards initialized:", cards.length); // Line 273
  }
};

export default createStoreCard;

// Helper function to generate thumbnail HTML
function generateThumbnailHTML(galleryHTML, limit) {
    if (!galleryHTML) return '';
    
    // Parse the galleryHTML string to get the URLs
    const parser = new DOMParser();
    const doc = parser.parseFromString(galleryHTML, 'text/html');
    const imgElements = Array.from(doc.getElementsByTagName('img'));
    const urls = imgElements.map(img => img.src);

    // Generate the HTML
    let mediaGalleryHTML = '';
    urls.slice(0, limit).forEach((url, index) => {
        const opacityClass = index >= 4 ? 'low-opacity' : '';
        mediaGalleryHTML += `
            <div class="media-img-m ${opacityClass}">
                <div class="media-img">
                    <img src="${url}" class="media-img-1-x-1-x-m" alt="" />
                </div>
            </div>
        `;
    });
    return mediaGalleryHTML;
}

// Function to generate the Neustar icons
const generateNeustarIcons = (neustar) => {
  if (!neustar) return '';
  
  let iconsHTML = '';
  for (let i = 1; i <= 3; i++) {
    if (i <= neustar) {
      iconsHTML += '<i class="icon-neustar-active12"></i>';
    } else {
      iconsHTML += '<i class="icon-neustar-inactive12"></i>';
    }
  }
  return iconsHTML;
};

// Helper function to generate attributes array
function generateAttributesArray(limitedBest02) {
    if (!limitedBest02 || !Array.isArray(limitedBest02)) return '';
    
    let attributesArray = "";
    limitedBest02.forEach((best) => {
      attributesArray += `
        <div class="item">
            <div class="text">
              <span class="bold text03">${best}</span>
              <i class="glyph glyph-check-15"></i>
            </div>
        </div>`;
    });
    return attributesArray;
}