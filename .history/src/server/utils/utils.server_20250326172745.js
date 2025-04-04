// Server-side utilities only
import axios from 'axios';

export const makeServerRequest = async (url, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('[Server] Request failed:', error.message);
    throw error;
  }
};

// Function to get current store slug
export const getCurrentStoreSlug = async () => {
  try {
    // Make a POST request to the current store endpoint
    const response = await makeServerRequest('http://localhost:6000/api/stores/current', 'GET');
    console.log('[Server] Current store data:', response);
    return response.slug;
  } catch (error) {
    console.error('[Server] Error getting current store slug:', error.message);
    // Return default slug if request fails
    return 'ca-los-angeles-county-cerritos-smoking-tiger-bread-factory';
  }
};

// Parse request URL
export const parseRequestUrl = () => {
  const url = window.location.pathname.toLowerCase();
  const request = url.split("/");
  return {
    resource: request[1],
    slug: request[2]?.replace(/_/g, '-'), // Convert underscores to hyphens
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