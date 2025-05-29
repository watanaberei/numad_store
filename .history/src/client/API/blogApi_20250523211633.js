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
        console.log('[BlogApi] Saving blog:', slug ? `Updating ${slug}` : 'Creating new');
        
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        // Determine endpoint based on whether we have a slug
        const endpoint = slug ? `/api/blog/${slug}` : '/api/blog';
        
        console.log('[BlogApi] API endpoint:', endpoint);
        console.log('[BlogApi] Form data entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
            // Don't set Content-Type header when using FormData
          },
          body: formData
        });

        console.log('[BlogApi] Response status:', response.status);
        console.log('[BlogApi] Response headers:', response.headers);

        if (!response.ok) {
          // Try to get error message from response
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Failed to save blog';
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const error = await response.json();
              errorMessage = error.message || errorMessage;
            } catch (e) {
              console.error('[BlogApi] Failed to parse error JSON:', e);
            }
          } else {
            // If we get HTML instead of JSON, it means there's a server error
            const errorText = await response.text();
            console.error('[BlogApi] Received HTML instead of JSON:', errorText.substring(0, 500));
            errorMessage = 'Server error: received HTML response instead of JSON';
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('[BlogApi] Success response:', result);
        return result;

      } catch (error) {
        console.error('[BlogApi] Error saving blog:', error);
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
        console.log('[BlogApi] Fetching blog GeoJSON...');
        
        const response = await fetch('/api/geojson/blogs');
        
        if (!response.ok) {
          console.error('[BlogApi] Failed to fetch blog GeoJSON:', response.status);
          // Check if we got HTML instead of JSON
          const contentType = response.headers.get('content-type');
          if (contentType && !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error('[BlogApi] Received non-JSON response:', responseText.substring(0, 200));
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[BlogApi] Blog GeoJSON loaded:', data.features?.length || 0, 'features');
        return data;
        
      } catch (error) {
        console.error('[BlogApi] Error fetching blog GeoJSON:', error);
        return { type: 'FeatureCollection', features: [] };
      }
    }
  };