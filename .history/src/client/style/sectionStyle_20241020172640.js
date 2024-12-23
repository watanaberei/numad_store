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
.section > div#header {
    padding: var(--spacer-gap-s07, 15px);
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
.section > .content {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-gap-s00, 0px);
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store > .section > .content > div#summary {
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s06, 12px);
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }

  .store > .section > .content > div#body {
    background: var(--bg-white-03, #fbfbff);
    border-radius: var(--spacer-gap-s07, 15px);
    border-style: solid;
    border-color: var(--ink-shade-04, #eef1f3);
    border-width: 1px;
    padding: var(--spacer-gap-s08, 21px) var(--spacer-gap-s07, 15px)
      var(--spacer-gap-s07, 15px) var(--spacer-gap-s07, 15px);
    display: flex;
    flex-direction: column;
    gap: var(--spacer-gap-s08, 21px);
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    width: 1095px;
    height: 171px;
    position: relative;
  }
  .store > .section > .footer {
    padding: var(--spacer-gap-s09, 30px) var(--spacer-gap-s07, 15px)
    var(--spacer-gap-s09, 30px) var(--spacer-gap-s07, 15px);
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s09, 30px);
    align-items: flex-start;
    justify-content: flex-end;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
`;

// Apply master styles to the document
const sectionStyle = document.createElement('style');
sectionStyle.textContent = section;
document.head.appendChild(sectionStyle);