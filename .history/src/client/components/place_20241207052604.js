import * as style from '../style/style.js';
import * as icon from '../icon/icon.js';
import * as array from '../components/array.js';
import * as controls from '../components/controls.js';

export const businessHours = {
  render: (schedule) => {
    console.log('Rendering business hours with schedule:', schedule);

    const now = new Date();
    const currentHour = now.getHours();

    // Process schedule data
    const hoursData = Array.from({length: 24}, (_, i) => {
      const hour = (currentHour + i) % 24;
      const meridian = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const isOpen = schedule?.hours?.[0]?.open.some(slot => 
        hour >= parseInt(slot.start)/100 && 
        hour <= parseInt(slot.end)/100
      );
      const status = isOpen ? 'active' : 'inactive';
      const isCurrent = hour === currentHour;

      return {
        hour,
        displayHour,
        meridian,
        status,
        isCurrent,
        conditions: {
          temp: '60°F',
          weather: 'Light Rain'
        }
      };
    });

    console.log('Processed hours data:', hoursData);

    return `
      <div class="business-hours">
        <div class="container">
          <div class="datavis">
            ${hoursData.map(item => `
              <div class="datavis-item${item.isCurrent ? ' active current' : item.status === 'active' ? ' active' : ' inactive'}">
                <div class="datavis-visual">
                  <div class="datavis-container">
                    <div class="datavis-indicator ${item.status}${item.isCurrent ? ' current' : ''}"></div>
                  </div>
                  <div class="datavis-info">
                    ${item.isCurrent ? `
                      <div class="primary">
                        <div class="pill">
                          <div class="content">
                            <span class="label text02">Mon</span>
                          </div>
                        </div>
                      </div>
                      <span class="time secondary sentance">
                        <i class="icon-indicator-live"></i>
                        <span class="time word">
                          <span id="time-hour">${item.displayHour}</span>
                          <span id="time-meridian">${item.meridian.toLowerCase()}</span>
                        </span>
                      </span>
                    ` : `
                      <div class="secondary">
                        <span id="time" class="text02 word">
                          <span id="time-hour">${item.displayHour}</span>
                          <span id="time-meridian">${item.meridian.toLowerCase()}</span>
                        </span>
                      </div>
                    `}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="tools">
          <div class="detail">
            <div class="status">
              <span class="label text02">Currently Packed</span>
            </div>
            ${controls.seperatorCluster.render()}
            <span class="text02 detail-conditions sentance">
              <span class="temp">60°F</span>
              ${controls.seperatorWord.render()}
              <span class="text02">Light Rain</span>
            </span>
          </div>
          <div class="control">
            <button class="control-jump">
              <div class="label">
                <span class="text02">Today</span>
              </div>
            </button>
            <div class="navigation">
              <button class="control-previous">
                <i class="icon-action-prev">${icon.iconActionPrev}</i>
              </button>
              <button class="control-next">
                <i class="icon-action-next">${icon.iconActionNext}</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender: (container) => {
    console.log('Initializing business hours after render:', container);

    // Add control event listeners
    const jumpButton = container.querySelector('.control-jump');
    const prevButton = container.querySelector('.control-previous');
    const nextButton = container.querySelector('.control-next');

    jumpButton?.addEventListener('click', () => {
      console.log('Jump to today clicked');
      // Scroll to current time
      const currentHourEl = container.querySelector('.datavis-item.active.current');
      currentHourEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    prevButton?.addEventListener('click', () => {
      console.log('Previous time period clicked');
      // Implement scroll left
      const datavis = container.querySelector('.datavis');
      datavis.scrollBy({ left: -300, behavior: 'smooth' });
    });

    nextButton?.addEventListener('click', () => {
      console.log('Next time period clicked');
      // Implement scroll right
      const datavis = container.querySelector('.datavis');
      datavis.scrollBy({ left: 300, behavior: 'smooth' });
    });

    // Set up periodic updates
    const updateCurrentTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Update current indicators
      const items = container.querySelectorAll('.datavis-item');
      items.forEach(item => {
        const hourEl = item.querySelector('#time-hour');
        const hour = parseInt(hourEl?.textContent);
        item.classList.toggle('current', hour === currentHour);
      });
    };

    const updateInterval = setInterval(updateCurrentTime, 60000);
    container._cleanup = () => clearInterval(updateInterval);
  }
};