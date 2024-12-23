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
  .glyph03 {
    flex-shrink: 0;
    width: 21px;
    height: 21px;
    position: relative;
    overflow: visible;
  }
  .glyph-rating-price-15 {
    flex-shrink: 0;
    width: 7px;
    height: 10px;
    position: relative;
    overflow: visible;
  }
  .glyph-rating-price-15 {
    flex-shrink: 0;
    width: 7px;
    height: 10px;
    position: relative;
    overflow: visible;
  }
  .glyph-rating-star-15 {
    padding: 4px 0.01px 5.02px 0.01px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .glyph-rating-star {
    flex-shrink: 0;
    align-self: center;
    width: 8.98px;
    height: 10px;
    position: relative;
    overflow: visible;
  }
  `;
  // Apply hero styles to the document
const glyphStyleElement = document.createElement('style');
glyphStyleElement.textContent = glyphStyle;
document.head.appendChild(glyphStyleElement);