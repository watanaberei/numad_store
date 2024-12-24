// card-article.js
import { format, parseISO } from "date-fns";


const createArticleCard = {

  render: (articleData) => {
    return `
    <div class="p1-c2col1 ratio1x1 card-articleListing-img">
        <img class="item-img articles-item-img" src="${articleData.thumbnail}" alt="" />
    </div>
    <div class="article-content content card-articles-item-content ratio1x1">
        <div class="content article-content-container p1-c2col1">
            <div class="content-container">
                <div class="content-main">
                    <div class="content-header">
                        <div class="content-label">
                            <div class="content-label-eyebrow">
                                <span class="text02">
                                    ${articleData.seriesName}
                                </span>
                            </div>
                            <div class="content-label-date">
                                <span class="text02">
                                    2w ago
                                    <!--$ {articleData.publishedAt}-->
                                </span>
                            </div>
                        </div>
                        <div class="content-title">

                            <span class="text03 bold">${articleData.title}</span>
                            <div class="content-details-item" id="storeDetails">
                                <span class="text02">
                                    ${articleData.genre}
                                </span>
                                <span class="text02 filler">
                                    in 
                                </span>
                                <span class="text02">
                                    ${articleData.region}
                                </span>
                            </div>
                        </div>
                    </div> 
                
                </div>    
                <div class="content-secondary">
                    <div class="post-data">
                        <div class="tag-collection">
                            <div class="post-data">
                                ${articleData.bestHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    },
};

export default createArticleCard;
