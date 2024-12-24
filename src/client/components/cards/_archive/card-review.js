// card-review.js
import { format, parseISO } from "date-fns";

const createReviewCard = {
  render: (reviewData) => {
    return `
    <div class="p1-c2col1 ratioPlatinum card-review-item-img">
        <img class="item-img review-item-img" src="${reviewData.thumbnail}" alt="" />
    </div>
    <div class="review-content content card-review-item-content">
        <div class="store-logo-img">
            <img class="item-img" src="${reviewData.logo}" alt="" />
        </div>
        <div class="content review-content-container p1-c2col1">
            <div class="content-container">
                <div class="content-main">
                    <div class="content-title">
                        <span class="text03 bold">${reviewData.title}</span>

                        <!--NEUSCORE PLACEHOLDER STARTS-->
                        <span class="icon-neustar-container">
                         ${reviewData.neustarHTML}
                        </span>
                        <!--NEUSCORE PLACEHOLDER END-->

                    </div>
                    <div class="content-details">
                        <div class="content-details-item" id="storeCurrentStatus">
                            <span class="text02">
                                {storeCurrentStatus}
                            </span>
                        </div>
                        <div class="content-details-item" id="storeDetails">
                            <span class="text02">
                                ${reviewData.genre}
                            </span>
                            <span class="text02 filler">
                                in 
                            </span>
                            <span class="text02">
                                ${reviewData.region}
                            </span>
                        </div>
                        <div class="content-details-item" id="storeCurrentHours">
                            <span class="text02">
                                {storeCurrentHours}
                            </span>
                        </div>
                        <div class="content-summary">
                            <div class="content-summary-item" id="environment">
                                <span class="text02">
                                    ${reviewData.environment}
                                </span>
                            </div>
                            <div class="content-summary-filler">
                                <span class="text02">
                                    in
                                </span>
                            </div>
                            <div class="content-summary-item" id="noiseLevel">
                                <span class="text02">
                                    ${reviewData.noiseLevel}
                                </span>
                            </div>
                            <div class="content-summary-filler">
                                <span class="text02">
                                    in
                                </span>
                            </div>
                            <div class="content-summary-item" id="parking">
                                <span class="text02">
                                    ${reviewData.parking}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-secondary">
                    <div class="post-data">
                        <div class="tag-collection">
                            <div class="post-data">
                                ${reviewData.bestHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  },
};

export default createReviewCard;
