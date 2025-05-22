const config = {
  YELP_API_KEY: '8rmkV9EeDcbNYYXa-149gzBONf45zMFxpxli6t0Gj3sv9oThSgDemwa_eEGJYcu1qGGs6IkgnXB11Kh_RSqHodcK1QW9dMG5ikQBldcsfQPlL1rzs03Gcz678MGxZ3Yx',
  YELP_BASE_URL: 'https://api.yelp.com/v3',
  YELP_CLIENT_ID: 'O0ORhBQherKZrQI_CdJxng',
  // YELP_API_KEY: '1nlI_qH9TuYUU0S7lp-vKhjMXvhEm6w0aDJeCRDCaywekiF0CaHji6GrbMKIHdcmyTh4aKzp5pfJ8PVdrKQOiZbVhsQ5VYDrWtBwqXzvpFw3nFbHx-6ai4WTwxScZ3Yx',
  // YELP_CLIENT_ID: 'N7cW1Bwg0td_AfbVhwEvCw',
  // Add other configuration values here
  DEBUG: true, // Enable/disable console logging
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