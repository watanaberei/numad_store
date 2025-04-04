// Server-side utilities only
import axios from 'axios';

const DEFAULT_STORE_SLUG = 'ca-los-angeles-county-cerritos-smoking-tiger-bread-factory';

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

    console.log('[Server] Making request:', { url, method });
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
    // Make a GET request to the current store endpoint
    const response = await makeServerRequest('http://localhost:6000/api/stores/current', 'GET');
    console.log('[Server] Current store data:', response);
    return response?.slug || DEFAULT_STORE_SLUG;
  } catch (error) {
    console.error('[Server] Error getting current store slug:', error.message);
    // Return default slug if request fails
    return DEFAULT_STORE_SLUG;
  }
};

// Parse request URL and normalize slug
export const parseRequestUrl = () => {
  const url = window.location.pathname.toLowerCase();
  const request = url.split("/");
  
  // Get the slug and try both formats
  const rawSlug = request[2] || '';
  const slugWithHyphens = rawSlug.replace(/_/g, '-');
  const slugWithUnderscores = rawSlug.replace(/-/g, '_');
  
  return {
    resource: request[1],
    slug: slugWithHyphens, // Default to hyphenated version for URLs
    slugDb: slugWithUnderscores, // Database version with underscores
    verb: request[3],
  };
};

// Helper to normalize store slugs
export const normalizeSlug = (slug) => {
  if (!slug) return '';
  return slug.toLowerCase().replace(/_/g, '-');
};

// Helper to format slug for database
export const formatSlugForDb = (slug) => {
  if (!slug) return '';
  return slug.toLowerCase().replace(/-/g, '_');
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