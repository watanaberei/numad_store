import * as glyph from '../components/icon/glyph.js';

export const objtagRating = {
    render: (data) => {
      const icon = glyph.glyphDetailStar;
      const rating = data.rating;
      return `
        <button class="objtag tag">
            ${icon}  
            <span class="label">${rating}</span>
        </button>
      `;
    }
  };


  export const objtagCostEstimate = {
    render: (data) => {
      const icon = glyph.glyphDetailPrice;
      const costEstimate = data.costEstimate;
      return `
        <button class="objtag tag">
          ${icon}  
          <span class="label">${costEstimate}</span>
        </button>
      `;
    }
  };


  export const objtagStatus = {
    render: (data) => {
      const icon = glyph.glyphDetailPrice;
      const status = data.status;
      return `
        <button class="objtag tag">
          <span class="label">Now: ${status}</span>
        </button>
      `;
    }
  };