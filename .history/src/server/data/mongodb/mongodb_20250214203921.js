import mongoose from 'mongoose';
// StoreModel: (collection) => connection.import mongoose from 'mongoose';
import { StoreModel } from '../../models/storeModel.js';
import { UserModel } from '../../models/userModel.js';
import * as data from '../../data/data.js';
import { parseRequestUrl } from "../../../client/utils/utils.js";
import { io } from "socket.io-client";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
// import { StoreData } from '../data.js';

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
        debugLog('findOrCreateStore', 'Found existing store', { id: store._id });
        return store;
      }

      store = new StoreModel(storeData);
      await store.save();
      console.log('store', store);
      debugLog('findOrCreateStore', 'Created new store', { id: store._id });
      return store;
    } catch (error) {
      errorLog('findOrCreateStore', error);
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
      const storeDataInstance = new StoreData();
      const storeData = await storeDataInstance.getStoreBySlug(slug);

      if (!storeData) {
        throw new Error('Store data not found');
      }

      // Find or create store document
      let store = await StoreModel.findOne({ slug });
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
        const store = await storeData.store(request.slug);
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

const StoreSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },

  streetNumber: {
    type: String,
    required: true
  },
  streetName: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  designator: {
    type: String,
    required: true
  },
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
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('UserTest', UserSchema);
const Store = mongoose.model('StoreTest', StoreSchema);

// Modified getDatabase function
// const getDatabase = async () => {
//   const connection = await connectDB();
//   return {
//     mongoose: connection,
//     UserModel,
//     StoreModel,
//     // Add a proper function for impressions
//     StoreModel: (collection) => connection.collection(collection)
//   };
// };

// export { User, Store, connectDB, getDatabase, storeOperations };

const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel
  };
};

export { User, Store, connectDB, getDatabase, storeOperations };





// Add this to your server.js or a test file
const testConnection = async () => {
  try {
    debugLog('testConnection', 'Testing database connection...');
    const db = await getDatabase();
    console.log('db', db);
    // Test store operations
    const testStore = {
      storeId: 'test-123',
      slug: 'test-store',
      title: 'Test Store'
    };
    
    const result = await storeOperations.syncStoreData(testStore);
    debugLog('testConnection', 'Test store created:', result);
    
    return true;
  } catch (error) {
    errorLog('testConnection', error);
    return false;
  }
};

testConnection();

const testMongoDB = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // Test store operations
    const testStore = {
      sys: { id: 'test-123' },
      slug: 'test-store',
      title: 'Test Store'
    };
    
    await storeOperations.syncStoreData(testStore);
    console.log('Test store created successfully');
    
  } catch (error) {
    console.error('MongoDB test failed:', error);
  }
};

testMongoDB();