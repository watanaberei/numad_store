import { getAllStores, getAllPosts } from '../services/dataService';

// ... existing code ...

export const getStore = async (limit = 1, collectionLimit = 6, skip = 0) => {
  const stores = await getAllStores();
  return stores.slice(skip, skip + limit);
};

export const getArticleNeumadsTrail = async (limit = 6, skip = 0) => {
  const posts = await getAllPosts();
  return posts.filter(post => post.type === 'article').slice(skip, skip + limit);
};

export const getStoresNeumadsReview = async (limit = 9, skip = 0) => {
  const posts = await getAllPosts();
  return posts.filter(post => post.type === 'review').slice(skip, skip + limit);
};

export const getArticlePost = async (limit = 9, skip = 0) => {
  const posts = await getAllPosts();
  return posts.filter(post => post.type === 'blog').slice(skip, skip + limit);
};

// ... rest of your existing code ...