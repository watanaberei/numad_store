import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Changed require to import
const Schema = mongoose.Schema;

// IMPROVED: User Schema with better username handling and indexing
const UserSchema = new mongoose.Schema({
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
  collection: 'User'
});




const UserActivity = new Schema(
    {
    savedStores: {
      type: [String],
      default: []
    },
    // Simple check-in tracking
    checkedInStore: {
      type: String,
      default: null,
      unique: true
    },
    // Keep the more detailed checkedInStores array for historical data
    checkedInStores: [
      {
        storeId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        checkedInAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    impressionsLiked: 
    [
      {
        storeId: {
          type: String
        },
        sectionId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        ImpressionAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    impressionsDisliked: 
    [
      {
        storeId: {
          type: String
        },
        sectionId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        ImpressionAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    visitHistory: {
      type: [
        {
          storeId: String,
          timestamp: Date
        }
      ],
      default: []
    },
    // Sync metadata
    lastSynced: { type: Date, default: Date.now },
    syncSource: String,

    // Track when it was last updated
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "User",

    // This is critical - allow any fields not defined in the schema
    strict: false
  }
);


// // Pre-save middleware to validate username
// UserSchema.pre('save', function(next) {
//   if (this.username) {
//     // Convert to lowercase for consistency
//     this.username = this.username.toLowerCase();
    
//     // Validate username format
//     if (!/^[a-zA-Z0-9_-]+$/.test(this.username)) {
//       const error = new Error('Username can only contain letters, numbers, underscores, and dashes');
//       return next(error);
//     }
//   }
//   next();
// });

// // Password validation method
// UserSchema.methods.isValidPassword = async function(password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// // Method to get user's public profile info
// UserSchema.methods.getPublicProfile = function() {
//   return {
//     username: this.username,
//     firstName: this.firstName,
//     lastName: this.lastName,
//     description: this.description,
//     location: this.location,
//     website: this.website
//   };
// };

// // Static method to find user by username or email
// UserSchema.statics.findByUsernameOrEmail = function(identifier) {
//   return this.findOne({
//     $or: [
//       { email: identifier },
//       { username: identifier.toLowerCase() }
//     ]
//   });
// };


// IMPROVED: Create indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'checkedInStores.storeId': 1 });
UserSchema.index({ 'visitHistory.storeId': 1 });
UserSchema.index({ 'savedStores.storeId': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

// IMPROVED: Pre-save middleware to update timestamps and normalize data
UserSchema.pre('save', function(next) {
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
UserSchema.statics.findByUsernameOrEmail = function(identifier) {
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
UserSchema.methods.isCheckedIn = function() {
  return !!this.checkedInStore;
};

// IMPROVED: Instance method to get recent activity
UserSchema.methods.getRecentActivity = function(limit = 10) {
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
UserSchema.methods.getStats = function() {
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
UserSchema.methods.addStoreVisit = function(storeId) {
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
UserSchema.methods.checkInToStore = function(storeId) {
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
UserSchema.methods.checkOutFromStore = function() {
  console.log(`[UserModel] Checking out user ${this.username}`);
  
  this.checkedInStore = null;
  this.lastLogin = new Date();
  return this.save();
};

// IMPROVED: Instance method to add store impression
UserSchema.methods.addStoreImpression = function(storeId, action, sectionId = 'general') {
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

// Create and export the model
const UserModel = mongoose.model('User', UserSchema);
export { UserModel };




// // Password validation method
// UserSchema.methods.isValidPassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// };

// export const UserModel = mongoose.model('User', UserSchema);

// // Hash password before saving the user
// UserSchema.pre("save", async function (next) {
//   try {
//     // Generate Salt for the password encryption
//     const salt = await bcrypt.genSalt(15);
//     // Generate a hashed password using Salt
//     const passwordHash = await bcrypt.hash(this.password, salt);
//     // Re-assign the hashed password to the user's acuatl password
//     this.password = passwordHash;
//     next();
//     console.log("Salt: " + salt);
//     console.log("Original password: " + this.password);
//     console.log("Hashed Password: " + passwordHash);
//   } catch (error) {
//     next(error);
//   }
// });
// // isValidPassword
// // Compare hashedpassword vs password stored in db
// UserSchema.methods.isValidPassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// // Create the model with the correct collection name
// const UserModel = mongoose.model("User", UserSchema);

// // Export using the original format
// export { UserModel };
// Password validation method
// Password validation method








// Create Module
// const UserModel = mongoose.model('user',userSchema);
// Export Module
// module.exports = UserModel;

// // Password validation method
// userSchema.methods.isValidPassword = async function(password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw new Error (error);
//   }
// };

// export const UserModel = mongoose.model('User', userSchema);

// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   firstName: {
//     type: String,
//     required: false
//   },
//   lastName: {
//     type: [String],
//     required: false
//   },
//   birthdate: {
//     type: [Date],
//     required: false
//   },
//   savedStores: {
//     type: [String],
//     default: []
//   },
//   checkedInStores: [{
//     storeId: [String],
//     impression: {
//       type: [String],
//       enum: ['like', 'dislike', null],
//       default: null
//     },
//     checkedInAt: {
//   import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   firstName: {
//     type: String,
//     default: '',
//   },
//   lastName: {
//     type: String,
//     default: '',
//   },
//   birthdate: {
//     type: Date,
//   },
//   likedStores: {
//     type: [String],
//     default: [],
//   },
//   dislikedStores: {
//     type: [String],
//     default: [],
//   },
//   savedStores: {
//     type: [String],
//     default: [],
//   },
//   // Add this field to track the current checked-in store
//   checkedInStore: {
//     type: String,
//     default: null,
//   },
//   visitHistory: {
//     type: [{
//       storeId: String,
//       timestamp: Date,
//     }],
//     default: [],
//   },
// }, { timestamps: true });

// // Password validation method
// userSchema.methods.isValidPassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// };

// export const UserModel = mongoose.model('User', userSchema);
