///////////////////////// START FIXED USER MODEL /////////////////////////
// src/server/models/userModel.js - FIXED VERSION with proper error handling

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

console.log('[UserModel] Loading user model with performance optimizations');

// FIXED: User Schema with better indexing and validation
const UserSchema = new mongoose.Schema({

  //// PROFILE INFORMATION ////
  email: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  // Profile Pictures and Media (enhance existing profilePicture field)
  profilePicture: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      original: {
        url: String,
        filename: String,
        mimetype: String,
        size: Number,
        uploadedAt: { 
          type: Date, 
          default: Date.now 
        }
      },
      thumbnail: {
        url: String,
        filename: String,
        mimetype: String,
        size: Number
      },
      medium: {
        url: String,
        filename: String,
        mimetype: String,
        size: Number
      },
      small: {
        url: String,
        filename: String,
        mimetype: String,
        size: Number
      }
    },
    coverPicture: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        url: String,
      }
    },
    validate: {
      validator: function(media) {
        // Allow null/undefined for optional profile pictures
        if (!media) return true;
        
        // If it's a string (legacy support), validate as URL
        if (typeof media === 'string') {
          return /^https?:\/\/.+/.test(media);
        }
        
        // If it's an object, validate structure
        if (typeof media === 'object') {
          return media.original && media.original.url;
        }
        
        return false;
      },
      message: 'Profile picture must be a valid URL or media object with original URL'
    }
  },
  // coverPicture: {
  //   type: mongoose.Schema.Types.Mixed,
  //   default: {
  //     url: String,
  //     filename: String,
  //     mimetype: String,
  //     size: Number,
  //     uploadedAt: { 
  //       type: Date, 
  //       default: Date.now 
  //     }
  //   },
  //   validate: {
  //     validator: function(media) {
  //       // Allow null/undefined for optional cover pictures
  //       if (!media) return true;
        
  //       // If it's a string (legacy support), validate as URL
  //       if (typeof media === 'string') {
  //         return /^https?:\/\/.+/.test(media);
  //       }
        
  //       // If it's an object, validate structure
  //       if (typeof media === 'object') {
  //         return !media.url || /^https?:\/\/.+/.test(media.url);
  //       }
        
  //       return true;
  //     },
  //     message: 'Cover picture must be a valid URL or media object'
  //   }
  // },
  username: {
    type: String,
    required: true,
    // unique: true,
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
  
  // PROFILE INFORMATION ////
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
  additionalName: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name must be no more than 100 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  
  //// PROFESSIONAL INFORMATION ////
  headline: {
    type: String,
    trim: true,
    maxlength: [100, 'Headline must be no more than 100 characters']
  },
  overview: {
    type: String,
    trim: true,
    maxlength: [600, 'Description must be no more than 600 characters']
  },
  profession: {
    type: String,
    trim: true,
    maxlength: [100, 'Profession must be no more than 100 characters']
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'Industry must be no more than 100 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company must be no more than 100 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL must be no more than 200 characters']
  },



  //// NEUMADIC STARS ////
  neumadicStars: {
    type: Number,
    default: 0,
    min: 0
  },
  starHistory: {
    type: [{
      action: {
        type: String,
        enum: ['checkin', 'review', 'like', 'recommendation', 'blog_post', 'endorsement', 'follow'],
        required: true
      },
      points: {
        type: Number,
        required: true
      },
      relatedId: String, // Store ID, Blog ID, User ID, etc.
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 ENTRIES
      },
      message: 'Too many star history entries'
    }
  },




  //// PRIVACY AND VISIBILITY ////
  profileVisibility: {
    activity: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    places: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    posts: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    followers: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    following: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    }
  },
  
  // Content Moderation
  blockedUsers: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      blockedAt: {
        type: Date,
        default: Date.now
      },
      reason: {
        type: String,
        trim: true,
        maxlength: [200, 'Block reason must be no more than 200 characters']
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 BLOCKED USERS
      },
      message: 'Too many blocked users'
    }
  },
  
  reportedContent: {
    type: [{
      contentType: {
        type: String,
        enum: ['user', 'store', 'blog', 'comment'],
        required: true
      },
      contentId: {
        type: String,
        required: true
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'harassment', 'fake', 'other'],
        required: true
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, 'Report description must be no more than 500 characters']
      },
      reportedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 500; // LIMIT TO 500 REPORTS
      },
      message: 'Too many reports'
    }
  },



  //// CONTACT INFORMATION ////
  socialMedia: {
    type: [{
      platform: {
        type: String,
        enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'reddit', 'other']
      },
      url: {
        type: String,
        trim: true,
        maxlength: [200, 'Social media URL must be no more than 200 characters']
      }
    }],
    default: [],
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number must be no more than 20 characters']
  },
  birthdate: {
    type: Date
  },


  
  //// LOCATION ////
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Location must be no more than 100 characters']
  },
  postalCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Postal code must be no more than 20 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City must be no more than 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State must be no more than 100 characters']
  },
  


  //// SOCIAL ACTIVITY ////
  following: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      followedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 FOLLOWING
      },
      message: 'Too many following'
    }
  },

  followers: {
    type: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      followedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 50000; // LIMIT TO 50000 FOLLOWERS
      },
      message: 'Too many followers'
    }
  },

  endorsements: {
    type: [{
      fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      skill: {
        type: String,
        trim: true,
        maxlength: [100, 'Skill must be no more than 100 characters']
      },
      endorsedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENDORSEMENTS
      },
      message: 'Too many endorsements'
    }
  },



  //// STORE ACTIVITY ////
  checkedInStore: {
    type: String,
    trim: true
  },
  
  checkedInStores: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      checkedInAt: {
        type: Date,
        default: Date.now
      },
      checkedOutAt: Date
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 CHECK-INS
      },
      message: 'Too many check-in records'
    }
  },
  
  // Store Visit History
  visitHistory: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      duration: Number, // Visit duration in minutes
      impressions: {
        liked: Boolean,
        disliked: Boolean
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 VISITS
      },
      message: 'Too many visit history entries'
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
      },
      category: {
        type: String,
        enum: ['favorite', 'bookmarked', 'want-to-visit', 'other'],
        default: 'bookmarked'
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 SAVED STORES
      },
      message: 'Too many saved stores'
    }
  },
  
  // Store Impressions
  likedStores: {
    type: [{
      storeId: String,
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 LIKED STORES
      },
      message: 'Too many liked stores'
    }
  },
  
  dislikedStores: {
    type: [{
      storeId: String,
      dislikedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 DISLIKED STORES
      },
      message: 'Too many disliked stores'
    }
  },
  
  impressionsLiked: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      impressionType: {
        type: String,
        enum: ['atmosphere', 'service', 'value', 'quality', 'overall'],
        default: 'overall'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many liked impressions'
    }
  },
  
  impressionsDisliked: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      impressionType: {
        type: String,
        enum: ['atmosphere', 'service', 'value', 'quality', 'overall'],
        default: 'overall'
      },
      dislikedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many disliked stores'
    }
  },

  // Stores created by user (similar to blogsCreated)
  storesCreated: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      slug: String,
      title: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 STORES
      },
      message: 'Too many stores created'
    }
  },


  //// BLOG ACTIVITY ////
  blogsCreated: {
    type: [{
      blogId: {
        type: String,
        required: true
      },
      title: String,
      slug: String,
      status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      publishedAt: Date,
      views: {
        type: Number,
        default: 0
      },
      likes: {
        type: Number,
        default: 0
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 BLOGS
      },
      message: 'Too many blogs created'
    }
  },

  ///////////////////////// START NEW BLOG POSTS FIELD /////////////////////////
  // Blog Posts field - stores references to Blog documents (similar to how stores are handled)
  blogPosts: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      title: String,
      slug: String,
      category: {
        type: String,
        enum: ['dine', 'work', 'stay', 'play'],
        default: 'dine'
      },
      snippet: String,
      thumbnail: String,
      status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
      },
      publishedAt: {
        type: Date,
        default: Date.now
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 BLOG POSTS
      },
      message: 'Too many blog posts'
    }
  },

  // Blog interactions (similar to store interactions)
  savedBlogs: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      savedAt: {
        type: Date,
        default: Date.now
      },
      category: {
        type: String,
        enum: ['favorite', 'bookmarked', 'read-later', 'other'],
        default: 'bookmarked'
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 SAVED BLOGS
      },
      message: 'Too many saved blogs'
    }
  },

  likedBlogs: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 LIKED BLOGS
      },
      message: 'Too many liked blogs'
    }
  },

  blogHistory: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      readingTime: Number // Reading time in seconds
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 BLOG VIEWS
      },
      message: 'Too many blog history entries'
    }
  },
  ///////////////////////// END NEW BLOG POSTS FIELD /////////////////////////
  

  //// PLACES ACTIVITY ////
  placesWantToVisit: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many want-to-visit places'
    }
  },
  
  placesRecommended: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      recommendedTo: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        recommendedAt: {
          type: Date,
          default: Date.now
        }
      }],
      reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Recommendation reason must be no more than 500 characters']
      },
      recommendedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many recommended places'
    }
  },
  
  placesRequested: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      requestedFrom: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        requestedAt: {
          type: Date,
          default: Date.now
        }
      }],
      reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Request reason must be no more than 500 characters']
      },
      requestedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 ENTRIES
      },
      message: 'Too many requested places'
    }
  },
  

  //// ACCOUNT SETTINGS ////
  // Email Preferences
  emailNotifications: {
    marketing: {
      type: Boolean,
      default: true
    },
    updates: {
      type: Boolean,
      default: true
    },
    social: {
      type: Boolean,
      default: true
    },
    reminders: {
      type: Boolean,
      default: true
    }
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedReason: String,
  suspendedUntil: Date,
  
  // API Access
  apiKeys: {
    type: [{
      key: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      lastUsed: Date,
      permissions: [String]
    }],
    default: []
  },
  
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  
  // Profile Privacy (renamed from profilePrivacy)
  privacy: {
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
  collection: 'User',
  // FIXED: Add performance optimizations
  minimize: false,
  versionKey: false,
  strict: true
});

// FIXED: Only essential indexes to avoid conflicts
// UserSchema.index({ email: 1 }, { unique: true, background: true });
// UserSchema.index({ username: 1 }, { unique: true, background: true });
// UserSchema.index({ email: 1 }, { unique: true, background: true });
// UserSchema.index({ username: 1 }, { unique: true, background: true });
// FIXED: Compound indexes for common queries
UserSchema.index({ email: 1, isActive: 1 }, { background: true });
UserSchema.index({ username: 1, isActive: 1 }, { background: true });
UserSchema.index({ createdAt: -1 }, { background: true });
UserSchema.index({ lastLogin: -1 }, { background: true });
UserSchema.index({ isActive: 1 }, { background: true });
UserSchema.index({ 'following.userId': 1 }, { background: true });
UserSchema.index({ 'followers.userId': 1 }, { background: true });
UserSchema.index({ neumadicStars: -1 }, { background: true });
UserSchema.index({ 'profileVisibility.activity': 1 }, { background: true });
UserSchema.index({ 'blogsCreated.status': 1, 'blogsCreated.publishedAt': -1 }, { background: true });
///////////////////////// START NEW BLOG POSTS INDEX /////////////////////////
UserSchema.index({ 'blogPosts.status': 1, 'blogPosts.publishedAt': -1 }, { background: true });
UserSchema.index({ 'blogPosts.blogId': 1 }, { background: true });
///////////////////////// END NEW BLOG POSTS INDEX /////////////////////////

// FIXED: Compound indexes for common queries
// UserSchema.index({ email: 1, isActive: 1 }, { background: true });
// UserSchema.index({ username: 1, isActive: 1 }, { background: true });

// FIXED: Pre-save middleware with performance optimizations
UserSchema.pre('save', async function(next) {
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
    
    // Hash password if modified
    if (user.isModified('password') && user.password) {
      console.log('[UserModel] Hashing password...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    // FIXED: Limit array sizes to prevent memory issues
    if (user.following && user.following.length > 5000) {
      console.log(`[UserModel] Trimming following array from ${user.following.length} to 5000`);
      user.following = user.following
        .sort((a, b) => new Date(b.followedAt) - new Date(a.followedAt))
        .slice(0, 5000);
    }

    if (user.followers && user.followers.length > 50000) {
      console.log(`[UserModel] Trimming followers array from ${user.followers.length} to 50000`);
      user.followers = user.followers
        .sort((a, b) => new Date(b.followedAt) - new Date(a.followedAt))
        .slice(0, 50000);
    }

    if (user.endorsements && user.endorsements.length > 1000) {
      console.log(`[UserModel] Trimming endorsements array from ${user.endorsements.length} to 1000`);
      user.endorsements = user.endorsements
        .sort((a, b) => new Date(b.endorsedAt) - new Date(a.endorsedAt))
        .slice(0, 1000);
    }

    if (user.starHistory && user.starHistory.length > 10000) {
      console.log(`[UserModel] Trimming starHistory array from ${user.starHistory.length} to 10000`);
      user.starHistory = user.starHistory
        .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
        .slice(0, 10000);
    }

    ///////////////////////// START NEW BLOG POSTS ARRAY TRIMMING /////////////////////////
    if (user.blogPosts && user.blogPosts.length > 10000) {
      console.log(`[UserModel] Trimming blogPosts array from ${user.blogPosts.length} to 10000`);
      user.blogPosts = user.blogPosts
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 10000);
    }
    ///////////////////////// END NEW BLOG POSTS ARRAY TRIMMING /////////////////////////
    
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

// FIXED: Static method to find user by username or email with proper error handling
const userCache = new Map();
const USER_CACHE_TTL = 60000; // 1 minute cache

UserSchema.statics.findByUsernameOrEmail = async function(identifier) {
  console.log(`[UserModel] Finding user by identifier: ${identifier}`);
  
  if (!identifier) {
    console.log('[UserModel] No identifier provided');
    return null;
  }
  
  const trimmedIdentifier = identifier.trim().toLowerCase();
  
  // FIXED: Check cache first - but make cache more specific
  const cacheKey = `user-${trimmedIdentifier}`;
  const cached = userCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
    console.log('[UserModel] Using cached user data');
    return cached.user;
  }
  
  // Check if identifier contains @ (likely email)
  const query = trimmedIdentifier.includes('@') 
    ? { email: trimmedIdentifier }
    : { username: trimmedIdentifier };
  
  console.log('[UserModel] Searching with query:', query);
  
  try {
    // FIXED: Execute the query immediately and return the result
    const user = await this.findOne(query)
      .select('_id email username password firstName lastName description location website phoneNumber checkedInStore checkedInStores visitHistory savedStores likedStores dislikedStores impressionsLiked impressionsDisliked isActive profilePrivacy lastLogin createdAt blogPosts blogsCreated savedBlogs likedBlogs blogHistory')
      .maxTimeMS(10000) // Increased timeout to 10 seconds
      .exec(); // Explicitly execute the query
    
    // FIXED: Cache the result with proper logging
    userCache.set(cacheKey, {
      user: user,
      timestamp: Date.now()
    });
    
    if (user) {
      console.log('[UserModel] User found and cached:', user.username);
    } else {
      console.log('[UserModel] User not found for identifier:', trimmedIdentifier);
    }
    
    return user;
  } catch (error) {
    console.error('[UserModel] Error in findByUsernameOrEmail:', error);
    throw error;
  }
};

// FIXED: Instance methods (keeping the same as before)
UserSchema.methods.isCheckedIn = function() {
  return !!this.checkedInStore;
};

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

    ///////////////////////// START NEW BLOG ACTIVITY /////////////////////////
    const recentBlogViews = this.blogHistory
      ? this.blogHistory
          .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
          .slice(0, limit)
      : [];
    ///////////////////////// END NEW BLOG ACTIVITY /////////////////////////
      
    return {
      checkins: recentCheckins,
      visits: recentVisits,
      blogViews: recentBlogViews
    };
  } catch (error) {
    console.error('[UserModel] Error getting recent activity:', error);
    return { checkins: [], visits: [], blogViews: [] };
  }
};

UserSchema.methods.getStats = function() {
  try {
    return {
      totalCheckins: this.checkedInStores ? this.checkedInStores.length : 0,
      totalVisits: this.visitHistory ? this.visitHistory.length : 0,
      totalSaved: this.savedStores ? this.savedStores.length : 0,
      totalLikes: this.impressionsLiked ? this.impressionsLiked.length : 0,
      totalDislikes: this.impressionsDisliked ? this.impressionsDisliked.length : 0,
      ///////////////////////// START NEW BLOG STATS /////////////////////////
      totalBlogPosts: this.blogPosts ? this.blogPosts.filter(post => post.status === 'published').length : 0,
      totalBlogsCreated: this.blogsCreated ? this.blogsCreated.length : 0,
      totalSavedBlogs: this.savedBlogs ? this.savedBlogs.length : 0,
      totalLikedBlogs: this.likedBlogs ? this.likedBlogs.length : 0,
      ///////////////////////// END NEW BLOG STATS /////////////////////////
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
      totalBlogPosts: 0,
      totalBlogsCreated: 0,
      totalSavedBlogs: 0,
      totalLikedBlogs: 0,
      joinedAt: this.createdAt,
      lastActivity: this.lastLogin
    };
  }
};


//// NEUMADIC STARS ////
UserSchema.methods.calculateNeuradicStars = function() {
  try {
    let totalStars = 0;
    
    // Base points from different activities
    const checkIns = this.checkedInStores ? this.checkedInStores.length * 2 : 0;
    const reviews = this.impressionsLiked ? this.impressionsLiked.length * 5 : 0;
    const blogs = this.blogsCreated ? this.blogsCreated.filter(blog => blog.status === 'published').length * 10 : 0;
    const endorsements = this.endorsements ? this.endorsements.length * 3 : 0;
    const followers = this.followers ? this.followers.length * 1 : 0;
    
    totalStars = checkIns + reviews + blogs + endorsements + followers;
    
    // Update the field
    this.neumadicStars = totalStars;
    
    return totalStars;
  } catch (error) {
    console.error('[UserModel] Error calculating Neumadic Stars:', error);
    return this.neumadicStars || 0;
  }
};


//// USER ACTIVITY ////
UserSchema.methods.getProfileStats = function() {
  try {
    return {
      // Places stats
      totalVisited: this.visitHistory ? this.visitHistory.length : 0,
      totalWantToVisit: this.placesWantToVisit ? this.placesWantToVisit.length : 0,
      totalSaved: this.savedStores ? this.savedStores.length : 0,
      totalRecommended: this.placesRecommended ? this.placesRecommended.length : 0,
      totalRequested: this.placesRequested ? this.placesRequested.length : 0,
      
      // Social stats
      totalFollowers: this.followers ? this.followers.length : 0,
      totalFollowing: this.following ? this.following.length : 0,
      totalEndorsements: this.endorsements ? this.endorsements.length : 0,
      
      // Content stats
      totalBlogs: this.blogsCreated ? this.blogsCreated.length : 0,
      publishedBlogs: this.blogsCreated ? this.blogsCreated.filter(blog => blog.status === 'published').length : 0,
      totalReviews: this.impressionsLiked ? this.impressionsLiked.length : 0,
      ///////////////////////// START NEW BLOG POSTS STATS /////////////////////////
      totalBlogPosts: this.blogPosts ? this.blogPosts.filter(post => post.status === 'published').length : 0,
      ///////////////////////// END NEW BLOG POSTS STATS /////////////////////////
      
      // Engagement stats
      neumadicStars: this.neumadicStars || 0,
      totalContributions: (this.impressionsLiked?.length || 0) + (this.impressionsDisliked?.length || 0) + (this.blogsCreated?.length || 0),
      
      // Activity stats
      lastActivity: this.lastLogin,
      joinedAt: this.createdAt,
      profileCompleteness: this.getProfileCompleteness()
    };
  } catch (error) {
    console.error('[UserModel] Error getting profile stats:', error);
    return {};
  }
};

// Calculate profile completeness percentage
UserSchema.methods.getProfileCompleteness = function() {
  try {
    const fields = [
      'firstName', 'lastName', 'description', 'location', 'profession', 
      'industry', 'company', 'website', 'profilePicture'
    ];
    
    let completedFields = 0;
    const totalFields = fields.length;
    
    fields.forEach(field => {
      if (field === 'profilePicture') {
        if (this.profilePicture && this.profilePicture.original && this.profilePicture.original.url) {
          completedFields++;
        }
      } else if (this[field] && this[field].toString().trim() !== '') {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / totalFields) * 100);
  } catch (error) {
    console.error('[UserModel] Error calculating profile completeness:', error);
    return 0;
  }
};

// FIXED: Clear cache periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const entriesToDelete = [];
  
  userCache.forEach((value, key) => {
    if (now - value.timestamp > USER_CACHE_TTL) {
      entriesToDelete.push(key);
    }
  });
  
  entriesToDelete.forEach(key => userCache.delete(key));
  
  console.log(`[UserModel] Cache cleanup complete. Removed ${entriesToDelete.length} entries. Current cache size: ${userCache.size}`);
}, 120000); // Every 2 minutes

// FIXED: Error handling for the model
UserSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.error('[UserModel] Duplicate key error:', error);
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field} already exists`));
  } else {
    console.error('[UserModel] Save error:', error);
    next(error);
  }
});

// Create and export the model
const UserModel = mongoose.model('User', UserSchema);

export { UserModel };

///////////////////////// END FIXED USER MODEL /////////////////////////