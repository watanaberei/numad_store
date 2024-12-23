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
  .icon-map-pin-headline {
    width: 30px;
    height: 37px;
    /*position: absolute;*/
    left: -2px;
    top: 1.75px;
    overflow: visible;
  }
  `;
  // Apply hero styles to the document
const glyphStyleElement = document.createElement('style');
glyphStyleElement.textContent = glyphStyle;
document.head.appendChild(glyphStyleElement);