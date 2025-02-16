import mongoose from 'mongoose';
// StoreModel: (collection) => connection.import mongoose from 'mongoose';
import { StoreModel } from '../../models/storeModel.js';
import { UserModel } from '../../models/userModel.js';
import * as data from '../../data/data.js';
import { parseRequestUrl } from "../../../client/utils/utils.js";
import { io } from "socket.io-client";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
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



// Database connection
const connectDB = async () => {
  try {
    debugLog('connectDB', 'Attempting connection...');
    
    if (mongoose.connection.readyState === 1) {
      debugLog('connectDB', 'Using existing connection');
      return mongoose.connection;
    }

    const connection = await mongoose.connect("mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    debugLog('connectDB', 'Connected successfully');
    return connection;
  } catch (error) {
    errorLog('connectDB', error);
    throw error;
  }
};


// Store operations
// const storeOperations = {
//   async findOrCreateStore(storeData) {
//     try {
//       debugLog('findOrCreateStore', 'Looking up store', { storeId: storeData.storeId });
      
//       let store = await StoreModel.findOne({ 
//         $or: [
//           { storeId: storeData.storeId },
//           { slug: storeData.slug }
//         ]
//       });

//       if (store) {
//         debugLog('findOrCreateStore', 'Found existing store', { id: store._id });
//         return store;
//       }

//       store = new StoreModel(storeData);
//       await store.save();
//       debugLog('findOrCreateStore', 'Created new store', { id: store._id });
//       return store;
//     } catch (error) {
//       errorLog('findOrCreateStore', error);
//       throw error;
//     }
//   },

//   async updateStoreData(storeId, updates, source) {
//     try {
//       debugLog('updateStoreData', 'Updating store', { storeId, source });
      
//       const store = await StoreModel.findOne({ storeId });
//       if (!store) {
//         throw new Error('Store not found');
//       }

//       // Update source-specific data
//       store[source] = {
//         lastSync: new Date(),
//         data: updates
//       };

//       // Recalculate metrics
//       await store.calculateWeightedScore();
      
//       const updated = await store.save();
//       debugLog('updateStoreData', 'Store updated', { id: updated._id });
//       return updated;
//     } catch (error) {
//       errorLog('updateStoreData', error);
//       throw error;
//     }
//   }
// };
const storeOperations = {
  async findOrCreateStore(storeData) {
    try {
      debugLog('findOrCreateStore', 'Looking up store', { storeId: storeData.storeId });
      
      let store = await StoreModel.findOne({ 
        $or: [
          { storeId: storeData.storeId },
          { slug: storeData.slug }
        ]
      });

      if (store) {
        debugLog('+++findOrCreateStore', '+++Found existing store', { id: store._id });
        return store;
      }

      store = new StoreModel(storeData);
      await store.save();
      console.log('+++store', store);
      debugLog('+++findOrCreateStore', '+++Created new store', { id: store._id });
      return store;
    } catch (error) {
      errorLog('+++findOrCreateStore', error);
      throw error;
    }
  },

  async updateStoreData(storeId, updates, source) {
    try {
      debugLog('updateStoreData', 'Updating store', { storeId, source });
      
      const store = await StoreModel.findOne({ storeId });
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
      debugLog('updateStoreData', 'Store updated', { id: updated._id });
      return updated;
    } catch (error) {
      errorLog('updateStoreData', error);
      throw error;
    }
  },

  async syncStoreData(slug) {
    try {
      debugLog('syncStoreData', 'Starting sync for slug:', slug);

      // Get data from StoreData class
      const storeDataInstance = new data.StoreData();
      // const storeData = await storeDataInstance.getStoreBySlug(slug);
      const storeData = await storeDataInstance.getAllStores();

      if (!storeData) {
        throw new Error('Store data not found');
      }

      // Find or create store document
      // let store = await StoreModel.findOne({ slug });
      let store = storeData;
      if (!store) {
        store = new StoreModel({
          storeId: storeData.storeId,
          slug: storeData.slug,
          title: storeData.title
        });
      }

      // Update sections
      store.sections = {
        service: {
          content: storeData.service,
          history: [],
          interactions: {
            likes: 0,
            dislikes: 0,
            comments: [],
            reviews: []
          }
        },
        summary: {
          content: storeData.summary,
          history: [],
          interactions: {
            likes: 0,
            dislikes: 0,
            comments: [],
            reviews: []
          }
        }
      };

      // Update area data with impressions
      const areaData = storeData.areaData?.map(area => ({
        name: area.area,
        images: area.images?.map(img => ({
          id: img.id,
          url: img.thumbnail?.media?.thumbnail,
          impressions: {
            users: img.impressions?.users || 0,
            likes: img.impressions?.likes || 0,
            dislikes: img.impressions?.dislikes || 0
          },
          source: {
            name: img.source?.name,
            logo: img.source?.logo,
            url: img.source?.links?.source
          },
          description: img.post?.description,
          poster: img.post?.poster
        }))
      }));

      store.areas = areaData;

      // Update metrics
      store.metrics = {
        neustar: storeData.neustar,
        totalLikes: storeData.metrics?.totalLikes || 0,
        totalDislikes: storeData.metrics?.totalDislikes || 0,
        averageRating: storeData.metrics?.averageRating || 0
      };

      debugLog('syncStoreData', 'Saving store:', { slug: store.slug });
      await store.save();

      return store;
    } catch (error) {
      errorLog('syncStoreData', error);
      throw error;
    }
  }
};

// Data integration functions
export const storeData = {
  async upsertStore(storeData, source) {
    try {
      console.log(`[MongoDB] Upserting store from ${source}:`, storeData.storeId);

          // console.log("%01:[StoreScreen.render] Starting render");
  
        // 1. Get the request parameters
        const request = parseRequestUrl();
        // console.log("%02:[StoreScreen.render] Request params:", request);
  
        // 2. Initialize StoreData and get store data
        const storeData = new data.StoreData();
        // console.log("%03:[StoreScreen.render] StoreData initialized:", storeData);
  
        // 3. Get store data using slug
        // const store = await storeData.store(request.slug);
        const store = await storeData.getAllStores();
        // console.log("%04:[StoreScreen.render] Store data:", store);
  
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
  
        // console.log("%06: store", store);
  
        console.log("%05:Store sections:", {
          hero,
          overview,
          service,
          experience,
          location,
          business,
          serviceCategoryData,
          mapRadiusData
        });
        // const store = await StoreModel.findOne({ storeId: storeData.storeId });
        
        if (store) {
          console.log("[MongoDB] Updating existing store");
          
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
          
          const newStore = new StoreModel({
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
      const store = await StoreModel.findOne({ storeId });
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
      const store = await StoreModel.findOne({ storeId });
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

// Create User model from schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  birthdate: {
    type: Date,
    required: false
  },
  savedStore: {
    type: [String],
    default: []
  },
  checkedInStore: [{
    storeId: String,
    impression: {
      type: String,
      enum: ['like', 'dislike', null],
      default: null
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    // Include all store fields here
    title: String,
    address: String,
    city: String,
    storeCurrentStatus: String,
    storeRange: String,
    neustar: Number,
    ratings: [{
      key: String,
      value: String
    }],
    genre: String,
    storeAttributes: [String],
    best: [String],
    gallery: [String],
    // Add any other fields from the Contentful store data
  }]
});

// Create Store model from schema 
const StoreSchema = new mongoose.Schema({
  rating: { type: Number, default: null },
  review_count: { type: Number, default: null },
  price: { type: String, default: null },
  costEstimate: { type: String, default: null },
  storeType: {
    type: Array,
    default: [],
    schema: {
      alias: { type: String, default: null },
      title: { type: String, default: null }
    }
  },
  distance: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  storeName: { type: String, default: null },
  distanceMiles: { type: String, default: null },
  status: { type: String, default: null },
  gallery: { type: Array, default: [] },
  overview: {
    type: Array,
    default: [],
    schema: {
      header: { type: String, default: null },
      footer: {
        contributionsCount: { type: Number, default: null },
        modifiedDate: { type: String, default: null },
        modifiedTime: { type: String, default: null },
        commentsCount: { type: Number, default: null },
        reviewsCount: { type: Number, default: null },
        likesCount: { type: Number, default: null },
        dislikesCount: { type: Number, default: null }
      }
    }
  },
  service: {
    type: Array,
    default: [],
    schema: {
      header: { type: String, default: null },
      footer: {
        contributionsCount: { type: Number, default: null },
        modifiedDate: { type: String, default: null },
        modifiedTime: { type: String, default: null },
        commentsCount: { type: Number, default: null },
        reviewsCount: { type: Number, default: null },
        likesCount: { type: Number, default: null },
        dislikesCount: { type: Number, default: null }
      }
    }
  },
  experience: {
    type: Object,
    default: {},
    schema: {
      header: { type: String, default: null },
      footer: {
        contributionsCount: { type: Number, default: null },
        modifiedDate: { type: String, default: null },
        modifiedTime: { type: String, default: null },
        commentsCount: { type: Number, default: null },
        reviewsCount: { type: Number, default: null },
        likesCount: { type: Number, default: null },
        dislikesCount: { type: Number, default: null }
      }
    }
  },
//   name: String,
//   storeId: String,
//   slug: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   title: String,
//   address: String,
//   streetNumber: String,
//   streetName: String,
//   state: String,
//   zip: String,
//   city: String,
//   designator: String,
//   storeCurrentStatus: String,
//   storeRange: String,
//   neustar: Number,
//   ratings: Array,
//   genre: String,
//   storeAttributes: Array,
//   best: Array,
//   gallery: Array,
// contentful: {
//   lastSync: Date,
//   data: mongoose.Schema.Types.Mixed
// },
// yelp: {
//   lastSync: Date,
//   data: mongoose.Schema.Types.Mixed
// }
});
const Store = mongoose.model('StoreTest2', StoreSchema);
const User = mongoose.model('UserTest', UserSchema);
// const User = mongoose.model('UserTest', UserSchema);

const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel
  };
};

// Add new function to sync all stores
const syncAllStores = async () => {
  try {
    console.log('\n=== Starting Store Sync ===');
    
    // 1. Get all stores from data.js
    const storeData = new StoreData();
    const allStores = await storeData.getAllStores();
    
    // Filter for stores variant
    const storesToSync = allStores.filter(store => store.variant === 'stores');
    console.log(`\nFound ${storesToSync.length} stores to sync:`);
    storesToSync.forEach(store => {
      console.log(`- ${store.headline?.text || store.title}`);
    });

    // 2. Sync each store to MongoDB
    for (const store of storesToSync) {
      try {
        const storeName = store.headline?.text || store.title;
        console.log(`\nProcessing: ${storeName}`);
        
        // Format store data for MongoDB
        const storeDoc = {
          rating: { type: Number, default: null },
          review_count: { type: Number, default: null },
          price: { type: String, default: null },
          costEstimate: { type: String, default: null },
          storeType: {
            type: Array,
            default: [],
            schema: {
              alias: { type: String, default: null },
              title: { type: String, default: null }
            }
          },
          distance: { type: String, default: null },
          city: { type: String, default: null },
          state: { type: String, default: null },
          storeName: { type: String, default: null },
          distanceMiles: { type: String, default: null },
          status: { type: String, default: null },
          gallery: { type: Array, default: [] },
          overview: {
            type: Array,
            default: [],
            schema: {
              header: { type: String, default: null },
              footer: {
                contributionsCount: { type: Number, default: null },
                modifiedDate: { type: String, default: null },
                modifiedTime: { type: String, default: null },
                commentsCount: { type: Number, default: null },
                reviewsCount: { type: Number, default: null },
                likesCount: { type: Number, default: null },
                dislikesCount: { type: Number, default: null }
              }
            }
          },
          service: {
            type: Array,
            default: [],
            schema: {
              header: { type: String, default: null },
              footer: {
                contributionsCount: { type: Number, default: null },
                modifiedDate: { type: String, default: null },
                modifiedTime: { type: String, default: null },
                commentsCount: { type: Number, default: null },
                reviewsCount: { type: Number, default: null },
                likesCount: { type: Number, default: null },
                dislikesCount: { type: Number, default: null }
              }
            }
          },
          experience: {
            type: Object,
            default: {},
            schema: {
              header: { type: String, default: null },
              footer: {
                contributionsCount: { type: Number, default: null },
                modifiedDate: { type: String, default: null },
                modifiedTime: { type: String, default: null },
                commentsCount: { type: Number, default: null },
                reviewsCount: { type: Number, default: null },
                likesCount: { type: Number, default: null },
                dislikesCount: { type: Number, default: null }
              }
            }
          },
        };

        // Save to MongoDB using the Store model directly
        const result = await Store.findOneAndUpdate(
          { slug: store.slug },
          storeDoc,
          { 
            upsert: true, 
            new: true,
            runValidators: true
          }
        );
 
        if (result) {
          console.log(`✓ Saved to MongoDB: ${storeName}`);
          console.log(`  ID: ${result._id}`);
          console.log(`  Slug: ${result.slug}`);
        } else {
          console.log(`✗ Failed to save: ${storeName}`);
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
const testConnection = async () => {
  try {
    console.log('\n=== Testing Database Connection ===');
    
    // Ensure connection
    const db = await getDatabase();
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

// Export functions
export { 
  User,
  Store, 
  connectDB, 
  getDatabase, 
  storeOperations,
  syncAllStores
};