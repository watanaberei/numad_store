export const navStyle = `
header.headline,
header.headline * {
  box-sizing: border-box;
}
header.headline {
  padding: 15px 0px 45px 0px;
  display: flex;
  background-color: var(--bg03);
  /* flex-flow: wrap; */
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
}
.headline .header {
  padding: 12px 0px 12px 0px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  margin: 0 !important;
  flex-shrink: 0;
  position: relative;
}
.headline .header .text {
    color: #e1ecf4;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 60px;
  line-height: 51px;
  font-weight: 500;
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.headline .header .text span.primary {
    /* text-align: left;
    font-family: "HelveticaNeue-Medium", sans-serif;
    font-size: 60px;
    line-height: 51px;
    font-weight: 500; */
    position: relative;
    -webkit-text-stroke: 2px transparent;
}
 
/* .headline .header .text span.secondary {
  color: #f3b440;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 60px;
  line-height: 51px;
  font-weight: 500;
} */
.headline .tags {
  padding: 12px 0px 12px 0px;
  display: flex;
  flex-direction: row;
  gap: 21px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.headline .array .item {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.headline .array .item .text  {
  flex-shrink: 0;
  width: 100%;
  height: 11px;
  position: static;
}
.headline .array .item .text span {
    color: #e1ecf4;
  /* color: #e1ecf4;
  text-align: left;
  font-family: "HelveticaNeue-Regular", sans-serif;
  font-size: 15px;
  line-height: 24px;
  font-weight: 400;
  opacity: 0.800000011920929; */
  /* position: absolute; */
  left: 0px;
  top: 0px;
}
.headline .array .item .text .glyph {
  /* background: rgba(192, 255, 111, 0.75); */
  /* border-radius: 333px;
  border-style: solid;
  border-color: #c0ff6f;
  border-width: 1px; */
  flex-shrink: 0;
  width: 11px;
  height: 11px;
  position: relative;
  overflow: hidden;
}

  `;
  // Apply hero styles to the document
const media = document.createElement('style');
media.textContent = navStyle;
document.head.appendChild(media);
