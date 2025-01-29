import * as glyph from "../icon/glyph.js";
import * as icon from "../icon/icon.js";
import * as Function from "../function/function.js";

export const amtagRating = {
  render: (data) => {
    const icon = glyph.glyphDetailStar;
    const rating = data.rating;
    return `
        <button class="amtag tag">
            ${icon}  
            <span class="label">${rating}</span>
        </button>
      `;
  }
};

// Updated amtagGroup component
export const amtagGroup = {
  render: (data) => {
    return `
      <button class="amtag tag" data-name="value" ${
        data.url ? `data-url="${data.url}"` : ""
      }>
      <div class="label">
        <span class="text02" id="text02">${data.category}</span>
      </div>
      <div class="single-icon">
        ${glyph.glyphActionArrow}
      </div>
      </button>
    `;
  }
};

// export const amtagGroup = {
//   render: (data) => {
//     const category = data.category;
//     return `
//       <button class="amtag tag">
//         <div class="amtag tag">
//           <div class="label">
//             <span class="label">${category}</span>
//           </div>
//           <div class="icon">
//             ${glyph.glyphActionArrow}
//           </div>
//         </div>
//       </button>
//     `;
//   }
// };

// Updated amtagItem component
export const amtagItem = {
  render: (data) => {
    return `
    <button class="amtag tag" id="amtag" data-name="value" ${
      data.url ? `data-url="${data.url}"` : ""
    }>

      <span class="rank">
      ${glyph.glyphSymbolNumber} 

        <span class="count label">${data.rank}</span>
      </span>
  
      <div class="label">
        <span class="text02" id="text02">${data.name}}</span>
      </div>
      <span class="icon">
        ${glyph.glyphActionArrow} 
      </span>

    </button>
    `;
  }
};

// Updated amtagItem component
export const amtagFootnote = {
  render: (data) => {
    return `
      <button class="amtag tag footnote" data-name="value" ${
        data.url ? `data-url="${data.url}"` : ""
      }>
        <div class="label">
          <span class="text02 truncate-text" id="text02">${data.name}</span>
        </div>
        <div class="icon">
          ${glyph.glyphActionArrow}
        </div>
      </button>
    `;
  }
};
// export const amtagItem = {
//   render: (data) => {
//     // const category = data.category;
//     return `
//       <button class="amtag tag">
//         <div class="amtag tag">
//           <div class="rank">
//             <i class="glyph glyph-pound"></i>
//             <span class="count label">${data.rank}</span>
//           </div>
//           <div class="label">
//             <span class="label">${data.name}</span>
//           </div>
//           <div class="icon">
//             ${glyph.glyphActionArrow}
//           </div>
//         </div>
//       </button>
//     `;
//   }
// };

// Updated amtagSource component
export const amtagSource = {
  render: (data) => {
    return `
      <button class="amtag tag ${data.extraClasses || ""}" data-name="value" ${
      data.url ? `data-url="${data.url}"` : ""
    }>
        ${
          data.logo
            ? `
          <div class="single-icon">
            <img src="${data.logo}" alt="${data.name} logo" class="source-logo">
          </div>
        `
            : ""
        }
        <div class="label">
          <span class="text02 truncate-text" id="text02">${data.name}</span>
        </div>
      </button>
    `;
  }
};

// export const amtagSource = {
//   render: (data) => {
//     // const category = data.category;
//     return `
//       <button class="amtag tag">
//         <div class="amtag tag">
//           <div class="logo">
//             <img src="${data.partnerLogo}" alt="Partner logo" class="partner-logo-thumbnail" width="15" height="15">
//           </div>
//         </div>
//       </button>
//     `;
//   }
// };

// Add event listeners for all amtags
document.addEventListener("DOMContentLoaded", () => {
  // Handle amtag clicks
  document.querySelectorAll(".amtag").forEach((tag) => {
    tag.addEventListener("click", (e) => {
      const url = tag.dataset.url;
      if (url) {
        e.preventDefault();
        // Handle navigation or modal opening based on URL
        if (url.includes("/gallery/")) {
          // Open gallery modal
          openGalleryModal(url);
        } else {
          // Regular navigation
          window.location.href = url;
        }
      }
    });
  });
});

// export const amtagScore = {
//   render: (data) => {
//     const tags = data.tags || [];
//     const tagsPerLine = 3; // Assuming 3 tags fit in one line
//     const visibleTags = tags.slice(0, data.limit * tagsPerLine);
//     const hiddenTagsCount = tags.length - visibleTags.length;
//     const scoreResult = getStatsScore(parseInt(data.score));

//     return `
//       ${visibleTags
//         .map((tag) => {
//           const tagScoreResult = getStatsScore(tag.score);
//           return `
//             <button class="amtag tag" id="amtag" data-name="value" data-score="${
//               tag.score
//             }">
//               <div class="single-icon">
//                 ${
//                   tagScoreResult.icons[tagScoreResult.currentScore]?.icon ||
//                   ""
//                 }
//               </div>
//               <div class="score-icons">
//                 ${tagScoreResult.icons
//                   .map(
//                     (icon, index) => `
//                   <span class="score-icon ${
//                     index === tagScoreResult.currentScore ? "active" : ""
//                   }" data-score="${index}" title="${icon.tooltip}">
//                     ${icon.icon}
//                   </span>
//                 `
//                   )
//                   .join("")}
//               </div>
//               <div class="label">
//                 <span class="text02" id="text02">${tag.label}</span>
//               </div>
//             </button>    
//           `;
//         })
//       .join("")}
//       }
//     `;
//   }
// };
export const amtagScore = {
  render: (data) => {
    console.log('amtagScore render called with:', data);
    const getStatsScore = Function.getStatsScore;
    const tags = data.tags || [];
    return `
      ${tags.map(tag => {
        const tagScoreResult = getStatsScore(tag.score);
        console.log('Tag score result:', tagScoreResult);
        
        return `
          <button id="score" class="amtag tag" data-name="value" data-score="${tag.score}">
            ${Function.getStatsScore(tag.score)}
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
    console.log('debug log: storeLocation11 - Running afterRender');
   
    // Existing geotag button handlers
    const geotagButtons = document.querySelectorAll('#score.amtag.tag');
    console.log('debug log: storeLocation12 - Found geotag buttons:', geotagButtons.length);
   
    geotagButtons.forEach(button => {
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
 }};

  
//   CreateScoreWidget: (tag) => {
//     const tagScoreResult = Function.getStatsScore(tag.score);
//     return `
//       <div class="score-icons">
//           ${tagScoreResult.icons.map((icon, index) => `
//             <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
//               ${icon.icon}
//             </span>
//           `).join('')}
//         </div>
//     `;
//   },

//   afterRender: () => {
//     document.querySelectorAll('#score.amtag.tag').forEach(amtagScoreButton => {
//       amtagScoreButton.addEventListener('mouseenter', (e) => {
//         console.log('Mouse entered to the amtagScoreButton');
//         const tag = {
//           score: amtagScoreButton.dataset.score,
//           label: amtagScoreButton.querySelector('.text02').innerText
//         };
//         const scoreWidget = amtagScore.CreateScoreWidget(tag);
//         amtagScoreButton.insertAdjacentHTML('beforeend', scoreWidget);
//       });
//     });
//   }
// };

export const amtagMore = {
  render: (data) => {
    const tags = data.tags || [];
    const tagsPerLine = 3; // Assuming 3 tags fit in one line
    const visibleTags = tags.slice(0, data.limit * tagsPerLine);
    const hiddenTagsCount = tags.length - visibleTags.length;
    const scoreResult = getStatsScore(parseInt(data.score));

    return `
  
              ${
                hiddenTagsCount > 0
                  ? `
                <button class="tag button-more">
                  ${glyph.glyphSymbolPlus}
                  <span class="text02" id="count">
                    ${hiddenTagsCount}
                  </span>
                  <span class="text02">
                    more
                  </span>
                </button>
              `
                  : ""
              }
    
    
            }
            `;
  }
};

// export const amtagStatus = {
//   render: (data) => {
//     const icon = glyph.glyphDetailPrice;
//     const status = data.status;
//     return `
//       <button class="amtag tag">
//         <span class="label">Now: ${status}</span>
//       </button>
//     `;
//   }
// };

export const amtagGallery = {
  render: (data) => {
    if (!data?.gallery?.length) return '';
    
    return `
      <button class="amtag tag" data-gallery-count="${data.gallery.length}">
        // <div class="single-icon">
        //   ${glyph.glyphGallery}
        // </div>
        <div class="label">
          <span class="text02">${data.gallery.length} Photos</span>
        </div>
      </button>
    `;
  }
};
