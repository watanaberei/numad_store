///////////////////////// START FIXED USER MODEL /////////////////////////
// src/server/models/userModel.js - FIXED VERSION TO PREVENT INFINITE LOOPS

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

console.log('[UserModel] Loading user model with performance optimizations');

// FIXED: User Schema with better indexing and validation
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true,
    trim: true,
    // index: true, // EXPLICIT INDEX
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
    // unique: true,
    lowercase: true,
    trim: true,
    // index: true, // EXPLICIT INDEX
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
  
  // Store Activity - FIXED: Optimized structure
  checkedInStore: {
    type: String, // Store slug/ID
    default: null,
    // index: true // INDEX FOR QUICK LOOKUPS
  },
  
  // FIXED: Limited array sizes to prevent memory issues
  checkedInStores: {
    type: [{
      storeId: {
        type: String,
        required: true,
        // index: true
      },
      checkedInAt: {
        type: Date,
        default: Date.now,
        // index: true
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 500; // LIMIT TO 500 ENTRIES
      },
      message: 'Too many check-in records'
    }
  },
  
  visitHistory: {
    type: [{
      storeId: {
        type: String,
        required: true,
        // index: true
      },
      timestamp: {
        type: Date,
        default: Date.now,
        // index: true
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many visit records'
    }
  },
  
  savedStores: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      savedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 200; // LIMIT TO 200 ENTRIES
      },
      message: 'Too many saved stores'
    }
  },
  
  // Store Interactions - FIXED: Limited sizes
  likedStores: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many liked stores'
    }
  },
  
  dislikedStores: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many disliked stores'
    }
  },
  
  impressionsLiked: {
    type: [{
      storeId: {
        type: String,
        required: true,
        index: true
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
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 500; // LIMIT TO 500 ENTRIES
      },
      message: 'Too many liked impressions'
    }
  },
  
  impressionsDisliked: {
    type: [{
      storeId: {
        type: String,
        required: true,
        index: true
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
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 500; // LIMIT TO 500 ENTRIES
      },
      message: 'Too many disliked impressions'
    }
  },
  
  // Account Settings
  isActive: {
    type: Boolean,
    default: true,
    // index: true
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
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  collection: 'User',
  // FIXED: Add performance optimizations
  minimize: false,
  versionKey: false,
  strict: true
});

// FIXED: Optimized indexes for better performance
UserSchema.index({ email: 1 }, { unique: true, background: true });
UserSchema.index({ username: 1 }, { unique: true, background: true });
UserSchema.index({ 'checkedInStores.storeId': 1 }, { background: true });
UserSchema.index({ 'visitHistory.storeId': 1 }, { background: true });
UserSchema.index({ 'visitHistory.timestamp': -1 }, { background: true });
UserSchema.index({ 'savedStores.storeId': 1 }, { background: true });
UserSchema.index({ createdAt: -1 }, { background: true });
UserSchema.index({ lastLogin: -1 }, { background: true });
UserSchema.index({ isActive: 1 }, { background: true });

// FIXED: Compound indexes for common queries
UserSchema.index({ email: 1, isActive: 1 }, { background: true });
UserSchema.index({ username: 1, isActive: 1 }, { background: true });

// FIXED: Pre-save middleware with performance optimizations
UserSchema.pre('save', function(next) {
  const user = this;
  
  console.log(`[UserModel] Pre-save middleware for user: ${user.email || 'unknown'}`);
  
  try {
    // Update timestamp
    user.updatedAt = new Date();
    
    // Normalize email and username
    if (user.email) {
      user.email = user.email.toLowerCase().trim();
    }
    if (user.username) {
      user.username = user.username.toLowerCase().trim();
    }
    
    // FIXED: Clean up arrays to prevent unlimited growth with better logic
    if (user.checkedInStores && user.checkedInStores.length > 500) {
      console.log(`[UserModel] Trimming checkedInStores array from ${user.checkedInStores.length} to 500`);
      user.checkedInStores = user.checkedInStores
        .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
        .slice(0, 500);
    }
    
    if (user.visitHistory && user.visitHistory.length > 1000) {
      console.log(`[UserModel] Trimming visitHistory array from ${user.visitHistory.length} to 1000`);
      user.visitHistory = user.visitHistory
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 1000);
    }
    
    if (user.impressionsLiked && user.impressionsLiked.length > 500) {
      console.log(`[UserModel] Trimming impressionsLiked array from ${user.impressionsLiked.length} to 500`);
      user.impressionsLiked = user.impressionsLiked
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 500);
    }
    
    if (user.impressionsDisliked && user.impressionsDisliked.length > 500) {
      console.log(`[UserModel] Trimming impressionsDisliked array from ${user.impressionsDisliked.length} to 500`);
      user.impressionsDisliked = user.impressionsDisliked
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 500);
    }
    
    if (user.likedStores && user.likedStores.length > 1000) {
      console.log(`[UserModel] Trimming likedStores array from ${user.likedStores.length} to 1000`);
      user.likedStores = user.likedStores.slice(-1000);
    }
    
    if (user.dislikedStores && user.dislikedStores.length > 1000) {
      console.log(`[UserModel] Trimming dislikedStores array from ${user.dislikedStores.length} to 1000`);
      user.dislikedStores = user.dislikedStores.slice(-1000);
    }
    
    next();
  } catch (error) {
    console.error('[UserModel] Error in pre-save middleware:', error);
    next(error);
  }
});

// FIXED: Post-save middleware with error handling
UserSchema.post('save', function(doc, next) {
  console.log(`[UserModel] User saved: ${doc.username || doc.email} (ID: ${doc._id})`);
  next();
});

// FIXED: Static method to find user by username or email with caching
const userCache = new Map();
const USER_CACHE_TTL = 60000; // 1 minute cache

UserSchema.statics.findByUsernameOrEmail = function(identifier) {
  console.log(`[UserModel] Finding user by identifier: ${identifier}`);
  
  if (!identifier) {
    console.log('[UserModel] No identifier provided');
    return null;
  }
  
  const trimmedIdentifier = identifier.trim().toLowerCase();
  
  // FIXED: Check cache first
  const cacheKey = `user-${trimmedIdentifier}`;
  const cached = userCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
    console.log('[UserModel] Using cached user data');
    return Promise.resolve(cached.user);
  }
  
  // Check if identifier contains @ (likely email)
  const query = trimmedIdentifier.includes('@') 
    ? { email: trimmedIdentifier }
    : { username: trimmedIdentifier };
  
  console.log('[UserModel] Searching with query:', query);
  
  // FIXED: Add timeout and select only necessary fields
  const userQuery = this.findOne(query)
    .select('_id email username password firstName lastName description location website phoneNumber checkedInStore checkedInStores visitHistory savedStores likedStores dislikedStores impressionsLiked impressionsDisliked isActive profilePrivacy lastLogin createdAt')
    .maxTimeMS(5000);
  
  // Cache the result
  userQuery.then(user => {
    if (user) {
      userCache.set(cacheKey, {
        user: user,
        timestamp: Date.now()
      });
    }
  }).catch(error => {
    console.error('[UserModel] Error caching user:', error);
  });
  
  return userQuery;
};

// FIXED: Instance method to check if user is currently checked in
UserSchema.methods.isCheckedIn = function() {
  return !!this.checkedInStore;
};

// FIXED: Instance method to get recent activity with limits
UserSchema.methods.getRecentActivity = function(limit = 10) {
  try {
    const recentCheckins = this.checkedInStores
      ? this.checkedInStores
          .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
          .slice(0, limit)
      : [];
      
    const recentVisits = this.visitHistory
      ? this.visitHistory
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit)
      : [];
      
    return {
      checkins: recentCheckins,
      visits: recentVisits
    };
  } catch (error) {
    console.error('[UserModel] Error getting recent activity:', error);
    return { checkins: [], visits: [] };
  }
};

// FIXED: Instance method to get user stats
UserSchema.methods.getStats = function() {
  try {
    return {
      totalCheckins: this.checkedInStores ? this.checkedInStores.length : 0,
      totalVisits: this.visitHistory ? this.visitHistory.length : 0,
      totalSaved: this.savedStores ? this.savedStores.length : 0,
      totalLikes: this.impressionsLiked ? this.impressionsLiked.length : 0,
      totalDislikes: this.impressionsDisliked ? this.impressionsDisliked.length : 0,
      joinedAt: this.createdAt,
      lastActivity: this.lastLogin
    };
  } catch (error) {
    console.error('[UserModel] Error getting stats:', error);
    return {
      totalCheckins: 0,
      totalVisits: 0,
      totalSaved: 0,
      totalLikes: 0,
      totalDislikes: 0,
      joinedAt: this.createdAt,
      lastActivity: this.lastLogin
    };
  }
};

// FIXED: Instance method to add store visit with duplicate prevention
UserSchema.methods.addStoreVisit = function(storeId) {
  console.log(`[UserModel] Adding store visit for user ${this.username}: ${storeId}`);
  
  try {
    if (!this.visitHistory) {
      this.visitHistory = [];
    }
    
    // FIXED: Prevent duplicate visits within the same hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVisit = this.visitHistory.find(visit => 
      visit.storeId === storeId && visit.timestamp > oneHourAgo
    );
    
    if (recentVisit) {
      console.log(`[UserModel] Recent visit to ${storeId} found, skipping duplicate`);
      return Promise.resolve(this);
    }
    
    // Add new visit
    this.visitHistory.push({
      storeId: storeId,
      timestamp: new Date()
    });
    
    // FIXED: Keep only last 1000 visits
    if (this.visitHistory.length > 1000) {
      this.visitHistory = this.visitHistory
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 1000);
    }
    
    this.lastLogin = new Date();
    return this.save({ maxTimeMS: 5000 });
  } catch (error) {
    console.error('[UserModel] Error adding store visit:', error);
    return Promise.reject(error);
  }
};

// FIXED: Instance method to check in to store with duplicate prevention
UserSchema.methods.checkInToStore = function(storeId) {
  console.log(`[UserModel] Checking in user ${this.username} to store: ${storeId}`);
  
  try {
    // FIXED: Prevent checking in to the same store
    if (this.checkedInStore === storeId) {
      console.log(`[UserModel] User already checked in to ${storeId}`);
      return Promise.resolve(this);
    }
    
    // Set current check-in
    this.checkedInStore = storeId;
    
    // Initialize arrays if needed
    if (!this.checkedInStores) this.checkedInStores = [];
    if (!this.visitHistory) this.visitHistory = [];
    
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
    return this.save({ maxTimeMS: 5000 });
  } catch (error) {
    console.error('[UserModel] Error checking in to store:', error);
    return Promise.reject(error);
  }
};

// FIXED: Instance method to check out from store
UserSchema.methods.checkOutFromStore = function() {
  console.log(`[UserModel] Checking out user ${this.username}`);
  
  try {
    this.checkedInStore = null;
    this.lastLogin = new Date();
    return this.save({ maxTimeMS: 5000 });
  } catch (error) {
    console.error('[UserModel] Error checking out from store:', error);
    return Promise.reject(error);
  }
};

// FIXED: Instance method to add store impression with duplicate prevention
UserSchema.methods.addStoreImpression = function(storeId, action, sectionId = 'general') {
  console.log(`[UserModel] Adding ${action} impression for user ${this.username}: ${storeId}/${sectionId}`);
  
  try {
    // Initialize arrays if needed
    if (!this.impressionsLiked) this.impressionsLiked = [];
    if (!this.impressionsDisliked) this.impressionsDisliked = [];
    
    const impressionData = {
      storeId: storeId,
      sectionId: sectionId,
      impressionAt: new Date(),
      action: action,
      timestamp: new Date()
    };
    
    if (action === 'like') {
      // FIXED: Remove any existing impression for this store/section
      this.impressionsLiked = this.impressionsLiked.filter(
        imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
      );
      this.impressionsDisliked = this.impressionsDisliked.filter(
        imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
      );
      
      // Add new like
      this.impressionsLiked.push(impressionData);
      
    } else if (action === 'dislike') {
      // FIXED: Remove any existing impression for this store/section
      this.impressionsDisliked = this.impressionsDisliked.filter(
        imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
      );
      this.impressionsLiked = this.impressionsLiked.filter(
        imp => !(imp.storeId === storeId && imp.sectionId === sectionId)
      );
      
      // Add new dislike
      this.impressionsDisliked.push(impressionData);
    }
    
    this.lastLogin = new Date();
    return this.save({ maxTimeMS: 5000 });
  } catch (error) {
    console.error('[UserModel] Error adding store impression:', error);
    return Promise.reject(error);
  }
};

// FIXED: Clean up user cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > USER_CACHE_TTL) {
      userCache.delete(key);
    }
  }
  console.log(`[UserModel] Cache cleanup completed. Current cache size: ${userCache.size}`);
}, 120000); // Every 2 minutes

// Create and export the model
const UserModel = mongoose.model('User', UserSchema);

export { UserModel };

///////////////////////// END FIXED USER MODEL /////////////////////////