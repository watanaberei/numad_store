// glyph.js
export const glyphControl = `
<i class="glyph03 glyph glyph-control-share">
    <svg
    class="glyph-control"
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    >
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.0298 6.43994H9.96918L7.86298 8.54614L8.92364 9.6068L9.84654 8.6839L9.84654 11.9856H11.3465V8.87796L12.0754 9.6068L13.136 8.54614L11.1269 6.53697L11.0298 6.43994ZM7.72998 10.7056V13.4756H13.27V10.7056H14.77V14.2256C14.77 14.6398 14.4342 14.9756 14.02 14.9756H6.97998C6.56577 14.9756 6.22998 14.6398 6.22998 14.2256V10.7056H7.72998Z"
        fill="#3A3AFF"
    />
    </svg>
</i>
`;

export const glyphControlShare = `
<i class="glyph03 glyph glyph-control-share">
    <svg
    class="glyph-control-share"
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    >
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.0298 6.43994H9.96918L7.86298 8.54614L8.92364 9.6068L9.84654 8.6839L9.84654 11.9856H11.3465V8.87796L12.0754 9.6068L13.136 8.54614L11.1269 6.53697L11.0298 6.43994ZM7.72998 10.7056V13.4756H13.27V10.7056H14.77V14.2256C14.77 14.6398 14.4342 14.9756 14.02 14.9756H6.97998C6.56577 14.9756 6.22998 14.6398 6.22998 14.2256V10.7056H7.72998Z"
        fill="#3A3AFF"
    />
    </svg>
</i>
`;

export const glyphControlSave = `
<i class="glyph03 glyph glyph-control-save">
    <svg
    class="glyph-control-save"
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7.4506 6.44189C6.75544 6.5726 6.22949 7.18289 6.22949 7.91602V11.0295V13.3363V13.9382V14.9866H7.44471L7.72949 14.8327L10.4995 13.3363L13.2695 14.8327L13.5543 14.9866H14.7695V13.9382V13.3363V11.0295V7.91602C14.7695 7.18289 14.2435 6.5726 13.5484 6.44189H7.4506ZM9.78654 12.0166L7.72949 13.1278V11.0295V7.91602H10.4995H13.2695L13.2695 11.0295V13.1278L11.2124 12.0166H9.78654Z"
      fill="#3A3AFF"
    />
  </svg>
</i>
`;

export const glyphControlCheckin = `
<i class="glyph03 glyph glyph-control-checkin">
    <svg
    class="glyph-control-checkin"
    width="21"
    height="21"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.23047 7.18945H13.7705C14.1847 7.18945 14.5205 7.52524 14.5205 7.93945V13.4795C14.5205 13.8937 14.1847 14.2295 13.7705 14.2295H8.23047C7.81626 14.2295 7.48047 13.8937 7.48047 13.4795V7.93945C7.48047 7.52524 7.81625 7.18945 8.23047 7.18945Z"
      stroke="#3A3AFF"
      stroke-width="1.5"
    />
  </svg>
</i>
`;

const glyphControlElement = document.createElement('i');
glyphControlElement.textContent = glyphControl + glyphControlShare + glyphControlSave + glyphControlCheckin;
document.head.appendChild(glyphControlElement);

export const glyphLocationPin = `
<svg
    class="glyph glyph-map-pin-headline"
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
const glyphLocationPinElement = document.createElement('i');
glyphLocationPinElement.textContent = glyphLocationPin;
document.head.appendChild(glyphLocationPinElement);