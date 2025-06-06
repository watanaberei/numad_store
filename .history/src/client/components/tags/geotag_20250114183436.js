import * as glyph from '../icon/glyph.js';

export const geotagCountItem = {
  render: (data) => {
    const parenthesisL = glyph.glyphSymbolParenthesisL;
    const parenthesisR = glyph.glyphSymbolParenthesisR;
    const geotag = data.geotag;
    const count = data.count;
    return `
      <button id="geotag" class="tag word geotag tag-count">
        <span class="label">
          ${geotag}
          </span>
          <span class="count word"> 

            <span class="label ">${count}</span>

          
        </span>
      </button>
    `;
  }
}

// ${visibleTags.map(tag => {
//   const tagScoreResult = getStatsScore(tag.score);
//   return `
//     <button class="amtag" id="amtag" data-name="value" data-score="${tag.score}">
//       <div class="single-icon">
//         ${tagScoreResult.icons[tagScoreResult.currentScore]?.icon || ''}
//       </div>
//       <div class="score-icons">
//         ${tagScoreResult.icons.map((icon, index) => `
//           <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
//             ${icon.icon}
//           </span>
//         `).join('')}
//       </div>
//       <div class="label">
//         <span class="text02" id="text02">${tag.label}</span>
//       </div>
//     </button>    
//   `;
// }).join('')}

export const geotagScore= {
  render: (data) => {
    console.log('geotagAttributeItem render called with:', data);

    const tags = data.tags || [];
    return `
      ${tags.map(tag => {
        const tagScoreResult = getStatsScore(tag.score);
        console.log('Tag score result:', tagScoreResult);
        
        return `
          <button class="geotag tag" id="geotag" data-name="value" data-score="${tag.score}">
            <div class="single-icon">
              ${tagScoreResult.icons[tagScoreResult.currentScore]?.icon || ''}
            </div>
            <div class="score-icons">
              ${tagScoreResult.icons.map((icon, index) => `
                <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
                  ${icon.icon}
                </span>
              `).join('')}
            </div>
            <div class="label">
              <span class="text02">${tag.label}</span>
            </div>
          </button>
        `;
      }).join('')}
    `;
  }
};


export const geotagRating = {
    render: (data) => {
      const icon = glyph.glyphDetailStar;
      const rating = data.rating;
      return `
        <button class="geotag tag">
            ${icon}  
            <span class="label">${rating}</span>
        </button>
      `;
    }
  };


  export const geotagCostEstimate = {
    render: (data) => {
      const icon = glyph.glyphDetailPrice;
      const costEstimate = data;
      return `
        <button class="geotag tag">
          ${icon}  
          <span class="label">${costEstimate}</span>
        </button>
      `;
    }
  };


  export const geotagStatus = {
    render: (data) => {
      const icon = glyph.glyphDetailPrice;
      const status = data.status;
      return `
        <button class="geotag tag">
          <span class="label">Now: ${status}</span>
        </button>
      `;
    }
  };