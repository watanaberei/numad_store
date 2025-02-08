import * as glyph from '../icon/glyph.js';

export const geotagCountItem = {
  render: (data) => {
    const parenthesisL = glyph.glyphSymbolParenthesisL;
    const parenthesisR = glyph.glyphSymbolParenthesisR;
    const geotag = data.geotag;
    const count = data.count;
    return `
      <button id="geotag" class="tag word geotag tag-count">
        <span class="text02">
          ${geotag}
          </span>
          <span class="count word"> 

            <span class="text02 ">${count}</span>

          
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
//       <div class="text02">
//         <span class="text02" id="text02">${tag.text02}</span>
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
          <button class="geotag word tag" id="geotag" data-name="value" data-score="${tag.score}">
            <div class="single-icon">
              ${tagScoreResult.icons[tagScoreResult.currentScore]?.icon || ''}
            </div>
            <div class="score-icons">
              ${tagScoreResult.icons.map((icon, index) => `
                <span class="score-icon ${index === tagScoreResult.currentScore ? 'active' : ''}" data-score="${index}" title="${icon.tooltip}">
                  <i class="icon">
                    ${icon.icon}
                  </i>
                </span>
              `).join('')}
            </div>
            <div class="text02">
              <span class="text02">${tag.text02}</span>
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
    const review = data.review;
    return `
      <button class="geotag word tag">
          <i class="icon">${icon}</i>
          <span class="text02">${rating}</span>
          <span class="text02">(${review})</span>
      </button>
    `;
  }
};

export const geotagType = {
  render: (data) => {

    const type = data.type;
    return `
      <button class="geotag tag word">
          <span class="text02">${type}</span>
      </button>
    `;
  }
};

  export const geotagStore = {
    render: (data) => {
      const title = data.title;
      const storeRange = data.storeRange;
      return `
        <button class="geotag grid02 tag">
          <span class="left primary text02 col01">${title}</span>
          <span class="right secondary text02 col01 word">
            <i class="glyph02 glyph-location-pin">
              ${glyph.glyphMapPin}
            </i>
            ${storeRange}mi
          </span>
        </button>
      `;
    }
  };


  export const geotagCostEstimate = {
    render: (data) => {
      const icon = glyph.glyphDetailPrice;
      const costEstimate = data.costEstimate;
      return `
        <button class="geotag tag">
          <i class="icon">
            ${icon}  
          </i>
          <span class="text02">${costEstimate}</span>
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
          <span class="text02">Now: ${status}</span>
        </button>
      `;
    }
  };