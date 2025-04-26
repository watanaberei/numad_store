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
    const storeData = data.storeInfo || {};
    const storeId = data.storeId || '';

    // Extract data from storeInfo
    const {
      storeName,
      city,
      state,
      distance,
      status,
      gallery = [],
      storeType: storeTypes = [],
      rating,
      review_count
    } = storeData;

    // Prepare data for components
    const storeRatingData = {
      review: review_count,
      rating: rating,
      glyph: 'glyph-rating-star',
    };

    const storeTitleData = {
      title: storeName,
      location: `${city}, ${state}`
    };

    const storeTypeData = {
      type: storeTypes.map(t => t.title).join(', ')
    };

    // Generate components
    const storeTitle = geotag.geotagStore.render(storeTitleData);
    const storeRating = geotag.geotagRating.render(storeRatingData);
    const storeTypeComponent = geotag.geotagType.render(storeTypeData);
    // const mediaThumbnail = media.mediaThumbnail.render(gallery, 6);
    const mediaThumbnail = media.mediaThumbnail.render(gallery[0]); // Limit to 6 images
    console.log(gallery[0]);

    // Generate attributes pills (max 3)
    const attributes = storeTypes.slice(0, 3).map(type => ({
      text: type.title,
      icon: 'glyph-check-15'
    }));

    const attrTagData = {
      data: attributes,
      limit: 3
    };

    const attrTag = tag.attrTag.render(attrTagData);

    return `
      <a href="/stores/${storeId}" class="store card col01" data-store-id="${storeId}">
        <div class="col01 grid02 card-store" data-store-id="${storeId}">
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
              </div>
              <div class="col01 row01 pill right">
                ${storeTypeComponent}
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
        interval = setInterval(cycleImages, 3000); // Change image every 3 seconds
        card.classList.add('hover');
      });

      // Stop cycling on mouse leave
      card.addEventListener('mouseleave', () => {
        clearInterval(interval);
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

function generateThumbnailHTML(galleryHTML, limit) {
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
//////////// THUMBNAIL ////////////

// Function to generate the Neustar icons
const generateNeustarIcons = (neustar) => {
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

// ATTRIBUTES
function generateAttributesArray(limitedBest02) {
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
  


  