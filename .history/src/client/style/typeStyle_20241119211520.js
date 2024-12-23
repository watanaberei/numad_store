// typeStyle.js

export const textStyle = `
body {
    background-color: #fff;
    background-image: linear-gradient(transparent, transparent calc(30px - 1px), #dddddd30 1px);
    background-size: auto 30px; /* Adjust based on your calculated baseline height */
}

/* Adjust text classes to remove hardcoded styles */
.text02, .text03, .text04, .text05, .label {
    margin: 0;
    padding: 0;
    display: inline-block;
    vertical-align: baseline;
    font-family: inherit;  /* Inherit font-family, font-size, etc. dynamically */
}
`;



export const globalType = `
.text02 {
    /* color: var(--ink-primary-04); 
    position: relative;
    text-align: right; */
    font-family: var(--numad-text02m-font-family);
    font-size: var(--numad-text02m-font-size);
    font-weight: var(--numad-text02m-font-weight);
    line-height: var(--numad-text02m-line-height);
    letter-spacing: var(--numad-text02m-letter-spacing);
  }
.text03 {
    font-family: var(--numad-text03m-font-family);
    font-size: var(--numad-text03m-font-size);
    font-weight: var(--numad-text03m-font-weight);
    line-height: var(--numad-text03m-line-height);
    letter-spacing: var(--numad-text03m-letter-spacing);
}
.text04 {
    font-family: var(--numad-text04m-font-family);
    font-size: var(--numad-text04m-font-size);
    font-weight: var(--numad-text04m-font-weight);
    line-height: var(--numad-text04m-line-height);
    letter-spacing: var(--numad-text04m-letter-spacing);
}
.text05 {
    font-family: var(--numad-text05m-font-family);
    font-size: var(--numad-text05m-font-size);
    font-weight: var(--numad-text05m-font-weight);
    line-height: var(--numad-text05m-line-height);
    letter-spacing: var(--numad-text05m-letter-spacing);
}
.label {
    font-family: var(--numad-label-font-family);
    font-size: var(--numad-label-font-size);
    font-weight: var(--numad-label-font-weight);
    line-height: var(--numad-label-line-height);
    letter-spacing: var(--numad-label-letter-spacing);
  }
  .count {
    color: var(--ink-primary-03);
  }
  
  .count::before {
    content: '(';
  }
  
  .count::after {
    content: ')';
  }
`;



export const globalCopy = `
.sentance {
    display: flex !important;
    flex-direction: row !important;
    gap: var(--s04);
    place-items: center;
}
.sentance > div, .sentance > span, .sentance > i {
    height: 100%;
}



.word {
  display: flex !important;
  flex-direction: row !important;
  gap: var(--spacer-gap-s00) !important;
  place-items: center !important;
  width: fit-content !important;
}
.word > div, .word > span, .word > i {
  height: 100%; 
}

`;


export const numberStyle = `
.label {
    color: var(--bg-white-00, #ffffff);
    text-align: justified;
    font-family: var(
      --numad-text02m-font-family,
      "HelveticaNeue-Medium",
      sans-serif
    );
    font-size: var(--numad-text02m-font-size, 12px);
    line-height: var(--numad-text02m-line-height, 18px);
    letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
    font-weight: var(--numad-text02m-font-weight, 500);
    position: relative;
  }
  .count2 {
    opacity: 0.9;
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    height: 13px;
    position: relative;
  }
  .number-path {
    color: var(--bg-white-00, #ffffff);
    text-align: left;
    font-family: var(
      --numad-text02m-font-family,
      "HelveticaNeue-Medium",
      sans-serif
    );
    font-size: var(--numad-text02m-font-size, 12px);
    line-height: var(--numad-text02m-line-height, 18px);
    letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
    font-weight: var(--numad-text02m-font-weight, 500);
    position: absolute;
    left: 0px;
    top: 0px;
    width: 4px;
    height: 10.5px;
  }
  .count3 {
    color: var(--bg-white-00, #ffffff);
    text-align: left;
    font-family: var(
      --numad-text02m-font-family,
      "HelveticaNeue-Medium",
      sans-serif
    );
    font-size: var(--numad-text02m-font-size, 12px);
    line-height: var(--numad-text02m-line-height, 18px);
    letter-spacing: var(--numad-text02m-letter-spacing, 0.003em);
    font-weight: var(--numad-text02m-font-weight, 500);
    position: relative;
  }
  `;
 // Apply master styles to the document
const textStyleElement = document.createElement('style');
textStyleElement.textContent =  textStyle + numberStyle + globalType + globalCopy;
document.head.appendChild(textStyleElement);


// Function to calculate the power of a number (mimicking the SCSS 'pow' function)
function pow(val, exponent) {
    let result = 1;
    if (exponent > 0) {
        for (let i = 0; i < exponent; i++) {
            result *= val;
        }
    } else {
        for (let i = exponent; i < 0; i++) {
            result /= val;
        }
    }
    return result;
}

// Function to calculate the font size based on scale and base font size
function calculateFontSize(scaleIndex, baseFontSize, fontScale) {
    return Math.round(pow(fontScale, scaleIndex) * baseFontSize);
}

// Function to calculate the line height based on the font size and the base line height
function calculateLineHeight(fontSize, lineHeightMultiplier) {
    return Math.round(fontSize * lineHeightMultiplier);
}

// Apply the baseline adjustments to elements based on their scale index
function applyBaselineAdjustment(elements, scaleIndex, baseFontSize, fontScale, baseLineHeight) {
    elements.forEach(el => {
        const fontSize = calculateFontSize(scaleIndex, baseFontSize, fontScale);
        const lineHeight = calculateLineHeight(fontSize, baseLineHeight);
        
        el.style.fontSize = `${fontSize}px`;
        el.style.lineHeight = `${lineHeight / fontSize}`;
    });
}

// Baseline grid setup (to be run after DOM content has loaded)
document.addEventListener('DOMContentLoaded', function () {
    const baseFontSize = 3;  // Base font size (e.g., 20px)
    const baseLineHeight = .75;  // Base line height multiplier
    const fontScale = 2;  // Font scale ratio (Golden Ratio)

    // Example applying to specific classes
    const label = document.querySelectorAll('.label');
    const text01 = document.querySelectorAll('.text01');
    const text02 = document.querySelectorAll('.text02');
    const text03 = document.querySelectorAll('.text03');
    const text04 = document.querySelectorAll('.text04');
    const text05 = document.querySelectorAll('.text05');

    // Apply baseline alignment based on scale
    applyBaselineAdjustment(label, 0, baseFontSize, fontScale, baseLineHeight);
    applyBaselineAdjustment(text01, 1, baseFontSize, fontScale, baseLineHeight);
    applyBaselineAdjustment(text02, 0, baseFontSize, fontScale, baseLineHeight);
    applyBaselineAdjustment(text03, 1, baseFontSize, fontScale, baseLineHeight);
    applyBaselineAdjustment(text04, 2, baseFontSize, fontScale, baseLineHeight);
    applyBaselineAdjustment(text05, 3, baseFontSize, fontScale, baseLineHeight);
});