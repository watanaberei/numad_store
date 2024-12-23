// /src/server/data/yelp/api.js


import axios from 'axios';

const yelpApi = axios.create({
  baseURL: 'https://api.yelp.com/v3',
  headers: {
    Authorization: `Bearer ${process.env.YELP_API_KEY}`,
  },
});

export const searchBusinesses = async (term, location) => {
  const response = await yelpApi.get('/businesses/search', {
    params: { term, location },
  });
  return response.data.businesses;
};