// src/screens/ReviewScreens.js
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

const ReviewScreen = {
  render: async () => {
    const request = parseRequestUrl();
    const reviewDetails = await getStoresNeumadsReview();
    const review = reviewDetails.find((article) => article.slug === request.slug);
    console.log("reviewDetails01",review);


    // Filter the articles based on the slug from the URL
    const article = reviewDetails.find((article) => article.slug === request.slug);

    // Filter the articles based on the slug from the URL
    const slug = reviewDetails.slug;
    console.log("reviewDetails",reviewDetails);
    console.log("review",review);
    console.log("slug",slug);
    if (!review) {
        console.log(`No review found with slug: ${request.slug}`);
      } else {
        console.log(`Review found:`, review);
        console.log(`Slug:`, review.slug);
      }

    return `
      <!--REVIEWSCREEN-->
      <div class="main">
      REVIEWEEEEEEs

          
        <!-- /// REVIEW CONTENT /// -->
          <div class="review-detail">
            <div class="review-container">


            
              <section class="review-hero">
              
                <div class="top fullBleedContent">
                  <div class="fullBleedContentHeader">
                    <div class="fullBleedContentHeaderContainer">
                      <div class="featured-image">
                      
                        <img src="{review.media.hero}" alt="" />
                    
                      </div>                    
                    </div>
                  </div>
                </div>
                
                <div class="review-headline">
                  <div class="review-header">
                    <div class="review-header">

                      <div class="review-title">
                        <span class="text02">
                          {review.series.series}
                        </span>
                        <span class="header06">
                          {review.headline.text}
                        </span>
                      </div>

                      <div class="review-subtext">
                        <span class="text03">
                          {review.snippet.text}
                        </span>
                      </div>

                      <div class="blog-data">
                        <div class="tag-collection">
                          <div class="featured-blog-data-container">
                              <a href="/dine">
                                  <div class="section-tag" id="{review.category.category}">
                                    <i class="section-tag-icon icon-{review.category.category}"></i>
                                    <span class="section-tag-divider">
                                    <div class="lineV"></div>
                                    </span>
                                    <a href="/{review.category.category}">
                                      <span class="section-tag-text medium00">
                                          {review.category.category}
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
                                
                                {tagsHTML}
                                    
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

         


                <section class="review-introduction">
                  <div class="review-introduction-content">
                    <div class="review-overview">
                      <span class="text05">
                        {review.snippet.subtext}
                      </span>
                    </div>
                    <div class="lineH"></div>
                    <div class="blog-data">
                      <div class="tag-collection">
                          
                        <div class="featured-blog-data-container">
                            <a href="/{review.category}">
                                <div class="section-tag" id="{review.category}">
                                    <i class="section-tag-icon icon-{review.category}"></i>
                                    <span class="section-tag-divider">
                                    <div class="lineV"></div>
                                    </span>
                                    <span class="section-tag-text medium00">
                                        {review.category}
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
                                <span class="metadata-tag-text text01">{review.tag}</span>
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
                      <div class="review-content">
                        <span class="text04">
                          {review.content.introduction}
                        </span>
                      </div>
                    </div>
                    <!-- //INTRODUCTION// -->


                    <!-- //REVIEWS// -->
                    <div class="lineH"></div>
                    
                    <div class="content">
                      <div class="review-content">
                        <span class="text04">
                          {review.content.stores}
                        </span>
                      </div>
                    </div>
                    <!-- //REVIEWS// -->


                    <!-- //SUMMARY// -->
                    <div class="review-content">
                        
                        <span class="text03">
                          Summary:
                        </span>
                        <ul class="summary-container">  
                          
                        {Array.isArray(review.summary.text) ? review.summary.text.map(text => 
                        <li class="summary-item">
                          <span class="text04">   
                            — {text}
                          </span>
                        </li>
                      ).join('') : ''}
                        </ul>
                    </div>
                    <!-- //SUMMARY// -->
                    
                  </div>
                  <!-- /// HEADER MAIN /// -->


                

                    










                  <!-- /// HEADER SIDEPANEL /// -->
                  <div class="content review-sidepanel">
                    <div class="review-content">
                      <span class="header03">
                        Related Reviews
                      </span>

                      <!--TAGS-->
                      <div class="review-info d-flex">
                        <a href="/{review.author.slug}">
                          <div class="review-author">
                            <span class="d-flex text01">
                                {review.author.name}
                              </span>
                            <span class="d-flex text01">
                                "{review.author.social}"
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






              
                <!-- /// REVIEW BODY /// -->
                <section class="review-body">    

                  <!-- /// REVIEW CONTENT /// -->
                  <div class="content">
                    <div class="review-content">
                      <span class="text03">
                        {review.content.body}
                      </span>
                    </div>
                    <div class="review-content">
                      <span class="text03">
                      {review.content.conclusion}
                      </span>
                    </div>
                    <div class="review-content">
                      <span class="text03">
                      {review.content.postscript}
                      </span>
                    </div>
                  </div>
                  <!-- /// REVIEW CONTENT /// -->








                  <!-- /// REVIEW SIDEPANEL /// -->
                  <div class="content">
                    <div class="review-content">
                      <span class="header03">
                        Related Reviews
                      </span>

                      <!-- /// RELATED REFERENCES /// -->
                      <div class="primary-featured-blog-references">
                        $   {referencesHTML}
                      </div>
                      
                      
                    </div>
                  </div>
                  <!-- /// REVIEW CONTENT /// -->









                    </div>

              </section>
              <!-- /// REVIEW BODY /// -->

              

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
export default ReviewScreen;
