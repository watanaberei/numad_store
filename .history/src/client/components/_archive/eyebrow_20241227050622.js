import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import { calculateDistance } from "./MapDistance.js";
import * as Geolocate from "./Geolocate.js";

export const eyebrowHero = {
  render: (store) => {
    const storeDistance = store.storeDistance;
    const storeRange = store.storeRange;
    const storeType = store.storeTypes;
    const storeCategories = store.storeCategory;
    const storeRanges = store.storeRange;
    const storeRegions = store.storeRegion;
    const titlePrimary = storeRange + " " + storeCategories;
    console.log("titlePrimary", titlePrimary);
    console.log("store", store);
    const button = element.buttonFloating.render(eyebrowHero.buttonFloating);

    return `    
        <div class="eyebrow-headline">
            <div class="eyebrow">
                <div class="icon-container">
                    <div class="icon"></div>
                </div>
                <div class="text">
                    <div class="title">
                        <span class="text03 bold">
                            ${storeCategories}
                        </span>
                    </div>
                    <div class="subtitle">
                        <span class="text03">
                            ${storeRanges}, 
                        </span>
                        <span class="text03">
                             ${storeType}
                        </span>
                    </div>
                </div>
            </div>
            <div class="label">
                <span class="text03 bold">
                    ${storeDistance}mi Away
                </span>
            </div>
        </div>
        `;
  },
};

// import { format, parseISO } from "date-fns";
// import  *  as element from "./elements";
// import { calculateDistance } from "./mapDistance";

// export const eyebrowHero = {
//     render: ( storeLocation, userLocation, store, storeCategory ) => {
//         const storeDistance = calculateDistance( storeLocation, userLocation );
//         const currentRange = calculateDistance( storeLocation, userLocation );
//         const stores= store;
//         const storeCategories = storeCategory;
//         const button = element.buttonFloating.render(eyebrowHero.buttonFloating);

//         return `
//         <div class="eyebrow-headline">
//             <div class="eyebrow">
//                 <div class="icon-container">
//                     <div class="icon"></div>
//                 </div>
//                 <div class="text">
//                     <div class="title">
//                         <span class="text03 bold">
//                             Nearby
//                         </span>
//                     </div>
//                     <div class="subtitle">
//                         <span class="text03">
//                             Business,
//                         </span>
//                         <span class="text03">
//                              Coffee Shop
//                         </span>
//                     </div>
//                 </div>
//             </div>
//             <div class="label">
//                 <span class="text03 bold">
//                     12mi Away
//                 </span>
//             </div>
//         </div>

//         `;
//     },
// };

// export const title = {
//     render: (title) => {
//         return `
//             <div class="title">
//                 <span class="text03 bold">
//                     ${title}
//                 </span>
//             </div>
//             `;
//         },
//     };

//     export const subtitle = {
//         render: (subtitle) => {
//             return `
//                 <div class="subtitle">
//                     <span class="nearby text02">
//                         ${subtitle.primary}
//                         store.currentRange
//                     </span>
//                     <span class="text02 nearby">
//                         ${subtitle.secondary}
//                         store.store
//                     </span>
//                 </div>
//                 `;
//             },
//         };

//         export const label = {
//             render: (label) => {
//                 return `
//                     <div class="subtitle">
//                         <span class="nearby text02">
//                             ${label}
//                             store.currentRange
//                         </span>
//                     </div>
//                     `;
//                 },
//             };
