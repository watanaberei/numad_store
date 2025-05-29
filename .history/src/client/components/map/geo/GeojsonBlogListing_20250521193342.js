// src/components/GeojsonBlogListing.js

import createBlogCard from "../../cards/_archive/card-blog.js";
import * as cardBlog from "../../../cards/cardBlog.js";

export function createGeojsonBlogListing(store, map, userCoordinates) {
  if (!store.properties) {
    return null; // Return null if there are no properties
  }

  const { 
    slug, variant, publishedAt, thumbnail, title, snippet,
    category, categoryType, tag, region
  } = store.properties;

  
  // Format tags
  const tags = tag && tag.length && tag[0].tags ? tag[0].tags : [];

  const cardContainer = document.createElement('div');
  cardContainer.className = 'cards-container';

  const carousel = document.createElement('a');
  carousel.className = 'card-blogCarousel-item listingBlog card-mid-item';
  carousel.href = '/blog/' + slug;
  carousel.rel = 'noopener noreferrer nofollow';
  carousel.target = '_self';
  


  // const { 
  //   best, tag, slug, variant, neuscore, publishedAt,
  //   storeType, environment, noiseLevel, parking,
  //   thumbnail, logo, text, region, categoryType,
  //   seriesName, genre, title, snippet, category,
  // } = store.properties;

  // console.log("genre", genre)

  // Format tags
  const CardBlog = cardBlog.cardBlog;
  const bests = best || [];
  // const title = text || [];
  // const tags = tag && tag.length ? tag[0].tags : [];
  const limitedBest03 = tags.slice(0, 3);
  // const tags = tag && tag.length && tag[0].tags ? tag[0].tags : [];
  const limitedTags = tags.slice(0, 3);

  // const cardContainer = document.createElement('div');
  // cardContainer.className = 'cards-container';

  // const carousel = document.createElement('a');
  // carousel.className = 'card-blogCarousel-item';
  // carousel.href = '/blog/' + slug;
  // carousel.rel = 'noopener noreferrer nofollow';
  // carousel.target = 'blog-' + slug;
  let bestHTML = '';
  limitedBest03.forEach(best => {
    bestHTML += `
      <div class="metadata-tag">
        <span class="metadata-tag-text text01 bold">${best}</span>
      </div>`;
  });

  carousel.onclick = function(e) {
    e.preventDefault();
    window.location.href = '/blog/' + slug;
  };

  if (variant === 'blogs') { 
    const blogData = {
      slug: slug,
      title: title,
      snippet: snippet || '',
      thumbnail: thumbnail || '',
      category: category || categoryType || 'Article',
      publishedAt: publishedAt,
      tag: tags
    };

    // Use the cardBlog component to render the blog card
    const blogContent = cardBlog.render(blogData);
    
    carousel.innerHTML = blogContent;
    cardContainer.appendChild(carousel);
  }

  return cardContainer;
}
//     carousel.className += ' ' + 'listingBlog' + ' ' + 'card-mid-item';
    
//     const blogContentData = {
//         slug: slug,
//         title: title || text,
//         snippet: snippet || '',
//         thumbnail: thumbnail || '',
//         category: category?.category || categoryType || 'Article',
//         publishedAt: publishedAt,
//         tag: limitedTags,

//         region: region,
//         storeType: storeType,
//         environment: environment,
//         noiseLevel: noiseLevel,
//         genre: genre,
//         parking: parking, 
//         logo: logo,
      
//         seriesName: seriesName,
//         neuscore: neuscore,
//         categoryType: categoryType,
//         region: region,
//         bestHTML: bestHTML,
//         best: best
//     };

//     const blogContent = createBlogCard.render(blogContentData);
//     // const blogCarouselItem = generateCarouselItem('Bloged Cards' + blogContent);
//     const blogCarouselItem = generateCarouselItem(blogContent);
//     cardContainer.appendChild(blogCarouselItem);
//     carousel.appendChild(cardContainer);


//     // Use the CardBlog component to render the blog card
//     // const blogContent = CardBlog.render(blogData);
    
//     carousel.innerHTML = blogContent;
//     cardContainer.appendChild(carousel);
//   }

//   return carousel;
// }

function generateCarouselItem(content) {
    const carouselItem = document.createElement('div');
    carouselItem.className = 'card-postCarousel-item listingBlog';
    carouselItem.innerHTML = content;
    return carouselItem;
}
