// amenitiesItemStyle.js
export const controls = `
.controls {
  display: flex;  /* Creates horizontal layout */
  // justify-content: space-between;  /* Spaces prev/next buttons at edges */
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


.carousel-controls {
  z-index: 3;
}

.pagination-dot {
  display: flex;
  flex-direction: row  ;
  gap: var(--s02);
}

.ellipse-indicator {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  transition: opacity 0.3s ease;
  cursor: pointer;
  background-color: white !important;
}

.pagination-dot .ellipse-indicator.active {
  background-color: var(--ink-primary-06);
  opacity: 1;
}

.pagination-dot .ellipse-indicator {
  background-color: var(--ink-primary-06);
  opacity: 0.45;
}
`;

export const controlIndicators = `
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


export const controlTimeline = `
.timeline-nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeline-status {
  display: flex;
  align-items: center;
  gap: var(--spacer-gap-s04, 6px);
  padding: 0 var(--spacer-gap-s05, 9px);
}

.hour-label {
  font-size: var(--numad-text02m-font-size, 12px);
  color: var(--ink-black-03, #272727);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.timeline-slot:hover .hour-label {
  opacity: 1;
}
`
const controlElement = document.createElement('style');
controlElement.textContent = controls + controlIndicators + controlTimeline;
document.head.appendChild(controlElement);