export const accordion = `
.accordion {
  display: flex;
  flex-direction: column;
  gap: var(--spacer-gap-s05);
}
`;

// Apply hero styles to the document
const accordionStyle = document.createElement("style");
accordionStyle.textContent = accordion;
document.head.appendChild(accordionStyle);