export const glyphStyle = `
.glyph05 {
    width: 26px;
    height: 36px;
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
  `;
  // Apply hero styles to the document
const glyphStyleElement = document.createElement('style');
glyphStyleElement.textContent = glyphStyle;
document.head.appendChild(glyphStyleElement);