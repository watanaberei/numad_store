// src/components/MapApi.js
// import mapboxgl from "mapbox-gl";
// mapboxgl.accessToken =
//   "pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsaHZxdzJrMDBhbjkzZm4weXI1bGlybTMifQ.oQDmvQmIA04AVPDNOV-l8Q";

// src/component/MapApi061223.js
import mapboxgl from 'mapbox-gl';

// mapboxgl.accessToken = 'pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsaHZxdzJrMDBhbjkzZm4weXI1bGlybTMifQ.oQDmvQmIA04AVPDNOV-l8Q';
mapboxgl.accessToken = 'pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsaG53eXJjbjFwbWEzbnFzNms1bzhpYXUifQ.y-7_YrQsMtwBcyreTeqOww';






export function initMap() {
  const defaultCoordinates = [-118.1937, 33.7701]; // Long Beach coordinates

  const map = new mapboxgl.Map({
    container: "map-container",
    // style: "mapbox://styles/neumad/clj0u2c9b00o601pw61e31wdc",
    // style: "mapbox://styles/neumad/clk1hynd6003d01px8uxw4sz8",
    style: "mapbox://styles/neumad/clv1lmab801et01nrck4562dt",
    // style: "mapbox://styles/neumad/cljbyenya003401ps5vqkdya3",
    center: defaultCoordinates,
    pitch: 0,
    bearing: 0,
    zoom: 12,
    maxZoom: 16,
    minZoom: 3,
  });

  // Boundaries
  map.on("load", function () {
    map.resize();

    // -----------------FOG----------------- //
    // map.setFog({
    //   range: [-1, 2],
    //   "horizon-blend": 0.15,
    //   color: "white",
    //   "high-color": "#add8e6",
    //   "space-color": "#d8f2ff",
    //   "star-intensity": 0.0,
    // });
    // -----------------FOG----------------- //
    // -----------------BOUNDARIES----------------- //
    ////// SOURCE //////
    map.addSource("counties", {
      type: "vector",
      url: "mapbox://mapbox.82pkq93d",
      promoteId: "mapbox-countries_id",
    });
    map.addSource("admin-1", {
      type: "vector",
      url: "mapbox://mapbox.boundaries-adm1-v4",
      promoteId: "mapbox-boundaries_id",
    });
    // CITY
    map.addSource("city-boundaries", {
      type: "geojson",
      data: "https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/county_unemployment/data.geojson",
    });




    ////// FILTER //////
    let worldviewFilter = [
      "any",
      ["==", "all", ["get", "worldview"]],
      ["in", "US", ["get", "worldview"]],
    ];



   ////// LAYER //////
   map.addLayer({
    'id': 'city-boundaries-layer',
    'type': 'line',
    'source': 'city-boundaries',
    'layout': {},
    'paint': {
      'line-color': '#ffffff',
      'line-opacity': 0.75,
      // 'line-gap-width': 1,
      // 'line-dasharray': [1, 2],
      'line-width': 0.3
    }
  });
    map.addLayer(
      {
        id: "admin-1-fill",
        type: "fill",
        source: "admin-1",
        "source-layer": "boundaries_admin_1",
        filter: worldviewFilter,
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.15,
        },
      },
      // This final argument indicates that we want to add the Boundaries layer
      // before the `waterway-label` layer that is in the map from the Mapbox
      // Light style. This ensures the admin polygons are rendered below any labels
      "waterway-label"
    );

   map.addLayer(
      {
        id: "counties",
        type: "fill",
        source: "counties",
        "source-layer": "original",
        paint: {
          "fill-outline-color": "#2E4237",
          "fill-color": "#2E4237",
        },
      },
      // Place polygons under labels, roads and ildings.
      "building"
    );

    map.addLayer(
      {
        id: "counties-highlighted",
        type: "fill",
        source: "counties",
        "source-layer": "original",
        paint: {
          "fill-outline-color": "#F3B440",
          "fill-color": "#F3B440",
          "fill-opacity": 1,
        },
        filter: ["in", "FIPS", ""],
      },
      // Place polygons under labels, roads and buildings.
      "building"
    );

    // // Create a layer to display city boundaries
    map.addLayer({
      id: "city-boundaries-layer",
      type: "line",
      source: "city-boundaries",
      paint: {
        "line-color": "#ffffff",
        "line-width": 1,
      },
    });
    // -----------------BOUNDARIES----------------- //





      // -----------------POIS----------------- //
      // MUSEUMS
      map.addSource("museums", {
        type: "vector",
        url: "mapbox://mapbox.2opop9hr",
      });
      map.addLayer({
        id: "museums",
        type: "circle",
        source: "museums",
        layout: {
          // Make the layer visible by default.
          visibility: "visible",
        },
        paint: {
          "circle-radius": 8,
          "circle-color": "rgba(55,148,179,1)",
        },
        "source-layer": "museum-cusco",
      });
      // -----------------POIS----------------- //


      // -----------------BUILDINGS----------------- //
      // 3D building
      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout["text-field"]
      ).id;
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userCoordinates = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        map.setCenter(userCoordinates);
      });
    }
    // window.requestAnimationFrame(frame);
    return map;
  }









export function initNearbyMap() {
  const defaultCoordinates = [-118.1937, 33.7701]; // Long Beach coordinates

  const nearbyMap = new mapboxgl.Map({
    container: "nearbyMap-container",
    // style: "nearbyMapbox://styles/neumad/clj0u2c9b00o601pw61e31wdc",
    style: "Mapbox://styles/neumad/clk1hynd6003d01px8uxw4sz8",
    // style: "nearbyMapbox://styles/neumad/cljbyenya003401ps5vqkdya3",
    center: defaultCoordinates,
    pitch: 0,
    bearing: 0,
    zoom: 12,
    maxZoom: 16,
    minZoom: 3,
  });
 // Boundaries
  nearbyMap.on("load", function () {
    nearbyMap.resize();

    // -----------------FOG----------------- //
    nearbyMap.setFog({
      range: [-1, 2],
      "horizon-blend": 0.15,
      color: "white",
      "high-color": "#add8e6",
      "space-color": "#d8f2ff",
      "star-intensity": 0.0,
    });
    // -----------------FOG----------------- //
   nearbyMap.addSource('my-building-footprints', {
      type: 'vector',
      url: '_assets/geojson/building/RhodeIsland.ldgeojson'
      });
      // Use the source to add a layer to the nearbyMap.
      nearbyMap.addLayer({
      'id': 'buildings-i1',
      'type': 'line',
      'source': 'my-building-footprints',
      'source-layer': 'building_footprints',
      'layout': {
      'line-join': 'round',
      'line-cap': 'round'
      },
      'paint': {
      'line-color': '#ff69b4',
      'line-width': 1
      }
      });


    // -----------------BOUNDARIES----------------- //
    // Add a vector source for admin-1 boundaries
    nearbyMap.addSource("admin-1", {
      type: "vector",
      url: "nearbyMapbox://nearbyMapbox.boundaries-adm1-v4",
      promoteId: "nearbyMapbox_id",
    });

    // Define a filter for US worldview boundaries
    let worldviewFilter = [
      "any",
      ["==", "all", ["get", "worldview"]],
      ["in", "US", ["get", "worldview"]],
    ];

    // Add a style layer with the admin-1 source below nearbyMap labels
    nearbyMap.addLayer(
      {
        id: "admin-1-fill",
        type: "fill",
        source: "admin-1",
        "source-layer": "boundaries_admin_1",
        filter: worldviewFilter,
        paint: {
          "fill-color": "#CCCCCC",
          "fill-opacity": 0.5,
        },
      },
      // This final argument indicates that we want to add the Boundaries layer
      // before the `waterway-label` layer that is in the nearbyMap from the Mapbox
      // Light style. This ensures the admin polygons are rendered below any labels
      "waterway-label"
    );

    nearbyMap.addSource("counties", {
      type: "vector",
      url: "nearbyMapbox://nearbyMapbox.82pkq93d",
    });

    nearbyMap.addLayer(
      {
        id: "counties-highlighted",
        type: "fill",
        source: "counties",
        "source-layer": "original",
        paint: {
          "fill-outline-color": "#484896",
          "fill-color": "#6e599f",
          "fill-opacity": 1,
        },
        filter: ["in", "FIPS", ""],
      },
      // Place polygons under labels, roads and buildings.
      "building"
    );

    // -----------------BOUNDARIES----------------- //

    // -----------------POIS----------------- //
    // MUSEUMS
    nearbyMap.addSource("museums", {
      type: "vector",
      url: "nearbyMapbox://nearbyMapbox.2opop9hr",
    });
    nearbyMap.addLayer({
      id: "museums",
      type: "circle",
      source: "museums",
      layout: {
        // Make the layer visible by default.
        visibility: "visible",
      },
      paint: {
        "circle-radius": 8,
        "circle-color": "rgba(55,148,179,1)",
      },
      "source-layer": "museum-cusco",
    });
    // -----------------POIS----------------- //
    // -----------------BUILDINGS----------------- //
    // 3D building
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
      (layer) => layer.type === "symbol" && layer.layout["text-field"]
    ).id;
    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.addLayer(
      {
        id: "add-3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
      paint: {
          "fill-extrusion-color": "#aaa",

          // Use an 'interpolate' expression to
          // add a smooth transition effect to
          // the buildings as the user zooms in.
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
         ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId
    );
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userCoordinates = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      map.setCenter(userCoordinates);
    });
  }
  window.requestAnimationFrame(frame);
  return map;
}
