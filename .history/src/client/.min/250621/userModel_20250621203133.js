///////////////////////// START USER MODEL SCHEMA /////////////////////////
// User.js - User model schema
const UserSchema = {
  userId: String,
  name: String,
  visitedStores: [{
      storeId: String,
      visitedAt: Date,
      visits: Number
  }],
  blogPosts: [{
      blogId: String,
      readAt: Date
  }]
};
///////////////////////// END USER MODEL SCHEMA /////////////////////////