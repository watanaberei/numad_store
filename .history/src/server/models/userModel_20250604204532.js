///////////////////////// START FIXED MONGODB USER MODEL /////////////////////////
// src/data/mongodb/mongodb.js - UPDATED USERMODEL WITH BETTER USERNAME HANDLING

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neumad';

// IMPROVED: User Schema with better username handling and indexing
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username must be no more than 30 characters long'],
    validate: {
      validator: function(username) {
        return /^[a-zA-Z0-9_-]+$/.test(username);
      },
      message: 'Username can only contain letters, numbers, underscores, and dashes'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Profile Information
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name must be no more than 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name must be no more than 50 characters']
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name must be no more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [600, 'Description must be no more than 600 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location must be no more than 100 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL must be no more than 200 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number must be no more than 20 characters']
  },
  birthdate: {
    type: Date
  },
  
  // Store Activity
  checkedInStore: {
    type: String, // Store slug/ID
    default: null
  },
  checkedInStores: [{
    storeId: {
      type: String,
      required: true
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    }
  }],
  visitHistory: [{
    storeId: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  savedStores: [{
    storeId: {
      type: String,
      required: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Store Interactions
  likedStores: [{
    type: String // Store IDs
  }],
  dislikedStores: [{
    type: String // Store IDs
  }],
  impressionsLiked: [{
    storeId: {
      type: String,
      required: true
    },
    sectionId: {
      type: String,
      default: 'general'
    },
    impressionAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      default: 'like'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  impressionsDisliked: [{
    storeId: {
      type: String,
      required: true
    },
    sectionId: {
      type: String,
      default: 'general'
    },
    impressionAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      default: 'dislike'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Account Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Privacy Settings
  profilePrivacy: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  collection: 'users'
});

// IMPROVED: Create indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'checkedInStores.storeId': 1 });
userSchema.index({ 'visitHistory.storeId': 1 });
userSchema.index({ 'savedStores.storeId': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// IMPROVED: Pre-save middleware to update timestamps and normalize data
userSchema.pre('save', function(next) {
  console.log(`[UserModel] Pre-save middleware for user: ${this.email || 'unknown'}`);
  
  // Update timestamp
  this.updatedAt = new Date();
  
  // Normalize email and username
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  if (this.username) {
    this.username = this.username.toLowerCase().trim();
  }
  
  // Clean up arrays (remove old entries to prevent unlimited growth)
  if (this.checkedInStores && this.checkedInStores.length > 50) {
    this.checkedInStores = this.checkedInStores.slice(-50); // Keep last 50
  }
  if (this.visitHistory && this.visitHistory.length > 100) {
    this.visitHistory = this.visitHistory.slice(-100); // Keep last 100
  }
  if (this.impressionsLiked && this.impressionsLiked.length > 200) {
    this.impressionsLiked = this.impressionsLiked.slice(-200); // Keep last 200
  }
  if (this.impressionsDisliked && this.impressionsDisliked.length > 200) {
    this.impressionsDisliked = this.impressionsDisliked.slice(-200); // Keep last 200
  }
  
  next();
});

// IMPROVED: Static method to find user by username or email (case-insensitive)
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  console.log(`[UserModel] Finding user by identifier: ${identifier}`);
  
  if (!identifier) {
    console.log('[UserModel] No identifier provided');
    return null;
  }
  
  const trimmedIdentifier = identifier.trim().toLowerCase();
  
  // Check if identifier contains @ (likely email)
  if (trimmedIdentifier.includes('@')) {
    console.log('[UserModel] Searching by email');
    return this.findOne({ email: trimmedIdentifier });
  } else {
    console.log('[UserModel] Searching by username');
    return this.findOne({ username: trimmedIdentifier });
  }
};

// IMPROVED: Instance method to check if user is currently checked in
userSchema.methods.isCheckedIn = function() {
  return !!this.checkedInStore;
};

// IMPROVED: Instance method to get recent activity
userSchema.methods.getRecentActivity = function(limit = 10) {
  const recentCheckins = this.checkedInStores
    .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
    .slice(0, limit);
    
  const recentVisits = this.visitHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
    
  return {
    checkins: recentCheckins,
    visits: recentVisits
  };
};

// IMPROVED: Instance method to get user stats
userSchema.methods.getStats = function() {
  return {
    totalCheckins: this.checkedInStores ? this.checkedInStores.length : 0,
    totalVisits: this.visitHistory ? this.visitHistory.length : 0,
    totalSaved: this.savedStores ? this.savedStores.length : 0,
    totalLikes: this.impressionsLiked ? this.impressionsLiked.length : 0,
    totalDislikes: this.impressionsDisliked ? this.impressionsDisliked.length : 0,
    joinedAt: this.createdAt,
    lastActivity: this.lastLogin
  };
};

// IMPROVED: Instance method to add store visit
userSchema.methods.addStoreVisit = function(storeId) {
  console.log(`[UserModel] Adding store visit for user ${this.username}: ${storeId}`);
  
  if (!this.visitHistory) {
    this.visitHistory = [];
  }
  
  // Add new visit
  this.visitHistory.push({
    storeId: storeId,
    timestamp: new Date()
  });
  
  // Keep only last 100 visits
  if (this.visitHistory.length > 100) {
    this.visitHistory = this.visitHistory.slice(-100);
  }
  
  this.lastLogin = new Date();
  return this.save();
};

// IMPROVED: Instance method to check in to store
userSchema.methods.checkInToStore = function(storeId) {
  console.log(`[UserModel] Checking in user ${this.username} to store: ${storeId}`);
  
  // Set current check-in
  this.checkedInStore = storeId;
  
  // Initialize arrays if needed
  if (!this.checkedInStores) {
    this.checkedInStores = [];
  }
  if (!this.visitHistory) {
    this.visitHistory = [];
  }
  
  // Add to check-in history
  this.checkedInStores.push({
    storeId: storeId,
    checkedInAt: new Date()
  });
  
  // Add to visit history
  this.visitHistory.push({
    storeId: storeId,
    timestamp: new Date()
  });
  
  this.lastLogin = new Date();
  return this.save();
};

// IMPROVED: Instance method to check out from store
userSchema.methods.checkOutFromStore = function() {
  console.log(`[UserModel] Checking out user ${this.username}`);
  
  this.checkedInStore = null;
  this.lastLogin = new Date();
  return this.save();
};

// IMPROVED: Instance method to add store impression
userSchema.methods.addStoreImpression = function(storeId, action, sectionId = 'general') {
  console.log(`[UserModel] Adding ${action} impression for user ${this.username}: ${storeId}/${sectionId}`);
  
  // Initialize arrays if needed
  if (!this.impressionsLiked) {
    this.impressionsLiked = [];
  }
  if (!this.impressionsDisliked) {
    this.impressionsDisliked = [];
  }
  
  const impressionData = {
    storeId: storeId,
    sectionId: sectionId,
    impressionAt: new Date(),
    action: action,
    timestamp: new Date()
  };
  
  if (action === 'like') {
    // Remove any existing like for this store/section
    this.impressionsLiked = this.impressionsLiked.filter(
      imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
    );
    // Remove any existing dislike for this store/section
    this.impressionsDisliked = this.impressionsDisliked.filter(
      imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
    );
    // Add new like
    this.impressionsLiked.push(impressionData);
  } else if (action === 'dislike') {
    // Remove any existing dislike for this store/section
    this.impressionsDisliked = this.impressionsDisliked.filter(
      imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
    );
    // Remove any existing like for this store/section
    this.impressionsLiked = this.impressionsLiked.filter(
      imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
    );
    // Add new dislike
    this.impressionsDisliked.push(impressionData);
  }
  
  this.lastLogin = new Date();
  return this.save();
};

// Create the model
const UserModel = mongoose.model('User', userSchema);

// IMPROVED: Store Schema with better interaction tracking
const storeSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    default: 'stores'
  },
  
  // Store sections (from your existing structure)
  hero: {
    type: mongoose.Schema.Types.Mixed, // Flexible object
    default: {}
  },
  overview: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  service: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  experience: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  business: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  categoryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mapRadiusData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Yelp data sections
  yelpData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpFoodData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpFusionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpSearchData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpPhoneData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpMatchData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpDetailsData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpDeliveryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpServiceData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yelpInsightData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Interaction tracking
  interactions: {
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    checkins: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    dislikedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    impressions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      storeId: {
        type: String,
        required: true
      },
      sectionId: {
        type: String,
        default: 'general'
      },
      action: {
        type: String,
        enum: ['like', 'dislike', 'view', 'checkin'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'stores'
});

// Store indexes
storeSchema.index({ slug: 1 }, { unique: true });
storeSchema.index({ title: 1 });
storeSchema.index({ 'interactions.likes': -1 });
storeSchema.index({ 'interactions.views': -1 });
storeSchema.index({ lastUpdated: -1 });

const StoreModel = mongoose.model('Store', storeSchema);

// IMPROVED: Blog Schema (keeping your existing structure)
const blogSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    default: 'blogs'
  },
  
  // Blog content structure
  snippet: {
    text: String
  },
  category: {
    category: {
      type: String,
      default: 'dine'
    }
  },
  content: {
    introduction: String,
    body: String,
    conclusion: String,
    stores: String,
    postscript: String,
    blocks: [{
      id: String,
      type: String,
      order: Number,
      content: mongoose.Schema.Types.Mixed
    }]
  },
  media: {
    hero: String,
    thumbnail: String,
    gallery: [String]
  },
  tag: [{
    tags: [String]
  }],
  author: {
    id: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    slug: String,
    social: String
  },
  series: {
    series: String
  },
  summary: {
    text: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  template: {
    type: String,
    default: 'freestyle'
  },
  settings: {
    public: {
      type: Boolean,
      default: true
    },
    comments: {
      type: Boolean,
      default: true
    },
    autosave: {
      type: Boolean,
      default: false
    }
  },
  
  // Interaction tracking
  interactions: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'blogs'
});

// Blog indexes
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ 'author.id': 1 });
blogSchema.index({ 'category.category': 1 });

const BlogModel = mongoose.model('Blog', blogSchema);

// IMPROVED: Store operations with better error handling
const storeOperations = {
  async syncStoreData(slug) {
    try {
      console.log(`[StoreOperations] Syncing store data for slug: ${slug}`);
      
      // This would typically fetch from external API
      // For now, return null to indicate external fetch needed
      return null;
      
    } catch (error) {
      console.error(`[StoreOperations] Error syncing store data for ${slug}:`, error);
      throw error;
    }
  },
  
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

// IMPROVED: Database connection with better error handling and retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[MongoDB] Connection attempt ${i + 1}/${retries} to: ${MONGODB_URI}`);
      
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      });
      
      console.log('[MongoDB] Connected successfully');
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('[MongoDB] Disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('[MongoDB] Reconnected');
      });
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('[MongoDB] Connection closed through app termination');
          process.exit(0);
        } catch (error) {
          console.error('[MongoDB] Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
      
      return;
      
    } catch (error) {
      console.error(`[MongoDB] Connection attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        console.error('[MongoDB] All connection attempts failed');
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, i) * 1000;
      console.log(`[MongoDB] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export { 
  UserModel, 
  StoreModel, 
  BlogModel, 
  storeOperations, 
  connectDB 
};

///////////////////////// END FIXED MONGODB USER MODEL /////////////////////////