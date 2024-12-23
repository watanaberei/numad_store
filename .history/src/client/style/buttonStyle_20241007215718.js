export const button =`
button, input[type="submit"], input[type="reset"] {
	background: none;
	color: inherit;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
	outline: inherit;
}
`;

export const buttonMore = `

.button-more {
    color: var(--utility-functional-action);
    // font-weight: 500;
    cursor: pointer;
    width: fit-content;
    display: flex !important;
    flex-direction: row !important;
    height: 100%;
    width: 100%;
    align-items: baseline;
    align-self: center;
  }
  
  .button-more svg {
    margin-right: var(--s01);
  }
  
  `;


  const buttonStyle = document.createElement(`style`);
  buttonStyle.textContent = buttonMore + button;
  document.head.appendChild(buttonStyle);
  