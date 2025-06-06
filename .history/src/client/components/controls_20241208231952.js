import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';


// Add new control
export const timelineControl = {
  init: (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) {
          console.error(`Container ${containerId} not found.`);
          return;
      }

      // Add controls dynamically
      const controls = document.createElement('div');
      controls.className = 'new-control';
      controls.innerHTML = `
          <button class="control-prev">Previous</button>
          <button class="control-next">Next</button>
      `;
      container.appendChild(controls);

      // Event Listeners
      const prevButton = controls.querySelector('.control-prev');
      const nextButton = controls.querySelector('.control-next');
      prevButton.addEventListener('click', () => {
          console.log('Previous button clicked.');
          // Add logic for previous action
      });
      nextButton.addEventListener('click', () => {
          console.log('Next button clicked.');
          // Add logic for next action
      });
  },
};

// export const timelineControls = {
//   render: (data) => {
//     console.log('Rendering timeline controls with:', data);
    
//     return `
//       <div class="timeline-controls-container">
//         <div class="timeline-navigation array">
//           <button class="timeline-nav-button prev" aria-label="Previous hour">
//             <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
//               <path d="M5 0.5L1 4.5L5 8.5" stroke="currentColor" stroke-width="1.5"/>
//             </svg>
//           </button>
          
//           <div class="timeline-indicator">
//             <div class="current-time-marker"></div>
//             <div class="timeline-slots">
//               ${Array(24).fill().map((_, i) => `
//                 <div class="timeline-slot ${i === new Date().getHours() ? 'current' : ''}" 
//                      data-hour="${i}">
//                   <span class="hour-label">${i}:00</span>
//                 </div>
//               `).join('')}
//             </div>
//           </div>

//           <button class="timeline-nav-button next" aria-label="Next hour">
//             <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
//               <path d="M1 0.5L5 4.5L1 8.5" stroke="currentColor" stroke-width="1.5"/>
//             </svg>
//           </button>
//         </div>
        
//         <div class="timeline-status">
//           <span class="status-text text02">
//             ${data.isCurrentlyActive ? 'Currently Active' : 'Currently Inactive'} • 
//             ${data.periodLabel || 'Light Rate'}
//           </span>
//         </div>
//       </div>
//     `;
//   },

//   initialize: (container, options = {}) => {
//     console.log('Initializing timeline controls:', container);
    
//     const timeline = container.querySelector('.timeline-slots');
//     const slots = container.querySelectorAll('.timeline-slot');
//     const prevBtn = container.querySelector('.timeline-nav-button.prev');
//     const nextBtn = container.querySelector('.timeline-nav-button.next');
//     const marker = container.querySelector('.current-time-marker');
    
//     let currentViewStart = 0;
//     const slotsPerView = options.slotsPerView || 8;
//     const totalSlots = slots.length;

//     const updateTimelineView = (newStart) => {
//       console.log('Updating timeline view to start at:', newStart);
      
//       currentViewStart = Math.max(0, Math.min(newStart, totalSlots - slotsPerView));
      
//       // Update scroll position
//       timeline.style.transform = `translateX(-${(currentViewStart / totalSlots) * 100}%)`;
      
//       // Update slot visibility
//       slots.forEach((slot, index) => {
//         const isVisible = index >= currentViewStart && index < currentViewStart + slotsPerView;
//         slot.classList.toggle('visible', isVisible);
//       });

//       // Update button states
//       prevBtn.disabled = currentViewStart === 0;
//       nextBtn.disabled = currentViewStart >= totalSlots - slotsPerView;
//     };

//     const updateCurrentTimeMarker = () => {
//       const now = new Date();
//       const percent = ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;
//       marker.style.left = `${percent}%`;
//     };

//     // Initialize state
//     updateTimelineView(0);
//     updateCurrentTimeMarker();

//     // Event listeners
//     prevBtn?.addEventListener('click', () => {
//       updateTimelineView(currentViewStart - slotsPerView);
//     });

//     nextBtn?.addEventListener('click', () => {
//       updateTimelineView(currentViewStart + slotsPerView);
//     });

//     // Hover interactions for slots
//     slots.forEach(slot => {
//       slot.addEventListener('mouseenter', () => {
//         const hour = slot.dataset.hour;
//         slot.setAttribute('title', `${hour}:00`);
        
//         // Add any additional hover state styling
//         slot.classList.add('hover');
//       });

//       slot.addEventListener('mouseleave', () => {
//         slot.classList.remove('hover');
//       });
//     });

//     // Update current time marker periodically
//     setInterval(updateCurrentTimeMarker, 60000);

//     return {
//       updateTimelineView,
//       updateCurrentTimeMarker
//     };
//   }
// };