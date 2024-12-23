// src/server/data/yelp/client.js
import axios from 'axios';
import redisClient from '../../config/redisClient.js';

class YelpClient {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.yelp.com/v3',
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        'Accept': 'application/json'
      }
    });
  }

  async getBusinessDetails(businessId) {
    const cacheKey = `yelp:business:${businessId}`;

    try {
      // Try cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) return cached;

      // Fetch from Yelp
      const response = await this.api.get(`/businesses/${businessId}`);
      const data = response.data;

      // Cache for 1 hour
      await redisClient.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error('Yelp API Error:', error);
      throw error;
    }
  }

  async searchBusinesses(params = {}) {
    const cacheKey = `yelp:search:${JSON.stringify(params)}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return cached;

      const response = await this.api.get('/businesses/search', { params });
      await redisClient.set(cacheKey, response.data);

      return response.data;
    } catch (error) {
      console.error('Yelp Search Error:', error);
      throw error;
    }
  }
}

export default new YelpClient();