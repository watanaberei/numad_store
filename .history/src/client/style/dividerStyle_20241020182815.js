
export const divider = `
.divider-v {
display: grid;
  background-color: var(--stroke-grey-05);
  height: 1px;
  margin: var(--spacer-gap-s08) 0;
//   width: 100%;
grid-column: 1 / -1;
}
`;




  // Apply hero styles to the document
  const dividerStyle = document.createElement('style');
  dividerStyle.textContent = divider ;
  document.head.appendChild(dividerStyle);
  
