const config = {
  YELP_API_KEY: 'WmSyCzoKK7dD-RmAqIKuA0PWEXtREkpsgBCVtmiUy86oWZHApy9eZ7Q-zrTT_Yy01CUeXhkKoo_3ZUIE5mZJWF30gr-bjbqz9rcmgFnW8GMnVy6zUzp-QZJGv5PkZ3Yx',
  YELP_BASE_URL: 'https://api.yelp.com/v3',
  YELP_CLIENT_ID: 'GB6XKvriFTQ_jx5leY2Ftw',
  // YELP_API_KEY: '1nlI_qH9TuYUU0S7lp-vKhjMXvhEm6w0aDJeCRDCaywekiF0CaHji6GrbMKIHdcmyTh4aKzp5pfJ8PVdrKQOiZbVhsQ5VYDrWtBwqXzvpFw3nFbHx-6ai4WTwxScZ3Yx',
  // YELP_CLIENT_ID: 'N7cW1Bwg0td_AfbVhwEvCw',
  // Add other configuration values here
  DEBUG: true, // Enable/disable console logging
  YELP_RATE_LIMITS: {
    DAILY_LIMIT: 300,
    REQUEST_DELAY: 3000, // 3 seconds between requests
    MAX_RETRIES: 3,
    CACHE_TTL: 3600 // 1 hour cache
  }
};

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