import mongoose from 'mongoose';
import { StoreModel } from '../../models/storeModel.js';
import { UserModel } from '../../models/userModel.js';
import { BlogModel } from '../../models/blogModel.js';
// import * as userModel from '../../models/userModel.js';
// import * as data from '../../data/data.js';
import { parseServerUrl } from "../../utils/utils.server.js";
import { io } from "socket.io-client";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { StoreData } from '../data.js';
import fs from 'fs';
import path from 'path';

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

// Database connection
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

// Store operations
const storeOperations = {
  async findOrCreateStore(storeData) {
    try {
      let store = await Store.findOne({ 
        $or: [
          { storeId: storeData.storeId },
          { slug: storeData.slug }
        ]
      });

      if (store) {
        return store;
      }

      store = new Store(storeData);
      await store.save();
      return store;
    } catch (error) {
      errorLog('findOrCreateStore', error);
      throw error;
    }
  },  

  async updateStoreData(storeId, updates, source) {
    try {
      const store = await Store.findOne({ storeId });
      if (!store) {
        throw new Error('Store not found');
      }

      // Update source-specific data
      store[source] = {
        lastSync: new Date(),
        data: updates
      };

      const updated = await store.save();
      return updated;
    } catch (error) {
      errorLog('updateStoreData', error);
      throw error;
    }
  },

  async syncStoreData(slug) {
    try {
      if (!slug) {
        console.error('No slug provided for store sync');
        return null;
      }

      console.log(`[MongoDB] Starting sync for store slug: ${slug}`);
      
      // First check if the store already exists in MongoDB
      const existingStore = await Store.findOne({ slug });
      if (existingStore) {
        console.log(`[MongoDB] Found existing store: ${existingStore.title}`);
        
        // Check if sync was performed recently (last 1 hour)
        const lastSyncTime = existingStore.updatedAt || existingStore.createdAt;
        const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
        
        if (lastSyncTime > oneHourAgo) {
          console.log(`[MongoDB] Store was synced recently: ${lastSyncTime}`);
          return existingStore;
        }
        
        console.log(`[MongoDB] Store needs refresh, last sync: ${lastSyncTime}`);
      }

      // Fetch fresh data from source
      const storeDataInstance = new StoreData();
      const storeData = await storeDataInstance.getStoreBySlug(slug);

      if (!storeData) {
        console.error(`[MongoDB] Store data not found for slug: ${slug}`);
        return existingStore || null; // Return existing data if available
      }

      // Format data for MongoDB
      const storeDocument = {
        slug: slug,
        title: storeData.hero?.storeName || 'Unnamed Store',
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
        // Save the complete raw data in a dedicated field
        storeData: storeData
      };

      // Save to database (create or update)
      const savedStore = await Store.findOneAndUpdate(
        { slug: storeData.slug },
        storeDocument,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(`[MongoDB] Store synced successfully: ${savedStore.title}`);
      return savedStore;

    } catch (error) {
      console.error(`[MongoDB] Store sync failed: ${error.message}`);
      return null;
    }
  },

  // Get store by slug, sync if not found
  async getOrCreateStoreBySlug(slug) {
    try {
      console.log(`[StoreOperations] Getting or creating store: ${slug}`);
      
      // First try to find existing store
      let store = await StoreModel.findOne({ slug });
      
      if (store) {
        console.log(`[StoreOperations] Found existing store: ${store.title}`);
        return store;
      }
      
      // If not found, try to sync from external API
      const syncedStore = await this.syncStoreData(slug);
      
      if (syncedStore) {
        console.log(`[StoreOperations] Created new store from sync: ${syncedStore.title}`);
        return syncedStore;
      }
      
      console.log(`[StoreOperations] Store not found and could not sync: ${slug}`);
      return null;
      
    } catch (error) {
      console.error(`[StoreOperations] Error getting/creating store ${slug}:`, error);
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
const blogOperations = {
  async findOrCreateBlog(blogData) {
    try {
      let blog = await BlogModel.findOne({ 
        $or: [
          { slug: blogData.slug },
          { _id: blogData._id }
        ]
      });

      if (blog) {
        return blog;
      }

      blog = new BlogModel(blogData);
      await blog.save();
      return blog;
    } catch (error) {
      errorLog('findOrCreateBlog', error);
      throw error;
    }
  },

  async updateBlogData(blogId, updates, source) {
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

      // Update source-specific data
      blog[source] = {
        lastSync: new Date(),
        data: updates
      };

      const updated = await blog.save();
      return updated;
    } catch (error) {
      errorLog('updateBlogData', error);
      throw error;
    }
  },

  async syncBlogData(slug) {
    try {
      if (!slug) {
        console.error('No slug provided for blog sync');
        return null;
      }

      console.log(`[MongoDB] Starting sync for blog slug: ${slug}`);
      
      // First check if the blog already exists in MongoDB
      const existingBlog = await BlogModel.findOne({ slug });
      if (existingBlog) {
        console.log(`[MongoDB] Found existing blog: ${existingBlog.title}`);
        
        // Check if sync was performed recently (last 1 hour)
        const lastSyncTime = existingBlog.updatedAt || existingBlog.createdAt;
        const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
        
        if (lastSyncTime > oneHourAgo) {
          console.log(`[MongoDB] Blog was synced recently: ${lastSyncTime}`);
          return existingBlog;
        }
        
        console.log(`[MongoDB] Blog needs refresh, last sync: ${lastSyncTime}`);
      }

      // Fetch fresh data from source
      // Note: You'll need to implement getBlogBySlug in your data source
      const blogDataInstance = new BlogData(); // You'll need to create this class
      const blogData = await blogDataInstance.getBlogBySlug(slug);

      if (!blogData) {
        console.error(`[MongoDB] Blog data not found for slug: ${slug}`);
        return existingBlog || null; // Return existing data if available
      }

      // Format data for MongoDB
      const blogDocument = {
        slug: slug,
        title: blogData.title || blogData.headline?.text || 'Untitled Blog',
        variant: 'blogs',
        category: {
          category: blogData.category?.category || 'dine'
        },
        snippet: {
          text: blogData.snippet?.text || ''
        },
        content: blogData.content || {},
        media: {
          hero: blogData.media?.hero || '',
          thumbnail: blogData.media?.thumbnail || blogData.media?.hero || ''
        },
        tag: blogData.tag || [],
        author: blogData.author || {},
        status: blogData.status || 'published',
        publishedAt: blogData.publishedAt || new Date(),
        // Save the complete raw data in a dedicated field
        blogData: blogData
      };

      // Save to database (create or update)
      const savedBlog = await BlogModel.findOneAndUpdate(
        { slug: blogData.slug },
        blogDocument,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(`[MongoDB] Blog synced successfully: ${savedBlog.title}`);
      return savedBlog;

    } catch (error) {
      console.error(`[MongoDB] Blog sync failed: ${error.message}`);
      return null;
    }
  },

  // Get blog by slug, sync if not found
  async getOrCreateBlogBySlug(slug) {
    try {
      // Check if blog exists in DB
      let blog = await BlogModel.findOne({ slug });
      
      if (blog) {
        console.log(`[MongoDB] Found existing blog: ${blog.title}`);
        return blog;
      }

      console.log(`[MongoDB] Blog not found, syncing: ${slug}`);
      
      // If not found, sync it
      blog = await this.syncBlogData(slug);
      return blog;

    } catch (error) {
      console.error('[MongoDB] Error getting blog:', error.message);
      return null;
    }
  }
};

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

// Export functions
export { 
  UserModel,
  StoreModel, 
  BlogModel,
  getDatabase, 
  storeOperations,
  blogOperations, // Add this
  testMongoDBConnection,
  connectDB
};

// Create a function to get database
const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel,
    BlogModel
  };
};