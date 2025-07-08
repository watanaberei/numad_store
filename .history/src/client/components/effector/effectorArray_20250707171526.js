///////////////////////// START ARRAYEFFECTOR MODULE /////////////////////////
// src/client/components/array/arrayEffector.js - Simple array utility for carousels and grids

console.log('[arrayEffector.js:3] ArrayEffector module loading...');

export const arrayCarousel = (component) => {
  return {
    render: (dataArray, options = {}) => {
      console.log('[arrayEffector.js:8] Rendering carousel with data:', dataArray.length, 'items');
      
      const {
        limit = 6,
        showControls = true,
        className = '',
        emptyMessage = 'No items to display'
      } = options;
      
      // Limit data if specified
      const limitedData = limit ? dataArray.slice(0, limit) : dataArray;
      
      console.log('[arrayEffector.js:19] Limited data to:', limitedData.length, 'items');
      
      if (limitedData.length === 0) {
        return `<div class="empty-state"><p>${emptyMessage}</p></div>`;
      }
      
      // Generate carousel items
      let carouselItems = '';
      for (let i = 0; i < limitedData.length; i++) {
        const item = limitedData[i];
        console.log('[arrayEffector.js:28] Processing item:', i, item.title || item.slug || 'Unnamed');
        
        try {
          const cardHTML = component.render(item);
          carouselItems += `<div class="carousel-item col01" data-index="${i}">${cardHTML}</div>`;
        } catch (error) {
          console.warn('[arrayEffector.js:34] Error rendering item:', error);
          carouselItems += `<div class="carousel-item col01 error-item" data-index="${i}">
            <div class="error-fallback">
              <p>Error loading item</p>
            </div>
          </div>`;
        }
      }
      
      const carouselHTML = `
        <div class="carousel-container ${className}">
          <div class="carousel-scroll">
            ${carouselItems}
          </div>
          ${showControls ? `
            <div class="carousel-navigation">
              <button class="carousel-nav prev" disabled>←</button>
              <button class="carousel-nav next" ${limitedData.length <= 1 ? 'disabled' : ''}>→</button>
            </div>
          ` : ''}
        </div>
      `;
      
      console.log('[arrayEffector.js:54] Carousel HTML generated successfully');
      return carouselHTML;
    },
    
    afterRender: (containerSelector = '.carousel-container') => {
      console.log('[arrayEffector.js:59] Initializing carousel controls for:', containerSelector);
      
      const carousels = document.querySelectorAll(containerSelector);
      
      carousels.forEach((carousel, carouselIndex) => {
        console.log('[arrayEffector.js:64] Setting up carousel:', carouselIndex);
        
        const scrollContainer = carousel.querySelector('.carousel-scroll');
        const items = carousel.querySelectorAll('.carousel-item');
        const prevBtn = carousel.querySelector('.carousel-nav.prev');
        const nextBtn = carousel.querySelector('.carousel-nav.next');
        
        if (!scrollContainer || items.length === 0) {
          console.warn('[arrayEffector.js:71] Carousel setup failed - missing elements');
          return;
        }
        
        let currentIndex = 0;
        const maxIndex = Math.max(0, items.length - 1);
        
        console.log('[arrayEffector.js:77] Carousel initialized with', items.length, 'items');
        
        const updateControls = () => {
          if (prevBtn) prevBtn.disabled = currentIndex === 0;
          if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
          
          console.log('[arrayEffector.js:83] Controls updated - index:', currentIndex, 'max:', maxIndex);
        };
        
        const scrollToItem = (index) => {
          if (index < 0 || index > maxIndex) return;
          
          const targetItem = items[index];
          if (targetItem) {
            targetItem.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest',
              inline: 'start' 
            });
            currentIndex = index;
            updateControls();
            
            console.log('[arrayEffector.js:98] Scrolled to item:', index);
          }
        };
        
        // Event listeners
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            console.log('[arrayEffector.js:105] Previous button clicked');
            scrollToItem(currentIndex - 1);
          });
        }
        
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            console.log('[arrayEffector.js:111] Next button clicked');
            scrollToItem(currentIndex + 1);
          });
        }
        
        // Initialize card components if they have afterRender methods
        try {
          if (component.afterRender && typeof component.afterRender === 'function') {
            console.log('[arrayEffector.js:118] Calling component afterRender');
            component.afterRender();
          }
        } catch (error) {
          console.warn('[arrayEffector.js:122] Error in component afterRender:', error);
        }
        
        // Initial state
        updateControls();
      });
      
      console.log('[arrayEffector.js:128] All carousels initialized');
    }
  };
};

export const arrayGrid = (component) => {
  return {
    render: (dataArray, options = {}) => {
      console.log('[arrayEffector.js:136] Rendering grid with data:', dataArray.length, 'items');
      
      const {
        limit = 12,
        columns = 'auto',
        className = '',
        emptyMessage = 'No items to display'
      } = options;
      
      // Limit data if specified
      const limitedData = limit ? dataArray.slice(0, limit) : dataArray;
      
      console.log('[arrayEffector.js:148] Limited grid data to:', limitedData.length, 'items');
      
      if (limitedData.length === 0) {
        return `<div class="empty-state"><p>${emptyMessage}</p></div>`;
      }
      
      // Generate grid items
      let gridItems = '';
      for (let i = 0; i < limitedData.length; i++) {
        const item = limitedData[i];
        console.log('[arrayEffector.js:158] Processing grid item:', i, item.title || item.slug || 'Unnamed');
        
        try {
          const cardHTML = component.render(item);
          gridItems += `<div class="grid-item" data-index="${i}">${cardHTML}</div>`;
        } catch (error) {
          console.warn('[arrayEffector.js:164] Error rendering grid item:', error);
          gridItems += `<div class="grid-item error-item" data-index="${i}">
            <div class="error-fallback">
              <p>Error loading item</p>
            </div>
          </div>`;
        }
      }
      
      const columnClass = columns === 'auto' ? '' : `grid-cols-${columns}`;
      
      const gridHTML = `
        <div class="grid-container ${className} ${columnClass}">
          ${gridItems}
        </div>
      `;
      
      console.log('[arrayEffector.js:179] Grid HTML generated successfully');
      return gridHTML;
    },
    
    afterRender: () => {
      console.log('[arrayEffector.js:184] Initializing grid components');
      
      // Initialize card components if they have afterRender methods
      try {
        if (component.afterRender && typeof component.afterRender === 'function') {
          console.log('[arrayEffector.js:189] Calling component afterRender for grid');
          component.afterRender();
        }
      } catch (error) {
        console.warn('[arrayEffector.js:193] Error in component afterRender:', error);
      }
    }
  };
};

///////////////////////// END ARRAYEFFECTOR MODULE /////////////////////////