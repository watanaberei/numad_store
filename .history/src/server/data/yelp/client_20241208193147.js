// src/server/data/yelp/client.js

class YelpClient {
  constructor() {
    this.API_KEY = 'MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx';
    // Use a CORS proxy if needed for development
    this.BASE_URL = 'https://corsanywhere.herokuapp.com/https://api.yelp.com/v3';
  }

  async fetchYelpAPI(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
      
      console.log('Fetching from Yelp:', { url, params });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors'
      });

      if (!response.ok) {
        console.error('Yelp API Error:', response.status, response.statusText);
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
    try {
      console.log('Fetching business details for:', businessId);
      const data = await this.fetchYelpAPI(`/businesses/${businessId}`);
      return data;
    } catch (error) {
      console.error('Error fetching business details:', error);
      return null;
    }
  }

  async searchBusinesses(params = {}) {
    try {
      console.log('Searching businesses with params:', params);
      const data = await this.fetchYelpAPI('/businesses/search', params);
      return data;
    } catch (error) {
      console.error('Error searching businesses:', error);
      return null;
    }
  }
}

export default new YelpClient();