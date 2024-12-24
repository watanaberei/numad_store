// src/components/MapBlog.js

// const MapBlog = {
//     render: (dataItem) => {
//       return `
//           <!--HTML Template--> 
//           <div class="html-class"> 
//               <a href="/path/${dataItem.slug}">
//                 <img src="${dataItem.thumbnail.url}" alt="" /></a>
//               <div class="text">
//                 <a href="/path/${dataItem.slug}">
//                       <span class="title">
//                       ${dataItem.title} 
//                       </span> 
//                       <span class="overview">
//                         ${dataItem.overview}
//                       </span>
//                 </a>
//               </div>
//             </div>`;
//     },
//   };
  
//   export default MapBlog;
  
  









// import "mapbox-gl/dist/mapbox-gl.css";
// import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
// import React, { useState } from "react";
// import { render } from "react-dom";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./App.css"
// import Home from "./pages/Home";
// import Result from "./pages/Result"

// // Please be a decent human and don't abuse my Mapbox API token.
// // If you fork this sandbox, replace my API token with your own.
// // Ways to set Mapbox token: https://uber.github.io/react-map-gl/Documentation/getting-started/about-mapbox-tokens
// const MAPBOX_TOKEN =
//   "pk.eyJ1IjoiZGV2bGlucm9jaGEiLCJhIjoiY2t2bG82eTk4NXFrcDJvcXBsemZzdnJoYSJ9.aq3RAvhuRww7R_7q-giWpA";

// const App = () => {

//   const [result, setResult] = useState({
//     latitude: 24.8607,
//     longitude: 67.0011,
//     location: "Karachi"
//   });


//   // const onSelected = (viewPort, item) => {
//   //   navigate("/map");
//   //   console.log(viewPort);
//   //   setViewport({ ...viewPort, zoom: viewPort.zoom * 20 });
//   //   console.log('Selected: ', item)
//   // }

//   return (
//     <div style={{ height: "100vh" }}>
//       <Routes>
//         <Route
//           path="/"
//           exact
//           element={
//             <Home result={result} setResult={setResult} />
//           }
//         />
//         <Route
//           path="/result"
//           exact
//           element={
//             <Result result={result} />
//           }
//         />
//       </Routes>
//     </div>
//   );
// };

// render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>,
//   document.getElementById("root")
// );









// 	mapboxgl.accessToken = 'pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsaG53eXJjbjFwbWEzbnFzNms1bzhpYXUifQ.y-7_YrQsMtwBcyreTeqOww';
// const map = new mapboxgl.Map({
// container: 'map', // container ID
// // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
// style: 'mapbox://styles/mapbox/streets-v12', // style URL
// center: [-24, 42], // starting center in [lng, lat]
// zoom: 1 // starting zoom
// });
 
// // Add geolocate control to the map.
// map.addControl(
// new mapboxgl.GeolocateControl({
// positionOptions: {
// enableHighAccuracy: true
// },
// // When active the map will receive updates to the device's location as it changes.
// trackUserLocation: true,
// // Draw an arrow next to the location dot to indicate which direction the device is heading.
// showUserHeading: true
// })
// );