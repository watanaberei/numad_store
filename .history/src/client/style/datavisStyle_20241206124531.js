export const datavisStyle = `
.datavis.time-item {
  aspect-ratio: var(--aspect-ratio-1x1);
}
.datavis.time-item .datavis-item-details {
  display: none;
}
.datavis.time-item:hover .datavis-item-details {
  display: flex;
  flex-direction: column;
  alignItems: center;
  justifyContent: center;
}
.datavis.time-item .container.active {
  background: var(--utility-rank-good03, #26e615);
}
.datavis.time-item .container.inactive {
  background: #EAF2F4;
}
.datavis.time-item.current {
  border: 2px solid var(--utility-rank-good03);
}
.datavis.time-item .time-item-current {
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
.datavis.time-item .datavis {
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
.datavis.time-item .container {
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
.datavis.time-item .active {
  background: var(--utility-rank-good03, #26e615);
  border-radius: var(--spacer-gap-s05, 9px);
  align-self: stretch;
  flex-shrink: 0;
  height: 134.25px;
  position: relative;
  overflow: hidden;
}
.datavis.time-item .datavis-item-details {
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
.datavis.time-item .timez {
  color: var(--ink-black-03, #272727);
  text-align: left;
  position: relative;
}
.datavis.time-item .time {
  padding: var(--spacer-gap-s04, 6px) 0px var(--spacer-gap-s04, 6px) 0px;
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s00, 0px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.datavis.time-item .time-hour {
  flex-shrink: 0;
  width: 7px;
  height: 9px;
  position: static;
}
.datavis.time-item .time-meridian {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.datavis.time-item .time-meridian {
  background: linear-gradient(to left, #272727, #272727);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: left;
  font-family: var(
    --numad-text02m-font-family,
    "HelveticaNeue-Bold",
    sans-serif
  );
  font-size: var(--numad-text02m-font-size, 12px);
  line-height: var(--numad-text02m-line-height, 18px);
  letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
  font-weight: var(--numad-text02m-font-weight, 700);
  position: relative;
}
  
`;

// Apply global styles to the document
const datavisElement = document.createElement('style');
datavisElement.textContent = datavisStyle;
document.head.appendChild(datavisElement);

