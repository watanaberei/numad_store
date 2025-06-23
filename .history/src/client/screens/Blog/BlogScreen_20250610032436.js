///////////////////////// START FIXED BLOG SCREEN COMPONENT /////////////////////////
// src/screens/BlogScreen.js - Blog post template that fetches from MongoDB API

import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../../utils/utils.js";
import HeaderHome from "../../components/header/HeaderHome.js";
import { format, parseISO } from "date-fns";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import * as components from "../../components/components.js";

console.log('[BlogScreen] Loading blog screen component');

const API_URL = 'http://localhost:4500'; // Use same server as StoreScreen

const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
      // Handle embedded entries
      return `<div class="embedded-entry">${children}</div>`;
    },
    [INLINES.HYPERLINK]: (node, next) => {
      // Handle hyperlinks
      const url = node.data.uri;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${next(node.content)}</a>`;
    },
    [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
      // Handle embedded assets
      return `<div class="embedded-asset">${children}</div>`;
    },
  },
};

const BlogScreen = {
  render: async () => {
    console.log('[BlogScreen] Starting render...');
    
    try {
      // 1. Parse the URL to get username and slug
      // Use request object set by router or parse URL
      const username = BlogScreen.request?.username || parseRequestUrl().username;
      const slug = BlogScreen.request?.slug || parseRequestUrl().slug;
      
      console.log(`[BlogScreen] Parsed URL - Username: ${username}, Slug: ${slug}`);
      
      if (!username || !slug) {
        console.error('[BlogScreen] Missing username or slug in URL');
        return `
          <div class="main col05">
            <div class="error-container">
              <h2>Blog Not Found</h2>
              <p class="text03">The blog URL is invalid. Please check the URL and try again.</p>
              <a href="/" class="btn-back">Go Home</a>
            </div>
          </div>
        `;
      }

      // 2. Show loading state initially
      const loadingHTML = `
        <div class="main col05">
          <div class="loading-container" id="blog-loading">
            <div class="loading-spinner"></div>
            <span class="text03">Loading blog post...</span>
          </div>
          
          <div class="error-container" id="blog-error" style="display: none;">
            <h2>Blog Not Found</h2>
            <p class="text03" id="error-message">The requested blog could not be found.</p>
            <a href="/" class="btn-back">Go Home</a>
          </div>
          
          <div id="blog-content" class="blog-detail" style="display: none;">
            <!-- Blog content will be loaded here -->
          </div>
        </div>
      `;
      
      // 3. Return loading state first, then fetch data in after_render
      return loadingHTML;
      
    } catch (error) {
      console.error('[BlogScreen] Error in render:', error);
      return `
        <div class="main col05">
          <div class="error-container">
            <h2>Error Loading Blog</h2>
            <p class="text03">${error.message}</p>
            <a href="/" class="btn-back">Go Home</a>
          </div>
        </div>
      `;
    }
  },

  after_render: async () => {
    console.log('[BlogScreen] Starting after_render...');
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    try {
      // 1. Parse URL again to get parameters
      const username = BlogScreen.request?.username || parseRequestUrl().username;
      const slug = BlogScreen.request?.slug || parseRequestUrl().slug;
      
      console.log(`[BlogScreen] Fetching blog data for: @${username}/${slug}`);

      // 2. Get DOM elements
      const loadingEl = document.getElementById('blog-loading');
      const errorEl = document.getElementById('blog-error');
      const contentEl = document.getElementById('blog-content');
      const errorMessageEl = document.getElementById('error-message');

      // 3. Fetch blog data from MongoDB API - FIXED: correct endpoint path
      console.log(`[BlogScreen] Making API call to: ${API_URL}/api/@${username}/${slug}`);
      
      const response = await fetch(`${API_URL}/api/@${username}/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`[BlogScreen] API response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Blog not found (${response.status})`);
      }

      const data = await response.json();
      console.log('[BlogScreen] Blog data received:', data);

      if (!data.success || !data.blog) {
        throw new Error('Invalid blog data received');
      }

      const blog = data.blog;

      // 4. Record blog view if user is logged in - FIXED: correct endpoint
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          console.log('[BlogScreen] Recording blog view...');
          
          const viewResponse = await fetch(`${API_URL}/api/@${username}/${slug}/view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (viewResponse.ok) {
            console.log('[BlogScreen] Blog view recorded');
          }
        } catch (viewError) {
          console.warn('[BlogScreen] Could not record view:', viewError);
        }
      }

      // 5. Generate blog HTML
      const blogHTML = await BlogScreen.generateBlogHTML(blog, username);

      // 6. Update DOM - hide loading, show content
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';
      if (contentEl) {
        contentEl.innerHTML = blogHTML;
        contentEl.style.display = 'block';
      }

      console.log('[BlogScreen] Blog rendered successfully');

      // 7. Initialize blog interactions
      await BlogScreen.initializeBlogInteractions(blog, username, slug);

    } catch (error) {
      console.error('[BlogScreen] Error loading blog:', error);
      
      // Show error state
      const loadingEl = document.getElementById('blog-loading');
      const errorEl = document.getElementById('blog-error');
      const errorMessageEl = document.getElementById('error-message');
      
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'block';
      if (errorMessageEl) {
        errorMessageEl.textContent = error.message || 'Failed to load blog post';
      }
    }
  },

  // Generate blog HTML content
  generateBlogHTML: async (blog, username) => {
    console.log('[BlogScreen] Generating blog HTML for:', blog.title);

    try {
      // Process tags for display
      const tags = blog.tag && blog.tag.length && blog.tag[0]?.tags ? blog.tag[0].tags : [];
      const limitedTags = tags.slice(0, 3);
      let tagsHTML = '';
      
      limitedTags.forEach(tag => {
        tagsHTML += `
          <div class="metadata-tag">
            <span class="metadata-tag-text text01">${tag}</span>
          </div>
        `;
      });

      // Process content blocks
      let contentHTML = '';
      if (blog.content && blog.content.blocks && Array.isArray(blog.content.blocks)) {
        console.log('[BlogScreen] Processing content blocks:', blog.content.blocks.length);
        
        blog.content.blocks.forEach((block, index) => {
          console.log(`[BlogScreen] Processing block ${index}:`, block.type);
          
          switch (block.type) {
            case 'heading':
              const level = block.level || 'h2';
              contentHTML += `<${level} class="blog-heading">${block.text || ''}</${level}>`;
              break;
              
            case 'text':
            case 'paragraph':
              contentHTML += `<p class="blog-text">${block.content || block.text || ''}</p>`;
              break;
              
            case 'image':
              if (block.src || block.url) {
                contentHTML += `
                  <figure class="blog-image">
                    <img src="${block.src || block.url}" alt="${block.caption || block.alt || ''}" />
                    ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
                  </figure>
                `;
              }
              break;
              
            case 'quote':
            case 'blockquote':
              contentHTML += `
                <blockquote class="blog-quote">
                  <p>${block.text || block.content || ''}</p>
                  ${block.attribution || block.cite ? `<cite>— ${block.attribution || block.cite}</cite>` : ''}
                </blockquote>
              `;
              break;
              
            case 'list':
              if (block.items && Array.isArray(block.items)) {
                const listType = block.ordered ? 'ol' : 'ul';
                const listItems = block.items.map(item => `<li>${item}</li>`).join('');
                contentHTML += `<${listType} class="blog-list">${listItems}</${listType}>`;
              }
              break;
              
            case 'code':
              contentHTML += `
                <pre class="blog-code"><code>${block.content || block.text || ''}</code></pre>
              `;
              break;
              
            case 'store-link':
              if (block.storeId || block.storeSlug) {
                contentHTML += `
                  <div class="blog-store-link">
                    <a href="/${block.storeSlug}" class="store-link-card">
                      <i class="icon-store"></i>
                      <span>View Store Details</span>
                    </a>
                  </div>
                `;
              }
              break;
              
            default:
              // Handle unknown block types
              if (block.content || block.text) {
                contentHTML += `<div class="blog-block">${block.content || block.text}</div>`;
              }
              console.warn(`[BlogScreen] Unknown block type: ${block.type}`);
          }
        });
      } else {
        // Fallback to text content
        if (blog.content?.body) {
          contentHTML = `<div class="blog-text">${blog.content.body}</div>`;
        } else if (blog.content?.introduction) {
          contentHTML = `<div class="blog-text">${blog.content.introduction}</div>`;
        } else {
          contentHTML = '<p class="text03">No content available</p>';
        }
      }

      // Format publish date
      let publishedDate = '';
      if (blog.publishedAt) {
        try {
          publishedDate = new Date(blog.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (dateError) {
          console.warn('[BlogScreen] Error formatting date:', dateError);
          publishedDate = 'Recently';
        }
      }

      // Check if current user can edit
      const currentUsername = localStorage.getItem('username');
      const canEdit = currentUsername === username && localStorage.getItem('accessToken');

      const label = {
        render: (data) => {
          return `
            <div class="text01label">${data}</div>
          `;
        }
      }      
      // Generate the complete blog HTML
      return `
        <div class="blog-container">
          
          <!-- Blog Hero Section -->
          <section class="blog-hero">
            ${label.render("blog.media?.hero")}
            ${blog.media?.hero ? `
              <div class="top fullBleedContent">
                <div class="fullBleedContentHeader">
                  <div class="fullBleedContentHeaderContainer">
                    <div class="featured-image">
                      ${label.render("src=blog.media.hero alt=blog.title")}
                      <img src="${blog.media.hero}" alt="${blog.title}" />
                    </div>                    
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="blog-headline">
              <div class="blog-header">
                
                <!-- Blog Title -->
                <div class="blog-title">
                  <span class="header06">${label.render("blog.title")}${blog.title}</span>
                  ${canEdit ? `
                    <a href="/@${username}/${blog.slug}/edit" class="btn-edit-blog">
                      <i class="icon-edit"></i> Edit
                    </a>
                  ` : ''}
                </div>
                
                <!-- Blog Snippet -->
                ${blog.snippet?.text ? `
                  <div class="blog-subtext">
                    <span class="text03">${blog.snippet.text}</span>
                  </div>
                ` : ''}
                
                <!-- Blog Metadata -->
                <div class="blog-data">
                  <div class="tag-collection">
                    
                    <!-- Category -->
                    <div class="featured-blog-data-container">
                      ${label.render("blog.category")}
                      <a href="/blogs?category=${blog.category?.category || 'dine'}">
                        <div class="section-tag" id="${blog.category?.category || 'dine'}">
                          <i class="section-tag-icon icon-${blog.category?.category || 'dine'}"></i>
                          <span class="section-tag-divider">
                            <div class="lineV"></div>
                          </span>
                          <span class="section-tag-text medium00">
                            ${label.render("blog.category")}
                            ${blog.category?.category || 'dine'}
                          </span>
                        </div>
                      </a>
                    </div>
                    
                    <!-- Tags -->
                    ${tagsHTML ? `
                      <div class="nav-list-divider">
                        <div class="lineV"></div>
                      </div>
                      <div class="blog-data">
                        ${label.render("blog.tags")}
                        ${tagsHTML}
                      </div>
                    ` : ''}
                  </div>
                  
                  <!-- Author and Date -->
                  <div class="blog-info">
                    <span class="text01">
                      ${label.render("username")} ${label.render("blog.author.name")}
                      By <a href="/@${username}" class="author-link">${blog.author?.name || username}</a>
                    </span>
                    ${label.render("publishedDate")}
                    ${publishedDate ? `
                      <span class="text01"> • ${publishedDate}</span>
                    ` : ''}
                    ${label.render("blog.interactions.views")}
                    ${blog.interactions?.views ? `
                      <span class="text01"> • ${blog.interactions.views} views</span>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Blog Content Section -->
          <section class="blog-body">
            <div class="content">
              <div class="blog-content">
                ${label.render("contentHTML")}
                ${contentHTML}
              </div>
            </div>
          </section>
          
          <!-- Blog Interactions -->
          <section class="blog-interactions" id="blog-interactions">
            <div class="interaction-container">
              <div class="blog-actions">
                <button id="blog-like" class="interaction-btn like-btn" data-blog-slug="${blog.slug}">
                  <i class="icon-like"></i>
                  ${label.render("blog.interactions.likes")}
                  <span class="count">${blog.interactions?.likes || 0}</span>
                  <span class="text">Like</span>
                </button>
                
                <button id="blog-share" class="interaction-btn share-btn" data-blog-slug="${blog.slug}">
                  <i class="icon-share"></i>
                  <span class="text">Share</span>
                </button>
                
                <button id="blog-save" class="interaction-btn save-btn" data-blog-slug="${blog.slug}">
                  <i class="icon-save"></i>
                  <span class="text">Save</span>
                </button>
              </div>
            </div>
          </section>
          
          <!-- Comments Section -->
          ${label.render("blog.settings?.comments")}
          ${blog.settings?.comments !== false ? `
            <section class="blog-comments" id="blog-comments">
              <div class="comments-container">
                ${label.render("blog.interactions.comments")}
                <h3 class="comments-title">Comments (${blog.interactions?.comments || 0})</h3>
                
                <!-- Comment Form -->
                <div id="comment-form" class="comment-form" style="display: none;">
                  <textarea id="comment-text" placeholder="Write a comment..." rows="3"></textarea>
                  <div class="comment-actions">
                    <button id="submit-comment" class="btn-submit">Post Comment</button>
                    <button id="cancel-comment" class="btn-cancel">Cancel</button>
                  </div>
                </div>
                
                <button id="add-comment-btn" class="add-comment-btn">Add Comment</button>
                
                <!-- Comments List -->
                <div id="comments-list" class="comments-list">
                  <!-- Comments will be loaded here -->
                </div>
              </div>
            </section>
          ` : ''}
          
        </div>
      `;

    } catch (error) {
      console.error('[BlogScreen] Error generating blog HTML:', error);
      return `
        <div class="blog-container">
          <div class="error-content">
            <h2>Error Loading Blog Content</h2>
            <p>There was an issue rendering this blog post. Please try refreshing the page.</p>
          </div>
        </div>
      `;
    }
  },

  // Initialize blog interactions (like, share, save, comments)
  initializeBlogInteractions: async (blog, username, slug) => {
    console.log('[BlogScreen] Initializing blog interactions...');

    try {
      // Get user authentication status
      const accessToken = localStorage.getItem('accessToken');
      const isAuthenticated = !!accessToken;

      // Initialize like button
      const likeBtn = document.getElementById('blog-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', async () => {
          await BlogScreen.handleLike(username, slug, isAuthenticated);
        });
      }

      // Initialize share button
      const shareBtn = document.getElementById('blog-share');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          BlogScreen.handleShare(blog.title, window.location.href);
        });
      }

      // Initialize save button
      const saveBtn = document.getElementById('blog-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          await BlogScreen.handleSave(username, slug, isAuthenticated);
        });
      }

      // Initialize comment functionality
      if (blog.settings?.comments !== false) {
        await BlogScreen.initializeComments(username, slug, isAuthenticated);
      }

      // Load user's interaction status if authenticated
      if (isAuthenticated) {
        await BlogScreen.loadUserInteractionStatus(username, slug);
      }

      console.log('[BlogScreen] Blog interactions initialized successfully');

    } catch (error) {
      console.error('[BlogScreen] Error initializing interactions:', error);
    }
  },

  // Handle blog like - FIXED: correct endpoint
  handleLike: async (username, slug, isAuthenticated) => {
    if (!isAuthenticated) {
      alert('Please log in to like this blog post');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/@${username}/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like blog');
      }

      const data = await response.json();
      
      if (data.success) {
        const likeBtn = document.getElementById('blog-like');
        const countEl = likeBtn.querySelector('.count');
        
        if (data.liked) {
          likeBtn.classList.add('active');
          likeBtn.querySelector('.text').textContent = 'Liked';
        } else {
          likeBtn.classList.remove('active');
          likeBtn.querySelector('.text').textContent = 'Like';
        }
        
        if (countEl) {
          countEl.textContent = data.likes || 0;
        }
      }

    } catch (error) {
      console.error('[BlogScreen] Error liking blog:', error);
      alert('Failed to like blog post. Please try again.');
    }
  },

  // Handle blog share
  handleShare: (title, url) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).then(() => {
        console.log('[BlogScreen] Blog shared successfully');
      }).catch(error => {
        console.error('[BlogScreen] Error sharing:', error);
        BlogScreen.fallbackShare(url);
      });
    } else {
      BlogScreen.fallbackShare(url);
    }
  },

  // Fallback share method
  fallbackShare: (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Blog link copied to clipboard!');
    }).catch(error => {
      console.error('[BlogScreen] Error copying to clipboard:', error);
      // Create a temporary input to copy the URL
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert('Blog link copied to clipboard!');
    });
  },

  // Handle blog save - FIXED: correct endpoint
  handleSave: async (username, slug, isAuthenticated) => {
    if (!isAuthenticated) {
      alert('Please log in to save this blog post');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/@${username}/${slug}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to save blog');
      }

      const data = await response.json();
      
      if (data.success) {
        const saveBtn = document.getElementById('blog-save');
        
        if (data.saved) {
          saveBtn.classList.add('active');
          saveBtn.querySelector('.text').textContent = 'Saved';
        } else {
          saveBtn.classList.remove('active');
          saveBtn.querySelector('.text').textContent = 'Save';
        }
      }

    } catch (error) {
      console.error('[BlogScreen] Error saving blog:', error);
      alert('Failed to save blog post. Please try again.');
    }
  },

  // Initialize comments functionality
  initializeComments: async (username, slug, isAuthenticated) => {
    console.log('[BlogScreen] Initializing comments...');

    const addCommentBtn = document.getElementById('add-comment-btn');
    const commentForm = document.getElementById('comment-form');
    const submitBtn = document.getElementById('submit-comment');
    const cancelBtn = document.getElementById('cancel-comment');

    if (addCommentBtn) {
      addCommentBtn.addEventListener('click', () => {
        if (!isAuthenticated) {
          alert('Please log in to comment');
          return;
        }
        
        commentForm.style.display = 'block';
        addCommentBtn.style.display = 'none';
        document.getElementById('comment-text').focus();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        commentForm.style.display = 'none';
        addCommentBtn.style.display = 'block';
        document.getElementById('comment-text').value = '';
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        await BlogScreen.submitComment(username, slug);
      });
    }

    // Load existing comments
    await BlogScreen.loadComments(username, slug);
  },

  // Submit a comment - FIXED: correct endpoint
  submitComment: async (username, slug) => {
    const commentText = document.getElementById('comment-text');
    const content = commentText.value.trim();

    if (!content) {
      alert('Please enter a comment');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/@${username}/${slug}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      const data = await response.json();
      
      if (data.success) {
        // Clear form and hide it
        commentText.value = '';
        document.getElementById('comment-form').style.display = 'none';
        document.getElementById('add-comment-btn').style.display = 'block';
        
        // Reload comments
        await BlogScreen.loadComments(username, slug);
      }

    } catch (error) {
      console.error('[BlogScreen] Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  },

  // Load comments for the blog - FIXED: correct endpoint
  loadComments: async (username, slug) => {
    try {
      const response = await fetch(`${API_URL}/api/@${username}/${slug}/comments`);
      
      if (!response.ok) {
        console.warn('[BlogScreen] Could not load comments');
        return;
      }

      const data = await response.json();
      const commentsList = document.getElementById('comments-list');
      
      if (data.success && data.comments && commentsList) {
        if (data.comments.length === 0) {
          commentsList.innerHTML = '<p class="no-comments text03">No comments yet. Be the first to comment!</p>';
        } else {
          const commentsHTML = data.comments.map(comment => `
            <div class="comment">
              <div class="comment-header">
                <span class="comment-author">${comment.authorName || 'Anonymous'}</span>
                <span class="comment-date">${new Date(comment.timestamp).toLocaleDateString()}</span>
              </div>
              <div class="comment-content">
                <p>${comment.content}</p>
              </div>
            </div>
          `).join('');
          
          commentsList.innerHTML = commentsHTML;
        }
      }

    } catch (error) {
      console.error('[BlogScreen] Error loading comments:', error);
    }
  },

  // Load user's interaction status (likes, saves, etc.) - FIXED: correct endpoint
  loadUserInteractionStatus: async (username, slug) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/api/@${username}/${slug}/user-status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.warn('[BlogScreen] Could not load user interaction status');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        // Update like button
        const likeBtn = document.getElementById('blog-like');
        if (likeBtn && data.liked) {
          likeBtn.classList.add('active');
          likeBtn.querySelector('.text').textContent = 'Liked';
        }

        // Update save button
        const saveBtn = document.getElementById('blog-save');
        if (saveBtn && data.saved) {
          saveBtn.classList.add('active');
          saveBtn.querySelector('.text').textContent = 'Saved';
        }
      }

    } catch (error) {
      console.error('[BlogScreen] Error loading user interaction status:', error);
    }
  }
};

export default BlogScreen;

///////////////////////// END FIXED BLOG SCREEN COMPONENT /////////////////////////