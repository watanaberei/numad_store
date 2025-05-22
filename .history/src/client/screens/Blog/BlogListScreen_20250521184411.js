// src/client/screens/BlogListScreen.js
import { getStore } from "../api.js";
import { parseRequestUrl } from "../utils/utils.js";
import HeaderHome from "../components/header/HeaderHome.js";

const BlogListScreen = {
  render: async () => {
    try {
      // Get query parameters
      const request = parseRequestUrl();
      const category = request.category || '';
      const tag = request.tag || '';
      
      // Fetch blogs from API
      const response = await fetch(`/api/blog?${new URLSearchParams({
        category,
        tag,
        status: 'published',
        limit: 12
      }).toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const { blogs, totalPages, currentPage, totalBlogs } = await response.json();
      
      // Render list of blogs
      return `
        <div class="blog-list-screen col05">
          <div class="blog-header col05">
            <div class="blog-title">
              <h1 class="header05">${category ? category.charAt(0).toUpperCase() + category.slice(1) + ' Blog' : 'Blog'}</h1>
              ${tag ? `<h2 class="text03">Posts tagged with "${tag}"</h2>` : ''}
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
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="blog-grid col05">
            ${blogs.length > 0 ? blogs.map(blog => `
              <div class="blog-card">
                <a href="/blog/${blog.slug}" class="blog-card-link">
                  <div class="blog-card-image">
                    <img src="${blog.media.thumbnail || '/images/blog-placeholder.jpg'}" alt="${blog.title}">
                    <div class="blog-category-badge">
                      <span>${blog.category.category}</span>
                    </div>
                  </div>
                  
                  <div class="blog-card-content">
                    <h2 class="blog-card-title text03">${blog.title}</h2>
                    <p class="blog-card-snippet text02">${blog.snippet.text || ''}</p>
                    
                    <div class="blog-card-meta">
                      <span class="blog-date text01">${new Date(blog.publishedAt).toLocaleDateString()}</span>
                      <span class="blog-author text01">By ${blog.author.name}</span>
                    </div>
                    
                    <div class="blog-card-tags">
                      ${blog.tag && blog.tag[0] ? blog.tag[0].tags.slice(0, 3).map(tag => `
                        <span class="blog-tag text01">${tag}</span>
                      `).join('') : ''}
                    </div>
                  </div>
                </a>
              </div>
            `).join('') : `
              <div class="no-blogs">
                <p class="text03">No blog posts found</p>
                ${category || tag ? `<p class="text02">Try changing your filters or <a href="/blogs">view all posts</a></p>` : ''}
              </div>
            `}
          </div>
          
          ${totalPages > 1 ? `
            <div class="pagination col05">
              <button class="pagination-btn prev ${currentPage <= 1 ? 'disabled' : ''}" 
                      ${currentPage <= 1 ? 'disabled' : ''}>
                Previous
              </button>
              
              <div class="pagination-numbers">
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                  <button class="pagination-number ${page === currentPage ? 'active' : ''}" 
                          data-page="${page}">
                    ${page}
                  </button>
                `).join('')}
              </div>
              
              <button class="pagination-btn next ${currentPage >= totalPages ? 'disabled' : ''}"
                      ${currentPage >= totalPages ? 'disabled' : ''}>
                Next
              </button>
            </div>
          ` : ''}
          
          ${isAuthenticated() ? `
            <div class="blog-actions col05">
              <a href="/post" class="btn-create-blog">
                <i class="icon-plus"></i> Create New Blog Post
              </a>
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
  }
};

// Helper function to check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('accessToken') !== null;
}

export default BlogListScreen;