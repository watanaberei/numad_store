// src/screens/ArticleScreen.js
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils.js";
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../api.js";
import DataBlog from "../components/DataPost";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
      // Adjust the code as per your actual data structure and needs
    },
    [INLINES.HYPERLINK]: (node, next) => {
      // Adjust the code as per your actual data structure and needs
    },
    [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
      // Adjust the code as per your actual data structure and needs
    },
  },
};

let dataBlog = new DataBlog();

const ArticleScreen = {
  render: async () => {
    const request = parseRequestUrl();
    const articleDetails = await dataBlog.getData();
    // Filter the articles based on the slug from the URL
    const article = articleDetails.find((article) => article.slug === request.slug);
    // console.log("article",article);
    const tags = article.tag && article.tag.length ? article.tag[0].tags : [];
    // console.log("Header tags",tags);


   
    // console.log("tag",tags);
    const limitedTags03 = tags.slice(0, 3);
    // console.log("limitedTags03",limitedTags03);
    let tagsHTML = '';
    limitedTags03.forEach(tags => {
      tagsHTML += `<div class="metadata-tag">
                     <span class="metadata-tag-text text01">${tags}</span>
                   </div>`;
    });
    // const tagsHTML = allTags(limitedTags03);
    // console.log("tagsHTML",tagsHTML);
    // if (!article) {
    //   return `<div>Article not found</div>`;
    // }
    if (!article) {
      console.log(`No article found with slug: ${request.slug}`);
    } else {
      console.log(`Article found:`, article);
      console.log(`Slug:`, article.slug);
    }

    return `
      <!--ARTICLESCREEN-->
      <div class="main">
      ARTICLEEEEEEEs

          
        <!-- /// ARTICLE CONTENT /// -->
          <div class="article-detail">
            <div class="article-container">


            
              <section class="article-hero">
              
                <div class="top fullBleedContent">
                  <div class="fullBleedContentHeader">
                    <div class="fullBleedContentHeaderContainer">
                      <div class="featured-image">
                      
                        <img src="${article.media.hero}" alt="" />
                    
                      </div>                    
                    </div>
                  </div>
                </div>
                
                <div class="article-headline">
                  <div class="article-header">
                    <div class="article-header">

                      <div class="article-title">
                        <span class="text02">
                          ${article.series.series}
                        </span>
                        <span class="header06">
                          ${article.headline.text}
                        </span>
                      </div>

                      <div class="article-subtext">
                        <span class="text03">
                          ${article.snippet.text}
                        </span>
                      </div>

                      <div class="blog-data">
                        <div class="tag-collection">
                          <div class="featured-blog-data-container">
                              <a href="/dine">
                                  <div class="section-tag" id="${article.category.category}">
                                    <i class="section-tag-icon icon-${article.category.category}"></i>
                                    <span class="section-tag-divider">
                                    <div class="lineV"></div>
                                    </span>
                                    <a href="/${article.category.category}">
                                      <span class="section-tag-text medium00">
                                          ${article.category.category}
                                      </span>
                                    </a>
                                  </div>
                                </a>
                            </div>
                            <div class="nav-list-divider">
                                <div class="lineV">
                                </div>
                            </div>
              
                            <div class="blog-data">
                                
                                ${tagsHTML}
                                    
                            </div>   
                        </div>
                        <div class="data-time">
                            <span class="data-time-text text01">2m Read</span>
                        </div>
                    </div>

                    </div>
                  </div>
                </div>
              </section>

         


                <section class="article-introduction">
                  <div class="article-introduction-content">
                    <div class="article-overview">
                      <span class="text05">
                        ${article.snippet.subtext}
                      </span>
                    </div>
                    <div class="lineH"></div>
                    <div class="blog-data">
                      <div class="tag-collection">
                          
                        <div class="featured-blog-data-container">
                            <a href="/${article.category}">
                                <div class="section-tag" id="${article.category}">
                                    <i class="section-tag-icon icon-${article.category}"></i>
                                    <span class="section-tag-divider">
                                    <div class="lineV"></div>
                                    </span>
                                    <span class="section-tag-text medium00">
                                        ${article.category}
                                    </span>
                                </div>
                            </a>
                        </div>
                            
                    
                        <div class="nav-list-divider">
                            <div class="lineV">
                            </div>
                        </div>

                        
                        <div class="featured-blog-data-container">
                            <div class="metadata-tag">
                                <span class="metadata-tag-text text01">${article.tag}</span>
                            </div>   
                        </div>    
                      </div>
                      <div class="data-time">
                          <span class="data-time-text text01">2m Read</span>
                      </div>
                    </div>
                    
                    <!-- //INTRODUCTION// -->
                    <div class="lineH"></div>
                    
                    <div class="content">
                      <div class="article-content">
                        <span class="text04">
                          ${article.content.introduction}
                        </span>
                      </div>
                    </div>
                    <!-- //INTRODUCTION// -->


                    <!-- //STORES// -->
                    <div class="lineH"></div>
                    
                    <div class="content">
                      <div class="article-content">
                        <span class="text04">
                          ${article.content.stores}
                        </span>
                      </div>
                    </div>
                    <!-- //STORES// -->


                    <!-- //SUMMARY// -->
                    <div class="article-content">
                        
                        <span class="text03">
                          Summary:
                        </span>
                        <ul class="summary-container">  
                          
                          ${Array.isArray(article.summary.text) ? article.summary.text.map(text => `
                            <li class="summary-item">
                              <span class="text04">   
                                — ${text}
                              </span>
                            </li>
                          `).join('') : ''}
                        </ul>
                    </div>
                    <!-- //SUMMARY// -->
                    
                  </div>
                  <!-- /// HEADER MAIN /// -->


                

                    










                  <!-- /// HEADER SIDEPANEL /// -->
                  <div class="content article-sidepanel">
                    <div class="article-content">
                      <span class="header03">
                        Related Articles
                      </span>

                      <!--TAGS-->
                      <div class="article-info d-flex">
                        <a href="/${article.author.slug}">
                          <div class="article-author">
                            <span class="d-flex text01">
                                ${article.author.name}
                              </span>
                            <span class="d-flex text01">
                                "${article.author.social}"
                              </span>
                          </div>
                        </a>
                      </div>
                      <!--END OF TAGS-->
                      
                    </div>
                  </div>
                    <!-- /// HEADER CONTENT /// -->
                </section>




                <!--ADVERTISEMENT-->
                <div class="content content-advertisement content-advertistment-details">
                  <div class="ad-container container">
                    <div class="ad d-flex" id="ad-home">
                      <a href="/">
                        <img src="./images/ad_test.png" />
                      </a>
                    </div>
                  </div>
                </div>
                <!--ADVERTISEMENT-->






              
                <!-- /// ARTICLE BODY /// -->
                <section class="article-body">    

                  <!-- /// ARTICLE CONTENT /// -->
                  <div class="content">
                    <div class="article-content">
                      <span class="text03">
                        ${article.content.body}
                      </span>
                    </div>
                    <div class="article-content">
                      <span class="text03">
                      ${article.content.conclusion}
                      </span>
                    </div>
                    <div class="article-content">
                      <span class="text03">
                      ${article.content.postscript}
                      </span>
                    </div>
                  </div>
                  <!-- /// ARTICLE CONTENT /// -->








                  <!-- /// ARTICLE SIDEPANEL /// -->
                  <div class="content">
                    <div class="article-content">
                      <span class="header03">
                        Related Articles
                      </span>

                      <!-- /// RELATED REFERENCES /// -->
                      <div class="primary-featured-blog-references">
                        $   {referencesHTML}
                      </div>
                      
                      
                    </div>
                  </div>
                  <!-- /// ARTICLE CONTENT /// -->









                    </div>

              </section>
              <!-- /// ARTICLE BODY /// -->

              

              <!--
              <div class="side-ad">
                <div class="lineH"></div>
                <a href="#" class="vertical-ad">
                  <img src="/images/side-ad.svg"/>
                </a>
              </div>
              -->

            </div>
          </div>
          `;
        },
        after_render: () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        },
      };
export default ArticleScreen;
