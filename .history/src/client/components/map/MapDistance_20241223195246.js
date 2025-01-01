import * as turf from "@turf/turf";

export const calculateDistance = (userLocation, storeLocation) => {
  // Ensure that userLocation and storeLocation are arrays of [longitude, latitude]
  if (!Array.isArray(userLocation) || userLocation.length !== 2 || 
      !Array.isArray(storeLocation) || storeLocation.length !== 2) {
    throw new Error('Locations must be arrays of [longitude, latitude]');
  }

  const from = turf.point(userLocation);
  const to = turf.point(storeLocation);
  const options = {units: 'miles'};  // Change this to 'kilometers' if you want the distance in kilometers

  let distance = turf.distance(from, to, options);
  distance = distance.toFixed(2);  // Round to 2 decimal places
  return distance;
}

// Usage:
const userLocation = [-75.343, 39.984];  // [longitude, latitude]
const storeLocation = [-75.534, 39.123];  // [longitude, latitude]
const distance = calculateDistance(userLocation, storeLocation);
console.log('Distance between user and store is: ', distance);
























// import * as turf from "@turf/turf";


// export const calculateDistance = (userLocation, storeLocation) => {
//   // Ensure that userLocation and storeLocation are arrays of [longitude, latitude]
//   if (!Array.isArray(userLocation) || userLocation.length !== 2 || 
//       !Array.isArray(storeLocation) || storeLocation.length !== 2) {
//     throw new Error('Locations must be arrays of [longitude, latitude]');
//   }

//   const from = turf.point(userLocation);
//   const to = turf.point(storeLocation);
//   const options = {units: 'miles'};  // Change this to 'kilometers' if you want the distance in kilometers

//   const distance = turf.distance(from, to, options);
//   distance.toFixed(2);  // Round to 2 decimal places
//   return distance;
// }

// // Usage:
// const userLocation = [-75.343, 39.984];  // [longitude, latitude]
// const storeLocation = [-75.534, 39.123];  // [longitude, latitude]
// const distance = calculateDistance(userLocation, storeLocation);
// console.log('Distance between user and store is: ', distance);

// // console.log('DDDDDistance between user and store is: ', distance.toFixed(2), 'miles');