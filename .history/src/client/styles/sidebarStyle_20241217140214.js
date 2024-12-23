// amenitiesItemStyle.js

export const amenitiesItemStyle = `
  .store-details,
  .store-details * {
    box-sizing: border-box;
  }
  .store-details .store-details {
    background: var(--bg-white-00, #ffffff);
    border-radius: var(--spacer-gap-s06, 12px);
    border-style: solid;
    border-color: transparent;
    border-width: 1px;
    padding: var(--spacer-gap-s06, 12px);
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    width: 270px;
    position: relative;
  }
  .store-details .header {
    padding: var(--spacer-gap-s05, 9px) 0px var(--spacer-gap-s05, 9px) 0px;
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .text {
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    position: relative;
  }
  .store-details .smoking-tiger-bread-factory {
    color: var(--ink-black-03, #272727);
    text-align: left;
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
    -webkit-text-stroke: 2px transparent;
  }
  .store-details .icon-action-options {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    position: relative;
  }
  .store-details .options {
    display: flex;
    flex-direction: column;
    gap: 3px;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .store-details .ellipse-351 {
    background: var(--ink-primary-black-01, #373a42);
    border-radius: 50%;
    flex-shrink: 0;
    width: 3px;
    height: 3px;
    position: relative;
  }
  .store-details .ellipse-352 {
    background: var(--ink-primary-black-01, #373a42);
    border-radius: 50%;
    flex-shrink: 0;
    width: 3px;
    height: 3px;
    position: relative;
  }
  .store-details .ellipse-353 {
    background: var(--ink-primary-black-01, #373a42);
    border-radius: 50%;
    flex-shrink: 0;
    width: 3px;
    height: 3px;
    position: relative;
  }
  .store-details .media {
    padding: var(--spacer-gap-s05, 9px) 0px var(--spacer-gap-s05, 9px) 0px;
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .media-container {
    background: var(--bg-white-04, #f8fafa);
    border-radius: 9px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .img {
    background: linear-gradient(
      to left,
      rgba(151, 71, 255, 0),
      rgba(151, 71, 255, 0)
    );
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  .store-details .frame-24797 {
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    position: relative;
  }
  .store-details .aspect-ratio {
    border-style: solid;
    border-color: rgba(151, 71, 255, 0);
    border-width: 0.15px;
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: center;
    justify-content: center;
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .store-details .aspect-ratio-lock-30 {
    border-style: solid;
    border-color: rgba(151, 71, 255, 0);
    border-width: 1px;
    align-self: stretch;
    flex-shrink: 0;
    height: 0px;
    position: relative;
    transform-origin: 0 0;
    transform: rotate(-30deg) scale(1, 1);
  }
  .store-details .actions {
    padding: var(--spacer-gap-s05, 9px) var(--spacer-gap-s00, 0px)
      var(--spacer-gap-s05, 9px) var(--spacer-gap-s00, 0px);
    display: grid !important;
    grid-template-columns: 1fr;
    flex-direction: column;
    gap: var(--spacer-gap-s06, 12px);
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .button {
    border-radius: 30px;
    border-style: solid;
    border-color: var(--ink-black-03, #272727);
    border-width: 1px;
    padding: var(--s01, 12px) 24px var(--s01, 12px) 24px;
    display: flex;
    flex-direction: row;
    gap: var(--s00, 3px);
    align-items: flex-end;
    justify-content: center;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .span {
    flex-shrink: 0;
    width: 84px;
    height: 18px;
    position: static;
  }
  .store-details .send-to-phone {
    color: var(--ink-black-03, #272727);
    text-align: left;
    font-family: var(--text02-b-font-family, "HelveticaNeue-Bold", sans-serif);
    font-size: var(--text02-b-font-size, 12px);
    line-height: var(--text02-b-line-height, 18px);
    letter-spacing: var(--text02-b-letter-spacing, 0.003em);
    font-weight: var(--text02-b-font-weight, 700);
    position: absolute;
    left: 81px;
    top: 12px;
  }
  .store-details .span2 {
    flex-shrink: 0;
    width: 78px;
    height: 18px;
    position: static;
  }
  .store-details .call-business {
    color: var(--ink-black-03, #272727);
    text-align: left;
    font-family: var(--text02-b-font-family, "HelveticaNeue-Bold", sans-serif);
    font-size: var(--text02-b-font-size, 12px);
    line-height: var(--text02-b-line-height, 18px);
    letter-spacing: var(--text02-b-letter-spacing, 0.003em);
    font-weight: var(--text02-b-font-weight, 700);
    position: absolute;
    left: 84px;
    top: 12px;
  }
  .store-details .divider-component {
    padding: var(--spacer-gap-s05, 9px) var(--spacer-gap-s00, 0px)
      var(--spacer-gap-s05, 9px) var(--spacer-gap-s00, 0px);
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .rule-h {
    background: var(--bg-white-02, #e1ecf4);
    flex-shrink: 0;
    width: 246px;
    height: 1px;
    position: relative;
  }
  .store-details .info {
    padding: var(--spacer-gap-s05, 9px) var(--spacer-gap-s00, 0px)
      var(--spacer-gap-s05, 9px) var(--spacer-gap-s00, 0px);
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .facility {
    padding: var(--spacer-gap-s05, 9px) 0px var(--spacer-gap-s05, 9px) 0px;
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s00, 0px);
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .title {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-gap-s04, 6px);
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    width: 229px;
    position: relative;
  }
  .store-details .label {
    color: var(--ink-primary-black-02, #212322);
    text-align: left;
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
  }
  .store-details .tag {
    background: var(--ink-primary-black-03, #27272a);
    border-radius: 4.5px;
    padding: 0px var(--spacer-gap-s01, 1.5px) 0px var(--spacer-gap-s02, 3px);
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s00, 0px);
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .key {
    padding: 1.75px 0px 2.25px 0px;
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .text2 {
    color: var(--stroke-grey-03, #ebebeb);
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
  .store-details .button2 {
    padding: 6px 0px 3px 0px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 11px;
    height: 11px;
    position: relative;
  }
  .store-details .expand {
    flex-shrink: 0;
    width: 9.53px;
    height: 6px;
    position: relative;
    overflow: visible;
  }
  .store-details .store-details2 {
    padding: var(--spacer-gap-s05, 9px) 0px var(--spacer-gap-s05, 9px) 0px;
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s00, 0px);
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .key2 {
    padding: 1.75px 0px 2.25px 0px;
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s02, 3px);
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .expand2 {
    flex-shrink: 0;
    width: 9.53px;
    height: 6px;
    position: relative;
    overflow: visible;
  }
  .store-details .location {
    padding: var(--spacer-gap-s05, 9px) 0px var(--spacer-gap-s05, 9px) 0px;
    display: flex;
    flex-direction: row;
    gap: var(--spacer-gap-s00, 0px);
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .sentance {
    display: flex;
    flex-direction: row;
    gap: 3px;
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .primary {
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .icon-rating-star {
    flex-shrink: 0;
    width: 12px;
    height: 11px;
    position: relative;
    overflow: visible;
  }
  .store-details .reviews {
    color: var(--ink-primary-black-02, #212322);
    text-align: left;
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
  }
  .store-details .secondary {
    display: flex;
    flex-direction: row;
    gap: 3px;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    position: relative;
  }
  .store-details .expand3 {
    flex-shrink: 0;
    width: 9.53px;
    height: 6px;
    position: relative;
    overflow: visible;
  }
  .store-details .secondary2 {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 66px;
    position: relative;
  }
  .store-details .expand4 {
    flex-shrink: 0;
    width: 9.53px;
    height: 6px;
    position: relative;
    overflow: visible;
  }

`;

const amenitiesItemStyleElement = document.createElement('style');
amenitiesItemStyleElement.textContent = amenitiesItemStyle;
document.head.appendChild(amenitiesItemStyleElement);