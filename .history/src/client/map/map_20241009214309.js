import mapboxgl from 'mapbox-gl';
import { mapRadiusData } from '../../server/data/data.js';  // Import the necessary data



mapboxgl.accessToken = 'pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsaG53eXJjbjFwbWEzbnFzNms1bzhpYXUifQ.y-7_YrQsMtwBcyreTeqOww';

// Initialize the map
export function initMap() {
  const map = new mapboxgl.Map({
    container: 'map',  // This remains in components.js
    style: 'mapbox://styles/neumad/cm0beal5x00rc01rb852b4m4z',
    center: [-77.034084142948, 38.909671288923],
    zoom: 13,
    scrollZoom: false
  });

  // Use the data from data.js
  const stores = {
    type: 'FeatureCollection',
    features: mapRadiusData.stores,
  };

  stores.features.forEach((store, i) => {
    store.properties.id = i;
  });

  // Add map source and setup markers


   // Add the DEM source for terrain
   map.on('load', function () {
    map.addSource("places", { type: "geojson", data: stores });
    // map.addSource('places', {
    //     type: 'geojson',
    //     data: stores
    //   });
    // map.addSource('mapbox-dem', {
    //   'type': 'raster-dem',
    //   'url': 'mapbox://mapbox.terrain-rgb',  // This is the correct terrain source URL
    //   'tileSize': 512,
    //   'maxzoom': 14
    // });

    // Set the terrain with exaggeration
    // map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

    // Optional: Add a sky layer to visualize the terrain more clearly
    map.addLayer({
      'id': 'sky',
      'type': 'sky',
      'paint': {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
      }
    });

    // Add markers and listings, as in your current implementation
    const stores = {
      type: 'FeatureCollection',
      features: mapRadiusData.stores
    };
    stores.features.forEach((store, i) => store.properties.id = i);
    buildLocationList(stores);
    addMarkers(map, stores);
  });
}



  // Add markers to the map
  function addMarkers(map, stores) {
    for (const marker of stores.features) {
      const el = document.createElement('div');
      el.id = `marker-${marker.properties.id}`;
      el.className = 'marker';

      new mapboxgl.Marker(el, { offset: [0, -23] })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);

      el.addEventListener('click', function (e) {
        flyToStore(map, marker);
        createPopUp(map, marker);
        highlightListing(marker.properties.id);
      });
    }
  }

  // Build the listing in the sidebar
//   function buildLocationList(stores) {
//     for (const store of stores.features) {
//       const listings = document.getElementById('listings');
//       const listing = listings.appendChild(document.createElement('div'));
//       listing.id = `listing-${store.properties.id}`;
//       listing.className = 'item';

//       const link = listing.appendChild(document.createElement('a'));
//       link.href = '#';
//       link.className = 'title';
//       link.id = `link-${store.properties.id}`;
//       link.innerHTML = `${store.properties.address}`;

//       const details = listing.appendChild(document.createElement('div'));
//       details.innerHTML = `${store.properties.city}`;
//       if (store.properties.phone) {
//         details.innerHTML += ` &middot; ${store.properties.phoneFormatted}`;
//       }

//       link.addEventListener('click', function () {
//         flyToStore(map, store);
//         createPopUp(map, store);
//         highlightListing(store.properties.id);
        
//       });
//       //     map.on("load", () => {
// //       map.addSource("places", { type: "geojson", data: stores });
// //       buildLocationList(stores);
// //       addMarkers();
// //     });
//     }
//   }

  // Fly to store location
  function flyToStore(map, currentFeature) {
    map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 15
    });
  }

  // Create a popup for the store
  function createPopUp(map, currentFeature) {
    const popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();

    new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(`<h3>${currentFeature.properties.address}</h3>`)
      .addTo(map);
  }

  // Highlight selected listing
  function highlightListing(id) {
    const activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
      activeItem[0].classList.remove('active');
    }
    const listing = document.getElementById(`listing-${id}`);
    listing.classList.add('active');
  }

    function buildLocationList(stores) {
      for (const store of stores.features) {
        const listings = document.getElementById("listings");
        const listing = listings.appendChild(document.createElement("div"));
        listing.id = `listing-${store.properties.id}`;
        listing.className = "item";

        const link = listing.appendChild(document.createElement("a"));
        link.href = "#";
        link.className = "title";
        link.id = `link-${store.properties.id}`;
        link.innerHTML = `${store.properties.address}`;

        const details = listing.appendChild(document.createElement("div"));
        details.innerHTML = `${store.properties.city}`;
        if (store.properties.phone) {
          details.innerHTML += ` &middot; ${store.properties.phoneFormatted}`;
        }

        link.addEventListener("click", function() {
          for (const feature of stores.features) {
            if (this.id === `link-${feature.properties.id}`) {
              flyToStore(feature);
              createPopUp(feature);
            }
          }
          const activeItem = document.getElementsByClassName("active");
          if (activeItem[0]) {
            activeItem[0].classList.remove("active");
          }
          this.parentNode.classList.add("active");
        });
      }
    }

    function flyToStore(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15
      });
    }

    function createPopUp(currentFeature) {
      const popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0]) popUps[0].remove();
      new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(`<h3>${currentFeature.properties.address}</h3>`)
        .addTo(map);
    }
//   }
// };









// export const mapRadiusComponent = {
//   render: () => {
//     return `
//       <div class="location col04">
//         <div class="map-container">
//           <div id="mapRadiusComponent">
//             <div id="map" class="map"></div>
//             <div id="listings" class="listings"></div>
//           </div>
//         </div>
//       </div>
//     `;
//   },

//   afterRender: () => {
//     mapboxgl.accessToken = 'pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsaG53eXJjbjFwbWEzbnFzNms1bzhpYXUifQ.y-7_YrQsMtwBcyreTeqOww';

//     const map = new mapboxgl.Map({
//       container: "map", // Render map in this container
//       style: "mapbox://styles/neumad/cm0beal5x00rc01rb852b4m4z",
//       center: [-77.034084142948, 38.909671288923],
//       zoom: 13,
//       scrollZoom: false
//     });

//     const stores = {
//       type: "FeatureCollection",
//       features: mapRadiusData.stores // Use data imported from data.js
//     };

//     stores.features.forEach((store, i) => {
//       store.properties.id = i;
//     });

//     map.on("load", () => {
//       map.addSource("places", { type: "geojson", data: stores });
//       buildLocationList(stores);
//       addMarkers();
//     });

//     function addMarkers() {
//       for (const marker of stores.features) {
//         const el = document.createElement("div");
//         el.id = `marker-${marker.properties.id}`;
//         el.className = "marker";

//         new mapboxgl.Marker(el, { offset: [0, -23] })
//           .setLngLat(marker.geometry.coordinates)
//           .addTo(map);

//         el.addEventListener("click", e => {
//           flyToStore(marker);
//           createPopUp(marker);
//           const activeItem = document.getElementsByClassName("active");
//           e.stopPropagation();
//           if (activeItem[0]) {
//             activeItem[0].classList.remove("active");
//           }
//           const listing = document.getElementById(`listing-${marker.properties.id}`);
//           listing.classList.add("active");
//         });
//       }
//     }

//     function buildLocationList(stores) {
//       for (const store of stores.features) {
//         const listings = document.getElementById("listings");
//         const listing = listings.appendChild(document.createElement("div"));
//         listing.id = `listing-${store.properties.id}`;
//         listing.className = "item";

//         const link = listing.appendChild(document.createElement("a"));
//         link.href = "#";
//         link.className = "title";
//         link.id = `link-${store.properties.id}`;
//         link.innerHTML = `${store.properties.address}`;

//         const details = listing.appendChild(document.createElement("div"));
//         details.innerHTML = `${store.properties.city}`;
//         if (store.properties.phone) {
//           details.innerHTML += ` &middot; ${store.properties.phoneFormatted}`;
//         }

//         link.addEventListener("click", function() {
//           for (const feature of stores.features) {
//             if (this.id === `link-${feature.properties.id}`) {
//               flyToStore(feature);
//               createPopUp(feature);
//             }
//           }
//           const activeItem = document.getElementsByClassName("active");
//           if (activeItem[0]) {
//             activeItem[0].classList.remove("active");
//           }
//           this.parentNode.classList.add("active");
//         });
//       }
//     }

//     function flyToStore(currentFeature) {
//       map.flyTo({
//         center: currentFeature.geometry.coordinates,
//         zoom: 15
//       });
//     }

//     function createPopUp(currentFeature) {
//       const popUps = document.getElementsByClassName("mapboxgl-popup");
//       if (popUps[0]) popUps[0].remove();
//       new mapboxgl.Popup({ closeOnClick: false })
//         .setLngLat(currentFeature.geometry.coordinates)
//         .setHTML(`<h3>${currentFeature.properties.address}</h3>`)
//         .addTo(map);
//     }
//   }
// };