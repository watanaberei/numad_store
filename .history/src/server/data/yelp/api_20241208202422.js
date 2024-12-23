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
  },

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


  async getStoreData(businessId) {
    try {
      const data = await this.getBusinessDetails(businessId);
      return this.transformBusinessData(data);
    } catch (error) {
      console.error('Error getting store data:', error);
      return null;
    }
  },

  transformYelpHours(yelpData) {
    console.log('Processing Yelp hours data:', yelpData?.hours?.[0]?.open);
    
    if (!yelpData?.hours?.[0]?.open) {
      console.warn('No hours data available');
      return null;
    }

    const hoursData = yelpData.hours[0].open;
    const isCurrentlyOpen = yelpData.hours[0].is_open_now;
    
    // Get current time for comparison
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}${currentMinute}`;
    const currentDay = now.getDay();

    return {
      storeName: yelpData.name,
      isOpen: isCurrentlyOpen,
      currentTime: currentTime,
      schedule: hoursData.map(slot => ({
        day: slot.day,
        start: slot.start,
        end: slot.end,
        isCurrent: slot.day === currentDay,
        isWithinHours: slot.day === currentDay && 
                      currentTime >= slot.start && 
                      currentTime <= slot.end
      }))
    };
  },

  transformBusinessData(yelpData) {
    if (!yelpData) return null;
    
    return {
      name: yelpData.name,
      hours: [{
        is_open_now: yelpData.hours?.[0]?.is_open_now || false,
        open: yelpData.hours?.[0]?.open || []
      }],
      location: {
        address: yelpData.location?.address1,
        city: yelpData.location?.city,
        state: yelpData.location?.state,
        area: yelpData.location?.neighborhood || ''
      }
    };
  }
};

// Update data.js initializeData function
export async function initializeData() {
  try {
    console.log('Initializing application data');
    
    const businessId = '0fGRTbEhBNDUP7AfUFqvPQ'; // Smoking Tiger ID
    const yelpData = await yelpApi.getStoreData(businessId);
    console.log('Yelp data received:', yelpData);

    if (yelpData?.hours) {
      const hoursData = yelpApi.transformYelpHours(yelpData);
      console.log('Transformed hours data:', hoursData);

      // Update store hours
      store.item[0] = {
        ...store.item[0],
        name: yelpData.name,
        hours: yelpData.hours
      };
    }

    return {
      storeData: store.item[0],
      searchResults: []
    };
  } catch (error) {
    console.error('Data initialization error:', error);
    return {
      storeData: store.item[0],
      searchResults: []
    };
  }
}