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

export const showLoading = () => {
  document.getElementById("loading")?.classList.add("active");
};

export const hideLoading = () => {
  document.getElementById("loading")?.classList.remove("active");
};