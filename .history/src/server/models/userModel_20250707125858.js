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
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
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


  //// AUTHENTICATION ////
  refreshTokens: {
    type: [{
      token: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,


  //// STORES DATA ////
  stores: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      storeInfo: {
        name: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        rating: Number,
        review_count: Number,
        storeType: [String]
      },
      visitCount: {
        type: Number,
        default: 1
      },
      lastVisited: {
        type: Date,
        default: Date.now
      },
      isFavorite: {
        type: Boolean,
        default: false
      },
      notes: String,
      tags: [String],
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 STORES
      },
      message: 'Too many stores'
    }
  },
  checkedInStore: {
    type: {
      slug: String,
      name: String,
      lat: Number,
      lng: Number,
      checkedInAt: Date,
      duration: Number
    },
    default: null
  },
  checkedInStores: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      storeName: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      location: {
        lat: Number,
        lng: Number
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 CHECK-INS
      },
      message: 'Too many check-ins'
    }
  },
  visitHistory: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      storeName: String,
      visitedAt: {
        type: Date,
        default: Date.now
      },
      duration: Number, // in minutes
      impressions: [{
        impressionId: String,
        rating: Number,
        timestamp: Date
      }]
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 VISITS
      },
      message: 'Too many visits'
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
      category: String,
      notes: String
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 SAVED
      },
      message: 'Too many saved stores'
    }
  },


  ///////////////////////// START BLOG POSTS INTEGRATION /////////////////////////
  // Blog posts array - similar structure to stores
  blogPosts: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      title: {
        type: String,
        required: true
      },
      slug: {
        type: String,
        required: true
      },
      category: {
        type: String,
        enum: ['dine', 'work', 'stay', 'play'],
        default: 'dine'
      },
      snippet: {
        type: String,
        maxlength: 500
      },
      thumbnail: String,
      status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
      },
      publishedAt: Date,
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
  
  // Blog activity tracking
  blogsCreated: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      title: String,
      slug: String,
      status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
      },
      publishedAt: Date,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 CREATED BLOGS
      },
      message: 'Too many created blogs'
    }
  },
  
  savedBlogs: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      },
      savedAt: {
        type: Date,
        default: Date.now
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
        ref: 'Blog'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 LIKED BLOGS
      },
      message: 'Too many liked blogs'
    }
  },
  
  blogHistory: {
    type: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      duration: Number // in seconds
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 BLOG VIEWS
      },
      message: 'Too many blog views'
    }
  },
  ///////////////////////// END BLOG POSTS INTEGRATION /////////////////////////


  //// IMPRESSIONS ////
  impressions: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      photos: [String],
      tags: [String],
      helpfulCount: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 5000; // LIMIT TO 5000 IMPRESSIONS
      },
      message: 'Too many impressions'
    }
  },
  impressionsLiked: {
    type: [{
      impressionId: {
        type: String,
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
        return arr.length <= 10000; // LIMIT TO 10000 LIKES
      },
      message: 'Too many liked impressions'
    }
  },
  impressionsDisliked: {
    type: [{
      impressionId: {
        type: String,
        required: true
      },
      dislikedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10000; // LIMIT TO 10000 DISLIKES
      },
      message: 'Too many disliked impressions'
    }
  },
  impressionsReported: {
    type: [{
      impressionId: {
        type: String,
        required: true
      },
      reason: String,
      reportedAt: {
        type: Date,
        default: Date.now
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



  //// RECOMMENDATIONS ////
  placesRecommended: {
    type: [{
      storeId: {
        type: String,
        required: true
      },
      recommendedTo: [{
        userId: mongoose.Schema.Types.ObjectId,
        recommendedAt: Date
      }],
      message: String,
      tags: [String],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 RECOMMENDATIONS
      },
      message: 'Too many recommendations'
    }
  },
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
      },
      notes: String
    }],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 1000; // LIMIT TO 1000 WANT TO VISIT
      },
      message: 'Too many want to visit places'
    }
  },
  placesRequested: {
    type: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      location: {
        address: String,
        city: String,
        state: String,
        zip: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      category: String,
      requestedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
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
  

  //// CONTACT INFORMATION ////
  // socialMedia: {
  //   type: [{
  //     platform: {
  //       type: String,
  //       enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'reddit', 'other']
  //     },
  //     url: {
  //       type: String,
  //       trim: true,
  //       maxlength: [200, 'Social media URL must be no more than 200 characters']
  //     }
  //   }],
  //   default: [],
  // },
  // phoneNumber: {
  //   type: String,
  //   trim: true,
  //   maxlength: [20, 'Phone number must be no more than 20 characters']
  // },
  // birthdate: {
  //   type: Date
  // },


  
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
  messages: {
    type: [{
      conversationId: String,
      participants: [mongoose.Schema.Types.ObjectId],
      lastMessage: {
        content: String,
        timestamp: Date,
        read: Boolean
      }
    }],
    default: []
  },
  

  //// PROFILE VISIBILITY ////
  profilePrivacy: {
    showCheckins: {
      type: Boolean,
      default: true
    },
    showSavedStores: {
      type: Boolean,
      default: true
    },
    showFollowing: {
      type: Boolean,
      default: true
    },
    showFollowers: {
      type: Boolean,
      default: true
    },
    showActivity: {
      type: Boolean,
      default: true
    }
  },
  profileVisibility: {
    searchable: {
      type: Boolean,
      default: true
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    showLocation: {
      type: Boolean,
      default: true
    },
    showBirthdate: {
      type: Boolean,
      default: false
    },
    activity: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    impressions: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    stores: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
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
  // isVerified: {
  //   type: Boolean,
  //   default: false
  // },
  // isActive: {
  //   type: Boolean,
  //   default: true
  // },

  //// ACCOUNT SETTINGS ////
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now }
  }],
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
  },
  deactivatedAt: Date,
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

   //// NOTIFICATIONS ////
   notifications: {
    email: {
      marketing: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    },
    push: {
      marketing: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    }
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

// FIXED: Add compound indexes for performance with blog integration
UserSchema.index({ email: 1 }, { unique: true, background: true });
UserSchema.index({ username: 1 }, { unique: true, background: true });
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
    
    ///////////////////////// START BLOG POSTS ARRAY LIMIT /////////////////////////
    if (user.blogPosts && user.blogPosts.length > 10000) {
      console.log(`[UserModel] Trimming blogPosts array from ${user.blogPosts.length} to 10000`);
      user.blogPosts = user.blogPosts
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 10000);
    }
    ///////////////////////// END BLOG POSTS ARRAY LIMIT /////////////////////////
    
    next();
  } catch (error) {
    console.error('[UserModel] Pre-save error:', error);
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
    : { $or: [{ username: trimmedIdentifier }, { email: trimmedIdentifier }] };
  
  try {
    const user = await this.findOne(query);
    
    if (user) {
      // Cache the result
      userCache.set(cacheKey, { user, timestamp: Date.now() });
      
      // Limit cache size
      if (userCache.size > 100) {
        const firstKey = userCache.keys().next().value;
        userCache.delete(firstKey);
      }
    }
    
    return user;
  } catch (error) {
    console.error('[UserModel] Error finding user:', error);
    return null;
  }
};

// FIXED: Instance method to check password with error handling
UserSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('[UserModel] line 1022: Comparing password for user:', this.email);
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('[UserModel] Error comparing password:', error);
    return false;
  }
};


// Instance methods
UserSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('[UserModel] Password comparison error:', error);
    throw error;
  }
};

// FIXED: Static method to find by username or email with timeout
UserSchema.statics.findByUsernameOrEmail = async function(identifier) {
  const normalizedIdentifier = identifier.toLowerCase().trim();
  
  console.log(`[UserModel] Finding user by identifier: ${normalizedIdentifier}`);
  
  try {
    const user = await this.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier }
      ],
      isActive: true
    }).maxTimeMS(5000); // 5 second timeout
    
    if (user) {
      console.log(`[UserModel] User found: ${user.username} (${user.email})`);
    } else {
      console.log(`[UserModel] No user found for identifier: ${normalizedIdentifier}`);
    }
    
    return user;
  } catch (error) {
    console.error(`[UserModel] Error finding user:`, error);
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

// Instance method to get user stats
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
UserSchema.methods.calculateNeumadicStars = function() {
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

// Instance method to get public profile data
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    headline: this.headline,
    overview: this.overview,
    profession: this.profession,
    company: this.company,
    industry: this.industry,
    profilePicture: this.profilePicture,
    neumadicStars: this.neumadicStars,
    website: this.website,
    city: this.city,
    state: this.state,
    country: this.country,
    joinedDate: this.createdAt,
    lastActive: this.lastLogin,
    ///////////////////////// START BLOG POSTS PUBLIC DATA /////////////////////////
    blogPostsCount: this.blogPosts ? this.blogPosts.filter(p => p.status === 'published').length : 0,
    recentBlogPosts: this.blogPosts ? 
      this.blogPosts
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 5)
        .map(p => ({
          blogId: p.blogId,
          title: p.title,
          slug: p.slug,
          category: p.category,
          snippet: p.snippet,
          thumbnail: p.thumbnail,
          publishedAt: p.publishedAt
        })) : [],
    ///////////////////////// END BLOG POSTS PUBLIC DATA /////////////////////////
    stats: this.getStats(),
    socialMedia: this.socialMedia,
    profileVisibility: this.profileVisibility
  };
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
      totalBlogs: this.blogsCreated ? this.blogsCreated.filter(blog => blog.status === 'published').length : 0,
      totalImpressions: this.impressions ? this.impressions.length : 0,
      
      // Engagement stats
      totalLikes: this.impressionsLiked ? this.impressionsLiked.length : 0,
      totalStars: this.neumadicStars || 0
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


console.log('[UserModel] User model loaded successfully');

// Create the model
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
export { UserModel };

///////////////////////// END FIXED USER MODEL /////////////////////////