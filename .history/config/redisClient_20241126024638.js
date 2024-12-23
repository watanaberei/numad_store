// config/redisClient.js
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.connect();
  }

  async connect() {
    try {
      // For local development, Redis will default to redis://localhost:6379
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      // Error handling
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.client.connect();
      console.log('Redis connected successfully');
      
    } catch (error) {
      console.error('Redis Connection Error:', error);
    }
  }

  async set(key, value, expireInSeconds = 3600) {
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: expireInSeconds
      });
      return true;
    } catch (error) {
      console.error('Redis Set Error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis Get Error:', error);
      return null;
    }
  }
}

export default new RedisClient();