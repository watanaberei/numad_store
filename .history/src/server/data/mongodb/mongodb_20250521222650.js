import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { io } from "socket.io-client";

// import utils
import { parseServerUrl } from "../../utils/utils.server.js";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

// Import models
import { UserModel } from '../../models/userModel.js';
import { StoreModel } from '../../models/storeModel.js';
import { BlogModel } from '../../models/blogModel.js';

// Import data
import { StoreData } from '../data.js';

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
// const User = UserModel;
// // Use the imported StoreModel directly
// const Store = StoreModel;

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/neumad';
    

    console.log('[MongoDB] Attempting to connect to database...');
    
    if (mongoose.connection.readyState === 1) {
      console.log('[MongoDB] Using existing connection');
      return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    console.log('[MongoDB] Connecting to:', uri);
    
    const Connect = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // const conn = await mongoose.connect(mongoURI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

    console.log(`MongoDB Connected: ${Connect.Connect.host}`);

    // Test the Connect
    const collections = await mongoose.Connect.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    console.log('[MongoDB] Connected successfully to database');
    console.log('[MongoDB] Connection state:', mongoose.connection.readyState);
    console.log('[MongoDB] Database name:', mongoose.connection.name);
    
    return Connect;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
//     return connection;
//   } catch (error) {
//     console.error('[MongoDB] Connection error:', error.message);
//     throw error;
//   }
// };

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
      console.log(`[MongoDB] Syncing store data for slug: ${slug}`);
      if (!slug) {
        console.error('No slug provided for store sync');
        return null;
      }

      console.log(`[MongoDB] Starting sync for store slug: ${slug}`);
      
      // Check if store exists
      const existingStore = await StoreModel.findOne({ slug });
      // const existingStore = await Store.findOne({ slug });
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
        return existingStore;
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
      let store = await StoreModel.findOne({ slug });
    // try {
      // Check if store exists in DB
      // let store = await Store.findOne({ slug });
      
      if (!store) {
        // Create a basic store entry
        store = new StoreModel({
          slug,
          title: slug,
          variant: 'stores',
          lastUpdated: new Date()
        });
        // console.log(`[MongoDB] Found existing store: ${store.title}`);
        // return store;
        await store.save();
        console.log(`[MongoDB] Created new store: ${slug}`);
      }

      console.log(`[MongoDB] Store not found, syncing: ${slug}`);
      
      // If not found, sync it
      store = await this.syncStoreData(slug);
      return store;

    } catch (error) {
      console.error('[MongoDB] Error getting store:', error.message);
      return null;
    }
  }
};

  
// Blog operations

// Blog operations
const blogOperations = {
  async findPublishedBlogs(options = {}) {
    try {
      return await BlogModel.findPublished(options);
    } catch (error) {
      console.error(`[MongoDB] Error finding published blogs: ${error.message}`);
      return [];
    }
  },

  async findBlogBySlug(slug) {
    try {
      return await BlogModel.findBySlug(slug);
    } catch (error) {
      console.error(`[MongoDB] Error finding blog by slug: ${error.message}`);
      return null;
    }
  },

  async createBlog(blogData) {
    try {
      const blog = new BlogModel(blogData);
      await blog.save();
      console.log(`[MongoDB] Created new blog: ${blog.slug}`);
      return blog;
    } catch (error) {
      console.error(`[MongoDB] Error creating blog: ${error.message}`);
      throw error;
    }
  },

  async updateBlog(slug, updateData) {
    try {
      const blog = await BlogModel.findOneAndUpdate(
        { slug },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (blog) {
        console.log(`[MongoDB] Updated blog: ${blog.slug}`);
      }
      
      return blog;
    } catch (error) {
      console.error(`[MongoDB] Error updating blog: ${error.message}`);
      throw error;
    }
  },

  async deleteBlog(slug) {
    try {
      const result = await BlogModel.findOneAndDelete({ slug });
      
      if (result) {
        console.log(`[MongoDB] Deleted blog: ${slug}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[MongoDB] Error deleting blog: ${error.message}`);
      throw error;
    }
  },

  async getBlogStats() {
    try {
      const stats = await BlogModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});
    } catch (error) {
      console.error(`[MongoDB] Error getting blog stats: ${error.message}`);
      return {};
    }
  }
};


// User operations for backwards compatibility
const userOperations = {
  async findUserByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      console.error(`[MongoDB] Error finding user: ${error.message}`);
      return null;
    }
  },

  async createUser(userData) {
    try {
      const user = new UserModel(userData);
      await user.save();
      console.log(`[MongoDB] Created new user: ${user.email}`);
      return user;
    } catch (error) {
      console.error(`[MongoDB] Error creating user: ${error.message}`);
      throw error;
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


// Export functions
export { 
  connectDB, 
  UserModel, 
  StoreModel, 
  BlogModel,
  storeOperations,
  blogOperations,
  userOperations
};