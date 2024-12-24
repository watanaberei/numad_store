//UnwindBlog.js
import { format, parseISO } from "date-fns";

const UnwindBlog = {
  render: (unwindBlog) => {
    return `
        <!--FEATURED BLOG--> 
        <div class="blog"> 
            <div class="blog-img">
              <a href="/blogs/${unwindBlog.slug}">
              <img src="${unwindBlog.thumbnail.url}" alt="" /></a>
            </div>
            <div class="blog-text">
              <div class="blog-header">
                <a href="/blogs/${unwindBlog.slug}">
                  <div class="blog-header-container">
                    <span class="blog-title-text bold03">
                    ${
                        unwindBlog.title.length > 90
                        ? unwindBlog.title.substr(0, 90) + " ..."
                        : unwindBlog.title
                    } 
                    </span> 
                    <span class="blog-overview-text text02">
                      ${unwindBlog.overview}
                    </span>
                  </div>
                </a>
              </div>
        

                <div class="blog-data">
                    <div class="tag-collection">
                        <div class="featured-blog-data-container">
                            <a href="/dine">
                                <div class="section-tag" id="${unwindBlog.section}">
                                    <i class="section-tag-icon icon-${unwindBlog.section}"></i>
                                    <span class="section-tag-divider">
                                    <div class="lineV"></div>
                                    </span>
                                    <span class="section-tag-text medium00">
                                        ${unwindBlog.section}
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
                                <span class="metadata-tag-text text01">${unwindBlog.tag} </span>
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

export default UnwindBlog;
