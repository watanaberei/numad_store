export const mapRadiusStyle = `
  .location {
    display: grid;
    grid-template-row: auto;
  }

  .map-container {
    width: 100%;
    overflow: hidden;
    aspect-ratio: var(--aspect-ratio-4x2) !important;
    position: relative;
    border-radius: var(--spacer-gap-s07, 15px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    height: 547.5px;
    position: relative;
    overflow: hidden;
  }

  .map {
    z-index: 0;
    height: 100%;
    width: 100%;
    aspect-ratio: var(--aspect-ratio-4x2);
  }

  .overlay {
    height: 100%;
    width: 100%;
    z-index: 10;
    padding: var(--spacer-gap-s07, 15px);
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: baseline;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }

  .search {
    background: #f3f4f9;
    border-radius: 3px;
    border-style: solid;
    border-color: #eaf2f4;
    border-width: 1px;
    padding: 12px var(--s01, 12px) 12px var(--s01, 12px);
    display: flex;
    flex-direction: row;
    gap: var(--s02, 36px);
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  ._11900-south-st-ste-134-cerritos-ca-90703 {
    color: var(--ink-black-03, #272727);
    text-align: right;
    font-family: "HelveticaNeue-Regular", sans-serif;
    font-size: 15px;
    line-height: 21px;
    letter-spacing: -0.015em;
    font-weight: 400;
    position: relative;
  }
`;

// Apply master styles to the document
const mapStyle = document.createElement('style');
mapStyle.textContent = mapRadiusStyle;
document.head.appendChild(mapStyle);