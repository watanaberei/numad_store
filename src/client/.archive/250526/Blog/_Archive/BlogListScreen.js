// src/client/screens/BlogListScreen.js
import { getStore } from "../../API/api.js";
import { parseRequestUrl } from "../../utils/utils.js";
import HeaderHome from "../../components/header/HeaderHome.js";
import { blogApi } from "../../API/blogApi.js";

const BlogListScreen = {
  render: async () => {
    try {
      // Get query parameters
      const request = parseRequestUrl();
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category') || '';
      const tag = urlParams.get('tag') || '';
      const page = urlParams.get('page') || '1';
      const sort = urlParams.get('sort') || 'newest';
      
      // Fetch blogs from API using client API
      const { blogs, totalPages, currentPage, totalBlogs } = await blogApi.getBlogs({
        category,
        tag,
        status: 'published',
        limit: 12,
        page,
        sort
      });
      
      // Check if user is authenticated
      const isAuthenticated = localStorage.getItem('accessToken') !== null;
      
      // Render list of blogs
      return `
        <div class="blog-list-screen col05">
          <div class="blog-header col05">
            <div class="blog-title">
              <h1 class="header05">${category ? category.charAt(0).toUpperCase() + category.slice(1) + ' Blog' : 'Blog'}</h1>
              ${tag ? `<h2 class="text03">Posts tagged with "${tag}"</h2>` : ''}
              <p class="blog-count text02">${totalBlogs} ${totalBlogs === 1 ? 'post' : 'posts'} found</p>
            </div>
            
            <div class="blog-filters">
              <div class="filter-group">
                <label for="category-filter">Category</label>
                <select id="category-filter" class="filter-select">
                  <option value="">All Categories</option>
                  <option value="dine" ${category === 'dine' ? 'selected' : ''}>Dine</option>
                  <option value="work" ${category === 'work' ? 'selected' : ''}>Work</option>
                  <option value="stay" ${category === 'stay' ? 'selected' : ''}>Stay</option>
                  <option value="play" ${category === 'play' ? 'selected' : ''}>Play</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label for="sort-filter">Sort By</label>
                <select id="sort-filter" class="filter-select">
                  <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Newest</option>
                  <option value="oldest" ${sort === 'oldest' ? 'selected' : ''}>Oldest</option>
                  <option value="popular" ${sort === 'popular' ? 'selected' : ''}>Most Popular</option>
                </select>
              </div>
              
              ${isAuthenticated ? `
                <div class="filter-actions">
                  <a href="/post" class="btn-create-blog">
                    <i class="icon-plus"></i> Create Post
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="blog-grid col05">
            ${blogs.length > 0 ? blogs.map(blog => `
              <article class="blog-card">
                <a href="/blog/${blog.slug}" class="blog-card-link">
                  <div class="blog-card-image">
                    <img src="${blog.media?.thumbnail || blog.media?.hero || '/images/blog-placeholder.jpg'}" alt="${blog.title}" loading="lazy">
                    <div class="blog-category-badge">
                      <i class="icon-${blog.category?.category || 'article'}"></i>
                      <span>${blog.category?.category || 'Article'}</span>
                    </div>
                  </div>
                  
                  <div class="blog-card-content">
                    <h2 class="blog-card-title text03">${blog.title}</h2>
                    <p class="blog-card-snippet text02">${blog.snippet?.text || ''}</p>
                    
                    <div class="blog-card-meta">
                      <div class="blog-meta-left">
                        <div class="blog-author">
                          <div class="author-avatar-small">
                            <div class="default-avatar">${blog.author?.name?.charAt(0) || 'A'}</div>
                          </div>
                          <span class="author-name text01">By ${blog.author?.name || 'Anonymous'}</span>
                        </div>
                        <span class="blog-date text01">${new Date(blog.publishedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div class="blog-stats">
                        <span class="stat-item">
                          <i class="icon-eye"></i>
                          ${blog.interactions?.views || 0}
                        </span>
                        ${blog.interactions?.comments?.length > 0 ? `
                          <span class="stat-item">
                            <i class="icon-comment"></i>
                            ${blog.interactions.comments.length}
                          </span>
                        ` : ''}
                      </div>
                    </div>
                    
                    <div class="blog-card-tags">
                      ${blog.tag && blog.tag[0] ? blog.tag[0].tags.slice(0, 3).map(tag => `
                        <span class="blog-tag text01">${tag}</span>
                      `).join('') : ''}
                    </div>
                  </div>
                </a>
              </article>
            `).join('') : `
              <div class="no-blogs">
                <div class="no-blogs-icon">
                  <i class="icon-document-empty"></i>
                </div>
                <h3 class="text03">No blog posts found</h3>
                ${category || tag ? `
                  <p class="text02">Try changing your filters or <a href="/blogs">view all posts</a></p>
                ` : `
                  <p class="text02">Be the first to create a blog post!</p>
                  ${isAuthenticated ? `
                    <a href="/post" class="btn-create-first">Create Your First Post</a>
                  ` : ''}
                `}
              </div>
            `}
          </div>
          
          ${totalPages > 1 ? `
            <div class="pagination col05">
              <button class="pagination-btn prev ${currentPage <= 1 ? 'disabled' : ''}" 
                      ${currentPage <= 1 ? 'disabled' : ''}>
                <i class="icon-chevron-left"></i> Previous
              </button>
              
              <div class="pagination-numbers">
                ${Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  return `
                    <button class="pagination-number ${page === currentPage ? 'active' : ''}" 
                            data-page="${page}">
                      ${page}
                    </button>
                  `;
                }).join('')}
              </div>
              
              <button class="pagination-btn next ${currentPage >= totalPages ? 'disabled' : ''}"
                      ${currentPage >= totalPages ? 'disabled' : ''}>
                Next <i class="icon-chevron-right"></i>
              </button>
            </div>
            
            <div class="pagination-info">
              <span class="text01">
                Showing page ${currentPage} of ${totalPages} 
                (${totalBlogs} total posts)
              </span>
            </div>
          ` : ''}
        </div>
      `;
    } catch (error) {
      console.error('Error rendering blog list:', error);
      return `
        <div class="error-container">
          <h2>Error loading blog posts</h2>
          <p>${error.message}</p>
          <button class="btn-reload" onclick="window.location.reload()">Reload</button>
        </div>
      `;
    }
  },
  
  after_render: async () => {
    // Handle category filter changes
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        const category = categoryFilter.value;
        const currentUrl = new URL(window.location.href);
        
        if (category) {
          currentUrl.searchParams.set('category', category);
        } else {
          currentUrl.searchParams.delete('category');
        }
        
        // Reset to page 1 when changing filters
        currentUrl.searchParams.delete('page');
        
        window.location.href = currentUrl.toString();
      });
    }
    
    // Handle sort filter changes
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        const sort = sortFilter.value;
        const currentUrl = new URL(window.location.href);
        
        currentUrl.searchParams.set('sort', sort);
        
        // Reset to page 1 when changing filters
        currentUrl.searchParams.delete('page');
        
        window.location.href = currentUrl.toString();
      });
    }
    
    // Handle pagination
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    paginationNumbers.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        const currentUrl = new URL(window.location.href);
        
        currentUrl.searchParams.set('page', page);
        
        window.location.href = currentUrl.toString();
      });
    });
    
    // Handle previous/next buttons
    const prevButton = document.querySelector('.pagination-btn.prev');
    const nextButton = document.querySelector('.pagination-btn.next');
    
    if (prevButton && !prevButton.disabled) {
      prevButton.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href);
        const currentPage = parseInt(currentUrl.searchParams.get('page') || '1');
        
        if (currentPage > 1) {
          currentUrl.searchParams.set('page', currentPage - 1);
          window.location.href = currentUrl.toString();
        }
      });
    }
    
    if (nextButton && !nextButton.disabled) {
      nextButton.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href);
        const currentPage = parseInt(currentUrl.searchParams.get('page') || '1');
        const totalPages = parseInt(document.querySelectorAll('.pagination-number').length);
        
        if (currentPage < totalPages) {
          currentUrl.searchParams.set('page', currentPage + 1);
          window.location.href = currentUrl.toString();
        }
      });
    }
    
    // Add search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
          const searchTerm = searchInput.value.trim();
          const currentUrl = new URL(window.location.href);
          
          if (searchTerm) {
            currentUrl.searchParams.set('search', searchTerm);
          } else {
            currentUrl.searchParams.delete('search');
          }
          
          // Reset to page 1 when searching
          currentUrl.searchParams.delete('page');
          
          window.location.href = currentUrl.toString();
        }, 500);
      });
    }
  }
};

export default BlogListScreen;

// // Helper function to check if user is authenticated
// function isAuthenticated() {
//   return localStorage.getItem('accessToken') !== null;
// }

// export default BlogListScreen;