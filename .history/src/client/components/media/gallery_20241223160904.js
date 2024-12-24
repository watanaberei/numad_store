import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';
import * as Pictogram from '../icon/pictogram.js';
import * as Tag from '../tags/tag.js';
import * as geotag from  '../tags/geotag.js';
import * as objtag from '../tags/objtag.js';
import * as amtag from '../tags/amtag.js';
import * as attrtag from '../tags/attrtag.js';
import { getStatsScore } from '../function.js';


export const galleryHero = {
  render: (data) => {
    return `
      
        
        <div class="hero-gallery00 grid05-overflow">
          <div class="gallery-image col03" style="background-image: url(${data.galleryImages[0]});"></div>
          <div class="gallery-image col02" style="background-image: url(${data.galleryImages[1]});"></div>
          <div class="gallery-image col03" style="background-image: url(${data.galleryImages[0]});"></div>
          <div class="gallery-image col02" style="background-image: url(${data.galleryImages[1]});"></div>
        </div>

    `;
  }
};
