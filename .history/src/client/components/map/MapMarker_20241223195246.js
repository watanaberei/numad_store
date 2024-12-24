// src/component/MapMarker.js
import createMapCard from "./card-map.js";

export function createMapMarker(store, map, onClick) {
  
  const marker = document.createElement('a');
  marker.className = 'card-postCarousel-item';
  marker.href = '/'+variant+'/'+slug;
  marker.rel = 'noopener noreferrer nofollow';
  marker.target = categoryType + '-${store.sys.id}';
  marker.onclick = function() {
    mapRoute(userCoordinates, store.geometry.coordinates);
  };
  const cardContainer = document.createElement('div');
  cardContainer.className = 'cards-container';
    const { tag, slug, media, categoryType, headline } = store.properties;
  const { geometry } = store.geometry;
  const tags = tag && tag.length ? tag[0].tags : [];
  const title = headline || [];

  // Check if the categoryType property exists and is not "userLocation"
  if (categoryType.categoryType && categoryType.categoryType !== 'userLocation') {
    marker.className = 'icon-mapMarker-' + categoryType.categoryType;
  } else {
    // Assign the default class name if the categoryType is not available or is "userLocation"
    marker.className = 'icon-mapMarker-default';
  }
  
  // console.log("store.geometry.coordinates", store.geometry.coordinates);
  
  new mapboxgl.Marker(marker)
    .setLngLat(store.geometry.coordinates)
    .addTo(map);
  return marker;
}

 






// const CustomMarker = (stores) => {
//     const { name, address, phone } = stores.properties;
//     const marker = document.createElement('div');
//     marker.className = 'custom-marker';
//     marker.title = name;
//     // create and add icon image to marker
//     const icon = document.createElement('img');
//     icon.src = '_assets/_brand/symbol/map/neumad-mapMarker-favicon-green.svg';
//     marker.appendChild(icon);
    
//     // create and add popup to marker
//     const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
//         <h3>${name}</h3>
//         <p>${address}</p>
//         <p>${phone}</p>
//     `);
//     marker.addEventListener('mouseenter', () => popup.addTo(map));
//     marker.addEventListener('mouseleave', () => popup.remove());
    
//     return new mapboxgl.Marker(marker).setLngLat(stores.geometry.coordinates);
//     };
//     export default CustomMarker;





// import mapboxgl from 'mapbox-gl';

// function Marker(feature) {
//   const el = document.createElement('div');
//   el.className = 'marker';
//   el.style.backgroundImage = `url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)`;
//   el.style.width = '50px';
//   el.style.height = '50px';

//   el.addEventListener('click', () => {
//     window.alert(feature.properties.title);
//   });

//   return new mapboxgl.Marker(el)
//     .setLngLat(feature.geometry.coordinates);
// }
// export default Marker;

// function Marker(feature) {
//     const el = document.createElement('div');
//     el.className = 'marker';
//     el.style.backgroundImage = `url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)`;
//     el.style.width = '50px';
//     el.style.height = '50px';
  
//     el.addEventListener('click', () => {
//       window.alert(feature.properties.title);
//     });
  
//     return new mapboxgl.Marker(el)
//       .setLngLat(feature.geometry.coordinates);
//   }
//   export default Marker;




//   CustomMarker.js:
//   This file should contain the code for creating custom markers with icons, popups, and other styles. You can use the Mapbox API's Maki icon set or create your custom icons with SVG or PNG images. Here is an example CustomMarker component structure:

//   const CustomMarker = (stores) => {
//     const { name, address, phone } = stores.properties;
//     const marker = document.createElement('div');
//     marker.className = 'custom-marker';
//     marker.title = name;
//     // create and add icon image to marker
//     const icon = document.createElement('img');
//     icon.src = 'url/to/custom/icon.png';
//     marker.appendChild(icon);
    
//     // create and add popup to marker
//     const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
//         <h3>${name}</h3>
//         <p>${address}</p>
//         <p>${phone}</p>
//     `);
//     marker.addEventListener('mouseenter', () => popup.addTo(map));
//     marker.addEventListener('mouseleave', () => popup.remove());
    
//     return new mapboxgl.Marker(marker).setLngLat(stores.geometry.coordinates);
//     };
    