// WorkFeaturedBlog.js
import { format, parseISO } from "date-fns";


const WorkFeaturedBlog = {
  render: (workFeaturedBlog) => {
    
    return `
        <!--FEATURED BLOG--> 
    

            <div class="primary-featured-blog"> 
            
                <div class="primary-featured-blog-img">
                    <a href="/blogs/${workFeaturedBlog.slug}">
                        <img src="${workFeaturedBlog.thumbnail.url}" alt="" />
                    </a>
                </div>
                

                <div class="primary-featured-blog-text">  
                    <div class="featured-blog-header">
                        <a href="/blogs/${workFeaturedBlog.slug}">
                            <div class="featured-blog-header-container">
                                <span class="featured-blog-title-text header04">
                                    ${workFeaturedBlog.title}
                                    <!--${
                                        workFeaturedBlog.title.length > 40 
                                        ? workFeaturedBlog.title.substr(0, 40) + " ..."
                                        : workFeaturedBlog.title
                                    } -->
                                </span> 
                                <span class="featured-blog-overview-text text02">
                                    ${workFeaturedBlog.overview}
                                </span>
                        
                            </div>
                        </a>
                    </div>
            
                    <div class="blog-data">
                        <div class="tag-collection">
                            <div class="featured-blog-data-container">
                                <a href="/dine">
                                    <div class="section-tag" id="${workFeaturedBlog.section}">
                                        <i class="section-tag-icon icon-${workFeaturedBlog.section}"></i>
                                        <span class="section-tag-divider">
                                        <div class="lineV"></div>
                                        </span>
                                        <span class="section-tag-text medium00">
                                            ${workFeaturedBlog.section}
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
                                    <span class="metadata-tag-text text01">${workFeaturedBlog.tag} </span>
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

export default WorkFeaturedBlog;
