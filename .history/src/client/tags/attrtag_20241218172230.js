import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';
import * as Function from '../components/function.js';
import { getStatsScore } from '../components/function.js';


export const attrtag = {
    render: () => {
      const icon = glyph.glyphDetailStar;
      const attribute = data.attribute;
      const count = data.count;   
      return `
        <button class="attrtag tag">
            ${icon}  
            <span class="label">${attribute}</span>
        </button>
      `;
  }
  };


  export const attrtagCount = {
    render: (data) => {
      const attribute = data.attribute;
      const count = data.count;
      return `
      <div class="pill">
        <button class="attrtag tag">
          <span class="label sentance">
            ${attribute}
     
            <span class="counter word">
              
              ${glyph.glyphSymbolParenthesisL}
               
              <span class="label ">${count}</span>
           
              ${glyph.glyphSymbolParenthesisR}
      
            </span>
          </span>
        </button>
      </div>
        
      `;
    }
  };
  



// export const attrtagScore = {
//   render: (data) => {
//     console.log('attrtagScore render called with:', data);
//     const getStatsScore = Function.getStatsScore;
//     const tags = data.tags || [];
//     const CreateScoreInterface = {
//       render: (data) => {
//       return `
//         <div class="score-icons">
//           ${tagScoreResult.icons.map((icon, index) => `
//             <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
//               ${icon.icon}
//             </span>
//           `).join('')}
//         </div>`;
//           },
//         };


//     return `
//        ${tags.map(tag => {
//         const tagScoreResult = getStatsScore(tag.score);
//         // console.log('Attrtag score result:', tagScoreResult);
        
//         return `
//           <button class="attrtag tag" id="attrtag" data-name="value" data-score="${tag.score}">
//             <div class="single-icon">
//               ${tagScoreResult.icons[tagScoreResult.currentScore]?.icon || ''}
//             </div>
            
//             <div class="label">
//               <span class="text02">${tag.label}</span>
//             </div>
//           </button>
//         `;
//       }).join('')}
//     `;

//   },
//   afterRender: () => {
//     console.log('debug log: storeLocation11 - Found Attrtag buttons:');
//    const CreateScoreInterface = CreateScoreInterface.render();
//     // Existing geotag button handlers
//     const attrtagButtons = document.querySelectorAll('#score.attrtag.tag');
//     console.log('debug log: storeLocation12 - Found Attrtag buttons:', attrtagButtons.length);
   
//     attrtagButtons.forEach(button => {
//       button.addEventListener('mouseenter', (e) => {
//         console.log('Attrtag mouseEnter CreateScoreInterface')
//         button.classList.add('hovered');
//         button.addElement(CreateScoreInterface);
//       });
//       button.addEventListener('mouseleave', (e) => {
//         button.classList.remove('hovered');
//         button.removeElement(CreateScoreInterface);
//       });
     
//       const scoreIcons = button.querySelectorAll('.score-icon');
//       console.log('debug log: storeLocation13 - Score icons for button:', scoreIcons.length);
     
//       scoreIcons.forEach(icon => {
//         icon.addEventListener('click', (e) => {
//           e.stopPropagation();
//           const newScore = parseInt(icon.getAttribute('data-score'));
//           button.setAttribute('data-score', newScore);
//           scoreIcons.forEach((si, index) => {
//             si.classList.toggle('active', index <= newScore);
//           });
//           button.classList.add('selected');
//           button.querySelector('.single-icon').innerHTML = icon.innerHTML;
//         });
//       });
//     });
//  }};

 
// export const attrtagScore = {
//   render: (data) => {
//     console.log('attrtagScore render called with:', data);

//     const tags = data.tags || [];
//     return `
//       ${tags.map(tag => {
//         const tagScoreResult = getStatsScore(tag.score);
//         console.log('Tag score result:', tagScoreResult);
        
//         return `
//           <button class="attrtag tag" id="attrtag" data-name="value" data-score="${tag.score}">
//             <div class="single-icon">
//               ${tagScoreResult.icons[tagScoreResult.currentScore]?.icon || ''}
//             </div>
//             <div class="score-icons">
//               ${tagScoreResult.icons.map((icon, index) => `
//                 <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
//                   ${icon.icon}
//                 </span>
//               `).join('')}
//             </div>
//             <div class="label">
//               <span class="text02">${tag.label}</span>
//             </div>
//           </button>
//         `;
//       }).join('')}
//     `;
//   }
// };
  


export const attrtagScore = {
  render: (data) => {
    console.log('debug log: storeLocation09 - Location data received:', data);

    const tags = data.tags || [];
  
    return `
      ${tags.map(tag => {
        const tagScoreResult = getStatsScore(tag.score);
        
        return `
          <button class="attrtag-score attrtag tag" id="attrtag-score" data-name="value" data-score="${tag.score}">
            <div class="single-icon">
              ${tagScoreResult.icons[tagScoreResult.currentScore]?.icon || ''}
            </div>
            
            <div class="label">
              <span class="text02">${tag.label}</span>
            </div>
          </button>
        `;
      }).join('')}
    `;
  },  
  afterRender: () => {
    document.addEventListener('DOMContentLoaded', () => {
      const attrtagButtons = document.querySelectorAll('.attrtag-score');
      console.log('debug log: storeLocation12 - Found Attrtag buttons:', attrtagButtons.length);

      attrtagButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
          console.log('Attrtag mouseEnter CreateScoreInterface');
          button.classList.add('hovered');
          const tagScoreResult = getStatsScore(button.getAttribute('data-score'));
          const CreateScoreInterface = {
            render: () => {
              return `
                <div class="score-icons">
                  ${tagScoreResult.icons.map((icon, index) => `
                    <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
                      ${icon.icon}
                    </span>
                  `).join('')}
                </div>`;
            },
          };
          button.insertAdjacentHTML('beforeend', CreateScoreInterface.render());

          // Add tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip';
          tooltip.innerHTML = `Score: ${button.getAttribute('data-score')}`;
          button.appendChild(tooltip);
        });

        button.addEventListener('mouseleave', () => {
          button.classList.remove('hovered');
          const scoreInterface = button.querySelector('.score-icons');
          if (scoreInterface) {
            scoreInterface.remove();
          }

          // Remove tooltip
          const tooltip = button.querySelector('.tooltip');
          if (tooltip) {
            tooltip.remove();
          }
        });

        const scoreIcons = button.querySelectorAll('.score-icon');
        console.log('debug log: storeLocation13 - Score icons for button:', scoreIcons.length);

        scoreIcons.forEach(icon => {
          icon.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            const newScore = parseInt(icon.getAttribute('data-score'));
            button.setAttribute('data-score', newScore);
            scoreIcons.forEach((si, index) => {
              si.classList.toggle('active', index <= newScore);
            });
            button.classList.add('selected');
            button.querySelector('.single-icon').innerHTML = icon.innerHTML;

            // Update tooltip
            const tooltip = button.querySelector('.tooltip');
            if (tooltip) {
              tooltip.innerHTML = `Score: ${newScore}`;
            }
          });
        });
      });
    });
  }
};



  // export const attrtagStatus = {
  //   render: (data) => {
  //     const icon = glyph.glyphDetailPrice;
  //     const status = data.status;
  //     return `
  //       <button class="attrtag tag">
  //         <span class="label">Now: ${status}</span>
  //       </button>
  //     `;
  //   }
  // };