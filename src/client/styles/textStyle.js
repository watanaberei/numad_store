export const textReveal = `
.text-component {
    background-color: var(--bg-white-03);
    outline: 1px solid var(--ink-shade-04);
}

.body-content {
    color: var(--ink-primary-01);
    // text-overflow: ellipsis;

  }
#text-reveal {
  overflow: hidden;
  padding-right: 150px;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
  
.body-content {
  transition: max-height 0.3s ease-out;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
  `;

const textStyle = document.createElement('style');
textStyle.textContent = textReveal ;
document.head.appendChild(textStyle);



