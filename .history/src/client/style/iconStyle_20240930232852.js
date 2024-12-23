export const iconStyle = `
.icon05 {
  width: 26px;
  height: 36px;
}
.icon03 {
  width: 22px;
  height: 22px;
}
.icon-map-pin-headline {
    flex-shrink: 0;
    width: 26px;
    height: 36px;
    position: relative;
  }
  .icon-map-pin-headline {
    width: 30px;
    height: 37px;
    /*position: absolute;*/
    padding-left: -2px;
    padding-top: 2px;
    overflow: visible;
  }
  .icon03 {
    flex-shrink: 0;
    width: 21px;
    height: 21px;
    position: relative;
    overflow: visible;
  }
  `;
  // Apply hero styles to the document
const iconStyleElement = document.createElement('style');
iconStyleElement.textContent = iconStyle;
document.head.appendChild(iconStyleElement);