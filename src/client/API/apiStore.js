///////////////////////// START CLIENT-SAFE API MODULE /////////////////////////
// src/client/api/dataApi.js - Client-safe API module for fetching store and blog data

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4500';
const AUTHSERVER_URL = process.env.AUTHSERVER_URL || 'http://localhost:4000';

console.log('[DataAPI] Initializing client-safe data API module');

// Store API functions
export const storeApi = {
  // Get store by slug
  async getBySlug(slug) {
    try {
      console.log(`[DataAPI] Fetching store by slug: ${slug}`);
      const response = await fetch(`${SERVER_URL}/api/store/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Store not found: ${response.status}`);
      }
      
      const data = await response.json();
      return data.store;
    } catch (error) {
      console.error('[DataAPI] Error fetching store:', error);
      throw error;
    }
  },
  
  // Search stores
  async search(query, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;
      console.log(`[DataAPI] Searching stores: ${query}`);
      
      const params = new URLSearchParams({
        q: query,
        limit,
        offset
      });
      
      const response = await fetch(`${SERVER_URL}/api/stores/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.stores || [];
    } catch (error) {
      console.error('[DataAPI] Error searching stores:', error);
      throw error;
    }
  },
  
  // Get stores near location
  async getNearby(lat, lng, radius = 5) {
    try {
      console.log(`[DataAPI] Getting stores near: ${lat}, ${lng}`);
      
      const params = new URLSearchParams({
        lat,
        lng,
        radius
      });
      
      const response = await fetch(`${SERVER_URL}/api/stores/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error(`Nearby search failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.stores || [];
    } catch (error) {
      console.error('[DataAPI] Error getting nearby stores:', error);
      throw error;
    }
  },
  
  // Get all stores (with pagination)
  async getAll(options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;
      console.log(`[DataAPI] Getting all stores`);
      
      const params = new URLSearchParams({ limit, offset });
      const response = await fetch(`${SERVER_URL}/api/stores?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get stores: ${response.status}`);
      }
      
      const data = await response.json();
      return data.stores || [];
    } catch (error) {
      console.error('[DataAPI] Error getting all stores:', error);
      throw error;
    }
  }
};

// Blog API functions
export const blogApi = {
  // Get blog by slug
  async getBySlug(slug) {
    try {
      console.log(`[DataAPI] Fetching blog by slug: ${slug}`);
      const response = await fetch(`${SERVER_URL}/api/blog/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Blog not found: ${response.status}`);
      }
      
      const data = await response.json();
      return data.blog;
    } catch (error) {
      console.error('[DataAPI] Error fetching blog:', error);
      throw error;
    }
  },
  
  // Get blogs with filters
  async getBlogs(options = {}) {
    try {
      const {
        author,
        status = 'published',
        category,
        tag,
        limit = 20,
        offset = 0,
        sort = 'newest'
      } = options;
      
      console.log(`[DataAPI] Getting blogs with filters:`, options);
      
      const params = new URLSearchParams();
      if (author) params.append('author', author);
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      if (tag) params.append('tag', tag);
      params.append('limit', limit);
      params.append('offset', offset);
      params.append('sort', sort);
      
      const response = await fetch(`${SERVER_URL}/api/blog?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get blogs: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        blogs: data.blogs || [],
        total: data.total || 0,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('[DataAPI] Error getting blogs:', error);
      throw error;
    }
  },
  
  // Search blogs
  async search(query, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;
      console.log(`[DataAPI] Searching blogs: ${query}`);
      
      const params = new URLSearchParams({
        q: query,
        limit,
        offset
      });
      
      const response = await fetch(`${SERVER_URL}/api/blog/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.blogs || [];
    } catch (error) {
      console.error('[DataAPI] Error searching blogs:', error);
      throw error;
    }
  }
};

// User API functions
export const userApi = {
  // Get user profile
  async getProfile(username) {
    try {
      console.log(`[DataAPI] Fetching user profile: ${username}`);
      const response = await fetch(`${SERVER_URL}/api/user/${username}`);
      
      if (!response.ok) {
        throw new Error(`User not found: ${response.status}`);
      }
      
      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('[DataAPI] Error fetching user profile:', error);
      throw error;
    }
  },
  
  // Get current user's profile (authenticated)
  async getCurrentProfile() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      console.log('[DataAPI] Fetching current user profile');
      const response = await fetch(`${SERVER_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get profile: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[DataAPI] Error fetching current profile:', error);
      throw error;
    }
  },
  
  // Get user's stores
  async getUserStores(username, options = {}) {
    try {
      const { type = 'visited', limit = 20, offset = 0 } = options;
      console.log(`[DataAPI] Fetching user stores: ${username}`);
      
      const params = new URLSearchParams({ type, limit, offset });
      const response = await fetch(`${SERVER_URL}/api/user/${username}/stores?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user stores: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[DataAPI] Error fetching user stores:', error);
      throw error;
    }
  },
  
  // Get user's blogs
  async getUserBlogs(username, options = {}) {
    try {
      const { status = 'published', limit = 20, offset = 0 } = options;
      console.log(`[DataAPI] Fetching user blogs: ${username}`);
      
      const params = new URLSearchParams({ status, limit, offset });
      const response = await fetch(`${SERVER_URL}/api/user/${username}/blogs?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user blogs: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[DataAPI] Error fetching user blogs:', error);
      throw error;
    }
  }
};

// Helper function to transform store data for GeoJSON
export function transformStoreToGeoJSON(stores) {
  if (!Array.isArray(stores)) {
    stores = [stores];
  }
  
  return {
    type: 'FeatureCollection',
    features: stores.map(store => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          store.location?.geolocation?.lon || store.location?.neighborhood?.geolocation?.lon || -118.2437,
          store.location?.geolocation?.lat || store.location?.neighborhood?.geolocation?.lat || 34.0522
        ]
      },
      properties: {
        id: store._id || store.slug,
        slug: store.slug,
        name: store.title || store.hero?.storeName || 'Unknown Store',
        address: store.location?.neighborhood?.address || store.location?.address || '',
        city: store.location?.neighborhood?.city || store.hero?.city || '',
        state: store.location?.neighborhood?.state || store.hero?.state || 'CA',
        rating: store.hero?.rating || 0,
        reviewCount: store.hero?.review_count || 0,
        price: store.hero?.price || '$$',
        storeType: store.hero?.storeType || [],
        distance: store.hero?.distance || '',
        status: store.hero?.status || 'Unknown',
        thumbnail: store.hero?.gallery?.[0] || '',
        // Include full store data for detailed views
        fullData: store
      }
    }))
  };
}

// Default export
export default {
  storeApi,
  blogApi,
  userApi,
  transformStoreToGeoJSON
};

///////////////////////// END CLIENT-SAFE API MODULE /////////////////////////