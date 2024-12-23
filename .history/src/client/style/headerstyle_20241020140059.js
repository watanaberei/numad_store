
export const title = `
.title {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  width: 100%;
}

.title .sentance {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s04, 6px);
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}
  `;










  export const titleStyle = `
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .title .primary {
    flex: 1;
  }

  .title .category {
    background: var(--ink-shade-03);
    border-radius: var(--spacer-gap-s02);
    padding: 5px 6px;
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s05);
    cursor: pointer;
    border: none;
  }

  .title .span {
    color: var(--ink-black-03);
    font-family: var(--font-family-helvetica);
    font-size: 15px;
    line-height: 26px;
    letter-spacing: -0.015em;
    font-weight: 500;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .title .secondary {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  .pagination {
    background: var(--ink-primary-03);
    border-radius: var(--spacer-gap-s07);
    padding: 0 var(--spacer-gap-s07);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 54px;
    height: 30px;
  }

  .pagination2 {
    display: flex;
    gap: var(--spacer-gap-s02);
  }

  .ellipse {
    background: var(--ink-shade-03);
    border-radius: 50%;
    width: 6px;
    height: 6px;
  }

  .ellipse.inactive {
    opacity: 0.45;
  }

  .title .controls {
    display: flex;
    /* justify-content: flex-end; */
    width: fit-content;
    gap: var(--spacer-gap-s04);
  }

  .controls-button {
    background: var(--ink-primary-03);
    border-radius: 30px;
    padding: var(--spacer-gap-s05);
    cursor: pointer;
    border: none;
  }
`;


// Apply master styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = title + titleStyle;
document.head.appendChild(styleElement);




export const header = `
div#header > .primary {
  display: grid;
  align-self: start;
  grid-column: span 2;
}
  div#header > .secondary {
    display: grid;
    align-self: end;
    grid-column: span 2;
  }
`;




  // // Apply hero styles to the document
  // const titleStyle = document.createElement('style');
  // titleStyle.textContent = title ;
  // document.head.appendChild(titleStyle);
  
