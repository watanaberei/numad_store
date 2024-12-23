const config = {
    YELP_API_KEY: 'MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx',
    YELP_BASE_URL: 'https://api.yelp.com/v3',
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