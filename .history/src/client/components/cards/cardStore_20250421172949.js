import { format, parseISO } from "date-fns";
import * as media from "../../media/_archive/media.js";
import * as tag from "../../tags/_archive/tag.js";   
import * as card from "./card.js";
import * as amtag from "../../tags/amtag.js";
import * as geotag from "../../tags/geotag.js";
import * as icon from "../../icon/glyph.js"
import * as attrtag from "../../tags/attrtag.js";
import * as component from "../../components.js";





const createStoreCard = {
  render: async (storeData) => {
    // Render a loader or placeholder here
    const loader = `
    <div class="loader">
      Loading...
    </div>
  `;

  
    console.log('storeData', storeData);   
    const best = storeData.best || [];   
    const metaTagLabel = storeData.metaTagLabel || [];
    const tagLimit = storeData.tagLimit;
    // const metatagLimit = tagLimit;
    const tagAttributes = storeData.tagAttributes || [];
    const ratings = storeData.ratings[0];
    const ratingScore = ratings.key;
    const ratingReview = ratings.value;
    const storeGenre = storeData.genre;
    const storeCurrentStatus = storeData.storeCurrentStatus;
    const storeCity = storeData.city;
    const neustar = storeData.neustar;
    const storeAttributes = storeData.storeAttributes || [];
    console.log('!!!!!!!!!!!storeAttributes', storeAttributes);
    
    
    console.log('storeCurrentStatus', storeCurrentStatus);
    const galleryURL = storeData.galleryHTML || [];
    const gallery = storeData.gallery || [];
    const galleryLimit = storeData.galleryLimit;
    console.log('gallery', gallery);
    console.log('best', best);
    console.log('storeData', storeData);  




    // Define getStoreRange inside render function
    async function GetStoreRange() {
      try {
          const storeRange = await storeData.storeRange; // assuming storeRange is a property of storeData
          // console.log(storeRange); // should print '18.94' instead of '[object Promise]'
          return storeRange; // return the value
      } catch (error) {
          console.error('An error occurred:', error);
          return null;
      }
    }
    console.log("getStoreRange in card-store:", storeRange);
    
    // Use the returned value
    const storeRange = await GetStoreRange();
    console.log("storeRange", storeRange); // should print the value of storeRange
    // const renderedEyebrow = eyebrow.render(getStoreRange.storeCurrentStatus, getStoreRange.storeRange);
    // console.log("renderedEyebrow in card-store:", renderedEyebrow);





    
    
    const spaceData = {
        key: 'Space',
        value: '111',
      };
    const spacerCommaData = {
    text: ',',
    };
    const spacerDotData = {
    text: '•',
    };
    const spacerInData = {
    text: 'in',
    };
    const objtagStoreData = {
        text: storeData.title
        // location: storeData.city
    };
    const objTagNeustarData = {
        key: neustar,
    };
    const metaTagData = storeData.best;
    // const attrTagData = storeData.storeAttributes;
    // const attrTagData = best;
    const statTagData = {
        storeCurrentStatus: storeCurrentStatus,
        storeRange: null, // initialize storeRange as null
    };
    const attrTagData = {
        data: storeAttributes,
        limit: tagLimit, // initialize storeRange as null
    };
    console.log('attrTagData', attrTagData);    
    const statTagHourData = {
        text: storeCurrentStatus,
        key: storeCurrentStatus, // initialize storeRange as null
        value: storeCurrentStatus
    };
    const rating = {
        score: rating,
    };
    console.log('rating', rating);
   const infoTagCityData = {
        text: storeCity,
    };
    // const storeTypeData = {
    //     text: storeGenre,
    // };
    const infoTagDistanceData = {
        text: 'Nearby',
    };
    console.log('neustar', neustar);




    const storeRatingData = {
      review: ratingReview,
      rating: ratingScore,
      glyph: 'glyph-rating-star',
  };
    const storeTitleData = {
      title: storeData.title,
      storeRange: storeRange,
    };
    const storeTypeData = {
      type: storeData.genre,
    };
    
  
    const storeTitle = geotag.geotagStore.render(storeTitleData);
    const storeRating = geotag.geotagRating.render(storeRatingData);
    const storeType = geotag.geotagType.render(storeTypeData);

    const stattagRange = tag.statTag.render(storeRange);
    const stattagHour = tag.statTagLg.render(statTagHourData);
    const mediaThumbnail = media.thumbnail.render(gallery, galleryLimit);
    const tagNeustar = tag.tagNeustar.render(neustar);
    const tagRating = tag.tagRating.render(rating);
    const spacerDot = tag.tagSpacer.render(spacerDotData);
    const spacerIn = tag.tagSpacer.render(spacerInData);
    const tagGenre = tag.tagGenre.render(storeGenre);
    const infoTagRating = tag.infoTagLg.render(storeRatingData);
    const infoTagGenre = tag.infoTag.render(storeTypeData);
    const infoTagCity = tag.infoTag.render(infoTagCityData);
    const infoTagDistance = tag.infoTag.render(infoTagDistanceData);
    const attrTag = tag.attrTag.render(attrTagData);
    const metaTag = tag.metaTag.render(metaTagData, tagLimit);
    const objtagStore = tag.objTag.render(objtagStoreData);
    const objTagNeustar = tag.objTagNeustar.render(objTagNeustarData);


  

    // After a delay, replace the loader with the actual content
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
          
          <!--$ {storeRange ? <div class="store-range">$ {storeRange}</div> : ''}-->
          
          <div class="background media">
                ${mediaThumbnail} 
                <div class="tag-container">
                  <div class="tag">
                      ${metaTag}
                  </div>  
                </div>
            </div>
            <div class="gridCard col01 row01 overlay">
              
              <div class="col01 row01 grid02 top primary">
                <div class="col01 row01 pill left">
                  ${storeRating}
                </div>
                <div class="col01 row01  pill right">
                  ${storeType}
                </div>
              </div>
              <div class="col01 row01  middle tertiary">
                <!--
                  <div class="subtitle">
                      $ {stattagRange} 
                      $ {infoTagRating}
                      $ {spacerDot}
                    <div id="distance">
                      $ {infoTagDistance}
                    </div>
                      $ {stattagHour}
                      $ {spacerIn}
                      $ {infoTagCity}
                    <div class="attributes">
                      $ {attrTag}
                    </div>
                  </div>
                  -->
                
              
              </div>

              <div class="col01 row01  bottom secondary">
                <div class="pill">
                  ${storeTitle}
                </div>
                <!--
                  <div class="title">
                    $ {objTagNeustar}
                    $ {objtagStore}
                  </div> 
                -->
              </div>

          </div>
          `);
      }, 600); // 600ms delay
    });
  },
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
  


  