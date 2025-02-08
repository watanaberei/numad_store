export const glyphStyle = `
.glyph {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: var(--s03) !important;
  overflow: visible !important;
}

.glyph svg {
  overflow: visible !important;
}
.glyph05 {
    width: 26px;
    height: 36px;
}
.glyph02 {
    width: auto;
    height: 9px;
}
.glyph-map-pin-headline {
    flex-shrink: 0;
    width: 26px;
    height: 36px;
    position: relative;
  }
  .glyph-map-pin-headline {
    width: 30px;
    height: 37px;
    /*position: absolute;*/
    padding-left: -2px;
    padding-top: 2px;
    overflow: visible;
  }
  .glyph-map-pin-headline {
    width: 30px;
    height: 37px;
    /*position: absolute;*/
    padding-left: -2px;
    padding-top: 2px;
    overflow: visible;
  }
  .glyph03 {
    flex-shrink: 0;
    width: 21px;
    height: 21px;
    position: relative;
    overflow: visible;
  }
  .glyph-detail-price-15 {
    /* padding: 4px 0px 5px 0px; */
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 7px;
    position: relative;
  }
  .glyph-detail-price {
    flex-shrink: 0;
    align-self: center;
    width: 7px;
    height: 9px;
    position: relative;
    overflow: visible;
  }
  .glyph-detail-star-15 {
    /* padding: 4px 0.01px 5.02px 0.01px; */
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .glyph-detail-star {
    flex-shrink: 0;
    align-self: center;
    width: 8.98px;
    height: 9px;
    position: relative;
    overflow: visible;
  }











.glyph-action-select {
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
.glyph-packed {
  padding: 6.23px 0px 5.79px 0px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 8px;
  position: relative;
}
.glyph-number {
  flex-shrink: 0;
  width: 4px;
  height: 10.5px;
  position: relative;
}
.glyph-number-path {
  flex-shrink: 0;
  width: 4px;
  height: 10.5px;
  position: relative;
}
  `;
  // Apply hero styles to the document
const glyphStyleElement = document.createElement('style');
glyphStyleElement.textContent = glyphStyle;
document.head.appendChild(glyphStyleElement);