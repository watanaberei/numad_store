///////////////////////// START FIXED CLIENT DATA MODULE /////////////////////////
// src/client/data/data.js - Client-safe data module

import { storeApi, blogApi } from '../api/apiData.js';

console.log('[ClientData] Loading client-safe data module');

// Store data functions
export const StoreData = {
  // Get all stores
  async getAll(options = {}) {
    try {
      return await storeApi.getAll(options);
    } catch (error) {
      console.error('[ClientData] Error getting all stores:', error);
      return [];
    }
  },
  
  // Get store by slug
  async getBySlug(slug) {
    try {
      return await storeApi.getBySlug(slug);
    } catch (error) {
      console.error('[ClientData] Error getting store:', error);
      return null;
    }
  },
  
  // Search stores
  async search(query, options = {}) {
    try {
      return await storeApi.search(query, options);
    } catch (error) {
      console.error('[ClientData] Error searching stores:', error);
      return [];
    }
  },
  
  // Get nearby stores
  async getNearby(lat, lng, radius = 5) {
    try {
      return await storeApi.getNearby(lat, lng, radius);
    } catch (error) {
      console.error('[ClientData] Error getting nearby stores:', error);
      return [];
    }
  }
};

// Blog data functions
export const BlogData = {
  // Get blogs with filters
  async getAll(options = {}) {
    try {
      const result = await blogApi.getBlogs(options);
      return result.blogs || [];
    } catch (error) {
      console.error('[ClientData] Error getting blogs:', error);
      return [];
    }
  },
  
  // Get blog by slug
  async getBySlug(slug) {
    try {
      return await blogApi.getBySlug(slug);
    } catch (error) {
      console.error('[ClientData] Error getting blog:', error);
      return null;
    }
  },
  
  // Search blogs
  async search(query, options = {}) {
    try {
      return await blogApi.search(query, options);
    } catch (error) {
      console.error('[ClientData] Error searching blogs:', error);
      return [];
    }
  },
  
  // Get blogs by author
  async getByAuthor(author, options = {}) {
    try {
      const result = await blogApi.getBlogs({ ...options, author });
      return result.blogs || [];
    } catch (error) {
      console.error('[ClientData] Error getting author blogs:', error);
      return [];
    }
  }
};

// Legacy compatibility - if your code uses getYelpData
export async function getYelpData(storeSlug) {
  try {
    const store = await StoreData.getBySlug(storeSlug);
    return store?.yelpData || null;
  } catch (error) {
    console.error('[ClientData] Error getting Yelp data:', error);
    return null;
  }
}

// Default export
export default {
  StoreData,
  BlogData,
  getYelpData
};

///////////////////////// END FIXED CLIENT DATA MODULE /////////////////////////