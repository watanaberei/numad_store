import * as glyph from '../icon/glyph.js';

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
      const costEstimate = data.costEstimate;
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