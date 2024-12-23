// style.js
import * as globalStyle from './globalStyle.js';
import * as tokenStyle from './tokenStyle.js';
import * as footerStyle from './footerStyle.js';
import * as heroStyle from './heroStyle.js';
import * as gridStyle from './gridStyle.js';
import * as glyphStyle from './glyphStyle.js';
import * as iconStyle from './iconStyle.js';
import * as amenitiesStyle from './amenitiesStyle.js';
import * as tagStyle from './tagStyle.js';
import * as cardStyle from './cardStyle.js';
import * as typeStyle from './typeStyle.js';
import * as textStyle from './textStyle.js';
import * as button from './buttonStyle.js';
import * as header from './headerStyle.js';
import * as map from './mapStyle.js';


export const section = `
  body {
    margin: 0;
    padding: 0;
    width: 100vw;
    left: 0;
    top: 0;
  }
  .main {
    padding: 0px var(--s07) !important;
    /* margin-left: var(--s07) !important; 
    margin-right: var(--s07) !important;
    width: 100%;*/
    overflow-x: hidden;
    display: grid;
    grid-template-columns: repeat(var(--numad-grid05-grid-template-columns), 1fr) !important;
    gap: var(--s07);
  }
  .main.store {
    background-color: var(--ink-shade-03);
  }
`;

// Apply master styles to the document
const sectionStyle = document.createElement('style');
sectionStyle.textContent = section;
document.head.appendChild(sectionStyle);