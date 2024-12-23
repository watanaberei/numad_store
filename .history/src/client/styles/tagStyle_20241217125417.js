// tagStyle.js
export const tagArray = `
.tag .tag-line {
  display: table !important;
  gap: var(--spacer-gap-s05);
  width: max-content;
}
.tag{
    grid-template-columns: 1fr 18px;
    position: relative;
    transition: background-color 0.3s ease;
    cursor: pointer;
    display: inline-table !important;
    align-items: center;
    background-color: var(--ink-shade-03);
    border: 1px solid var(--ink-shade-05);
    border-radius: 3px;
    padding: 3px;
    margin-right: var(--s04);
    height: fit-content;
    padding: 0 var(--s04);
    width: fit-content;
}
.tag .label, .tag i.glyph, .tag i.icon {
  display: inline-block;
}
.tag .tag-array {
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
.tag.tag-array {
  // display: flex;
  // flex-wrap: wrap;
  // row-gap: var(--spacer-gap-s06);
  display: table !important;
  gap: var(--spacer-gap-s05);
}
`;

// Apply hero styles to the document
const tagsArrayElement = document.createElement("style");
tagsArrayElement.textContent = tagArray;
document.head.appendChild(tagsArrayElement);

export const tagStyle = `
.tag {
  display: inline-table !important;
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
.pill,
.pill .amtag.tag,
.pill .geotag.tag,
.pill .attrtag.tag,
.pill .objtag.tag,
.pill .tag,  {
    display: inline-table !important;
 }
    .pill,
.pill .amtag.tag,
.pill .geotag.tag,
.pill .attrtag.tag,
.pill .objtag.tag,
.pill .tag,  {
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
.pill,
.pill .amtag.tag,
.pill .geotag.tag,
.pill .attrtag.tag,
.pill .objtag.tag,
.pill .tag,  {
    background: var(--ink-primary-06);
    border-radius: var(--s07);
    // padding: var(--s04) var(--s07);
    display: inline-flex;
    align-items: center;
    gap: var(--s04);
 }
.pill,
.pill .amtag.tag,
.pill .geotag.tag,
.pill .attrtag.tag,
.pill .objtag.tag,
.pill .tag,  {
    background: var(--ink-primary-06);
    border-radius: var(--spacer-gap-s07);
    // padding: var(--spacer-gap-s01) var(--spacer-gap-s04);
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s05);
 }
.pill,
.pill .amtag.tag .card-item,
.pill .geotag.tag .card-item,
.pill .attrtag.tag .card-item,
.pill .objtag.tag .card-item,
.pill .tag .card-item {
    background: var(--ink-primary-06);
    border-radius: var(--s07);
    // padding: var(--s04) var(--s07);
    display: flex;
    align-items: center;
    gap: var(--s04);
 }
.pill,
.pill .amtag.tag,
.pill .geotag.tag,
.pill .attrtag.tag,
.pill .objtag.tag,
.pill .tag, -text {
    color: var(--bg-white-00);
    font-family: var(--numad-text02m-font-family);
    font-size: var(--numad-text02m-font-size);
    line-height: var(--numad-text02m-line-height);
    font-weight: var(--numad-text02m-font-weight);
  }
  .badge {
    background: var(--ink-shade-03);
    border-radius: 15px;
    // padding: var(--spacer-gap-s01) var(--spacer-gap-s04);
    width: 21px;
    height: 21px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    // justify-content: space-between;
    flex-shrink: 0;
    // width: 251.25px;
    // height: 24.75px;
    position: relative;
 }
.pill,
.pill .amtag.tag,
.pill .geotag.tag,
.pill .attrtag.tag,
.pill .objtag.tag,
.pill .tag,   {
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
  .tag .count {
    display: flex;
    flex-direction: row;
  }`;

export const labelStyle = `
.pill .tag,  .label, .tag .label {
  color: var(--utility-functional-action);
  display: flex !important;
  flex-direfction: row !important; 
  gap: var(--spacer-gap-s01);
}`;
// Apply hero styles to the document
const tagStyleElement = document.createElement("style");
tagStyleElement.textContent = tagStyle + countStyle + labelStyle;
document.head.appendChild(tagStyleElement);

export const geoTag = `
.tag.geotag {
    display: inline-table !important;
    background: var(--ink-primary-black-03);
    align-items: center;
    background: var(--ink-shade-03);
    border: 1px solid var(--ink-shade-05);
    border-radius: 3px;
    color: var(--utility-functional-action);
    padding: 3px;
    margin-right: var(--s04);
}
.tag.geotag > .label {
  display: inline-table !important;
  color: var(--utility-functional-linkvisited);
}
.tag.geotag > .glyph {
  // display: inline-table !important;
  // display: flex;
  // height: 9px;
  place-items: center;
}`;

// Apply hero styles to the document
const geoTagElement = document.createElement("style");
geoTagElement.textContent = geoTag;
document.head.appendChild(geoTagElement);

export const attrTag = `

.tag.attrtag {
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
.tag.attrtag svg {
  // margin-right: 3px;
}
.tag.attrtag button {
  background: none;
  border: none;
  color: var(--utility-functional-linkvisited);
  font-weight: 500;
  cursor: pointer;
}`;

// Apply hero styles to the document
const attrTagStyle = document.createElement("style");
attrTagStyle.textContent = attrTag;
document.head.appendChild(attrTagStyle);

export const amtag = `
.tag.amtag {
  // display: inline-table !important;
  // grid-template-columns: 1fr 18px;
  // display: inline-table !important;
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
.tag.amtag {
  display: inline-table !important;
  grid-template-columns: 1fr 18px;
  position: relative;
  transition: background-color 0.3s ease;
  cursor: pointer;
  display: inline-table !important;
  align-items: center;
  background-color: var(--ink-shade-03);
  border: 1px solid var(--ink-shade-05);
  border-radius: 3px;
  padding: 3px;
  margin-right: var(--s04);
}
.tag.amtag-category,
.badge,
.tag .value.pill {
  cursor: pointer;
  z-index: 3;
  position: relative;
}
/* Hover states */
.amtag-category:hover,
.badge:hover,
.value.pill:hover {
  opacity: 1;
}
.tag .label {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.tag.amtag {
  display: inline-table !important;
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
.tag.amtag .action {
  padding: 0px 0px 0px var(--spacer-gap-s05, 9px);
display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.tag.amtag .score-icons {
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
.tag.amtag .icon {
  display: inline-table;
  height: 18px !important;
  width: 18px !important;
}
.tag.amtag .icon .glyph{
  place-content: center;
  padding: initial;
  height: inherit;
}
.amtag.tag:hover .score-icons {
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
.tag.amtag .single-icon {
  display: inline-block;
}
.tag.amtag:hovered .single-icon {
  visibility: visible;
}
.tag.amtag .rank {
  color: var(--ink-primary-06, #101011);
  border-radius: var(--spacer-gap-s07, 15px);
  display: inline-block;
  flex-direction: row;
  gap: var(--spacer-gap-s01, 1.5px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.tag.amtag.hovered .score-icons {
  display: flex;
}
.tag.amtag .score-icon {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
.tag.amtag .score-icon:hover,
.tag.amtag .score-icon.active {
  opacity: 1;
  display: block !important;
}
.tag.amtag .score-icons {
  display: none;
}
.tag.amtag.overlay-source {
  align-self: flex-end;
  background: rgba(0,0,0,0.7);
  color: var(--color-white);
}
.tag.amtag.footnote {
  // font-size: var(--text-xs);
  opacity: 1;
  display: grid !important;
  grid-template-columns: 1fr 18px;
  max-width: 100%;
}
.tag.amtag.footnote .label {
  width: 100%;
  grid-column: span 1;
  display: grid !important;
}
.tag.amtag .footnote .icon {
  display: inline-table !important;
}
.tag.amtag.footnote:hover {
  opacity: 1;
}
.tag.amtag.show {
  display: flex;
}
.tag.amtag.hide {
  display: none;
}
.tag .source-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.tag.amtag .label {
  display: inline-table !important;
  color: var(--utility-functional-linkvisited);
  // margin-left: 8px;
}
.tag.amtag svg {
  margin-right: 3px;
  display: inline-block !important;
}
.tag.amtag button {
  background: none;
  border: none;
  color: var(--utility-functional-linkvisited);
  font-weight: 500;
  cursor: pointer;
}
.tag.amtag.selected {
  background-color: var(--utility-functional-action);
  color: var(--bg-white-03);
}
`;

export const amtagInteraction = `

/* Add to amtag styles */
.tag.amtag.overlay-source,
.tag.amtag.overlay-source .label {
  color: var(--color-white);
}
.tag.amtag.overlay-source:hover {
  background: var(--bg-black-80);
}
.tag.amtag:hover {
  display: inline-block !important;
  background-color: var(--ink-shade-04);
}
.tag.amtag:hovered .score-icons {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.tag.amtag.selected {
  background-color: var(--utility-functional-action);
  color: var(--bg-white-03);
}
.tag.amtag.selected .score-icon {
  display: none;
}
.tag.amtag.selected .score-icon.active {
  display: inline-block !important;
}

/* Resting state */
.tag.amtag.selected {
  background-color: var(--ink-shade-03);
}
/* Hovered state */
.tag.amtag:hovered:not(.selected) {
  background-color: var(--ink-shade-04);
}
/* Selected state */
.tag.amtag.selected {
  background-color: var(--utility-functional-action);
  color: var(--bg-white-03);
}
/* Picked state (assuming it's a selected state that persists) */
.tag.amtag.selected:not(.hovered) {
  background-color: var(--utility-functional-action);
}
.tag.amtag::after {
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
.tag.amtag:hover::after {
  opacity: 1;
}
/* Resting state */
.tag.amtag:not(.hovered):not(.selected) {
  background-color: var(--ink-shade-03);
}
/* Hovered state */
.tag.amtag.hovered:not(.selected) {
  background-color: var(--ink-shade-04);
}
/* Selected state */
.tag.amtag.selected {
  background-color: var(--utility-functional-action);
}
/* Picked state (assuming it's a selected state that persists) */
.tag.amtag.selected:not(.hovered) {
  background-color: var(--utility-functional-action);
}`;
// Apply hero styles to the document
const amtagStyle = document.createElement("style");
amtagStyle.textContent = amtag + amtagInteraction;
document.head.appendChild(amtagStyle);

export const objTag = `

.tag.objtag {
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
  .tag .label {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
  .tag.objtag .label {
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
const ammenTagStyle = document.createElement("style");
ammenTagStyle.textContent = objTag;
document.head.appendChild(ammenTagStyle);
