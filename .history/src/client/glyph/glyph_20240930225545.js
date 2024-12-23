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
        d="M11.0298 6.43994H9.96918L7.86298 8.54614L8.92364 9.6068L9.84654 8.6839L9.84654 11.9856H11.3465V8.87796L12.0754 9.6068L13.136 8.54614L11.1269 6.53697L11.0298 6.43994ZM7.72998 10.7056V13.4756H13.27V10.7056H14.77V14.2256C14.77 14.6398 14.4342 14.9756 14.02 14.9756H6.97998C6.56577 14.9756 6.22998 14.6398 6.22998 14.2256V10.7056H7.72998Z"
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.0298 6.43994H9.96918L7.86298 8.54614L8.92364 9.6068L9.84654 8.6839L9.84654 11.9856H11.3465V8.87796L12.0754 9.6068L13.136 8.54614L11.1269 6.53697L11.0298 6.43994ZM7.72998 10.7056V13.4756H13.27V10.7056H14.77V14.2256C14.77 14.6398 14.4342 14.9756 14.02 14.9756H6.97998C6.56577 14.9756 6.22998 14.6398 6.22998 14.2256V10.7056H7.72998Z"
        fill="#3A3AFF"
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