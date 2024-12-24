// card-blog.js
import { format, parseISO } from "date-fns";


const createBlogCard = {

  render: (blogData) => {
    return `
    <div class="ratio1x2 overlay-top-text overlay-full-gradient">
      <div class="p1-c2col1 ratio1x2 card-blogListing-img">
          <img class="item-img blogs-item-img" src="${blogData.thumbnail}" alt="" />
      </div>
      <div class="blog-content content card-blogs-item-content ratio1x2 overlay-full-text overlay-full-gradient">
        <div class="content blog-content-container p1-c2col1 overlay-img-text">
            <div class="content-container">
                <div class="content-main">
                    <div class="content-header">
                        <div class="content-label">
                            <div class="content-label-eyebrow">
                                <span class="text02">
                                    ${blogData.seriesName}
                                </span>
                            </div>
                            <div class="content-label-date">
                                <span class="text02">
                                    2w ago
                                    <!--$ {blogData.publishedAt}-->
                                </span>
                            </div>
                        </div>
                    </div> 
                
                </div>    
                <div class="content-secondary">
                    <div class="content-title">

                        <span class="text03 bold">${blogData.title}</span>
                        <div class="content-details-item" id="storeDetails">
                            <span class="text02">
                                ${blogData.genre}
                            </span>
                            <span class="text02 filler">
                                in 
                            </span>
                            <span class="text02">
                                ${blogData.region}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    },
};

export default createBlogCard;
