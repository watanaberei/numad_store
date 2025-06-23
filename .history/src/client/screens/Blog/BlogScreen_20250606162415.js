// src/screens/BlogScreen.js
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../../utils/utils.js";
import HeaderHome from "../../components/header/HeaderHome.js";
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../../API/api.js";
import DataBlog from "../../data/DataPost.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";
// import Grid from '../components/grid.js';


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


const BlogScreen = {
  render: async () => {
    const request = parseRequestUrl();
    
    if (!request.slug) {
      return `<div class="error-container">
                <h2>Blog not found</h2>
                <p>The requested blog could not be found.</p>
                <a href="/blogs" class="btn-back">Back to Blogs</a>
              </div>`;
    }
    
    try {
      // Fetch blog from MongoDB API
      const response = await fetch(`/api/blog/${request.slug}`);
      
      if (!response.ok) {
        throw new Error('Blog not found');
      }
      
      const data = await response.json();
      const blog = data.blog;
      
      console.log("Blog fetched from MongoDB:", blog);
      
      // Process tags
      const tags = blog.tag && blog.tag.length && blog.tag[0].tags ? blog.tag[0].tags : [];
      const limitedTags03 = tags.slice(0, 3);
      let tagsHTML = '';
      limitedTags03.forEach(tag => {
        tagsHTML += `<div class="metadata-tag">
                       <span class="metadata-tag-text text01">${tag}</span>
                     </div>`;
      });
      
      // Render content blocks
      let contentHTML = '';
      if (blog.content && blog.content.blocks) {
        blog.content.blocks.forEach(block => {
          switch (block.type) {
            case 'heading':
              contentHTML += `<${block.level || 'h2'} class="blog-heading">${block.text || ''}</${block.level || 'h2'}>`;
              break;
            case 'text':
              contentHTML += `<p class="blog-text">${block.content || ''}</p>`;
              break;
            case 'image':
              if (block.src) {
                contentHTML += `
                  <figure class="blog-image">
                    <img src="${block.src}" alt="${block.caption || ''}" />
                    ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                  </figure>`;
              }
              break;
            case 'quote':
              contentHTML += `
                <blockquote class="blog-quote">
                  <p>${block.text || ''}</p>
                  ${block.attribution ? `<cite>— ${block.attribution}</cite>` : ''}
                </blockquote>`;
              break;
            // Add more block types as needed
          }
        });
      }
      
      return `
        <!--BLOGSCREEN-->
        <div class="main">
          <div class="blog-detail">
            <div class="blog-container">
              
              <section class="blog-hero">
                ${blog.media?.hero ? `
                <div class="top fullBleedContent">
                  <div class="fullBleedContentHeader">
                    <div class="fullBleedContentHeaderContainer">
                      <div class="featured-image">
                        <img src="${blog.media.hero}" alt="${blog.title}" />
                      </div>                    
                    </div>
                  </div>
                </div>
                ` : ''}
                
                <div class="blog-headline">
                  <div class="blog-header">
                    <div class="blog-title">
                      <span class="header06">${blog.title}</span>
                    </div>
                    
                    ${blog.snippet?.text ? `
                    <div class="blog-subtext">
                      <span class="text03">${blog.snippet.text}</span>
                    </div>
                    ` : ''}
                    
                    <div class="blog-data">
                      <div class="tag-collection">
                        <div class="featured-blog-data-container">
                          <a href="/${blog.category?.category || 'dine'}">
                            <div class="section-tag" id="${blog.category?.category || 'dine'}">
                              <i class="section-tag-icon icon-${blog.category?.category || 'dine'}"></i>
                              <span class="section-tag-divider">
                                <div class="lineV"></div>
                              </span>
                              <span class="section-tag-text medium00">
                                ${blog.category?.category || 'dine'}
                              </span>
                            </div>
                          </a>
                        </div>
                        
                        ${tagsHTML ? `
                        <div class="nav-list-divider">
                          <div class="lineV"></div>
                        </div>
                        <div class="blog-data">
                          ${tagsHTML}
                        </div>
                        ` : ''}
                      </div>
                      
                      <div class="blog-info">
                        <span class="text01">By ${blog.author?.name || 'Anonymous'}</span>
                        ${blog.publishedAt ? `
                        <span class="text01"> • ${new Date(blog.publishedAt).toLocaleDateString()}</span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              <section class="blog-body">
                <div class="content">
                  <div class="blog-content">
                    ${contentHTML}
                  </div>
                </div>
              </section>
              
            </div>
          </div>
        </div>
      `;
      
    } catch (error) {
      console.error('Error fetching blog:', error);
      return `<div class="error-container">
                <h2>Error loading blog</h2>
                <p>${error.message}</p>
                <a href="/blogs" class="btn-back">Back to Blogs</a>
              </div>`;
    }
  },
  
  after_render: () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  },
};

export default BlogScreen;