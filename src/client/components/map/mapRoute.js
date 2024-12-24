// src/components/mapRoute.js
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

const mapRoute = (userLocation, postLocations) => {
  console.log("User Location: ", userLocation);
  console.log("Post Locations: ", postLocations);

  // Ensure that userLocation is an array of [longitude, latitude]
  if (!Array.isArray(userLocation) || userLocation.length !== 2) {
    throw new Error('userLocation must be an array of [longitude, latitude]');
  }

  // Ensure that postLocations is an array of Features with Point geometry
  if (!Array.isArray(postLocations) || !postLocations.every(loc => loc.geometry && Array.isArray(loc.geometry.coordinates) && loc.geometry.coordinates.length === 2)) {
    throw new Error('postLocations must be an array of Features with Point geometry');
  }

  const optimizedRoute = calculateOptimizedRoute(userLocation, postLocations);
  drawRoute(optimizedRoute);
}

const calculateOptimizedRoute = (startLocation, locations) => {
  console.log("Start Location: ", startLocation);
  console.log("Locations: ", locations);

  const points = locations.map(loc => {
    console.log("Location being converted to point: ", loc);
    return turf.point([loc.geometry.coordinates[0], loc.geometry.coordinates[1]]);
  });

  const pointsCollection = turf.featureCollection(points); // Convert points array to featureCollection
  console.log("Points Collection: ", pointsCollection);

  // Create lineString from startLocation to all post locations
  const lines = locations.map(loc => turf.lineString([startLocation, [loc.geometry.coordinates[0], loc.geometry.coordinates[1]]]));

  const optimizedPoints = lines.map(line => turf.nearestPointToLine(line, pointsCollection));
  console.log("Optimized Points: ", optimizedPoints);

  return optimizedPoints.map(point => point.geometry.coordinates);
}



const drawRoute = (route) => {
  if (map.getLayer("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }

  map.addLayer({
    id: "route",
    type: "line",
    source: {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route
        }
      }
    },
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#ff0000",
      "line-width": 100
    }
  });
}

export default mapRoute;
