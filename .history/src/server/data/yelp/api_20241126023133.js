// /src/server/data/yelp/api.js
import axios from 'axios';
import Redis from 'ioredis';
import Bull from 'bull';

const redis = new Redis(process.env.REDIS_URL);
const updateQueue = new Bull('yelpUpdates');

class YelpService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.yelp.com/v3',
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      }
    });
  }

  // Transform Yelp data to match your data.js format
  transformBusinessData(yelpData) {
    return {
      name: yelpData.name,
      location: {
        address: yelpData.location.address1,
        city: yelpData.location.city,
        area: yelpData.location.neighborhood,
        state: yelpData.location.state,
        zip: yelpData.location.zip_code,
        attribute: this.transformLocationAttributes(yelpData)
      },
      details: {
        rating: yelpData.rating.toString(),
        costEstimate: yelpData.price,
        storeType: yelpData.categories[0]?.title || 'Coffee Shop',
        distance: `${(yelpData.distance * 0.000621371).toFixed(1)}mi`, // Convert meters to miles
        distanceMiles: (yelpData.distance * 0.000621371).toFixed(1),
        status: this.getBusinessStatus(yelpData)
      },
      gallery: this.transformPhotos(yelpData.photos),
      // ... transform other sections as needed
    };
  }

  // Cache management
  async getCachedBusiness(businessId) {
    const cached = await redis.get(`business:${businessId}`);
    if (cached) {
      console.log('Cache hit for business:', businessId);
      return JSON.parse(cached);
    }
    return null;
  }

  async cacheBusiness(businessId, data) {
    await redis.set(
      `business:${businessId}`,
      JSON.stringify(data),
      'EX',
      3600 // Cache for 1 hour
    );
  }

  // Main fetch method with caching and error handling
  async getBusinessDetails(businessId) {
    try {
      // Check cache first
      const cached = await this.getCachedBusiness(businessId);
      if (cached) return cached;

      // Fetch from Yelp if not cached
      const response = await this.client.get(`/businesses/${businessId}`);
      const transformedData = this.transformBusinessData(response.data);
      
      // Cache the transformed data
      await this.cacheBusiness(businessId, transformedData);
      
      return transformedData;

    } catch (error) {
      console.error('Error fetching business details:', error);
      throw new Error('Failed to fetch business details');
    }
  }

  // Queue periodic updates
  async scheduleUpdates(businessId) {
    await updateQueue.add(
      'updateBusiness',
      { businessId },
      { 
        repeat: {
          cron: '0 */6 * * *' // Update every 6 hours
        }
      }
    );
  }
}

// Process queued updates
updateQueue.process('updateBusiness', async (job) => {
  const yelpService = new YelpService();
  await yelpService.getBusinessDetails(job.data.businessId);
});

export default new YelpService();












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