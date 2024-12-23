
export const footerStyle = `
 
  
  #footer-container {
    align-items: center;
    justify-content: space-between;
    margin: var(--s09) 0;
    /* display: flex;
    min-width: 450px;
    max-width: 600px;
    */
  }
  
  
  .attributes {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .attribute {
    display: flex;
    align-items: center;
    border: 1px solid var(--ink-shade-05);
    border-radius: 1.5px;
    padding: 3px var(--s01);
    margin-right: var(--s02);
  }
  
  .attribute-name {
    margin-right: var(--s01);
  }
  

  
  .separator {
    color: var(--ink-grey-grey);
    margin: 0 var(--s02);
  }
  
  .more {
    color: var(--utility-functional-action);
    // font-weight: 500;
    cursor: pointer;
    width: fit-content;
  }
  
  .more svg {
    margin-right: var(--s01);
  }
  
  .content {
    display: grid;
    grid-column: 1 / -1;
    flex-direction: column;
    width: 100%;
    gap: var(--s07);
    flex: 1;
    position: relative;
    /* 
    justify-content: flex-start; 
    padding: var(--s05);
    */
  }
  /* 
  // .icon {
  //   background: var(--utility-functional-red);
  //   display: flex;
  //   flex-direction: row;
  //   gap: 4.5px;
  //   align-items: center;
  //   justify-content: flex-start;
  //   flex-shrink: 0;
  //   width: 6.4px;
  //   height: 9px;
  //   position: relative;
  // }
  */
  
  .distance {
    display: flex;
    flex-direction: row;
    gap: 0;
    align-items: flex-start;
    justify-content: flex-start;
    flex: 1;
    position: relative;
  }
  

  
  .unit {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  
  .miles {
    color: var(--ink-primary-04);
    text-align: right;
    font-family: var(--numad-text02m-font-family);
    font-size: var(--numad-text02m-font-size);
    line-height: var(--numad-text02m-line-height);
    letter-spacing: -0.03em;
    font-weight: var(--numad-text02m-font-weight);
    position: relative;
  }
  
  .image {
    background: var(--utility-functional-tag);
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    position: relative;
    mix-blend-mode: multiply;
  }
  
  .name {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  
  .label {
    display: flex;
    flex-direction: row;
    gap: var(--s01);
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .brand > .label {
    color: var(--ink-primary-04);
    text-align: left;
    position: relative;
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  `;


const footerStyleElement = document.createElement(`style`);
footerStyleElement.textContent = footerStyle;
document.head.appendChild(footerStyleElement);
