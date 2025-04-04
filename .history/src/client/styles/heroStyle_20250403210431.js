// heroStyle.js

export const heroStyle = `
  .hero { 
    // padding: var(--spacer-gap-s09) var(--spacer-gap-s07);
    padding: 0px !important;
    margin: 0px !important;
    background-color: var(--bg-white-00);
  }
  .hero-container {
    display: grid;
    gap: var(--s07);
  }

  .hero-detail {
    display: flex;
    flex-direction: column;
    gap: var(--s04);
    align-items: center;
  }

  .hero-primary {
    display: flex;
    gap: var(--s04);
  }

  .hero-secondary {
    display: flex;
    gap: var(--s04);
  }

  .hero-controls {
    display: flex;
    justify-content: flex-end;
    gap: var(--s04);
  }

  .user-action {
    display: flex;
    align-items: center;
    gap: var(--s02);
    background: var(--ink-shade-03);
    border: none;
    border-radius: var(--s02);
    padding: var(--s02) var(--s04);
    cursor: pointer;
  }

  .hero-gallery {
    display: grid;
    aspect-ratio: var(--aspect-ratio-5x2);
    // grid-template-columns: 3fr 2fr;
    gap: var(--s02);
    /* height: 560px; */
  }

  .gallery-image {
    background-size: cover;
    background-position: center;
    grid-row: 1 / -1;
    max-width: 100%;
    background-color: orange;
  }

  .hero-title {
    display: flex;
    flex-direction: column;
  }

  .store-name {
    font-size: var(--numad-text06m-font-size);
    line-height: var(--numad-text06m-line-height);
    font-weight: var(--numad-text06m-font-weight);
  }

  .store-city {
    font-size: var(--numad-text06m-font-size);
    line-height: var(--numad-text06m-line-height);
    font-weight: var(--numad-text06m-font-weight);
    color: var(--ink-grey-05);
  }

  .hero-distance {
    color: var(--ink-primary-03);
    display: flex;
    align-self: flex-end;
    align-item: flex-end;
    justify-content: flex-end;
    gap: var(--s02);
  }

  .hero-status {
    grid-column: 1 / -1;
    color: var(--neumad06-ink-primary-01) !important;
    background: var(--ink-primary-03);
    border-radius: 15px;
    padding: var(--s02) var(--s04);
    justify-self: start;
  }
`;

// Apply hero styles to the document
const heroStyleElement = document.createElement('style');
heroStyleElement.textContent = heroStyle;
document.head.appendChild(heroStyleElement);