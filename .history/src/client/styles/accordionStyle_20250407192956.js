export const accordion = `
.accordion {
  display: grid;
  grid-direction: column;
  gap: var(--spacer-gap-s05);
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

export const accordionContent = `
.accordion-content {
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
// Apply hero styles to the document
const accordionStyle = document.createElement("style");
accordionStyle.textContent = accordion + accordionContainer + accordionSection + accordionItem + accordionHeader + accordionContent + accordionTitles;
document.head.appendChild(accordionStyle);