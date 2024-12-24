// src/components/GeojsonListing.js
import createReviewCard from "./card-review.js";


// import { createArticleCard } from "./card-article.js";
// import { createBlogCard } from "./card-blog.js";
// import { createStoreCard } from "./card-store.js";
// import { createDefaultCard } from "./card-default.js";


export function createGeojsonListing(store, map, userCoordinates) {
  if (!store.properties) {
    return '';
  }
  
 
  const { 
    lat, best, neustar, lon, seriesName, region, address, tag, slug, variant, 
    thumbnail, gallery: originalGallery, logo, area, service, 
    categoryType, genre, text, subtext, eyebrow, location, hours, summary, 
  } = store.properties;

  console.log("seriesName",seriesName)

  const tags = tag && tag.length ? tag[0].tags : [];
  const bests = best || [];
  const title = text || [];
  const subtitle = subtext || [];
  const series = seriesName && seriesName.length ? seriesName[0].series : [];
  const eyebrows = eyebrow || [];
  const locations = location || [];
  const limitedBest03 = tags.slice(0, 3);
  const limitedTags03 = bests.slice(0, 3);


  
  console.log("logo", logo);
  console.log("subtitle", subtitle);
  console.log("title", title);
  console.log("eyebrow", eyebrow);


  const galleryData = originalGallery && Array.isArray(originalGallery) && originalGallery.length ? originalGallery : [];
  const galleryHTML = generateGalleryHTML(galleryData);
  let tagsHTML = '';

  let bestHTML = '';
  limitedBest03.forEach(best => {
    bestHTML +=  `
    <div class="metadata-tag">
      <span class="metadata-tag-text text01 bold">${best}</span>
    </div>`;
  });

  limitedTags03.forEach(tag => {
    tagsHTML += `<div class="metadata-tag">
                   <span class="metadata-tag-text text01 bold">${tag}</span>
                 </div>`;
  });
  

  function generateCarouselItem(content) {
    const carouselItem = document.createElement('div');
    carouselItem.className = 'card-postCarousel-item';
    carouselItem.innerHTML = content;
    return carouselItem;
  }
 
  const listing = document.createElement('a');
  listing.className = ' ' + 'card-postListing-item';
  listing.href = '/'+variant+'/'+slug;
  listing.rel = 'noopener noreferrer nofollow';
  listing.target = categoryType + '-${store.sys.id}';
  listing.onclick = function() {
    mapRoute(userCoordinates, store.geometry.coordinates);
  }
 




  
  if (variant === 'reviews') { 
    const cardContainer = document.createElement('div');
    cardContainer.className = 'cards-container';  // You can give it a class for styling.
    listing.className += ' ' + 'listingReview' + ' ' + 'card-mid-item';
    
    const reviewContentData = {
        thumbnail: thumbnail,
        logo: logo,
        title: title,
        region: region,
        bestHTML: bestHTML
        // You can continue adding other necessary properties here
    };

    const reviewContent = createReviewCard.render(reviewContentData);

    function generateCarouselItem(reviewContent) {
        const reviewCarouselItem = document.createElement('div');
        reviewCarouselItem.className = 'card-postCarousel-item';
        reviewCarouselItem.innerHTML = 'Reviewed Cards' + reviewContent;
        return reviewCarouselItem;
    }

    const carouselItem = generateCarouselItem(reviewContent);
    cardContainer.appendChild(carouselItem);
}







  
  if (variant === 'reviews') { 
    listing.className += ' ' + 'listingReviews' + ' ' + 'card-mid-item';
    
    const reviewContentData = {
        thumbnail: thumbnail,
        logo: logo,
        title: title,
        region: region,
        bestHTML: bestHTML
        // You can continue adding other necessary properties here
    };

    const reviewContent = createReviewCard.render(reviewContentData);
    const carouselItem = generateCarouselItem(reviewContent);
    listing.appendChild(carouselItem);
} else if (variant === 'articles') { ////////////////////ARTICLES////////////////////
    listing.className += ' ' + 'listingArticles' + ' ' + 'card-full-item';
    listing.innerHTML = `${logo}
    <div class="c1-c3 card-postListing-item-content">
      <div class="content-title">
        <span class="header05">
          ${title}
        </span>
        <span class="paragraph">
        ${categoryType}
        </span>
        <span class="paragraph">
        ${region}
        </span>
      </div>
  
      <div class="post-data">
        <div class="tag-collection">

          <div class="nav-list-divider">
            <div class="lineV"></div>
          </div>
          <div class="post-data">
            ${bestHTML}
          </div>
        </div>
        <div class="data-time">
          <span class="data-time-text text01">2m Read</span>
        </div>
      </div>
    </div>
    <div class="c3col2-c5col2 ratio1x1 card-articleListing-item-img">
    <img class="item-img" src="${thumbnail}" alt="" />
    <img class="item-img" src="${thumbnail}" alt="" />
    </div>
  `; 
  // Create different innerHTML based on variant
} else if (variant === 'stores') {////////////////////STORES////////////////////
    listing.className += ' ' + 'listingStore' + ' ' + 'card-mid-item';
    listing.innerHTML = `${logo}
    <div class="neustar-tag rating-tag">
      <span class="metadata-tag-text neustar-tag-text bold03">${neustar}</span>
      <i class="icon-rating-neustar"></i>
    </div>
    <div class="p1-c2col1 ratioPlatinum card-postListing-item-img">
      <div class="galleryContainer">
        ${galleryHTML}
      </div>
    </div>
    
    <div class="c1col2-p2 storeListing-content card-postListing-item-content">
    
      <div class="card-content-header">
        <div class="content-title">
          <span class="bold03">
            ${title}
          </span>
          <span class="text03">
          ${genre} to ${categoryType} in ${region}
          </span>
        </div>
        <div class="data-time">
          <span class="data-time-text text01">2m Read</span>
        </div>
      </div>

      <div class="post-data">
        <div class="tag-collection">
          <div class="post-data">
            ${bestHTML}
          </div>
        </div>
      </div>
      
    </div>
  `; 
}  else if (variant === 'blogs') { ////////////////////BLOGS////////////////////
    listing.className += ' ' + 'listingPosts' + ' ' + 'card-mid-item';
    listing.innerHTML = `${logo}
    <div class="listingPosts-content">
      <div class="c1col2-p2 card-postListing-item-content">

        <div class="data-time">
          <span class="text-single-line">
            <span class="data-time-text text01">${eyebrows}</span>
            <span class="data-time-text text01">${series}</span>
          </span>
        </div>

        <div class="lineH"></div>

        <div class="content-title">
     
          <span class="header04">
            ${title}
          </span>
          <span class="text03">
          ${subtitle}
          </span>
          <span class="text03">
          ${series}
          </span>
        </div>
      </div>

      <div class="post-data">
        <div class="tag-collection">
          <div class="post-data">
          ${bestHTML}
          </div>
        </div>
      </div>
    
  </div>
`; // You should replace '...' with the HTML for posts variant
  } else {
    // Fallback case if the variant is not recognized
    listing.className += ' ' + 'listingPosts' + ' ' + 'card-mid-item';
    listing.innerHTML = `${logo}
    

    <div class="c1col2-p2 card-postListing-item-content">
      <div class="card-content-header">
        <div class="content-title">
          <span class="header04">
            ${title}
          </span>
          <span class="text03">
          ${subtitle}
          </span>
          <span class="paragraph">
          ${region}
          </span>
        </div>
        <div class="data-current">
          <span class="data-time-text text01">2m Read</span>
        </div>
      </div>


      <div class="post-data">
        <div class="tag-collection">
          <div class="nav-list-divider">
            <div class="lineV"></div>
          </div>
          <div class="post-data">
            ${tagsHTML}
          </div>
        </div>
      <div class="lineH"></div>
    </div>
  </div>`; // You should replace '...' with the fallback HTML
  }
 
  return listing;
 }
 
 function generateGalleryHTML(gallery) {
  let galleryHTML = '';
  gallery.slice(0, 3).forEach(galleryItem => {
    // console.log("Processing gallery item:", galleryItem);
    galleryHTML += `

              <img src="${galleryItem.url}" class="galleryItem ratio1x1" alt="" />
    `;
  });
  return galleryHTML;
}




// export function createGeojsonListing(store, onClick) {
//   // console.log("Creating listing for properties:", store); // Add this line
//  if (!store.properties) {
//    return '';
//  }

//  const { region, tag, slug, variant, thumbnail, category, text,location } = store.properties;
//  const tags = tag && tag.length ? tag[0].tags : [];
//  const title = text || [];
//  const locations = location || [];
//  const coordinate = locations.geolocation;
//  const limitedTags03 = tags.slice(0, 3);


//  let tagsHTML = '';
//  limitedTags03.forEach(tag => {
//    tagsHTML += `<div class="metadata-tag">
//                   <span class="metadata-tag-text text01">${tag}</span>
//                 </div>`;
//  });

//  const listing = document.createElement('a');
//  listing.className = 'card-postListing-item';
//  listing.href = '/'+variant+'/'+slug;
// //  listing.addEventListener('click', () => onClick(store));


//  listing.innerHTML = `
//   <div class="p1-c2col1 ratio1x1 card-postListing-item-img">
//     <img class="item-img" src="${thumbnail}" alt="" />
//   </div>

//   <div class="c1col2-p2 card-postListing-item-content">
//     <div class="content-title">
//       <span class="header05">
//         ${title}
//       </span>

//       <span class="paragraph">
//        ${region}
//       </span>
//       </div>

//       <div class="post-data">
//         <div class="tag-collection">
//           <div class="post-data-container">
//             <a href="/dine">
//               <div class="metadata-tag-icon" id="${category.category}">
//                 <i class="icon-${category.category}"></i>
//                 <span class="metadata-tag-divider">
//                   <div class="lineV"></div>
//                 </span>
//                 <span class="metadata-tag-text medium00">
//                   ${category.category}
//                 </span>
//               </div>
//             </a>
//           </div>
//           <div class="nav-list-divider">
//             <div class="lineV"></div>
//           </div>
//           <div class="post-data">
//             ${tagsHTML}
//           </div>
//         </div>
//         <div class="data-time">
//           <span class="data-time-text text01">2m Read</span>
//         </div>

//       <div class="lineH"></div>
//     </div>
//   </div>
//  `;
//       // //   add click event listeners to each store listing
//       // const storeElements = listings.querySelectorAll('.store');
//       // storeElements.forEach((store) => {
//       //   store.addEventListener('click', () => {
//       //         const id = store.dataset.id;
//       //         const marker = markers[id];
//       //         map.flyTo({ center: marker.getLngLat(), zoom: 16 });
     
//       //         // highlight selected store and unhighlight others
//       //         storeElements.forEach((el) => el.classList.remove('active'));
//       //         store.classList.add('active');
//       //     });
//       // });
      
//  return listing;
// }


 

// src/components/GeojsonListing.js
// export function createGeojsonListing(store, map) {
//     const listing = document.createElement('div');
//     listing.className = 'listing';
//     listing.textContent = store.properties.address;
 
//     // Add an icon next to the listing suggestion
//     const icon = document.createElement('span');
//     icon.className = 'listing-icon';
//     icon.textContent = '📍';
//     listing.appendChild(icon);
 
//     const address = document.createElement('span');
//     address.textContent = store.properties.address;
//     listing.appendChild(address);
 
//     // Add event listener to the listing
//     listing.addEventListener('click', () => onClick(store));
 
//     return listing;
//   }




// const CreateListing = (stores) => {
//     // const { name, address, phone } = stores.properties;

//     // render: (properties) => {
//     // const stores = properties.featuress.map((stores, i) => {
//     // const { title, text, address } = stores.properties;
//     // return `
//     //     <div class="store" data-id="${i}"> 
//     //         <h3>${title}</h3>
//     //         <p>${text}</p> 
//     //         <p>${address}</p> 
//     //     </div> 
//     //     ;`
//     //     }).join('');
       

//         const listing = document.createElement('div');
//         listings.className = 'listings';
//         listings.innerHTML = stores;

//         const title = document.createElement('h3');
//         title.textContent = properties.title;
//         listing.appendChild(title);

       
   
//         const text = document.createElement('h3');
//         text.textContent = properties.text;
//         listing.appendChild(text);
   
//         const address = document.createElement('p');
//         address.textContent = properties.address;
//         listing.appendChild(address);
       

//         address
// : 
// "Mission District, San Francisco, CA, USA"
// category
// : 
// "Work"
// text
// : 
// "Mission District Magic: Top Three Coffee Shops to Work in San Francisco's Vibrant Neighborhood"
// series
// : 
// "Neumads Pick"
// slug
// : 
// "ca-san-fransisco-top-three-mission-district"
// snippet
// : 
// undefined
// tags
// : 
// undefined
// thumbnail
// : 
// "https://images.ctfassets.net/i1hcb4885ci0/6hfaVA1TiDdUVILNc4xihv/08e880a99958fcb962655d70f7deb711/The_Neumadic_Trails__Bay_Area_thumbnail.png"
// title
// : 
// "CA, San Fransisco, Top Three, Mission District"
// type
// : 
// "Region"
       
//         // add click event listeners to each store listing
//         // const storeElements = listings.querySelectorAll('.store');
//         // storeElements.forEach((store) => {
//         //     stores.addEventListener('click', () => {
//         //         const id = stores.dataset.id;
//         //         const marker = markers[id];
//         //         map.flyTo({ center: marker.getLngLat(), zoom: 16 });
       
//         //         // highlight selected store and unhighlight others
//         //         storeElements.forEach((el) => el.classList.remove('active'));
//         //         stores.classList.add('active');
//         //     });
//         // });
//         // };
 
//     return listing;
// };
// export default CreateListing;