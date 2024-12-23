
export const gridStyle = `
/* Grid system */
.grid05 {
 padding: 0 var(--s07) !important; 
}
.grid05, .grid05 > .grid05, .grid05 > .grid05 > .grid05 {
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
  display: grid;
  grid-column: span 1 !important;  /* Default span is 1 column */
  gap: var(--s07) !important;
  // padding: 0 var(--s07) !important;
}
.grid04 {
  display: grid !important;
  grid-template-columns: repeat(var(--numad-grid04-grid-template-columns), 1fr) !important;
  // /* gutters */
  gap: var(--s07) !important;
  // /* padding: 0 var(--s07) !important; */
  // grid-column: span 05;
  // /* outer border */
}

.grid05-overflow {
    display: grid !important;
    grid-column: span 5 !important;
    grid-auto-flow: column;
    grid-row: span 2 !important;
    aspect-ratio: var(--aspect-ratio-5x2) !important;
    grid-template-rows: 1fr 1fr;
    grid-auto-flow: column;
    grid-auto-columns: calc((100% - 4 * 15px) / 5) !important; 
    gap: var(--s07) !important;
    // /* padding-right: var(--s07) !important; */
    
    overflow-x: scroll;
    grid-column: span 5;
}

.grid08-overflow {
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
  
  overflow-x: scroll;
  grid-column: span 5;
}

.grid04-overflow {
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
    display: grid !important;
    grid-template-columns: repeat(10, 1fr) !important;
    gap: var(--numad-grid10-gap) !important;
    grid-column: span 5;
}

.grid10 > * {
    display: grid;
    grid-column: span 1 !important;/* Default span is 1 column */
}


.col05 {
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
  grid-template-columns: .2fr .2fr .2fr .2fr .2fr !important;
  display: grid;
  /* grid-column: span 1 !important; */
  gap: var(--s07) !important;
}

.col04 {
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
  grid-template-columns: .25fr .25fr .25fr .25fr !important;
  display: grid;
  /* grid-column: span 1 !important; */
  gap: var(--s07) !important;
}

.grid05 > .span04 {
  grid-template-columns: 1fr !important;
}

.grid05 .section.col04 {
  padding: 0 var(--s07) !important;
}


/* Grid span classes */
.col00 { display: grid; grid-column: 1 / -1  !important; grid-template-columns: repeat(var(--s07), 1fr) !important;}
.span01, .col01 { display: grid; grid-column: span 1  !important; grid-template-columns: 1fr;}
.span02, .col02 { display: grid; grid-column: span 2  !important; grid-template-columns: 2fr;}
.span03, .col03 { display: grid; grid-column: span 3  !important; grid-template-columns: 3fr;}
.span04, .col04 { display: grid; grid-column: span 4  !important; }
.span05, .col05 { display: grid; grid-column: span 5  !important; grid-template-columns: 5fr;}
.span06, .col06 { display: grid; grid-column: span 6  !important; grid-template-columns: 6fr;}
.span07, .col07 { display: grid; grid-column: span 7  !important; grid-template-columns: 7fr;}
.span08, .col08 { display: grid; grid-column: span 8  !important; grid-template-columns: 8fr;}
.span09, .col09 { display: grid; grid-column: span 9  !important; grid-template-columns: 9fr;}
.span10, .col10 { display: grid; grid-column: span 10  !important; grid-template-columns: 10fr;}
.span11, .col11 { display: grid; grid-column: span 11  !important; grid-template-columns: 11fr;}
.span12, .col12 { display: grid; grid-column: span 12  !important; grid-template-columns: 12fr;}
.span13, .col13 { display: grid; grid-column: span 13  !important; grid-template-columns: 13fr;}
.row01  { display: grid ; grid-row: span 1; !important}
.row02  { display: grid ; grid-row: span 2; !important}

.block05 { display: grid; grid-column: span 5  !important; grid-template-columns: 5fr; grid-row: span 2; !important; grid-template-rows; 2fr;}


/* Grid start classes */
.start { display: grid  !important; grid-column-start: -1  !important;}
.start01 { display: grid  !important; grid-column-start: 1  !important;}
.start02 { display: grid  !important; grid-column-start: 2  !important;}
.start03 { display: grid  !important; grid-column-start: 3  !important;}
.start04 { display: grid  !important; grid-column-start: 4  !important;}
.start05 { display: grid  !important; grid-column-start: 5  !important;}

/* Grid end classes */
.end { display: grid  !important; grid-column-end: -1  !important;}
.end01 { display: grid  !important; grid-column-end: -1  !important;}
.end02 { display: grid  !important; grid-column-end: -2  !important;}
.end03 { display: grid  !important; grid-column-end: -3  !important;}
.end04 { display: grid  !important; grid-column-end: -4  !important;}
.end05 { display: grid  !important; grid-column-end: -5  !important;}

.grid05-container {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 15px !important;
  margin-left: 15px !important;
  margin-right: 15px !important;
}
.grid10-container {
    display: grid !important;
    grid-template-columns: repeat(10, 1fr) !important;
    gap: 15px !important;
    margin-left: 15px !important;
    margin-right: 15px !important;
}
.grid-item {
  background-color: #f0f0f0 !important;
  padding: 20px !important;
  text-align: center !important;
}
`;



const gridStyleElement = document.createElement('style');
gridStyleElement.textContent = gridStyle;
document.head.appendChild(gridStyleElement);
