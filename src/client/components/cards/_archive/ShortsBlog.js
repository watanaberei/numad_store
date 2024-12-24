// ShortsBlog.js
import { format, parseISO } from "date-fns";

const ShortsBlog = {
  render: (shortsBlog) => {
    return `
        <!--FEATURED BLOG--> 
        <div class="blog"> 
            <div class="blog-img">
              <a href="/blogs/${shortsBlog.slug}">
              <img src="${shortsBlog.thumbnail.url}" alt="" /></a>
            </div>
            <div class="blog-text">
              <div class="blog-header">
                <a href="/blogs/${shortsBlog.slug}">
                  <div class="blog-header-container">
                    <span class="blog-title-text bold03">
                    ${
                        shortsBlog.title.length > 90
                        ? shortsBlog.title.substr(0, 90) + " ..."
                        : shortsBlog.title
                    } 
                    </span> 
                    <span class="blog-overview-text text02">
                      ${shortsBlog.overview}
                    </span>
                  </div>
                </a>
              </div>
        

                <div class="blog-data">
                    <div class="tag-collection">
                        <div class="featured-blog-data-container">
                            <a href="/dine">
                                <div class="section-tag" id="${shortsBlog.section}">
                                    <i class="section-tag-icon icon-${shortsBlog.section}"></i>
                                    <span class="section-tag-divider">
                                    <div class="lineV"></div>
                                    </span>
                                    <span class="section-tag-text medium00">
                                        ${shortsBlog.section}
                                    </span>
                                </div>
                            </a>
                        </div>
                        <div class="nav-list-divider">
                            <div class="lineV">
                            </div>
                        </div>

                        <div class="blog-data-container">
                            <div class="metadata-tag">
                                <span class="metadata-tag-text text01">${shortsBlog.tag} </span>
                            </div>   
                        </div>   
                    </div>
                    <div class="data-time">
                        <span class="data-time-text text01">2m Read</span>
                    </div>
                </div>
              

            </div>
            <div class="lineH"></div>
          </div>`;
  },
};

export default ShortsBlog;
