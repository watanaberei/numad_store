export const iconStyle = `
.icon {
  
  display: flex;
  flex-direction: row;
  gap: 4.5px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  position: relative;
}
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
  .icon-rating {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex-shrink: 0;
    width: 9px;
    height: 9px;
    position: relative;
    overflow: visible;
  }
  `;
  // Apply hero styles to the document
const iconStyleElement = document.createElement('style');
iconStyleElement.textContent = iconStyle;
document.head.appendChild(iconStyleElement);