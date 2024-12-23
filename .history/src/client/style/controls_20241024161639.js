// amenitiesItemStyle.js

export const amenitiesItemStyle = `
  .amenities-item {
    display: flex;
    align-items: center;
    padding: var(--spacer-gap-s06) 0;
    // min-width: 450px;
    // max-width: 600px;
  }

  .impression-item {
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s02);
  }

  .dividerV {
    border-left: 1px solid var(--ink-shade-05);
    height: 100%;
    margin: 0 var(--spacer-gap-s07);
  }

  .controls {
    display: flex;
    gap: var(--spacer-gap-s07);
  }

  .impressions {
    display: flex;
    gap: var(--spacer-gap-s07);
  }
`;

const amenitiesItemStyleElement = document.createElement('style');
amenitiesItemStyleElement.textContent = amenitiesItemStyle;
document.head.appendChild(amenitiesItemStyleElement);