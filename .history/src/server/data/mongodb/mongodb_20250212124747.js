import mongoose from 'mongoose';
import { StoreModel } from '../../models/storeModel.js';
import { UserModel } from '../../models/userModel.js';

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
const storeOperations = {
  // Create/update store from Contentful data
  async syncContentfulStore(contentfulData) {
    debugLog('syncContentfulStore', 'Starting sync', { slug: contentfulData.slug });
    try {
      const store = await StoreModel.findOne({ slug: contentfulData.slug });
      
      if (store) {
        store.contentful = {
          lastSync: new Date(),
          data: contentfulData
        };
        debugLog('syncContentfulStore', 'Updated existing store', { slug: store.slug });
        return await store.save();
      }

      const newStore = new StoreModel({
        storeId: contentfulData.sys.id,
        slug: contentfulData.slug,
        title: contentfulData.title,
        contentful: {
          lastSync: new Date(),
          data: contentfulData
        }
      });

      const saved = await newStore.save();
      debugLog('syncContentfulStore', 'Created new store', { slug: saved.slug });
      return saved;
    } catch (error) {
      errorLog('syncContentfulStore', error);
      throw error;
    }
  },

  // Update store with Yelp data
  async syncYelpStore(storeId, yelpData) {
    debugLog('syncYelpStore', 'Starting sync', { storeId });
    try {
      const store = await StoreModel.findOne({ storeId });
      if (!store) {
        errorLog('syncYelpStore', new Error('Store not found'));
        return null;
      }

      store.yelp = {
        lastSync: new Date(),
        data: yelpData
      };

      const saved = await store.save();
      debugLog('syncYelpStore', 'Updated store', { slug: saved.slug });
      return saved;
    } catch (error) {
      errorLog('syncYelpStore', error);
      throw error;
    }
  }
};

// Data integration functions
const storeData = {
  async upsertStore(storeData, source) {
    try {
      console.log(`[MongoDB] Upserting store from ${source}:`, storeData.storeId);

      const store = await StoreModel.findOne({ storeId: storeData.storeId });
      
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

// Database access helper
const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel
  };
};

export { connectDB, getDatabase, storeOperations, storeData };

// Add this to your server.js or a test file
const testConnection = async () => {
  try {
    debugLog('testConnection', 'Testing database connection...');
    const db = await getDatabase();
    
    // Test store operations with unique ID
    const testStore = {
      sys: { id: `test-${Date.now()}` }, // Make ID unique
      slug: `test-store-${Date.now()}`,
      title: 'Test Store'
    };
    
    const result = await storeOperations.syncContentfulStore(testStore);
    debugLog('testConnection', 'Test store created:', result);
    
    return true;
  } catch (error) {
    errorLog('testConnection', error);
    return false;
  }
};

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
    
    await storeOperations.syncContentfulStore(testStore);
    console.log('Test store created successfully');
    
  } catch (error) {
    console.error('MongoDB test failed:', error);
  }
};

testMongoDB();