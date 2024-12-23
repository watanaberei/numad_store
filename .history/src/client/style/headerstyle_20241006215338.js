
export const title = `
.title {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
  `;








  // Apply hero styles to the document
  const titleStyle = document.createElement('style');
  titleStyle.textContent = title ;
  document.head.appendChild(titleStyle);
  