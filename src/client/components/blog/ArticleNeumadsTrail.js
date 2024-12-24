// ArticleNeumadsTrail.js
import { format, parseISO } from "date-fns";

const ArticleNeumadsTrail = {
  render: (articleNeumadsTrail) => {
   

    return `
      <div class="article-card">
        <div class="article-card-image">
          <a href="/article/${articleNeumadsTrail.slug}">
            <img src="${articleNeumadsTrail.thumbnail}" alt="" />
          </a>
        </div>
        
        <div class="primary-featured-blog-text">  
            <div class="featured-blog-header">
                <a href="/${articleNeumadsTrail.slug}">
                    <div class="featured-blog-header-container">
                        <span class="featured-blog-title-text header04">
                            ${articleNeumadsTrail.title}
                        </span> 
                        <span class="featured-blog-overview-text text02">
                            ${articleNeumadsTrail.subtext}
                        </span>
                
                    </div>
                </a>
            </div>
            <div class="blog-data">
            <div class="tag-collection">
                <div class="featured-blog-data-container">
                    <a href="/dine">
                        <div class="section-tag" id="${articleNeumadsTrail.section}">
                            <i class="section-tag-icon icon-${articleNeumadsTrail.section}"></i>
                            <span class="section-tag-divider">
                            <div class="lineV"></div>
                            </span>
                            <span class="section-tag-text medium00">
                                ${articleNeumadsTrail.section}
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
                        <span class="metadata-tag-text text01">${tagsCollection.tags}</span>
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
  // Rest of the code...
};

export default ArticleNeumadsTrail;