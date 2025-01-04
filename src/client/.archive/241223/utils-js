// src/utils.js
export const parseRequestUrl = () => {
  const url = window.location.pathname.toLowerCase();
  const request = url.split("/");
  return {
    resource: request[1],
    slug: request[2],
    verb: request[3],
  };
};

export const sortByDistance = (selectedLocation, data) => {
  if (!selectedLocation) {
    return data;
  }

  return data.slice().sort((a, b) => {
    if (!a.geometry || !a.geometry.coordinates || !b.geometry || !b.geometry.coordinates) {
      return 0;
    }

    const distanceA = Math.sqrt(
      Math.pow(selectedLocation[0] - a.geometry.coordinates[0], 2) +
        Math.pow(selectedLocation[1] - a.geometry.coordinates[1], 2)
    );
    const distanceB = Math.sqrt(
      Math.pow(selectedLocation[0] - b.geometry.coordinates[0], 2) +
        Math.pow(selectedLocation[1] - b.geometry.coordinates[1], 2)
    );

    return distanceA - distanceB;
  });
};


// export const parseRequestUrl = () => {
//   const url = document.location.hash.toLowerCase();
//   const request = url.split('/');
//   return {
//     resource: request[1],
//     id: request[2],
//     action: request[3],
//   };
// };














// export function sortByDistance(selectedLocation, blogData) {
//   if (!selectedLocation || !Array.isArray(blogData)) return blogData;

//   return blogData.sort((a, b) => {
//     if (!a.geometry || !a.geometry.coordinates || !b.geometry || !b.geometry.coordinates) {
//       return 0;
//     }
//     const aDist = distance(selectedLocation, a.geometry.coordinates);
//     const bDist = distance(selectedLocation, b.geometry.coordinates);
//     return aDist - bDist;
//   });
// }

// export const parseRequestUrl = () => {
//   const url = document.location.hash.toLowerCase();
//   const request = url.split("/");
//   return {
//     resource: request[1],
//     category: request[2],
//     slug: request[3],
//     verb: request[4],
//   };
// };

// function distance(coord1, coord2) {
//   const R = 6371e3; // Earth's radius in meters
//   const lat1 = (coord1[1] * Math.PI) / 180;
//   const lat2 = (coord2[1] * Math.PI) / 180;
//   const deltaLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
//   const deltaLng = ((coord2[0] - coord1[0]) * Math.PI) / 180;

//   const a =
//     Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c;
// }




// export const parseRequestUrl = () => {
//   const url = document.location.hash.toLowerCase();
//   const request = url.split("/");
//   return {
//     resource: request[1],
//     slug: request[2],
//     verb: request[3],
//   };
// };








// export const parseRequestUrl = () => {
//   const url = document.location.hash.toLowerCase();
//   const request = url.split("/");
//   return {
//     resource: request[1],
//     category: request[2],
//     slug: request[3],
//     verb: request[4],
//   };
// };








// LOADER
// export const showLoading = () => {
//   document.getElementById("loading").classList.add("active");
// };

// export const hideLoading = () => {
//   document.getElementById("loading").classList.remove("active");
// };