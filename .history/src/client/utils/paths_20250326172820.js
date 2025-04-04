// Client-side path handling utilities
export const resolveApiPath = (endpoint) => {
    const API_URL = 'http://localhost:6000'; // Match server port
    return `${API_URL}${endpoint}`;
  };
  
  export const resolveAssetPath = (assetPath) => {
    return `/assets/${assetPath}`;
  };

  // Helper to normalize store slugs
  export const normalizeSlug = (slug) => {
    if (!slug) return '';
    return slug.toLowerCase().replace(/_/g, '-');
  };

  // Helper to denormalize store slugs for database
  export const denormalizeSlug = (slug) => {
    if (!slug) return '';
    return slug.toLowerCase().replace(/-/g, '_');
  };