import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import * as media from "./media.js";
import { popularTimeHTML } from "./StorePopularTimes.js";

export const facilities = {
  render: (store) => {
    const mediaTopThree = store.mediaTopThree;
    const mediaGallery = store.mediaGallery;




    ///////////////////////////////////////////////////////////////
    //////////////////////// NEARBY STORES ////////////////////////
    ///////////////////////////////////////////////////////////////
    let nearbyObject = [];
    let nearbyHeadline = [];
    let nearbyHours = [];
    let nearbyLocation = [];
    let nearbyLogo = [];
    const nearbyStore = store.nearbyStoresCollection || [];
    if (nearbyStore.length > 0) {
        for (let i = 0; i < nearbyStore.length; i++) {
            nearbyObject = nearbyStore[i]; 
            nearbyHeadline = nearbyObject.nearbyHeadline;
            nearbyHours = nearbyObject.nearbyHours;
            nearbyLocation = nearbyObject.nearbyLocation;
            nearbyLogo = nearbyObject.nearbyLogo;

            // console.log(`!!!!!nearbyStore[${i}]!!!!!`, nearbyObject);
            // console.log(`!!!!!nearbyHeadline[${i}]!!!!!`, nearbyHeadline);
            // console.log(`!!!!!nearbyHours[${i}]!!!!!`, nearbyHours);
            // console.log(`!!!!!nearbyLocation[${i}]!!!!!`, nearbyLocation);
            // console.log(`!!!!!nearbyLogo[${i}]!!!!!`, nearbyLogo);
        }
    } else {
        console.log('No nearby stores found');
    }
    const limitedNearbyStore = nearbyStore;
    // BEST
    let allNearbyStoresHTML = "";
    limitedNearbyStore.forEach((nearbyStore) => {
      allNearbyStoresHTML += `
        <div class="item">
          <div class="content">
            <div class="header">
              <div class="primary">
                <div class="i"></div>
              </div>
              <div class="secondary">
                <span class="text03 bold">
                  0.3mi
                </span>
              </div>
            </div>
            <div class="image">
              <img src="${nearbyLogo}" class="galleryItem" alt="" />
            </div>
            <div class="label">
              <span class="text03 bold">
                ${nearbyHeadline}
              </span>
            </div>
          </div>
        </div>
      
        `;
    });
    
    ///////////////////////////////////////////////////////////////
    //////////////////////// NEARBY STORES ////////////////////////
    ///////////////////////////////////////////////////////////////





    // const mediaGalleryCount = mediaGallery.length;
    const snippetFacility = store.snippetFacility;
    const attributeFacility = store.attributeFacility || [];
    // console.log("attributeFacility", attributeFacility, "// snippetFacility", snippetFacility, "// mediaGallery", mediaGallery);

    
    const limitedAttributesFacility04 = attributeFacility.slice(0, 5);

    // BEST
    let attributeFacilityHTML = "";
    limitedAttributesFacility04.forEach((attributeFacility) => {
        attributeFacilityHTML += `
        <div class="item">
            <i class="icon icon-${attributeFacility.key}-21"></i>
            <div class="text inkw03">
                <div class="title">
                    <span class="inkw03 text03 bold">${attributeFacility.key}</span>
                </div>
                <div class="subtitle">
                    <span class="inkw03 text03">${attributeFacility.value}</span>
                </div>
            </div>
        </div>
       
        `;
    });
    // console.log("attributeFacilityHTML", attributeFacilityHTML);





    ///////////////////////////////////////////////////////////////
    //////////////////////// POPULAR TIMES ////////////////////////
    ///////////////////////////////////////////////////////////////
    const popularTimesHTML = () => {
      const currentHour = new Date().getHours(); // Assuming hours range from 0-23
      const currentDay = new Date().getDay(); // Assuming days range from 0 (Sunday) - 6 (Saturday)
      const data = store.popularTimes; // Assuming 'store' is accessible and contains the popular times data
      
      let popularTimesContent = '<div id="chartsContainer" class="infograph">';
    
      for (let dayIndex = 1; dayIndex < data[0].length; dayIndex++) {
        popularTimesContent += '<div class="status">';
        popularTimesContent += `<div class="day-title">${data[0][dayIndex]}</div>`;
    
        if (dayIndex === currentDay + 1) {
          const currentValue = parseInt(data[currentHour + 1][dayIndex]);
          let statusClass = '';
          let statusText = '';
    
          if (currentValue >= 0 && currentValue <= 5) {
            statusClass = 'not-busy';
            statusText = "NOT BUSY";
          } else if (currentValue > 5 && currentValue <= 10) {
            statusClass = 'moderately-busy';
            statusText = "MODERATELY BUSY";
          } else if (currentValue > 10 && currentValue <= 12) {
            statusClass = 'busy';
            statusText = "BUSY";
          } else {
            statusClass = 'packed';
            statusText = "PACKED";
          }
    
          popularTimesContent += `<div class="status ${statusClass}">${statusText}</div>`;
        }
    
        for (let i = 1; i < data.length; i++) {
          let hourClass = 'item';
          if (i === currentHour + 1) {
            hourClass += ' current-hour';
          }

          let iconClass = 'icon-indicator';
          if (i === currentHour + 1) {
            iconClass += '-active';
          } else {
            iconClass += '-inactive';
          }

          const iconIndicator = `<div class="icon-container"><i class="${iconClass} icon"></i></div>`;

          popularTimesContent += `<div class="${hourClass}">`;

          popularTimesContent += `<div class="label">${iconIndicator} ${data[i][0]}</div>`;
          popularTimesContent += `<div class="${barClass}"><div class="${activeClass}" style="height: ${barHeight}%;"></div></div>`;
          
    
          const barHeight = `${parseInt(data[i][dayIndex]) * (100 / 15)}`;
          let barClass = 'bar';
          if (i === currentHour + 1) {
            barClass += ' current-time';
          }

          let activeClass = 'active';
          if (barHeight <= 33.33) {
              activeClass = 'active';
          } else if (barHeight > 33.33 && barHeight < 66.66) {
              activeClass += ' active5';
          } else if (barHeight >= 66.66 && barHeight <= 100) {
              activeClass += ' active3';
          } else {
              activeClass = 'active';
          }

          
    
          
          popularTimesContent += '</div>'; // Close hour container
        }
    
        popularTimesContent += '</div>'; // Close day container
      }

      const scrollIntoView = () => {
        window.addEventListener('load', () => {
          const now = new Date();
          const currentHour = now.getHours();
          const items = document.querySelectorAll('.item');
          const targetItem = items[currentHour]; // assuming each item represents an hour
        
          if (targetItem) {
            targetItem.scrollIntoView({
              behavior: 'smooth',
              inline: 'start'
            });
          }
        });
        
      };
      scrollIntoView();
    
      popularTimesContent += '</div>'; // Close chartsContainer
      return popularTimesContent;

    };
    
    // const popularTimesHTML = () => {
    //   const currentHour = new Date().getHours();
    //   const data = store.popularTimes; // Assuming 'store' is accessible
    //   const currentDay = new Date().getDay();
    
    //   let popularTimesContent = '<div id="chartsContainer" class="infograph">';
    
    //   data.forEach((dayData, index) => {
    //     if (index === 0) return; // Skip the header row
    
    //     popularTimesContent += `<div class="chart">`;
    //     popularTimesContent += `<div class="day-title">${dayData[0]}</div>`;
    
    //     if (index === currentDay + 1) {
    //       // Add current status based on business logic
    //       popularTimesContent += `<div class="status">Today's Status</div>`;
    //     }
    
    //     dayData.slice(1).forEach((hourData, hourIndex) => {
    //       const hourClass = hourIndex === currentHour ? 'current-hour' : ''; // Example class for current hour
    //       popularTimesContent += `<div class="hour ${hourClass}">`;
    //       popularTimesContent += `<span class="hour-label">${hourIndex}:00</span>`; // Adjusted to show hour
    //       popularTimesContent += `<span class="hour-data">${hourData}</span>`; // Display hour data
    //       popularTimesContent += `</div>`; // Close hour
    //     });
    
    //     popularTimesContent += `</div>`; // Close chart
    //   });
    
    //   popularTimesContent += `</div>`; // Close chartsContainer
    
    //   return popularTimesContent;
    // };
    
    // const popularTimesHTML = () => {
    //   const currentHour = new Date().getHours();
    //     const data = store.popularTimes;
    //     console.log("data", data, "currentHour", currentHour);
    //     const currentDay = new Date().getDay();
    //     const chartsContainer = document.getElementById('chartsContainer');
          
        
    //   const PopularTimesHTML = `
    //   <div id="chartsContainer" class="infograph">
    //     <!--
    //     <div class="status">
    //       <div class="item">
    //       <div class="bar">
    //         <div class="active"></div>
    //       </div>
    //       <div class="label2">
    //         <div class="icon-container">
    //           <div class="icon"></div>
    //         </div>
    //         <div class="text2">
    //           <div class="title4">
    //             <img class="_12" src="_120.png" />
    //           </div>
    //           <div class="subtitle">
    //             <img class="am" src="am0.png" />
    //           </div>
    //         </div>
    //       </div>
    //       -->
    //     </div>
    //   `;
      
    //   for (let dayIndex = 1; dayIndex < data[0].length; dayIndex++) {
    //     const dayContainer = document.createElement('div');
    //     dayContainer.classList.add('chart');

    //     const header = document.createElement('div');
    //     header.classList.add('day-title');
    //     header.textContent = data[0][dayIndex];
    //     dayContainer.appendChild(header);

    //     if (dayIndex === currentDay + 1) {
    //         const currentStatus = document.createElement('div');
    //         currentStatus.classList.add('status');
    //         const currentValue = parseInt(data[currentHour + 1][dayIndex]);
    //         if (currentValue >= 0 && currentValue <= 5) {
    //             currentStatus.textContent = "NOT BUSY";
    //             currentStatus.classList.add('not-busy');
    //         } else if (currentValue > 5 && currentValue <= 10) {
    //             currentStatus.textContent = "MODERATELY BUSY";
    //             currentStatus.classList.add('moderately-busy');
    //         } else if (currentValue > 10 && currentValue <= 12) {
    //             currentStatus.textContent = "BUSY";
    //             currentStatus.classList.add('busy');
    //         } else {
    //             currentStatus.textContent = "PACKED";
    //             currentStatus.classList.add('packed');
    //         }

    //         dayContainer.appendChild(currentStatus);
    //     }

    //     for (let i = 1; i < data.length; i++) {
    //         const hourContainer = document.createElement('div');
    //         hourContainer.classList.add('hour');
    //         if (i === currentHour + 0) {
    //             hourContainer.classList.add('current-hour');
    //         }

    //         const hourLabel = document.createElement('div');
    //         hourLabel.classList.add('hour-label');
    //         hourLabel.textContent = data[i][0];
    //         hourContainer.appendChild(hourLabel);

    //         const bar = document.createElement('div');
    //         bar.classList.add('bar');
    //         bar.style.height = `${parseInt(data[i][dayIndex]) * 10}px`; // 10 times the value
    //         if (i === currentHour + 1) {
    //             bar.classList.add('current-time');
    //         }
    //         hourContainer.appendChild(bar);

    //         dayContainer.appendChild(hourContainer);
    //     }

    //     chartsContainer.appendChild(dayContainer);
    // }
    
    //   return PopularTimesHTML;
    // };
    ///////////////////////////////////////////////////////////////
    //////////////////////// POPULAR TIMES ////////////////////////
    ///////////////////////////////////////////////////////////////


    return `
    <section class="section store-facility facility">
      <div class="header">
        <div class="headline">
        <span class="header03">Facility</span>
        </div>
      </div>
            ${element.lineH.render(30)}
            ${popularTimesHTML()}
      <div class="media-carousel">
        <div class="title">
          <div class="eyebrow">
            <div class="text">
              <div class="title2">
                <div class="not-busy">Not Busy</div>
              </div>
              <div class="subtitle">
                <div class="_60-f">60°F</div>
                <div class="light-rain">Light Rain</div>
              </div>
            </div>
          </div>
          <div class="label">
            <div class="title3">
              <div class="open">Open</div>
              <div class="until-4-pm">until 4PM</div>
            </div>
          </div>
        </div>
       
       
        <div  id="chartsContainer" class="infograph">
          <div class="status">
            <div class="item">
              <div class="bar">
                <div class="active"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_12" src="_120.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am0.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active2"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_1" src="_10.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am1.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar3">
                <div class="active3"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_2" src="_20.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am2.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar3">
                <div class="active4"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_3" src="_30.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am3.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active5"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_4" src="_40.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am4.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar">
                <div class="active"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_5" src="_50.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am5.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active2"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_6" src="_60.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am6.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar3">
                <div class="active3"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_7" src="_70.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am7.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar3">
                <div class="active4"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_8" src="_80.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am8.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active5"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_9" src="_90.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am9.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active5"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_10" src="_100.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am10.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active5"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_11" src="_110.png" />
                  </div>
                  <div class="subtitle">
                    <img class="am" src="am11.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar">
                <div class="active"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_12" src="_121.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm0.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active2"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_1" src="_11.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm1.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar3">
                <div class="active3"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_2" src="_21.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm2.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar3">
                <div class="active4"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_3" src="_31.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm3.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar2">
                <div class="active5"></div>
              </div>
              <div class="label2">
                <div class="icon-container">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_4" src="_41.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm4.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_5" src="_51.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm5.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_6" src="_61.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm6.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_7" src="_71.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm7.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_8" src="_81.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm8.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_9" src="_91.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm9.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_10" src="_101.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm10.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_11" src="_111.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm11.png" />
                  </div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="bar4">
                <div class="active6"></div>
              </div>
              <div class="label2">
                <div class="icon2">
                  <div class="icon"></div>
                </div>
                <div class="text2">
                  <div class="title4">
                    <img class="_12" src="_122.png" />
                  </div>
                  <div class="subtitle">
                    <img class="pm" src="pm12.png" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>
      <svg
        class="divider2"
        width="856"
        height="61"
        viewBox="0 0 856 61"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 30.7031H856" stroke="#F2F2F2" />
      </svg>
      <div class="overview">
        <div class="overview">
          <div class="title4">
            <span class="text03 bold">What to Expect</span>
          </div>
          <div class="body-collapsable">
            <div class="body">
              <span class="text03">
                ${snippetFacility}
              </span>
            </div>
            <div class="button-more">
              <img class="show-more" src="show-more0.png" />
            </div>
          </div>
        </div>
      </div>
      ${element.lineH.render(30)}
      <div class="summary-one-col">
        <div class="summary-one-col2">
          <div class="summary-container">
            <div class="hero">
              <div class="eyebrow-headline">
                <div class="label3">
                  <div class="_11900-south-st-ste-134-cerritos-ca-90703">
                    11900 South St Ste 134 Cerritos, CA 90703
                  </div>
                  <svg
                    class="copy"
                    width="21"
                    height="22"
                    viewBox="0 0 21 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M5.3578 5.56092C5.3953 5.52342 5.44618 5.50234 5.49922 5.50234H11.1242C11.1773 5.50234 11.2281 5.52341 11.2656 5.56092C11.3031 5.59843 11.3242 5.6493 11.3242 5.70234V6.32734C11.3242 6.90724 11.7943 7.37734 12.3742 7.37734C12.9541 7.37734 13.4242 6.90724 13.4242 6.32734V5.70234C13.4242 5.09235 13.1819 4.50733 12.7506 4.076C12.3192 3.64466 11.7342 3.40234 11.1242 3.40234H5.49922C4.88922 3.40234 4.30421 3.64466 3.87287 4.076C3.44154 4.50733 3.19922 5.09235 3.19922 5.70234V11.3273C3.19922 11.9373 3.44154 12.5224 3.87287 12.9537C4.30421 13.385 4.88922 13.6273 5.49922 13.6273H6.12422C6.70412 13.6273 7.17422 13.1572 7.17422 12.5773C7.17422 11.9974 6.70412 11.5273 6.12422 11.5273H5.49922C5.44618 11.5273 5.3953 11.5063 5.3578 11.4688C5.32029 11.4313 5.29922 11.3804 5.29922 11.3273V5.70234C5.29922 5.6493 5.32029 5.59843 5.3578 5.56092ZM9.67422 10.0773C9.67422 9.96689 9.76376 9.87734 9.87422 9.87734H15.4992C15.6097 9.87734 15.6992 9.96689 15.6992 10.0773V15.7023C15.6992 15.8128 15.6097 15.9023 15.4992 15.9023H9.87422C9.76376 15.9023 9.67422 15.8128 9.67422 15.7023V10.0773ZM9.87422 7.77734C8.60396 7.77734 7.57422 8.80709 7.57422 10.0773V15.7023C7.57422 16.9726 8.60396 18.0023 9.87422 18.0023H15.4992C16.7695 18.0023 17.7992 16.9726 17.7992 15.7023V10.0773C17.7992 8.80709 16.7695 7.77734 15.4992 7.77734H9.87422Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
              <div class="nearby">
                <div class="map">
                  <div class="map nearbyMap" id="map">
                    <div id="map-container" class="nearbyMap-container"></div>
                  </div>
                              <svg
                                class="highlight"
                                width="126"
                                height="64"
                                viewBox="0 0 126 64"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink"
                              >
                                <mask
                                  id="mask0_423_124271"
                                  style="mask-type: alpha"
                                  maskUnits="userSpaceOnUse"
                                  x="-1"
                                  y="-1"
                                  width="128"
                                  height="66"
                                >
                                  <path
                                    d="M11 63.9688L8.5 46.9688H3.5L0 26.9688L4.5 26.4688L2.5 8.96875L73.5 0.46875L80.5 34.4688L121 30.4688L126 49.9688L11 63.9688Z"
                                    fill="#D9D9D9"
                                    stroke="black"
                                  />
                                </mask>
                                <g mask="url(#mask0_423_124271)">
                                  <rect
                                    x="-1526.5"
                                    y="-820.031"
                                    width="3344"
                                    height="2194"
                                    fill="url(#pattern0)"
                                  />
                                </g>
                                <defs>
                                  <pattern
                                    id="pattern0"
                                    patternContentUnits="objectBoundingBox"
                                    width="1"
                                    height="1"
                                  >
                                    <use
                                      xlink:href="#image0_423_124271"
                                      transform="scale(0.000557103 0.000849112)"
                                    />
                                  </pattern>
                                  <image
                                    id="image0_423_124271"
                                    width="1795"
                                    height="1178"
                                  />
                                </defs>
                              </svg>
                </div>
                <div class="markers">
                  <svg
                    class="frame-1321321652"
                    width="22.43341827392578"
                    height="32.762779235839844"
                  ></svg>
                  <div class="group-22087">
                    <div class="group-22085">
                      <div class="type">
                        <svg
                          class="groceries"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M1.42673 1.01763C1.27174 0.940134 1.08767 0.948416 0.940259 1.03952C0.792851 1.13062 0.703125 1.29156 0.703125 1.46484V9.46484C0.703125 9.74099 0.926983 9.96484 1.20312 9.96484H9.20312C9.47927 9.96484 9.70312 9.74099 9.70312 9.46484V1.46484C9.70312 1.29156 9.6134 1.13062 9.46599 1.03952C9.31858 0.948416 9.13451 0.940134 8.97952 1.01763L8.20312 1.40583L7.42673 1.01763C7.28597 0.947249 7.12028 0.947249 6.97952 1.01763L6.20312 1.40583L5.42673 1.01763C5.28597 0.947249 5.12028 0.947249 4.97952 1.01763L4.20312 1.40583L3.42673 1.01763C3.28597 0.947249 3.12028 0.947249 2.97952 1.01763L2.20312 1.40583L1.42673 1.01763ZM1.70312 8.96484V2.27386L1.97952 2.41206C2.12028 2.48244 2.28597 2.48244 2.42673 2.41206L3.20312 2.02386L3.97952 2.41206C4.12028 2.48244 4.28597 2.48244 4.42673 2.41206L5.20312 2.02386L5.97952 2.41206C6.12028 2.48244 6.28597 2.48244 6.42673 2.41206L7.20312 2.02386L7.97952 2.41206C8.12028 2.48244 8.28597 2.48244 8.42673 2.41206L8.70312 2.27386V8.96484H1.70312ZM4.20312 3.46484C3.92698 3.46484 3.70312 3.6887 3.70312 3.96484C3.70312 4.24099 3.92698 4.46484 4.20312 4.46484H6.20312C6.47927 4.46484 6.70312 4.24099 6.70312 3.96484C6.70312 3.6887 6.47927 3.46484 6.20312 3.46484H4.20312Z"
                            fill="#FBFBFB"
                          />
                        </svg>
                        <div class="_0-3-m">0.3m</div>
                      </div>
                      <div class="type2">
                        <svg
                          class="donut-bitten"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask id="path-1-inside-1_423_124291" fill="white">
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M9.45538 6.94112C8.84437 8.70129 7.17131 9.96484 5.20312 9.96484C2.71784 9.96484 0.703125 7.95013 0.703125 5.46484C0.703125 2.97956 2.71784 0.964844 5.20312 0.964844C7.17308 0.964844 8.84738 2.23067 9.45703 3.99333C9.4475 3.99479 9.43796 3.99652 9.42842 3.99855C9.24296 4.03797 9.10355 4.1755 9.05297 4.34526C8.87895 4.31356 8.69347 4.37537 8.57431 4.52252C8.45491 4.66998 8.43317 4.86476 8.50087 5.0286C8.34551 5.11342 8.24011 5.27828 8.24011 5.46776C8.24011 5.65717 8.34544 5.82198 8.50071 5.90683C8.43387 6.07031 8.45587 6.26425 8.57486 6.41119C8.69371 6.55796 8.87853 6.61983 9.05214 6.5887C9.10256 6.75876 9.24209 6.89658 9.42779 6.93605C9.43699 6.93801 9.44619 6.93969 9.45538 6.94112ZM5.70312 5.46484C5.70312 5.74099 5.47927 5.96484 5.20312 5.96484C4.92698 5.96484 4.70312 5.74099 4.70312 5.46484C4.70312 5.1887 4.92698 4.96484 5.20312 4.96484C5.47927 4.96484 5.70312 5.1887 5.70312 5.46484Z"
                            />
                          </mask>
                          <path
                            d="M9.45538 6.94112L10.4001 7.26905L10.793 6.13703L9.60897 5.95299L9.45538 6.94112ZM9.45703 3.99333L9.60863 4.98177L10.7941 4.79994L10.4021 3.66646L9.45703 3.99333ZM9.42842 3.99855L9.22051 3.0204L9.22051 3.0204L9.42842 3.99855ZM9.05297 4.34526L8.87374 5.32907L9.75543 5.48969L10.0113 4.6308L9.05297 4.34526ZM8.57431 4.52252L9.35146 5.15184L9.35146 5.15184L8.57431 4.52252ZM8.50087 5.0286L8.98006 5.9063L9.76785 5.4762L9.42507 4.64668L8.50087 5.0286ZM8.24011 5.46776L7.24011 5.46775L7.24011 5.46776L8.24011 5.46776ZM8.50071 5.90683L9.42632 6.28531L9.76464 5.45793L8.98022 5.0293L8.50071 5.90683ZM8.57486 6.41119L9.35201 5.78187L9.35201 5.78187L8.57486 6.41119ZM9.05214 6.5887L10.0109 6.30444L9.75651 5.44647L8.87566 5.6044L9.05214 6.5887ZM9.42779 6.93605L9.63571 5.95791L9.6357 5.9579L9.42779 6.93605ZM5.20312 10.9648C7.61024 10.9648 9.65374 9.41909 10.4001 7.26905L8.51068 6.61319C8.035 7.98349 6.73238 8.96484 5.20312 8.96484V10.9648ZM-0.296875 5.46484C-0.296875 8.50241 2.16556 10.9648 5.20312 10.9648V8.96484C3.27013 8.96484 1.70312 7.39784 1.70312 5.46484H-0.296875ZM5.20312 -0.0351562C2.16556 -0.0351562 -0.296875 2.42728 -0.296875 5.46484H1.70312C1.70312 3.53185 3.27013 1.96484 5.20312 1.96484V-0.0351562ZM10.4021 3.66646C9.65742 1.51337 7.6124 -0.0351562 5.20312 -0.0351562V1.96484C6.73376 1.96484 8.03735 2.94798 8.51196 4.32019L10.4021 3.66646ZM9.30542 3.00488C9.27737 3.00919 9.24905 3.01434 9.22051 3.0204L9.63633 4.9767C9.62688 4.97871 9.61764 4.98039 9.60863 4.98177L9.30542 3.00488ZM9.22051 3.0204C8.6628 3.13895 8.2455 3.55325 8.0946 4.05972L10.0113 4.6308C9.96159 4.79775 9.82311 4.937 9.63633 4.9767L9.22051 3.0204ZM9.23219 3.36145C8.71304 3.26688 8.15549 3.45072 7.79717 3.8932L9.35146 5.15184C9.23146 5.30003 9.04486 5.36024 8.87374 5.32907L9.23219 3.36145ZM7.79717 3.8932C7.4381 4.33662 7.37468 4.92172 7.57667 5.41051L9.42507 4.64668C9.49165 4.80781 9.47171 5.00334 9.35146 5.15184L7.79717 3.8932ZM8.02167 4.15089C7.55816 4.40395 7.24012 4.89798 7.24011 5.46775L9.24011 5.46776C9.24011 5.65857 9.13285 5.82289 8.98006 5.9063L8.02167 4.15089ZM7.24011 5.46776C7.24012 6.03734 7.55795 6.53123 8.0212 6.78437L8.98022 5.0293C9.13292 5.11273 9.24011 5.277 9.24011 5.46775L7.24011 5.46776ZM7.5751 5.52835C7.37568 6.01605 7.4399 6.59865 7.79771 7.04051L9.35201 5.78187C9.47184 5.92985 9.49205 6.12456 9.42632 6.28531L7.5751 5.52835ZM7.79771 7.04051C8.15509 7.48184 8.71068 7.66587 9.22862 7.57301L8.87566 5.6044C9.04637 5.57379 9.23232 5.63408 9.35201 5.78187L7.79771 7.04051ZM8.0934 6.87296C8.24382 7.38032 8.66147 7.79551 9.21988 7.9142L9.6357 5.9579C9.82272 5.99766 9.9613 6.1372 10.0109 6.30444L8.0934 6.87296ZM9.21986 7.9142C9.24752 7.92008 9.27484 7.92507 9.30179 7.92925L9.60897 5.95299C9.61754 5.95432 9.62646 5.95594 9.63571 5.95791L9.21986 7.9142ZM5.20312 6.96484C6.03155 6.96484 6.70312 6.29327 6.70312 5.46484H4.70312C4.70312 5.1887 4.92698 4.96484 5.20312 4.96484V6.96484ZM3.70312 5.46484C3.70312 6.29327 4.3747 6.96484 5.20312 6.96484V4.96484C5.47927 4.96484 5.70312 5.1887 5.70312 5.46484H3.70312ZM5.20312 3.96484C4.3747 3.96484 3.70312 4.63642 3.70312 5.46484H5.70312C5.70312 5.74099 5.47927 5.96484 5.20312 5.96484V3.96484ZM6.70312 5.46484C6.70312 4.63642 6.03155 3.96484 5.20312 3.96484V5.96484C4.92698 5.96484 4.70312 5.74099 4.70312 5.46484H6.70312Z"
                            fill="#FBFBFB"
                            mask="url(#path-1-inside-1_423_124291)"
                          />
                        </svg>
                        <div class="_0-3-m">0.3m</div>
                      </div>
                      <div class="type3">
                        <svg
                          class="donut-bitten2"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask id="path-1-inside-1_423_124295" fill="white">
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M9.45538 6.94112C8.84437 8.70129 7.17131 9.96484 5.20312 9.96484C2.71784 9.96484 0.703125 7.95013 0.703125 5.46484C0.703125 2.97956 2.71784 0.964844 5.20312 0.964844C7.17308 0.964844 8.84738 2.23067 9.45703 3.99333C9.4475 3.99479 9.43796 3.99652 9.42842 3.99855C9.24296 4.03797 9.10355 4.1755 9.05297 4.34526C8.87895 4.31356 8.69347 4.37537 8.57431 4.52252C8.45491 4.66998 8.43317 4.86476 8.50087 5.0286C8.34551 5.11342 8.24011 5.27828 8.24011 5.46776C8.24011 5.65717 8.34544 5.82198 8.50071 5.90683C8.43387 6.07031 8.45587 6.26425 8.57486 6.41119C8.69371 6.55796 8.87853 6.61983 9.05214 6.5887C9.10256 6.75876 9.24209 6.89658 9.42779 6.93605C9.43699 6.93801 9.44619 6.93969 9.45538 6.94112ZM5.70312 5.46484C5.70312 5.74099 5.47927 5.96484 5.20312 5.96484C4.92698 5.96484 4.70312 5.74099 4.70312 5.46484C4.70312 5.1887 4.92698 4.96484 5.20312 4.96484C5.47927 4.96484 5.70312 5.1887 5.70312 5.46484Z"
                            />
                          </mask>
                          <path
                            d="M9.45538 6.94112L10.4001 7.26905L10.793 6.13703L9.60897 5.95299L9.45538 6.94112ZM9.45703 3.99333L9.60863 4.98177L10.7941 4.79994L10.4021 3.66646L9.45703 3.99333ZM9.42842 3.99855L9.22051 3.0204L9.22051 3.0204L9.42842 3.99855ZM9.05297 4.34526L8.87374 5.32907L9.75543 5.48969L10.0113 4.6308L9.05297 4.34526ZM8.57431 4.52252L9.35146 5.15184L9.35146 5.15184L8.57431 4.52252ZM8.50087 5.0286L8.98006 5.9063L9.76785 5.4762L9.42507 4.64668L8.50087 5.0286ZM8.24011 5.46776L7.24011 5.46775L7.24011 5.46776L8.24011 5.46776ZM8.50071 5.90683L9.42632 6.28531L9.76464 5.45793L8.98022 5.0293L8.50071 5.90683ZM8.57486 6.41119L9.35201 5.78187L9.35201 5.78187L8.57486 6.41119ZM9.05214 6.5887L10.0109 6.30444L9.75651 5.44647L8.87566 5.6044L9.05214 6.5887ZM9.42779 6.93605L9.63571 5.95791L9.6357 5.9579L9.42779 6.93605ZM5.20312 10.9648C7.61024 10.9648 9.65374 9.41909 10.4001 7.26905L8.51068 6.61319C8.035 7.98349 6.73238 8.96484 5.20312 8.96484V10.9648ZM-0.296875 5.46484C-0.296875 8.50241 2.16556 10.9648 5.20312 10.9648V8.96484C3.27013 8.96484 1.70312 7.39784 1.70312 5.46484H-0.296875ZM5.20312 -0.0351562C2.16556 -0.0351562 -0.296875 2.42728 -0.296875 5.46484H1.70312C1.70312 3.53185 3.27013 1.96484 5.20312 1.96484V-0.0351562ZM10.4021 3.66646C9.65742 1.51337 7.6124 -0.0351562 5.20312 -0.0351562V1.96484C6.73376 1.96484 8.03735 2.94798 8.51196 4.32019L10.4021 3.66646ZM9.30542 3.00488C9.27737 3.00919 9.24905 3.01434 9.22051 3.0204L9.63633 4.9767C9.62688 4.97871 9.61764 4.98039 9.60863 4.98177L9.30542 3.00488ZM9.22051 3.0204C8.6628 3.13895 8.2455 3.55325 8.0946 4.05972L10.0113 4.6308C9.96159 4.79775 9.82311 4.937 9.63633 4.9767L9.22051 3.0204ZM9.23219 3.36145C8.71304 3.26688 8.15549 3.45072 7.79717 3.8932L9.35146 5.15184C9.23146 5.30003 9.04486 5.36024 8.87374 5.32907L9.23219 3.36145ZM7.79717 3.8932C7.4381 4.33662 7.37468 4.92172 7.57667 5.41051L9.42507 4.64668C9.49165 4.80781 9.47171 5.00334 9.35146 5.15184L7.79717 3.8932ZM8.02167 4.15089C7.55816 4.40395 7.24012 4.89798 7.24011 5.46775L9.24011 5.46776C9.24011 5.65857 9.13285 5.82289 8.98006 5.9063L8.02167 4.15089ZM7.24011 5.46776C7.24012 6.03734 7.55795 6.53123 8.0212 6.78437L8.98022 5.0293C9.13292 5.11273 9.24011 5.277 9.24011 5.46775L7.24011 5.46776ZM7.5751 5.52835C7.37568 6.01605 7.4399 6.59865 7.79771 7.04051L9.35201 5.78187C9.47184 5.92985 9.49205 6.12456 9.42632 6.28531L7.5751 5.52835ZM7.79771 7.04051C8.15509 7.48184 8.71068 7.66587 9.22862 7.57301L8.87566 5.6044C9.04637 5.57379 9.23232 5.63408 9.35201 5.78187L7.79771 7.04051ZM8.0934 6.87296C8.24382 7.38032 8.66147 7.79551 9.21988 7.9142L9.6357 5.9579C9.82272 5.99766 9.9613 6.1372 10.0109 6.30444L8.0934 6.87296ZM9.21986 7.9142C9.24752 7.92008 9.27484 7.92507 9.30179 7.92925L9.60897 5.95299C9.61754 5.95432 9.62646 5.95594 9.63571 5.95791L9.21986 7.9142ZM5.20312 6.96484C6.03155 6.96484 6.70312 6.29327 6.70312 5.46484H4.70312C4.70312 5.1887 4.92698 4.96484 5.20312 4.96484V6.96484ZM3.70312 5.46484C3.70312 6.29327 4.3747 6.96484 5.20312 6.96484V4.96484C5.47927 4.96484 5.70312 5.1887 5.70312 5.46484H3.70312ZM5.20312 3.96484C4.3747 3.96484 3.70312 4.63642 3.70312 5.46484H5.70312C5.70312 5.74099 5.47927 5.96484 5.20312 5.96484V3.96484ZM6.70312 5.46484C6.70312 4.63642 6.03155 3.96484 5.20312 3.96484V5.96484C4.92698 5.96484 4.70312 5.74099 4.70312 5.46484H6.70312Z"
                            fill="#FBFBFB"
                            mask="url(#path-1-inside-1_423_124295)"
                          />
                        </svg>
                        <div class="_0-3-m">0.3m</div>
                      </div>
                      <div class="type4">
                        <svg
                          class="donut-bitten3"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask id="path-1-inside-1_423_124299" fill="white">
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M9.45538 6.94112C8.84437 8.70129 7.17131 9.96484 5.20312 9.96484C2.71784 9.96484 0.703125 7.95013 0.703125 5.46484C0.703125 2.97956 2.71784 0.964844 5.20312 0.964844C7.17308 0.964844 8.84738 2.23067 9.45703 3.99333C9.4475 3.99479 9.43796 3.99652 9.42842 3.99855C9.24296 4.03797 9.10355 4.1755 9.05297 4.34526C8.87895 4.31356 8.69347 4.37537 8.57431 4.52252C8.45491 4.66998 8.43317 4.86476 8.50087 5.0286C8.34551 5.11342 8.24011 5.27828 8.24011 5.46776C8.24011 5.65717 8.34544 5.82198 8.50071 5.90683C8.43387 6.07031 8.45587 6.26425 8.57486 6.41119C8.69371 6.55796 8.87853 6.61983 9.05214 6.5887C9.10256 6.75876 9.24209 6.89658 9.42779 6.93605C9.43699 6.93801 9.44619 6.93969 9.45538 6.94112ZM5.70312 5.46484C5.70312 5.74099 5.47927 5.96484 5.20312 5.96484C4.92698 5.96484 4.70312 5.74099 4.70312 5.46484C4.70312 5.1887 4.92698 4.96484 5.20312 4.96484C5.47927 4.96484 5.70312 5.1887 5.70312 5.46484Z"
                            />
                          </mask>
                          <path
                            d="M9.45538 6.94112L10.4001 7.26905L10.793 6.13703L9.60897 5.95299L9.45538 6.94112ZM9.45703 3.99333L9.60863 4.98177L10.7941 4.79994L10.4021 3.66646L9.45703 3.99333ZM9.42842 3.99855L9.22051 3.0204L9.22051 3.0204L9.42842 3.99855ZM9.05297 4.34526L8.87374 5.32907L9.75543 5.48969L10.0113 4.6308L9.05297 4.34526ZM8.57431 4.52252L9.35146 5.15184L9.35146 5.15184L8.57431 4.52252ZM8.50087 5.0286L8.98006 5.9063L9.76785 5.4762L9.42507 4.64668L8.50087 5.0286ZM8.24011 5.46776L7.24011 5.46775L7.24011 5.46776L8.24011 5.46776ZM8.50071 5.90683L9.42632 6.28531L9.76464 5.45793L8.98022 5.0293L8.50071 5.90683ZM8.57486 6.41119L9.35201 5.78187L9.35201 5.78187L8.57486 6.41119ZM9.05214 6.5887L10.0109 6.30444L9.75651 5.44647L8.87566 5.6044L9.05214 6.5887ZM9.42779 6.93605L9.63571 5.95791L9.6357 5.9579L9.42779 6.93605ZM5.20312 10.9648C7.61024 10.9648 9.65374 9.41909 10.4001 7.26905L8.51068 6.61319C8.035 7.98349 6.73238 8.96484 5.20312 8.96484V10.9648ZM-0.296875 5.46484C-0.296875 8.50241 2.16556 10.9648 5.20312 10.9648V8.96484C3.27013 8.96484 1.70312 7.39784 1.70312 5.46484H-0.296875ZM5.20312 -0.0351562C2.16556 -0.0351562 -0.296875 2.42728 -0.296875 5.46484H1.70312C1.70312 3.53185 3.27013 1.96484 5.20312 1.96484V-0.0351562ZM10.4021 3.66646C9.65742 1.51337 7.6124 -0.0351562 5.20312 -0.0351562V1.96484C6.73376 1.96484 8.03735 2.94798 8.51196 4.32019L10.4021 3.66646ZM9.30542 3.00488C9.27737 3.00919 9.24905 3.01434 9.22051 3.0204L9.63633 4.9767C9.62688 4.97871 9.61764 4.98039 9.60863 4.98177L9.30542 3.00488ZM9.22051 3.0204C8.6628 3.13895 8.2455 3.55325 8.0946 4.05972L10.0113 4.6308C9.96159 4.79775 9.82311 4.937 9.63633 4.9767L9.22051 3.0204ZM9.23219 3.36145C8.71304 3.26688 8.15549 3.45072 7.79717 3.8932L9.35146 5.15184C9.23146 5.30003 9.04486 5.36024 8.87374 5.32907L9.23219 3.36145ZM7.79717 3.8932C7.4381 4.33662 7.37468 4.92172 7.57667 5.41051L9.42507 4.64668C9.49165 4.80781 9.47171 5.00334 9.35146 5.15184L7.79717 3.8932ZM8.02167 4.15089C7.55816 4.40395 7.24012 4.89798 7.24011 5.46775L9.24011 5.46776C9.24011 5.65857 9.13285 5.82289 8.98006 5.9063L8.02167 4.15089ZM7.24011 5.46776C7.24012 6.03734 7.55795 6.53123 8.0212 6.78437L8.98022 5.0293C9.13292 5.11273 9.24011 5.277 9.24011 5.46775L7.24011 5.46776ZM7.5751 5.52835C7.37568 6.01605 7.4399 6.59865 7.79771 7.04051L9.35201 5.78187C9.47184 5.92985 9.49205 6.12456 9.42632 6.28531L7.5751 5.52835ZM7.79771 7.04051C8.15509 7.48184 8.71068 7.66587 9.22862 7.57301L8.87566 5.6044C9.04637 5.57379 9.23232 5.63408 9.35201 5.78187L7.79771 7.04051ZM8.0934 6.87296C8.24382 7.38032 8.66147 7.79551 9.21988 7.9142L9.6357 5.9579C9.82272 5.99766 9.9613 6.1372 10.0109 6.30444L8.0934 6.87296ZM9.21986 7.9142C9.24752 7.92008 9.27484 7.92507 9.30179 7.92925L9.60897 5.95299C9.61754 5.95432 9.62646 5.95594 9.63571 5.95791L9.21986 7.9142ZM5.20312 6.96484C6.03155 6.96484 6.70312 6.29327 6.70312 5.46484H4.70312C4.70312 5.1887 4.92698 4.96484 5.20312 4.96484V6.96484ZM3.70312 5.46484C3.70312 6.29327 4.3747 6.96484 5.20312 6.96484V4.96484C5.47927 4.96484 5.70312 5.1887 5.70312 5.46484H3.70312ZM5.20312 3.96484C4.3747 3.96484 3.70312 4.63642 3.70312 5.46484H5.70312C5.70312 5.74099 5.47927 5.96484 5.20312 5.96484V3.96484ZM6.70312 5.46484C6.70312 4.63642 6.03155 3.96484 5.20312 3.96484V5.96484C4.92698 5.96484 4.70312 5.74099 4.70312 5.46484H6.70312Z"
                            fill="#FBFBFB"
                            mask="url(#path-1-inside-1_423_124299)"
                          />
                        </svg>
                        <div class="_0-3-m">0.3m</div>
                      </div>
                      <div class="type5">
                        <svg
                          class="union7"
                          width="10"
                          height="11"
                          viewBox="0 0 10 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M7.01967 1.47018C7.01967 1.19109 7.24591 0.964844 7.525 0.964844C8.78284 0.964844 9.80251 1.98452 9.80251 3.24235V5.51155C9.80251 5.78769 9.57865 6.01155 9.30251 6.01155H8.01967V9.55826C8.01967 9.8344 7.79581 10.0583 7.51967 10.0583C7.24352 10.0583 7.01967 9.8344 7.01967 9.55826V5.51155V1.47018ZM8.01967 5.01155H8.80251V3.24235C8.80251 2.71219 8.47957 2.25746 8.01967 2.06414V5.01155ZM1.20312 0.972656C1.47927 0.972656 1.70312 1.19651 1.70312 1.47266V4.53383C1.70312 4.75001 1.87837 4.92525 2.09455 4.92525C2.31072 4.92525 2.48597 4.75001 2.48597 4.53383V1.47266C2.48597 1.19651 2.70983 0.972656 2.98597 0.972656C3.26211 0.972656 3.48597 1.19651 3.48597 1.47266V4.53383C3.48597 5.12605 3.11598 5.63186 2.59455 5.83271V9.56607C2.59455 9.84221 2.37069 10.0661 2.09455 10.0661C1.81841 10.0661 1.59455 9.84221 1.59455 9.56607V5.83271C1.07311 5.63186 0.703125 5.12605 0.703125 4.53383V1.47266C0.703125 1.19651 0.926983 0.972656 1.20312 0.972656ZM4.67188 8.67498C4.67188 8.89116 4.84712 9.06641 5.0633 9.06641C5.27947 9.06641 5.45472 8.89116 5.45472 8.67498V6.50523C5.45472 6.28906 5.27947 6.11381 5.0633 6.11381C4.84712 6.11381 4.67188 6.28906 4.67188 6.50523V8.67498ZM5.0633 10.0664C4.29484 10.0664 3.67188 9.44345 3.67188 8.67498V6.50523C3.67188 5.91301 4.04186 5.4072 4.5633 5.20635V1.47299C4.5633 1.19685 4.78716 0.972994 5.0633 0.972994C5.33944 0.972994 5.5633 1.19685 5.5633 1.47299V5.20635C6.08473 5.4072 6.45472 5.91301 6.45472 6.50523V8.67498C6.45472 9.44345 5.83176 10.0664 5.0633 10.0664Z"
                            fill="#FBFBFB"
                          />
                        </svg>
                        <div class="_0-3-m">0.3m</div>
                      </div>
                    </div>
                    <div class="group-22086">
                      <div class="type6"></div>
                      <div class="type7"></div>
                      <div class="type8"></div>
                      <div class="type9"></div>
                    </div>
                  </div>
                </div>
                <div class="user-mark">
                  <div class="icon-neumad">
                    <svg
                      class="group-20854"
                      width="9"
                      height="9"
                      viewBox="0 0 9 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.69881 2.39402L1.61745 2.39689C0.981618 2.41928 0.549674 2.49391 0.277402 2.54433C0.0995643 2.57727 -0.0180376 2.74887 0.0147308 2.92762C0.0474993 3.10636 0.218229 3.22456 0.396067 3.19163C0.637019 3.147 1.0125 3.08153 1.56433 3.05765L1.67103 3.05303V3.58274C1.67103 3.69909 1.646 3.76223 1.62594 3.79563C1.60605 3.82872 1.57925 3.85228 1.54413 3.87073C1.46259 3.91357 1.36299 3.9161 1.31759 3.9161C1.05078 3.9161 0.789468 3.95545 0.597059 3.99269C0.499762 4.01152 0.417795 4.03028 0.359496 4.04405L0.32117 4.05317L0.29305 4.05984L0.288308 4.06095L0.284786 4.06151C0.128665 4.08646 0.00931012 4.22257 0.00931012 4.3865C0.00931012 4.56825 0.155903 4.71559 0.336735 4.71559C0.363766 4.71559 0.385955 4.71206 0.390315 4.71136L0.39102 4.71125C0.399523 4.70992 0.407068 4.70844 0.411884 4.70746C0.421741 4.70546 0.432232 4.70306 0.441002 4.70101L0.476344 4.69263L0.509304 4.68479C0.563174 4.67206 0.635684 4.6555 0.720894 4.639C0.893476 4.6056 1.10931 4.57429 1.31759 4.57429L1.32189 4.57429C1.38271 4.57438 1.61878 4.57419 1.84747 4.45405C1.97033 4.3895 2.09467 4.28874 2.18653 4.13582C2.27832 3.98302 2.32588 3.79779 2.32588 3.58274V3.0485H4.35656C4.98233 3.0485 5.29274 3.21629 5.45033 3.35926C5.6063 3.50076 5.65455 3.65323 5.68349 3.74468L5.68647 3.75409C5.74149 3.92719 5.92572 4.02278 6.09796 3.96752C6.27023 3.91225 6.3653 3.72708 6.31031 3.55393L6.30595 3.54009C6.27089 3.42834 6.17801 3.13277 5.88911 2.87067C5.58442 2.59425 5.10436 2.39031 4.35656 2.39031H2.36264L2.40017 2.25909C2.4495 2.08662 2.52941 1.88967 2.65614 1.70332C2.91345 1.32496 3.38041 0.962875 4.2716 0.962875H5.33307C6.46056 0.962875 7.20243 1.42076 7.66958 2.00886C8.14624 2.60892 8.34696 3.35894 8.34696 3.93243V5.31304C8.34696 5.71452 8.15693 6.29543 7.7581 6.77517C7.36714 7.24545 6.79181 7.59997 6.02422 7.59997H1.98365C1.34561 7.59997 1.03089 7.40089 0.869842 7.21319C0.699209 7.01433 0.654849 6.77432 0.654849 6.62984C0.654849 6.50875 0.678642 6.41288 0.72179 6.33593C0.765046 6.25878 0.823413 6.20842 0.879648 6.17189C1.01953 6.08102 1.20002 6.0482 1.31759 6.0482H5.99839C6.17922 6.0482 6.32582 5.90086 6.32582 5.71911C6.32582 5.53736 6.17922 5.39002 5.99839 5.39002H1.31759C1.11348 5.39002 0.798933 5.44063 0.524197 5.6191C0.230412 5.80994 0 6.13816 0 6.62984C0 6.88206 0.0723476 7.29156 0.373934 7.64304C0.685086 8.00568 1.19837 8.25816 1.98365 8.25816H6.02422C7.01667 8.25816 7.76645 7.79162 8.26062 7.1972C8.74686 6.61231 9.00181 5.8852 9.00181 5.31304V3.93243C9.00181 3.227 8.76083 2.32771 8.18134 1.59819C7.59232 0.856678 6.66352 0.304688 5.33307 0.304688H4.2716C3.16493 0.304688 2.49531 0.773442 2.11552 1.3319C1.88643 1.66876 1.76947 2.02747 1.7143 2.31369L1.69881 2.39402Z"
                        fill="#101011"
                        stroke="black"
                        stroke-width="0.3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="nearby2">
                <div class="controller">
                ${allNearbyStoresHTML}
                  <!--
                  <div class="item">
                    <div class="content">
                      <div class="header">
                        <div class="primary">
                          <div class="i"></div>
                        </div>
                        <div class="secondary">
                          <div class="span">
                            <div class="_0-3-m">0.3m</div>
                          </div>
                        </div>
                      </div>
                      <div class="image">
                        <div class="image-657"></div>
                      </div>
                      <div class="label">
                        <div class="span2">
                          <div class="sprouts-farmers-market">SPROUTS FARMERS MARKET</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="content">
                      <div class="header">
                        <div class="primary">
                          <div class="i"></div>
                        </div>
                        <div class="secondary">
                          <div class="span">
                            <div class="_0-3-m">0.3m</div>
                          </div>
                        </div>
                      </div>
                      <div class="image">
                        <div class="image-657"></div>
                      </div>
                      <div class="label">
                        <div class="span2">
                          <div class="sprouts-farmers-market">SPROUTS FARMERS MARKET</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="content">
                      <div class="header">
                        <div class="primary">
                          <div class="i"></div>
                        </div>
                        <div class="secondary">
                          <div class="span">
                            <div class="_0-3-m">0.3m</div>
                          </div>
                        </div>
                      </div>
                      <div class="image">
                        <div class="image-657"></div>
                      </div>
                      <div class="label">
                        <div class="span2">
                          <div class="sprouts-farmers-market">SPROUTS FARMERS MARKET</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="content">
                      <div class="header">
                        <div class="primary">
                          <div class="i"></div>
                        </div>
                        <div class="secondary">
                          <div class="span">
                            <div class="_0-3-m">0.3m</div>
                          </div>
                        </div>
                      </div>
                      <div class="image">
                        <div class="image-657"></div>
                      </div>
                      <div class="label">
                        <div class="span2">
                          <div class="sprouts-farmers-market">SPROUTS FARMERS MARKET</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="content">
                      <div class="header">
                        <div class="primary">
                          <div class="i"></div>
                        </div>
                        <div class="secondary">
                          <div class="span">
                            <div class="_0-3-m">0.3m</div>
                          </div>
                        </div>
                      </div>
                      <div class="image">
                        <div class="image-657"></div>
                      </div>
                      <div class="label">
                        <div class="span2">
                          <div class="sprouts-farmers-market">SPROUTS FARMERS MARKET</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="item2">
                    <div class="content">
                      <div class="header">
                        <div class="primary">
                          <div class="i"></div>
                        </div>
                        <div class="secondary">
                          <div class="span">
                            <div class="_0-3-m">0.3m</div>
                          </div>
                        </div>
                      </div>
                      <div class="image">
                        <div class="image-657"></div>
                      </div>
                      <div class="label">
                        <div class="span2">
                          <div class="sprouts-farmers-market">SPROUTS FARMERS MARKET</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  -->
                </div>
              </div>
         



              <!--
              <div class="nearby2">
                <div class="item3">
                  <div class="content">
                    <div class="label4">
                      <div class="type10">
                        <svg
                          class="groceries2"
                          width="9"
                          height="10"
                          viewBox="0 0 9 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0.723607 0.755912C0.568613 0.678415 0.384543 0.686697 0.237134 0.7778C0.0897262 0.868903 0 1.02984 0 1.20313V9.20313C0 9.47927 0.223858 9.70313 0.5 9.70313H8.5C8.77614 9.70313 9 9.47927 9 9.20313V1.20313C9 1.02984 8.91027 0.868903 8.76287 0.7778C8.61546 0.686697 8.43139 0.678415 8.27639 0.755912L7.5 1.14411L6.72361 0.755912C6.58284 0.68553 6.41716 0.68553 6.27639 0.755912L5.5 1.14411L4.72361 0.755912C4.58284 0.68553 4.41716 0.68553 4.27639 0.755912L3.5 1.14411L2.72361 0.755912C2.58284 0.68553 2.41716 0.68553 2.27639 0.755912L1.5 1.14411L0.723607 0.755912ZM1 8.70313V2.01214L1.27639 2.15034C1.41716 2.22072 1.58284 2.22072 1.72361 2.15034L2.5 1.76214L3.27639 2.15034C3.41716 2.22072 3.58284 2.22072 3.72361 2.15034L4.5 1.76214L5.27639 2.15034C5.41716 2.22072 5.58284 2.22072 5.72361 2.15034L6.5 1.76214L7.27639 2.15034C7.41716 2.22072 7.58284 2.22072 7.72361 2.15034L8 2.01214V8.70313H1ZM3.5 3.20313C3.22386 3.20313 3 3.42698 3 3.70313C3 3.97927 3.22386 4.20313 3.5 4.20313H5.5C5.77614 4.20313 6 3.97927 6 3.70313C6 3.42698 5.77614 3.20313 5.5 3.20313H3.5Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div class="distance">
                        <div class="_0-3-m2">0.3m</div>
                      </div>
                    </div>
                    <div
                      class="ca-los-angeles-county-cerritos-90730-01-sprouts-farmers-market-logo"
                    >
                      <img class="image-657" src="image-6570.png" />
                    </div>
                    <div class="name">
                      <div class="sprouts-farmers-market">
                        SPROUTS FARMERS MARKET
                      </div>
                    </div>
                  </div>
                </div>
                <div class="item4">
                  <div class="content">
                    <div class="label5">
                      <div class="type10">
                        <svg
                          class="donut-bitten4"
                          width="9"
                          height="10"
                          viewBox="0 0 9 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask id="path-1-inside-1_423_124357" fill="white">
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M8.75225 6.6794C8.14124 8.43957 6.46818 9.70312 4.5 9.70312C2.01472 9.70312 0 7.68841 0 5.20312C0 2.71784 2.01472 0.703125 4.5 0.703125C6.46995 0.703125 8.14426 1.96896 8.7539 3.73161C8.74438 3.73307 8.73484 3.7348 8.72529 3.73683C8.53983 3.77625 8.40042 3.91378 8.34984 4.08354C8.17583 4.05184 7.99035 4.11365 7.87119 4.2608C7.75178 4.40826 7.73004 4.60305 7.79774 4.76688C7.64238 4.8517 7.53699 5.01656 7.53699 5.20604C7.53699 5.39545 7.64231 5.56027 7.79759 5.64511C7.73074 5.80859 7.75274 6.00253 7.87174 6.14948C7.99058 6.29624 8.1754 6.35811 8.34902 6.32698C8.39944 6.49704 8.53897 6.63486 8.72466 6.67433C8.73387 6.67629 8.74307 6.67797 8.75225 6.6794ZM5 5.20312C5 5.47927 4.77614 5.70312 4.5 5.70312C4.22386 5.70312 4 5.47927 4 5.20312C4 4.92698 4.22386 4.70312 4.5 4.70312C4.77614 4.70312 5 4.92698 5 5.20312Z"
                            />
                          </mask>
                          <path
                            d="M8.75225 6.6794L9.69695 7.00733L10.0899 5.87531L8.90584 5.69127L8.75225 6.6794ZM8.7539 3.73161L8.90551 4.72005L10.091 4.53822L9.69897 3.40474L8.7539 3.73161ZM8.72529 3.73683L8.51739 2.75868L8.51738 2.75869L8.72529 3.73683ZM8.34984 4.08354L8.17062 5.06735L9.0523 5.22797L9.30821 4.36909L8.34984 4.08354ZM7.87119 4.2608L8.64833 4.89012L8.64833 4.89012L7.87119 4.2608ZM7.79774 4.76688L8.27694 5.64459L9.06473 5.21448L8.72194 4.38497L7.79774 4.76688ZM7.53699 5.20604L6.53699 5.20604L6.53699 5.20604L7.53699 5.20604ZM7.79759 5.64511L8.72319 6.02359L9.06151 5.19621L8.2771 4.76758L7.79759 5.64511ZM7.87174 6.14948L8.64888 5.52016L8.64888 5.52016L7.87174 6.14948ZM8.34902 6.32698L9.30777 6.04272L9.05338 5.18475L8.17254 5.34268L8.34902 6.32698ZM8.72466 6.67433L8.93258 5.69619L8.93257 5.69619L8.72466 6.67433ZM4.5 10.7031C6.90711 10.7031 8.95061 9.15737 9.69695 7.00733L7.80755 6.35147C7.33188 7.72177 6.02925 8.70312 4.5 8.70312V10.7031ZM-1 5.20312C-1 8.24069 1.46243 10.7031 4.5 10.7031V8.70312C2.567 8.70312 1 7.13612 1 5.20312H-1ZM4.5 -0.296875C1.46243 -0.296875 -1 2.16556 -1 5.20312H1C1 3.27013 2.567 1.70312 4.5 1.70312V-0.296875ZM9.69897 3.40474C8.95429 1.25166 6.90928 -0.296875 4.5 -0.296875V1.70312C6.03063 1.70312 7.33423 2.68626 7.80883 4.05847L9.69897 3.40474ZM8.60229 2.74317C8.57424 2.74747 8.54592 2.75262 8.51739 2.75868L8.9332 4.71498C8.92375 4.71699 8.91451 4.71867 8.90551 4.72005L8.60229 2.74317ZM8.51738 2.75869C7.95968 2.87723 7.54238 3.29153 7.39147 3.798L9.30821 4.36909C9.25846 4.53604 9.11998 4.67528 8.93321 4.71498L8.51738 2.75869ZM8.52907 3.09973C8.00992 3.00516 7.45236 3.189 7.09404 3.63148L8.64833 4.89012C8.52833 5.03831 8.34174 5.09852 8.17062 5.06735L8.52907 3.09973ZM7.09404 3.63148C6.73497 4.0749 6.67156 4.66 6.87354 5.14879L8.72194 4.38497C8.78852 4.54609 8.76859 4.74162 8.64833 4.89012L7.09404 3.63148ZM7.31854 3.88917C6.85504 4.14223 6.53699 4.63627 6.53699 5.20604L8.53699 5.20604C8.53699 5.39686 8.42972 5.56117 8.27694 5.64459L7.31854 3.88917ZM6.53699 5.20604C6.53699 5.77562 6.85483 6.26952 7.31807 6.52265L8.2771 4.76758C8.4298 4.85102 8.53699 5.01528 8.53699 5.20604L6.53699 5.20604ZM6.87198 5.26663C6.67256 5.75433 6.73677 6.33693 7.09459 6.7788L8.64888 5.52016C8.76871 5.66814 8.78893 5.86284 8.72319 6.02359L6.87198 5.26663ZM7.09459 6.77879C7.45196 7.22012 8.00756 7.40415 8.5255 7.31129L8.17254 5.34268C8.34325 5.31207 8.5292 5.37236 8.64888 5.52016L7.09459 6.77879ZM7.39027 6.61124C7.5407 7.1186 7.95834 7.53379 8.51675 7.65248L8.93257 5.69619C9.11959 5.73594 9.25818 5.87548 9.30777 6.04272L7.39027 6.61124ZM8.51674 7.65248C8.54439 7.65836 8.57172 7.66335 8.59866 7.66754L8.90584 5.69127C8.91441 5.6926 8.92334 5.69422 8.93258 5.69619L8.51674 7.65248ZM4.5 6.70312C5.32843 6.70312 6 6.03155 6 5.20312H4C4 4.92698 4.22386 4.70312 4.5 4.70312V6.70312ZM3 5.20312C3 6.03155 3.67157 6.70312 4.5 6.70312V4.70312C4.77614 4.70312 5 4.92698 5 5.20312H3ZM4.5 3.70312C3.67157 3.70312 3 4.3747 3 5.20312H5C5 5.47927 4.77614 5.70312 4.5 5.70312V3.70312ZM6 5.20312C6 4.3747 5.32843 3.70312 4.5 3.70312V5.70312C4.22386 5.70312 4 5.47927 4 5.20312H6Z"
                            fill="black"
                            mask="url(#path-1-inside-1_423_124357)"
                          />
                        </svg>
                      </div>
                      <div class="distance2">
                        <div class="_0-3-m3">0.3m</div>
                      </div>
                    </div>
                    <div
                      class="ca-los-angeles-county-cerritos-90730-01-old-ferry-donut-logo"
                    >
                      <img class="image-658" src="image-6580.png" />
                    </div>
                    <div class="name">
                      <div class="old-ferry-donut">Old Ferry donut</div>
                    </div>
                  </div>
                </div>
                <div class="item3">
                  <div class="content">
                    <div class="label5">
                      <div class="frame-21983">
                        <svg
                          class="union11"
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M6.31654 1.20846C6.31654 0.929372 6.54279 0.703125 6.82188 0.703125C8.07971 0.703125 9.09939 1.7228 9.09939 2.98063V5.24983C9.09939 5.52597 8.87553 5.74983 8.59939 5.74983H7.31654V9.29654C7.31654 9.57268 7.09268 9.79654 6.81654 9.79654C6.5404 9.79654 6.31654 9.57268 6.31654 9.29654V5.24983V1.20846ZM7.31654 4.74983H8.09939V2.98063C8.09939 2.45047 7.77644 1.99574 7.31654 1.80242V4.74983ZM0.5 0.710938C0.776142 0.710938 1 0.934795 1 1.21094V4.27211C1 4.48829 1.17525 4.66353 1.39142 4.66353C1.6076 4.66353 1.78285 4.48829 1.78285 4.27211V1.21094C1.78285 0.934795 2.0067 0.710938 2.28285 0.710938C2.55899 0.710938 2.78285 0.934795 2.78285 1.21094V4.27211C2.78285 4.86433 2.41286 5.37014 1.89142 5.571V9.30435C1.89142 9.58049 1.66756 9.80435 1.39142 9.80435C1.11528 9.80435 0.891423 9.58049 0.891423 9.30435V5.571C0.369987 5.37014 0 4.86433 0 4.27211V1.21094C0 0.934795 0.223858 0.710938 0.5 0.710938ZM3.96875 8.41327C3.96875 8.62944 4.144 8.80469 4.36017 8.80469C4.57635 8.80469 4.7516 8.62944 4.7516 8.41327V6.24351C4.7516 6.02734 4.57635 5.85209 4.36017 5.85209C4.144 5.85209 3.96875 6.02734 3.96875 6.24351V8.41327ZM4.36017 9.80469C3.59171 9.80469 2.96875 9.18173 2.96875 8.41327V6.24351C2.96875 5.65129 3.33874 5.14548 3.86017 4.94463V1.21128C3.86017 0.935133 4.08403 0.711275 4.36017 0.711275C4.63631 0.711275 4.86017 0.935133 4.86017 1.21128V4.94463C5.38161 5.14548 5.7516 5.65129 5.7516 6.24351V8.41327C5.7516 9.18173 5.12863 9.80469 4.36017 9.80469Z"
                            fill="#101011"
                          />
                        </svg>
                      </div>
                      <div class="_1-2-m">1.2m</div>
                    </div>
                    <div
                      class="ca-los-angeles-county-cerritos-90730-01-bcd-tofu-house-logo"
                    >
                      <img class="image-678" src="image-6780.png" />
                    </div>
                    <div class="name">
                      <div class="bcd-tofu-house">Bcd Tofu House</div>
                    </div>
                  </div>
                </div>
                <div class="item3">
                  <div class="content">
                    <div class="label5">
                      <div class="type10">
                        <svg
                          class="groceries3"
                          width="9"
                          height="10"
                          viewBox="0 0 9 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M0.723607 0.755912C0.568613 0.678415 0.384543 0.686697 0.237134 0.7778C0.0897262 0.868903 0 1.02984 0 1.20313V9.20313C0 9.47927 0.223858 9.70313 0.5 9.70313H8.5C8.77614 9.70313 9 9.47927 9 9.20313V1.20313C9 1.02984 8.91027 0.868903 8.76287 0.7778C8.61546 0.686697 8.43139 0.678415 8.27639 0.755912L7.5 1.14411L6.72361 0.755912C6.58284 0.68553 6.41716 0.68553 6.27639 0.755912L5.5 1.14411L4.72361 0.755912C4.58284 0.68553 4.41716 0.68553 4.27639 0.755912L3.5 1.14411L2.72361 0.755912C2.58284 0.68553 2.41716 0.68553 2.27639 0.755912L1.5 1.14411L0.723607 0.755912ZM1 8.70313V2.01214L1.27639 2.15034C1.41716 2.22072 1.58284 2.22072 1.72361 2.15034L2.5 1.76214L3.27639 2.15034C3.41716 2.22072 3.58284 2.22072 3.72361 2.15034L4.5 1.76214L5.27639 2.15034C5.41716 2.22072 5.58284 2.22072 5.72361 2.15034L6.5 1.76214L7.27639 2.15034C7.41716 2.22072 7.58284 2.22072 7.72361 2.15034L8 2.01214V8.70313H1ZM3.5 3.20313C3.22386 3.20313 3 3.42698 3 3.70313C3 3.97927 3.22386 4.20313 3.5 4.20313H5.5C5.77614 4.20313 6 3.97927 6 3.70313C6 3.42698 5.77614 3.20313 5.5 3.20313H3.5Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div class="distance2">
                        <div class="_0-1-m">0.1m</div>
                      </div>
                    </div>
                    <div class="logo">
                      <img class="image-657" src="image-6571.png" />
                    </div>
                    <div class="name">
                      <div class="sprouts-farmers-market">
                        SPROUTS FARMERS MARKET
                      </div>
                    </div>
                  </div>
                </div>
                <div class="item5">
                  <div class="frame-1321322022">
                    <div class="content2">
                      <div class="label5">
                        <div class="type10">
                          <svg
                            class="donut"
                            width="9"
                            height="10"
                            viewBox="0 0 9 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M8 5.20312C8 7.13612 6.433 8.70312 4.5 8.70312C2.567 8.70312 1 7.13612 1 5.20312C1 3.27013 2.567 1.70312 4.5 1.70312C6.433 1.70312 8 3.27013 8 5.20312ZM9 5.20312C9 7.68841 6.98528 9.70312 4.5 9.70312C2.01472 9.70312 0 7.68841 0 5.20312C0 2.71784 2.01472 0.703125 4.5 0.703125C6.98528 0.703125 9 2.71784 9 5.20312ZM5 5.20312C5 5.47927 4.77614 5.70312 4.5 5.70312C4.22386 5.70312 4 5.47927 4 5.20312C4 4.92698 4.22386 4.70312 4.5 4.70312C4.77614 4.70312 5 4.92698 5 5.20312ZM6 5.20312C6 6.03155 5.32843 6.70312 4.5 6.70312C3.67157 6.70312 3 6.03155 3 5.20312C3 4.3747 3.67157 3.70312 4.5 3.70312C5.32843 3.70312 6 4.3747 6 5.20312Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                        <div class="distance">
                          <div class="_0-3-m3">0.3m</div>
                        </div>
                      </div>
                      <div class="name">
                        <div class="old-ferry-donut">Old Ferry donut</div>
                      </div>
                    </div>
                  </div>
                  <div class="frame-21975">
                    <img class="image-658" src="image-6581.png" />
                  </div>
                </div>
                <div class="item5">
                  <div class="frame-13213220222">
                    <div class="content2">
                      <div class="label5">
                        <div class="type10">
                          <svg
                            class="donut2"
                            width="9"
                            height="10"
                            viewBox="0 0 9 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M8 5.20312C8 7.13612 6.433 8.70312 4.5 8.70312C2.567 8.70312 1 7.13612 1 5.20312C1 3.27013 2.567 1.70312 4.5 1.70312C6.433 1.70312 8 3.27013 8 5.20312ZM9 5.20312C9 7.68841 6.98528 9.70312 4.5 9.70312C2.01472 9.70312 0 7.68841 0 5.20312C0 2.71784 2.01472 0.703125 4.5 0.703125C6.98528 0.703125 9 2.71784 9 5.20312ZM5 5.20312C5 5.47927 4.77614 5.70312 4.5 5.70312C4.22386 5.70312 4 5.47927 4 5.20312C4 4.92698 4.22386 4.70312 4.5 4.70312C4.77614 4.70312 5 4.92698 5 5.20312ZM6 5.20312C6 6.03155 5.32843 6.70312 4.5 6.70312C3.67157 6.70312 3 6.03155 3 5.20312C3 4.3747 3.67157 3.70312 4.5 3.70312C5.32843 3.70312 6 4.3747 6 5.20312Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                        <div class="distance">
                          <div class="_0-3-m3">0.3m</div>
                        </div>
                      </div>
                      <div class="name">
                        <div class="old-ferry-donut">Old Ferry donut</div>
                      </div>
                    </div>
                  </div>
                  <div class="frame-21975">
                    <div
                      class="ca-los-angeles-county-cerritos-90730-01-bcd-tofu-house-logo"
                    >
                      <img class="image-678" src="image-6781.png" />
                    </div>
                  </div>
                </div>
              </div>
              -->



            </div>
          </div>
        </div>
      </div>
      ${element.lineH.render(30)}
      <div class="summary">
        <div class="list">
          <div class="title5">
            <div class="body2">
              <span class="title6">Title</span>
            </div>
          </div>
          <div class="bullets">
          ${attributeFacilityHTML}
            <!--
            <div class="item6">
              <div class="icon"></div>
              <div class="bullets2">
                <div class="title2">
                  <div class="neighborhood">Neighborhood</div>
                </div>
                <div class="array">
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                </div>
              </div>
            </div>
            <div class="item6">
              <div class="icon"></div>
              <div class="summary-bullets">
                <div class="title2">
                  <div class="noise">Noise</div>
                </div>
                <div class="array">
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                </div>
              </div>
            </div>
            <div class="item6">
              <div class="icon"></div>
              <div class="summary-bullets2">
                <div class="title2">
                  <div class="parking">Parking</div>
                </div>
                <div class="array2">
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                  <a class="glyph-15-item-dev">
                    <div class="list-item">list-item</div>
                    <div class="glyph-temp"></div>
                  </a>
                </div>
              </div>
            </div>
            -->
          </div>
        </div>
        <div class="button">
          <div class="button-anchor">
            <button class="container">
              <div class="label-glyph">
                <div class="text3">
                  <div class="button2">button</div>
                </div>
                <div class="glyph">
                  <div class="glyph-temp2"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
`;
  },
};
