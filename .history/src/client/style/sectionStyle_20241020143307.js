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
.section {
  background: #ffffff;
  border-radius: var(--spacer-gap-s06, 12px);
  // padding: 0px var(--spacer-gap-s07, 15px) 0px var(--spacer-gap-s07, 15px);
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
  .store > .section {
    
  }
  .store > .section .header {
    padding: var(--spacer-gap-s07, 15px);
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store > .section .content {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-gap-s00, 0px);
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store > .section .footer {
  }
`;

// Apply master styles to the document
const sectionStyle = document.createElement('style');
sectionStyle.textContent = section;
document.head.appendChild(sectionStyle);