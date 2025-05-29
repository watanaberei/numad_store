// src/screens/BlogScreen.js
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../../utils/utils.js";
import HeaderHome from "../../components/header/HeaderHome.js";
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../../API/api.js";
import DataBlog from "../../data/DataPost.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";
import { blogApi } from '../../API/blogApi.js';
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

let dataBlog = new DataBlog();

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
      // Fetch blog data
      const response = await fetch(`/api/blog/${request.slug}`);
      
      if (!response.ok) {
        throw new Error('Blog not found');
      }
      
      const { blog } = await response.json();
      
      // Check if user is authenticated (for edit button)
      const accessToken = localStorage.getItem('accessToken');
      let userId = null;
      
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          userId = payload.email; // Using email as user identifier
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      const isAuthor = userId && blog.author && userId === blog.author.email;
      
      // Format date
      const publishDate = blog.publishedAt 
        ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : '';
      
      // Render blog content based on content blocks
      let contentHTML = '';
      
      if (blog.content && blog.content.blocks) {
        contentHTML = blog.content.blocks.map(block => {
          switch (block.type) {
            case 'text':
              return `<div class="blog-content-block text-block">
                        <p>${block.content || ''}</p>
                      </div>`;
            
            case 'heading':
              const headingLevel = block.level || 'h2';
              return `<div class="blog-content-block heading-block">
                        <${headingLevel}>${block.text || ''}</${headingLevel}>
                      </div>`;
            
            case 'image':
              return `<div class="blog-content-block image-block">
                        <figure>
                          <img src="${block.imageUrl || ''}" alt="${block.caption || ''}" class="blog-image">
                          ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                        </figure>
                      </div>`;
            
            case 'quote':
              return `<div class="blog-content-block quote-block">
                        <blockquote>
                          <p>"${block.text || ''}"</p>
                          ${block.attribution ? `<cite>— ${block.attribution}</cite>` : ''}
                        </blockquote>
                      </div>`;
            
            case 'divider':
              return `<div class="blog-content-block divider-block">
                        <hr>
                      </div>`;
            
            case 'store-link':
              if (!block.storeSlug) {
                return '';
              }
              
              return `<div class="blog-content-block store-link-block">
                        <a href="/stores/${block.storeSlug}" class="store-link">
                          <div class="store-link-content">
                            <div class="store-link-info">
                              <span class="store-name">${block.storeName || block.storeSlug}</span>
                              ${block.storeAddress ? `<span class="store-address">${block.storeAddress}</span>` : ''}
                            </div>
                            <div class="store-link-cta">
                              <span class="btn-view-store">View Store →</span>
                            </div>
                          </div>
                        </a>
                      </div>`;
            
            default:
              return '';
          }
        }).join('');
      } else if (blog.content && blog.content.body) {
        // Legacy content format
        contentHTML = `<div class="blog-content-block text-block">
                         <p>${blog.content.body}</p>
                       </div>`;
      }
      
      // Generate tags HTML
      const tagsHTML = blog.tag && blog.tag[0] && blog.tag[0].tags 
        ? blog.tag[0].tags.map(tag => `
            <a href="/blogs?tag=${encodeURIComponent(tag)}" class="blog-tag">
              ${tag}
            </a>
          `).join('')
        : '';
      
      return `
        <div class="blog-screen col05">
          <!-- Blog header -->
          <div class="blog-header col05">
            <div class="blog-breadcrumb">
              <a href="/blogs" class="breadcrumb-link">← All Posts</a>
            </div>
            
            <div class="blog-category">
              <a href="/blogs?category=${blog.category?.category || ''}" class="blog-category-link">
                <i class="icon-${blog.category?.category || 'article'}"></i>
                ${blog.category?.category || 'Article'}
              </a>
            </div>
            
            <h1 class="blog-title header05">${blog.title}</h1>
            
            ${blog.snippet && blog.snippet.text ? `
              <div class="blog-subtitle">
                <p class="text03">${blog.snippet.text}</p>
              </div>
            ` : ''}
            
            <div class="blog-meta">
              <div class="blog-author-date">
                <div class="author-avatar">
                  <div class="default-avatar">${blog.author?.name?.charAt(0) || 'A'}</div>
                </div>
                <div class="author-info">
                  <span class="blog-author">By ${blog.author?.name || 'Anonymous'}</span>
                  <span class="blog-date">${publishDate}</span>
                </div>
              </div>
              
              ${isAuthor ? `
                <div class="blog-actions">
                  <a href="/post/${blog.slug}" class="btn-edit-blog">
                    <i class="icon-edit"></i> Edit
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Hero image -->
          ${blog.media && blog.media.hero ? `
            <div class="blog-hero col05">
              <img src="${blog.media.hero}" alt="${blog.title}" class="blog-hero-image">
            </div>
          ` : ''}
          
          <!-- Blog content -->
          <div class="blog-content col05">
            ${contentHTML}
          </div>
          
          <!-- Tags -->
          ${tagsHTML ? `
            <div class="blog-tags col05">
              <div class="tags-label">Tagged with:</div>
              <div class="tags-container">
                ${tagsHTML}
              </div>
            </div>
          ` : ''}
          
          <!-- Author info -->
          <div class="blog-author-info col05">
            <div class="author-avatar-large">
              <div class="default-avatar">${blog.author?.name?.charAt(0) || 'A'}</div>
            </div>
            <div class="author-details">
              <h3 class="author-name">${blog.author?.name || 'Anonymous'}</h3>
              <p class="author-bio">Contributor to the community</p>
              ${blog.author?.email ? `<p class="author-contact">${blog.author.email}</p>` : ''}
            </div>
          </div>
          
          <!-- Comments section if enabled -->
          ${blog.settings?.comments ? `
            <div class="blog-comments col05">
              <h3 class="comments-title text03">Comments</h3>
              
              ${blog.interactions?.comments?.length > 0 ? `
                <div class="comments-list">
                  ${blog.interactions.comments.map(comment => `
                    <div class="comment">
                      <div class="comment-avatar">
                        <div class="default-avatar">${comment.authorName?.charAt(0) || 'A'}</div>
                      </div>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-author">${comment.authorName || 'Anonymous'}</span>
                          <span class="comment-date">${new Date(comment.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div class="comment-text">
                          <p>${comment.content}</p>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="no-comments">
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              `}
              
              ${accessToken ? `
                <div class="comment-form">
                  <h4 class="form-title text02">Add a comment</h4>
                  <form id="comment-form">
                    <div class="input-group">
                      <textarea id="comment-text" class="comment-textarea" placeholder="Write your comment here..." required></textarea>
                    </div>
                    <button type="submit" id="submit-comment" class="btn-submit-comment">Post Comment</button>
                  </form>
                </div>
              ` : `
                <div class="login-to-comment">
                  <p>Please <a href="/login" class="login-link">login</a> to leave a comment.</p>
                </div>
              `}
            </div>
          ` : ''}
          
          <!-- Related blogs section -->
          <div class="related-blogs col05">
            <h3 class="related-title text03">Related Posts</h3>
            <div id="related-blog-container" class="related-blog-container">
              <div class="loading-indicator">Loading related posts...</div>
            </div>
          </div>
          
          <!-- Blog stats -->
          <div class="blog-stats col05">
            <div class="stats-container">
              <div class="stat-item">
                <span class="stat-number">${blog.interactions?.views || 0}</span>
                <span class="stat-label">Views</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${blog.interactions?.likes || 0}</span>
                <span class="stat-label">Likes</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${blog.interactions?.comments?.length || 0}</span>
                <span class="stat-label">Comments</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error rendering blog page:', error);
      return `
        <div class="error-container">
          <h2>Error loading blog</h2>
          <p>${error.message}</p>
          <button class="btn-reload" onclick="window.location.reload()">Reload</button>
        </div>
      `;
    }
  },
  
  after_render: async () => {
    const request = parseRequestUrl();
    
    // Load related blogs
    try {
      const blogResponse = await fetch(`/api/blog/${request.slug}`);
      if (!blogResponse.ok) throw new Error('Blog not found');
      
      const { blog } = await blogResponse.json();
      
      // Get the category for related blog search
      const category = blog.category?.category || '';
      
      // Fetch related blogs by category
      const relatedBlogsResponse = await fetch(`/api/blog?category=${category}&limit=3`);
      
      if (relatedBlogsResponse.ok) {
        const { blogs } = await relatedBlogsResponse.json();
        
        // Filter out the current blog
        const relatedBlogs = blogs.filter(relatedBlog => relatedBlog.slug !== blog.slug).slice(0, 3);
        
        const relatedBlogContainer = document.getElementById('related-blog-container');
        
        if (relatedBlogs.length > 0) {
          relatedBlogContainer.innerHTML = `
            <div class="related-blogs-grid">
              ${relatedBlogs.map(relatedBlog => `
                <div class="related-blog-card">
                  <a href="/blog/${relatedBlog.slug}" class="related-blog-link">
                    <div class="related-blog-image">
                      <img src="${relatedBlog.media?.thumbnail || '/images/blog-placeholder.jpg'}" alt="${relatedBlog.title}">
                      <div class="related-blog-category">
                        <span>${relatedBlog.category?.category || 'Article'}</span>
                      </div>
                    </div>
                    <div class="related-blog-content">
                      <h4 class="related-blog-title text02">${relatedBlog.title}</h4>
                      <span class="related-blog-date">${new Date(relatedBlog.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </a>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          relatedBlogContainer.innerHTML = '<p>No related posts found.</p>';
        }
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
      const relatedBlogContainer = document.getElementById('related-blog-container');
      if (relatedBlogContainer) {
        relatedBlogContainer.innerHTML = '<p>Failed to load related posts.</p>';
      }
    }
    
    // Comment form handling
    const commentForm = document.getElementById('comment-form');
    
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const commentText = document.getElementById('comment-text').value;
        if (!commentText.trim()) return;
        
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('You must be logged in to post a comment');
          return;
        }
        
        try {
          const response = await fetch(`/api/blog/${request.slug}/comment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ content: commentText })
          });
          
          if (response.ok) {
            // Refresh the page to show the new comment
            window.location.reload();
          } else {
            const error = await response.json();
            alert(`Error posting comment: ${error.message}`);
          }
        } catch (error) {
          console.error('Error posting comment:', error);
          alert('An error occurred while posting your comment');
        }
      });
    }
    
    // Like/unlike functionality (if you want to add it)
    const likeButton = document.getElementById('like-button');
    if (likeButton) {
      likeButton.addEventListener('click', async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('You must be logged in to like posts');
          return;
        }
        
        try {
          const response = await fetch(`/api/blog/${request.slug}/like`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Update like count in UI
            const likeCount = document.querySelector('.like-count');
            if (likeCount) {
              likeCount.textContent = data.likes;
            }
          }
        } catch (error) {
          console.error('Error liking post:', error);
        }
      });
    }
  }
};

export default BlogScreen;