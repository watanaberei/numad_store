///////////////////////// START UPDATED STORE MODEL /////////////////////////
// src/server/models/storeModel.js
import mongoose from "mongoose";

// IMPROVED: Store Schema with better interaction tracking and complete data structure
const StoreSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
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
  
  // Hero section - matching data.js hero() output structure
  hero: {
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    price: { type: String, default: "$$" },
    costEstimate: { type: String, default: "NA" },
    storeType: mongoose.Schema.Types.Mixed, // Can be array or string
    distance: { type: String, default: "NA" },
    city: { type: String, default: "NA" },
    state: { type: String, default: "NA" },
    storeName: { type: String, default: "NA" },
    distanceMiles: { type: String, default: "NA" },
    status: { type: String, default: "NA" },
    gallery: [{ type: String }] // Array of image URLs
  },
  
  // Overview section - matching data.js overview() output structure
  overview: [{
    header: { type: String },
    summary: {
      experienceScore: { type: String },
      experience: [{
        label: String,
        score: Number,
        user: Number
      }],
      serviceScore: { type: String },
      service: [{
        label: String,
        score: Number,
        user: Number
      }],
      businessScore: { type: String },
      business: [{
        label: String,
        score: Number,
        user: Number
      }],
      locationScore: { type: String },
      location: [{
        label: String,
        score: Number,
        user: Number
      }]
    },
    text: {
      title: { type: String },
      content: { type: String }
    },
    footer: {
      contributionsCount: { type: Number, default: 0 },
      modifiedDate: { type: String },
      modifiedTime: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 }
    }
  }],
  
  // Experience section - matching data.js experience() output structure
  experience: {
    header: { type: String },
    area: {
      item: [{
        area: String,
        links: {
          gallery: String
        },
        images: [{
          id: String,
          impressions: {
            users: Number,
            likes: Number,
            dislikes: Number
          },
          links: {
            image: String
          },
          source: {
            name: String,
            logo: String,
            links: {
              source: String
            }
          },
          thumbnail: {
            media: {
              thumbnail: String
            },
            post: {
              description: String,
              poster: {
                username: String,
                link: {
                  profile: String
                }
              }
            }
          }
        }]
      }]
    },
    attribute: {
      bestfor: [{
        label: String,
        score: Number,
        count: Number
      }],
      working: [{
        label: String,
        score: Number,
        count: Number
      }],
      environment: [{
        label: String,
        score: Number,
        count: Number
      }],
      facility: [{
        label: String,
        score: Number,
        count: Number
      }]
    },
    text: {
      title: { type: String },
      content: { type: String }
    },
    footer: {
      contributionsCount: { type: Number, default: 0 },
      modifiedDate: { type: String },
      modifiedTime: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 }
    }
  },
  
  // Service section - matching data.js service() output structure
  service: {
    header: { type: String },
    category: mongoose.Schema.Types.Mixed, // Flexible for categoryData structure
    text: {
      title: { type: String },
      content: { type: String }
    },
    footer: {
      contributionsCount: { type: Number, default: 0 },
      modifiedDate: { type: String },
      modifiedTime: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 }
    }
  },
  
  // Business section - matching data.js business() output structure
  business: {
    header: { type: String },
    timeline: mongoose.Schema.Types.Mixed, // Flexible for Yelp data
    footer: {
      contributionsCount: { type: Number, default: 0 },
      modifiedDate: { type: String },
      modifiedTime: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 }
    }
  },
  
  // Location section - matching data.js location() output structure
  location: {
    header: { type: String },
    neighborhood: {
      address: { type: String },
      city: { type: String },
      area: { type: String },
      state: { type: String },
      zip: { type: String },
      geolocation: {
        lat: { type: Number },
        lon: { type: Number }
      },
      attribute: mongoose.Schema.Types.Mixed, // Flexible for attrtags structure
      stats: {
        contributions: { type: Number, default: 0 },
        reviews: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 }
      },
      modified: {
        date: { type: String },
        time: { type: Number }
      }
    },
    attribute: mongoose.Schema.Types.Mixed, // Array of attribute categories
    footer: {
      contributionsCount: { type: Number, default: 0 },
      modifiedDate: { type: String },
      modifiedTime: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      dislikesCount: { type: Number, default: 0 }
    }
  },
  
  // Additional data sections from data.js
  categoryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mapRadiusData: {
    address: String,
    stores: mongoose.Schema.Types.Mixed
  },
  
  // All Yelp data sections
  yelpData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpFoodData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpFusionData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpSearchData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpPhoneData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpMatchData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpDetailsData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpDeliveryData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpServiceData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  yelpInsightData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
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
    checkedInBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
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
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Store',
  strict: false // Important: allows additional fields not defined in schema
});

// Store indexes
StoreSchema.index({ slug: 1 }, { unique: true });
StoreSchema.index({ title: 1 });
StoreSchema.index({ 'interactions.likes': -1 });
StoreSchema.index({ 'interactions.views': -1 });
StoreSchema.index({ lastUpdated: -1 });

// Log operations on stores
StoreSchema.pre("save", function (next) {
  console.log(`[MongoDB storeModel.js line 320] Saving store: ${this.slug}`);
  this.lastUpdated = new Date();
  
  // Update lastSynced timestamp
  this.lastSynced = new Date();
  next();
});

StoreSchema.post("save", function (doc) {
  console.log(`[MongoDB storeModel.js line 328] Store saved: ${doc.slug} (ID: ${doc._id})`);
});

StoreSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    console.log(`[MongoDB storeModel.js line 333] Store updated: ${doc.slug} (ID: ${doc._id})`);
  }
});

// Add methods for interactions
StoreSchema.methods.handleInteraction = async function (userId, action, sectionId = 'general') {
  const user = await mongoose.model("User").findById(userId);
  if (!user) throw new Error("User not found");

  console.log(`[MongoDB storeModel.js line 342] Handling ${action} interaction for user ${userId} on store ${this.slug}`);

  switch (action) {
    case "like":
      if (!this.interactions.likedBy.includes(userId)) {
        // Remove from dislikes if exists
        this.interactions.dislikedBy = this.interactions.dislikedBy.filter(
          (id) => id.toString() !== userId.toString()
        );
        if (this.interactions.dislikedBy.length < this.interactions.dislikes) {
          this.interactions.dislikes--;
        }

        // Add like
        this.interactions.likedBy.push(userId);
        this.interactions.likes++;
      }
      break;

    case "dislike":
      if (!this.interactions.dislikedBy.includes(userId)) {
        // Remove from likes if exists
        this.interactions.likedBy = this.interactions.likedBy.filter(
          (id) => id.toString() !== userId.toString()
        );
        if (this.interactions.likedBy.length < this.interactions.likes) {
          this.interactions.likes--;
        }

        // Add dislike
        this.interactions.dislikedBy.push(userId);
        this.interactions.dislikes++;
      }
      break;

    case "checkin":
      if (
        !this.interactions.checkedInBy.find(
          (checkin) => checkin.user.toString() === userId.toString()
        )
      ) {
        this.interactions.checkedInBy.push({ user: userId });
        this.interactions.checkins++;
      }
      break;

    default:
      throw new Error("Invalid interaction type");
  }

  // Add impression record
  this.interactions.impressions.push({
    userId: userId,
    storeId: this.slug,
    sectionId: sectionId,
    action: action,
    timestamp: new Date()
  });

  await this.save();
  
  console.log(`[MongoDB storeModel.js line 400] Interaction saved - Likes: ${this.interactions.likes}, Dislikes: ${this.interactions.dislikes}`);
  
  return {
    likes: this.interactions.likes,
    dislikes: this.interactions.dislikes,
    checkins: this.interactions.checkins,
    userLiked: this.interactions.likedBy.includes(userId),
    userDisliked: this.interactions.dislikedBy.includes(userId),
    userCheckedIn: this.interactions.checkedInBy.some(
      (checkin) => checkin.user.toString() === userId.toString()
    )
  };
};

// Create the model with the correct collection name
const StoreModel = mongoose.model("Store02", StoreSchema);

// Export using the original format
export { StoreModel };
///////////////////////// END UPDATED STORE MODEL /////////////////////////