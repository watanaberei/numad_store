// src/server/data/yelp/api.js
import yelpClient from './client.js';

console.log('Initializing Yelp API');

// Single instance of YelpAPI
export const yelpApi = {
  async getStoreData(businessId) {
    try {
      console.log('Getting store data for:', businessId);
      const yelpData = await yelpClient.getBusinessDetails(businessId);
      return this.transformBusinessData(yelpData);
    } catch (error) {
      console.error('Error in getStoreData:', error);
      return null; // Return null instead of throwing to prevent app crash
    }
  },

  transformBusinessData(yelpData) {
    console.log('Transforming Yelp data:', yelpData);
    return {
      name: yelpData.name,
      location: {
        address: yelpData.location.address1,
        city: yelpData.location.city,
        area: yelpData.location.neighborhood || '',
        state: yelpData.location.state,
        zip: yelpData.location.zip_code,
        attribute: this.transformLocationAttributes(yelpData)
      },
      details: {
        rating: yelpData.rating.toString(),
        costEstimate: yelpData.price || '$',
        storeType: yelpData.categories[0]?.title || 'Coffee Shop',
        distance: `${(yelpData.distance * 0.000621371).toFixed(1)}mi`,
        distanceMiles: (yelpData.distance * 0.000621371).toFixed(1),
        status: this.getBusinessStatus(yelpData)
      },
      gallery: this.transformGalleryData(yelpData),
      overview: [{
        header: "Overview",
        summary: this.generateOverviewSummary(yelpData),
        text: this.generateOverviewText(yelpData)
      }]
    };
  },

  transformLocationAttributes(yelpData) {
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
  },

  transformGalleryData(yelpData) {
    return {
      hero: {
        url: '/gallery',
        gallery: yelpData.photos || []
      }
    };
  },

  getBusinessStatus(yelpData) {
    if (!yelpData.hours?.[0]) return 'Status unavailable';
    return yelpData.hours[0].is_open_now ? 'Open' : 'Closed';
  },

  generateOverviewSummary(yelpData) {
    return {
      experienceScore: (yelpData.rating * 20).toString(),
      experience: yelpData.categories.map(cat => ({
        label: cat.title,
        score: yelpData.rating,
        user: yelpData.review_count
      }))
    };
  },

  generateOverviewText(yelpData) {
    return {
      title: "Summary",
      content: yelpData.alias || "No description available"
    };
  },

  searchBusinesses: yelpClient.searchBusinesses.bind(yelpClient),
  getBusinessReviews: yelpClient.getBusinessReviews.bind(yelpClient)
};