// src/components/GeojsonReviewListing.js
import createReviewCard from "./card-review.js";

export function createGeojsonReviewListing(store, map, userCoordinates) {
  if (!store.properties) {
    return null; // Return null if there are no properties
  }
 
  const { 
    lat, best, lon, seriesName, region, address, tag, slug, variant, 
    thumbnail, gallery: originalGallery, logo, area, service,   storeType,environment,noiseLevel,parking, neustar,
    categoryType, genre, text, subtext, eyebrow, location, hours, summary, publishedAt,
  } = store.properties;

  // console.log("seriesName",seriesName)
  // console.log("neustar",neustar)
  // console.log("genre",genre)

  const tags = tag && tag.length ? tag[0].tags : [];
  const bests = best || [];
  const title = text || [];
  const subtitle = subtext || [];
  const series = seriesName && seriesName.length ? seriesName[0].series : [];
  const eyebrows = eyebrow || [];
  const locations = location || [];
  const limitedBest03 = tags.slice(0, 3);
  const limitedTags03 = bests.slice(0, 3);


  
  // // console.log("logo", logo);
  // // console.log("subtitle", subtitle);
  // // console.log("title", title);
  // // console.log("eyebrow", eyebrow);


  // const galleryData = originalGallery && Array.isArray(originalGallery) && originalGallery.length ? originalGallery : [];
  // const galleryHTML = generateGalleryHTML(galleryData);
  let tagsHTML = '';

  let bestHTML = '';


  limitedBest03.forEach(best => {
    bestHTML += `
    <div class="metadata-tag">
      <span class="metadata-tag-text text01 bold">${best}</span>
    </div>`;
  });
  limitedTags03.forEach(tag => {
    tagsHTML += `<div class="metadata-tag">
                   <span class="metadata-tag-text text01 bold">${tag}</span>
                 </div>`;
  });

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

  

  // 
 
  const listing = document.createElement('a');
  listing.className = ' ' + 'card-postListing-item';
  listing.href = '/'+variant+'/'+slug;
  listing.rel = 'noopener noreferrer nofollow';
  listing.target = categoryType + '-${store.sys.id}';
  listing.onclick = function() {
    mapRoute(userCoordinates, store.geometry.coordinates);
  }
  const carousel = document.createElement('a');
  carousel.className = 'card-postCarousel-item';
  carousel.href = '/'+variant+'/'+slug;
  carousel.rel = 'noopener noreferrer nofollow';
  carousel.target = categoryType + '-${store.sys.id}';
  carousel.onclick = function() {
    mapRoute(userCoordinates, store.geometry.coordinates);
  };
  const cardContainer = document.createElement('div');
  cardContainer.className = 'cards-container';


  const neustarHTML = `${store.properties.neustar} ${generateNeustarIcons(store.properties.neustar)}`;


  

  if (variant === 'reviews') { 
    carousel.className += ' ' + 'listingReview' + ' ' + 'card-mid-item';
    
    const reviewContentData = {
        thumbnail: thumbnail,
        logo: logo,
        publishedAt: publishedAt,
        storeType: storeType,
        environment: environment,
        noiseLevel: noiseLevel,
        parking: parking, 
        title: title,
        neustarHTML: neustarHTML,
        categoryType: categoryType,
        region: region,
        bestHTML: bestHTML,
        neustar: neustar,
        genre: genre,
        best: best
    };

    const reviewContent = createReviewCard.render(reviewContentData);
    // const reviewCarouselItem = generateCarouselItem('Reviewed Cards' + reviewContent);
    const reviewCarouselItem = generateCarouselItem(reviewContent);
    cardContainer.appendChild(reviewCarouselItem);
    carousel.appendChild(cardContainer);
  }

  return carousel;
}

function generateCarouselItem(content) {
    const carouselItem = document.createElement('div');
    carouselItem.className = 'card-postCarousel-item listingAReview';
    carouselItem.innerHTML = content;
    return carouselItem;
}
