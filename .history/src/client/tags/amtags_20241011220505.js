import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';

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


  export const amtagCategory = {
    render: (data) => {
      const category = data.category;
      return `
        <button class="amtag tag">
          <div class="amtag">
            <div class="label">
              <span class="label">${category}</span>
            </div>
            <div class="icon">
              ${glyph.glyphActionArrow} 
            </div>
          </div>
          <span class="label">${category}</span>
        </button>
      `;
    }
  };


  export const amtagStatus = {
    render: (data) => {
      const icon = glyph.glyphDetailPrice;
      const status = data.status;
      return `
        <button class="amtag tag">
          <span class="label">Now: ${status}</span>
        </button>
      `;
    }
  };