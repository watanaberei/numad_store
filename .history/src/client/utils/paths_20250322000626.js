// Client-side path handling utilities
export const resolveApiPath = (endpoint) => {
  const API_URL = 'http://localhost:4000'; // or your API URL
  return `${API_URL}${endpoint}`;
    // Auth endpoints go to port 4000
    if (endpoint.startsWith('/login') || 
        endpoint.startsWith('/signup') || 
        endpoint.startsWith('/user') ||
        endpoint.startsWith('/settings')) {
        return `http://localhost:4000${endpoint}`;
    }
    // Store endpoints go to port 6000
    return `http://localhost:6000${endpoint}`;
};

export const resolveSocketPath = () => {
    return 'http://localhost:4000'; // Socket.IO connection
};

export const resolveAssetPath = (assetPath) => {
  return `/assets/${assetPath}`;
};