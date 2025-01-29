
export const gridStyle = `
/* Grid system */
.grid05 {
 box-sizing: border-box;
  gap: var(--s07) !important;
  padding: 0 var(--s07) !important;
}
.grid05, .grid05 > .grid05, .grid05 > .grid05 > .grid05 {
 box-sizing: border-box;
  display: grid !important;
  grid-template-columns: repeat(var(--numad-grid05-grid-template-columns), 1fr) !important;
  // /* gutters */
  gap: var(--s07) !important;
  padding: 0px !important;
  margin: 0px !important;
  max-width: 100% !important;
  grid-column: span 05;
  // /* outer border */
  
}
.grid05 > * {
  box-sizing: border-box;
  display: grid;
  grid-column: span 1 !important;  /* Default span is 1 column */
  // gap: var(--s07) !important;
  // padding: 0 var(--s07) !important;
}
.grid04 {
 box-sizing: border-box;
  display: grid !important;
  grid-template-columns: repeat(var(--numad-grid04-grid-template-columns), 1fr) !important;
  // /* gutters */
  gap: var(--s07) !important;
  // /* padding: 0 var(--s07) !important; */
  // grid-column: span 05;
  // /* outer border */
}
  .grid03 {
 box-sizing: border-box;
  display: grid !important;
  grid-template-columns: repeat(var(--numad-grid03-grid-template-columns), 1fr) !important;
  // /* gutters */
  gap: var(--s07) !important;
  // /* padding: 0 var(--s07) !important; */
  // grid-column: span 05;
  // /* outer border */
}

.grid05-overflow {
 box-sizing: border-box;
    display: grid !important;
    grid-column: span 5 !important;
    grid-auto-flow: column;
    grid-row: span 2 !important;
    aspect-ratio: var(--aspect-ratio-5x2) !important;
    grid-template-rows: 1fr 1fr;
    grid-auto-flow: column;
    grid-auto-columns: calc((100% - 4 * 15px) / 5) !important; 
    overflow-x: scroll !important;
    gap: var(--s07) !important;
    // /* padding-right: var(--s07) !important; */
  
    grid-column: span 5;
}

.grid08-overflow {
 box-sizing: border-box;
  display: grid !important;
  grid-column: span 8 !important;
  grid-auto-flow: column;
  grid-row: span 1 !important;
  // aspect-ratio: var(--aspect-ratio-5x2) !important;
  grid-template-rows: 1fr ;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 7 * 15px) / 8) !important; 
  gap: var(--s07) !important;
  // /* padding-right: var(--s07) !important; */
  overflow-x: scroll !important;
  overflow: scroll !important;
  grid-column: span 5;
}

.grid04-overflow {
 box-sizing: border-box;
  display: grid !important;
  grid-column: span 4 !important;
  grid-auto-flow: column;
  grid-row: span 1 !important;
  // aspect-ratio: var(--aspect-ratio-5x2) !important;
  grid-template-rows: 1fr ;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 3 * 15px) / 4) !important; 
  gap: var(--s07) !important;
  // /* padding-right: var(--s07) !important; */
  
  overflow-x: scroll;
  grid-column: span 5;
}
.grid10 {
 box-sizing: border-box;
    display: grid !important;
    grid-template-columns: repeat(10, 1fr) !important;
    gap: var(--numad-grid10-gap) !important;
    grid-column: span 5;
}

.grid10 > * {
 box-sizing: border-box;
    display: grid;
    grid-column: span 1 !important;/* Default span is 1 column */
}


.col05 {
 box-sizing: border-box;
  gap: var(--numad-grid10-gap) !important;
  display: grid !important;
  grid-column: span 5 !important;
}

.grid05 .col05,
.grid05 > .col05, 
.grid05 > .col05 > .col05, 
.grid05 > .col05 > .col05 > .col05, 
.grid05 > .col05 > .col05 > .col05 > .col05,
.grid05 > .col05 > .col05 > .col05 > .col05 > .col05 {
 box-sizing: border-box;
  grid-template-columns: .2fr .2fr .2fr .2fr .2fr !important;
  display: grid;
  /* grid-column: span 1 !important; */
  gap: var(--s07) !important;
}

.col04 {
 box-sizing: border-box;
  gap: var(--numad-grid10-gap) !important;
  display: grid !important;
  grid-column: span 4 !important;
}

.grid05 .col04, 
.grid05 .col04 .col04, 
.grid05 .col04 .col04 .col04, 
.grid05 .col04 .col04 .col04 .col04, 
.grid05 .col04 .col04 .col04 .col04 .col04, 
.grid05 .col04 .col04 .col04 .col04 .col04 .col04, 
.grid05 .col04 .col04 .col04 .col04 .col04 .col04 .col04, 
.grid05 > .col04, 
.grid05 > .col04 > .col04, 
.grid05 > .col04 > .col04 > .col04, 
.grid05 > .col04 > .col04 > .col04 > .col04,
.grid05 > .col04 > .col04 > .col04 > .col04 > .col04,
.grid05 > .col04 > .col04 > .col04 > .col04 > .col04 > .col04 {
 box-sizing: border-box;
  grid-template-columns: .25fr .25fr .25fr .25fr !important;
  display: grid;
  /* grid-column: span 1 !important; */
  gap: var(--s07) !important;
}

.grid05 > .span04 {
 box-sizing: border-box;
  grid-template-columns: 1fr !important;
}

.grid05 .section.col04 {
 box-sizing: border-box;
  // padding: 0 var(--s07) !important;
}


/* Grid span classes */
.col00 { box-sizing: border-box; display: grid; grid-column: 1 / -1  !important; grid-template-columns: repeat(var(--s07), 1fr) !important;}
.span01, .col01 { box-sizing: border-box; display: grid; grid-column: span 1  !important; grid-template-columns: 1fr;}
.span02, .col02 { box-sizing: border-box; display: grid; grid-column: span 2  !important; grid-template-columns: 2fr;}
.span03, .col03 { box-sizing: border-box; display: grid; grid-column: span 3  !important; grid-template-columns: 3fr;}
.span04, .col04 { box-sizing: border-box; display: grid; grid-column: span 4  !important; }
.span05, .col05 { box-sizing: border-box; display: grid; grid-column: span 5  !important; grid-template-columns: 5fr;}
.span06, .col06 { box-sizing: border-box; display: grid; grid-column: span 6  !important; grid-template-columns: 6fr;}
.span07, .col07 { box-sizing: border-box; display: grid; grid-column: span 7  !important; grid-template-columns: 7fr;}
.span08, .col08 { box-sizing: border-box; display: grid; grid-column: span 8  !important; grid-template-columns: 8fr;}
.span09, .col09 { box-sizing: border-box; display: grid; grid-column: span 9  !important; grid-template-columns: 9fr;}
.span10, .col10 { box-sizing: border-box; display: grid; grid-column: span 10  !important; grid-template-columns: 10fr;}
.span11, .col11 { box-sizing: border-box; display: grid; grid-column: span 11  !important; grid-template-columns: 11fr;}
.span12, .col12 { box-sizing: border-box; display: grid; grid-column: span 12  !important; grid-template-columns: 12fr;}
.span13, .col13 { box-sizing: border-box; display: grid; grid-column: span 13  !important; grid-template-columns: 13fr;}
.row01  { box-sizing: border-box; display: grid ; grid-row: span 1; !important}
.row02  { box-sizing: border-box; display: grid ; grid-row: span 2; !important}

.block05 { box-sizing: border-box; display: grid; grid-column: span 5  !important; grid-template-columns: 5fr; grid-row: span 2; !important; grid-template-rows; 2fr;}


/* Grid start classes */
.start { box-sizing: border-box; display: grid  !important; grid-column-start: -1  !important;}
.start01 { box-sizing: border-box; display: grid  !important; grid-column-start: 1  !important;}
.start02 { box-sizing: border-box; display: grid  !important; grid-column-start: 2  !important;}
.start03 { box-sizing: border-box; display: grid  !important; grid-column-start: 3  !important;}
.start04 { box-sizing: border-box; display: grid  !important; grid-column-start: 4  !important;}
.start05 { box-sizing: border-box; display: grid  !important; grid-column-start: 5  !important;}

/* Grid end classes */
.end { box-sizing: border-box; display: grid  !important; grid-column-end: -1  !important;}
.end01 { box-sizing: border-box; display: grid  !important; grid-column-end: -1  !important;}
.end02 { box-sizing: border-box; display: grid  !important; grid-column-end: -2  !important;}
.end03 { box-sizing: border-box; display: grid  !important; grid-column-end: -3  !important;}
.end04 { box-sizing: border-box; display: grid  !important; grid-column-end: -4  !important;}
.end05 { box-sizing: border-box; display: grid  !important; grid-column-end: -5  !important;}

.grid05-container {
  box-sizing: border-box; 
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 15px !important;
  margin-left: 15px !important;
  margin-right: 15px !important;
}
.grid10-container {
box-sizing: border-box; 
    display: grid !important;
    grid-template-columns: repeat(10, 1fr) !important;
    gap: 15px !important;
    margin-left: 15px !important;
    margin-right: 15px !important;
}
.grid-item {
box-sizing: border-box; 
  background-color: #f0f0f0 !important;
  padding: 20px !important;
  text-align: center !important;
}










.gridCollection {
  box-sizing: border-box;
  // width: fit-content;
  grid-template-columns: repeat(auto-fill, minmax(calc((100% - 30px) / 3), 1fr)) !important;
  grid-auto-rows: minmax(100px, auto);
  gap: 15px;
}
.gridCard {
  box-sizing: border-box;
  aspect-ratio: 1 / 1;
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  display: grid !important;
  // grid-column: 1 / -1 !important;
  // grid-row: 1 / -1 !important;
  grid-template-columns: 1fr !important;
  grid-template-rows: 1fr 1fr 1fr !important;
  grid-template-areas: "top" "middle" "bottom" !important;
  overflow: hidden !important;
}
.gridCard .top { grid-area: top !important; }
.gridCard .middle { grid-area: middle !important; }
.gridCard .bottom { grid-area: bottom !important; }
`;



const gridStyleElement = document.createElement('style');
gridStyleElement.textContent = gridStyle;
document.head.appendChild(gridStyleElement);
