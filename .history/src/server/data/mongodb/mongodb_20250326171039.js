import mongoose from 'mongoose';
import { UserSchema } from '../../models/userModel.js';
import { StoreSchema } from '../../models/storeModel.js';
import * as data from '../data.js';
import { parseRequestUrl } from "../../../client/utils/utils.js";
import { io } from "socket.io-client";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import fs from 'fs';
import path from 'path';
// import { storeOperations } from './data/mongodb/mongodb.js';

// Debug helpers
const debugLog = (location, message, data) => {
   console.log(`[DEBUG][${location}]`, message, data ? JSON.stringify(data) : '');
};

const errorLog = (location, error) => {
   console.error(`[ERROR][${location}]`, {
    message: error.message,
    stack: error.stack,
    // context: error.context
  });
};

// Create models ONCE at the top
const User = mongoose.model('User', UserSchema);
const Store = mongoose.model('Store', StoreSchema);

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
       console.log('[MongoDB] Already connected');
      return mongoose.connection;
    }

    const connection = await mongoose.connect("mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/test", {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });
    
    //  console.log('[MongoDB] Connected successfully');
    return connection;
  } catch (error) {
     console.error('[MongoDB] Connection error:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
};

// Store operations
const storeOperations = {
  async findOrCreateStore(storeData) {
    try {
       console.log('[MongoDB] Finding/creating store:', storeData.slug);
      
      let store = await Store.findOne({ slug: storeData.slug });

      if (store) {
         console.log('[MongoDB] Found existing store:', store._id);
        return store;
      }

      // Format store data
      const storeDoc = {
        title: storeData.title,
        slug: storeData.slug,
        sys: storeData.sys || {},
        isValidated: storeData.isValidated || false,
        storeAttributes: storeData.storeAttributes || [],
        hours: storeData.hours || [],
        storeWebsite: storeData.storeWebsite || [],
        googleRatings: storeData.googleRatings || [],
        yelpRatings: storeData.yelpRatings || [],
        storeRatings: storeData.storeRatings || [],
        recommendation: storeData.recommendation || [],
        popularTimes: storeData.popularTimes || [],
        storeServices: storeData.storeServices || [],
        handles: storeData.handles || [],
        contact: storeData.contact || [],
        storeChainStoresCollection: storeData.storeChainStoresCollection || {},
        attributes: storeData.attributes || {},
        location: {
          type: 'Store',
          geolocation: {
            lat: storeData.location?.geolocation?.lat || 0,
            lon: storeData.location?.geolocation?.lon || 0
          },
          address: storeData.location?.address || '',
          region: storeData.location?.region || '',
          locatedIn: storeData.location?.locatedIn || null
        },
        media: storeData.media || {},
        interactions: {
          likes: 0,
          dislikes: 0,
          checkins: 0,
          likedBy: [],
          dislikedBy: [],
          checkedInBy: []
        },
        updatedAt: new Date()
      };

      store = new Store(storeDoc);
      await store.save();
       console.log('[MongoDB] Created new store:', store._id);
      return store;
    } catch (error) {
       console.error('[MongoDB] Error in findOrCreateStore:', error);
      throw error;
    }
  },

  async updateStoreData(storeId, updates, source) {
    try {
      // debugLog('updateStoreData', 'Updating store', { storeId, source });
      
      const store = await Store.findOne({ 
        $or: [
          { storeId: storeData.storeId },
          { slug: storeData.slug }
        ]
      });
      if (!store) {
        throw new Error('Store not found');
      }

      // Update source-specific data
      store[source] = {
        lastSync: new Date(),
        data: updates
      };

      // Recalculate metrics
      await store.calculateWeightedScore();
      
      const updated = await store.save();
      // debugLog('updateStoreData', 'Store updated', { id: updated._id });
      return updated;
    } catch (error) {
      errorLog('updateStoreData', error);
      throw error;
    }
  },

  async syncStoreData(slug) {
    try {
       console.log('[MongoDB] Syncing store:', slug);
      
      const storeData = new data.StoreData();
      const freshData = await storeData.store(slug);
      
      if (!freshData) {
        throw new Error('No store data found');
      }

      const store = await this.findOrCreateStore(freshData);
      return store;

    } catch (error) {
       console.error('[MongoDB] Sync error:', error);
      throw error;
    }
  },

  // Get store by slug, sync if not found
  async getOrCreateStoreBySlug(slug) {
    try {
      // Check if store exists in DB
      let store = await Store.findOne({ 
        $or: [
          { storeId: storeData.storeId },
          { slug: storeData.slug }
        ]
      });
      if (store) {
        return store;
      }

      // If not found, sync it
      store = await this.syncStoreData(slug);
      return store;

    } catch (error) {
       console.error('Error getting store:', error.message);
      return null;
    }
  }
};

// Data integration functions
export const storeData = {
  async upsertStore(storeData, source) {
    try {
      //  console.log(`[MongoDB] Upserting store from ${source}:`, storeData.storeId);

          // //  console.log("%01:[StoreScreen.render] Starting render");
  
        // 1. Get the request parameters
        const request = parseRequestUrl();
        // //  console.log("%02:[StoreScreen.render] Request params:", request);
  
        // 2. Initialize StoreData and get store data
        const storeData = new data.StoreData();
        // //  console.log("%03:[StoreScreen.render] StoreData initialized:", storeData);
  
        // 3. Get store data using slug
        // const store = await storeData.store(request.slug);
        const store = await storeData.getAllStores();
        // //  console.log("%04:[StoreScreen.render] Store data:", store);
  
        if (!store) {
          return `<div>Store not found</div>`;
        }
  
        // 4. Extract and format data for components
        const {
          hero = {},
          overview = {},
          service = {},
          experience = {},
          location = {},
          business = {},
          serviceCategoryData = {},
          mapRadiusData = {}
        } = store;
  
        // //  console.log("%06: store", store);
  
        //  console.log("%05:Store sections:", {
        //   hero,
        //   overview,
        //   service,
        //   experience,
        //   location,
        //   business,
        //   serviceCategoryData,
        //   mapRadiusData
        // });
        // const store = await StoreModel.findOne({ storeId: storeData.storeId });
        
        if (store) {
          //  console.log("[MongoDB] Updating existing store");
          
          // Update source-specific data
          store[source] = {
            lastSync: new Date(),
            data: storeData
          };

          // Merge metrics
           console.log("[MongoDB] Calculating new metrics");
          await store.calculateWeightedScore();
          
          const updated = await store.save();
           console.log("[MongoDB] Store updated:", updated.storeId);
          return updated;
        } else {
           console.log("[MongoDB] Creating new store");
          
          const newStore = new Store({
            storeId: storeData.storeId,
            slug: storeData.slug,
            title: storeData.title,
            [source]: {
              lastSync: new Date(),
              data: storeData
            }
          });
          
          const created = await newStore.save();
           console.log("[MongoDB] Store created:", created.storeId);
          return created;
        }
        
    } catch (error) {
       console.error("[MongoDB] Error upserting store:", error);
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

      // Send email notification (implement this)
      await sendEditNotification({
        to: 'rei@neumad.com',
        cc: 'to.reiwatanabe@gmail.com',
        requestId,
        storeId,
        sectionName,
        content,
        userId
      });

      const updated = await store.save();
      return { store: updated, requestId };
    } catch (error) {
       console.error("[MongoDB] Error updating section:", error);
      throw error;
    }
  }
};

// Don't auto-connect, let the application control this
// connectDB();

// // Create User model from schema
// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   firstName: {
//     type: String,
//     required: false
//   },
//   lastName: {
//     type: String,
//     required: false
//   },
//   birthdate: {
//     type: Date,
//     required: false
//   },
//   savedStore: {
//     type: [String],
//     default: []
//   },
//   checkedInStore: [{
//     storeId: String,
//     impression: {
//       type: String,
//       enum: ['like', 'dislike', null],
//       default: null
//     },
//     checkedInAt: {
//       type: Date,
//       default: Date.now
//     },
//     // Include all store fields here
//     title: String,
//     address: String,
//     city: String,
//     storeCurrentStatus: String,
//     storeRange: String,
//     neustar: Number,
//     ratings: [{
//       key: String,
//       value: String
//     }],
//     genre: String,
//     storeAttributes: [String],
//     best: [String],
//     gallery: [String],
//     // Add any other fields from the Contentful store data
//   }]
// });

// // Create Store model from schema 
// const storeSchema = new mongoose.Schema({
//   rating: { type: Number },
//   review_count: { type: Number },
//   price: { type: String },
//   costEstimate: { type: String },
//   storeType: [{
//     alias: { type: String },
//     title: { type: String }
//   }],
//   distance: { type: String },
//   city: { type: String },
//   state: { type: String },
//   storeName: { type: String },
//   distanceMiles: { type: String },
//   status: { type: String },
//   gallery: [{ type: String }],
//   overview: [{
//     header: { type: String },
//     footer: {
//       contributionsCount: { type: Number },
//       modifiedDate: { type: String },
//       modifiedTime: { type: String },
//       commentsCount: { type: Number },
//       reviewsCount: { type: Number },
//       likesCount: { type: Number },
//       dislikesCount: { type: Number }
//     }
//   }],
//   service: [{
//     header: { type: String },
//     footer: {
//       contributionsCount: { type: Number },
//       modifiedDate: { type: String },
//       modifiedTime: { type: String },
//       commentsCount: { type: Number },
//       reviewsCount: { type: Number },
//       likesCount: { type: Number },
//       dislikesCount: { type: Number }
//     }
//   }],
//   experience: {
//     header: { type: String },
//     footer: {
//       contributionsCount: { type: Number },
//       modifiedDate: { type: String },
//       modifiedTime: { type: String },
//       commentsCount: { type: Number },
//       reviewsCount: { type: Number },
//       likesCount: { type: Number },
//       dislikesCount: { type: Number }
//     }
//   },
//   business: {
//     header: { type: String },
//     timeline: {
//       id: { type: String },
//       alias: { type: String },
//       name: { type: String },
//       image_url: { type: String },
//       is_claimed: { type: Boolean },
//       is_closed: { type: Boolean },
//       url: { type: String },
//       phone: { type: String },
//       display_phone: { type: String },
//       review_count: { type: Number },
//       categories: [{
//         alias: { type: String },
//         title: { type: String }
//       }],
//       rating: { type: Number },
//       location: {
//         address1: { type: String },
//         address2: { type: String },
//         address3: { type: String },
//         city: { type: String },
//         zip_code: { type: String },
//         country: { type: String },
//         state: { type: String },
//         display_address: [{ type: String }],
//         cross_streets: { type: String }
//       },
//       coordinates: {
//         latitude: { type: Number },
//         longitude: { type: Number }
//       },
//       photos: [{ type: String }],
//       price: { type: String },
//       hours: [{
//         open: [{
//           is_overnight: { type: Boolean },
//           start: { type: String },
//           end: { type: String },
//           day: { type: Number }
//         }],
//         hours_type: { type: String },
//         is_open_now: { type: Boolean }
//       }],
//       attributes: {
//         business_url: { type: String }
//       },
//       transactions: [{ type: String }],
//       messaging: {
//         url: { type: String },
//         use_case_text: { type: String },
//         response_rate: { type: String },
//         response_time: { type: String }
//       }
//     },
//     footer: {
//       contributionsCount: { type: Number },
//       modifiedDate: { type: String },
//       modifiedTime: { type: String },
//       commentsCount: { type: Number },
//       reviewsCount: { type: Number },
//       likesCount: { type: Number },
//       dislikesCount: { type: Number }
//     }
//   },
//   serviceCategoryData: {
//     matcha: {
//       rank: { type: Number },
//       category: { type: String },
//       links: {
//         image: { type: String }
//       },
//       items: {
//         first: {
//           id: { type: String },
//           rank: { type: String },
//           name: { type: String },
//           links: {
//             image: { type: String }
//           },
//           source: {
//             name: { type: String },
//             logo: { type: String },
//             links: {
//               source: { type: String }
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail: { type: String }
//             },
//             post: {
//               description: { type: String },
//               poster: {
//                 username: { type: String },
//                 link: {
//                   profile: { type: String }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// });

// const userModel = mongoose.model('User', UserSchema);
// const storeModel = mongoose.model('Store', StoreSchema);
// // const User = mongoose.model('UserTest', UserSchema);
// // const Store = mongoose.model('store collections', StoreSchema);




// const getDatabase = async () => {
//   const connection = await connectDB();
//   return {
//     mongoose: connection,
//     UserModel: User,
//     StoreModel: Store
//   };
// };
// // Create models ONCE
// const User = mongoose.model('User', UserSchema);
// const Store = mongoose.model('Store', StoreSchema);

// Add new function to sync all stores
const syncAllStores = async () => {
  try {
     console.log('\n=== Starting Store Sync ===');
    
    // 1. Get all stores from data.js
    const storeData = new StoreData();
    const allStores = await storeData.getAllStores();
    //  console.log("allStores", allStores);
    
    // DEBUG: Save to file
    const debugData = {
      timestamp: new Date().toISOString(),
      storeCount: allStores?.length,
      stores: allStores
    };
    
    fs.writeFileSync(
      'debug_stores.json', 
      JSON.stringify(debugData, null, 2)
    );
     console.log("Saved store data to debug_stores.json");
    
    // Filter for stores variant
    const storesToSync = allStores.filter(store => store.variant === 'stores');
    //  console.log(`\nFound ${storesToSync.length} stores to sync:`);
    storesToSync.forEach(store => {
      //  console.log(`- ${store.headline?.text || store.title}`);
    });

    // 2. Sync each store to MongoDB
    for (const store of storesToSync) {
      try {
        const storeName = store.headline?.text || store.title;
         console.log(`\nProcessing: ${storeName}`);
         console.log("Raw store data:", JSON.stringify(store, null, 2));
        
        // Format store data for MongoDB
        const storeDoc = {
          rating: store.rating,
          review_count: store.review_count,
          price: store.price,
          costEstimate: store.costEstimate,
          storeType: store.storeType,
          distance: store.distance,
          city: store.city,
          state: store.state,
          storeName: store.storeName,
          distanceMiles: store.distanceMiles,
          status: store.status,
          gallery: store.gallery,
          overview: store.overview,
          service: store.service,
          experience: store.experience,
          business: store.business,
          serviceCategoryData: store.serviceCategoryData
        };
        
         console.log("Formatted for MongoDB:", JSON.stringify(storeDoc, null, 2));
        
        // Save to MongoDB
        const result = await Store.findOneAndUpdate(
          { storeName: storeName },
          storeDoc,
          { upsert: true, new: true, runValidators: true }
        );

        if (result) {
          //  console.log(`✓ Saved to MongoDB: ${storeName}`);
          //  console.log(`  ID: ${result._id}`);
          //  console.log(`  Name: ${result.storeName}`);
        } else {
          //  console.log(`✗ Failed to save: ${storeName}`);
        }

      } catch (error) {
         console.error(`✗ Error processing ${store.headline?.text}: ${error.message}`);
      }
    }

    // Verify final count
    const finalCount = await Store.countDocuments();
     console.log(`\n=== Sync Complete ===`);
     console.log(`Total stores in database: ${finalCount}\n`);
    
    return true;

  } catch (error) {
     console.error(`\n✗ Sync failed: ${error.message}`);
    throw error;
  }
};

// Modify test connection to ensure DB connection
const testConnection = async (s) => {
  try {
     console.log('\n=== Testing Database Connection ===');
    
    // Ensure connection
    const db = await connectDB();
    if (!db.mongoose.connection.readyState) {
      throw new Error('Database connection failed');
    }
     console.log(`Connected to: ${db.mongoose.connection.name}`);

    // Clear existing data (optional)
    await Store.deleteMany({});
     console.log('Cleared existing store data');

    // Run store sync
    await syncAllStores();
    
    return true;
  } catch (error) {
     console.error(`\n✗ Connection test failed: ${error.message}`);
    return false;
  }
};

// Run test
// testConnection();



// Test store sync
const testStoreSync = async (slug) => {
  try {
     console.log('\n=== Testing Store Sync ===');
    
    // Connect to database
    await connectDB();
     console.log('Connected to MongoDB');

    // Get test store
    const storeData = new StoreData();
    const store = await storeData.getStoreBySlug(slug);
    
    if (!store) {
      //  console.log('No store found to sync');
      return;
    }

    // Attempt sync with error handling
    try {
      const syncedStore = await storeOperations.syncStoreData(store);
      //  console.log('Store synced successfully:', syncedStore.slug);
    } catch (syncError) {
      //  console.error('Error syncing store:', syncError.message);
      // Continue execution even if sync fails
    }

    //  console.log('=== Test Complete ===\n');
  } catch (error) {
    //  console.error('Test failed:', error);
  }
};

// testStoreSync();

// Add this test function
const testStoreStorage = async () => {
  try {
    //  console.log('\n=== Testing Store Storage ===');
    
    // Connect to database
    await connectDB();
    //  console.log('Connected to MongoDB');

    // Get current store count
    const initialCount = await Store.countDocuments();
    //  console.log(`Initial store count: ${initialCount}`);

    // Sync stores
    const storeData = new StoreData();
    const stores = await storeData.getAllStores();
    //  console.log(`Found ${stores.length} stores to sync`);

    // Sync each store
    for (const store of stores) {
      try {
        const result = await Store.findOneAndUpdate(
          { slug: store.slug },
          store,
          { upsert: true, new: true }
        );
        //  console.log(`Synced store: ${result.slug}`);
      } catch (error) {
        //  console.error(`Error syncing store ${store.slug}:`, error);
      }
    }

    // Get final count
    const finalCount = await Store.countDocuments();
    //  console.log(`Final store count: ${finalCount}`);
    
    // Verify some data
    const sampleStore = await Store.findOne({});
     console.log('Sample store data:', {
      id: sampleStore._id,
      slug: sampleStore.slug,
      title: sampleStore.title
    });

  } catch (error) {
    //  console.error('Test failed:', error);
  }
};

// Run the test
// testStoreStorage();

// Update initializeServer in server.js
const initializeServer = async () => {
  try {
    // Connect to DB first
    await connectDB();
    //  console.log('MongoDB connected successfully');

    // Initialize store data with proper collection
    //  console.log('[Init] Starting initial store sync');
    
    const storeData = new StoreData();
    const slug = 'ca_orange-ca_los-angeles_long-beach_the-library';
    
    // Add error handling and logging
    try {
      let store = await Store.findOne({ slug });
      
      if (!store) {
        //  console.log('[Init] Store not found in DB, fetching from data.js');
        const freshStoreData = await storeData.getStoreBySlug(slug);

        if (freshStoreData) {
          store = await Store.create(freshStoreData);
          //  console.log('[Init] Initial store created:', store._id);
        }
      }

      // Start server only after DB operations complete
      const port = process.env.SERVERPORT || 6000;
      app.listen(port, () => {
        //  console.log(`Server running on port ${port}`);
      });

    } catch (error) {
      //  console.error('[Init] Error during store sync:', error);
      throw error;
    }

  } catch (error) {
    //  console.error('[Init] Server initialization failed:', error);
    process.exit(1);
  }
};

// Remove the testInsert call from server.js or wrap it in the connection
const testInsert = async () => {
  try {
    await connectDB(); // Ensure connection before insert
    const testStore = new Store({
      title: "Test Store",
      slug: "test-store",
      sys: { id: "test-123" }
    });
    const saved = await testStore.save();
    //  console.log("Test store saved:", saved);
  } catch (error) {
    //  console.error("Test insert failed:", error);
  }
};

// Export only what's needed
export { 
  User,
  Store,
  connectDB, 
  // getDatabase, 
  storeOperations,
  syncAllStores
};
