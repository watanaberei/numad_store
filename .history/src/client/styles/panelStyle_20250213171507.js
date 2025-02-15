export const panel = `
.panel {
//   height: 100vh;
}
`;

export const panelPersistent = `
.panel.persistent {
  height: 100vh;
}
`;


// Apply hero styles to the document
const panelStyle = document.createElement("style");
panelStyle.textContent = panel + panelPersistent;
document.head.appendChild(panelStyle);


// export const panelStyle = {
//   panel: {
//     height: '100vh',
//     width: '100vw',
//   },
// };


