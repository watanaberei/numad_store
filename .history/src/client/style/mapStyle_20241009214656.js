// export const mapRadiusStyle = `
//   .location {
//     display: grid;
//     grid-template-row: auto;
//   }

//   .map-container {
//     width: 100%;
//     overflow: hidden;
//     aspect-ratio: var(--aspect-ratio-4x2) !important;
//     position: relative;
//     border-radius: var(--spacer-gap-s07, 15px);
//     display: flex;
//     flex-direction: column;
//     align-items: flex-start;
//     justify-content: flex-start;
//     flex-shrink: 0;
//     height: 547.5px;
//     position: relative;
//     overflow: hidden;
//   }

//   .map {
//     z-index: 0;
//     height: 100%;
//     width: 100%;
//     aspect-ratio: var(--aspect-ratio-4x2);
//   }

//   .overlay {
//     height: 100%;
//     width: 100%;
//     z-index: 10;
//     padding: var(--spacer-gap-s07, 15px);
//     display: flex;
//     flex-direction: row;
//     gap: 0px;
//     align-items: baseline;
//     justify-content: flex-start;
//     align-self: stretch;
//     flex-shrink: 0;
//     position: relative;
//   }

//   .search {
//     background: #f3f4f9;
//     border-radius: 3px;
//     border-style: solid;
//     border-color: #eaf2f4;
//     border-width: 1px;
//     padding: 12px var(--s01, 12px) 12px var(--s01, 12px);
//     display: flex;
//     flex-direction: row;
//     gap: var(--s02, 36px);
//     align-items: center;
//     justify-content: flex-start;
//     flex-shrink: 0;
//     position: relative;
//     overflow: hidden;
//   }

//   ._11900-south-st-ste-134-cerritos-ca-90703 {
//     color: var(--ink-black-03, #272727);
//     text-align: right;
//     font-family: "HelveticaNeue-Regular", sans-serif;
//     font-size: 15px;
//     line-height: 21px;
//     letter-spacing: -0.015em;
//     font-weight: 400;
//     position: relative;
//   }
// `;

// // Apply master styles to the document
// const mapStyle = document.createElement('style');
// mapStyle.textContent = mapRadiusStyle;
// document.head.appendChild(mapStyle);




const mapStyle = `
  .location {
  display: grid;
  grid-template-row: auto;
  }
  
      body {
        color: #404040;
        font:
          400 15px/22px 'Source Sans Pro',
          'Helvetica Neue',
          sans-serif;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }

      * {
        box-sizing: border-box;
      }

/*       .sidebar {
        position: absolute;
        width: 33.3333%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: hidden;
        border-right: 1px solid rgb(0 0 0 / 25%);
      } */



      h1 {
        font-size: 22px;
        margin: 0;
        font-weight: 400;
        line-height: 20px;
        padding: 20px 2px;
      }

      a {
        color: #404040;
        text-decoration: none;
      }

      a:hover {
        color: #101010;
      }

      .heading {
        background: #fff;
        border-bottom: 1px solid #eee;
        min-height: 60px;
        line-height: 60px;
        padding: 0 10px;
        background-color: #00853e;
        color: #fff;
      }

      .listings {
        height: 100%;
        overflow: auto;
        padding-bottom: 60px;
      }

      .listings .item {
        display: block;
        border-bottom: 1px solid #eee;
        padding: 10px;
        text-decoration: none;
      }

      .listings .item:last-child {
        border-bottom: none;
      }

      .listings .item .title {
        display: block;
        color: #00853e;
        font-weight: 700;
      }

      .listings .item .title small {
        font-weight: 400;
      }

      .listings .item.active .title,
      .listings .item .title:hover {
        color: #8cc63f;
      }

      .listings .item.active {
        background-color: #f8f8f8;
      }

      ::-webkit-scrollbar {
        width: 3px;
        height: 3px;
        border-left: 0;
        background: rgb(0 0 0 / 10%);
      }

      ::-webkit-scrollbar-track {
        background: none;
      }

      ::-webkit-scrollbar-thumb {
        background: #00853e;
        border-radius: 0;
      }

      .marker {
        border: none;
        cursor: pointer;
        height: 56px;
        width: 56px;
        background-image: url('https://docs.mapbox.com/demos/building-a-store-locator/marker.png');
      }

      /* Marker tweaks */
      .mapboxgl-popup {
        padding-bottom: 50px;
      }

      .mapboxgl-popup-close-button {
        display: none;
      }

      .mapboxgl-popup-content {
        font:
          400 15px/22px 'Source Sans Pro',
          'Helvetica Neue',
          sans-serif;
        padding: 0;
        width: 180px;
      }

      .mapboxgl-popup-content h3 {
        background: #91c949;
        color: #fff;
        margin: 0;
        padding: 10px;
        border-radius: 3px 3px 0 0;
        font-weight: 700;
        margin-top: -15px;
      }

      .mapboxgl-popup-content h4 {
        margin: 0;
        padding: 10px;
        font-weight: 400;
      }

      .mapboxgl-popup-content div {
        padding: 10px;
      }

      .mapboxgl-popup-anchor-top > .mapboxgl-popup-content {
        margin-top: 15px;
      }

      .mapboxgl-popup-anchor-top > .mapboxgl-popup-tip {
        border-bottom-color: #91c949;
      }
    
  .sidebar {
        /* position: absolute; */
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: hidden;
        border-right: 1px solid rgb(0 0 0 / 25%);
      }
`;


const listingStyle = `
  .listings {
  grid-row: span 1;
  grid-column: span 1;
  display: flex !important;
  }
  .lisitings .item {
    aspect-ratio: var(--aspect-ratio-2x2);
    display: block;
    border-bottom: 1px solid #eee;
    padding: 10px;
    text-decoration: none;
  }
  .map-container {
    grid-column: span 1 / -1;
    grid-row: span 1;
  // grid-row: span 1;
  // grid-column: span 1;
  }
.map {
// /* position: absolute; */
/* left: 33.3333%; */
/* width: 66.6666%; */
/*top: 0;
bottom: 0;
*/
}
`

const locationStyle = `
.map-container,
.map-container * {
  box-sizing: border-box;
}
.map-container {
// width: 100%;
// overflow: hidden;
aspect-ratio: var(--aspect-ratio-4x2) !important;
position: relative;
  border-radius: var(--spacer-gap-s07, 15px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  // height: 547.5px;
  position: relative;
  // overflow: hidden;
}
.mapcontainer > .map, .map {
z-index: 0;
// height: 100%;
// width: 100%;
// aspect-ratio: var(--aspect-ratio-4x2);
}
.overlay {
// height: 100%;
// width: 100%;
z-index: 10;
  padding: var(--spacer-gap-s07, 15px);
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: baseline;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.search {
  background: #f3f4f9;
  border-radius: 3px;
  border-style: solid;
  border-color: #eaf2f4;
  border-width: 1px;
  padding: 12px var(--s01, 12px) 12px var(--s01, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--s02, 36px);
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
._11900-south-st-ste-134-cerritos-ca-90703 {
  color: var(--ink-black-03, #272727);
  text-align: right;
  font-family: "HelveticaNeue-Regular", sans-serif;
  font-size: 15px;
  line-height: 21px;
  letter-spacing: -0.015em;
  font-weight: 400;
  position: relative;
}
.copy {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 21px;
  height: 21px;
  position: relative;
  overflow: visible;
}


`;

// Apply global styles to the document
const locationStyleElement = document.createElement('style');
locationStyleElement.textContent = locationStyle + listingStyle + mapStyle;
document.head.appendChild(locationStyleElement);




