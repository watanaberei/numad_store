import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils.js";
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../api.js";
import DataBlog from "../components/DataPost";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
      if (node.data.target.sys.contentType.sys.id === "codeBlock") {
        return `<pre>
            <code>${node.data.target.fields.code}</code>
          </pre>`;
      }

      if (node.data.target.sys.contentType.sys.id === "videoEmbed") {
        return `<iframe
            src='${node.data.target.fields.embedUrl}'
            height='100%'
            width='100%'
            frameBorder='0'
            scrolling='no'
            title='${node.data.target.fields.title}'
            allowFullScreen=true
          />`;
      }
    },
    [INLINES.HYPERLINK]: (node, next) => {
      if (node.data.uri.includes("player.vimeo.com/video")) {
        return `<div class="iframe-container">
            <iframe
              title="${next(node.content)}"
              src="${node.data.uri}"
              frameBorder='0'
              allowFullScreen
            ></iframe>
          </div>`;
      } else if (node.data.uri.includes("youtube.com/embed")) {
        return `<div class="iframe-container">
            <iframe
              title="${next(node.content)}"
              src="${node.data.uri}"
              allow='accelerometer; encrypted-media; gyroscope; picture-in-picture'
              frameBorder='0'
              allowFullScreen
            ></iframe>
          </div>`;
      } else {
        return `<span class="color">
        <a href="${node.data.uri}">${next(node.content)}</a>
        </span>`;
      }
    },
    [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
      return `<div class="content-img"><img
          src="https:${node.data.target.fields.file.url}"
          height="${node.data.target.fields.file.details.image.height}"
          width="${node.data.target.fields.file.details.image.width}"
          alt="${node.data.target.fields.description}"
        /></div>`;
    },
  },
};

let dataBlog = new DataBlog();

const DetailsScreen = {
  render: async () => {
    const request = parseRequestUrl();
    const blogDetails = await dataBlog.getData();
    const blog = blogDetails.find((blog) => blog.slug === request.slug);
    if (!blog) {
      return `<div>Blog not found</div>`;
    }
    // console.log(blogDetails);
    return `
        <div class="main">
        BLOGGGGGGGG
          <div class="blog-detail">
            <!--
            <div class="side-ad">
              <div class="lineH"></div>
              <a href="#" class="vertical-ad">
              <img src="/images/side-ad.svg"/>
              </a>
            </div>
            -->

            <div class="article-container">
            


              <!-- /// ARTICLE IMAGE FEATURED /// -->
              <div class="top fullBleedContent">
                <div class="fullBleedContentHeader">
                  <div class="fullBleedContentHeaderContainer">
                    <div class="featured-image">
                      <img src="https:${blog.featuredImage}" alt="" />
                    </div>                    
                  </div>
                </div>
              </div>
              

              
              <!-- /// ARTICLE HEADER /// -->
              <section class="article-headline">
                <div class="article-header">
                  <div class="article-title">
                    <span class="display04">
                      ${blog.title}
                    </span>
                  </div>
                  <div class="article-overview">
                    <span class="text03">
                        ${blog.overview}
                    </span>
                  </div>

                  <div class="lineH"></div>
                  <div class="blog-data">
                  <div class="tag-collection">
                      <div class="featured-blog-data-container">
                          <a href="/${blog.section}">
                              <div class="section-tag" id="${blog.section}">
                                  <i class="section-tag-icon icon-${blog.section}"></i>
                                  <span class="section-tag-divider">
                                  <div class="lineV"></div>
                                  </span>
                                  <span class="section-tag-text medium00">
                                      ${blog.section}
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
                              <span class="metadata-tag-text text01">${blog.tag} </span>
                          </div>   
                      </div>   
                  </div>

                  
                  <div class="data-time">
                      <span class="data-time-text text01">2m Read</span>
                  </div>
              </div>

                  <!-- /// ARTICLE CONTENT /// -->
                  <div class="content">
                    <div class="article-content">
                      <span class="text03">
                        ${blog.introduction}
                      </span>
                    </div>
                  </div>
                  <!-- /// ARTICLE CONTENT /// -->


                 
                </div>
                <div class="article-info d-flex">
                  <span class="d-flex text01"
                    ><i class="bx bx-user"></i> ${blog.authorName}</span>
                  <span class="d-flex text01">
                    <i class="bx bx-time-five"></i> 
                    ${format(parseISO(blog.createdAt),"PPP")}
                  </span>
                </div>
                <div class="lineH"></div>
                
              </section>

              <!-- /// Advertisement /// -->
              <div class="content  content-advertisement content-advertistment-details">
                <div class="ad-container container">
                  <div class="ad d-flex" id="ad-home">
                    <a href="/">
                      <img src="./images/ad_test.png" />
                    </a>
                  </div>
                </div>
              </div>
              <!-- /// ADVERTISEMENT /// --> 

              <!-- /// ARTICLE BODY /// -->
              <section class="article-body">    

                <!-- /// ARTICLE CONTENT /// -->
                <div class="content">
                  <div class="article-content">
                    <span class="text03">
                    ${documentToHtmlString(blog.details, renderOptions)}
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
                  </div>
                </div>
                <!-- /// ARTICLE CONTENT /// -->

              </section>
              <!-- /// ARTICLE BODY /// -->

            </div>

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
    export default DetailsScreen;