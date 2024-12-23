// tagStyle.js
export const tagArray = `
.tag-array {
  // display: flex;
  // flex-direction: column;
  // gap: 3px;
  // align-items: flex-start;
  // justify-content: flex-end;
  // align-self: stretch;
  // flex-shrink: 0;
  // height: 45px;
  // max-height: 45px;
  // position: relative;
  // display: flex;
  // flex-wrap: wrap;
  // height: fit-content;
  // row-gap: var(--spacer-gap-s06) !important;
  // column-gap: var(--spacer-gap-s05) !important;
}
.tag-array {
  // display: flex;
  // flex-wrap: wrap;
  // row-gap: var(--spacer-gap-s06);
  display: table !important;
  gap: var(--spacer-gap-s05);
}

`;

// Apply hero styles to the document
const tagsArrayElement = document.createElement('style');
tagsArrayElement.textContent = tagArray;
document.head.appendChild(tagsArrayElement);




export const tagStyle = `
.tag {
    color: var(--neumad06-ink-primary-01);
    display: flex;
    flex-direction: row !important;
    /* align-items: center; */
    background: var(--ink-primary-03);
    border-radius: 15px;
    height: fit-content;
    padding: 0 var(--s04);
    width: fit-content;
  }
  .pill {
    display: inline-table !important;
  }
  .pill {
    position: relative;
    // display: flex;
    max-height: 21px !important;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    place-items: center;
    // background: var(--ink-primary-black-03);
    color: var(--ink-primary-white-03);
    border-radius: 12px;
    gap: var(--spacer-gap-s01, 1.5px);
    width: fit-content;
  }

  .tag .content, .pill .content {
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .tag .content .primary, .pill .content .primary {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
    width: 251.25px;
    height: 24.75px;
    position: relative;
  }
  .pill {
    background: var(--ink-primary-06, #101011);
    // border-radius: var(--spacer-gap-s07, 15px);
    // padding: var(--spacer-gap-s04, 6px);
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s04, 6px);
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  `;




export const countStyle = `
  .count {
    display: flex;
    flex-direction: row;
  }
`;


export const labelStyle = `
.pill .label, .tag .label {
  color: var(--utility-functional-action);
  display: flex !important;
  flex-direfction: row !important; 
  gap: var(--spacer-gap-s01);
}
`;
// Apply hero styles to the document
const tagStyleElement = document.createElement('style');
tagStyleElement.textContent =tagStyle + countStyle + labelStyle;
document.head.appendChild(tagStyleElement);



export const geoTag = `
.geotag {
  display: table !important;
  background: var(--ink-primary-black-03);
  color: var(--ink-primary-white-03);
  border-radius: 12px;
  // padding: var(--spacer-gap-s05, 9px) var(--spacer-gap-s06, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s01, 1.5px);
  align-items: center;
  justify-content: flex-start;
  position: relative;
}
.geotag .label {
  display: inline-table !important;
  display: flex;
  // height: 9px;
  place-items: center;
}
`;

// Apply hero styles to the document
const geoTagElement = document.createElement('style');
geoTagElement.textContent = geoTag;
document.head.appendChild(geoTagElement);







export const attrTag = `

.attrtag {
  display: inline-table !important;
  display: flex;
  align-items: center;
  background: var(--ink-shade-03);
  border: 1px solid var(--ink-shade-05);
  border-radius: 3px;
  color: var(--utility-functional-action);
  padding: 3px;
  margin-right: var(--s04);
}

.attrtag svg {
  // margin-right: 3px;
}

.attrtag button {
  background: none;
  border: none;
  color: var(--utility-functional-linkvisited);
  font-weight: 500;
  cursor: pointer;
}
`;


// Apply hero styles to the document
const attrTagStyle = document.createElement('style');
attrTagStyle.textContent = attrTag;
document.head.appendChild(attrTagStyle);





export const amTag = `
.amtag {
  display: inline-table !important;
  // border-radius: var(--spacer-gap-s06, 12px);
  // border-style: solid;
  // border-color: var(--utility-functional-action, #3a3aff);
  // border-width: 1px;
  // padding: var(--spacer-gap-s05, 9px) var(--spacer-gap-s06, 12px)
  //   var(--spacer-gap-s05, 9px) var(--spacer-gap-s06, 12px);
  // display: flex;
  // flex-direction: row;
  // gap: var(--spacer-gap-s00, 0px);
  // align-items: flex-start;
  // justify-content: flex-start;
  // flex-shrink: 0;
  // position: relative;
  // overflow: hidden;
}
.label {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.am-tag {
  color: var(--utility-functional-action, #3a3aff);
  text-align: justified;
  font-family: var(
    --numad-text02m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text02m-font-size, 12px);
  line-height: var(--numad-text02m-line-height, 18px);
  letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
  font-weight: var(--numad-text02m-font-weight, 500);
  position: relative;
  display: flex;
  align-items: center;
}
.amtag .action {
  padding: 0px 0px 0px var(--spacer-gap-s05, 9px);
display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}

.amtag {
  position: relative;
  transition: background-color 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: var(--ink-shade-03);
  border: 1px solid var(--ink-shade-05);
  border-radius: 3px;
  padding: 3px;
  margin-right: var(--s04);
}


.amtag .score-icons {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: center;
  background-color: inherit;
}


.amtag:hover .score-icons {
  display: flex !important;
  position: absolute;
  left: 0;
  top: -29px;
  background-color: orange !important;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: center;
  background-color: inherit;
}


.amtag .single-icon {
  display: inline-block;
}

.amtag:hovered .single-icon {
  visibility: visible;
}




.amtag.hovered .score-icons {
  display: flex;
}

.amtag .score-icon {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.amtag .score-icon:hover,
.amtag .score-icon.active {
  opacity: 1;
  display: block !important;
}

.amta .score-icons {
  display: none;
}





.amtag:hover {
  display: inline-block !important;
  background-color: var(--ink-shade-04);
}

.amtag:hovered .score-icons {
  display: flex;
  justify-content: space-around;
  align-items: center;
}




.amtag.selected {
  background-color: var(--utility-functional-action);
  color: var(--bg-white-03);
}

.amtag.selected .score-icon {
  display: none;
}

.amtag.selected .score-icon.active {
  display: inline-block !important;
}


/* Resting state */
.amtag.selected {
  background-color: var(--ink-shade-03);
}

/* Hovered state */
.amtag:hovered:not(.selected) {
  background-color: var(--ink-shade-04);
}

/* Selected state */
.amtag.selected {
  background-color: var(--utility-functional-action);
  color: var(--bg-white-03);
}

/* Picked state (assuming it's a selected state that persists) */
.amtag.selected:not(.hovered) {
  background-color: var(--utility-functional-action);
}


.amtag .label {
  color: var(--utility-functional-linkvisited);
  // margin-left: 8px;
}

.amtag svg {
  margin-right: 3px;
}

.amtag button {
  background: none;
  border: none;
  color: var(--utility-functional-linkvisited);
  font-weight: 500;
  cursor: pointer;
}

.amtag.selected {
  background-color: var(--utility-functional-action);
  color: var(--bg-white-03);
}

.amtag::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--ink-primary-03);
  color: var(--bg-white-03);
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.amtag:hover::after {
  opacity: 1;
}



/* Resting state */
.amtag:not(.hovered):not(.selected) {
  background-color: var(--ink-shade-03);
}

/* Hovered state */
.amtag.hovered:not(.selected) {
  background-color: var(--ink-shade-04);
}

/* Selected state */
.amtag.selected {
  background-color: var(--utility-functional-action);
}

/* Picked state (assuming it's a selected state that persists) */
.amtag.selected:not(.hovered) {
  background-color: var(--utility-functional-action);
}
`;

// Apply hero styles to the document
const amTagStyle = document.createElement('style');
amTagStyle.textContent = amTag;
document.head.appendChild(amTagStyle);







export const objTag = `

.objtag {
  display: inline-table !important;
  background: var(--utility-functional-action, #3a3aff);
  border-radius: var(--spacer-gap-s06, 12px);
  border-style: solid;
  border-color: var(--utility-functional-action, #3a3aff);
  border-width: 1px;
  // padding: var(--spacer-gap-s05, 9px) var(--spacer-gap-s06, 12px)
  //   var(--spacer-gap-s05, 9px) var(--spacer-gap-s06, 12px);
  display: flex;
  // flex-direction: row;
  // gap: var(--spacer-gap-s00, 0px);
  // align-items: flex-start;
  // justify-content: flex-start;
  // flex-shrink: 0;
  // position: relative;
  // overflow: hidden;
}
.label {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.objtag .label {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: justified;
  font-family: var(
    --numad-text02m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text02m-font-size, 12px);
  line-height: var(--numad-text02m-line-height, 18px);
  letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
  font-weight: var(--numad-text02m-font-weight, 500);
  position: relative;
  display: flex;
  align-items: center;
}

`;

// Apply hero styles to the document
const ammenTagStyle = document.createElement('style');
ammenTagStyle.textContent = objTag;
document.head.appendChild(ammenTagStyle);



