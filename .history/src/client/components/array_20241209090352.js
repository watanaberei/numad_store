import { cardCategoryItem } from '../cards/cards.js';
import { serviceCategoryData } from '../../server/data/data.js'; // Add this import
import * as control from './controls.js'; // Keep as-is for scalability
import * as places from './place.js'; // Keep as-is for scalability





const timelineControls = control.timelineControl;

function initializeMediaItem(card) {
  const contents = card.querySelectorAll('.card-content');
  const dots = card.querySelectorAll('.indicator-dot');
  let currentIndex = 0;

  // Create click zones for navigation
  const leftZone = document.createElement('div');
  leftZone.className = 'click-zone left';
  const rightZone = document.createElement('div');
  rightZone.className = 'click-zone right';
  
  card.appendChild(leftZone);
  card.appendChild(rightZone);

  const showItem = (index, isNext = true) => {
    console.log('Showing media item:', index, isNext);
    const newIndex = isNext ? 
      (index + contents.length) % contents.length : 
      (index - 1 + contents.length) % contents.length;
    
    contents.forEach((content, i) => {
      content.classList.toggle('active', i === newIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('inactive', i !== newIndex);
    });

    currentIndex = newIndex;
  };

  // Navigation zone clicks
  leftZone.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showItem(currentIndex, false);
  });

  rightZone.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showItem(currentIndex, true);
  });

  // Initialize interactive elements
  contents.forEach(content => {
    const mediaContainer = content.querySelector('.media-container');
    if (mediaContainer) {
      mediaContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const galleryUrl = content.dataset.galleryUrl;
        if (galleryUrl) {
          console.log('Opening gallery:', galleryUrl);
          // Add gallery modal handling here
        }
      });
    }

    // Add impression handlers if needed
    const impressionCount = content.querySelector('.impression-count');
    if (impressionCount) {
      impressionCount.addEventListener('click', (e) => {
        e.stopPropagation();
        const data = JSON.parse(content.dataset.impressions || '{}');
        console.log('Impression data:', data);
        // Handle impressions display
      });
    }
  });
}




export const create = {
  create: (component, dataSource, arrayType, limit) => {
    let items = [];
    let limitedData = dataSource;

    if (limit !== '1/-1') {
      if (typeof limit === 'number') {
        limitedData = dataSource.slice(0, limit);
      } else if (typeof limit === 'string') {
        const [start, end] = limit.split('/').map(Number);
        limitedData = dataSource.slice(start - 1, end);
      }
    }

    switch (arrayType) {
      case 'nest':
        items = limitedData.map(item => places.businessHours.render(item));
        break;
      default:
        items = limitedData.map(item => component.render(item));
    }

    return items.join('');
  },  
  

  createCarousel: (component, dataSource, carouselType, sourceType, style, limit) => {
    console.log('Creating carousel with:', { carouselType, sourceType, style });
    
    let processedData = Object.entries(dataSource)
      .map(([key, value]) => ({ ...value, key }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
    
    console.log('Processed carousel data:', processedData);
    
    const totalPages = Math.ceil(processedData.length / 4);

    return `
      <div class="carousel-container col04 ${style || ''}" data-carousel-type="${carouselType}">
        <div class="carousel-track grid04-overflow">
          ${processedData.map((item, index) => `
            <div class="carousel-item col01 ${index < 4 ? 'active' : ''}" data-index="${index}">
              ${component.render(item)}
            </div>
          `).join('')}
        </div>
        
        <div class="carousel-controls array">
          <div class="pagination">
            <div class="pagination-dot">
              ${Array.from({ length: totalPages }, (_, i) => `
                <div class="ellipse-indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
              `).join('')}
            </div>
          </div>
          <div class="controls array">
            <button class="control-button prev" aria-label="Previous" disabled>
              <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
                <path d="M5 0.5L1 4.5L5 8.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
            <button class="control-button next" aria-label="Next" ${processedData.length <= 4 ? 'disabled' : ''}>
              <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
                <path d="M1 0.5L5 4.5L1 8.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  initializeCarousel: (carouselType) => {
    console.log('Initializing carousel:', carouselType);
    const carousel = document.querySelector(`[data-carousel-type="${carouselType}"]`);
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const items = carousel.querySelectorAll('.carousel-item');
    const dots = carousel.querySelectorAll('.pagination-dot');
    const prevBtn = carousel.querySelector('.control-button.prev');
    const nextBtn = carousel.querySelector('.control-button.next');
    let currentStart = 0;
    const itemsPerPage = 4;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    console.log(`Found ${items.length} total items, ${totalPages} pages`);

    // Initialize items based on type
    items.forEach(item => {
      const cardItem = item.querySelector('.card-item');
      if (!cardItem) return;

      console.log('Initializing card item type:', carouselType);
      
      switch(carouselType) {
        case 'area':
          initializeMediaItem(cardItem);
          break;
        case 'category':
          initializeCardItem(cardItem);
          break;
        default:
          console.log('Unknown carousel type:', carouselType);
      }
    });

    

    
    function initializeCardItem(card) {
      const contents = card.querySelectorAll('.card-content');
      const dots = card.querySelectorAll('.ellipse-indicator');
      let currentIndex = 0;

      // Create click zones for navigation
      const leftZone = document.createElement('div');
      leftZone.className = 'click-zone left';
      const rightZone = document.createElement('div');
      rightZone.className = 'click-zone right';
      
      card.appendChild(leftZone);
      card.appendChild(rightZone);

      const showItem = (index, isNext = true) => {
        const newIndex = isNext ? 
          (index + contents.length) % contents.length : 
          (index - 1 + contents.length) % contents.length;
        
        contents.forEach((content, i) => {
          content.classList.toggle('active', i === newIndex);
        });

        // Update dots visually but don't make them interactive
        dots.forEach((dot, i) => {
          dot.classList.toggle('inactive', i !== newIndex);
        });

        currentIndex = newIndex;
      };

      // Navigation zone clicks
      leftZone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showItem(currentIndex, false); // false for previous
      });

      rightZone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showItem(currentIndex, true); // true for next
      });

      // Add click handlers for pills and description
      contents.forEach(content => {
        // Area link (top left pill)
        const areaPill = content.querySelector('.amtag-category');
        if (areaPill) {
          areaPill.addEventListener('click', (e) => {
            e.stopPropagation();
            const area = card.dataset.area;
            const areaData = store.experience.area.item.find(i => i.area === area);
            const galleryLink = content.closest('.card-content').dataset.galleryUrl;
            if (galleryLink) {
              window.location.href = galleryLink;
            }
          });
        }
        // const areaPill = content.querySelector('.amtag-category');
        // if (areaPill) {
        //   areaPill.addEventListener('click', (e) => {
        //     e.stopPropagation();
        //     const area = content.closest('.card-item').dataset.area;
        //     const areaData = store.experience.area.item.find(i => i.area === area);
        //     if (areaData?.links?.gallery) {
        //       window.location.href = areaData.links.gallery;
        //     }
        //   });
        // }
        

        // Category link (top left pill)
        const categoryPill = content.querySelector('.amtag-category');
        if (categoryPill) {
          categoryPill.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = content.closest('.card-item').dataset.category;
            const categoryData = serviceCategoryData[category.toLowerCase()];
            if (categoryData?.links?.image) {
              window.location.href = categoryData.links.image;
            }
          });
        }

        // Source link (top right pill)
        const sourcePill = content.querySelector('.badge');
        if (sourcePill) {
          sourcePill.addEventListener('click', (e) => {
            e.stopPropagation();
            const imageIndex = content.dataset.index;
            const area = content.closest('.card-item').dataset.area;
            const areaData = store.experience.area.item.find(i => i.area === area);
            const sourceUrl = areaData?.images[imageIndex]?.source?.links?.source;
            if (sourceUrl) {
              window.open(sourceUrl, '_blank');
            }
          });
        }

        // Profile link (description)
        const description = content.querySelector('.value.pill');
        if (description) {
          description.addEventListener('click', (e) => {
            e.stopPropagation();
            const imageIndex = content.dataset.index;
            const area = content.closest('.card-item').dataset.area;
            const areaData = store.experience.area.item.find(i => i.area === area);
            const profileUrl = areaData?.images[imageIndex]?.thumbnail?.post?.poster?.links?.profile;
            if (profileUrl) {
              window.open(profileUrl, '_blank');
            }
          });
        }
      });
    }

    // Handle carousel navigation
    const updateCarousel = (direction) => {
      const oldStart = currentStart;
      
      if (direction === 'next') {
        currentStart = Math.min(currentStart + itemsPerPage, items.length - itemsPerPage);
      } else if (direction === 'prev') {
        currentStart = Math.max(currentStart - itemsPerPage, 0);
      }

      if (oldStart === currentStart) return;

      // Update carousel position
      track.style.transform = `translateX(-${currentStart * (100 / itemsPerPage)}%)`;

      // Update items visibility
      items.forEach((item, i) => {
        const isVisible = i >= currentStart && i < currentStart + itemsPerPage;
        item.classList.toggle('active', isVisible);
      });

      // Update dots
      const currentPage = Math.floor(currentStart / itemsPerPage);
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPage);
      });

      // Update button states
      prevBtn.disabled = currentStart === 0;
      nextBtn.disabled = currentStart >= items.length - itemsPerPage;
    };

    // Event listeners for carousel controls
    prevBtn?.addEventListener('click', () => updateCarousel('prev'));
    nextBtn?.addEventListener('click', () => updateCarousel('next'));
  },

  createTimeline: (component, dataSource, type, sortBy = 'chronological', style, limit) => {
    console.log('Creating timeline:', { type, sortBy, style, dataSource });
    
    const processedData = dataSource.slice(0, limit).map((item, index) => ({
      ...item,
      index
    }));

    // Get current hour for initial state
    const currentHour = new Date().getHours();
    
    return `
    <div class="business-hours">
      <div class="container col04 ${style}" data-timeline-type="${type}">
        ${control.timelineControl.render({
          isCurrentlyActive: processedData.some(item => item.hour === currentHour && item.status === 'active'),
          periodLabel: processedData[currentHour]?.info?.activity || 'Unknown'
        })}

        
        <div class="datavis timeline-track grid08-overflow">
          ${processedData.map(item => `
            <div class="datavis-item col01 ${item.hour === currentHour ? 'current' : ''}" 
                data-hour="${item.hour}"
                data-status="${item.status}">
                
                 
       
              ${component.render(item)}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
},  

// export const initializeNewFeature = (containerId) => {
//     console.log('Initializing new feature:', containerId);
//     newControl.init(containerId);
// };
initializeTimeline: (timelineType) => {
  console.log(`Initializing timeline for type: ${timelineType}`);

  // Find the container for the timeline
  const container = document.getElementById(timelineType);
  if (!container) {
      console.error(`Timeline container not found for type: ${timelineType}`);
      return;
  }

  // New addition: Initialize controls for navigation
  controls.timelineControl.init(timelineType);

  // Set up event listeners for interaction
  const timelineItems = container.querySelectorAll('.timeline-item');
  let currentIndex = 0;

  const showTimelineItem = (index) => {
      console.log(`Showing timeline item at index: ${index}`);
      timelineItems.forEach((item, idx) => {
          item.classList.toggle('active', idx === index);
          item.classList.toggle('inactive', idx !== index);
      });
      currentIndex = index;
  };

  const navigateTimeline = (direction) => {
      const newIndex = (currentIndex + direction + timelineItems.length) % timelineItems.length;
      console.log(`Navigating timeline to index: ${newIndex}`);
      showTimelineItem(newIndex);
  };

  container.addEventListener('click', (event) => {
      if (event.target.classList.contains('control-prev')) {
          navigateTimeline(-1); // Go to previous item
      } else if (event.target.classList.contains('control-next')) {
          navigateTimeline(1); // Go to next item
      }
  });

  // Initialize the first timeline item
  if (timelineItems.length > 0) {
      showTimelineItem(0);
  }

  console.log(`Timeline for ${timelineType} initialized with ${timelineItems.length} items.`);
},
};

