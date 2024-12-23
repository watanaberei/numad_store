
export const title = `
.title {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  width: 100%;
}

.title .sentance {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s04, 6px);
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}
  `;










  export const titleStyle = `
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .primary {
    flex: 1;
  }

  .category {
    background: var(--ink-shade-03);
    border-radius: var(--spacer-gap-s02);
    padding: 5px 6px;
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s05);
    cursor: pointer;
    border: none;
  }

  .span {
    color: var(--ink-black-03);
    font-family: var(--font-family-helvetica);
    font-size: 15px;
    line-height: 26px;
    letter-spacing: -0.015em;
    font-weight: 500;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .secondary {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pagination {
    background: var(--ink-primary-03);
    border-radius: var(--spacer-gap-s07);
    padding: 0 var(--spacer-gap-s07);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 54px;
    height: 30px;
  }

  .pagination2 {
    display: flex;
    gap: var(--spacer-gap-s02);
  }

  .ellipse {
    background: var(--ink-shade-03);
    border-radius: 50%;
    width: 6px;
    height: 6px;
  }

  .ellipse.inactive {
    opacity: 0.45;
  }

  .controls {
    display: flex;
    gap: var(--spacer-gap-s04);
  }

  .icon {
    background: var(--ink-primary-03);
    border-radius: 30px;
    padding: var(--spacer-gap-s05);
    cursor: pointer;
    border: none;
  }
`;

export const cardGalleryStyle = `
  .card-category {
    ${cardCategory}
    background: var(--utility-functional-tag);
    padding: var(--spacer-gap-s02);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .primary {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .pill {
    background: var(--ink-primary-06);
    border-radius: var(--spacer-gap-s07);
    padding: var(--spacer-gap-s01) var(--spacer-gap-s04);
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s05);
  }

  .pill-text {
    color: var(--bg-white-00);
    font-family: var(--numad-text02m-font-family);
    font-size: var(--numad-text02m-font-size);
    line-height: var(--numad-text02m-line-height);
    font-weight: var(--numad-text02m-font-weight);
  }

  .badge {
    background: var(--ink-shade-03);
    border-radius: 15px;
    padding: var(--spacer-gap-s01) var(--spacer-gap-s04);
    width: 21px;
    height: 21px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tertiary {
    ${cardCollection}
  }

  .indicator {
    display: flex;
    gap: 3px;
  }

  .indicator-dot {
    background: var(--ink-primary-06);
    border-radius: 50%;
    width: 6px;
    height: 6px;
  }

  .indicator-dot.inactive {
    opacity: 0.45;
  }

  .secondary {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .comment {
    background: var(--ink-shade-03);
    border-radius: 10.5px;
    padding: var(--spacer-gap-s01) var(--spacer-gap-s04);
    display: flex;
    align-items: center;
    gap: var(--spacer-gap-s02);
    max-width: 243.75px;
  }

  .comment-text {
    color: var(--ink-primary-02);
    font-family: var(--numad-text02m-font-family);
    font-size: var(--numad-text02m-font-size);
    line-height: var(--numad-text02m-line-height);
    font-weight: var(--numad-text02m-font-weight);
    max-width: 215.75px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// Apply master styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = style + titleStyle + cardGalleryStyle;
document.head.appendChild(styleElement);







  // Apply hero styles to the document
  const titleStyle = document.createElement('style');
  titleStyle.textContent = title ;
  document.head.appendChild(titleStyle);
  
