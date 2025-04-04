import mongoose from 'mongoose';
// StoreModel: (collection) => connection.import mongoose from 'mongoose';
import StoreModel from '../../models/storeModel.js';
import { UserModel } from '../../models/userModel.js';
import * as data from '../../data/data.js';
import { parseRequestUrl } from "../../../client/utils/utils.js";
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
const User = mongoose.model('User', UserModel);
const Store = mongoose.model('Store', StoreModel);

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/neuapps";
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log('[MongoDB] Connected successfully to database');
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
      // Check if store exists in DB
      let store = await Store.findOne({ slug });
      
      if (store) {
        console.log(`[MongoDB] Found existing store: ${store.title}`);
        return store;
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

// Create a test for MongoDB connectivity
// Test MongoDB connection and store operations
const testMongoDBConnection = async () => {
  try {
    console.log('\n[TEST] Testing MongoDB connection...');
    
    // Check connection status
    if (mongoose.connection.readyState !== 1) {
      console.error('[TEST] MongoDB not connected. Status:', mongoose.connection.readyState);
      return false;
    }
    
    console.log('[TEST] MongoDB connected successfully');
    
    // Try to create a test document
    const testData = {
      slug: 'test-store-' + Date.now(),
      hero: { storeName: 'Test Store' },
      overview: { text: 'This is a test store' },
      lastUpdated: new Date()
    };
    
    console.log('[TEST] Creating test store document...');
    const testStore = await Store.create(testData);
    
    console.log('[TEST] Test document created successfully:');
    console.log(`[TEST] - ID: ${testStore._id}`);
    console.log(`[TEST] - Slug: ${testStore.slug}`);
    
    // Delete the test document
    console.log('[TEST] Cleaning up test document...');
    await StoreModel.findByIdAndDelete(testStore._id);
    
    console.log('[TEST] MongoDB test completed successfully!\n');
    return true;
  } catch (error) {
    console.error('[TEST] MongoDB test failed:', error.message);
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
  connectDB, 
  getDatabase, 
  storeOperations,
  testMongoDBConnection
};

// Create a function to get database
const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel
  };
};