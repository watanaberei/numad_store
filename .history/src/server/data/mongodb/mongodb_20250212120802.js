import mongoose from 'mongoose';
import { StoreModel } from '../../models/storeModel.js';
import { UserModel } from '../../models/userModel.js';

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
const storeOperations = {
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

// Database access helper
const getDatabase = async () => {
  const connection = await connectDB();
  return {
    mongoose: connection,
    UserModel,
    StoreModel
  };
};

export { connectDB, getDatabase, storeOperations };





// Add this to your server.js or a test file
const testConnection = async () => {
  try {
    debugLog('testConnection', 'Testing database connection...');
    const db = await getDatabase();
    
    // Test store operations
    const testStore = {
      storeId: 'test-123',
      slug: 'test-store',
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