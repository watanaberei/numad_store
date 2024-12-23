export const textReveal = `
.text-component {
    background-color: var(--bg-white-03);
    outline: 1px solid var(--ink-shade-04);
}

.body-content {
    color: var(--ink-primary-01);
    text-overflow: ellipsis;

  }
#text-reveal {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
  `;

const textStyle = document.createElement('style');
textStyle.textContent = textReveal ;
document.head.appendChild(textStyle);



