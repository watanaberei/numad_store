export const datavisStyle = `
.datavis {
  // aspect-ratio: var(--aspect-ratio-1x1);
}
.datavis .datavis-item-details {
  display: none;
}
.datavis:hover .datavis-item-details {
  display: flex;
  flex-direction: column;
  alignItems: center;
  justifyContent: center;
}
.datavis .datavis-visual.active {
  background: var(--utility-rank-good03, #26e615);
}
.datavis .datavis-visual.inactive {
  background: #EAF2F4;
}
.datavis.current {
  border: 2px solid var(--utility-rank-good03);
  order: -1;
}
.datavis .time-item-current {
  padding: var(--spacer-gap-s05, 9px) 0px var(--spacer-gap-s05, 9px) 0px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 126px;
  height: 165px;
  position: relative;
  overflow: hidden;
}
.datavis .datavis {
  border-radius: var(--spacer-gap-s05, 9px);
  border-style: solid;
  border-color: #000000;
  border-width: 1px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 130.5px;
  position: relative;
  overflow: hidden;
}
.datavis .datavis-visual {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 134.25px;
  position: relative;
  overflow: hidden;
}
.datavis .active {
  background: var(--utility-rank-good03, #26e615);
  border-radius: var(--spacer-gap-s05, 9px);
  align-self: stretch;
  flex-shrink: 0;
  height: 134.25px;
  position: relative;
  overflow: hidden;
}
.datavis .datavis-item-details {
  margin: 0 0 0 -3333333px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 134.25px;
  position: relative;
  overflow: hidden;
}
.datavis .timez {
  color: var(--ink-black-03, #272727);
  text-align: left;
  position: relative;
}
.datavis .time {
  padding: var(--spacer-gap-s04, 6px) 0px var(--spacer-gap-s04, 6px) 0px;
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s00, 0px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.datavis .time-hour {
  flex-shrink: 0;
  width: 7px;
  height: 9px;
  position: static;
}
.datavis .time-meridian {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.datavis .time-meridian {
  background: linear-gradient(to left, #272727, #272727);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: left;
  // font-family: var(
  //   --numad-text02m-font-family,
  //   "HelveticaNeue-Bold",
  //   sans-serif
  // );
  // font-size: var(--numad-text02m-font-size, 12px);
  // line-height: var(--numad-text02m-line-height, 18px);
  // letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
  // font-weight: var(--numad-text02m-font-weight, 700);
  position: relative;
}

  
`;


export const timelineStyle = `
/* Add to styles.css or create a new places.css */

.business-hours {
  background: var(--bg-white-03, #fbfbff);
  border-radius: var(--spacer-gap-s07, 15px);
  border-style: solid;
  border-color: var(--ink-shade-04, #eef1f3);
  border-width: 1px;
  padding: var(--spacer-gap-s07, 15px);
  display: flex;
  flex-direction: column;
  gap: var(--spacer-gap-s05, 9px);
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
}

/* Container styles */
.business-hours .container {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s02, 3px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}

/* Datavis styles */
.business-hours .datavis {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relateive;
  // aspect-ratio: var(--aspect-ratio-2x2);
  left: 0px;
  top: 0px;
}

/* All remaining CSS classes from the spec document */
/* ... Include all CSS classes exactly as provided in the spec ... */

/* Add new console logging styles for debugging */
.debug-log {
  display: none; /* Hidden by default */
  color: #666;
  // font-size: 12px;
  padding: 4px;
  margin: 2px 0;
  background: #f5f5f5;
  border-left: 3px solid #999;
}

/* Add any additional helper classes needed for functionality */
.scroll-container {
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}







.business-hours {
  background: var(--bg-white-03, #fbfbff);
  border-radius: var(--spacer-gap-s07, 15px);
  border-style: solid;
  border-color: var(--ink-shade-04, #eef1f3);
  border-width: 1px;
  padding: var(--spacer-gap-s07, 15px);
  display: flex;
  flex-direction: column;
  gap: var(--spacer-gap-s05, 9px);
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
 }
 .business-hours .container {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s02, 3px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
 }
 .datavis {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  left: 0px;
  top: 0px;
 }
 .datavis .datavis-item.active.current {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  // width: 130.5px;
  // height: 130.5px;
  position: relative;
  overflow: hidden;
 }
 .datavis .datavis-visual {
  border-radius: var(--spacer-gap-s05, 9px);
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-start;
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  }
 .datavis .datavis-container {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-end;
  justify-content: flex-start;
  align-self: stretch;
  flex: 1;
  position: relative;
  overflow: hidden;
 }
 .datavis .datavis-indicator.active.current {
  background: var(--utility-rank-good03, #26e615);
  border-radius: var(--spacer-gap-s05, 9px);
  align-self: stretch;
  flex: 1;
  position: relative;
  overflow: hidden;
 }
 .datavis .datavis-info {
  position: absolute;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr;
  height: -webkit-fill-available;
  width: -webkit-fill-available;
  // justify-content: space-between;
  // align-self: stretch;
  // flex: 1;
  // position: absolute;
 }
 .datavis .datavis-info .primary {
  display: grid;
  // background: aliceblue;
  grid-row: span 1;
  grid-column: span 1;
  height: 50%;
  padding: var(--spacer-gap-s05, 9px);
  flex-direction: row;
  gap: var(--spacer-gap-s02, 3px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex: 1;
  position: relative;
 }
 .datavis .datavis-info .secondary {
  display: grid;
    /* background: aliceblue; */
    grid-row: span 1;
    grid-column: span 1;
    padding: var(--spacer-gap-s05, 9px);
    flex-direction: row;
    gap: var(--spacer-gap-s02, 3px);
    align-items: baseline;
    justify-content: flex-end;
    align-self: stretch;
    flex: 1;
    position: relative;
 }
 .datavis .datavis-info .indicator-live {
  border-radius: 333333px;
  border-style: solid;
  border-color: var(--utility-functional-action, #3a3aff);
  border-width: 1px;
  padding: 1.5px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  position: relative;
 }
 .time {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 .time .time-hour {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
 }
 
 
 .time .time-meridian {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
 }
 .datavis-item-active {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  // width: 130.5px;
  // height: 130.5px;
  position: relative;
  overflow: hidden;
 }
 
 
 .datavis .datavis-indicator.active {
  background: var(--utility-rank-good01, #acffb0);
  border-radius: var(--spacer-gap-s05, 9px);
  align-self: stretch;
  flex: 1;
  position: relative;
  overflow: hidden;
 }
 .datavis .datavis-item,  .datavis .datavis-item-inactive {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  // width: 130.5px;
  // height: 130.5px;
  position: relative;
  aspect-ratio: var(--aspect-ratio-2x2);
  left: 0px;
  top: 0px;
  overflow: hidden;
 }
 .datavis .datavis-indicator.inactive {
  background: var(--bg-white-05, #f7f8fd);
  border-radius: var(--spacer-gap-s05, 9px);
  align-self: stretch;
  flex: 1;
  position: relative;
  overflow: hidden;
 }
 .business-hours .tools {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
 }
 .tools .detail {
  display: flex;
  flex-direction: row;
  gap: 9px;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  position: relative;
 }
 .tools .detail .status {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s00, 0px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 
 
 .tools .detail .condition {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 .tools .detail .condition .temp {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 .tools .control {
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
 }
 .tools .control .control-jump {
  background: var(--bg-white-02, #e1ecf4);
  border-radius: 15px;
  padding: 9px 15px 9px 15px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
 }
 .tools .control .navigation {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s04, 6px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 .tools .control .navigation .control-previous {
  background: var(--bg-white-02, #e1ecf4);
  border-radius: 30px;
  padding: var(--spacer-gap-s05, 9px);
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 .tools .control .navigation .control-next {
  background: var(--bg-white-02, #e1ecf4);
  border-radius: 30px;
  padding: var(--spacer-gap-s05, 9px);
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
 }
 
`;

// Apply global styles to the document
const datavisElement = document.createElement('style');
datavisElement.textContent = datavisStyle + timelineStyle;
document.head.appendChild(datavisElement);

