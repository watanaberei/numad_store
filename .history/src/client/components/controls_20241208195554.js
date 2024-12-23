import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';

export const timelineControls = {
  render: (data) => {
    console.log('Rendering timeline controls with:', data);
    
    return `
      <div class="timeline-controls-container">
        <div class="timeline-navigation array">
          <button class="timeline-nav-button prev" aria-label="Previous hour">
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M5 0.5L1 4.5L5 8.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          
          <div class="timeline-indicator">
            <div class="current-time-marker"></div>
            <div class="timeline-slots">
              ${Array(24).fill().map((_, i) => `
                <div class="timeline-slot ${i === new Date().getHours() ? 'current' : ''}" 
                     data-hour="${i}">
                  <span class="hour-label">${i}:00</span>
                </div>
              `).join('')}
            </div>
          </div>

          <button class="timeline-nav-button next" aria-label="Next hour">
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M1 0.5L5 4.5L1 8.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
        
        <div class="timeline-status">
          <span class="status-text text02">
            ${data.isCurrentlyActive ? 'Currently Active' : 'Currently Inactive'} • 
            ${data.periodLabel || 'Light Rate'}
          </span>
        </div>
      </div>
    `;
  },

  initializeBusinessHours: (container) => {
    console.log('Initializing business hours controls:', container);

    const datavis = container.querySelector('.datavis');
    const prevBtn = container.querySelector('.control-previous');
    const nextBtn = container.querySelector('.control-next');
    const jumpBtn = container.querySelector('.control-jump');
    const statusLabel = container.querySelector('.status .label');

    let scrollPosition = 0;
    const scrollAmount = 300; // Adjust based on item width

    // Navigation controls
    const updateNavigationState = () => {
      const maxScroll = datavis.scrollWidth - datavis.clientWidth;
      prevBtn.disabled = scrollPosition <= 0;
      nextBtn.disabled = scrollPosition >= maxScroll;
      
      console.log('Updated navigation state:', {
        scrollPosition,
        maxScroll,
        canScrollPrev: !prevBtn.disabled,
        canScrollNext: !nextBtn.disabled
      });
    };

    prevBtn?.addEventListener('click', () => {
      console.log('Previous clicked, current scroll:', scrollPosition);
      scrollPosition = Math.max(0, scrollPosition - scrollAmount);
      datavis.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      updateNavigationState();
    });

    nextBtn?.addEventListener('click', () => {
      console.log('Next clicked, current scroll:', scrollPosition);
      scrollPosition = Math.min(
        datavis.scrollWidth - datavis.clientWidth,
        scrollPosition + scrollAmount
      );
      datavis.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      updateNavigationState();
    });

    // Jump to current time
    jumpBtn?.addEventListener('click', () => {
      console.log('Jump to current time clicked');
      const currentItem = container.querySelector('.datavis-item.active.current');
      if (currentItem) {
        const itemLeft = currentItem.offsetLeft;
        const containerWidth = datavis.clientWidth;
        scrollPosition = Math.max(0, itemLeft - (containerWidth / 2) + (currentItem.offsetWidth / 2));
        
        datavis.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
        updateNavigationState();
      }
    });

    // Update current time and status
    const updateTimeDisplay = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const items = container.querySelectorAll('.datavis-item');
      
      items.forEach(item => {
        const hour = parseInt(item.getAttribute('data-hour'));
        const isCurrent = hour === currentHour;
        
        if (isCurrent) {
          item.classList.add('active', 'current');
          // Update status label based on current conditions
          if (statusLabel) {
            statusLabel.textContent = item.getAttribute('data-status') === 'active' 
              ? 'Currently Active' 
              : 'Currently Closed';
          }
        } else {
          item.classList.remove('current');
        }
      });

      console.log('Updated time display:', {
        currentHour,
        status: statusLabel?.textContent
      });
    };

    // Initialize scroll position to current time
    const initializePosition = () => {
      const currentItem = container.querySelector('.datavis-item.active.current');
      if (currentItem) {
        requestAnimationFrame(() => {
          const itemLeft = currentItem.offsetLeft;
          const containerWidth = datavis.clientWidth;
          scrollPosition = Math.max(0, itemLeft - (containerWidth / 2) + (currentItem.offsetWidth / 2));
          
          datavis.scrollTo({
            left: scrollPosition,
            behavior: 'instant'
          });
          updateNavigationState();
        });
      }
    };

    // Set up periodic updates
    const updateInterval = setInterval(updateTimeDisplay, 60000);
    
    // Initialize
    updateTimeDisplay();
    initializePosition();
    updateNavigationState();

    // Cleanup function
    return () => {
      clearInterval(updateInterval);
      prevBtn?.removeEventListener('click', null);
      nextBtn?.removeEventListener('click', null);
      jumpBtn?.removeEventListener('click', null);
    };
  },

  // Separator components
  seperatorCluster: {
    render: () => `<div class="seperator">|</div>`
  },

  seperatorWord: {
    render: () => `<div class="seperator">,</div>`
  }
};