const config = {
  YELP_API_KEY: 'crTaAMzrSN--eXqHUdZmvfnnQ0gcqYBCJ9baqFC5EocRe9a7Eo6sm8sqM5N-IRR9dzY0aPjjLbIWQRhN8AHD-z-UZA9VeaGoxEyidqyH8-QTmI9uqGM1ckYABeWBZ3Yx',
  YELP_BASE_URL: 'https://api.yelp.com/v3',
  YELP_CLIENT_ID: 'E2Wxv3c-zDJNQyK7krnjNg',
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