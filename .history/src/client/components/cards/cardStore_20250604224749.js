import { format, parseISO } from "date-fns";
import * as media from "../media/media.js";
import * as tag from "../tags/_archive/tag.js";   
import * as card from "./card.js";
import * as amtag from "../tags/amtag.js";
import * as geotag from "../tags/geotag.js";
import * as icon from "../icon/glyph.js"
import * as attrtag from "../tags/attrtag.js";
import * as component from "../components.js";

const createStoreCard = {
  render: async (data) => {
    console.log("Card Store Data:", data); // Debug log

    // Extract data with default values
    const {
      thumbnail,
      logo,
      title,
      gallery = [],
      galleryHTML = '',
      galleryURL = '',
      galleryLimit = 3,
      tagLimit = 3,
      headline,
      publishedAt,
      storeType,
      environment,
      noiseLevel,
      parking,
      text,
      neustar,
      neustarHTML = '',
      categoryType,
      storeCurrentStatusHTML = '',
      region,
      storeCurrentStatus = '',
      bestHTML = '',
      genre,
      best = [],
      nearby,
      ratings = [],
      address,
      storeRegion,
      city,
      designator,
      metaTagLabel = [],
      metaTagLimit = 3,
      storeRange = null,
      storeAttributes = [],
      tagAttributes = [],
      tagLimit: attrTagLimit = 3,
      addressMin = '',
    } = data;

    // Generate store rating data
    const storeRatingData = {
      review: ratings.length > 0 ? ratings[0].value : 0,
      rating: ratings.length > 0 ? ratings[0].key : 0,
      glyph: 'glyph-rating-star',
    };

    // Generate store title data
    const storeTitleData = {
      title: title || text,
      location: addressMin || `${city}, ${region}`
    };

    // Generate store type data
    const storeTypeData = {
      type: storeType || categoryType
    };

    // Generate components
    const storeTitle = geotag.geotagStore.render(storeTitleData);
    const storeRating = geotag.geotagRating.render(storeRatingData);
    const storeTypeComponent = geotag.geotagType.render(storeTypeData);
    
    // Handle gallery/thumbnail
    let mediaThumbnail = '';
    if (gallery && gallery.length > 0) {
      mediaThumbnail = media.mediaThumbnail.render(gallery[0]);
    } else if (thumbnail) {
      mediaThumbnail = media.mediaThumbnail.render(thumbnail);
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

    const attrTag = tag.attrTag.render(attrTagData);

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

    return `
      <a href="/stores/${title?.toLowerCase().replace(/\s+/g, '-')}" class="store card col01">
        <div class="col01 grid02 card-store">
          <div class="col01 background media">
            ${mediaThumbnail}
            <div class="tag-container">
              <div class="tag">
                ${attrTag}
              </div>
            </div>
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
            
            <div class="col01 row01 middle tertiary">
              <div class="subtitle">
                <div class="attributes">
                  ${attrTag}
                </div>
              </div>
            </div>

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

  after_render: async () => {
    // Add hover effects and image cycling
    const cards = document.querySelectorAll('.card-store');
    
    cards.forEach(card => {
      const mediaContainer = card.querySelector('.background.media');
      const images = mediaContainer.querySelectorAll('.media-img-m');
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
    });
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

  