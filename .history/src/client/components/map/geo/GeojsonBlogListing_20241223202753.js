// src/components/GeojsonBlogListing.js

import createBlogCard from "./card-blog.js";

export function createGeojsonBlogListing(store, map, userCoordinates) {
    if (!store.properties) {
        return null; // Return null if there are no properties
      }

  const { 
    best, tag, slug, variant, neuscore, publishedAt,
    storeType, environment, noiseLevel, parking,
    thumbnail, logo, text, region, categoryType,
    seriesName, genre,
  } = store.properties;

  const bests = best || [];
  const title = text || [];
  const tags = tag && tag.length ? tag[0].tags : [];
  const limitedBest03 = tags.slice(0, 3);

  console.log("genre", genre)

  let bestHTML = '';
  limitedBest03.forEach(best => {
    bestHTML += `
      <div class="metadata-tag">
        <span class="metadata-tag-text text01 bold">${best}</span>
      </div>`;
  });

  const cardContainer = document.createElement('div');
  cardContainer.className = 'cards-container';

  const carousel = document.createElement('a');
  carousel.className = 'card-postCarousel-item';
  carousel.href = '/'+variant+'/'+slug;
  carousel.rel = 'noopener noreferrer nofollow';
  carousel.target = categoryType + '-${store.sys.id}';
  carousel.onclick = function() {
    mapRoute(userCoordinates, store.geometry.coordinates);
  };

  if (variant === 'blogs') { 
    carousel.className += ' ' + 'listingBlog' + ' ' + 'card-mid-item';
    
    const blogContentData = {
        thumbnail: thumbnail,
        publishedAt: publishedAt,
        category: categoryType,
        region: region,
        storeType: storeType,
        environment: environment,
        noiseLevel: noiseLevel,
        genre: genre,
        parking: parking, 
        logo: logo,
        title: title,
        seriesName: seriesName,
        neuscore: neuscore,
        categoryType: categoryType,
        region: region,
        bestHTML: bestHTML,
        best: best
    };

    const blogContent = createBlogCard.render(blogContentData);
    // const blogCarouselItem = generateCarouselItem('Bloged Cards' + blogContent);
    const blogCarouselItem = generateCarouselItem(blogContent);
    cardContainer.appendChild(blogCarouselItem);
    carousel.appendChild(cardContainer);
  }

  return carousel;
}

function generateCarouselItem(content) {
    const carouselItem = document.createElement('div');
    carouselItem.className = 'card-postCarousel-item listingBlog';
    carouselItem.innerHTML = content;
    return carouselItem;
}
