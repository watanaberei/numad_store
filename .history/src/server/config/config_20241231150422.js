const config = {
  YELP_API_KEY: 'SRaxllNvzEYhcLGmPb8-xvWlJxPssnPsgWJz6aLLZKfTR6OSlX0M-UA4wur7jUi7967bel3E5nfxTWjsYkpqx-nds_sblj6pg-8Ct2cpuEloFzvE_BvNaQyChnd0Z3Yx',
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