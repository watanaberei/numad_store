// components/places.js

import * as style from '../style/style.js';
import * as icon from '../icon/icon.js';
import * as array from './array.js';



export const businessHours = {
    render: (schedule) => {
      const hoursData = Array.from({length: 24}, (_, i) => ({
        hour: i,
        status: 'unknown',
        info: {
          time: `${i}:00`,
          activity: 'No data available'
        }
      }));
  
      return array.create.createTimeline(
        {
          render: (datavis) => `
            <div class="datavis-item ${datavis.status}" data-hour="${datavis.hour}">
              <div class="hour-marker">
                <span class="text02">${datavis.hour}:00</span>
              </div>
              <div class="hour-info">
                <div class="info-content">
                  <span class="text02">${datavis.info.time}</span>
                  <span class="text02">${datavis.info.activity}</span>
                </div>
              </div>
            </div>
          `
        },
        hoursData,
        'business-hours',
        'chronological',
        'timeline',
        24
      );
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
      return '<div class="business-hours">Hours not available</div>';
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
        <div class="business-hours-row ${isCurrentDay ? 'current-day' : ''} ${isWithinHours ? 'open' : ''}">
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
      <div class="business-hours">
        <div class="business-hours-header">
          <h3 class="text02">Business Hours - ${data.name}</h3>
          $ {icon.iconTime}
        </div>
        <div class="business-hours-content">
          ${hoursHTML}
        </div>
        <div class="current-time text02">
          Current Time: ${this.formatTime(currentTime)}
        </div>
      </div>
    `;
  },

  afterRender() {
    const currentDayElement = document.querySelector('.business-hours-row.current-day');
    if (currentDayElement) {
      console.log('Scrolling to current day');
      currentDayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};