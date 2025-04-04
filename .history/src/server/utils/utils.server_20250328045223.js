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
    // console.error('Server request failed:', error);
    throw error;
  }
};

// Server-side URL parsing function
export const parseServerUrl = (url) => {
  try {
    const path = url.split('?')[0]; // Remove query parameters
    const request = path.split('/').filter(Boolean); // Split and remove empty strings
    return {
      resource: request[0] || '',
      slug: request[1] || '',
      verb: request[2] || ''
    };
  } catch (error) {
    console.error('[parseServerUrl] Error parsing URL:', error);
    return {
      resource: '',
      slug: '',
      verb: ''
    };
  }
};

// Function to get current store slug
export const getCurrentStoreSlug = async (req) => {
  try {
    // Parse URL from request
    const parsedUrl = parseServerUrl(req.url);
    console.log('[getCurrentStoreSlug] Parsed URL:', parsedUrl);
    
    if (!parsedUrl.slug) {
      console.log('[getCurrentStoreSlug] No slug found in URL');
      return null;
    }

    return parsedUrl.slug;
  } catch (error) {
    console.error('[getCurrentStoreSlug] Error getting store slug:', error);
    return null;
  }
};

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