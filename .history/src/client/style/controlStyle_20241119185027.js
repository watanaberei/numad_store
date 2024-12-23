// amenitiesItemStyle.js
export const controls = `
.controls {
  display: flex;  /* Creates horizontal layout */
  justify-content: space-between;  /* Spaces prev/next buttons at edges */
  align-items: center;  /* Centers items vertically */
  padding: var(--s04) 0;  /* Adds vertical padding using design system variable */
  gap: 3px;
}
.control-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.carousel-controls {
  display: flex;
  align-items: center;
  gap: 0;  /* Remove gap between controls */
}
.control-button {
  padding: var(--s04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-dots {
  display: flex;
  gap: var(--s02);
}

.carousel-controls {
  z-index: 3;
}

.ellipse-indicator {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.pagination-dots .ellipse-indicator.active {
  background-color: var(--ink-primary-06);
}

.pagination-dots .ellipse-indicator {
  background-color: var(--ink-primary-06);
  opacity: 0.45;
}
`;

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
controlElement.textContent = controls + indicators;
document.head.appendChild(controlElement);