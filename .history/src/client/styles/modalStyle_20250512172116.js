export const inputStyle = `
 .modal {
      display: none !important;
      width: 100vw;
      height: 100vh;
      position: absolute !important;

      z-index: 1000;
      left: 0;
      top: 0;
      overflow: auto;
      background: rgba(0,0,0,0.75); /* semi-transparent background */
    }
    .modal.show {
        display: block !important;
    }

    .modal-content {
    background-color: var(--bg-white-00, #ffffff);
    width: 100%;
    height: 100%;
    }
`;


export const fieldStyle = `
.overlay-gallery,
.overlay-gallery * {
  box-sizing: border-box;
}
.overlay-gallery {
  background: var(--ink-primary-black-06, #101011);
  border-radius: 45px;
  padding: 0px 157px 0px 157px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  height: 960px;
  position: relative;
  overflow: hidden;
}
.overlay-gallery2 {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  width: 1126px;
  height: 120px;
  position: relative;
}
.s {
  background: rgba(255, 71, 71, 0.15);
  opacity: 0;
  padding: 14px 11px 14px 11px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--ratio-spacer-s10, 30px);
  height: var(--ratio-spacer-s10, 30px);
  position: relative;
  overflow: hidden;
}
._30 {
  color: var(--utility-functional-red, #ff4747);
  text-align: center;
  font-family: var(
    --spec-measurement-font-family,
    "HelveticaNeue-Regular",
    sans-serif
  );
  font-size: var(--spec-measurement-font-size, 3px);
  line-height: var(--spec-measurement-line-height, 3px);
  letter-spacing: var(--spec-measurement-letter-spacing, 0.003em);
  font-weight: var(--spec-measurement-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.bread-crumb {
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}
.bread-crumb-item {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.title {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: var(
    --numad-text06m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text06m-font-size, 51px);
  line-height: var(--numad-text06m-line-height, 57px);
  letter-spacing: var(--numad-text06m-letter-spacing, -0.03em);
  font-weight: var(--numad-text06m-font-weight, 500);
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.divider {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.div {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: var(
    --numad-text06m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text06m-font-size, 51px);
  line-height: var(--numad-text06m-line-height, 57px);
  letter-spacing: var(--numad-text06m-letter-spacing, -0.03em);
  font-weight: var(--numad-text06m-font-weight, 500);
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.spaces {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: var(
    --numad-text06m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text06m-font-size, 51px);
  line-height: var(--numad-text06m-line-height, 57px);
  letter-spacing: var(--numad-text06m-letter-spacing, -0.03em);
  font-weight: var(--numad-text06m-font-weight, 500);
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.divider2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 31px;
  position: relative;
}
.outside-patio {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: left;
  font-family: var(
    --numad-text06m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text06m-font-size, 51px);
  line-height: var(--numad-text06m-line-height, 57px);
  letter-spacing: var(--numad-text06m-letter-spacing, -0.03em);
  font-weight: var(--numad-text06m-font-weight, 500);
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.close {
  border-radius: 333px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  position: relative;
  overflow: visible;
}
.modal {
  background: var(--bg-white-00, #ffffff);
  border-radius: var(--ratio-spacer-s10, 30px);
  padding: 0px 15px 0px 15px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 787px;
  position: relative;
  overflow-y: auto;
}
.footer {
  padding: 0px var(--ratio-spacer-s00, 0px) 15px var(--ratio-spacer-s00, 0px);
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s07, 15px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.tag {
  display: flex;
  flex-direction: row;
  gap: var(--ratio-spacer-s02, 3px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.frame-1321322379 {
  background: var(--ink-primary-black-04, #212322);
  border-radius: var(--ratio-spacer-s02, 3px);
  padding: var(--ratio-spacer-s04, 6px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.cerritos {
  color: #4865ff;
  text-align: right;
  font-family: var(
    --numad-text03b-font-family,
    "HelveticaNeue-Bold",
    sans-serif
  );
  font-size: var(--numad-text03b-font-size, 15px);
  line-height: var(--numad-text03b-line-height, 26px);
  letter-spacing: var(--numad-text03b-letter-spacing, -0.015em);
  font-weight: var(--numad-text03b-font-weight, 700);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.div2 {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: right;
  font-family: var(
    --numad-text03m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text03m-font-size, 15px);
  line-height: var(--numad-text03m-line-height, 26px);
  letter-spacing: var(--numad-text03m-letter-spacing, -0.015em);
  font-weight: var(--numad-text03m-font-weight, 500);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.place {
  color: var(--ink-shade-03, #f2f4f5);
  text-align: right;
  font-family: var(
    --numad-text03m-font-family,
    "HelveticaNeue-Medium",
    sans-serif
  );
  font-size: var(--numad-text03m-font-size, 15px);
  line-height: var(--numad-text03m-line-height, 26px);
  letter-spacing: var(--numad-text03m-letter-spacing, -0.015em);
  font-weight: var(--numad-text03m-font-weight, 500);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

`;


  // Apply hero styles to the document
  const input = document.createElement('style');
  input.textContent = inputStyle + fieldStyle;
  document.head.appendChild(input);
