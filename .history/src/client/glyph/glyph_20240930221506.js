export const glyphLocationPin = `
<svg
    class="icon-map-pin-headline"
    width="30"
    height="37"
    viewBox="0 0 30 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7.40166 16.495C7.40166 12.5404 10.6075 9.33452 14.5621 9.33452C18.5167 9.33452 21.7226 12.5404 21.7226 16.495C21.7226 18.0329 21.2409 19.4499 20.42 20.6143L20.3241 20.7597L14.5588 30.1014L8.74215 20.6765L8.66263 20.5547C7.86719 19.4019 7.40166 18.0071 7.40166 16.495ZM14.5621 3.63452C7.45948 3.63452 1.70166 9.39234 1.70166 16.495C1.70166 19.1723 2.52291 21.6663 3.92735 23.7281L11.7837 36.458H17.3339L25.1318 23.8228C26.5758 21.743 27.4226 19.2137 27.4226 16.495C27.4226 9.39234 21.6647 3.63452 14.5621 3.63452Z"
      fill="#212322"
    />
  </svg>
  `;
  // Apply hero styles to the document
const glyphLocationPinlement = document.glyphLocationPinlement('style');
glyphLocationPinlement.textContent = glyphLocationPin;
document.head.appendChild(glyphLocationPinlement);