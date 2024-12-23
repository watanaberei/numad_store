// src/server/data/yelp/client.js
class YelpClient {
    constructor() {
      this.API_KEY = 'MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx';
      this.BASE_URL = 'https://api.yelp.com/v3';
    }
  
    async searchBusinesses(term, location) {
      try {
        const searchRequest = {
          term: term,
          location: location
        };
        
        console.log('Searching for business:', searchRequest);
        
        const response = await this.fetchYelpAPI('/businesses/search', searchRequest);
        if (response?.businesses?.length > 0) {
          const businessId = response.businesses[0].id;
          return this.getBusinessDetails(businessId);
        }
        return null;
      } catch (error) {
        console.error('Search error:', error);
        return null;
      }
    }

    async fetchYelpAPI(endpoint, params = {}) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
          
          console.log('Fetching from Yelp:', { url, params });
    
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${this.API_KEY}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Origin': window.location.origin
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
          return null;
        }
      }
    
      async getBusinessDetails(businessId) {
        return this.fetchYelpAPI(`/businesses/${businessId}`);
      }
    
    //   async searchBusinesses(params) {
    //     return this.fetchYelpAPI('/businesses/search', params);
    //   }
    }
    
    export default new YelpClient();






// class YelpClient {
//     constructor() {
//       this.API_KEY = 'MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx';
//       // Use the webpack dev server proxy
//       this.BASE_URL = '/api';  // This will be proxied through webpack
//     }
  
//     async fetchYelpAPI(endpoint, params = {}) {
//       try {
//         const queryString = new URLSearchParams(params).toString();
//         const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
//         console.log('Fetching from Yelp:', { url, params });
  
//         const response = await fetch(url, {
//           headers: {
//             'Authorization': `Bearer ${this.API_KEY}`,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         });
  
//         if (!response.ok) {
//           throw new Error(`Yelp API Error: ${response.status}`);
//         }
  
//         const data = await response.json();
//         console.log('Yelp API Response:', data);
//         return data;
  
//       } catch (error) {
//         console.error('Yelp API Error:', error);
//         return null;
//       }
//     }
  
//     async getBusinessDetails(businessId) {
//       return this.fetchYelpAPI(`/businesses/${businessId}`);
//     }
  
//     async searchBusinesses(params) {
//       return this.fetchYelpAPI('/businesses/search', params);
//     }
  
//     async getBusinessReviews(businessId) {
//       return this.fetchYelpAPI(`/businesses/${businessId}/reviews`);
//     }
//   }
  
//   // Export a single instance
//   const yelpClientInstance = new YelpClient();
//   export default yelpClientInstance;
  