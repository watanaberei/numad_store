// import * as style from '../style/style.js';
import * as icon from '../icon/icon.js';
import * as array from '../array/array.js';
import * as control from '../controls/controls.js';
import * as components from '../components.js';


export const businessHours = {
  render: (schedule) => {
    console.log('Rendering business hours with schedule:', schedule);
    
    // Add null check and default value
    if (!schedule || !Array.isArray(schedule)) {
      console.warn('Invalid schedule data:', schedule);
      schedule = [{
        is_open_now: false,
        open: []
      }];
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Process schedule data with safe access
    const hoursData = Array.from({ length: 24 }, (_, i) => {
      const hour = (currentHour + i) % 24;
      const meridian = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const isOpen = Array.isArray(schedule[0]?.open) && schedule[0].open.some(slot => 
        slot && 
        typeof slot.day === 'number' &&
        typeof slot.start === 'string' &&
        typeof slot.end === 'string' &&
        slot.day === currentDay &&
        hour >= parseInt(slot.start) / 100 && 
        hour < parseInt(slot.end) / 100
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

      <div class="timeline col04">
        <div class="container col04">
          <div class="timeline grid08-overflow">
            ${hoursData.map(item => `
              <div class="col01 ${item.status} timeline-item${item.isCurrent ? ' active current' : item.status === 'active' ? ' active' : ' inactive'}">
                <div class="timeline-visual">
                  <div class="timeline-container">
                    <div class="timeline-indicator ${item.status}${item.isCurrent ? ' current' : ''}"></div>
                  </div>
                  <div class="timeline-info">
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
          ${control.controlTimeline.render({
            isCurrentlyActive: hoursData.some(item => item.isCurrent && item.status === 'active'),
            periodLabel: hoursData[currentHour]?.conditions?.weather || 'Unknown'
          })}
        </div>
      </div>
    `;
  },

  afterRender: (container) => {
    console.log('Initializing business hours after render:', container);

    // Initialize timeline controls
    const controls = control.controlTimeline.initializetimelineControl(container, {
      slotsPerView: 8, // Show 8 hours at a time
      updateInterval: 60000 // Update every minute
    });

    const slots = timeline.querySelectorAll('.timeline-item');
    console.log('Found timeline slots:', slots.length);

    // Handle slot interactions
    slots.forEach(slot => {
      const hour = slot.dataset.hour;
      const status = slot.dataset.status;

      slot.addEventListener('mouseenter', () => {
        console.log('Slot hover:', { hour, status });
        showHourDetails(slot);
      });

      slot.addEventListener('mouseleave', () => {
        hideHourDetails(slot);
      });

      // Add click handler for slots
      slot.addEventListener('click', () => {
        console.log('Slot clicked:', { hour, status });
        // Handle any click interactions
        slots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
      });
    });

    // Add control event listeners
    const jumpButton = container.querySelector('.control-jump');
    const prevButton = container.querySelector('.control-previous');
    const nextButton = container.querySelector('.control-next');

    jumpButton?.addEventListener('click', () => {
      console.log('Jump to today clicked');
      // Scroll to current time
      const currentHourEl = container.querySelector('.timeline-item.active.current');
      currentHourEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    prevButton?.addEventListener('click', () => {
      console.log('Previous time period clicked');
      // Implement scroll left
      const timeline = container.querySelector('.timeline');
      timeline.scrollBy({ left: -300, behavior: 'smooth' });
    });

    nextButton?.addEventListener('click', () => {
      console.log('Next time period clicked');
      // Implement scroll right
      const timeline = container.querySelector('.timeline');
      timeline.scrollBy({ left: 300, behavior: 'smooth' });
    });

    // Set up periodic updates
    const updateCurrentTime = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Update current indicators
      const items = container.querySelectorAll('.timeline-item');
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




export const businessHourDetails = {
    formatTime(militaryTime) {
      const hour = parseInt(militaryTime.slice(0, 2));
      const minute = militaryTime.slice(2);
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute} ${period}`;
    },
  
    getDayName(dayNum) {
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayNum];
    },
  
    render(data) {
      console.log('Rendering business hours for:', data?.name);
      
      if (!data?.hours?.[0]?.open) {
        console.warn('Missing hours data');
        return '<div class="timeline">Hours not available</div>';
      }
  
      const hours = data.hours[0].open;
      const isOpen = data.hours[0].is_open_now;
      
      // Get current time
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}${currentMinute}`;
  
      console.log('Current day/time:', this.getDayName(currentDay), currentTime);
  
      const hoursHTML = hours.map(timeSlot => {
        const isCurrentDay = timeSlot.day === currentDay;
        const dayName = this.getDayName(timeSlot.day);
        const startTime = this.formatTime(timeSlot.start);
        const endTime = this.formatTime(timeSlot.end);
        const isWithinHours = isCurrentDay && 
                             currentTime >= timeSlot.start && 
                             currentTime <= timeSlot.end;
  
        return `
          <div class="timeline-row ${isCurrentDay ? 'current-day' : ''} ${isWithinHours ? 'open' : ''}">
            <span class="day text02">${dayName}</span>
            <div class="hours">
              <span class="time text02">${startTime} - ${endTime}</span>
              ${isCurrentDay ? `
                <span class="badge-current text02 ${isOpen ? 'open' : 'closed'}">
                  ${isOpen ? 'Open Now' : 'Closed'}
                </span>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
  
      return `
        <div class="timeline">
          <div class="timeline-header">
            <h3 class="text02">Business Hours - ${data.name}</h3>
            $ {icon.iconTime}
          </div>
          <div class="timeline-content">
            ${hoursHTML}
          </div>
          <div class="current-time text02">
            Current Time: ${this.formatTime(currentTime)}
          </div>
        </div>
      `;
    },
  
    afterRender() {
      const currentDayElement = document.querySelector('.timeline-row.current-day');
      if (currentDayElement) {
        console.log('Scrolling to current day');
        currentDayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };