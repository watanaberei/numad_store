
export const search = `
:root {
  --maxWidth: 200px;
  --searchActiveWidth: 683px;
  --searchInactiveMinWidth: 220px;
}
/* !!!!!!!!!!!!!!! NAV !!!!!!!!!!!!!!! */
/* #nav {
  display: grid;
  gap: 30px;
  background-color: #FBFBFB;
  margin: 0;
  padding: 0;
  align-items: center;
  position: relative;
  height: 100px;
  padding: 0;
  align-items: center;
  flex-direction: column !important;
} */

#nav {
  grid-template-columns: [logo-start] 1fr [logo-end] 1fr [search-start] 1fr [search-end] 1fr [menu-start] 1fr [menu-end];
  transition: grid-template-columns 600ms;
}

#nav:hover {
  grid-template-columns: [logo-start] 1fr [logo-end] 1fr [search-start] 4fr [search-end] 1fr [menu-start] 1fr [menu-end];
  transition: grid-template-columns 600ms;
}
/* !!!!!!!!!!!!!!! NAV !!!!!!!!!!!!!!! */




/* !!!!!!!!!!!!!!! SEARCH CONTAINER !!!!!!!!!!!!!!! */
.searchBar {
    display: grid;
    grid-column: 1 / 42;
    grid-template-columns: 1fr var(--colWidth) 1fr;
    
}
#search-container {
  outline-style: solid;
  outline-width: 1px;
  /* grid-column: 1 / 9; */
  border-radius: 30px;
  /* width: 100%; */
  /* display: grid; */
  /* grid-column: 24 / 35 !important; */
  /* grid-column: 24 / 35 !important; */
  /* grid-column: 24 / 35;
  z-index: 33; */
}
#search-container {
  place-self: center;
  display: grid;
  grid-column: 24 / 35;
  grid-template-columns: 1fr var(--colWidth) -1fr;
  z-index: 33;
}
.searchBar-cta {
  grid-column: 43 / 44;
}
#nav .search-container {
/*   height: fit-content; */
/*   max-width: 680px;
  top: 0px; */
  /* top: 0px; */
/*   margin: 0 auto; */
/*   background-color: blue; */
}
/* .search-container {
  place-self: center;
  display: grid;
  grid-column: 24 / 35;
  grid-template-columns: 1fr var(--colWidth) -1fr;
  z-index: 33;
  

  transition: grid-column 0.3s ease-in-out;
} */
.search {
  width: 100%;  /* Initial contracted width. Adjust based on your design */
  transition: width 0.3s ease-in-out;
  /* outline-style: solid;
  outline-width: 1px; */
  /* grid-column: 1 / 9; */
  /* border-radius: 30px; */
}

.search-container.expanded .search {
  width: 100%;  /* Expanded width */
}


.search-container {
  place-self: center;
  display: grid;
  grid-column: 16 / 43; 
  grid-template-columns: 1fr var(--colWidth) -1fr;
  z-index: 33;
  overflow: hidden; /* hide the overflowing content when it contracts */
}

#nav .search-input {
/*   max-height: 63px; */
  /* background-color: #FBFBFB; */
  /* outline-style: solid;
  outline-width: 0.0px;
  outline-color: #C0C5C6; */
  /* padding: 6px 4px; */
  display: grid;
  /* outline-style: solid;
  outline-width: 1px; */
  /* grid-column: 1 / 9; */
  grid-template-columns: auto;
  /* border-radius: 30px; */
}
#nav:hover .search-input {
  /* padding: 6px 6px;
  outline-style: solid;
  outline-width: 0.5px;
  outline-color: #C0C5C6; */
}

.search-input {
  display: grid;
  /* outline-style: solid;
  outline-width: 1px; */
  /* grid-column: 1 / 9; */
  /* border-radius: 30px; */
}
.search {
  /* position: relative;
  display: grid;
  grid-template-columns: 1fr 90px 1fr;
  grid-column: 1;
  padding: 9px 15px; */
  /* padding: 9px 21px; */
  place-self: center;
  display: inline-grid;
  grid-template-columns: auto 30px auto;
}
.searchBar-item {
  place-self: center;
}
.search input, input[type="text"] {
  /* width: 110px !important; */
}
/* !!!!!!!!!!!!!!! SEARCH CONTAINER !!!!!!!!!!!!!!! */




/* 
.search-field.search-fieldPlace:hover {
  cursor: pointer !important;
  background-color: purple;
} */










/* !!!!!!!!!!!!!!! SEARCH INPUT !!!!!!!!!!!!!!! */
#nav .search-container .search {
  display: grid;
  grid-template-columns: 1fr;
    grid-template-columns: 1fr 50px 1fr;
    width: 100%;
}
#nav:hover .search-container .search {
  display: grid;
/*   grid-template-columns: 1fr 50px; */
}

.search {
  place-self: center;
    display: inline-grid;
    grid-template-columns: auto 30px auto;
    width: 100%;
    transition: width 0.3s ease-in-out;
}

#nav .search-container .search {
grid-template-columns:  1fr 0px;
  transform: grid-template-columns 600ms;
}

#nav:hover .search-container .search {
/*   grid-template-columns:1fr 50px ; */
  grid-template-columns:1fr;
  transform: grid-template-columns 600ms;
}
#nav .search-container .search .search-field-container { 
  grid-column: 1;
}
#nav .search-container .search .menu.cta { 
  grid-column: 3;
  align-self: center;
}

.search-filler {
  /* color: grey; */
  color: #272727 !important;
}



.cta-input {
/*   display: flex;
  align-items: center !important */
}
.search-field-container {
/*   display: flex;
  justify-content: center;
  min-width: 18px;
  min-height: 18px; */
}

#nav .search-container .search-input .search .search-field-container .search-filler .filler {
  background-color: #FBFBFB;
}
#nav:hover .search-container .search-input .search .search-field-container .search-filler .filler {
}

#nav .search-container .search-input .search .search-field-container .search-filler {
}

.search-field {
  border-radius: 45px;
}



.search-field {
}



#nav .search-container .search .search-field-container {
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
/*   width: fit-content; */
    align-items: center;
    margin: 0;
}




#nav .search-container .search .menu.cta  {
  display: grid;
  opacity: 1;
  grid-column: 4;
  /* background-color: black; */
  height: 0px;
  width: 0px;
  transition-delay: 0s;
  transition-duration: 0.3s;
}
#nav:hover .search-container .search .menu.cta  {
  display: grid;
  opacity: 1;
  grid-column: 4;
  /* background-color: black; */
  height: 50px;
  width: 50px;
  transition-delay: 0s;
  transition-duration: 0.3s;
}

#nav .search-container .search .menu {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  padding: 0px;
  height: 30px;
  width: 30px;
  border-radius: 30px;
  z-index: 3;
  transition-delay: 0s;
  transition-duration: 0.3s;
}
#nav:hover.search-container .search .menu {
}






.cta {
}



#nav .search-container .search span {
  font-size: 15px;
  max-width: fit-content;
  opacity: 1;
}

#nav:hover .search-container .search span {
}


#nav .search-container .search a#category {
 display: grid;
 grid-column: 1;
/*  width: 100%; */
}
#nav .search-container .search a#location {
 pointer-events: visible;
 color: #272727 !important;
 display: grid;
 grid-column: 3;
/*  width: 100%; */
}
#nav .search-container .search .search-field {
  padding: 15px 15px;
  height: max-content;
}
#nav .search-container .search .search-field:hover {
/*     padding: 12px 18px; */
}
#nav .search-container .search .search-field#category {
  grid-column: 1;
}
#nav .search-container .search .search-field#location {
  pointer-events: visible;
  grid-column: 3;
}
#nav:hover .search-container .search .search-field {
}




#nav .search-container .search .search-field .cta {
}









#nav .search-container .search .search-field#category .cta, 
#nav .search-container .search .search-field#location .cta  {
  justify-self: start;
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 3px;
}
#nav .search-container .search .search-field#location .cta,
#nav .search-container .search .search-field#category .cta{
  display: grid;
  grid-template-columns: 1fr;
}
#nav .search-container .search .search-field .cta .cta-icon {
  display: grid;
  grid-column: 1;
  width: 20px;
  height: 20px;
  border-radius: 30px;
/*   background-color: black; */
  transition-delay: 0.0s;
  transition-duration: 0.6s;
}
#nav .search-container .search .search-field .cta .cta-icon i {
}
#nav .search-container .search .search-field .cta .cta-input  {
  display: grid;
  align-content: center;
}
#nav .search-container .search .search-field#category .cta .cta-input  {
  grid-column: 2;
}
#nav .search-container .search .search-field#location .cta .cta-input  {
  grid-column: 1;
}
#nav:hover .search-container .search .search-field .cta .cta-input {
  grid-column-start: auto;
}
#nav .search-container .search-input .search .search-field-container .search-filler {
    display: grid;
  justify-self: center;
}





#nav:hover .search-container .search .search-field .cta .cta-icon {
}

#nav .search-container .search .search-field-container .lineV {
  height: 15px;
  transition-delay: 0.0s;
  transition-duration: 0.6s;
}
#nav:hover .search-container .search .search-field-container .lineV {
}
/* !!!!!!!!!!!!!!! SEARCH INPUT !!!!!!!!!!!!!!! */













/* !!!!!!!!!!!!!!! CATEGORY SEARCH RESULTS !!!!!!!!!!!!!!! */
#nav .search-container .search-results {
  
}
.search-location-results-list-item, .search-category-results-list-item {
  height: fit-content;
  pointer-events: visible;
  grid-column: 1;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 10px / repeat( 1, 54px);
  margin: 0 auto;
  width: 100%;
  grid-gap: 4.5%;
}

.search-location-results-list-item, .search-category-results-list-item {
  display: grid;
  grid-column: 1;
  grid-row: span 1;
  max-width: 100%;
  align-items: center;
  height: 54px;
  grid-template-columns: [icon-start] 1fr [icon-end gap-start] 0.3fr [gap-end text-start]  9fr [text-end];
}
/* !!!!!!!!!!!!!!! CATEGORY SEARCH RESULTS !!!!!!!!!!!!!!! */









/* !!!!!!!!!!!!!!! CATEGORY SEARCH RESULTS !!!!!!!!!!!!!!! */
#nav .search-container .search-results {
  
}
.search-category-results-list,
.search-location-results-list {
  height: fit-content;
  grid-column: 1;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 10px / repeat( 1, 54px);
  margin: 0 auto;
  width: 100%;
  grid-gap: 4.5%;
}

.search-category-results-list-item, 
.search-location-results-list-item {
  display: grid;
  grid-column: 1;
  grid-row: span 1;
  max-width: 100%;
  align-items: center;
  height: 54px;
  grid-template-columns: [icon-start] 1fr [icon-end gap-start] 0.3fr [gap-end text-start]  9fr [text-end];
}
/* !!!!!!!!!!!!!!! CATEGORY SEARCH RESULTS !!!!!!!!!!!!!!! */








/* !!!!!!!!!!!!!!! SEARCH LOCATION !!!!!!!!!!!!!!! */

#nav .search-container  {
  display: grid;
  grid-template-columns: 1fr;
  border-radius: 30px;
}
#search-location-results, 
#search-category-results {
  display: none;
/*   display: grid; */
}

.search-location-results-container, .search-category-results-container {
  display: grid;
  grid-template-columns: 15px 15px;
  height: fit-content;
  max-width: 100%;
}

.search-location-results-split, .search-category-results-split {
  display: grid;
  width: -webkit-fill-available;
  grid-template-columns: 1fr 3fr;
  padding: 21px;
  border-radius: 30px;
  height: 100%;
}

.search-category-results-card {
  display: grid;
  grid-column: 2 / 5;
  grid-template-columns: 30.75% 30.75% 30.75%;
  grid-auto-columns: 15px;
  gap: 9px;
}

.search-location-results-card {
  display: grid;
  grid-column: 2 / 5;
  grid-template-rows: 30.75% 30.75% 30.75%;
  grid-auto-rows: 15px;
  gap: 9px;
}

.search-location-results-card-item, .search-category-results-card-item { 
  display: grid;
  height: fit-content;
}

.search-location-results-card-item {
  grid-column: 1 / -1;
}

.card-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}

.card-item-img {
  width: 100%;
  aspect-ratio: 1.414/1;
  /* background-color: grey; */
  border-radius: 15px;
}
.card-item-text {
  
}

.search-category-results-list {
  height: fit-content;
  grid-column: 1;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 10px / repeat( 1, 54px);
  margin: 0 auto;
  width: 100%;
  grid-gap: 4.5%;
}
.search-category-results-list-item {
  display: grid;
  grid-column: 1;
  grid-row: span 1;
  max-width: 100%;
  align-items: center;
  height: 54px;
  grid-template-columns: [icon-start] 1fr [icon-end gap-start] 0.3fr [gap-end text-start]  9fr [text-end];
}

.search-location-results-list {
  height: fit-content;
  grid-column: 1;
  display: grid;
  grid-template-row: 1fr;
  grid-template-rows: 10px / repeat( 1, 54px);
  margin: 0 auto;
  width: 100%;
  grid-gap: 4.5%;
}
.search-location-results-list-item {
  display: grid;
  grid-column: 1;
  grid-row: span 1;
  max-width: 100%;
  align-items: center;
  height: 54px;
  grid-template-rows: [icon-start] 1fr [icon-end gap-start] 0.3fr [gap-end text-start]  9fr [text-end];
}

.list-item-img-container {
  display: grid;
  grid-column: icon-start / icon-end; 
  flex-direction: column;
  max-width: 100%;
  align-content: center;
  height: 54px;
}

.list-item-img {
  grid-column: 1;
  width: 100%;
  aspect-ratio: 1/1;
  /* background-color: grey; */
  border-radius: 15px;
}
.list-item-text {
  grid-column: text-start / text-end;
}
/* !!!!!!!!!!!!!!! SEARCH LOCATION !!!!!!!!!!!!!!! */










/* !!!!!!!!!!!!!!! SEARCH CATEGORY !!!!!!!!!!!!!!! */
#nav .search-container .search-category-results, 
#nav .search-container .search-location-results  {
  display: grid;
  grid-template-columns: 1fr;
/*   position: relative; */
  border-radius: 30px;
  width: 100%;
}
 .search-category-results-split, 
 .search-location-results-split {
   position: absolute;
   grid-column: 1;
}

.search-category-results-container, 
.search-location-results-container {
  display: grid;
  grid-template-columns: 15px 15px;
  height: fit-content;
  max-width: 100%;
}

.search-category-results-split, 
.search-location-results-split {
  display: grid;
  width: -webkit-fill-available;
  grid-column-start: 0;
  grid-column-end: 1;
  max-width: 100%;
  padding: 21px;
  border-radius: 30px;
  height: 100%;
}
.search-category-results-split {
/*   background-color: yellow; */
}
.search-location-results-split {
/*   background-color: orange; */
}





.search-category-results-card, 
.search-location-results-card {
  display: grid;
}
.search-category-results-card {
  grid-column: 2;
  grid-template-columns: 30.75% 30.75% 30.75%;
  grid-auto-columns: 15px;
}
.search-location-results-card {
  grid-column: 2;
  grid-template-rows: 10px / repeat( 1, 30.75%);
  grid-auto-rows: 15px;
}

.search-category-results-card-item, 
.search-location-results-card-item {
  display: grid;
  height: fit-content;
  grid-column: 1 / -1;
}

.card-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}

.card-item-img {
  width: 100%;
  aspect-ratio: 1.414/1;
  /* background-color: grey; */
  border-radius: 15px;
}
.card-item-text {
  
}




























body {
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
}

.lineV {
  display: 100%;
  width: 0px;
  outline-style: solid;
  outline-width: 0.5px;
  outline-color: #C0C5C6;
}
.ink {
  color: black;
}



















.search-category, 
.search-location {
  position: absolute;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
/*   grid-template-rows: 42px 1fr; */
  width: -webkit-fill-available;
  grid-column: 1;
}
#nav:hover .search-category, 
#nav:hover .search-location {
    grid-template-columns: 1fr 50px 1fr 50px;
}

#nav .search-container .search .search-field#category,
#nav .search-container .search .search-field#location {
    display: grid;
    pointer-events: visible;
}
#nav .search-container .search .search-field#category {
    grid-column: 1;
    grid-row: 1;
}
#nav .search-container .search .search-field#location {
    grid-column: 3;
    grid-row: 1;
}

#nav .search-container .search-category-results,
#nav .search-container .search-location-results {
  /*     display: grid; */
    display: none;
    pointer-events: visible;
    grid-column: 1 / 5;
    grid-template-rows: 15px 1fr;
    align-items: baseline;
    border-radius: 30px;
    grid-row: 3;
    background-color: #ffffff00;
/*     align-items: baseline;
    align-content: baseline;
    align-self: baseline; */
    /* width: 100%; */
}
.search-category, 
.search-location {
    /* grid-column: 3; */
    position: absolute;
    display: grid;
/*     align-items: center; */
/*     align-content: center; */
    align-self: baseline;
    grid-template-columns: 1fr 50px 1fr;
/*     grid-template-rows: 42px 3fr; */
    width: -webkit-fill-available;
/*     height: -webkit-fill-available; */
    grid-column: 1;
}
.search-category:hover, 
.search-location:hover {
    grid-template-columns: 1fr 50px 1fr 50px;
}

#nav .search-container .search .search-field-container {
    display: grid;
    grid-template-columns: 1fr 50px 1fr;
    /* width: fit-content; */
/*     position: absolute; */
    align-items: center;
    margin: 0;
}


.search-category-results-split, 
.search-location-results-split {
    display: grid;
    width: -webkit-fill-available;
    /* background-color: #FBFBFB; */
    /* outline-style: solid;  
    outline-width: 0.5px;
    outline-color: #C0C5C6; */
    grid-column-start: 0;
    grid-column-end: 1;
    max-width: 100%;
    grid-column: 1;
    grid-row: 2;
    padding: 21px;
    border-radius: 30px;
    height: auto;
}

.search {
  position: relative;
}

#nav .search-container .search-input .search .search-field-container .search-filler, .search-filler  {
    display: grid;
    grid-column: 2;
    justify-self: center;
  /* padding: 16px; */
}

.search-category, 
.search-location {
/*   column-gap: 9px; */
}


#search-category-results,
#search-location-results{
  display: none;
/*   display: grid; */
}

.list-item-title {
  grid-column: 1 / 4;
  height: 30px;
}








#search-bar { 
  flex-direction: row;
  display:flex; 
  gap: 30px;
  /* position: absolute;  */
  top: 300px; 
  left: 50px;
  z-index: 3; 
}

.searchBar-categoryType, .search-filler {
  place-self: center;
  color: #272727;
}
.search input, input[type="text"] {
  color: #272727;
  
}

.geocoder, .category
{  
  /* min-width: 150px; */
  width: 100%;
  z-index: 3; 
}
.geocoder {
    position: relative !important;
    z-index: 1;
    /* width: 25vw; */
    /* left: 50%; */
    /* margin-left: -25%; */
    /* top: 10px; */
}









/* HOVER */
/* Default state for search icon */
.searchBar-cta .menu-icon.icon-Search-21px {
  display: none; /* Initially hidden */
  grid-column: 24 / 35; /* Your initial grid column settings */
}

/* Hover state when nav-main is hovered */
.nav-main:hover .searchBar-cta .menu-icon.icon-Search-21px {
  display: block; /* Visible on hover */
  grid-column: 16 / 43 !important; /* Updated grid column settings */
}
`;


  // Apply hero styles to the document
const search = document.createElement('style');
search.textContent = searchStyle;
document.head.appendChild(search);
