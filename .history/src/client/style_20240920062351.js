// style.js

export const masterStyle = `
:root {
  --ink-primary-02: #212322;
  --ink-primary-03: #27272a;
  --ink-primary-04: #212322;
  --ink-shade-03: #f2f4f5;
  --ink-shade-05: #e5ebee;
  --ink-grey-grey: #a0a0a0;
  --utility-functional-action: #3a3aff;
  --utility-functional-linkvisited: #00019a;
  --utility-functional-red: #ff4747;
  --utility-functional-tag: #9747ff;
  --bg-white-03: #fbfbff;
  --spacer-gap-s01: 1.5px;
  --spacer-gap-s02: 3px;
  --spacer-gap-s04: 6px;
  --spacer-gap-s05: 9px;
  --spacer-gap-s06: 12px;
  --spacer-gap-s07: 15px;
  --numad-text01r-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text01r-font-size: 10px;
  --numad-text01r-line-height: normal;
  --numad-text01r-font-weight: 500;
  --numad-text01r-font-style: normal;
  --numad-text01m-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text01m-font-size: 10px;
  --numad-text01m-line-height: normal;
  --numad-text01m-font-weight: 700;
  --numad-text01m-font-style: normal;
  --numad-text01b-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text01b-font-size: 10px;
  --numad-text01b-line-height: normal;
  --numad-text01b-font-weight: 400;
  --numad-text01b-font-style: normal;
  --numad-text02r-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text02r-font-size: 12px;
  --numad-text02r-line-height: 18px;
  --numad-text02r-font-weight: 400;
  --numad-text02r-font-style: normal;
  --numad-text02m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text02m-font-size: 12px;
  --numad-text02m-line-height: 18px;
  --numad-text02m-font-weight: 500;
  --numad-text02m-font-style: normal;
  --numad-text02m-letter-spacing: 0.003em;
  --numad-text02b-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text02b-font-size: 12px;
  --numad-text02b-line-height: 18px;
  --numad-text02b-font-weight: 700;
  --numad-text02b-font-style: normal;
  --numad-text03r-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text03r-font-size: 15px;
  --numad-text03r-line-height: 26px;
  --numad-text03r-font-weight: 400;
  --numad-text03r-font-style: normal;
  --numad-text03m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text03m-font-size: 15px;
  --numad-text03m-line-height: 26px;
  --numad-text03m-font-weight: 500;
  --numad-text03m-font-style: normal;
  --numad-text03b-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text03b-font-size: 15px;
  --numad-text03b-line-height: 26px;
  --numad-text03b-font-weight: 700;
  --numad-text03b-font-style: normal;
  --numad-text04r-font-family: HelveticaNeue-Regular, sans-serif;
  --numad-text04r-font-size: 20px;
  --numad-text04r-line-height: 26px;
  --numad-text04r-font-weight: 400;
  --numad-text04r-font-style: normal;
  --numad-text04m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text04m-font-size: 20px;
  --numad-text04m-line-height: 27.5px;
  --numad-text04m-font-weight: 500;
  --numad-text04m-font-style: normal;
  --numad-text04b-font-family: HelveticaNeue-Bold, sans-serif;
  --numad-text04b-font-size: 20px;
  --numad-text04b-line-height: 30px;
  --numad-text04b-font-weight: 700;
  --numad-text04b-font-style: normal;
  --numad-text05m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text05m-font-size: 45px;
  --numad-text05m-line-height: 45px;
  --numad-text05m-font-weight: 500;
  --numad-text05m-font-style: normal;
  --numad-text06m-font-family: HelveticaNeue-Medium, sans-serif;
  --numad-text06m-font-size: 51px;
  --numad-text06m-line-height: 57px;
  --numad-text06m-font-weight: 500;
  --numad-text06m-font-style: normal;
  --spec-measurement-font-family: HelveticaNeue-Regular, sans-serif;
  --spec-measurement-font-size: 3px;
  --spec-measurement-line-height: 3px;
  --spec-measurement-font-weight: 400;
  --spec-measurement-font-style: normal;
  --blur01-backdrop-filter: blur(7.5px);
  --shadow-box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3),
    0px 6px 9px 0px rgba(0, 0, 0, 0.09);
  --display-box-shadow: 0px 4px 9px 0px rgba(0, 0, 0, 0.25);
  --shadowcards-box-shadow: 0px 3px 1px 0px rgba(0, 0, 0, 0.15),
    0px 1.5px 1.5px 0px rgba(0, 0, 0, 0.06),
    0.01px 1.06px 1.12px 0px rgba(163, 163, 163, 0.35);
  --aspect-ratio-2x2: 2/2;
  --aspect-ratio-3x2: 3/2;
  --aspect-ratio-4x2: 4/2;
  --aspect-ratio-5x2: 5/2;
  --aspect-ratio-6x2: 6/2;
}

body {
  font-family: var(--numad-text02m-font-family);
  font-size: var(--numad-text02m-font-size);
  line-height: var(--numad-text02m-line-height);
  color: var(--ink-primary-02);
}

.amenities-item {
  display: flex;
  align-items: center;
  padding: var(--spacer-gap-s06) 0;
  min-width: 450px;
  max-width: 600px;
}

.amenity-tag {
  display: flex;
  align-items: center;
  background: var(--ink-shade-03);
  border: 1px solid var(--ink-shade-05);
  border-radius: 3px;
  padding: 3px;
  margin-right: var(--spacer-gap-s04);
}

.amenity-tag svg {
  margin-right: 3px;
}

.amenity-tag button {
  background: none;
  border: none;
  color: var(--utility-functional-linkvisited);
  font-weight: 500;
  cursor: pointer;
}

.attributes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.attribute {
  display: flex;
  align-items: center;
  border: 1px solid var(--ink-shade-05);
  border-radius: 1.5px;
  padding: 3px var(--spacer-gap-s01);
  margin-right: var(--spacer-gap-s02);
}

.attribute-name {
  margin-right: var(--spacer-gap-s01);
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

.separator {
  color: var(--ink-grey-grey);
  margin: 0 var(--spacer-gap-s02);
}

.more {
  color: var(--utility-functional-action);
  font-weight: 500;
  cursor: pointer;
}

.more svg {
  margin-right: var(--spacer-gap-s01);
}

.card-sub-store,
.card-sub-store * {
  box-sizing: border-box;
}

.card-sub-store {
  background: var(--bg-white-03);
  border-radius: var(--spacer-gap-s05);
  border: 1px solid var(--ink-shade-05);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 130.5px;
  height: 130.5px;
  min-width: 130.5px;
  position: relative;
  overflow: hidden;
}

.content {
  padding: var(--spacer-gap-s05);
  display: flex;
  flex-direction: column;
  gap: var(--spacer-gap-s07);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex: 1;
  position: relative;
}

.label {
  display: flex;
  flex-direction: row;
  gap: var(--spacer-gap-s01);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}

.icon {
  background: var(--utility-functional-red);
  display: flex;
  flex-direction: row;
  gap: 4.5px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 6.4px;
  height: 9px;
  position: relative;
}

.distance {
  display: flex;
  flex-direction: row;
  gap: 0;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}

._0-3 {
  color: var(--ink-primary-04);
  text-align: right;
  font-family: var(--numad-text02m-font-family);
  font-size: var(--numad-text02m-font-size);
  line-height: var(--numad-text02m-line-height);
  letter-spacing: var(--numad-text02m-letter-spacing);
  font-weight: var(--numad-text02m-font-weight);
  position: relative;
}

.unit {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.m {
  color: var(--ink-primary-04);
  text-align: right;
  font-family: var(--numad-text02m-font-family);
  font-size: var(--numad-text02m-font-size);
  line-height: var(--numad-text02m-line-height);
  letter-spacing: -0.03em;
  font-weight: var(--numad-text02m-font-weight);
  position: relative;
}

.image {
  background: var(--utility-functional-tag);
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  max-width: 216px;
  position: relative;
  mix-blend-mode: multiply;
}

.name {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}

.bcd-tofu-house {
  color: var(--ink-primary-04);
  text-align: left;
  font-family: var(--numad-text02m-font-family);
  font-size: var(--numad-text02m-font-size);
  line-height: var(--numad-text02m-line-height);
  letter-spacing: var(--numad-text02m-letter-spacing);
  font-weight: var(--numad-text02m-font-weight);
  position: relative;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
`;

// Apply master styles to the document
const masterStyleElement = document.createElement('style');
masterStyleElement.textContent = masterStyle;
document.head.appendChild(masterStyleElement);