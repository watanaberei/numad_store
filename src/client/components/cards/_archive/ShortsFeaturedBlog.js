// ShortsFeaturedBlog.js
import { format, parseISO } from "date-fns";


const ShortsFeaturedBlog = {
  render: (shortsFeaturedBlog) => {
    
    return `
        <!--FEATURED BLOG--> 
        

            <div class="primary-featured-blog"> 
                <div class="primary-featured-blog-img">
                    <a href="/blogs/${shortsFeaturedBlog.slug}">
                        <img src="${shortsFeaturedBlog.thumbnail.url}" alt="" />
                    </a>                    
                </div>

                <div class="primary-featured-blog-text">  
                    <div class="featured-blog-header">
                        <a href="/blogs/${shortsFeaturedBlog.slug}">
                            <div class="featured-blog-header-container">
                                <span class="featured-blog-title-text header01">
                                    ${shortsFeaturedBlog.title}
                                    <!--${
                                        shortsFeaturedBlog.title.length > 40 
                                        ? shortsFeaturedBlog.title.substr(0, 40) + " ..."
                                        : shortsFeaturedBlog.title
                                    } -->
                                </span> 
                                <span class="featured-blog-overview-text text02">
                                    ${shortsFeaturedBlog.overview}
                                </span>
                        
                            </div>
                        </a>    
                    </div>
            
                    <div class="blog-data">
                        <div class="tag-collection">
                            <div class="featured-blog-data-container">
                                <a href="/dine">
                                    <div class="section-tag" id="${shortsFeaturedBlog.section}">
                                        <i class="section-tag-icon icon-${shortsFeaturedBlog.section}"></i>
                                        <span class="section-tag-divider">
                                        <div class="lineV"></div>
                                        </span>
                                        <span class="section-tag-text medium00">
                                            ${shortsFeaturedBlog.section}
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
                                    <span class="metadata-tag-text text01">${shortsFeaturedBlog.tag} </span>
                                </div>   
                            </div>   
                        </div>
                        <div class="data-time">
                            <span class="data-time-text text01">2m Read</span>
                        </div>
                    </div>
                </div>
                <div class="lineH"></div>
            </div>

        </a>`;
  },
};

export default ShortsFeaturedBlog;
