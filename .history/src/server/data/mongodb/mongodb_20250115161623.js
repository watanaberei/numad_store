import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
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
    // Don't exit in browser context
    throw error;
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

const User = mongoose.model('User03', UserSchema);
const Store = mongoose.model('Store', StoreSchema);

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

export { User, Store, getDatabase, connectDB };