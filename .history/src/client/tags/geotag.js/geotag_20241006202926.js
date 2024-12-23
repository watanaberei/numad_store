import * as glyph from '../glyphs.js';

export const geotagRating = {
    render: (data) => {
      const icon = glyph.glyphDetailStar;
      const price = glyph.glyphDetailPrice;
return `
        <button class="geotag tag">
            ${star}  
            <span class="label">${data.rating}</span>
        </button>
      `;
    }
  };