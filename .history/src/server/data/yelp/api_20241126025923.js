// /src/server/data/yelp/api.js
// src/server/data/yelp/api.js
import yelpClient from './client.js';

// Transform Yelp data to match your data.js format
function transformBusinessData(yelpData) {
  console.log('Transforming Yelp data:', yelpData);
  
  return {
    name: yelpData.name,
    location: {
      address: yelpData.location.address1,
      city: yelpData.location.city,
      area: yelpData.location.neighborhood || '',
      state: yelpData.location.state,
      zip: yelpData.location.zip_code,
      attribute: transformLocationAttributes(yelpData)
    },
    details: {
      rating: yelpData.rating.toString(),
      costEstimate: yelpData.price || '$',
      storeType: yelpData.categories[0]?.title || 'Coffee Shop',
      distance: `${(yelpData.distance * 0.000621371).toFixed(1)}mi`,
      distanceMiles: (yelpData.distance * 0.000621371).toFixed(1),
      status: getBusinessStatus(yelpData)
    },
    gallery: transformGalleryData(yelpData),
    // Maintain structure matching data.js
    overview: [{
      header: "Overview",
      summary: generateOverviewSummary(yelpData),
      text: generateOverviewText(yelpData)
    }]
  };
}

function transformLocationAttributes(yelpData) {
  // Transform Yelp attributes to match your location attributes format
  return {
    geotags: [
      {
        title: 'Location',
        attributes: [
          { label: 'Rating', score: yelpData.rating, count: yelpData.review_count },
          { label: 'Price', score: yelpData.price?.length || 1, count: yelpData.review_count }
        ]
      }
    ]
  };
}

function transformGalleryData(yelpData) {
  return {
    hero: {
      url: '/gallery',
      gallery: yelpData.photos || []
    }
  };
}

function getBusinessStatus(yelpData) {
  if (!yelpData.hours?.[0]) return 'Status unavailable';
  return yelpData.hours[0].is_open_now ? 'Open' : 'Closed';
}

function generateOverviewSummary(yelpData) {
  return {
    experienceScore: (yelpData.rating * 20).toString(),
    experience: yelpData.categories.map(cat => ({
      label: cat.title,
      score: yelpData.rating,
      user: yelpData.review_count
    }))
  };
}

function generateOverviewText(yelpData) {
  return {
    title: "Summary",
    content: yelpData.alias || "No description available"
  };
}

// Example usage:
async function getStoreData(businessId) {
  try {
    console.log('Fetching business data for:', businessId);
    const yelpData = await yelpClient.getBusinessDetails(businessId);
    const transformedData = transformBusinessData(yelpData);
    console.log('Transformed data:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching store data:', error);
    throw error;
  }
}

// Export the transformed data functions
export const yelpApi = {
  getStoreData,
  searchBusinesses: yelpClient.searchBusinesses.bind(yelpClient),
  getBusinessReviews: yelpClient.getBusinessReviews.bind(yelpClient)
};

// Usage example with console logs
/*
yelpApi.getStoreData('smoking-tiger-cerritos-cerritos-2')
  .then(data => console.log('Store data:', data))
  .catch(error => console.error('Error:', error));
*/











// import axios from 'axios';
// import redisClient from "../../config/redisClient.js";
// import dotenv from 'dotenv';
// dotenv.config();

// export class YelpService {
//   constructor() {
//     this.api = axios.create({
//       baseURL: 'https://api.yelp.com/v3',
//       headers: {
//         Authorization: `Bearer ${process.env.YELP_API_KEY}`,
//         'Accept': 'application/json'
//       }
//     });
//   }

//   transformBusinessData(yelpData) {
//     // Transform Yelp data to match your data.js format
//     return {
//       name: yelpData.name,
//       location: {
//         address: yelpData.location.address1,
//         city: yelpData.location.city,
//         area: yelpData.location.neighborhood || '',
//         state: yelpData.location.state,
//         zip: yelpData.location.zip_code,
//       },
//       details: {
//         rating: yelpData.rating.toString(),
//         costEstimate: yelpData.price || '$',
//         storeType: yelpData.categories[0]?.title || 'Coffee Shop',
//         distance: `${(yelpData.distance * 0.000621371).toFixed(1)}mi`,
//         distanceMiles: (yelpData.distance * 0.000621371).toFixed(1),
//         status: yelpData.hours?.[0]?.is_open_now ? 'Open' : 'Closed'
//       },
//       gallery: {
//         hero: {
//           url: '/gallery',
//           gallery: yelpData.photos || []
//         }
//       },
//       // Add other sections as needed
//     };
//   }

//   async getBusinessDetails(businessId) {
//     const cacheKey = `yelp:business:${businessId}`;

//     try {
//       // Try to get from cache first
//       const cachedData = await redisClient.get(cacheKey);
//       if (cachedData) {
//         console.log('Cache hit for business:', businessId);
//         return cachedData;
//       }

//       // If not in cache, fetch from Yelp
//       console.log('Cache miss, fetching from Yelp API');
//       const response = await this.api.get(`/businesses/${businessId}`);
      
//       // Transform the data
//       const transformedData = this.transformBusinessData(response.data);
      
//       // Cache the transformed data (1 hour expiration)
//       await redisClient.set(cacheKey, transformedData, 3600);
      
//       return transformedData;

//     } catch (error) {
//       console.error('Error fetching business details:', error);
//       if (error.response) {
//         throw new Error(`Yelp API Error: ${error.response.status} - ${error.response.data.error.description}`);
//       }
//       throw error;
//     }
//   }

//   async searchBusinesses(params) {
//     const cacheKey = `yelp:search:${JSON.stringify(params)}`;

//     try {
//       // Check cache first
//       const cachedResults = await redisClient.get(cacheKey);
//       if (cachedResults) {
//         console.log('Cache hit for search');
//         return cachedResults;
//       }

//       // If not in cache, search Yelp
//       console.log('Cache miss, searching Yelp API');
//       const response = await this.api.get('/businesses/search', { params });
      
//       // Transform each business in results
//       const transformedResults = response.data.businesses.map(
//         business => this.transformBusinessData(business)
//       );

//       // Cache results for 30 minutes
//       await redisClient.set(cacheKey, transformedResults, 1800);
      
//       return transformedResults;

//     } catch (error) {
//       console.error('Error searching businesses:', error);
//       throw error;
//     }
//   }

//   // Add method to get reviews
//   async getBusinessReviews(businessId) {
//     const cacheKey = `yelp:reviews:${businessId}`;

//     try {
//       const cachedReviews = await redisClient.get(cacheKey);
//       if (cachedReviews) return cachedReviews;

//       const response = await this.api.get(`/businesses/${businessId}/reviews`);
//       await redisClient.set(cacheKey, response.data.reviews, 3600);
      
//       return response.data.reviews;

//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//       throw error;
//     }
//   }
// }

// export default new YelpService();












// import axios from 'axios';
// import Redis from 'ioredis';
// import Bull from 'bull';

// const redis = new Redis(process.env.REDIS_URL);
// const updateQueue = new Bull('yelpUpdates');

// class YelpService {
//   constructor() {
//     this.client = axios.create({
//       baseURL: 'https://api.yelp.com/v3',
//       headers: {
//         Authorization: `Bearer ${process.env.YELP_API_KEY}`,
//       }
//     });
//   }

//   // Transform Yelp data to match your data.js format
//   transformBusinessData(yelpData) {
//     return {
//       name: yelpData.name,
//       location: {
//         address: yelpData.location.address1,
//         city: yelpData.location.city,
//         area: yelpData.location.neighborhood,
//         state: yelpData.location.state,
//         zip: yelpData.location.zip_code,
//         attribute: this.transformLocationAttributes(yelpData)
//       },
//       details: {
//         rating: yelpData.rating.toString(),
//         costEstimate: yelpData.price,
//         storeType: yelpData.categories[0]?.title || 'Coffee Shop',
//         distance: `${(yelpData.distance * 0.000621371).toFixed(1)}mi`, // Convert meters to miles
//         distanceMiles: (yelpData.distance * 0.000621371).toFixed(1),
//         status: this.getBusinessStatus(yelpData)
//       },
//       gallery: this.transformPhotos(yelpData.photos),
//       // ... transform other sections as needed
//     };
//   }

//   // Cache management
//   async getCachedBusiness(businessId) {
//     const cached = await redis.get(`business:${businessId}`);
//     if (cached) {
//       console.log('Cache hit for business:', businessId);
//       return JSON.parse(cached);
//     }
//     return null;
//   }

//   async cacheBusiness(businessId, data) {
//     await redis.set(
//       `business:${businessId}`,
//       JSON.stringify(data),
//       'EX',
//       3600 // Cache for 1 hour
//     );
//   }

//   // Main fetch method with caching and error handling
//   async getBusinessDetails(businessId) {
//     try {
//       // Check cache first
//       const cached = await this.getCachedBusiness(businessId);
//       if (cached) return cached;

//       // Fetch from Yelp if not cached
//       const response = await this.client.get(`/businesses/${businessId}`);
//       const transformedData = this.transformBusinessData(response.data);
      
//       // Cache the transformed data
//       await this.cacheBusiness(businessId, transformedData);
      
//       return transformedData;

//     } catch (error) {
//       console.error('Error fetching business details:', error);
//       throw new Error('Failed to fetch business details');
//     }
//   }

//   // Queue periodic updates
//   async scheduleUpdates(businessId) {
//     await updateQueue.add(
//       'updateBusiness',
//       { businessId },
//       { 
//         repeat: {
//           cron: '0 */6 * * *' // Update every 6 hours
//         }
//       }
//     );
//   }
// }

// // Process queued updates
// updateQueue.process('updateBusiness', async (job) => {
//   const yelpService = new YelpService();
//   await yelpService.getBusinessDetails(job.data.businessId);
// });

// export default new YelpService();












// import axios from 'axios';

// const yelpApi = axios.create({
//   baseURL: 'https://api.yelp.com/v3',
//   headers: {
//     Authorization: `Bearer ${process.env.YELP_API_KEY}`,
//   },
// });

// export const searchBusinesses = async (term, location) => {
//   const response = await yelpApi.get('/businesses/search', {
//     params: { term, location },
//   });
//   return response.data.businesses;
// };