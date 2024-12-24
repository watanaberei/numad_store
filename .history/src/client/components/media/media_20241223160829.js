import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';
import * as Pictogram from '../icon/pictogram.js';
import * as Tag from '../tags/tag.js';
import * as geotag from  '../tags/geotag.js';
import * as objtag from '../tags/objtag.js';
import * as amtag from '../tags/amtag.js';
import * as attrtag from '../tags/attrtag.js';
import { getStatsScore } from '../function.js';


export const mediaImg = {
  render: (data) => {
    // element to render a single image
    const source = data.source;
    return `
      <div class="media-img-S media container">
        <img src="${source}" class="image">
      </div>
    `;
  }
};

export const mediaVideo = {
  render: (data) => {
    // element to render a single image
    const source = data.source;
    return `
      <div class="media-img-S media container">
        <img src="${source}" class="image">
      </div>
    `;
  }
};

export const mediaThumbnail = {
  render: (data) => {
    // element to render a single thumbnail
    const source = data.source;
    return `
      <div class="media-img-S media container">
        <img src="${source}" class="image">
      </div>
    `;
  }
};

export const mediaGallery = {
  render: (data) => {
    console.log('Rendering media gallery:', data);
    return `
      <div class="media-gallery-container" style="background-image: url(${data.source})">
        <div class="media-overlay">
          ${data.source?.logo ? `
            <div class="source-badge">
              <img src="${data.source.logo}" alt="${data.source.name}" class="source-logo">
            </div>
          ` : ''}
          ${data.description ? `
            <div class="media-description">
              <span class="text02">${data.description}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
};
