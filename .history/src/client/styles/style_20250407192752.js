// style.js
import './amenitiesStyle.js';
import './arrayStyle.js';
import './buttonStyle.js';
import './cardStyle.js';
import './controlStyle.js';
import './datavisStyle.js';
import './dividerStyle.js';
import './footerStyle.js';
import './globalStyle.js';
import './glyphStyle.js';
import './gridStyle.js';
import './heroStyle.js';
import './headerStyle.js';
import './iconStyle.js';
import './mapStyle.js';
import './mediaStyle.js';
import './sectionStyle.js';
import './tagStyle.js';
import './textStyle.js';
import './tokenStyle.js';
import './typeStyle.js';
import './sidebarStyle.js';
import './mapStyle.js';
import './navStyle.js';
import './loaderStyle.js';
import './searchStyle.js';
import './fieldStyle.js';
import './accordionStyle.js';
import './panelStyle.js';
import './interactiveStyle.js';
// import * as globalStyle from './globalStyle.js';
// import * as tokenStyle from './tokenStyle.js';
// import * as footerStyle from './footerStyle.js';
// import * as heroStyle from './heroStyle.js';
// import * as gridStyle from './gridStyle.js';
// import * as glyphStyle from './glyphStyle.js';
// import * as iconStyle from './iconStyle.js';
// import * as amenitiesStyle from './amenitiesStyle.js';
// import * as tagStyle from './tagStyle.js';
// import * as cardStyle from './cardStyle.js';
// import * as typeStyle from './typeStyle.js';
// import * as textStyle from './textStyle.js';
// import * as sectionStyle from './sectionStyle.js';
// import * as divider from './dividerStyle.js';
// import * as button from './buttonStyle.js';
// import * as header from './headerStyle.js';
// import * as map from './mapStyle.js';
// import * as array from './arrayStyle.js';
// import * as control from './controlStyle.js';
// import * as media from './mediaStyle.js';
// import * as datavis from './datavisStyle.js';

const newLocal=`
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    left: 0;
    top: 0;
  }
  body > .main {
    // padding: 0px var(--s07) !important;
    /* margin-left: var(--s07) !important; 
    // margin-right: var(--s07) !important;
    // width: 100%;*/
    width:  100% !important;
    background-color: var(--bg-white-06);
    padding: 0px !important;
    margin: 0px !important;
    overflow: hidden !important;
  }
  .main.grid05 {
    padding: 0px !important;
    margin: 0px !important;
    overflow: hidden !important;
  }
  #container {
    background-color: var(--bg-white-06);
  }
  #section {
    background-color: var(--bg-white-00);
  }
  #store {
    background-color: 
  }
  .content {
    // padding: 0px var(--s07) !important;
    // margin-left: var(--s07) !important;
    // width: fit-content !important; 
    // margin-right: var(--s07) !important;
    // width: 100%;*/
    // overflow-x: hidden;
    // display: grid;
    // grid-template-columns: repeat(var(--numad-grid05-grid-template-columns), 1fr) !important;
    gap: var(--s07);
  }
  .content:has(.primary) {
    padding: 0px var(--s07) !important;
  }
  .primary {
    // width: fit-content !important; 
    // margin-right: var(--s07) !important;
    // width: 100%;*/
    overflow-x: hidden;
    // display: grid;
    // grid-template-columns: repeat(var(--numad-grid05-grid-template-columns), 1fr) !important;
    // gap: var(--s07);
  }
  .section {
    // margin-right: var(--s07) !important;
    width: 100%;*/
    overflow-x: hidden;
    display: grid;
    grid-template-columns: repeat(var(--numad-grid05-grid-template-columns), 1fr) !important;
    gap: var(--s07);
  }
  .primary.store {
    background-color: var(--ink-shade-03);
  }
  .content .primary{
  height: 100%;
    // padding: 0px 15px;
    // width: -webkit-fill-available;
    // width: fit-content !important;
    // flex-direction: row;
    // align-items: flex-start;
    // justify-content: space-between;
    // flex-shrink: 0;
    // position: relative;
}
.content .secondary.col01 {
    // padding: 0px 15px;
    width: -webkit-fill-available;
}

.vh100 {
  height: 100vh;
}

.vw100 {
  width: 100vw;
}
`;
export const style = newLocal;

// Apply master styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = style;
document.head.appendChild(styleElement);