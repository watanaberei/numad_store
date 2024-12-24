// src/components/DataPost.js
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../api.js";

export default class DataBlog {
  constructor() {
    this.activeTags = [];
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