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










.icon-coffee {
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  position: relative;
  overflow: visible;
}
.icon {
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  position: relative;
}
.icon-check {
  padding: 0px 0px 0.27px 0px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  width: 8.85px;
  height: 8.98px;
  position: absolute;
  left: 0px;
  top: 0.23px;
}
  `;
  // Apply hero styles to the document
const iconStyleElement = document.createElement('style');
iconStyleElement.textContent = iconStyle;
document.head.appendChild(iconStyleElement);