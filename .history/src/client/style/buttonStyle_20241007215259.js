export const buttonMore = `

.button-more {
    color: var(--utility-functional-action);
    // font-weight: 500;
    cursor: pointer;
    width: fit-content;
  }
  
  .button-more svg {
    margin-right: var(--s01);
  }
  
  `;


  const buttonStyle = document.createElement(`style`);
  buttonStyle.textContent = buttonMore;
  document.head.appendChild(buttonStyle);
  