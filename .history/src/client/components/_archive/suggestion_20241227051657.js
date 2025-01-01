import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import { calculateDistance } from "./MapDistance.js";
import * as Geolocate from "./Geolocate.js";


export const suggestions = {


  render: (store) => {
    return `
    <div class="item">
        <div class="image">
            <img class="img-store-thumbnail" src="${store.suggestThumbnailURL01}" />
        </div>
        <div class="card-header">
            <div class="frame-21896">
            <div class="header">
                <div class="text">
                <span class="text02 bold">
                    ${store.suggestTitle01}
                </div>
                </div>
                <div class="container">
                    ${store.suggestNeustarHTML01}
                </div>
            </div>
            <div class="subtitle">
                <span class="text02">
                    ${store.suggestStoreDistanceHTML01}
                </span>
                <span class="text02">
                    ${store.suggestGenre01}
                </span>
                <span class="text02 filler">
                    in 
                </span>
                <span class="text02">
                    ${store.suggestRegion01}
                </span>
                
                <!--
                <div class="nearby">Nearby</div>
                <div class="coffee-shop">Coffee Shop</div>
                <div class="in">in</div>
                <div class="cerritos">Cerritos</div>
                <div class="div">:</div>
                <div class="_12-m">12m</div>
                <div class="walk">walk</div>
                -->
            </div>
            <div class="text2">
                <div class="indicator">
                <div class="title">
                        <span class="data-time-text text03">
                            ${store.suggestCurrentStatus01}
                        </span>
                        <!--
                    <span class="text-03">
                    <div class="busy">Busy</div>
                    </div>
                    -->
                </div>
                </div>
                <div class="group-22439">
                <div class="subtitle2">
                        ${store.suggestCurrentHoursHTML01}
                        
                        <!--
                        <div class="open-until">Open until</div>
                        <div class="_8-pm">8PM</div>
                        -->
                </div>
                </div>
            </div>
            </div>
            <div class="array">
            <a class="glyph-15-item-dev">
                <div class="list-item">
                    <span class="text02">
                        ${store.suggestEnvironment01}
                    </span>
                </div>
                <svg
                class="icon-check"
                width="9"
                height="12"
                viewBox="0 0 9 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.11702 9.1103L1.03447 6.92379L0.689627 6.56174L-1.42029e-07 7.2859L0.344841 7.64796L2.74993 10.1731L3.09477 10.5352L3.11711 10.5117L3.13936 10.5351L3.4842 10.173L8.05415 5.37495L8.39899 5.0129L7.70936 4.28873L7.36452 4.65079L3.11702 9.1103Z"
                    fill="#25AF20"
                />
                </svg>
            </a>
            <a class="glyph-15-item-dev">
                <div class="list-item">
                    <span class="text02">
                        ${store.suggestNoiseLevel01}
                    </span>
                </div>
                <svg
                class="icon-check2"
                width="9"
                height="12"
                viewBox="0 0 9 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.61702 9.1103L1.53447 6.92379L1.18963 6.56174L0.5 7.2859L0.844841 7.64796L3.24993 10.1731L3.59477 10.5352L3.61711 10.5117L3.63936 10.5351L3.9842 10.173L8.55415 5.37495L8.89899 5.0129L8.20936 4.28873L7.86452 4.65079L3.61702 9.1103Z"
                    fill="#25AF20"
                />
                </svg>
            </a>
            <a class="glyph-15-item-dev">
                <div class="list-item">
                    <span class="text02">
                        ${store.suggestParking01s}
                    </span>
                </div>
                <svg
                class="icon-check3"
                width="9"
                height="12"
                viewBox="0 0 9 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.11702 9.1103L1.03447 6.92379L0.689627 6.56174L-1.42029e-07 7.2859L0.344841 7.64796L2.74993 10.1731L3.09477 10.5352L3.11711 10.5117L3.13936 10.5351L3.4842 10.173L8.05415 5.37495L8.39899 5.0129L7.70936 4.28873L7.36452 4.65079L3.11702 9.1103Z"
                    fill="#25AF20"
                />
                </svg>
            </a>
            </div>
        </div>
    </div>`;
  },
};

export default suggestions;
