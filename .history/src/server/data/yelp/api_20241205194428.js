// src/server/data/yelp/api.js
import yelpClient from './client.js';

console.log('Initializing Yelp API');

export const yelpApi = {
  async searchBusinesses(params) {
    try {
      const data = await yelpClient.searchBusinesses(params);
      console.log('Search response:', data);
      return data;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    }
  },

  async getBusinessDetails(businessId) {
    try {
      const data = await yelpClient.getBusinessDetails(businessId);
      console.log('Business details:', data);
      return data;
    } catch (error) {
      console.error('Details error:', error);
      return null;
    }
  }

  async getBusinessReviews(businessId) {
    try {
      console.log('Getting reviews for:', businessId);
      const reviews = await yelpClient.getBusinessReviews(businessId);
      return reviews;
    } catch (error) {
      console.error('Error in getBusinessReviews:', error);
      return null;
    }
  },

  transformBusinessData(yelpData) {
    if (!yelpData) return null;
    console.log('Transforming Yelp data:', yelpData);
    
    return {
      name: yelpData.name,
      location: {
        address: yelpData.location?.address1,
        city: yelpData.location?.city,
        area: yelpData.location?.neighborhood || '',
        state: yelpData.location?.state,
        zip: yelpData.location?.zip_code,
        attribute: this.transformLocationAttributes(yelpData)
      },
      details: {
        rating: yelpData.rating?.toString(),
        costEstimate: yelpData.price || '$',
        storeType: yelpData.categories?.[0]?.title || 'Coffee Shop',
        distance: yelpData.distance ? `${(yelpData.distance * 0.000621371).toFixed(1)}mi` : 'N/A',
        distanceMiles: yelpData.distance ? (yelpData.distance * 0.000621371).toFixed(1) : 'N/A',
        status: this.getBusinessStatus(yelpData)
      },
      gallery: this.transformGalleryData(yelpData)
    };
  },

  transformLocationAttributes(yelpData) {
    if (!yelpData) return null;
    return {
      geotags: [
        {
          title: 'Location',
          attributes: [
            { label: 'Rating', score: yelpData.rating || 0, count: yelpData.review_count || 0 },
            { label: 'Price', score: (yelpData.price?.length || 1), count: yelpData.review_count || 0 }
          ]
        }
      ]
    };
  },

  transformGalleryData(yelpData) {
    if (!yelpData) return null;
    return {
      hero: {
        url: '/gallery',
        gallery: yelpData.photos || []
      }
    };
  },

  getBusinessStatus(yelpData) {
    if (!yelpData?.hours?.[0]) return 'Status unavailable';
    return yelpData.hours[0].is_open_now ? 'Open' : 'Closed';
  }
};