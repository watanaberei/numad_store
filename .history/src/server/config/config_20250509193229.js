import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; 
import express from 'express';

dotenv.config();

const config = express();

let bisectRight;
import('d3').then(d3 => {
  bisectRight = d3.bisectRight;
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config();


const config.use(cors({
  YELP_API_KEY: process.env.YELP_API_KEY,
  YELP_BASE_URL: process.env.YELP_BASE_URL,
  YELP_CLIENT_ID: process.env.YELP_CLIENT_ID,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,

  // YELP_API_KEY: 'MvqQnLzZS7NPSVPz45G87nM0x1ui5txjnVqtIPi-koskSYzhlBo8s8MWk0x4cbYDQj0E-VEV05LEzGzYRi4SIyrsf-rvIcjHhZIZ5bQuXguwW05tleV7-Lf4DbnkZ3Yx',
  // YELP_BASE_URL: 'https://api.yelp.com/v3',
  // YELP_CLIENT_ID: 'CR9UMP6ZG2LZ-SBVYVka0Q',
  // ACCESS_TOKEN_SECRET: 'da2e5e79fb1d44db9d19d481197b5855c39a7542e0b331e696b5e7a4bfdd08d9aaf9fd1b10294d4843cba0d8a11a1807a0d004a011d2ed05539136589b07ec0f',
  // YELP_API_KEY: '1nlI_qH9TuYUU0S7lp-vKhjMXvhEm6w0aDJeCRDCaywekiF0CaHji6GrbMKIHdcmyTh4aKzp5pfJ8PVdrKQOiZbVhsQ5VYDrWtBwqXzvpFw3nFbHx-6ai4WTwxScZ3Yx',
  // YELP_CLIENT_ID: 'N7cW1Bwg0td_AfbVhwEvCw',
  // Add other configuration values here
  DEBUG: true, // Enable/disable console logging
  // DEBUG: process.env.DEBUG === 'true',
  YELP_RATE_LIMITS: {
    // DAILY_LIMIT: 300,
    // REQUEST_DELAY: 3000, // 3 seconds between requests
    // MAX_RETRIES: 3,
    // CACHE_TTL: 3600 // 1 hour cache
    DAILY_LIMIT: parseInt(process.env.YELP_DAILY_LIMIT) || 300,
    REQUEST_DELAY: parseInt(process.env.YELP_REQUEST_DELAY) || 3000,
    MAX_RETRIES: parseInt(process.env.YELP_MAX_RETRIES) || 3,
    CACHE_TTL: parseInt(process.env.YELP_CACHE_TTL) || 3600
  }
}));

export const getConfig = () => config;

// Simple logging utility
export const log = (message, data = null) => {
  if (config.DEBUG) {
    if (data) {
      console.log(`[DEBUG] ${message}:`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
};

// Rate limit tracking
let dailyRequestCount = 0;
let resetTime = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
let lastRequestTime = 0;

export const checkRateLimit = () => {
  const now = Date.now();

  // Reset daily count if we've passed the reset time
  if (now > resetTime) {
    dailyRequestCount = 0;
    resetTime = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
  }

  // Check if we've hit the daily limit
  if (dailyRequestCount >= config.YELP_RATE_LIMITS.DAILY_LIMIT) {
    throw new Error('Daily API limit reached');
  }

  // Check time since last request
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < config.YELP_RATE_LIMITS.REQUEST_DELAY) {
    return config.YELP_RATE_LIMITS.REQUEST_DELAY - timeSinceLastRequest;
  }

  return 0;
};

export const incrementRequestCount = () => {
  dailyRequestCount++;
  lastRequestTime = Date.now();
};