///////////////////////// START FIXED CLIENT YELP MODULE /////////////////////////
// src/client/data/yelp/yelp.js - Client-safe Yelp data module

console.log('[YelpAPI] Loading client-safe Yelp module');

// Mock Yelp data for client-side usage
// In production, this would fetch from your server's API
export const yelp = {
  // Get Yelp data for a store
  async getStoreData(storeId) {
    try {
      console.log(`[YelpAPI] Fetching Yelp data for store: ${storeId}`);
      
      // This should call your server's API endpoint that handles Yelp data
      const response = await fetch(`/api/store/${storeId}/yelp`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Yelp data: ${response.status}`);
      }
      
      const data = await response.json();
      return data.yelpData || null;
    } catch (error) {
      console.error('[YelpAPI] Error fetching Yelp data:', error);
      return null;
    }
  },
  
  // Search Yelp businesses
  async search(term, location, options = {}) {
    try {
      console.log(`[YelpAPI] Searching Yelp: ${term} in ${location}`);
      
      const params = new URLSearchParams({
        term,
        location,
        ...options
      });
      
      const response = await fetch(`/api/yelp/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Yelp search failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.businesses || [];
    } catch (error) {
      console.error('[YelpAPI] Error searching Yelp:', error);
      return [];
    }
  }
};

// Default export
export default yelp;

///////////////////////// END FIXED CLIENT YELP MODULE /////////////////////////