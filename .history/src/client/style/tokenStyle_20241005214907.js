
export const globalStyle = `
/* neumad06 */
/* @media (prefers-color-scheme: light) { */
    :root {
                --bg-white-00: #ffffff;
                --bg-white-02: #e1ecf4;
                --bg-white-03: #fbfbff;
                --bg-white-04: #f8fafa;
                --bg-white-05: #f7f8fd;
                --bg-white-06: #f2f4f5;
                --indicator-rank-fair: #c39800;
                --indicator-rank-good: #039a00;
                --ink-grey-01: #eef1f3;
                --ink-grey-02: #eef1f3;
                --ink-grey-03: #a0a0a0;
                --ink-grey-05: #62626a;
                --ink-grey-06: #373a42;
                --ink-grey-grey01: #f2f4f5;
                --ink-grey-grey: #a0a0a0;
                --ink-primary-01: #373a42;
                --ink-primary-02: #212322;
                --ink-primary-03: #27272a;
                --ink-primary-04: #212322;
                --ink-primary-06: #101011;
                --ink-shade-03: #f2f4f5;
                --ink-shade-04: #eef1f3;
                --ink-shade-05: #e5ebee;
                --rank-bronze-bronze-f: #dbdbdb;
                --rank-bronze-bronze-o: #db9a00;
                --rank-gold-gold-f: #dbdbdb;
                --rank-gold-gold-o: #db9a00;
                --rank-silver-silver-f: #dbdbdb;
                --rank-silver-silver-o: #dbdbdb;
                --s00: 0px;
                --s01: 1.5px;
                --s02: 3px;
                --s04: 6px;
                --s05: 9px;
                --s06: 12px;
                --s07: 15px;
                --s08: 21px;
                --s09: 30px;
                --s10: 45px;
                --s11: 75px;
                --s12: 195px;
                --stroke-grey-03: #ebebeb;
                --stroke-grey-03-2: #e5ebee;
                --stroke-grey-05: #d8e1e3;
                --utility-functional-link-visited: #00019a;
                --utility-functional-object-specified: #c64007;
                --utility-functional-object02: #ff740f;
                --utility-functional-object03: #ff5b14;
                --utility-functional-tag: #9747ff;
                --utility-functional-tag-specified: #672ab5;
                --utility-functional-action: #3a3aff;
                --utility-functional-hover: #3a7dff36;
                --utility-functional-pink01: #ff7ccb;
                --utility-functional-pink03: #ff43b3;
                --utility-functional-red: #ff4747;
                --utility-rank-1-bg: #f756574d;
                --utility-rank-2-bg: #ffeb904d;
                --utility-rank-3-bg: #acffb04d;
                --utility-rank-fair01: #ffeb90;
                --utility-rank-fair03: #fedf72;
                --utility-rank-fair05: #fbcd2c;
                --utility-rank-good01: #acffb0;
                --utility-rank-good03: #26e615;
                --utility-rank-poor01: #f75656;
                --work-accent-03: #f3b440;
                --work-ink-03: #e1ecf4;
                --work-primary-02: #19281f;
                --work-primary-03: #2e4237;
                --work-primary-04: #2e4237;
                --work-primary-05: #19281f;
                --work-primary-06: #0d1e14;

                

                --aspect-ratio-2x2: 2/2;
                --aspect-ratio-3x2: 3/2;
                --aspect-ratio-4x2: 4/2;
                --aspect-ratio-5x2: 5/2;
                --aspect-ratio-6x2: 6/2;
    }
/* } */
@media (prefers-color-scheme: dark) {
    :root {
            --bg-white-00: #ffffff;
            --bg-white-02: #e1ecf4;
            --bg-white-03: #fbfbff;
            --bg-white-04: #f8fafa;
            --bg-white-05: #f7f8fd;
            --bg-white-06: #f2f4f5;
            --indicator-rank-fair: #c39800;
            --indicator-rank-good: #039a00;
                --ink-grey-01: #27272a;
                --ink-grey-02: #27272a;
                --ink-grey-03: #a0a0a0;
                --ink-grey-05: #62626a;
                --ink-grey-06: #62626a;
                --ink-grey-grey01: #f2f4f5;
                --ink-grey-grey: #a0a0a0;
                --ink-primary-01: #fbfbfe;
                --ink-primary-02: #d3d8dc;
                --ink-primary-03: #d3d8dc;
                --ink-primary-04: #d3d8dc;
                --ink-primary-06: #fbfbfe;
                --ink-shade-03: #f2f4f5;
                --ink-shade-04: #eef1f3;
                --ink-shade-05: #ffffff;
                --rank-bronze-bronze-f: #ffbd00;
                --rank-bronze-bronze-o: #db9a00;
                --rank-gold-gold-f: #ffbd00;
                --rank-gold-gold-o: #db9a00;
                --rank-silver-silver-f: #dbdbdb;
                --rank-silver-silver-o: #dbdbdb;
                --s00: 0px;
                --s01: 1.5px;
                --s02: 3px;
                --s04: 6px;
                --s05: 9px;
                --s06: 12px;
                --s07: 15px;
                --s08: 21px;
                --s09: 30px;
                --s10: 45px;
                --s11: 75px;
                --s12: 195px;
                --stroke-grey-03: #ebebeb;
                --stroke-grey-03-2: #ebebeb;
                --stroke-grey-05: #d8e1e3;
                --utility-functional-link-visited: #00019a;
                --utility-functional-object-specified: #c64007;
                --utility-functional-object02: #ff740f;
                --utility-functional-object03: #ff5b14;
                --utility-functional-tag: #9747ff;
                --utility-functional-tag-specified: #7308fe;
                --utility-functional-action: #3a3aff;
                --utility-functional-hover: #3a7dff36;
                --utility-functional-pink01: #ff4747;
                --utility-functional-pink03: #ff4747;
                --utility-functional-red: #ff4747;
                --utility-rank-1-bg: #f756574d;
                --utility-rank-2-bg: #ffeb904d;
                --utility-rank-3-bg: #acffb04d;
                --utility-rank-fair01: #ffeb90;
                --utility-rank-fair03: #fedf72;
                --utility-rank-fair05: #fbcd2c;
                --utility-rank-good01: #acffb0;
                --utility-rank-good03: #4fff3f;
                --utility-rank-poor01: #f75657;
                --work-accent-03: #f3b440;
                --work-ink-03: #e1ecf4;
                --work-primary-02: #19281f;
                --work-primary-03: #2e4237;
                --work-primary-04: #212322;
                --work-primary-05: #19281f;
                --work-primary-06: #0d1e14;
    }
}
`;



const globalStyleElement = document.createElement(`style`);
globalStyleElement.textContent = globalStyle;
document.head.appendChild(globalStyleElement);
