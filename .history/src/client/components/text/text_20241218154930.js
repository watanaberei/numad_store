import * as glyph from '../icon/glyph.js';
import * as style from '../styles/style.js';
import * as icon from '../icon/icon.js';
import * as Pictogram from '../icon/pictogram.js';
import * as Tag from '../tags/tag.js';
import * as geotag from  '../tags/geotag.js';
import * as objtag from '../tags/objtag.js';
import * as amtag from '../tags/amtag.js';
import * as attrtag from '../tags/attrtag.js';
import { getStatsScore } from '../components/function.js';




export const textHeader = {
    render: (data) => {
        const header = data;
        const iconMenuMore = icon.iconMenuMore;
      return `

          <div class="primary">
            <span class="text04">${header}</span>
          </div>
          <div class="secondary">
            <div class="action">
              ${iconMenuMore}
            </div>
          </div>

      `;
    }
  };



  export const textBlock = {
    render: (data) => {
      const iconMenuMore = icon.iconMenuMore;
      const content = data.content;
      return `
        <div class="text-component span04">
          <div class="title">
            <div class="title-text text02">Summary</div>
            ${iconMenuMore}
          </div>
          <div class="text-reveal">
            <div id="text-reveal" class="body-content text02">${content}</div>
            <button class="button-more reveal show-more text02">Show More</button>
          </div>
        </div>
      `;
    },
    
    initialize: () => {
      const textComponents = document.querySelectorAll('.text-component');
      textComponents.forEach(component => {
        const content = component.querySelector('.body-content');
        const button = component.querySelector('.button-more');
        
        if (content && button) {
          let isExpanded = false;
  
          const toggleContent = () => {
            console.log('isClicked');
            if (isExpanded) {
              content.style.webkitLineClamp = '3';
              content.style.overflow = 'hidden';
              button.textContent = 'Show More';
            } else {
              content.style.webkitLineClamp = 'unset';
              content.style.overflow = 'visible';
              button.textContent = 'Show Less';
            }
            isExpanded = !isExpanded;
          };
  
          button.addEventListener('click', toggleContent);
  
          // Initial state
          content.style.maxHeight = '60px';
          content.style.overflow = 'hidden';
        }
      });
    }
  };

// export const textBlock = {
//     render: (data) => {
//         const iconMenuMore = icon.iconMenuMore;
//         const content = data.content;
//       return `
//         <div class="text-component span04">
//           <div class="title">
//             <div class="title-text text02">Summary</div>
//             ${iconMenuMore}
//           </div>
//           <div id="text-reveal" class="body-content text02">${content}</div>
//           <button id="button-reveal" class="button-more reveal show-more text02">Show More</button>
//         </div>
//       `;
//     },
  
//     afterRender: () => {
//       // Ensure that this function runs after the DOM is fully loaded
//       window.onload = () => {
//         const showMoreBtn = document.querySelector('#button-reveal');
//         const content = document.querySelector('#text-reveal');
        
//         if (showMoreBtn && content) {
//           let isExpanded = false;
  
//           showMoreBtn.addEventListener('click', () => {
//             if (isExpanded) {
//               console.log('isClicked');
//               content.style.webkitLineClamp = '3';
//               showMoreBtn.textContent = 'Show More';
//             } else {
//               content.style.webkitLineClamp = 'unset';
//               showMoreBtn.textContent = 'Show Less';
//             }
//             isExpanded = !isExpanded;
//           });
//         }
//       };
//     }
//   };