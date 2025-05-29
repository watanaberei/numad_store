// src/components/DataPost.js
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../API/api.js";
import { parseRequestUrl } from '../utils/utils.js';

export default class DataPost {
  constructor() {
    this.activeTags = [];
    this.storeData = null;
  }

  async getData() {
    try {
      if (this.storeData) {
        return this.storeData;
      }

      const [articleData, reviewData, blogData, storeData] = await Promise.all([
        getArticleNeumadsTrail(9, 0),
        getStoresNeumadsReview(9, 0),
        getArticlePost(9, 0),
        getStore(9, 0)
      ]);

      // Add variants to each data type
      const processedData = [
        ...articleData.map(article => ({ ...article, variant: 'articles' })),
        ...reviewData.map(review => ({ ...review, variant: 'reviews' })),
        ...blogData.map(blog => ({ ...blog, variant: 'blogs' })),
        ...storeData.map(store => ({ ...store, variant: 'stores' }))
      ];

      // Filter by active tags if any
      this.storeData = processedData.filter(post => {
        const postTags = post.tag?.[0]?.tags || [];
        return this.activeTags.length === 0 || 
               postTags.some(tag => this.activeTags.includes(tag));
      });

      console.log("!!!!:[DataPost.getData] storeData:", this.storeData);

      return this.storeData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  setActiveTags(tags) {
    this.activeTags = tags;
    this.storeData = null; // Reset cache when tags change
  }
}