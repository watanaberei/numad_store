// src/client/api/blogApi.js - Create this new file for client-side blog API calls
export const blogApi = {
    // Get all blogs with filters
    async getBlogs(params = {}) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`/api/blog?${queryString}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
      }
    },
  
    // Get single blog by slug
    async getBlog(slug) {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching blog:', error);
        throw error;
      }
    },
  
    // Create or update blog
    async saveBlog(slug, formData) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Authentication required');
        }
  
        const endpoint = slug ? `/api/blog/${slug}` : '/api/blog';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to save blog');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error saving blog:', error);
        throw error;
      }
    },
  
    // Update blog status
    async updateBlogStatus(slug, status) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`/api/blog/${slug}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ status })
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update blog status');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error updating blog status:', error);
        throw error;
      }
    },
  
    // Add comment to blog
    async addComment(slug, content) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`/api/blog/${slug}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ content })
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add comment');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },
  
    // Search stores for blog content
    async searchStores(query) {
      try {
        if (!query || query.length < 2) {
          return { stores: [] };
        }
  
        const response = await fetch(`/api/stores/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error searching stores:', error);
        throw error;
      }
    },
  
    // Get blog GeoJSON data for map
    async getBlogGeoJSON() {
      try {
        const response = await fetch('/api/geojson/blogs');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching blog GeoJSON:', error);
        return { type: 'FeatureCollection', features: [] };
      }
    }
  };