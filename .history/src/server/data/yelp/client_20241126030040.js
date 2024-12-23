// src/server/data/yelp/client.js
import axios from 'axios';
import redisClient from '../../config/redisClient.js';

class YelpClient {
    constructor() {
      // Replace with your Yelp API key
      this.API_KEY = 'MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx';
      this.BASE_URL = 'https://api.yelp.com/v3';
    }
  
    async fetchYelpAPI(endpoint, params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
  
      console.log('Fetching Yelp API:', url);
  
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Accept': 'application/json'
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
        throw error;
      }
    }
  
    async getBusinessDetails(businessId) {
      return this.fetchYelpAPI(`/businesses/${businessId}`);
    }
  
    async searchBusinesses(params = {}) {
      return this.fetchYelpAPI('/businesses/search', params);
    }
  
    async getBusinessReviews(businessId) {
      return this.fetchYelpAPI(`/businesses/${businessId}/reviews`);
    }
  }
  


export default new YelpClient();