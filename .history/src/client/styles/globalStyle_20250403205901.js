// style.js

export const globalStyle = `
:root {


    
  --ink-primary-02: #212322;
  --ink-primary-03: #27272a;
  --ink-primary-04: #212322;
  --ink-shade-03: #f2f4f5;
  --ink-shade-05: #e5ebee;
  --ink-grey-grey: #a0a0a0;
  --utility-action: #5B51EC;
  --utility-linkvisited: #423ABA;
  --utility-red: #ff4747;
  --utility-tag: #9747ff;
  --bg-white-00: #ffffff;
  --bg-white-03: #fbfbff;
  --bg-white-06: #F2F4F5;
  --bg-black-03: #212322;




  /* SPACERS */
  /* s = spacers */
  --s01: 1.5px;
  --s02: 3px;
  --s03: 4.5px;
  --s04: 6px;
  --s05: 9px;
  --s06: 12px;
  --s07: 15px;

  /* GAP SPACERS */
  /* g = gap */
  --g01: 1.5px;
  --g01: 3px;
  --g01: 6px;
  --g01: 9px;
  --gap-s06: 12px;
  --gap-s07: 15px;

  /* PADDING SPACERS */
  /* p = padding */
  --p01: 1.5px;
  --p01: 3px;
  --p01: 6px;
  --p01: 9px;
  --pap-s06: 12px;
  --pap-s07: 15px;


  



  --numad-label-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-label-font-size: 12px;
  --numad-label-font-weight: 400;
  --numad-label-font-style: medium;
  --numad-label-line-height: 18px;
  --numad-label-letter-spacing: 0.03pt;
  --numad-text01r-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text01r-font-size: 10px;
  --numad-text01r-font-weight: 500;
  --numad-text01r-font-globalStyle: normal;
  --numad-text01r-line-height: normal;
  --numad-text01r-letter-spacing: 0.06pt;
  --numad-text01m-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text01m-font-size: 10px;
  --numad-text01m-font-weight: 700;
  --numad-text01m-font-style: normal;
  --numad-text01m-line-height: normal;
  --numad-text01m-letter-spacing: 0.06pt;
  --numad-text01b-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text01b-font-size: 10px;
  --numad-text01b-font-weight: 400;
  --numad-text01b-font-style: normal;
  --numad-text01b-line-height: normal;
  --numad-text01b-letter-spacing: 0.06pt;
  --numad-text02r-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text02r-font-size: 12px;
  --numad-text02r-font-weight: 400;
  --numad-text02r-font-style: normal;
  --numad-text02r-line-height: 18px;
  --numad-text02r-letter-spacing: 0.03pt;
  --numad-text02m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text02m-font-size: 12px;
  --numad-text02m-font-weight: 500;
  --numad-text02m-font-style: normal;
  --numad-text02m-line-height: 18px;
  --numad-text02m-letter-spacing: 0.03em;
  --numad-text02b-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text02b-font-size: 12px;
  --numad-text02b-font-weight: 700;
  --numad-text02b-font-style: normal;
  --numad-text02b-line-height: 18px;
  --numad-text02b-letter-spacing: 0.03pt;
  --numad-text03r-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text03r-font-size: 15px;
  --numad-text03r-font-weight: 400;
  --numad-text03r-font-style: normal;
  --numad-text03r-line-height: 26px;
  --numad-text03r-letter-spacing: -0.15pt;
  --numad-text03m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text03m-font-size: 15px;
  --numad-text03m-font-weight: 500;
  --numad-text03m-font-style: normal;
  --numad-text03m-line-height: 26px;
  --numad-text03m-letter-spacing: -0.15pt;
  --numad-text03b-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text03b-font-size: 15px;
  --numad-text03b-font-weight: 700;
  --numad-text03b-font-style: normal;
  --numad-text03b-line-height: 26px;
  --numad-text03b-letter-spacing: -0.15pt;
  --numad-text04r-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text04r-font-size: 20px;
  --numad-text04r-font-weight: 400;
  --numad-text04r-font-style: normal;
  --numad-text04r-line-height: 26px;
  --numad-text04r-letter-spacing: -0.18pt;
  --numad-text04m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text04m-font-size: 20px;
  --numad-text04m-font-weight: 500;
  --numad-text04m-font-style: normal;
  --numad-text04m-line-height: 27.5px;
  --numad-text04m-letter-spacing: -0.18pt;
  --numad-text04b-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text04b-font-size: 20px;
  --numad-text04b-font-weight: 700;
  --numad-text04b-font-style: normal;
  --numad-text04b-line-height: 30px;
  --numad-text04b-letter-spacing: -0.18pt;
  --numad-text05m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text05m-font-size: 45px;
  --numad-text05m-font-weight: 500;
  --numad-text05m-font-style: normal;
  --numad-text05m-line-height: 45px;
  --numad-text05m-letter-spacing: -0.27pt;
  --numad-text06m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text06m-font-size: 51px;
  --numad-text06m-font-weight: 500;
  --numad-text06m-font-style: normal;
  --numad-text06m-line-height: 57px;
  --numad-text06m-letter-spacing: -0.30pt;
  



  --spec-measurement-font-family: HelveticaNeue-Regular, sans-serif;
  --spec-measurement-font-size: 3px;
  --spec-measurement-line-height: 3px;
  --spec-measurement-font-weight: 400;
  --spec-measurement-font-style: normal;
  --blur01-backdrop-filter: blur(7.5px);
  --shadow-box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3),
    0px 6px 9px 0px rgba(0, 0, 0, 0.09);
  --display-box-shadow: 0px 4px 9px 0px rgba(0, 0, 0, 0.25);
  --shadowcards-box-shadow: 0px 3px 1px 0px rgba(0, 0, 0, 0.15),
    0px 1.5px 1.5px 0px rgba(0, 0, 0, 0.06),
    0.01px 1.06px 1.12px 0px rgba(163, 163, 163, 0.35);




  --aspect-ratio-2x2: 2/2;
  --aspect-ratio-3x2: 3/2;
  --aspect-ratio-4x2: 4/2;
  --aspect-ratio-5x2: 5/2;
  --aspect-ratio-6x2: 6/2;


  --r01: 3px;
  --r02: 9px;
  --r03: 15px;
  --r04: 30px;


  --numad-grid01-grid-template-columns: 1;
  --numad-grid01-gap: 15px;
  --numad-grid01-padding: 15px;
  --numad-grid02-grid-template-columns: 2;
  --numad-grid02-gap: 15px;
  --numad-grid02-padding: 15px;
  --numad-grid03-grid-template-columns: 3;
  --numad-grid03-gap: 15px;
  --numad-grid03-padding: 15px;
  --numad-grid04-grid-template-columns: 4;
  --numad-grid04-gap: 15px;
  --numad-grid05-grid-template-columns: 5;
  --numad-grid05-gap: 15px;
  --numad-grid10-grid-template-columns; 10;
  --numad-grid10-gap: 15px;
  --numad-grid10-padding: 15px;
  --numad-grid15-grid-template-columns: 15;
  --numad-grid15-gap: 15px;
  --numad-grid15-padding: 15px;
  --numad-grid20-grid-template-columns: 20;
  --numad-grid20-gap: 15px;
  --numad-grid20-padding: 15px;
}
`;

export const globalAlignment = `
.alignH-right {
    justify-self: self-end;
    align-self: self-end;
    place-item: self-end;
    gap: var(--s04);
    place-content: end;
}
.alignV-center {
  place-items: center;
}
stretch {
  display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
    width: 100%;
}
`;
 

export const globalControls = `
.controls {
    display: flex !important;
    flex-direction: row !important;
    gap; var(--s07) !important;
}
.actions {
    display: flex !important;
    flex-direction: row !important;
    gap: var(--s07) !important;
}
`;

export const globalArrays = `
.array {
    display: flex !important;
    flex-direction: row !important;
    height: 100%;
    width: 100%;
    align-items: baseline;
    align-self: center;
}
// .pair {
//     display: flex !important;
//     flex-direction: row !important;
//     gap: var(--s07) !important;
//     align-items: baseline;
//     align-self: center;
// }
.anchor {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.anchor .primary {
  
}
.anchor .secondary {
  
}
`;

export const globalDivider = `
.dividerV {
    border-left: 1px solid var(--ink-shade-05);
    height: 100%;
    margin-left: var(--s07);
    margin-right: var(--s07);
}

.dividerH {
}
`


  // Apply master styles to the document
const globalStyleElement = document.createElement('style');
globalStyleElement.textContent = globalStyle + globalControls + globalArrays + globalAlignment + globalDivider;
document.head.appendChild(globalStyleElement);

// const globalTypeElement = document.createElement(`style`);
// globalTypeElement.textContent = globalType;
// document.head.appendChild(globalTypeElement);

