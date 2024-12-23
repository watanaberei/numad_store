import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';
import { getStatsScore } from '../components/functionScore.js';


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
        <button class="attrtag">
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
  




export const attrtagScore = {
  render: (data) => {
    console.log('attrtagScore render called with:', data);

    const tags = data.tags || [];
    return `
      ${tags.map(tag => {
        const tagScoreResult = getStatsScore(tag.score);
        console.log('Tag score result:', tagScoreResult);
        
        return `
          <button class="attrtag" id="attrtag" data-name="value" data-score="${tag.score}">
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