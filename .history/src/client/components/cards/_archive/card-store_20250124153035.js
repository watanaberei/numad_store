import { format, parseISO } from "date-fns";
import * as media from "../../media/_archive/media.js";
import * as tag from "../../tags/_archive/tag.js";   
import * as card from "./card.js";
import * as amtag from "../../tags/amtag.js";
import * as geotag from "../../tags/geotag.js";
import * as icon from "../../icon/glyph.js"



const createStoreCard = {
  render: (storeData) => {
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
    const storeGenre = storeData.genre;
    const ratingReviews = ratings.value;
    const storeCurrentStatus = storeData.storeCurrentStatus;
    const storeCity = storeData.city;
    const neustar = storeData.neustar;
    const storeAttributes = storeData.storeAttributes || [];
    //console.log('!!!!!!!!!!!storeAttributes', storeAttributes);
    
    
    //console.log('storeCurrentStatus', storeCurrentStatus);
    // const galleryURL = Array.isArray(storeData.thumbnail) ? storeData.thumbnail : [];
    const galleryURL = storeData.galleryHTML || [];
    const gallery = storeData.gallery || [];
    const galleryLimit = storeData.galleryLimit;

    const storeName = storeData.title;
    const storeRange = storeData.distance;
    //console.log('gallery', gallery);
    //console.log('best', best);
    //console.log('storeData', storeData);  


    const iconPin  = icon.glyphMapPin;
    const iconRating = icon.glyphRatingStar;
    
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
    const infotagRatingData = {
        value: ratingReviews,
        key: ratingScore,
        glyph: 'glyph-rating-star',
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
    //console.log('attrTagData', attrTagData);    
    const statTagHourData = {
        text: storeCurrentStatus,
        key: storeCurrentStatus, // initialize storeRange as null
        value: storeCurrentStatus
    };
    const rating = {
        score: rating,
    };
    //console.log('rating', rating);
   const infoTagCityData = {
        text: storeCity,
    };
    const infoTagGenreData = {
        text: storeGenre,
    };
    const infoTagDistanceData = {
        text: 'Nearby',
    };
    const geotagStoreData = {
      title: storeName,
      storeRange: storeRange,
    };
    //console.log('neustar', neustar);
    // Define getStoreRange inside render function
    // async function getStoreRange() {
    //     try {
    //         storeEyebrow.storeRange = await storeData.storeRange; // assuming storeRange is a property of storeData
    //         // console.log(storeEyebrow.storeRange); // should print '18.94' instead of '[object Promise]'
    //         return storeEyebrow.storeRange; // return the value
    //     } catch (error) {
    //         console.error('An error occurred:', error);
    //     }
    // }

    // // Use the returned value
    // getStoreRange().then(storeRange => {
    //     console.log("storeRange",); // should print the value of storeRange
    //     return storeRange
    //     // const renderedEyebrow = eyebrow.render(storeEyebrow.storeCurrentStatus, storeEyebrow.storeRange);
    //     // console.log("renderedEyebrow",renderedEyebrow);
    // });
    const storerange = storeData.storeRange;

    const stattagRange = tag.statTag.render(storerange);
    const stattagHour = tag.statTagLg.render(statTagHourData);
    const mediaThumbnail = media.thumbnail.render(gallery, galleryLimit);
    const tagNeustar = tag.tagNeustar.render(neustar);
    const tagRating = tag.tagRating.render(rating);
    const spacerDot = tag.tagSpacer.render(spacerDotData);
    const spacerIn = tag.tagSpacer.render(spacerInData);
    const tagGenre = tag.tagGenre.render(storeGenre);
    const infoTagRating = tag.infoTagLg.render(infotagRatingData);
    const infoTagGenre = tag.infoTag.render(infoTagGenreData);
    const infoTagCity = tag.infoTag.render(infoTagCityData);
    const infoTagDistance = tag.infoTag.render(infoTagDistanceData);
    // const attributeTag = tag.attributeTag.render(storeData.best);
    const attrTag = amtag.amtagItem.render(attrTagData);
    const metaTag = tag.metaTag.render(metaTagData, tagLimit);
    const objtagStore = tag.objTag.render(objtagStoreData);
    const objTagNeustar = tag.objTagNeustar.render(objTagNeustarData);

    const geotagStore = geotag.geotagStore.render(geotagStoreData);
    // const outletCounts = tag.outletCounts.render(storeData.outletCounts);
    // const metatag = tag.metatagArray.render(metaTagData, metatagLimit);
    // const metatag = Array.isArray(metaTagData.value) ? tag.metatagArray.render(metaTagData, metatagLimit) : '';

    
    // const limitedBest02 = Array.isArray(storeData.best) ? storeData.best.slice(0, 2) : [];
    // const attributesArray = generateAttributesArray(limitedBest02);
    
    
    // const cardTitle = card.tagType.render(storeTitleData);
    // const cardEyebrow = card.eyebrow.render(storeEyebrow.storeCurrentStatus, storeEyebrow.storeRange);

    
    console.log("storeData",storeData)

    // After a delay, replace the loader with the actual content
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
           <div class="container col01"
            style="
              background: url(${galleryURL}) center;
              background-size: cover;
              background-repeat: no-repeat;
            ">
           
            <div class="col01 grid02 top primary">
              <div class="col01 pill left">
                ${iconRating}
                ${amtag.amtagItem.render({ category: storeData.ratingScore })}
              </div>
              <div class="col01 pill right">
                ${amtag.amtagItem.render({ category: storeData.type })}              
              </div>
            </div>
            <div class="col01 middle tertiary">
            </div>
            <div class="col01 bottom secondary">
              <div class="col01 grid02 pill">
                ${geotagStore}
              </div>
            </div>
          </div>


       `);
      }, 600); // 600ms delay
    });
  },
};

export default createStoreCard;


//////////// THUMBNAIL ////////////
// function generateThumbnailHTML(storeData, limit) {
//     // if (!Array.isArray(storeData)) {
//     //     console.error('Invalid storeData: expected an array');
//     //     return '';
//     // }

//     let mediaGalleryHTML = '';
//     storeData.slice(0, limit).forEach((storeData, index) => {
//       const opacityClass = index >= 4 ? 'low-opacity' : '';
//       mediaGalleryHTML += `

//             <div class="media-img-m ${opacityClass}">
//                 <div class="media-img">
//                     <img src="${storeData.url}" class="media-img-1-x-1-x-m" alt="" />
//                 </div>
//             </div>
            
//       `;
//     });
//     return mediaGalleryHTML;
// }
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
  


  