import mongoose from 'mongoose';
import { Store } from '../../models/storeModel.js';
import { User } from '../../models/userModel.js';

const connectDB = async () => {
  try {
    console.log("[MongoDB] Attempting connection...");
    
    if (mongoose.connection.readyState === 1) {
      console.log("[MongoDB] Using existing connection");
      return mongoose.connection;
    }

    const connection = await mongoose.connect("mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log("[MongoDB] Connected successfully");
    return connection;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
};

// Data integration functions
export const storeData = {
  async upsertStore(storeData, source) {
    try {
      console.log(`[MongoDB] Upserting store from ${source}:`, storeData.storeId);

      const store = await Store.findOne({ storeId: storeData.storeId });
      
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
  savedStores: {
    type: [String],
    default: []
  },
  checkedInStores: [{
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

const Users = mongoose.model('User03', UserSchema);
const Stores = mongoose.model('Stores', StoreSchema);

// Modified getDatabase function
const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    User,
    Store,
    // Add a proper function for impressions
    Store: (collection) => connection.collection(collection)
  };
};

export { Users, Stores, getDatabase, connectDB };