// Client-side path handling utilities
export const resolveApiPath = (endpoint) => {
  const API_URL = 'http://localhost:4500'; // or your API URL
    // const API_URL = 'http://localhost:6000'; // or your API URL
    return `${API_URL}${endpoint}`;
  };
  
  export const resolveAssetPath = (assetPath) => {
    return `/assets/${assetPath}`;
  };