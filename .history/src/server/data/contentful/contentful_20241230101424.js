// src/components/DataPost.js
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "./contentfulApi.js";
import { parseRequestUrl } from '../../utils/utils.server.js';





export default class ContentfulData {
  constructor() {
    this.activeTags = [];
  }
  async getStoreId() {
    try {
      // Get storeId from URL parameters
      const request = parseRequestUrl(window.location.pathname);
      const storeId = request.slug; // This will get the :slug parameter from routes like "/stores/:slug"
      
      console.log('Getting store data for ID:', storeId); // Debug log

      // Fetch store data using the API
      const storeData = await getStore(storeId);
      this.storeData = storeData;

      console.log('Received store data:', storeData); // Debug log
      
      return storeData;
    } catch (error) {
      console.error('Error getting store data:', error);
      throw error;
    }
  }

  // Add any other methods you need to work with the store data
  getStoreData() {
    return this.storeData;
  }

  async fetchPosts() {
    const articleData = await getArticleNeumadsTrail(9, 0);
    articleData.forEach(article => article.variant = 'articles');
    
    const reviewData = await getStoresNeumadsReview(9, 0);
    reviewData.forEach(review => review.variant = 'reviews');
    
    const blogData = await getArticlePost(9, 0);
    blogData.forEach(blog => blog.variant = 'blogs');
    
    const storeData = await getStore(9, 0);
    storeData.forEach(store => store.variant = 'stores');
    
    return [...articleData, ...reviewData, ...blogData, ...storeData];
  }

  async getData() {
    const PostData = await this.fetchPosts();
    // console.log("PostData source check: ", PostData);

    const filteredPostData = PostData.filter(post => {
      const postTags = post.tag && post.tag.length ? post.tag[0].tags : [];
      return this.activeTags.length === 0 ? true : postTags.some(tag => this.activeTags.includes(tag));
    });

    return filteredPostData;
  }

  setActiveTags(tags) {
    this.activeTags = tags;
  }
}















// import {

//     getStoresNeumadsReview,
//     getArticleNeumadsTrail,
//     getArticlePost,
//   } from "../api.js";
  
//   let activeTags = [];
  
//   const DataPost = async () => {
//     const articleData = await getArticleNeumadsTrail(9, 0);
//     const storeData = await getStoresNeumadsReview(9, 0);
//     const postData = await getArticlePost(9, 0);
//     const PostData = [...articleData, ...storeData, ...postData];
//     // Filter the PostData based on the active tags
//     const filteredPostData = PostData.filter(post => {
//         const postTags = post.tag && post.tag.length ? post.tag[0].tags : [];
//         // if no active tags, display all posts, else filter by active tags
//         return activeTags.length === 0 ? true : postTags.some(tag => activeTags.includes(tag));
//       });

//     return filteredPostData;
//   };
  
//   const setActiveTags = (tag) => {
//     activeTags = tag;
//   };
  
//   export { DataPost, setActiveTags };