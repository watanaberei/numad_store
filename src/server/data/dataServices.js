//   /src/server/data/data.js


import { mongodb, contentful, yelp } from '../data';
import { getStore, getArticleNeumadsTrail, getStoresNeumadsReview, getArticlePost } from '../client/api';

export const getAllStores = async () => {
  const [mongoStores, contentfulStores, yelpStores] = await Promise.all([
    mongodb.Store.find(),
    getStore(9, 0),
    yelp.searchBusinesses('store', 'New York'),
  ]);

  return [...mongoStores, ...contentfulStores, ...yelpStores];
};

export const getUser = async (userId) => {
  return await mongodb.User.findById(userId);
};

export const getAllPosts = async () => {
  const [articles, reviews, blogs] = await Promise.all([
    getArticleNeumadsTrail(9, 0),
    getStoresNeumadsReview(9, 0),
    getArticlePost(9, 0),
  ]);

  return [...articles, ...reviews, ...blogs];
};