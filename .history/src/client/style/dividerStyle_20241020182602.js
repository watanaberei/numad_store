
export const divider = `
.divider-v {
  background-color: var(--stroke-grey-05);
  height: 1px;
  padding: 0 var(--spacer-gap-s08);
}
  div#header .secondary {
    display: grid;
    align-self: end;
    justify-items: end;
    grid-column: span 2;
  }
`;




  // Apply hero styles to the document
  const dividerrStyle = document.createElement('style');
  dividerStyle.textContent = divider ;
  document.head.appendChild(dividerStyle);
  
