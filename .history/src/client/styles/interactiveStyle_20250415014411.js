export const interactive = `
.interactive {
    display: grid;
}
`;

export const impression =`
  /* User impression container */
  #userImpression {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    transition: opacity 0.3s ease;
  }

  #userImpression.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  /* Impression buttons */
  .impression-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: #f5f5f5;
    cursor: pointer;
    opacity: 1;
    transition: all 0.2s ease;
  }

  .impression-button:hover:not(.disabled) {
    background: #e5e5e5;
  }

  .impression-button.active {
    background: #e2f1ff;
    border-color: #3498db;
  }

  .impression-button.like.active svg {
    fill: #3498db;
  }

  .impression-button.dislike.active svg {
    fill: #e74c3c;
  }

  .impression-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Check-in button styles */
  #storeControls-checkin {
    position: relative;
  }

  #storeControls-checkin.checked-in {
    background: #e2f1ff;
    border-color: #3498db;
  }

  #storeControls-checkin.checked-in span {
    color: #3498db;
  }

  #storeControls-checkin.checked-in svg {
    fill: #3498db;
  }
`

// export const impression = `
// /* User impression container */
// #userImpression {
//     display: flex;
//     gap: 10px;
//     margin-top: 10px;
//     transition: opacity 0.3s ease;
//   }
  
//   #userImpression.disabled {
//     opacity: 0.5;
//     pointer-events: none;
//   }
  
//   /* Impression buttons */
//   .impression-button {
//     display: flex;
//     align-items: center;
//     gap: 5px;
//     padding: 6px 12px;
//     border-radius: 4px;
//     border: 1px solid #ccc;
//     background: #f5f5f5;
//     cursor: pointer;
//     transition: all 0.2s ease;
//   }
  
//   .impression-button:hover:not(.disabled) {
//     background: #e5e5e5;
//   }
  
//   .impression-button.active {
//     background: #e2f1ff;
//     border-color: #3498db;
//   }
  
//   .impression-button.like.active svg {
//     fill: #3498db;
//   }
  
//   .impression-button.dislike.active svg {
//     fill: #e74c3c;
//   }
  
//   .impression-button.disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//   }
  
//   /* Check-in button styles */
//   #storeControls-checkin {
//     position: relative;
//   }
  
//   #storeControls-checkin.checked-in {
//     background: #e2f1ff;
//     border-color: #3498db;
//   }
  
//   #storeControls-checkin.checked-in span {
//     color: #3498db;
//   }
  
//   #storeControls-checkin.checked-in svg {
//     fill: #3498db;
//   }
// }`;
// Apply hero styles to the document

const interactiveStyle = document.createElement("style");
interactiveStyle.textContent = interactive + impression;
document.head.appendChild(interactiveStyle);