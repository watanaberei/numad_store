export const glyphstyle = `
.glyph-map-pin-headline {
    flex-shrink: 0;
    width: 26px;
    height: 36px;
    position: relative;
  }
  .icon-map-pin-headline {
    width: 29.12px;
    height: 36px;
    position: absolute;
    left: -2px;
    top: 1.75px;
    overflow: visible;
  }
  `;
  // Apply hero styles to the document
const glyphLocationPinElement = document.createElement('i');
glyphLocationPinElement.textContent = glyphLocationPin;
document.head.appendChild(glyphLocationPinElement);