
export const globalStyle = `
:root {
    --bg-white-00: #FFFFFFFF;
    --bg-white-02: #E1ECF4FF;
    --bg-white-03: #FBFBFFFF;
    --bg-white-04: #F8FAFAFF;
    --bg-white-05: #F7F8FDFF;
    --bg-white-06: #F2F4F5FF;
    --stack: -33333333458944px;
    --indicator - rank - fair: #C39800FF;
    --indicator - rank - good: #039A00FF;
    --ink-grey-01: #EEF1F3FF;
    --ink-grey-02: #EEF1F3FF;
    --ink-grey-03: #A0A0A0FF;
    --ink-grey-05: #62626AFF;
    --ink-grey-06: #373A42FF;
    --ink-grey-grey01: #F2F4F5FF;
    --ink-grey-grey: #A0A0A0FF;
    --ink-primary-black-01: #373A42FF;
    --ink-primary-black-02: #212322FF;
    --ink-primary-black-03: #27272AFF;
    --ink-primary-black-04: #212322FF;
    --ink-primary-black-06: #101011FF;
    --ink-primary-white-01: #FBFBFEFF;
    --ink-primary-white-02: #D3D8DCFF;
    --ink-primary-white-03: #D3D8DCFF;
    --ink-primary-white-04: #D3D8DCFF;
    --ink-primary-white-06: #FBFBFEFF;
    --ink-shade-03: #F2F4F5FF;
    --ink-shade-04: #EEF1F3FF;
    --ink-shade-05: #E5EBEEFF;
    --rank-bronze-bronze(f): #DBDBDBFF;
    --rank-bronze-bronze(o): #DB9A00FF;
    --rank-gold-gold(f): #DBDBDBFF;
    --rank-gold-gold(o): #DB9A00FF;
    --rank-silver-silver(f): #DBDBDBFF;
    --rank-silver-silver(o): #DBDBDBFF;
    --spacer-gap-s00: 0px;
    --spacer-gap-s01: 1.5px;
    --spacer-gap-s02: 3px;
    --spacer-gap-s04: 6px;
    --spacer-gap-s05: 9px;
    --spacer-gap-s06: 12px;
    --spacer-gap-s07: 15px;
    --spacer-gap-s08: 21px;
    --spacer-gap-s09: 30px;
    --spacer-gap-s10: 45px;
    --spacer-gap-s11: 75px;
    --spacer-gap-s12: 195px;
    --stroke-grey-03: #EBEBEBFF;
    --stroke-grey-03 2: #E5EBEEFF;
    --stroke-grey-05: #D8E1E3FF;
    --utility-link(visited): #00019AFF;
    --utility-object(specified): #C64007FF;
    --utility-object02: #FF740FFF;
    --utility-object03: #FF5B14FF;
    --utility-tag: #9747FFFF;
    --utility-tag(specified): #672AB5FF;
    --utility-action: #3A3AFFFF;
    --utility-hover: #D6E4FFFF;
    --utility-pink01: #FF7CCBFF;
    --utility-pink03: #FF43B3FF;
    --utility-red: #FF4747FF;
    --utility-rank-1(bg): #F756574C;
    --utility-rank-2(bg): #FFEB904C;
    --utility-rank-3(bg): #ACFFB04C;
    --utility-rank-fair01: #FFEB90FF;
    --utility-rank-fair03: #FEDF72FF;
    --utility-rank-fair05: #FBCD2CFF;
    --utility-rank-good01: #ACFFB0FF;
    --utility-rank-good03: #26E615FF;
    --utility-rank-poor01: #F75656FF;
    --work-accent-03: #F3B440FF;
    --work-ink-03: #E1ECF4FF;
    --work-primary-02: #19281FFF;
    --work-primary-03: #2E4237FF;
    --work-primary-04: #2E4237FF;
    --work-primary-05: #19281FFF;
    --work-primary-06: #0D1E14FF;


    --aspect-ratio-2x2: 2/2;
    --aspect-ratio-3x2: 3/2;
    --aspect-ratio-4x2: 4/2;
    --aspect-ratio-5x2: 5/2;
    --aspect-ratio-6x2: 6/2;
  }
`;



const globalStyleElement = document.createElement(`style`);
globalStyleElement.textContent = globalStyle;
document.head.appendChild(globalStyleElement);







// /* neumad06 */
// /* @media (prefers-color-scheme: light) { */
//     :root {
//                 --bg-white-00: #ffffff;
//                 --bg-white-02: #e1ecf4;
//                 --bg-white-03: #fbfbff;
//                 --bg-white-04: #f8fafa;
//                 --bg-white-05: #f7f8fd;
//                 --bg-white-06: #f2f4f5;
//                 --indicator-rank-fair: #c39800;
//                 --indicator-rank-good: #039a00;
//                 --ink-grey-01: #eef1f3;
//                 --ink-grey-02: #eef1f3;
//                 --ink-grey-03: #a0a0a0;
//                 --ink-grey-05: #62626a;
//                 --ink-grey-06: #373a42;
//                 --ink-grey-grey01: #f2f4f5;
//                 --ink-grey-grey: #a0a0a0;
//                 --ink-primary-01: #373a42;
//                 --ink-primary-02: #212322;
//                 --ink-primary-03: #27272a;
//                 --ink-primary-04: #212322;
//                 --ink-primary-06: #101011;
//                 --ink-shade-03: #f2f4f5;
//                 --ink-shade-04: #eef1f3;
//                 --ink-shade-05: #e5ebee;
//                 --rank-bronze-bronze-f: #dbdbdb;
//                 --rank-bronze-bronze-o: #db9a00;
//                 --rank-gold-gold-f: #dbdbdb;
//                 --rank-gold-gold-o: #db9a00;
//                 --rank-silver-silver-f: #dbdbdb;
//                 --rank-silver-silver-o: #dbdbdb;
//                 --s00: 0px;
//                 --s01: 1.5px;
//                 --s02: 3px;
//                 --s04: 6px;
//                 --s05: 9px;
//                 --s06: 12px;
//                 --s07: 15px;
//                 --s08: 21px;
//                 --s09: 30px;
//                 --s10: 45px;
//                 --s11: 75px;
//                 --s12: 195px;
//                 --stroke-grey-03: #ebebeb;
//                 --stroke-grey-03-2: #e5ebee;
//                 --stroke-grey-05: #d8e1e3;
//                 --utility-link-visited: #00019a;
//                 --utility-object-specified: #c64007;
//                 --utility-object02: #ff740f;
//                 --utility-object03: #ff5b14;
//                 --utility-tag: #9747ff;
//                 --utility-tag-specified: #672ab5;
//                 --utility-action: #3a3aff;
//                 --utility-hover: #3a7dff36;
//                 --utility-pink01: #ff7ccb;
//                 --utility-pink03: #ff43b3;
//                 --utility-red: #ff4747;
//                 --utility-rank-1-bg: #f756574d;
//                 --utility-rank-2-bg: #ffeb904d;
//                 --utility-rank-3-bg: #acffb04d;
//                 --utility-rank-fair01: #ffeb90;
//                 --utility-rank-fair03: #fedf72;
//                 --utility-rank-fair05: #fbcd2c;
//                 --utility-rank-good01: #acffb0;
//                 --utility-rank-good03: #26e615;
//                 --utility-rank-poor01: #f75656;
//                 --work-accent-03: #f3b440;
//                 --work-ink-03: #e1ecf4;
//                 --work-primary-02: #19281f;
//                 --work-primary-03: #2e4237;
//                 --work-primary-04: #2e4237;
//                 --work-primary-05: #19281f;
//                 --work-primary-06: #0d1e14;

                

//                 --aspect-ratio-2x2: 2/2;
//                 --aspect-ratio-3x2: 3/2;
//                 --aspect-ratio-4x2: 4/2;
//                 --aspect-ratio-5x2: 5/2;
//                 --aspect-ratio-6x2: 6/2;
//     }
// /* } */
// @media (prefers-color-scheme: dark) {
//     :root {
//                 --bg-white-00: #ffffff;
//                 --bg-white-02: #e1ecf4;
//                 --bg-white-03: #fbfbff;
//                 --bg-white-04: #f8fafa;
//                 --bg-white-05: #f7f8fd;
//                 --bg-white-06: #f2f4f5;
//                 --indicator-rank-fair: #c39800;
//                 --indicator-rank-good: #039a00;
//                 --ink-grey-01: #27272a;
//                 --ink-grey-02: #27272a;
//                 --ink-grey-03: #a0a0a0;
//                 --ink-grey-05: #62626a;
//                 --ink-grey-06: #62626a;
//                 --ink-grey-grey01: #f2f4f5;
//                 --ink-grey-grey: #a0a0a0;
//                 --ink-primary-01: #fbfbfe;
//                 --ink-primary-02: #d3d8dc;
//                 --ink-primary-03: #d3d8dc;
//                 --ink-primary-04: #d3d8dc;
//                 --ink-primary-06: #fbfbfe;
//                 --ink-shade-03: #f2f4f5;
//                 --ink-shade-04: #eef1f3;
//                 --ink-shade-05: #ffffff;
//                 --rank-bronze-bronze-f: #ffbd00;
//                 --rank-bronze-bronze-o: #db9a00;
//                 --rank-gold-gold-f: #ffbd00;
//                 --rank-gold-gold-o: #db9a00;
//                 --rank-silver-silver-f: #dbdbdb;
//                 --rank-silver-silver-o: #dbdbdb;
//                 --s00: 0px;
//                 --s01: 1.5px;
//                 --s02: 3px;
//                 --s04: 6px;
//                 --s05: 9px;
//                 --s06: 12px;
//                 --s07: 15px;
//                 --s08: 21px;
//                 --s09: 30px;
//                 --s10: 45px;
//                 --s11: 75px;
//                 --s12: 195px;
//                 --stroke-grey-03: #ebebeb;
//                 --stroke-grey-03-2: #ebebeb;
//                 --stroke-grey-05: #d8e1e3;
//                 --utility-link-visited: #00019a;
//                 --utility-object-specified: #c64007;
//                 --utility-object02: #ff740f;
//                 --utility-object03: #ff5b14;
//                 --utility-tag: #9747ff;
//                 --utility-tag-specified: #7308fe;
//                 --utility-action: #3a3aff;
//                 --utility-hover: #3a7dff36;
//                 --utility-pink01: #ff4747;
//                 --utility-pink03: #ff4747;
//                 --utility-red: #ff4747;
//                 --utility-rank-1-bg: #f756574d;
//                 --utility-rank-2-bg: #ffeb904d;
//                 --utility-rank-3-bg: #acffb04d;
//                 --utility-rank-fair01: #ffeb90;
//                 --utility-rank-fair03: #fedf72;
//                 --utility-rank-fair05: #fbcd2c;
//                 --utility-rank-good01: #acffb0;
//                 --utility-rank-good03: #4fff3f;
//                 --utility-rank-poor01: #f75657;
//                 --work-accent-03: #f3b440;
//                 --work-ink-03: #e1ecf4;
//                 --work-primary-02: #19281f;
//                 --work-primary-03: #2e4237;
//                 --work-primary-04: #212322;
//                 --work-primary-05: #19281f;
//                 --work-primary-06: #0d1e14;
//     }
// }