// src/screens/Store/StoreListScreen.js
import { getStore } from "../../API/apiContentful.js";
import { parseRequestUrl } from "../../utils/utils.js";
import createStoreCard from "../../components/cards/cardStore.js";

const StoreListScreen = {
  render: async () => {
    try {
      // Get query parameters
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category') || '';
      const search = params.get('search') || '';
      const sort = params.get('sort') || 'popular';
      const page = parseInt(params.get('page') || '1');
      const limit = 24;
      
      // Fetch stores from API
      const response = await fetch(`http://localhost:4500/api/stores?${new URLSearchParams({
        category,
        search,
        sort,
        page,
        limit
      }).toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      const { stores, totalPages, currentPage, totalStores } = await response.json();
      
      // Render list of stores
      return `
        <div class="store-list-screen col05">
          <div class="store-header col05">
            <div class="store-title">
              <h1 class="header05">Discover Stores</h1>
              <p class="text03">${totalStores} stores near you</p>
            </div>
            
            <div class="store-filters">
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
                  <option value="popular" ${sort === 'popular' ? 'selected' : ''}>Most Popular</option>
                  <option value="nearest" ${sort === 'nearest' ? 'selected' : ''}>Nearest</option>
                  <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Recently Added</option>
                  <option value="rating" ${sort === 'rating' ? 'selected' : ''}>Highest Rated</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label for="search-input">Search</label>
                <input 
                  type="text" 
                  id="search-input" 
                  class="filter-input" 
                  placeholder="Search stores..." 
                  value="${search}"
                >
              </div>
            </div>
          </div>
          
          <div class="store-grid col05 grid03">
            ${stores && stores.length > 0 ? stores.map(store => {
              // Create store data structure compatible with createStoreCard
              const storeData = {
                storeId: store._id || store.slug,
                storeInfo: {
                  storeName: store.title || store.hero?.storeName || 'Unknown Store',
                  storeCategory: store.category?.categoryType || 'dine',
                  storeAddress: store.location?.address || '',
                  storeRating: store.hero?.rating || '0',
                  storePrice: store.hero?.price || '$$',
                  storeImage: store.media?.gallery?.[0]?.url || store.hero?.gallery?.[0]?.url || '/images/store-placeholder.jpg'
                },
                location: store.location || {},
                slug: store.slug
              };
              
              return `
                <div class="store-card-wrapper">
                  ${createStoreCard.render(storeData)}
                </div>
              `;
            }).join('') : `
              <div class="no-stores col05">
                <p class="text03">No stores found</p>
                ${category || search ? `<p class="text02">Try changing your filters or <a href="/stores">view all stores</a></p>` : ''}
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
                ${generatePaginationNumbers(currentPage, totalPages)}
              </div>
              
              <button class="pagination-btn next ${currentPage >= totalPages ? 'disabled' : ''}"
                      ${currentPage >= totalPages ? 'disabled' : ''}>
                Next
              </button>
            </div>
          ` : ''}
        </div>
      `;
    } catch (error) {
      console.error('Error rendering store list:', error);
      return `
        <div class="error-container">
          <h2>Error loading stores</h2>
          <p>${error.message}</p>
          <button class="btn-reload" onclick="window.location.reload()">Reload</button>
        </div>
      `;
    }
  },
  
  after_render: async () => {
    // Initialize store card effects
    await createStoreCard.after_render();
    
    // Handle category filter changes
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        updateUrlAndReload({ category: categoryFilter.value, page: 1 });
      });
    }
    
    // Handle sort filter changes
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        updateUrlAndReload({ sort: sortFilter.value, page: 1 });
      });
    }
    
    // Handle search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          updateUrlAndReload({ search: searchInput.value, page: 1 });
        }, 500); // Debounce search
      });
    }
    
    // Handle pagination
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    paginationNumbers.forEach(button => {
      button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        updateUrlAndReload({ page });
      });
    });
    
    // Handle previous/next buttons
    const prevButton = document.querySelector('.pagination-btn.prev');
    const nextButton = document.querySelector('.pagination-btn.next');
    
    if (prevButton && !prevButton.disabled) {
      prevButton.addEventListener('click', () => {
        const currentPage = getCurrentPage();
        if (currentPage > 1) {
          updateUrlAndReload({ page: currentPage - 1 });
        }
      });
    }
    
    if (nextButton && !nextButton.disabled) {
      nextButton.addEventListener('click', () => {
        const currentPage = getCurrentPage();
        const totalPages = getTotalPages();
        if (currentPage < totalPages) {
          updateUrlAndReload({ page: currentPage + 1 });
        }
      });
    }
    
    // Initialize map functionality if needed
    initializeStoreMap();
  }
};

// Helper functions
function generatePaginationNumbers(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 5;
  
  // Always show first page
  pages.push(1);
  
  if (currentPage > 3) {
    pages.push('...');
  }
  
  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }
  
  // Always show last page if more than 1 page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages.map(page => {
    if (page === '...') {
      return '<span class="pagination-ellipsis">...</span>';
    }
    return `
      <button class="pagination-number ${page === currentPage ? 'active' : ''}" 
              data-page="${page}">
        ${page}
      </button>
    `;
  }).join('');
}

function updateUrlAndReload(updates) {
  const params = new URLSearchParams(window.location.search);
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  
  window.location.href = `/stores?${params.toString()}`;
}

function getCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('page') || '1');
}

function getTotalPages() {
  // This would need to be extracted from the DOM or stored in a global variable
  const paginationNumbers = document.querySelectorAll('.pagination-number');
  return paginationNumbers.length;
}

function initializeStoreMap() {
  // Initialize map view if map container exists
  const mapContainer = document.getElementById('store-map');
  if (mapContainer) {
    // Add map initialization code here
    console.log('Store map initialized');
  }
}

export default StoreListScreen;