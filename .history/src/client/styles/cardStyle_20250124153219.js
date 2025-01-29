export const cardCategory = `
.card-item {
  position: relative;
  cursor: default;
  aspect-ratio: 1/1;
    
}

.click-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 2;
  cursor: pointer;
}

.click-zone.left {
  left: 0;
}

.click-zone.right {
  right: 0;
}

.card-item .card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  grid-template-rows: auto 1fr auto;
  transition: opacity 0.3s ease-in-out;
  background-size: cover;
  background-position: center;
}
.card-content {
  z-index: 1 !important;
}

.card-item .card-content.active {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  height: 100%;
  width: 100%;
  opacity: 1;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--ink-primary-04);
  cursor: pointer;
  transition: opacity 0.3s ease;
  cursor: default;
  pointer-events: none;
}




.indicator-dot.inactive {
  opacity: 0.45;
}
.card-collection {
  position: relative;
  aspect-ratio: 1/1;
}

.card-collection .card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: none;
  grid-template-rows: auto 1fr auto;
  transition: opacity 0.3s ease;
}

.card-collection .card-content.active {
  display: grid;
  opacity: 1;
}
/* Card content structure */
.card-content {
  z-index: 1;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--ink-primary-04);
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.indicator-dot.inactive {
  opacity: 0.45;
} 
.indicator-dot.inactive {
  opacity: 0.45;
}

.value.pill.array {
  transition: opacity 0.15s ease;
}

// .card-category {
//     aspect-ratio:1/1;
// }


// .card-item {
//   position: absolute !important;
//   aspect-ratio: 1/1 !important;
//   width: -webkit-fill-available;
//   height: -webkit-fill-available;
// }

// .card-container {
//   aspect-ratio: 1/1;
//   background-size: cover;
//   background-position: center;
//   position: relative;
//   transition: opacity 0.3s ease;
// }

// .carousel-item {
//   aspect-ratio: 1/1;
//   background-size: cover;
//   background-position: center;
//   position: relative;
//   transition: opacity 0.3s ease;
// }

// .card-collection::before {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   // background: linear-gradient(
//   //   to bottom,
//   //   rgba(0, 0, 0, 0.2),
//   //   rgba(0, 0, 0, 0.6)
//   // );
// }

// .card-collection .content {
//   transition: opacity 0.15s ease-in-out;
//   background-size: cover;
//   background-position: center;
//   width: 100%;
//   height: 100%;
// }

// .indicator-dot {
//   width: 6px;
//   height: 6px;
//   border-radius: 50%;
//   background-color: var(--ink-primary-04);
//   cursor: pointer;
//   transition: opacity 0.3s ease;
// }

// .indicator-dot.inactive {
//   opacity: 0.45;
// }

// .value.pill.array {
//   transition: opacity 0.15s ease;
// }

// .card-item .pill {
//   background: var(--ink-primary-06);
//   border-radius: var(--s07);
//   padding: var(--s04) var(--s07);
//   display: flex;
//   align-items: center;
//   gap: var(--s04);
// }

// .card-item .value {
//   background: var(--bg-white-03);
//   border-radius: var(--s07);
//   padding: var(--s04) var(--s07);
//   margin-top: auto;
// }
// .card-collection .contents {
//   display: none;
//   opacity: 0;
//   transition: opacity 0.3s ease;
// }

// .contents.active {
//   display: grid;
//   opacity: 1;
// }

// .carousel-item {
//   transition: opacity 0.3s ease;
// }

// .control-button:disabled {
//   opacity: 0.3;
//   cursor: not-allowed;
// }

// .carousel-item.active {
//   opacity: 1;
// }
`;

export const cardOverlays = `

.overlay-source {
  align-self: flex-end;
  background: var(--bg-black-60);
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
}

.overlay-description {
  margin-top: auto;
  width: fit-content;
  max-width: 100%;
}

.card-content {
  position: relative;
  height: 200px;
  border-radius: var(--radius-md);
  overflow: hidden;
}
`

export const cardSubStore = `

.card-sub-store,
.card-sub-store * {
  box-sizing: border-box;
}

.card-sub-store {
  aspect-ratio: var(--aspect-ratio-2x2);
  background-color: var(--bg-white-03);
  border-radius: var(--s05);
  border: 1px solid var(--ink-shade-05);
  display: grid;
  align-items: center;
  aspect-ratio: 1 / 1;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto 1fr !important;
  justify-content: flex-start;
  overflow: hidden;
}
.card-sub-store .content {
  align-items: center;
  background-position: center;
  grid-template-rows: 1fr auto 1fr !important;
  grid-template-columns: 1fr 1fr;
  gap: var(--s02);
  align-self: stretch;
}
.card-sub-store .content .label {
  grid-column: 1 / -1;
}
.card-sub-store .logo {
    background: var(--utility-rank-fair05, #fbcd2c);
    background-color: orange;
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    // max-width: 216px;
    position: relative;
    mix-blend-mode: multiply;
    grid-column: 1 / -1;
    grid-row: span 1;
}

`;




export const cardCollection = `
// card-collection {
//   background: var(--utility-functional-tag, #9747ff);
//   padding: var(--spacer-gap-s02, 3px);
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   justify-content: space-between;
//   width: 257.25px;
//   height: 257.25px;
//   position: relative;
//   overflow: hidden;
// }
.card-collection {
  background: var(--utility-functional-tag, #9747ff);
  padding: var(--spacer-gap-s02, 3px);
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.card-collection .content {
  // display: flex;
  // flex-direction: column;
  // gap: 0px;
  // align-items: flex-start;
  // justify-content: flex-start;
  // flex-shrink: 0;
  // position: relative;
}
.card-collection .content .primary {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  // justify-content: space-between;
  flex-shrink: 0;
  // width: 251.25px;
  // height: 24.75px;
  position: relative;
}
badge {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: 15px;
  opacity: 0;
  padding: 0px var(--spacer-gap-s04, 6px) 0px var(--spacer-gap-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s01, 1.5px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 21px;
  height: 21px;
  position: relative;
  overflow: hidden;
}
.partner-logo-thumbnail {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  position: relative;
  object-fit: cover;
}
.card-collection .content  .tertiary {
  border-radius: var(--spacer-gap-s07, 15px);
  padding: var(--spacer-gap-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s02, 3px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  // width: 251.25px;
  // height: 201.75px;
  position: relative;
}
.indicator {
  display: flex;
  flex-direction: row;
  gap: 3px;
  row-gap: 0px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  align-content: center;
  flex-shrink: 0;
  width: 33px;
  position: relative;
}
// .icon-coffee {
//   flex-shrink: 0;
//   width: 9px;
//   height: 9px;
//   position: relative;
//   overflow: visible;
// }
.span {
  color: var(--bg-white-00, #ffffff);
  text-align: left;
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
  -webkit-text-stroke: 2px transparent;
}
// .glyph-action-select {
//   display: flex;
//   flex-direction: row;
//   gap: 10px;
//   align-items: center;
//   justify-content: center;
//   flex-shrink: 0;
//   width: 6px;
//   height: 9px;
//   position: relative;
//   overflow: visible;
// }
.ellipse-340 {
  background: var(--ink-primary-06, #101011);
  border-radius: 50%;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  position: relative;
}
.ellipse-342 {
  background: var(--ink-primary-06, #101011);
  border-radius: 50%;
  opacity: 0.45;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  position: relative;
}
.ellipse-343 {
  background: var(--ink-primary-06, #101011);
  border-radius: 50%;
  opacity: 0.45;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  position: relative;
}
.card-collection .content .secondary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  justify-content: flex-end;
  flex-shrink: 0;
  // width: 251.25px;
  // height: 24.75px;
  // max-width: 251.25px;
  position: relative;
}
.value {
  background: var(--ink-primary-06, #101011);
  border-radius: var(--spacer-gap-s07, 15px);
  padding: 0px var(--spacer-gap-s04, 6px) 0px var(--spacer-gap-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s04, 6px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  max-height: 39px;
  position: relative;
}s
// .glyph-packed {
//   padding: 6.23px 0px 5.79px 0px;
//   display: flex;
//   flex-direction: row;
//   gap: 10px;
//   align-items: center;
//   justify-content: center;
//   flex-shrink: 0;
//   width: 8px;
//   position: relative;
// }
// .icon {
//   flex-shrink: 0;
//   width: 8.85px;
//   height: 8.98px;
//   position: relative;
// }
// .icon-check {
//   padding: 0px 0px 0.27px 0px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   align-items: center;
//   justify-content: flex-end;
//   width: 8.85px;
//   height: 8.98px;
//   position: absolute;
//   left: 0px;
//   top: 0.23px;
// }
.frame-1321322338 {
  flex-shrink: 0;
  width: 8.85px;
  height: 8.57px;
  position: relative;
  overflow: visible;
}
.count {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.span2 {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s02, 3px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
// .label {
//   color: var(--bg-white-00, #ffffff);
//   text-align: justified;
//   font-family: var(
//     --numad-text02m-font-family,
//     "HelveticaNeue-Medium",
//     sans-serif
//   );
//   font-size: var(--numad-text02m-font-size, 12px);
//   line-height: var(--numad-text02m-line-height, 18px);
//   letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
//   font-weight: var(--numad-text02m-font-weight, 500);
//   position: relative;
// }
// .count2 {
//   opacity: 0.9;
//   display: flex;
//   flex-direction: row;
//   gap: 0px;
//   align-items: center;
//   justify-content: flex-start;
//   flex-shrink: 0;
//   height: 13px;
//   position: relative;
// }
// .glyph-number {
//   flex-shrink: 0;
//   width: 4px;
//   height: 10.5px;
//   position: relative;
// }
// .number-path {
//   color: var(--bg-white-00, #ffffff);
//   text-align: left;
//   font-family: var(
//     --numad-text02m-font-family,
//     "HelveticaNeue-Medium",
//     sans-serif
//   );
//   font-size: var(--numad-text02m-font-size, 12px);
//   line-height: var(--numad-text02m-line-height, 18px);
//   letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
//   font-weight: var(--numad-text02m-font-weight, 500);
//   position: absolute;
//   left: 0px;
//   top: 0px;
//   width: 4px;
//   height: 10.5px;
// }
// .count3 {
//   color: var(--bg-white-00, #ffffff);
//   text-align: left;
//   font-family: var(
//     --numad-text02m-font-family,
//     "HelveticaNeue-Medium",
//     sans-serif
//   );
//   font-size: var(--numad-text02m-font-size, 12px);
//   line-height: var(--numad-text02m-line-height, 18px);
//   letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
//   font-weight: var(--numad-text02m-font-weight, 500);
//   position: relative;
// }
// .glyph-number-path {
//   flex-shrink: 0;
//   width: 4px;
//   height: 10.5px;
//   position: relative;
// }
.div {
  color: var(--bg-white-00, #ffffff);
  text-align: left;
  font-family: var(
    --numad-text02m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text02m-font-size, 12px);
  line-height: var(--numad-text02m-line-height, 18px);
  letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
  font-weight: var(--numad-text02m-font-weight, 500);
  position: absolute;
  left: 0px;
  top: 0px;
  width: 4px;
  height: 10.5px;
}
.frame-1321322361 {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 6px;
  height: 9px;
  position: relative;
  overflow: visible;
}
`;





export const cardSummary = `
.card-summary {
  max-block-size: fit-content;
  aspect-ratio: var(--aspect-ratio-4x2);
  background: var(--bg-white-03, #fbfbff);
  border-radius: var(--spacer-gap-s06, 12px);
  border-style: solid;
  border-color: var(--ink-shade-04, #eef1f3);
  border-width: 1px;
  // padding: var(--spacer-gap-s00, 0px) var(--spacer-gap-s07, 15px) ;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  // padding: var(--spacer-gap-s07, 15px);
  // display: grid;
  // grid-template-rows: 1fr 1fr;
  // grid-template-columns: 1fr;
  // align-items: center;
  // justify-content: center;
  // width: 264.75px;
  // height: 132.38px;
  // position: relative;
}
.card-summary .title {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.card-summary .tag-array {
  padding: 0px 15px;
  // display: flex;
  // flex-direction: row;
  // gap: 3px;
  // align-items: flex-start;
  // justify-content: flex-start;
  // flex-wrap: wrap;
  // align-content: flex-start;
  // align-self: stretch;
  // flex-shrink: 0;
  // position: relative;
}
.overview {
  padding: var(--spacer-gap-s07, 15px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  align-self: stretch;
  flex: 1;
  position: relative;
}
`;















export const cardAttributes = `
  .card-attributes {
    aspect-ratio: var(--aspect-ratio-5x2);
    background: var(--bg-white-03);
    border: 1px solid var(--ink-shade-04);
    border-radius: var(--spacer-gap-s06);
    padding: var(--spacer-gap-s07);
    display: grid;
    flex-direction: column;
    gap: var(--spacer-gap-s07);
    // height: 180px;
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex: 1;
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }

  .span {
    color: var(--ink-primary-03);
    font-family: var(--font-family-helvetica);
    font-size: var(--font-size-m);
    line-height: var(--line-height-m);
    letter-spacing: var(--letter-spacing-m);
    font-weight: var(--font-weight-medium);
  }

  .tag-attributes {
    background: var(--ink-shade-03);
    border: 1px solid var(--ink-shade-03);
    border-radius: var(--spacer-gap-s07);
    padding: var(--spacer-gap-s04) var(--spacer-gap-s05);
    display: flex;
    gap: var(--spacer-gap-s02);
    overflow: hidden;
  }

  .label {
    color: var(--ink-primary-03);
    font-family: var(--font-family-helvetica);
    font-size: var(--font-size-s);
    line-height: var(--line-height-s);
    letter-spacing: var(--letter-spacing-s);
    font-weight: var(--font-weight-medium);
  }

  .count {
    display: flex;
    align-items: center;
    color: var(--ink-primary-03);
    font-family: var(--font-family-helvetica);
    font-size: var(--font-size-s);
    line-height: var(--line-height-s);
    letter-spacing: var(--letter-spacing-s);
    font-weight: var(--font-weight-medium);
  }

  .count::before,
  .count::after {
    color: var(--ink-grey-05);
    font-size: var(--font-size-s);
  }

  .count::before {
    content: '(';
  }

  .count::after {
    content: ')';
  }

  .more {
    padding: 1.5px 0;
  }

  .text-underline {
    display: flex;
    gap: var(--spacer-gap-s01);
    align-items: center;
    color: var(--utility-functional-action);
    font-family: var(--font-family-helvetica);
    font-size: var(--font-size-s);
    line-height: var(--line-height-s);
    letter-spacing: var(--letter-spacing-s);
    font-weight: var(--font-weight-medium);
  }
`;

export const cardGalleryStyle = `
  .card-category {
    ${cardCategory}
    background: var(--utility-functional-tag);
    padding: var(--spacer-gap-s02);
    aspect-ratio: 1 / 1;  
    display: grid;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .primary {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  

  .tertiary {
    ${cardCollection}
  }

  .indicator {
    display: flex;
    gap: 3px;
  }

  .indicator-dot {
    background: var(--ink-primary-04);
    border-radius: 50%;
    width: 6px;
    height: 6px;
  }

  .indicator-dot.inactive {
    opacity: 0.45;
  }

  .secondary {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .comment {
    background: var(--ink-shade-03);
    border-radius: 10.5px;
    padding: var(--spacer-gap-s01) var(--spacer-gap-s04);
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s02);
    // max-width: 243.75px;
  }

  .comment-text {
    color: var(--ink-primary-02);
    font-family: var(--numad-text02m-font-family);
    font-size: var(--numad-text02m-font-size);
    line-height: var(--numad-text02m-line-height);
    font-weight: var(--numad-text02m-font-weight);
    // max-width: 215.75px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;









export const cardStoreStyle = `
  .card,
.card.sore * {
  box-sizing: border-box;
}
.card.store .container {
  // background: linear-gradient(to left, #9747ff, #9747ff);
  border-radius: var(--ratio-spacer-s08, 18px);
  padding: var(--ratio-spacer-s02, 3px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 270px;
  height: 270px;
  min-width: 220px;
  position: relative;
  box-shadow: var(
    --shadow-box-shadow,
    0px 3px 6px 0px rgba(0, 0, 0, 0.3),
    0px 6px 9px 0px rgba(0, 0, 0, 0.09)
  );
  overflow: hidden;


  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-column: span 1;
  grid-row: span 1;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  overflow: hidden;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
.card.store .container .primary {
  opacity: 0;
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s01, 1.5px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 21px;
  position: relative;


  top: var(--spacing-3);
  left: var(--spacing-3);
  z-index: 2;
  display: grid;
  grid-column: span 1;
  grid-row: span 1;
}

.card.store .container .media {
  width: fit-content;
  height: fit-content;
  position: relative;
  top: 0;
  left: 0;
  z-index: -1;
}

.card.store .container .media .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.card.store .container .tertiary {
  margin: -33333333458944px 0 0 0;
  display: flex;
  flex-direction: row;
  gap: 3px;
  row-gap: 0px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  align-content: center;
  flex-shrink: 0;
  width: 33px;
  position: relative;


  margin: 0;
  place-content: center;
  padding: 0;
  bottom: var(--spacing-3);
  z-index: 2;
  display: grid;
  grid-column: span 1;
  grid-row: span 1;
}

.card.store .container .secondary {
  margin: -33333333458944px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}












.pill .geotag {
  background: var(--ink-white-01, #ffffff);
  border-radius: 15px;
  padding: 0px var(--ratio-spacer-s04, 6px) 0px var(--ratio-spacer-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s01, 1.5px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
} 










.card.store .container .pill {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: 15px;
  padding: 0px var(--ratio-spacer-s04, 6px) 0px var(--ratio-spacer-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s01, 1.5px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.card.store .container .glyph-packed {
  padding: 6.23px 0px 5.79px 0px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.card.store .container .icon {
  flex-shrink: 0;
  width: 9.15px;
  height: 9px;
  position: relative;
  overflow: visible;
}
.card.store .container .val {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.card.store .container ._1 {
  color: var(--ink-primary-black-02, #212322);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.card.store .container .pill2 {
  background: var(--ink-primary-black-06, #101011);
  border-radius: 15px;
  padding: 0px var(--ratio-spacer-s04, 6px) 0px var(--ratio-spacer-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s01, 1.5px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.card.store .container .icon2 {
  flex-shrink: 0;
  width: 6.36px;
  height: 9px;
  position: relative;
}
.card.store .container .hours {
  width: 6.38px;
  height: 8.98px;
  position: absolute;
  left: 0px;
  top: 0px;
  overflow: visible;
}
.card.store .container ._12 {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.card.store .container .mi {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.card.store .container .pill-status {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: 15px;
  padding: 0px var(--ratio-spacer-s04, 6px) 0px var(--ratio-spacer-s04, 6px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s02, 3px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.card.store .container .icon3 {
  flex-shrink: 0;
  width: 8.59px;
  height: 8.98px;
  position: relative;
  overflow: visible;
}
.card.store .container .label {
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s02, 3px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.card.store .container .busy {
  color: var(--ink-grey-06, #373a42);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.card.store .container .for {
  color: var(--ink-grey-06, #373a42);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.card.store .container ._13 {
  color: var(--ink-grey-06, #373a42);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}
.card.store .container .h {
  color: var(--ink-grey-06, #373a42);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}

.card.store .container .ellipse-340 {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: 50%;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  position: relative;
}
.card.store .container .ellipse-342 {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: 50%;
  opacity: 0.45;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  position: relative;
}
.card.store .container .ellipse-343 {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: 50%;
  opacity: 0.45;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  position: relative;
}
.card.store .container {
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  backdrop-filter: var(--blur01-backdrop-filter, blur(7.5px));
}
.card.store .container .pill3 {
  background: var(--ink-primary-white-01, #fbfbfe);
  border-radius: 15px;
  padding: var(--ratio-spacer-s06, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s01, 1.5px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.card.store .container .label2 {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.card.store .container .strawberry-match-latte {
  color: var(--utility-functional-action, #3a3aff);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
}

`;







// Apply hero styles to the document
const cardStyle = document.createElement('style');
cardStyle.textContent = cardGalleryStyle+ cardOverlays + cardCategory + cardSubStore + cardCollection + cardSummary + cardAttributes;
document.head.appendChild(cardStyle);










