// ./src/client/components/places.js
import * as icon from "../icon/icon.js";
import * as array from "./array.js";

// export const businessHours = {
//   render: (schedule) => {
//     if (!Array.isArray(schedule) || schedule.length === 0) {
//       console.warn("No valid schedule provided for business hours");
//       return `<div class="business-hours">Hours not available</div>`;
//     }

//     const now = new Date();
//     const currentHour = now.getHours();

//     const hoursData = Array.from({ length: 24 }, (_, i) => {
//       const meridian = i >= 12 ? "PM" : "AM";
//       const status = schedule.some(
//         (slot) => slot.day === now.getDay() &&
//                   i >= parseInt(slot.start) / 100 &&
//                   i <= parseInt(slot.end) / 100
//       )
//         ? "active"
//         : "inactive";
//       return {
//         hour: i,
//         status,
//         current: i === currentHour,
//         info: {
//           time: `${i}:00`,
//           meridian,
//           activity: status === "active" ? "Open" : "Closed"
//         }
//       };
//     });

//     return `
//       <div class="business-hours col04">
//         <div class="container col04 timeline" data-datavis-type="business-hours">
//           <div class="datavis datavis-track grid08-overflow">
//             ${hoursData.map((datavis) => `
//               <div class="col01 datavis-item time-item ${datavis.current ? "current" : ""}" data-hour="${datavis.hour}">
//                 <div class="datavis-visual ${datavis.status}">
//                   <div class="datavis-container ${datavis.status}">
//                     <div class="datavis-indicator"></div>
//                   </div>
//                 </div>
//                 <div class="datavis-info">
//                   <div class="primary">${datavis.info.activity}</div>
//                   <div class="secondary">
//                     <div class="time">${datavis.info.time} ${datavis.info.meridian}</div>
//                   </div>
//                 </div>
//               </div>
//             `).join("")}
//           </div>
//         </div>
//       </div>
//     `;
//   }
// };


export const businessHours = {
  render: (schedule) => {
        if (!Array.isArray(schedule) || schedule.length === 0) {
      console.warn("No valid schedule provided for business hours");
      return `<div class="business-hours">Hours not available</div>`;
    }

    const now = new Date();
    const currentHour = now.getHours();

    const hoursData = Array.from({ length: 24 }, (_, i) => {
      const meridian = i >= 12 ? "PM" : "AM";
      const status = schedule.some(
        (slot) => slot.day === now.getDay() &&
                  i >= parseInt(slot.start) / 100 &&
                  i <= parseInt(slot.end) / 100
      )
        ? "active"
        : "inactive";
      return {
        hour: i,
        status,
        current: i === currentHour,
        info: {
          time: `${i}:00`,
          meridian,
          activity: status === "active" ? "Open" : "Closed"
        }
      };
    });
    // if (!Array.isArray(schedule) || schedule.length === 0) {
    //   console.warn("No valid schedule provided for business hours");
    //   return `<div class="business-hours">Hours not available</div>`;
    // }
    // const now = new Date();
    // const currentHour = now.getHours();

    // const hoursData = Array.from({ length: 24 }, (_, i) => {
    //   const meridian = i >= 12 ? "PM" : "AM";
    //   const status = schedule.some(
    //     (slot) => slot.day === now.getDay() &&
    //               i >= parseInt(slot.start) / 100 &&
    //               i <= parseInt(slot.end) / 100
    //   )
    //     ? "active"
    //     : "inactive";
    //   console.log("______", i, status, i === currentHour, {
    //     time: `${i}:00`,
    //     meridian,
    //     activity: status === "active" ? "Open" : "Closed"
    //   });
    //   return {
    //     hour: i,
    //     status,
    //     current: i === currentHour,
    //     info: {
    //       time: `${i}:00`,
    //       meridian,
    //       activity: status === "active" ? "Open" : "Closed"
    //     }
    //   };
    // });
return `
      <div class="business-hours col04">
        <div class="container col04 timeline" data-datavis-type="business-hours">
          <div class="datavis datavis-track grid08-overflow">
            ${hoursData.map((datavis) => `
              <div id="datavis-item" class="col01 datavis-item time-item ${datavis.current ? "current" : ""}" data-hour="${datavis.hour}">
                <div class="datavis-visual ${datavis.status}">
                  <div class="datavis-container ${datavis.status}">
                    <div class="datavis-indicator"></div>
                  </div>
                </div>
                <div class="datavis-info">
                  <div class="primary">
                    ${datavis.info.activity}
                  </div>
                  <div class="secondary">
                    <div class="time">
                      <span class="text02 word">
                        <span id="time-hour" class="text02">${datavis.hour}</span>
                        <span id="time-meridian" class="text02">${datavis.info.meridian}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};
  //   return array.create.createDatavis(
  //     {
  //       render: (datavis) => `
  //           <div id="datav" class="col01 datavis-item time-item ${
  //             datavis.current ? "current" : ""
  //           }" data-hour="${datavis.hour}">
  //               <div class="datavis-visual ${datavis.status}">
  //                   <div class="datavis-container ${datavis.status}">
  //                       <div class="datavis-indicator "></div>
  //                   </div>
  //               </div>
  //               <div class="datavis-info">
  //                   <div class="primary">
  //                       ${datavis.info.activity}
  //                   </div>
  //                   <div class="secondary">
  //                       <div class="time">
  //                           <span class="text02 word">
  //                               <span id="time-hour" class="text02">${
  //                                 datavis.hour
  //                               }</span>
  //                               <span id="time-meridian" class="text02">${
  //                                 datavis.info.meridian
  //                               }</span>
  //                           </span>
  //                       </div>
  //                   </div>
  //               </div>
  //           </div>
  //         `
  //     },
  //     hoursData,
  //     "business-hours",
  //     "chronological",
  //     "timeline",
  //     24
  //   );
  // }
// };

// export const businessHourDetails = {
//   formatTime(militaryTime) {
//     const hour = parseInt(militaryTime.slice(0, 2));
//     const minute = militaryTime.slice(2);
//     const period = hour >= 12 ? "PM" : "AM";
//     const formattedHour = hour % 12 || 12;
//     return `${formattedHour}:${minute} ${period}`;
//   },

//   getDayName(dayNum) {
//     return [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday"
//     ][dayNum];
//   },

  // render(data) {
  //   console.log("Rendering business hours for:", data?.name);

  //   if (!data?.hours?.[0]?.open) {
  //     console.warn("Missing hours data");
  //     return '<div class="business-hours">Hours not available</div>';
  //   }

  //   const hours = data.hours[0].open;
  //   const isOpen = data.hours[0].is_open_now;

  //   // Get current time
  //   const now = new Date();
  //   const currentDay = now.getDay();
  //   const currentHour = now.getHours().toString().padStart(2, "0");
  //   const currentMinute = now.getMinutes().toString().padStart(2, "0");
  //   const currentTime = `${currentHour}${currentMinute}`;

  //   console.log("Current day/time:", this.getDayName(currentDay), currentTime);

  //   const hoursHTML = hours
  //     .map((timeSlot) => {
  //       const isCurrentDay = timeSlot.day === currentDay;
  //       const dayName = this.getDayName(timeSlot.day);
  //       const startTime = this.formatTime(timeSlot.start);
  //       const endTime = this.formatTime(timeSlot.end);
  //       const isWithinHours =
  //         isCurrentDay &&
  //         currentTime >= timeSlot.start &&
  //         currentTime <= timeSlot.end;

      //   return `
      //   <div class="business-hours-row ${isCurrentDay ? "current-day" : ""} ${
      //     isWithinHours ? "open" : ""
      //   }">
      //     <span class="day text02">${dayName}</span>
      //     <div class="hours">
      //       <span class="time text02">${startTime} - ${endTime}</span>
      //       ${
      //         isCurrentDay
      //           ? `
      //         <span class="badge-current text02 ${isOpen ? "open" : "closed"}">
      //           ${isOpen ? "Open Now" : "Closed"}
      //         </span>
      //       `
      //           : ""
      //       }
      //     </div>
      //   </div>
      // `;
      // })
      // .join("");

  //   return `
  //     <div class="business-hours">
  //       <div class="business-hours-header">
  //         <h3 class="text02">Business Hours - ${data.name}</h3>
  //         $ {icon.iconTime}
  //       </div>
  //       <div class="business-hours-content">
  //         ${hoursHTML}
  //       </div>
  //       <div class="current-time text02">
  //         Current Time: ${this.formatTime(currentTime)}
  //       </div>
  //     </div>
  //   `;
  // },

//   afterRender() {
//     const currentDayElement = document.querySelector(
//       ".datavis-item.current"
//     );
//     if (currentDayElement) {
//       console.log("Scrolling to current day");
//       currentDayElement.scrollIntoView({
//         behavior: "smooth",
//         block: "nearest"
//       });
//     }
//   }
// };
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
  const currentDayElement = document.querySelector('.datavis-item.current');
  if (currentDayElement) {
    console.log('Scrolling to current day');
    currentDayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
};