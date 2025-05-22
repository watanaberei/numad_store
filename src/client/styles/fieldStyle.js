export const inputStyle = `
 input {
      all: unset;
    }
`;


export const fieldStyle = `
.form-field,
.form-field * {
  box-sizing: border-box;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
}
.field {
  background: #fafafa;
  border-radius: 30px;
  padding: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.input {
  color: var(--ink-black-03, #272727);
  text-align: left;
  font-family: var(
    --numad-text04m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text04m-font-size, 20px);
  line-height: var(--numad-text04m-line-height, 24px);
  letter-spacing: var(--numad-text04m-letter-spacing, -0.018000000000000002em);
  font-weight: var(--numad-text04m-font-weight, 500);
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.controls {
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.button {
  background: var(--ink-shade-03, #f2f4f5);
  border-radius: var(--ratio-spacer-s07, 15px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s04, 6px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.label {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.areas {
  color: var(--ink-primary-black-06, #101011);
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 12px;
  line-height: 21px;
  letter-spacing: 0.003em;
  font-weight: 500;
  position: relative;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.icon {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  height: auto;
  position: relative;
  overflow: visible;
}
.label2 {
  padding: 0px 30px 0px 30px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.text {
  color: var(--ink-primary-black-03, #27272a);
  text-align: left;
  font-family: "HelveticaNeue-Bold", sans-serif;
  font-size: 12px;
  line-height: 11px;
  letter-spacing: 0.003em;
  font-weight: 700;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

`;


  // Apply hero styles to the document
  const input = document.createElement('style');
  input.textContent = inputStyle + fieldStyle;
  document.head.appendChild(input);
