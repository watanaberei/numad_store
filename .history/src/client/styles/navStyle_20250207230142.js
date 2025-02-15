export const nav = `
header.headline,
header.headline * {
  box-sizing: border-box;
}
header.headline {
  padding: 15px 0px 45px 0px;
  display: flex;
  background-color: var(--bg03);
  /* flex-flow: wrap; */
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
}
.headline .header {
  padding: 12px 0px 12px 0px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  margin: 0 !important;
  flex-shrink: 0;
  position: relative;
}
.headline .header .text {
    color: #e1ecf4;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 60px;
  line-height: 51px;
  font-weight: 500;
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.headline .header .text span.primary {
    /* text-align: left;
    font-family: "HelveticaNeue-Medium", sans-serif;
    font-size: 60px;
    line-height: 51px;
    font-weight: 500; */
    position: relative;
    -webkit-text-stroke: 2px transparent;
}
 
/* .headline .header .text span.secondary {
  color: #f3b440;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 60px;
  line-height: 51px;
  font-weight: 500;
} */
.headline .tags {
  padding: 12px 0px 12px 0px;
  display: flex;
  flex-direction: row;
  gap: 21px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.headline .array .item {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.headline .array .item .text  {
  flex-shrink: 0;
  width: 100%;
  height: 11px;
  position: static;
}
.headline .array .item .text span {
    color: #e1ecf4;
  /* color: #e1ecf4;
  text-align: left;
  font-family: "HelveticaNeue-Regular", sans-serif;
  font-size: 15px;
  line-height: 24px;
  font-weight: 400;
  opacity: 0.800000011920929; */
  /* position: absolute; */
  left: 0px;
  top: 0px;
}
.headline .array .item .text .glyph {
  /* background: rgba(192, 255, 111, 0.75); */
  /* border-radius: 333px;
  border-style: solid;
  border-color: #c0ff6f;
  border-width: 1px; */
  flex-shrink: 0;
  width: 11px;
  height: 11px;
  position: relative;
  overflow: hidden;
}

`;


export const navPrimary = `
/* Header */
.header {
  /* background-color: var(--white01); */
  z-index: 333;
  width: 100vw;
}

.footer {
  background-color: var(--white01);
  z-index: 333;
  width: 100vw; 
  height: 150px;
}

.header.fix {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.navigation {
  justify-content: space-between;
//   height: 100%;
}

.nav-top {
}

.nav-topbar-logo-container {
/* height: 18px;
// width: fit-content;
background-color: orange; */
}


/* REPORT BAR NAV  */
.nav-reportBar {
  height: 30px;
  width: 100vw;
  overflow-x: hidden;
  color: var(--ink03);
}

.nav-reportBar-container {
  align-items: center;
  margin: 0 auto;
}

.nav-reportBar-content {
  align-items: center;
  margin: auto;
  font-weight: bold;
}

.nav-reportBar {
position: absolute;
top: 0;
left: 0;
width: 100%;
}

.nav-reportBar-content {
display: block;
height: 100%;
width: 100%;
transform: translateX(-30%);
animation: move 130s linear infinite;
}

/* Create the animation */
@keyframes move {
to { transform: translateX(-100%); }
}

.nav-reportBar-content-container {
top: 50%;
}

.nav-reportBar-content-item{
width: 100%;
}


.nav-reportBar-content-wrapper {
}

.nav-reportBar-content-wrapper-item {
}

.weatherReport {
width: 100%;
}

.weather-description-icon {
height: 18px;  
height: 18px;

}

.weatherReport_description {
} 

.weatherReport_details {
}


.nav-main-right-container {
display:flex;
flex-direction: row;
gap: var(--g);
grid-template-rows: 1fr;
}


/* NAV TOP */
.nav-main {
/* background-color: var(--white01);
height: 9rem; */
grid-template-rows: 1fr;
height: 65px;
position: sticky;
// width: fit-content;
align-content: center;
}

.nav-main-container {
grid-template-rows: 1fr;
}

.img-logo {
  height: 18px !important;
}

.nav-main-mid-logo img {
  color: var(--black02);
  font-size: var(--text02_D);
  height: 16px;
  margin: 1.5px auto;
  /* width: -webkit-fill-available !important; */
}

.nav-main-left {
//   display: grid;
//   justify-self: flex-start;
//   grid-template-columns: var(--column) var(--d) var(--column) !important;
//   grid-column: 3 /11 !important;
//   place-self: center;
//   background-color: var(--testF);
//   justify-content: start;
//   width: -webkit-fill-available !important;
}

.nav-main-center {
place-self: center;
display: grid;
grid-column-start: 15;
/* grid-column: 15 / 19 !important; */
/* grid-template-columns: initial; */
/* grid-template-columns: var(--column) var(--d) var(--column) var(--d) var(--column) var(--d) var(--column) var(--d) var(--column); */
grid-template-columns: 1fr var(--colWidth) -1fr;
/* width: -webkit-fill-available !important; */
}

.nav-main-right {
// /* display: grid;
// justify-self: flex-start;
// grid-template-columns: var(--column) var(--d) var(--column) !important;
// place-self: center; */
// /* width: -webkit-fill-available !important; */
// /* display: grid;
// grid-column: 52 / 60 !important;
// flex-direction: column;
// gap: var(--s01);
// text-align: right; */
// display: right;
// flex-direction: row;
// align-items: flex-end;
}


.nav-main-logo {
grid-column: 1 / 5;
}

.hamburger {
  color: var(--black01);
  cursor: pointer;
  color: var(--white01);
  cursor: pointer;
}

.hamburger .icon-hamburger {
  padding: 6px 0;
}




/* NAV MID */
.nav-mid {
  display: block;
  text-align: center;
  display: grid;
  justify-content: space-between;
  border: none;
  padding-bottom: var(--s03);
  width: 100vw;
}

.nav-mid.hide, .hide {
  display: none;
}

.nav-mid-left {
  display: grid;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
}

.nav-mid-right {
  display: grid;
  flex-direction: column;
  text-align: right;
  /* align-items: flex-end; */
}

.nav-main-mid-logo {
  height: 21px;
  padding-top: 3px;
  opacity: 0;
}

.nav-main-mid-logo.show {
  opacity: 1;
}

.nav-brand-logo {
  height: 24px;
}@media (max-width: 567px) {
  .nav-brand-logo {
    height: 16px;
  }
}

.logo img {
  color: var(--black02);
  font-size: var(--text04_D);
  height: 24px;
  margin: 6px auto;
}@media (max-width: 567px) {
  .logo img {
    height: 16px;
  }
}

.current-data {
  height: 12px;
}









.nav-secondary {
height: 60px;
}












/* PRIMARY NAV */
.nav-primary {
  border-top: 1px solid rgb(235, 235, 235);
  display: block;
  /* border-bottom: 1px solid rgb(0, 0, 0); */
  /* padding-top: 2px; */
  /* padding-bottom: 2px; */
  width: 100%;
}

.nav-primary-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* align-items: center; */
  gap: var(--s03);
}

.nav-primary-menu {
  display: block;
  border-bottom: 1px solid rgb(0, 0, 0);
  padding-top: 2px;
  padding-bottom: 2px;
  width: 100%;
}

.nav-list {
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: -webkit-box;
  display: -webkit-grid;
  display: -ms-flexbox;
  display: grid;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: 5px 0 4px;
  margin: 0 20px;
}

.nav-flex {
  margin: 0px;
  display: grid;
  flex-direction: row;
}

.nav-list li:not(:last-child) {
}

.nav-list li a span {
  display: inline-block;
  color: var(--black02);
  font-weight: 500;
  transition: color 300ms ease-out;
}

.nav-list-divider {
  height: 10px;
  color: var(--grey03);
}

.nav-list li a:hover {
  color: var(--primary01);
}








@media (max-width: 567px) {
  .nav-list {
    position: fixed;
    top: 0;
    left: -100%;
    width: 100%;
    max-width: 80%;
    // height: 100%;
    background-color: var(--white01);
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 0;
    transition: all 500ms ease-out;
  }

  .nav-list.show {
    left: 0;
  }

  .logo {
    font-size: var(--text05);
  }

  .nav-list li:not(:last-child) {
    margin-right: 0;
  }

  .nav-list li {
    margin: 0 0 0.5rem;
    display: block;
    width: 100%;
  }

  .nav-list li a {
    color: var(--black01);
    font-size: var(--text01_D);
    width: 100%;
  }

  .hamburger {
    display: block;
    color: var(--white01);
    font-size: var(--text04);
    cursor: pointer;
  }
}
`;


export const navSecondary = `
/* Header */
header.header {
    background-color: var(--bg03);
    /* height: 6.00rem; */
    /* line-height: 1.5rem; */
    /* display: grid; */
    gap: var(--s03);
    /* margin: auto; */
    /* padding: 0 3%; */
    position: absolute;
    border-bottom: none;
    /* max-width: 1200px; */
  }
  
  .header.fix {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
  
  .navigationSecondary {
    justify-content: space-between;
    height: 100%;
  }

.navSecondary-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* gap: var(--s03); */
  }


/* REPORT BAR NAV  */
.navSecondary-reportBar {
    /* height: 15px; */
    width: 100vw;
    overflow-x: hidden;
    color: var(--black01);
    background-color: var(--green03);
}

.navSecondary-reportBar-container {
    display: flex;
    width: 100vw;
    flex-direction: row;
    /* justify-content: space-between; */
    gap: var(--s03);
    align-items: center;
    /* padding: 0 3%; */
    margin: 0 auto;
    /* max-width: 1200px; */
}

.navSecondary-reportBar-content {
    display: flex;
    flex-direction: row;
    /* justify-content: space-between; */
    gap: var(--s03);
    align-items: center;
    padding: var(--s02) 3%;
    margin: auto;
    font-weight: bold;
    /* max-width: 1200px; */
}

.navSecondary-reportBar {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
}

.navSecondary-reportBar-content {
  display: block; /* Important to give the content a width */

  width: 100%;
  transform: translateX(100%); /* Animation start out of the screen */

  /* Add the animation */
  animation: move 30s linear infinite /* infinite make reapeat the animation indefinitely */;
}

/* Create the animation */
@keyframes move {
  to { transform: translateX(-100%); }
}

.navSecondary-reportBar-content-container {
 display: flex;
 flex-direction: row;
 gap: 30px;
}

.navSecondary-reportBar-content-item{
 width: 100%;
}


.navSecondary-reportBar-content-wrapper {
 display: flex;
 flex-direction: row;
}




  /* NAV TOP */
.navSecondary-utility {
    /* border-top: 1px solid rgb(235, 235, 235); */
    display: block;
    width: 100%;   
    margin-top: 15.5px;
}

.navSecondary-utility-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    /* gap: var(--s03); */
  }

  .navSecondary-utility-mid {
    display: flex;
    flex-direction: column;
    gap: var(--s01);
    align-items: center;
    justify-content: center;
  }

  .navSecondary-utility-mid .navSecondary-utility-mid-logo img {
    color: var(--black02);
    font-size: var(--text02_D);
    height: 16px;
    margin: 1.5px auto;
  }

  .navSecondary-utility-mid-logo img {
    color: var(--black02);
    font-size: var(--text02_D);
    height: 16px;
    margin: 1.5px auto;
  }

  .navSecondary-utility-left {
    display: flex;
    flex-direction: column;
    gap: var(--s01);
    text-align: left;
    align-items: flex-start;
  }

  .navSecondary-utility-right {
    display: flex;
    flex-direction: column;
    gap: var(--s01);
    text-align: right;
    align-items: flex-end;
  }

  span.nav-hamburger-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--s03);
}

  /* .hamburger {
    display: block;
    color: var(--black01);
    font-size: var(--text04);
    cursor: pointer;
    padding: 6px 0;
    height: 21px;
    width: 21px;
  } */

  .hamburger .icon-hamburger {
    padding: 6px 0;
  }




  /* NAV MID */
  .navSecondary-mid {
    display: block;
    /* margin-top: -15px; */
    text-align: center;
    display: flex;
    justify-content: space-between;
    border: none;
    padding-bottom: var(--s03);
    width: 100%;
    /* height: 0; */
    /* transform: translateY(38px); */
    /* align-items: flex-end; */
  }

  .navSecondary-mid.hide {
    display: none;
  }

  .navSecondary-mid-left {
    display: flex;
    flex-direction: column;
    gap: var(--s01);
    text-align: left;
    align-items: flex-start;
  }

  .navSecondary-mid-right {
    display: flex;
    flex-direction: column;
    gap: var(--s01);
    text-align: right;
    align-items: flex-end;
  }

  .navSecondary-utility-mid-logo {
    height: 21px;
    padding-top: 3px;
    opacity: 1;
}

.navSecondary-utility-mid-logo.show {
    opacity: 1;
}

  .navSecondary-brand-logo {
    height: 36px;
  }

  .logo img {
    color: var(--black02);
    font-size: var(--text04_D);
    /* height: 100%; */
    /* width: 430px; */
    height: 20px;
    margin: 6px auto;
  }

  .current-data {
    height: 12px;
  }




  /* NAV tags */
  .navSecondary-tags {
    border-top: 1px solid var(--grey01);
    display: block;
    /* border-bottom: 1px solid rgb(0, 0, 0); */
    /* padding-top: 2px; */
    /* padding-bottom: 2px; */
    width: 100%;
  }

  .navSecondary-tags-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* align-items: center; */
    gap: var(--s03);
  }

  .navSecondary-tags-menu {
    /* border-top: 1px solid rgb(235, 235, 235); */
    display: block;
    border-bottom: 1px solid var(--grey01);
    padding-top: 2px;
    padding-bottom: 2px;
    width: 100%;
    /* max-width: 1200px; */
  }

  .navSecondary-tags-list {
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    /* -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between; */
    gap: var(--s02);
    padding: 5px 0 4px;
    margin: 0 20px;
  }

  .navSecondary-tags-flex {
    /* margin: 0 60px; */
    margin: 0px;
    display: flex;
    flex-direction: row;
  }
  
  .navSecondary-tags-list li:not(:last-child) {
    /* margin-right: 0.5rem; */
  }
  
  .navSecondary-tags-list li a span {
    display: inline-block;
    color: var(--black02);
    /* font-size: var(--text01_D); */
    /* line-height: 1rem; */
    /* padding: 0.5rem 1rem; */
    font-weight: 500;
    transition: color 300ms ease-out;
  }

  .navSecondary-tags-list-divider {
    height: 10px;
    color: var(--grey03);
  }
  
  .navSecondary-tags-list li a:hover {
    color: var(--primary01);
  }

















  /* PRIMARY NAV */
  .navSecondary-primary {
    border-top: 1px solid rgb(235, 235, 235);
    display: block;
    /* border-bottom: 1px solid rgb(0, 0, 0); */
    /* padding-top: 2px; */
    /* padding-bottom: 2px; */
    width: 100%;
  }

  .navSecondary-primary-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* align-items: center; */
    gap: var(--s03);
  }

  .navSecondary-primary-menu {
    /* border-top: 1px solid rgb(235, 235, 235); */
    display: block;
    border-bottom: 1px solid rgb(0, 0, 0);
    padding-top: 2px;
    padding-bottom: 2px;
    width: 100%;
    /* max-width: 1200px; */
  }

  .navSecondary-list {
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between;
    padding: 5px 0 4px;
    margin: 0 20px;
  }

  .navSecondary-flex {
    /* margin: 0 60px; */
    margin: 0px;
    display: flex;
    flex-direction: row;
  }
  
  .navSecondary-list li:not(:last-child) {
    /* margin-right: 0.5rem; */
  }
  
  .navSecondary-list li a span {
    display: inline-block;
    color: var(--black02);
    /* font-size: var(--text01_D); */
    /* line-height: 1rem; */
    /* padding: 0.5rem 1rem; */
    font-weight: 500;
    transition: color 300ms ease-out;
  }

  .navSecondary-list-divider {
    height: 10px;
    color: var(--grey03);
  }
  
  .navSecondary-list li a:hover {
    color: var(--primary01);
  }






  
  
  @media (max-width: 567px) {
    .navSecondary-list {
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      max-width: 80%;
      height: 100%;
      background-color: var(--white01);
      flex-direction: column;
      align-items: flex-start;
      padding: 1rem 0;
      transition: all 500ms ease-out;
    }
  
    .navSecondary-list.show {
      left: 0;
    }
  
    .logo {
      font-size: var(--text05);
    }
  
    .navSecondary-list li:not(:last-child) {
      margin-right: 0;
    }
  
    .navSecondary-list li {
      margin: 0 0 0.5rem;
      display: block;
      width: 100%;
    }
  
    .navSecondary-list li a {
      color: var(--black01);
      font-size: var(--text01_D);
      width: 100%;
    }
  
    .hamburger {
      display: block;
      color: var(--white01);
      font-size: var(--text04);
      cursor: pointer;
    }
  }
`;


export const header = `
header.headline,
header.headline * {
  box-sizing: border-box;
}
header.headline {
  padding: 15px 0px 45px 0px;
  display: flex;
  background-color: var(--bg03);
  /* flex-flow: wrap; */
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
}
.headline .header {
  padding: 12px 0px 12px 0px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  margin: 0 !important;
  flex-shrink: 0;
  position: relative;
}
.headline .header .text {
    color: #e1ecf4;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  text-align: left;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 60px;
  line-height: 51px;
  font-weight: 500;
  position: relative;
  -webkit-text-stroke: 2px transparent;
}
.headline .header .text span.primary {
    /* text-align: left;
    font-family: "HelveticaNeue-Medium", sans-serif;
    font-size: 60px;
    line-height: 51px;
    font-weight: 500; */
    position: relative;
    -webkit-text-stroke: 2px transparent;
}
 
/* .headline .header .text span.secondary {
  color: #f3b440;
  font-family: "HelveticaNeue-Medium", sans-serif;
  font-size: 60px;
  line-height: 51px;
  font-weight: 500;
} */
.headline .tags {
  padding: 12px 0px 12px 0px;
  display: flex;
  flex-direction: row;
  gap: 21px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.headline .array .item {
  display: flex;
  flex-direction: row;
  gap: 3px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
}
.headline .array .item .text  {
  flex-shrink: 0;
  width: 100%;
  height: 11px;
  position: static;
}
.headline .array .item .text span {
    color: #e1ecf4;
  /* color: #e1ecf4;
  text-align: left;
  font-family: "HelveticaNeue-Regular", sans-serif;
  font-size: 15px;
  line-height: 24px;
  font-weight: 400;
  opacity: 0.800000011920929; */
  /* position: absolute; */
  left: 0px;
  top: 0px;
}
.headline .array .item .text .glyph {
  /* background: rgba(192, 255, 111, 0.75); */
  /* border-radius: 333px;
  border-style: solid;
  border-color: #c0ff6f;
  border-width: 1px; */
  flex-shrink: 0;
  width: 11px;
  height: 11px;
  position: relative;
  overflow: hidden;
}

  `;



  // Apply hero styles to the document
const navigation = document.createElement('style');
navigation.textContent = navPrimary, navSecondary, nav, header;
document.head.appendChild(navigation);
