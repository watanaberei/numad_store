// src/components/mapRoute.js
import mapboxgl from "mapbox-gl";
import polyline from "@mapbox/polyline";

const YOUR_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibmV1bWFkIiwiYSI6ImNsa3R6aG93YzAyeDUzZXBoY2h6ZDBjN2gifQ.ef675JLTqdzPlw1tu_wHOA";

export default function mapRoute(userCoordinates, storeCoordinates) {
  if (!userCoordinates || !storeCoordinates) {
    console.error('Invalid coordinates provided to mapRoute');
    return;
  }

  // Ensure coordinates are in the correct format
  const userLonLat = Array.isArray(userCoordinates) ? userCoordinates : [userCoordinates.longitude, userCoordinates.latitude];
  const storeLonLat = Array.isArray(storeCoordinates) ? storeCoordinates : [storeCoordinates.longitude, storeCoordinates.latitude];

  // Create a Feature object for the route
  const routeFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: storeLonLat
    },
    properties: {}
  };

  // Create an array of features for the route
  const postLocations = [routeFeature];

  const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLonLat[0]}%2C${userLonLat[1]}%3B${storeLonLat[0]}%2C${storeLonLat[1]}?alternatives=false&geometries=polyline&language=en&overview=simplified&steps=true&access_token=${YOUR_MAPBOX_ACCESS_TOKEN}`;

  fetch(directionsUrl)
    .then(response => response.json())
    .then(data => {
      if (!data.routes || !data.routes[0]) {
        console.error('No route data received');
        return;
      }

      const route = data.routes[0].geometry;
      const routeId = 'route';
      const decoded = polyline.toGeoJSON(route);

      // Remove existing route if it exists
      if (window.map.getLayer(routeId)) {
        window.map.removeLayer(routeId);
        window.map.removeSource(routeId);
      }

      // Add new route
      window.map.addLayer({
        id: routeId,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: decoded,
          },
        },
        paint: {
          'line-width': 2,
          'line-color': '#007cbf',
        },
      });

      // Fly to the route
      window.map.fitBounds(decoded.bbox, {
        padding: 50,
        duration: 1000
      });
    })
    .catch(error => {
      console.error('Failed to fetch route data:', error);
    });
}
