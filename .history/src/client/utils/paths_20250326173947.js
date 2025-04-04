// Client-side path handling utilities
export const resolveApiPath = (endpoint) => {
    const API_URL = 'http://localhost:4000'; // or your API URL
    return `${API_URL}${endpoint}`;
  };
  
  export const resolveAssetPath = (assetPath) => {
    return `/assets/${assetPath}`;
  };
//   // Helper to normalize store slugs
//   export default (slug) => {
//   if (!slug) return '';
//   return slug.toLowerCase().replace(/_/g, '-');
// };

//   // Helper to denormalize store slugs for database
//   export const denormalizeSlug = (slug) => {
//     if (!slug) return '';
//     return slug.toLowerCase().replace(/-/g, '_');
//   };