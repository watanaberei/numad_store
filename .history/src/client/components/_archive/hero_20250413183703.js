import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import { userControl } from '../controls/_archive/UserControls.js';


export const mediaHero = {
  render: (hero) => {
    const mediaPlatinum = element.mediaPlatinum.render(hero.mediaGallery);
    // console.log("mediaPlatinum", mediaPlatinum);
    const neustarAward = element.neustarAward.render(hero.neustar);
    // console.log("neustarAward", neustarAward);
    // const neustarAnchor = element.neustarAward.render(hero.neustarAnchor);
    // console.log("neustarAnchor", neustarAnchor);
    const button = element.buttonFloating.render(hero.buttonFloating);
    const userControls = userControl.render(333);
    // console.log("labelButton", button);
    const headline = heroHeadline.render({
      headlineText: hero.headlineText,
      locationRegion: hero.locationRegion,
      attributesArrays: hero.attributesArrays,
      storeURL: hero.storeURL,
    });
   
    const detailSnippet = heroDetailSnippet.render({
     
      attributesArrays: hero.attributesArrays,

    });

    return `    
        <div class="ink03 headline">
          ${headline}
        </div>
        <div class="hero-media ratio-platinum">
          <!--<div class="neustar-award-03">
              $ {neustarAward}
          </div>-->
          <div class="button">
              ${button}
          </div>
          <div class="media">
              ${mediaPlatinum}
          </div>
        </div>
        <div class="ink03 tags">
            ${detailSnippet}
        </div>
        ${userControls}

        `;
  },
};

export const heroModule = {
  render: (store) => {
    return `
            <img src="${store}" class="media-img-1-x-1-x-hero">
            </img>
        `;
  },
};

export const neustarContainer = {
  render: (neustar) => {
    return `
                <div class="icon-neustar-container">
                    ${neustar}
                </div>
            `;
  },
};

export const heroHeadline = {
  render: (store) => {
    const header = element.header;
    return `
            <div class="header">
              ${header.render(store.headlineText)}
              <div class="headline">
                <span class="header03">
                    <span class="header03 ink03 primary"> ${store.headlineText}</span>
                    <span class="header03 accent03 secondary"> ${store.locationRegion}</span>
                </span>
              </div>
              <div class="controls">
                ${storeControl.render(store)}
              </div>
            </div>

            `;
  },
};



export const storeControl = {
  render: (store) => {
    return `
        <div class="store-controls">
          <button class="store-controls" id="storeControls-share" onclick="storeActions.shareStore('${store.storeURL}')">
            <i class="icon-action-share-12px"></i>
            <span class="text03">Share</span>
          </button>
          <button class="store-controls" id="storeControls-save" onclick="storeActions.toggleSaveStore('${store.headlineText}')">
            <i class="icon-action-save-12px"></i>
            <span class="text03">Save</span>
          </button>
          <button class="store-controls" id="storeControls-checkin" onclick="storeActions.toggleCheckInStore('${store.headlineText}')">
            <i class="icon-action-checkin-12px"></i>
            <span class="text03">Check-in</span>
          </button>
        </div>
    `;
  },
};

export const heroDetailSnippet = {
  render: (store) => {
    return `
    <div class="ink03 tags">
      ${store.attributesArrays}
    </div>  
    `;
  },
};







//     <style>
//     /* styles rely on the custom attribute "testtes" */
//     .order[testtes="new"] {
//       color: green;
//     }

//     .order[testtes="pending"] {
//       color: blue;
//     }

//     .order[testtes="canceled"] {
//       color: red;
//     }

//     .order[type="header"] {
//       color: red;
//       font-size: 60px;
//       font-weight: bold;
//     }

//     .order[type="title"] {
//       color: red;
//       font-size: 30px;
//       font-weight: bold;
//     }
//     .order[type="body"] {
//       color: red;
//       font-size: px;
//       font-weight: regular;
//     }

//     .order[text="body"] {
//       color: red;
//       display: flex;
//       flex-direction: row;
//     }
//   </style>

//   <div class="order" >
//     <span class="order" type="header">
//       header
//     </span>
//     <span class="order" text="body">
//       <span class="order" type="title">
//           title
//       </span>
//       <span class="order" type="body">
//           body
//       </span>
//     </span>
//   </div>

//   <div class="order" testtes="new">
//     A new order.
//   </div>

//   <div class="order" testtest="pending">
//     A pending order.
//   </div>

//   <div class="order" testtes="canceled">
//     A canceled order.
//   </div>

// export default  {  heroModule, neustarContainer };

// export const imagePlatinumContainer = {
//     render: () => {
//         return `
//         <div class="media-img-container-hero">
//             <div class="media-img-plt-container">
//                 ${ heroModule(store) }
//             </div>
//         </div>
//         `;
//     },
// }

// export const heroModule = {
//   render: (store) => {
//     return `
//             <div class="media-img-1-x-1-x-hero">
//             </div>
//         `;
//     },
// };

// export const imagePlatinumContainer = {
//     render: () => {
//         return `
//         <div class="media-img-container-hero">
//             <div class="media-img-plt-container">
//                 <div class="media-img-1-x-1-x-hero"></div>
//             </div>
//         </div>
//         `;
//     },
// }

// export default { heroModule, imagePlatinumContainer };
