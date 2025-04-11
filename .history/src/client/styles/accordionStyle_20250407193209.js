export const accordion = `
.accordion {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionInteraction =`
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacer-gap-s05);
  border: none;
  background: none;
  cursor: pointer;
}

.accordion-header.active .icon-chevron {
  transform: rotate(180deg);
}

.accordion-content {
  padding: var(--spacer-gap-s05);
  overflow: hidden;
  transition: height 0.3s ease-out;
}

.accordion-content[hidden] {
  display: none;
}
`;

export const accordionContainer = `
.accordion-container {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionSection = `
.accordion-section {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionItem = `
.accordion-item {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionHeader = `
.accordion-header {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionTitle = `
.accordion-title {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

export const accordionContent = `
.accordion-content {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

// Apply hero styles to the document
const accordionStyle = document.createElement("style");
accordionStyle.textContent = accordion + accordionContainer + accordionSection + accordionItem + accordionHeader + accordionContent + accordionTitle;
document.head.appendChild(accordionStyle);