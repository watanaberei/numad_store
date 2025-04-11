export const accordion = `
.accordion {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionInteraction = `
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacer-gap-s05);
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.accordion-header .button2 {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.accordion-header .button2 svg {
  width: 10px;
  height: 7px;
}

.accordion-header.active .button2 {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0 var(--spacer-gap-s05);
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 0;
  opacity: 0;
}

.accordion-content:not([hidden]) {
  max-height: 500px;
  opacity: 1;
  padding: var(--spacer-gap-s05);
}

.accordion-content[hidden] {
  display: none;
}
`;

export const accordionContainer = `
.accordion-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--border-radius-04);
  background: var(--bg-white-06);
}
`;

export const accordionSection = `
.accordion-section {
  width: 100%;
  border-bottom: 1px solid var(--border-color-03);
}

.accordion-section:last-child {
  border-bottom: none;
}
`;

export const accordionItem = `
.accordion-item {
  padding: var(--spacer-gap-s05);
}
`;

export const accordionHeader = `
.accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacer-gap-s05);
}

.accordion-header .label {
  font-weight: 600;
  color: var(--text-color-primary);
}
`;

export const accordionTitle = `
.accordion-section .title {
  width: 100%;
}
`;

export const accordionContent = `
.accordion-content {
  width: 100%;
  color: var(--text-color-secondary);
}
`;

// Apply hero styles to the document
const accordionStyle = document.createElement("style");
accordionStyle.textContent = accordion + accordionContainer + accordionSection + accordionItem + accordionHeader + accordionContent + accordionTitle;
document.head.appendChild(accordionStyle);