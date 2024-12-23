// src/server/config/redisClient.js
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let client = null;

// Only initialize Redis on server side
if (typeof window === 'undefined') {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', err => console.error('Redis Client Error', err));
  client.connect().catch(console.error);
}

export const getRedisClient = () => client;

export default {
  async set(key, value, expireInSeconds = 3600) {
    if (!client) return false;
    try {
      await client.set(key, JSON.stringify(value), {
        EX: expireInSeconds
      });
      return true;
    } catch (error) {
      console.error('Redis Set Error:', error);
      return false;
    }
  },

  async get(key) {
    if (!client) return null;
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis Get Error:', error);
      return null;
    }
  }
};