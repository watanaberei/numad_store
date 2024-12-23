// src/server/data/yelp/client.js
class YelpClient {
    constructor() {
      this.API_KEY = 'MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx';
      // Use the webpack dev server proxy
      this.BASE_URL = '/api';  // This will be proxied through webpack
    }
  
    async fetchYelpAPI(endpoint, params = {}) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
        console.log('Fetching from Yelp:', { url, params });
  
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error(`Yelp API Error: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Yelp API Response:', data);
        return data;
  
      } catch (error) {
        console.error('Yelp API Error:', error);
        return null;
      }
    }
  
    async getBusinessDetails(businessId) {
      return this.fetchYelpAPI(`/businesses/${businessId}`);
    }
  
    async searchBusinesses(params) {
      return this.fetchYelpAPI('/businesses/search', params);
    }
  
    async getBusinessReviews(businessId) {
      return this.fetchYelpAPI(`/businesses/${businessId}/reviews`);
    }
  }
  
  // Export a single instance
  const yelpClientInstance = new YelpClient();
  export default yelpClientInstance;
  