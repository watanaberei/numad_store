import { format, parseISO } from "date-fns";
import * as element from "./elements.js";


// export const thumbnail = {
//   render: (img, limit) => {
//   const imgs = img.url;
//    return `
//       <div class="media-img">
//         <img src="${imgs}" class="media-img-1-x-1-x-m2"></img>
//       </div>
//         `;
//       },
//     };


export const thumbnail = {
  render: (media, limit) => {
    let mediaThumbnailHTML = '';
    media.slice(0, limit).forEach((mediaThumbnailItem, index) => {
      const opacityClass = index >= 3 ? 'low-opacity' : '';
      const opacityPeakClass = index >= 3 ? 'low-opacity' : '';
      const opacityOuterClass = index >= 4 ? 'low-opacity' : '';
      mediaThumbnailHTML += `
        <div class="media-img">
          <div class="media-img-1-x-1-x-m"></div>
          <img src="${mediaThumbnailItem.url}" class="media-item"></img>
        </div>
      
      `;
    });
    return mediaThumbnailHTML;
  }
};






  //   function thumbnail(galleryHTML, limit) {
  //     // Parse the galleryHTML string to get the URLs
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(galleryHTML, 'text/html');
  //     const imgElements = Array.from(doc.getElementsByTagName('img'));
  //     const imgs = imgElements.map(img => img.src);
  
  //     // Generate the HTML
  //     let mediaGalleryHTML = '';
  //     imgs.slice(0, limit).forEach((imgs, index) => {
  //         // const opacityClass = index >= 4 ? 'low-opacity' : '';
  //         mediaGalleryHTML += `
  //           <div class="media-img">
  //             <div class="media-img-1-x-1-x-m"></div>
  //             <img src="${imgs}" class="media-img-1-x-1-x-m2"></img>
  //           </div>
  //         `;
  //     });
  //     return mediaGalleryHTML;
  // }
  //////////// THUMBNAIL ////////////

    // export const mediaThumbnail = {
    //   render: (media, limit) => {
    //     let mediaThumbnailHTML = '';
    //     media.slice(0, limit).forEach((mediaThumbnailItem, index) => {
    //       const opacityClass = index >= 3 ? 'low-opacity' : '';
    //       const opacityPeakClass = index >= 3 ? 'low-opacity' : '';
    //       const opacityOuterClass = index >= 4 ? 'low-opacity' : '';
    //       mediaThumbnailHTML += `
    //       <div class="media-img-m ${opacityClass}">
    //         <div class="media-img">
    //           <img src="${mediaThumbnailItem.url}" class="media-img-1-x-1-x-m"></img>
    //         </div>
    //       </div>
    //       `;
    //     });
    //     return mediaThumbnailHTML;
    //   }
    // };

export const mediaImgS = {
  render: (image) => {
    return `
        <div class="media-img-s">
            <div class="media-img-m">
                <div class="media-img">
                    <img src="${img.url}" class="media-img-1-x-1-x-m">
                    </img>
                </div>
           
                    <span class="caption">
                        <div class="icon">
                            <i class="icon-container-${img.title}">
                            </i>
                        </div>
                        <span class="text2">
                            <span class="title">
                                ${img.title}
                            </span>
                            <span class="subtitle">
                                ${img.subtitle}
                            </span>
                        </span>
                    </span>
             
            </div>
        </div>
        `;
  },
};

export const mediaImgM = {
  render: (store) => {
    return `
        <div class="media-img-m">
            <div class="media-img">
                <div class="media-img-1-x-1-x-m"></div>
            </div>
            <div class="text">
                <span class="caption">
                  <div class="icon-container">
                      <div class="icon-container2"></div>
                  </div>
                  <span class="text2">
                      <span class="title"></span>
                      <span class="subtitle"></span>
                  </span>
                </span>
            </div>
        </div>
        `;
  },
};



export const generateMediaCarouselSmall = {
    render: (media, limit) => {
      let mediaGalleryHTML = '';
      media.slice(0, limit).forEach((mediaGalleryItem, index) => {
        const opacityClass = index >= 3 ? 'low-opacity' : '';
        const opacityPeakClass = index >= 3 ? 'low-opacity' : '';
        const opacityOuterClass = index >= 4 ? 'low-opacity' : '';
        mediaGalleryHTML += `
        <div class="media-img-s ${opacityClass}">
          <div class="media-img-container-s">
            <img src="${mediaGalleryItem.url}" class="gallery-item-img media-img-1-x-hx-s-container" alt="" />
          </div>
          <div class="caption-default">
            <span class="caption">
             
                <div class="glyph-inline-12"
                    <i class="ellipse-328"></i>
                </div>
       
        
                <span class="title text03 bold">
                  ${mediaGalleryItem.description}
                </span>                
            
            </span>
          </div>
        </div>`;
      });
      return mediaGalleryHTML;
    }
  };




export const mediaThumbnail = {
  render: (media, limit) => {
    let mediaThumbnailHTML = '';
    media.slice(0, limit).forEach((mediaThumbnailItem, index) => {
      const opacityClass = index >= 3 ? 'low-opacity' : '';
      const opacityPeakClass = index >= 3 ? 'low-opacity' : '';
      const opacityOuterClass = index >= 4 ? 'low-opacity' : '';
      mediaThumbnailHTML += `
      <div class="media-img-m ${opacityClass}">
        <div class="media-img">
          <img src="${mediaThumbnailItem.url}" class="media-img-1-x-1-x-m"></img>
        </div>
      </div>
      `;
    });
    return mediaThumbnailHTML;
  }
};


  
// media.js
// export const generateMediaCarouselSmall = {
//   render: (mediaGallery) => {
//     let mediaGalleryHTML = '';
//     mediaGallery.forEach((mediaGalleryItem, index) => {
//       mediaGalleryHTML += `


//       <div class="media-img-m">
//         <div class="media-img-container-s">
//               <img src="${mediaGalleryItem.url}" class="gallery-item-img media-img-1-x-hx-s-container" alt="" />
//           </div>
//           <div class="caption-default">
//             <div class="caption-container">
//                 <div class="glyph-inline">
//                 <div class="glyph-inline-12">
//                     <div class="glyph-text">
//                     <div class="ellipse-328"></div>
//                     </div>
//                 </div>
//                 </div>
//                 <div class="text-line">
//                 <div class="text-line-12">
//                     <div class="title">
//                     <span class="text03 bold">
//                           ${mediaGalleryItem.description}
//                           </span>
//                           </div>                   
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//       `;
//     });
//     return mediaGalleryHTML;
//   },
//   updateImageOpacities: () => {
//     // Get all images
//     const images = document.querySelectorAll('.media-img-m');

//     // Function to check if an element is in viewport
//     function isInViewport(element) {
//       const rect = element.getBoundingClientRect();
//       return (
//         rect.top >= 0 &&
//         rect.left >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//       );
//     }

//     // Get all images in viewport
//     const imagesInViewport = Array.from(images).filter(isInViewport);

//     // Reset all image opacities
//     images.forEach(img => img.classList.remove('low-opacity'));

//     // Set opacity of fourth image in viewport
//     if (imagesInViewport.length >= 4) {
//       imagesInViewport[3].classList.add('low-opacity');
//     }
//   }
// };


//   // Get all images
// const images = document.querySelectorAll('.media-img-m');

// // Function to check if an element is in viewport
// function isInViewport(element) {
//     const rect = element.getBoundingClientRect();
//     return (
//         rect.top >= 0 &&
//         rect.left >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//     );
// }



  export const generateMediaCarouselLineup = {
    render: (mediaGallery, limit) => {
      let mediaGalleryHTML = '';
      mediaGallery.slice(0, limit).forEach((mediaGalleryItem, index) => {
        const opacityClass = index === 3 ? 'low-opacity' : '';
        mediaGalleryHTML += `

        <div class="media-img-m ${opacityClass}">
            <div class="media-img">
                <img src="${mediaGalleryItem.url}" class="gallery-item-img media-img-1-x-1-x-m" alt="" />
            </div>
            <div class="text2">
                <span class="caption">
                    <span class="icon">
                        <i class="icon-container2"></i>
                    </span>
                    <span class="text03 bold">
                        ${mediaGalleryItem.description}
                    </span>
                </span>
            </div>
        </div>`;
      });
      return mediaGalleryHTML;
    }
  };







// export const generateMediaCarouselHTML = {
//     render: (media, limit) => {
//         const mediaItems = media.slice(0, limit);
//         return `
//         ${mediaItems.map(item => `
//         <div class="media-img-s">
//             <div class="media-img-container-s">
//                 <img src="${mediaItems.url}" class="gallery-item-img "media-img-1-x-hx-s-container" alt="" />
//             </div>
//             <div class="caption-default">
//                 <div class="caption-container">
//                     <div class="glyph-inline">
//                         <div class="glyph-inline-12">
//                         <div class="glyph-text">
//                             <div class="ellipse-328"></div>
//                         </div>
//                         </div>
//                     </div>
//                     <div class="text-line">
//                         <div class="text-line-12">
//                             <div class="title">
//                                 <span class="text03 bold">
//                                     ${mediaItems.description}
//                                 </span>
//                             </div>

//                             <!--
//                                 <div class="copy">
//                                     <div class="text-line-copy-here">Outside</div>
//                                 </div>
//                             -->
                            
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
    
//         `).join('')}
        
//       `;
//     },
// };