// amenitiesItemStyle.js

export const indicators = `
.indicators {
  display: flex;  /* Creates horizontal layout for dots */
  gap: var(--s02);  /* Adds space between dots using design system variable */
}

.indicator {
  width: 6px;  /* Sets dot size */
  height: 6px;
  border-radius: 50%;  /* Makes dots circular */
  background: var(--ink-primary-06);  /* Uses design system color */
  opacity: 0.45;  /* Makes inactive dots semi-transparent */
  cursor: pointer;  /* Shows clickable cursor */
}

.indicator.active {
  opacity: 1;  /* Makes active dot fully opaque */
}
`;

const controlElement = document.createElement('style');
controlElement.textContent = indicators;
document.head.appendChild(controlElement);