import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import UserModel from '../../models/user/modelUser.js';
import {StoreModel} from '../../models/store/modelStore.js';
import {BlogModel} from '../../models/blog/modelBlog.js';
// import * as userModel from '../../models/userModel.js';
// import * as data from '../../data/data.js';
import { parseServerUrl } from "../../utils/utils.server.js";
import { io } from "socket.io-client";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { StoreData } from '../data.js';
import fs from 'fs';


dotenv.config();

console.log('[MongoDB] Loading MongoDB connection module with Blog model export');


// Debug helpers
const debugLog = (location, message, data) => {
  console.log(`[DEBUG][${location}]`, message, data ? JSON.stringify(data) : '');
};

const errorLog = (location, error) => {  
  console.error(`[ERROR][${location}]`, {
    message: error.message,
    stack: error.stack,
    context: error.context
  });
};

// Create models ONCE at the top
// const UserModel = userModel.UserModel;
const User = UserModel;
// Use the imported StoreModel directly
const Store = StoreModel;

// Connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
};
// const connection = await mongoose.connect(uri, {
//   serverSelectionTimeoutMS: 20000,
//   socketTimeoutMS: 45000,
//   family: 4,
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// Connection function
const connectDB = async () => {
  try {
    console.log('[MongoDB] Attempting to connect to database...');
    
    if (mongoose.connection.readyState === 1) {
      console.log('[MongoDB] Using existing connection');
      return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    console.log('[MongoDB] Connecting to:', uri);
    
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('[MongoDB] Connected successfully to database');
    console.log('[MongoDB] Connection state:', mongoose.connection.readyState);
    console.log('[MongoDB] Database name:', mongoose.connection.name);
    
    return connection;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
};

// Database connection
// const connectDB = async () => {
//   try {
//     console.log('[MongoDB] Attempting to connect to database...');
    
//     if (mongoose.connection.readyState === 1) {
//       console.log('[MongoDB] Using existing connection');
//       return mongoose.connection;
//     }

//     const uri = process.env.MONGODB_URI;
//     console.log('[MongoDB] Connecting to:', uri);
    
//     const connection = await mongoose.connect(uri, {
//       serverSelectionTimeoutMS: 20000,
//       socketTimeoutMS: 45000,
//       family: 4,
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
    
//     console.log('[MongoDB] Connected successfully to database');
//     console.log('[MongoDB] Connection state:', mongoose.connection.readyState);
//     console.log('[MongoDB] Database name:', mongoose.connection.name);
    
//     return connection;
//   } catch (error) {
//     console.error('[MongoDB] Connection error:', error.message);
//     throw error;
//   }
// };


// Store operations
const storeOperations = {
  // Find store by slug
  findBySlug: async (slug) => {
    try {
      const store = await StoreModel.findOne({ slug }).maxTimeMS(5000);
      return store;
    } catch (error) {
      console.error('[MongoDB] Error finding store by slug:', error);
      throw error;
    }
  },
  
  // Create new store
  create: async (storeData) => {
    try {
      const store = new StoreModel(storeData);
      await store.save();
      return store;
    } catch (error) {
      console.error('[MongoDB] Error creating store:', error);
      throw error;
    }
  },
  
  // Update store
  update: async (slug, updateData) => {
    try {
      const store = await StoreModel.findOneAndUpdate(
        { slug },
        updateData,
        { new: true, runValidators: true }
      ).maxTimeMS(5000);
      return store;
    } catch (error) {
      console.error('[MongoDB] Error updating store:', error);
      throw error;
    }
  },
  
  // Search stores
  search: async (query, limit = 20) => {
    try {
      const stores = await StoreModel.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { 'storeInfo.city': { $regex: query, $options: 'i' } },
          { 'storeInfo.state': { $regex: query, $options: 'i' } }
        ]
      })
      .limit(limit)
      .maxTimeMS(5000);
      
      return stores;
    } catch (error) {
      console.error('[MongoDB] Error searching stores:', error);
      throw error;
    }
  }
};

///////////////////////// START BLOG OPERATIONS /////////////////////////
const blogOperations = {
  // Find blog by slug
  findBySlug: async (slug) => {
    try {
      const blog = await BlogModel.findOne({ slug }).maxTimeMS(5000);
      return blog;
    } catch (error) {
      console.error('[MongoDB] Error finding blog by slug:', error);
      throw error;
    }
  },
  
  // Create new blog
  create: async (blogData) => {
    try {
      const blog = new BlogModel(blogData);
      await blog.save();
      return blog;
    } catch (error) {
      console.error('[MongoDB] Error creating blog:', error);
      throw error;
    }
  },
  
  // Update blog
  update: async (slug, updateData) => {
    try {
      const blog = await BlogModel.findOneAndUpdate(
        { slug },
        updateData,
        { new: true, runValidators: true }
      ).maxTimeMS(5000);
      return blog;
    } catch (error) {
      console.error('[MongoDB] Error updating blog:', error);
      throw error;
    }
  },
  
  // Find blogs by author
  findByAuthor: async (username, options = {}) => {
    try {
      const { status = 'published', limit = 20, skip = 0 } = options;
      
      const query = { 'author.username': username };
      if (status !== 'all') {
        query.status = status;
      }
      
      const blogs = await BlogModel.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .maxTimeMS(5000);
        
      return blogs;
    } catch (error) {
      console.error('[MongoDB] Error finding blogs by author:', error);
      throw error;
    }
  },
  
  // Search blogs
  search: async (query, options = {}) => {
    try {
      const { limit = 20, skip = 0, status = 'published' } = options;
      
      const searchQuery = {
        $and: [
          { status },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { 'snippet.text': { $regex: query, $options: 'i' } },
              { 'tag.tags': { $regex: query, $options: 'i' } }
            ]
          }
        ]
      };
      
      const blogs = await BlogModel.find(searchQuery)
        .sort({ publishedAt: -1 })
        .limit(limit)
        .skip(skip)
        .maxTimeMS(5000);
        
      return blogs;
    } catch (error) {
      console.error('[MongoDB] Error searching blogs:', error);
      throw error;
    }
  }
};
///////////////////////// END BLOG OPERATIONS /////////////////////////


// User operations  
const userOperations = {
  // Find user by email or username
  findByIdentifier: async (identifier) => {
    try {
      const user = await UserModel.findByUsernameOrEmail(identifier);
      return user;
    } catch (error) {
      console.error('[MongoDB] Error finding user:', error);
      throw error;
    }
  },
  
  // Create new user
  create: async (userData) => {
    try {
      const user = new UserModel(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('[MongoDB] Error creating user:', error);
      throw error;
    }
  },
  
  // Update user
  update: async (email, updateData) => {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        updateData,
        { new: true, runValidators: true }
      ).maxTimeMS(5000);
      return user;
    } catch (error) {
      console.error('[MongoDB] Error updating user:', error);
      throw error;
    }
  },
  
  // Add blog to user's blogPosts
  addBlogPost: async (username, blogData) => {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if blog already exists
      const existingIndex = user.blogPosts.findIndex(
        p => p.blogId?.toString() === blogData.blogId
      );
      
      if (existingIndex >= 0) {
        // Update existing
        user.blogPosts[existingIndex] = { ...user.blogPosts[existingIndex], ...blogData };
      } else {
        // Add new
        user.blogPosts.push(blogData);
      }
      
      await user.save();
      return user;
    } catch (error) {
      console.error('[MongoDB] Error adding blog post to user:', error);
      throw error;
    }
  }
};

const enhancedStoreOperations = {
  // Get store with complete data structure matching the JSON example
  async getStoreForAPI(slug) {
    try {
      console.log(`[MongoDB mongodb.js line 135] Getting store for API: ${slug}`);
      
      const store = await StoreModel.findOne({ slug })
        .select('-__v')
        .lean();
      
      if (!store) {
        console.log(`[MongoDB mongodb.js line 142] Store not found: ${slug}`);
        return null;
      }
      
      // Ensure complete data structure matching JSON example
      const formattedStore = {
        _id: store._id,
        slug: store.slug,
        title: store.title || store.hero?.storeName || 'Unknown Store',
        variant: 'stores',
        
        // Hero section - exact structure from JSON
        hero: {
          rating: store.hero?.rating || 0,
          review_count: store.hero?.review_count || 0,
          price: store.hero?.price || '$$',
          costEstimate: store.hero?.costEstimate || '$0-0',
          storeType: store.hero?.storeType || [],
          distance: store.hero?.distance || '0mi',
          city: store.hero?.city || 'Unknown',
          state: store.hero?.state || 'CA',
          storeName: store.hero?.storeName || store.title || 'Unknown Store',
          distanceMiles: store.hero?.distanceMiles || '0',
          status: store.hero?.status || 'Unknown',
          gallery: store.hero?.gallery || []
        },
        
        // Overview section - must be array with exact structure
        overview: Array.isArray(store.overview) ? store.overview : [{
          header: 'Overview',
          summary: {
            experienceScore: store.overview?.[0]?.summary?.experienceScore || '0',
            experience: store.overview?.[0]?.summary?.experience || [],
            serviceScore: store.overview?.[0]?.summary?.serviceScore || '0',
            service: store.overview?.[0]?.summary?.service || [],
            businessScore: store.overview?.[0]?.summary?.businessScore || '0',
            business: store.overview?.[0]?.summary?.business || [],
            locationScore: store.overview?.[0]?.summary?.locationScore || '0',
            location: store.overview?.[0]?.summary?.location || []
          },
          text: {
            title: store.overview?.[0]?.text?.title || 'Summary',
            content: store.overview?.[0]?.text?.content || ''
          },
          footer: {
            contributionsCount: store.overview?.[0]?.footer?.contributionsCount || 0,
            modifiedDate: store.overview?.[0]?.footer?.modifiedDate || new Date().toLocaleDateString(),
            modifiedTime: store.overview?.[0]?.footer?.modifiedTime || 0,
            commentsCount: store.overview?.[0]?.footer?.commentsCount || 0,
            reviewsCount: store.overview?.[0]?.footer?.reviewsCount || 0,
            likesCount: store.overview?.[0]?.footer?.likesCount || 0,
            dislikesCount: store.overview?.[0]?.footer?.dislikesCount || 0
          }
        }],
        
        // Service section with category structure
        service: {
          header: store.service?.header || 'Service',
          category: store.service?.category || {},
          text: store.service?.text || {
            title: 'Summary',
            content: ''
          },
          footer: store.service?.footer || {
            contributionsCount: 0,
            modifiedDate: new Date().toLocaleDateString(),
            modifiedTime: 0,
            commentsCount: 0,
            reviewsCount: 0,
            likesCount: 0,
            dislikesCount: 0
          }
        },
        
        // Experience section with area and attribute structure
        experience: {
          header: store.experience?.header || 'Experience',
          area: store.experience?.area || { item: [] },
          attribute: store.experience?.attribute || {
            bestfor: [],
            working: [],
            environment: [],
            facility: []
          },
          text: store.experience?.text || {
            title: 'Summary',
            content: ''
          },
          footer: store.experience?.footer || {
            contributionsCount: 0,
            modifiedDate: new Date().toLocaleDateString(),
            modifiedTime: 0,
            commentsCount: 0,
            reviewsCount: 0,
            likesCount: 0,
            dislikesCount: 0
          }
        },
        
        // Location section with neighborhood structure
        location: {
          header: store.location?.header || `${store.hero?.city || 'Unknown'}, ${store.hero?.state || 'CA'}`,
          neighborhood: store.location?.neighborhood || {
            address: store.location?.neighborhood?.address || '',
            city: store.location?.neighborhood?.city || store.hero?.city || '',
            area: store.location?.neighborhood?.area || '',
            state: store.location?.neighborhood?.state || store.hero?.state || '',
            zip: store.location?.neighborhood?.zip || '',
            geolocation: store.location?.neighborhood?.geolocation || {
              lat: 34.0522,
              lon: -118.2437
            },
            attribute: store.location?.neighborhood?.attribute || {},
            stats: store.location?.neighborhood?.stats || {
              contributions: 0,
              reviews: 0,
              comments: 0,
              likes: 0,
              dislikes: 0
            },
            modified: store.location?.neighborhood?.modified || {
              date: new Date().toLocaleDateString(),
              time: Date.now()
            }
          },
          attribute: store.location?.attribute || [],
          footer: store.location?.footer || {
            contributionsCount: 0,
            modifiedDate: new Date().toLocaleDateString(),
            modifiedTime: 0,
            commentsCount: 0,
            reviewsCount: 0,
            likesCount: 0,
            dislikesCount: 0
          }
        },
        
        // Business section with Yelp timeline
        business: {
          header: store.business?.header || 'Business',
          timeline: store.business?.timeline || store.yelpData || {},
          footer: store.business?.footer || {
            contributionsCount: 0,
            modifiedDate: new Date().toLocaleDateString(),
            modifiedTime: 0,
            commentsCount: 0,
            reviewsCount: 0,
            likesCount: 0,
            dislikesCount: 0
          }
        },
        
        // Additional data sections
        serviceCategoryData: store.serviceCategoryData || {},
        mapRadiusData: store.mapRadiusData || {
          address: store.location?.neighborhood?.address || '',
          stores: []
        },
        
        // All Yelp data sections
        yelpData: store.yelpData || null,
        yelpFoodData: store.yelpFoodData || null,
        yelpFusionData: store.yelpFusionData || null,
        yelpSearchData: store.yelpSearchData || null,
        yelpPhoneData: store.yelpPhoneData || null,
        yelpMatchData: store.yelpMatchData || null,
        yelpDetailsData: store.yelpDetailsData || null,
        yelpDeliveryData: store.yelpDeliveryData || null,
        yelpServiceData: store.yelpServiceData || null,
        yelpInsightData: store.yelpInsightData || null,
        
        // Interactions
        interactions: store.interactions || {
          likes: 0,
          dislikes: 0,
          views: 0,
          checkins: 0,
          likedBy: [],
          dislikedBy: [],
          checkedInBy: [],
          impressions: []
        },
        
        // Timestamps
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        lastUpdated: store.lastUpdated,
        lastSynced: store.lastSynced
      };
      
      console.log(`[MongoDB mongodb.js line 336] Formatted store data for API: ${formattedStore.title}`);
      return formattedStore;
      
    } catch (error) {
      console.error(`[MongoDB mongodb.js line 340] Error getting store for API:`, error);
      throw error;
    }
  }
};
// Merge enhanced operations into existing storeOperations
Object.assign(storeOperations, enhancedStoreOperations);




// Blog operations (add after storeOperations)
// const blogOperations = {
//   // Find blog by slug
//   async findBySlug(slug) {
//     try {
//       console.log(`[MongoDB] Finding blog by slug: ${slug}`);
//       return await BlogModel.findOne({ slug }).maxTimeMS(5000);
//     } catch (error) {
//       console.error('[MongoDB] Error finding blog:', error);
//       throw error;
//     }
//   },

//     // Upsert blog and update user's blogPosts
//   async upsertBlog(blogData, source) {
//     try {
//       console.log(`[MongoDB] Upserting blog from ${source}:`, blogData.slug);

//       // Format the blog data for MongoDB
//       const formattedData = {
//         slug: blogData.slug,
//         title: blogData.title || blogData.headline?.text || 'Untitled Blog',
//         variant: 'blogs',
//         category: {
//           category: blogData.category?.category || 'dine'
//         },
//         snippet: {
//           text: blogData.snippet?.text || blogData.snippet?.subtext || ''
//         },
//         content: blogData.content || {},
//         media: {
//           hero: blogData.media?.hero || '',
//           thumbnail: blogData.media?.thumbnail || blogData.media?.hero || '',
//           gallery: blogData.media?.gallery || []
//         },
//         tag: blogData.tag || [],
//         author: blogData.author || {
//           name: 'Anonymous',
//           email: 'anonymous@example.com'
//         },
//         status: blogData.status || 'published',
//         template: blogData.template || 'freestyle',
//         settings: blogData.settings || {
//           public: true,
//           comments: true,
//           autosave: false
//         },
//         publishedAt: blogData.publishedAt || new Date(),
//         createdAt: blogData.createdAt || new Date(),
//         updatedAt: new Date(),
//         // Store the complete original data
//         originalData: blogData
//       };
      
//       // Find or create the blog
//       const blog = await BlogModel.findOneAndUpdate(
//         { slug: blogData.slug },
//         formattedData,
//         { 
//           upsert: true, 
//           new: true,
//           setDefaultsOnInsert: true 
//         }
//       );
      
//       console.log(`[MongoDB] Blog upserted: ${blog.title} (${blog._id})`);
      
//       // Update user's blogPosts if author is specified
//       if (blogData.author?.username) {
//         await this.addBlogToUser(blogData.author.username, blog);
//       }
      
//       return blog;
//     } catch (error) {
//       console.error('[MongoDB] Error upserting blog:', error);
//       throw error;
//     }
//   },
  
//   // Add blog reference to user's blogPosts array
//   async addBlogToUser(username, blog) {
//     try {
//       console.log(`[MongoDB] Adding blog ${blog.slug} to user ${username}`);
      
//       const user = await UserModel.findOne({ username });
//       if (!user) {
//         console.warn(`[MongoDB] User ${username} not found for blog association`);
//         return null;
//       }
      
//       // Check if blog already exists in user's blogPosts
//       const existingBlog = user.blogPosts.find(bp => 
//         bp.blogId?.toString() === blog._id.toString() || 
//         bp.slug === blog.slug
//       );
      
//       if (!existingBlog) {
//         // Add blog to user's blogPosts
//         user.blogPosts.push({
//           blogId: blog._id,
//           title: blog.title,
//           slug: blog.slug,
//           category: blog.category?.category || 'dine',
//           snippet: blog.snippet?.text || '',
//           thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
//           status: blog.status,
//           publishedAt: blog.publishedAt,
//           addedAt: new Date()
//         });
        
//         // Also add to blogsCreated if not already there
//         const existingCreated = user.blogsCreated.find(bc => 
//           bc.blogId === blog._id.toString() || 
//           bc.slug === blog.slug
//         );
        
//         if (!existingCreated) {
//           user.blogsCreated.push({
//             blogId: blog._id.toString(),
//             title: blog.title,
//             slug: blog.slug,
//             status: blog.status,
//             createdAt: blog.createdAt,
//             publishedAt: blog.publishedAt,
//             views: 0,
//             likes: 0
//           });
//         }
        
//         await user.save();
//         console.log(`[MongoDB] Blog added to user ${username}'s blogPosts`);
//       } else {
//         console.log(`[MongoDB] Blog already exists in user ${username}'s blogPosts`);
//       }
      
//       return user;
//     } catch (error) {
//       console.error('[MongoDB] Error adding blog to user:', error);
//       throw error;
//     }
//   },
  
//   // Sync all blogs for a user
//   async syncUserBlogs(username) {
//     try {
//       console.log(`[MongoDB] Syncing all blogs for user: ${username}`);
      
//       const user = await UserModel.findOne({ username });
//       if (!user) {
//         throw new Error(`User ${username} not found`);
//       }
      
//       // Find all blogs authored by this user
//       const userBlogs = await BlogModel.find({
//         'author.username': username
//       }).select('_id slug title snippet category media status publishedAt createdAt');
      
//       console.log(`[MongoDB] Found ${userBlogs.length} blogs for user ${username}`);
      
//       // Clear existing blogPosts to avoid duplicates
//       user.blogPosts = [];
//       user.blogsCreated = [];
      
//       // Add all blogs to user's arrays
//       for (const blog of userBlogs) {
//         user.blogPosts.push({
//           blogId: blog._id,
//           title: blog.title,
//           slug: blog.slug,
//           category: blog.category?.category || 'dine',
//           snippet: blog.snippet?.text || '',
//           thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
//           status: blog.status,
//           publishedAt: blog.publishedAt,
//           addedAt: new Date()
//         });
        
//         user.blogsCreated.push({
//           blogId: blog._id.toString(),
//           title: blog.title,
//           slug: blog.slug,
//           status: blog.status,
//           createdAt: blog.createdAt,
//           publishedAt: blog.publishedAt,
//           views: 0,
//           likes: 0
//         });
//       }
      
//       await user.save();
//       console.log(`[MongoDB] Synced ${userBlogs.length} blogs for user ${username}`);
      
//       return {
//         user,
//         blogsSynced: userBlogs.length
//       };
//     } catch (error) {
//       console.error('[MongoDB] Error syncing user blogs:', error);
//       throw error;
//     }
//   },
  
//   // Get user's blog posts with full blog data
//   async getUserBlogPosts(username, options = {}) {
//     try {
//       const { limit = 20, status = 'published', populate = true } = options;
      
//       console.log(`[MongoDB] Getting blog posts for user: ${username}`);
      
//       const query = UserModel.findOne({ username })
//         .select('blogPosts blogsCreated');
      
//       if (populate) {
//         query.populate({
//           path: 'blogPosts.blogId',
//           model: 'Blog',
//           select: 'slug title snippet category media publishedAt status author interactions'
//         });
//       }
      
//       const user = await query.maxTimeMS(10000);
      
//       if (!user) {
//         return [];
//       }
      
//       // Filter by status and limit
//       const filteredPosts = user.blogPosts
//         .filter(post => !status || post.status === status)
//         .slice(0, limit);
      
//       console.log(`[MongoDB] Found ${filteredPosts.length} blog posts for user ${username}`);
      
//       return filteredPosts;
//     } catch (error) {
//       console.error('[MongoDB] Error getting user blog posts:', error);
//       throw error;
//     }
//   },
  
//   // Update blog interaction stats
//   async updateBlogStats(blogId, interaction) {
//     try {
//       const update = {};
      
//       switch (interaction.type) {
//         case 'view':
//           update.$inc = { 'interactions.views': 1 };
//           break;
//         case 'like':
//           update.$inc = { 'interactions.likes': interaction.value || 1 };
//           break;
//         case 'save':
//           update.$inc = { 'interactions.saves': interaction.value || 1 };
//           break;
//         case 'share':
//           update.$inc = { 'interactions.shares': 1 };
//           break;
//       }
      
//       const blog = await BlogModel.findByIdAndUpdate(
//         blogId,
//         update,
//         { new: true }
//       );
      
//       console.log(`[MongoDB] Updated blog stats for ${blogId}: ${interaction.type}`);
      
//       return blog;
//     } catch (error) {
//       console.error('[MongoDB] Error updating blog stats:', error);
//       throw error;
//     }
//   },
  
//   async findOrCreateBlog(blogData) {
//     try {
//       let blog = await BlogModel.findOne({ 
//         $or: [
//           { slug: blogData.slug },
//           { _id: blogData._id }
//         ]
//       });

//       if (blog) {
//         return blog;
//       }

//       blog = new BlogModel(blogData);
//       await blog.save();
//       return blog;
//     } catch (error) {
//       errorLog('findOrCreateBlog', error);
//       throw error;
//     }
//   },

//   async updateBlogData(blogId, updates, source) {
//     try {
//       const blog = await BlogModel.findOne({ 
//         $or: [
//           { _id: blogId },
//           { slug: blogId }
//         ]
//       });
      
//       if (!blog) {
//         throw new Error('Blog not found');
//       }

//       // Update source-specific data
//       blog[source] = {
//         lastSync: new Date(),
//         data: updates
//       };

//       const updated = await blog.save();
//       return updated;
//     } catch (error) {
//       errorLog('updateBlogData', error);
//       throw error;
//     }
//   },

//   async syncBlogData(slug) {
//     try {
//       if (!slug) {
//         console.error('No slug provided for blog sync');
//         return null;
//       }

//       console.log(`[MongoDB] Starting sync for blog slug: ${slug}`);
      
//       // First check if the blog already exists in MongoDB
//       const existingBlog = await BlogModel.findOne({ slug });
//       if (existingBlog) {
//         console.log(`[MongoDB] Found existing blog: ${existingBlog.title}`);
        
//         // Check if sync was performed recently (last 1 hour)
//         const lastSyncTime = existingBlog.updatedAt || existingBlog.createdAt;
//         const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
        
//         if (lastSyncTime > oneHourAgo) {
//           console.log(`[MongoDB] Blog was synced recently: ${lastSyncTime}`);
//           return existingBlog;
//         }
        
//         console.log(`[MongoDB] Blog needs refresh, last sync: ${lastSyncTime}`);
//       }

//       // Fetch fresh data from source
//       // Note: You'll need to implement getBlogBySlug in your data source
//       const blogDataInstance = new BlogData(); // You'll need to create this class
//       const blogData = await blogDataInstance.getBlogBySlug(slug);

//       if (!blogData) {
//         console.error(`[MongoDB] Blog data not found for slug: ${slug}`);
//         return existingBlog || null; // Return existing data if available
//       }

//       // Format data for MongoDB
//       const blogDocument = {
//         slug: slug,
//         title: blogData.title || blogData.headline?.text || 'Untitled Blog',
//         variant: 'blogs',
//         category: {
//           category: blogData.category?.category || 'dine'
//         },
//         snippet: {
//           text: blogData.snippet?.text || ''
//         },
//         content: blogData.content || {},
//         media: {
//           hero: blogData.media?.hero || '',
//           thumbnail: blogData.media?.thumbnail || blogData.media?.hero || ''
//         },
//         tag: blogData.tag || [],
//         author: blogData.author || {},
//         status: blogData.status || 'published',
//         publishedAt: blogData.publishedAt || new Date(),
//         // Save the complete raw data in a dedicated field
//         blogData: blogData
//       };

//       // Save to database (create or update)
//       const savedBlog = await BlogModel.findOneAndUpdate(
//         { slug: blogData.slug },
//         blogDocument,
//         { 
//           upsert: true, 
//           new: true,
//           setDefaultsOnInsert: true
//         }
//       );

//       console.log(`[MongoDB] Blog synced successfully: ${savedBlog.title}`);
//       return savedBlog;

//     } catch (error) {
//       console.error(`[MongoDB] Blog sync failed: ${error.message}`);
//       return null;
//     }
//   },

//   // Get blog by slug, sync if not found
//   async getOrCreateBlogBySlug(slug) {
//     try {
//       // Check if blog exists in DB
//       let blog = await BlogModel.findOne({ slug });
      
//       if (blog) {
//         console.log(`[MongoDB] Found existing blog: ${blog.title}`);
//         return blog;
//       }

//       console.log(`[MongoDB] Blog not found, syncing: ${slug}`);
      
//       // If not found, sync it
//       blog = await this.syncBlogData(slug);
//       return blog;

//     } catch (error) {
//       console.error('[MongoDB] Error getting blog:', error.message);
//       return null;
//     }
//   }
// };

// Data integration functions
export const storeData = {
  async upsertStore(storeData, source) {
    try {
      console.log(`[MongoDB] Upserting store from ${source}:`, storeData.storeId);

      // Format the store data for MongoDB
      const formattedData = {
        slug: storeData.slug,
        title: storeData.hero?.storeName || storeData.title || 'Unnamed Store',
        variant: 'stores',
        category: {
          categoryType: Array.isArray(storeData.hero?.storeType) 
            ? storeData.hero.storeType[0]?.title 
            : storeData.hero?.storeType
        },
        location: {
          type: 'Store',
          geolocation: {
            lat: storeData.location?.geolocation?.lat || 0,
            lon: storeData.location?.geolocation?.lon || 0
          },
          address: storeData.location?.address || '',
          region: storeData.location?.neighborhood?.city || ''
        },
        media: {
          gallery: storeData.hero?.gallery || []
        },
        // Store the complete original data
        originalData: storeData
      };
      
      // Find or create the store
      const store = await Store.findOneAndUpdate(
        { slug: storeData.slug },
        formattedData,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log(`[MongoDB] Store saved successfully: ${store.title}`);
      return store;
    } catch (error) {
      console.error(`[MongoDB] Error upserting store: ${error.message}`);
      throw error;
    }
  },

  async addStoreValidation(storeId, userId) {
    console.log("[MongoDB] Adding store validation:", { storeId, userId });
    
    try {
      const store = await Store.findOne({ storeId });
      if (!store) {
        throw new Error('Store not found');
      }

      store.validations.push({ userId, timestamp: new Date() });
      const updated = await store.save();
      
      console.log("[MongoDB] Validation status:", {
        total: updated.validations.length,
        isValidated: updated.isValidated
      });
      
      return updated;
    } catch (error) {
      console.error("[MongoDB] Error adding validation:", error);
      throw error;
    }
  },

  async updateStoreSection(storeId, sectionName, content, userId) {
    console.log("[MongoDB] Updating store section:", { storeId, sectionName });
    
    try {
      const store = await Store.findOne({ storeId });
      if (!store) {
        throw new Error('Store not found');
      }

      // Generate unique request ID
      const requestId = `${storeId}-${sectionName}-${Date.now()}`;
      
      // Add to section history
      store.sections[sectionName].history.push({
        userId,
        content,
        requestId,
        timestamp: new Date()
      });

      console.log("[MongoDB] Created edit request:", requestId);

      // Example: Send email notification (implement this)
      // await sendEditNotification({
      //  to: 'rei@neumad.com',
      //  cc: 'to.reiwatanabe@gmail.com',
      //  requestId,
      //  storeId,
      //  sectionName,
      //  content,
      //  userId
      // });

      const updated = await store.save();
      return { store: updated, requestId };
    } catch (error) {
      console.error("[MongoDB] Error updating section:", error);
      throw error;
    }
  }
};

// Blog data integration functions (add after storeData)
export const blogData = {
  async upsertBlog(blogData, source) {
    try {
      console.log(`[MongoDB] Upserting blog from ${source}:`, blogData.slug);

      // Format the blog data for MongoDB
      const formattedData = {
        slug: blogData.slug,
        title: blogData.title || blogData.headline?.text || 'Untitled Blog',
        variant: 'blogs',
        category: {
          category: blogData.category?.category || 'dine'
        },
        snippet: {
          text: blogData.snippet?.text || blogData.snippet?.subtext || ''
        },
        content: blogData.content || {},
        media: {
          hero: blogData.media?.hero || '',
          thumbnail: blogData.media?.thumbnail || blogData.media?.hero || ''
        },
        tag: blogData.tag || [],
        author: blogData.author || {
          name: 'Anonymous',
          email: 'anonymous@example.com'
        },
        status: blogData.status || 'published',
        template: blogData.template || 'freestyle',
        settings: blogData.settings || {
          public: true,
          comments: true,
          autosave: false
        },
        publishedAt: blogData.publishedAt || new Date(),
        createdAt: blogData.createdAt || new Date(),
        updatedAt: new Date(),
        // Store the complete original data
        originalData: blogData
      };
      
      // Find or create the blog
      const blog = await BlogModel.findOneAndUpdate(
        { slug: blogData.slug },
        formattedData,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log(`[MongoDB] Blog saved successfully: ${blog.title}`);
      return blog;
    } catch (error) {
      console.error(`[MongoDB] Error upserting blog: ${error.message}`);
      throw error;
    }
  },

  async addBlogComment(blogId, comment, userId) {
    console.log("[MongoDB] Adding blog comment:", { blogId, userId });
    
    try {
      const blog = await BlogModel.findOne({ 
        $or: [
          { _id: blogId },
          { slug: blogId }
        ]
      });
      
      if (!blog) {
        throw new Error('Blog not found');
      }

      if (!blog.comments) {
        blog.comments = [];
      }

      blog.comments.push({ 
        userId, 
        comment,
        timestamp: new Date() 
      });
      
      const updated = await blog.save();
      
      console.log("[MongoDB] Comment added:", {
        total: updated.comments.length
      });
      
      return updated;
    } catch (error) {
      console.error("[MongoDB] Error adding comment:", error);
      throw error;
    }
  },

  async updateBlogSection(blogId, sectionName, content, userId) {
    console.log("[MongoDB] Updating blog section:", { blogId, sectionName });
    
    try {
      const blog = await BlogModel.findOne({ 
        $or: [
          { _id: blogId },
          { slug: blogId }
        ]
      });
      
      if (!blog) {
        throw new Error('Blog not found');
      }

      // Generate unique request ID
      const requestId = `${blogId}-${sectionName}-${Date.now()}`;
      
      // Initialize sections if not exists
      if (!blog.sections) {
        blog.sections = {};
      }
      
      if (!blog.sections[sectionName]) {
        blog.sections[sectionName] = { history: [] };
      }

      // Add to section history
      blog.sections[sectionName].history.push({
        userId,
        content,
        requestId,
        timestamp: new Date()
      });

      console.log("[MongoDB] Created blog edit request:", requestId);

      const updated = await blog.save();
      return { blog: updated, requestId };
    } catch (error) {
      console.error("[MongoDB] Error updating blog section:", error);
      throw error;
    }
  }
};

// Create a test for MongoDB connectivity and models
const testMongoDBConnection = async () => {
  try {
    console.log('\n[TEST] Starting MongoDB connection test...');
    
    // Test connection
    if (mongoose.connection.readyState !== 1) {
      console.log('[TEST] Attempting to connect...');
      await connectDB();
    }
    
    console.log('[TEST] Connection state:', mongoose.connection.readyState);
    console.log('[TEST] Database name:', mongoose.connection.name);
    
    // Test Store model
    console.log('\n[TEST] Testing Store model...');
    const testStore = new StoreModel({
      slug: `test-store-${Date.now()}`,
      title: 'Test Store',
      hero: { storeName: 'Test Store Name' }
    });
    
    console.log('[TEST] Saving test store...');
    const savedStore = await testStore.save();
    console.log('[TEST] Store saved successfully:', savedStore._id);
    
    // Clean up test data
    console.log('[TEST] Cleaning up test data...');
    await StoreModel.findByIdAndDelete(savedStore._id);
    
    console.log('\n[TEST] MongoDB connection and models test completed successfully!\n');
    return true;
  } catch (error) {
    console.error('\n[TEST] MongoDB test failed:', error.message);
    console.error('[TEST] Error details:', error);
    return false;
  }
};

// Then call this at the start of initializeServer:
const initializeServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // Test MongoDB connection
    const mongoDBWorking = await testMongoDBConnection();
    if (!mongoDBWorking) {
      console.warn('MongoDB connection test failed - check your connection string');
    }
    
    // Rest of your initializeServer function...
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
};

// // Export functions
// export { 
//   UserModel,
//   StoreModel, 
//   BlogModel,
//   getDatabase, 
//   storeOperations,
//   blogOperations, // Add this
//   testMongoDBConnection,
//   connectDB
// };

// Get database instance
const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel,
    BlogModel
  };
};


export { 
  connectDB,
  UserModel,
  StoreModel,
  BlogModel,
  storeOperations,
  blogOperations,
  userOperations
};

export default {
  connectDB,
  UserModel,
  StoreModel,
  BlogModel,
  storeOperations,
  blogOperations,
  userOperations
};

///////////////////////// END UPDATED MONGODB MODULE /////////////////////////