import { format, parseISO } from "date-fns";

const createMapCard = {

  render: (storeData) => {
    return `
    <div class="p1-c2col1 ratioPlatinum card-postListing-item-img">
        <div class="galleryContainer">
        ${storeData.galleryHTML}
        </div>
    </div>

    <div class="c1col2-p2 storeListing-content card-postListing-item-content">
    
        <div class="card-content-header">
        <div class="content-title">
            <span class="text03 bold">
            ${storeData.title}
            </span>
            <span class="text03 bold icon-neustar-container">
            ${storeData.neustarHTML}
        </span>
            
        <div class="content-details"> 

            <div class="content-details-item" id="storeDetails">
                <span class="text02">
               Current:
               <div class="store-status">
               ${storeData.storeCurrentStatus}
           </div>
                </span>
                <span class="text02">
                    ${storeData.genre}
                </span>
                <span class="text02 filler">
                    in 
                </span>
                <span class="text02">
                    ${storeData.region}
                </span>
            </div>

            <div class="content-summary">
                <div class="content-summary-item" id="environment">
                    <span class="text02">
                        ${storeData.environment}
                    </span>
                </div>
                <div class="content-summary-filler">
                    <span class="text02">
                        ,
                    </span>
                </div>
                <div class="content-summary-item" id="noiseLevel">
                    <span class="text02">
                        ${storeData.noiseLevel}
                    </span>
                </div>
                <div class="content-summary-filler">
                    <span class="text02">
                        in
                    </span>
                </div>
                <div class="content-summary-item" id="parking">
                    <span class="text02">
                        ${storeData.parking[0]}
                    </span>
                </div>
            </div>

        </div>

        </div>
            <div class="data-time">
                <span class="data-time-text text01">12m</span>
            </div>
        </div>

        <div class="post-data">
            <div class="tag-collection">
                <div class="post-data">
                    ${storeData.bestHTML}
                </div>
            </div>
        </div>
    
    </div>`;
  },
};

export default createMapCard;
