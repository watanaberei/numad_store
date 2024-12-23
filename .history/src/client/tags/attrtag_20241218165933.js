import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';
import * as Function from '../components/function.js';
import { getStatsScore } from '../components/function.js';


export const attrtag = {
    render: (data) => {
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
  //     console.log('attrtagScore render called with:', data);

    const tags = data.tags || [];
  
     if (!data.attrtag || !Array.isArray(data.attrtag)) {
       console.warn('No attrtag data found');
       return '';
     }
  
  
    //  const visibleSections = data.attrtag.slice(0, 3);
    //  const hiddenSectionsCount = Math.max(0, data.attrtag.length - 3);
  
    return `
       ${tags.map(tag => {
        const tagScoreResult = getStatsScore(tag.score);
        // console.log('Attrtag score result:', tagScoreResult);
        
        return `
          <button class="attrtag tag" id="attrtag" data-name="value" data-score="${tag.score}">
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
  
    //  return `
    //    <div class="location-attributes-container  col04">
    //      <div class="title">
    //        <span class="text03">
    //          The Area
    //        </span>
    //      </div>
    //      ${visibleSections.map(section => {
    //        console.log('debug log: storeLocation10 - Processing section:', section);
          
    //        if (!section.attributes || section.attributes.length === 0) {
    //          return '';
    //        }
  
  
    //        const limit = 2;
    //        const tagsPerLine = 3;
    //        const visibleTags = section.attributes.slice(0, limit * tagsPerLine);
    //        const hiddenTagsCount = section.attributes.length - visibleTags.length;
    //        const title = section.title;
    //        const count = section.attributes.reduce((total, attr) => total + attr.count, 0);
    //        let geotagData = {
    //          geotag: title,
    //          count: count
    //        };
    //        console.log('debug log: storeLocation11 - title:', title);
    //        return `
    //          <div class="tag-line line col04">
  
  
    //            ${geotag.geotagCountItem.render(geotagData)}
  
  
    //            <div class="tag-line">
    //              ${attrtag.attrtagScore.render({
    //                tags: visibleTags.map(attr => ({
    //                  label: attr.label,
    //                  score: attr.score,
    //                  count: attr.count
    //                })),
    //                limit
    //              })}
    //              ${hiddenTagsCount > 0 ? `
    //                <button class="button-more tag-more">
    //                  ${glyph.glyphSymbolPlus}
    //                  <span class="text02" id="count">
    //                    ${hiddenTagsCount}
    //                  </span>
    //                  <span class="text02">
    //                    more
    //                  </span>
    //                </button>
    //              ` : ''}
    //            </div>
    //          </div>
    //        `;
    //      }).join('')}
    //      ${hiddenSectionsCount > 0 ? `
    //        <button class="button-more sections-more">
    //          ${glyph.glyphSymbolPlus}
    //          <span class="text02" id="sections-count">
    //            ${hiddenSectionsCount}
    //          </span>
    //          <span class="text02">
    //            more sections
    //          </span>
    //        </button>
    //      ` : ''}
    //    </div>
    //  `;
   afterRender: () => {
     console.log('debug log: storeLocation11 - Running afterRender');
    
     // Existing geotag button handlers
     const attrtagButtons = document.querySelectorAll('.attrtag');
     console.log('debug log: storeLocation12 - Found geotag buttons:', attrtagButtons.length);
    
     attrtagButtons.forEach(button => {
       button.addEventListener('mouseenter', (e) => {
         button.classList.add('hovered');
       });
       button.addEventListener('mouseleave', (e) => {
         button.classList.remove('hovered');
       });
      
       const scoreIcons = button.querySelectorAll('.score-icon');
       console.log('debug log: storeLocation13 - Score icons for button:', scoreIcons.length);
      
       scoreIcons.forEach(icon => {
         icon.addEventListener('click', (e) => {
           e.stopPropagation();
           const newScore = parseInt(icon.getAttribute('data-score'));
           button.setAttribute('data-score', newScore);
           scoreIcons.forEach((si, index) => {
             si.classList.toggle('active', index <= newScore);
           });
           button.classList.add('selected');
           button.querySelector('.single-icon').innerHTML = icon.innerHTML;
         });
       });
     });
  
  
    //  // New section more button handler
    //  const sectionMoreButton = document.querySelector('.sections-more');
    //  if (sectionMoreButton) {
    //    console.log('debug log: storeLocation14 - Found sections-more button');
    //    sectionMoreButton.addEventListener('click', () => {
    //      console.log('debug log: storeLocation15 - Show more sections clicked');
    //      // Add your show more sections logic here
    //    });
    //  }
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