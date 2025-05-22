// models/storeModel.js
import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  // Basic store information
  title: String,
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  variant: {
    type: String,
    default: 'stores'
  },
  storeAttributes: [mongoose.Schema.Types.Mixed],
  featured: Boolean,
  storeNickname: String,
  
  // Store operations data
  hours: [mongoose.Schema.Types.Mixed],
  storeWebsite: [String],
  storeChain: Boolean,
  neustar: Number,
  
  // Ratings
  googleRatings: [mongoose.Schema.Types.Mixed],
  yelpRatings: [mongoose.Schema.Types.Mixed],
  storeRatings: [mongoose.Schema.Types.Mixed],
  
  // Content sections
  recommendation: [mongoose.Schema.Types.Mixed],
  overviewTitle: String,
  popularTimes: [[mongoose.Schema.Types.Mixed]],
  storeServices: [mongoose.Schema.Types.Mixed],
  
  // Contact information
  handles: [mongoose.Schema.Types.Mixed],
  contact: [mongoose.Schema.Types.Mixed],
  
  // Chain information if applicable
  storeChainStoresCollection: {
    items: [mongoose.Schema.Types.Mixed]
  },
  
  // Display information
  headline: {
    text: String,
    subtext: String,
    eyebrow: String
  },
  
  // Store attributes and categories
  attributes: {
    experiences: [mongoose.Schema.Types.Mixed],
    services: mongoose.Schema.Types.Mixed,
    facility: mongoose.Schema.Types.Mixed,
    location: mongoose.Schema.Types.Mixed
  },
  
  category: {
    categoryType: String,
    genre: String
  },
  
  // Location data
  location: {
    type: {
      type: String,
      enum: ['Store'], 
      default: 'Store'
    },
    geolocation: {
      lat: Number,
      lon: Number
    },
    address: String,
    region: String,
    locatedIn: String
  },
  
  // Content snippets
  snippet: {
    title: String,
    text: String,
    overview: String,
    foundations: String,
    facility: String,
    experience: String,
    service: String,
    location: String,
    hours: String
  },
  
  // Structured content
  content: {
    overview: String,
    experience: mongoose.Schema.Types.Mixed,
    service: mongoose.Schema.Types.Mixed,
    business: mongoose.Schema.Types.Mixed,
    location: mongoose.Schema.Types.Mixed
  },
  
  // Media assets
  media: {
    logo: String,
    hero: String,
    thumbnail: String,
    gallery: [String],
    service: [mongoose.Schema.Types.Mixed],
    area: [mongoose.Schema.Types.Mixed],
    arrangement: mongoose.Schema.Types.Mixed
  },
  
  // Store data sections from StoreScreen
  hero: mongoose.Schema.Types.Mixed,
  overview: mongoose.Schema.Types.Mixed,
  service: mongoose.Schema.Types.Mixed,
  experience: mongoose.Schema.Types.Mixed,
  business: mongoose.Schema.Types.Mixed,
  
  // Original data field for complete storage
  storeData: mongoose.Schema.Types.Mixed,
  
  // User interactions
  interactions: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    checkins: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    checkedInBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Sync metadata
  lastSynced: { type: Date, default: Date.now },
  syncSource: String
}, {
  timestamps: true,
  collection: 'store new'
});

// Add validation middleware
StoreSchema.pre('save', function(next) {
  // Ensure location object is properly formatted
  if (this.location && typeof this.location === 'object') {
    this.location = {
      type: 'Store',
      geolocation: this.location.geolocation || { lat: 0, lon: 0 },
      address: this.location.address || '',
      region: this.location.region || '',
      locatedIn: this.location.locatedIn || null
    };
  }
  
  // Update lastSynced timestamp
  this.lastSynced = new Date();
  
  next();
});

// Add methods for interactions
StoreSchema.methods.handleInteraction = async function(userId, action) {
  const user = await mongoose.model('User').findById(userId);
  if (!user) throw new Error('User not found');

  switch(action) {
    case 'like':
      if (!this.interactions.likedBy.includes(userId)) {
        // Remove from dislikes if exists
        this.interactions.dislikedBy = this.interactions.dislikedBy.filter(id => id.toString() !== userId.toString());
        if (this.interactions.dislikedBy.length < this.interactions.dislikes) {
          this.interactions.dislikes--;
        }
        
        // Add like
        this.interactions.likedBy.push(userId);
        this.interactions.likes++;
      }
      break;

    case 'dislike':
      if (!this.interactions.dislikedBy.includes(userId)) {
        // Remove from likes if exists
        this.interactions.likedBy = this.interactions.likedBy.filter(id => id.toString() !== userId.toString());
        if (this.interactions.likedBy.length < this.interactions.likes) {
          this.interactions.likes--;
        }
        
        // Add dislike
        this.interactions.dislikedBy.push(userId);
        this.interactions.dislikes++;
      }
      break;

    case 'checkin':
      if (!this.interactions.checkedInBy.find(checkin => checkin.user.toString() === userId.toString())) {
        this.interactions.checkedInBy.push({ user: userId });
        this.interactions.checkins++;
      }
      break;

    default:
      throw new Error('Invalid interaction type');
  }

  await this.save();
  return {
    likes: this.interactions.likes,
    dislikes: this.interactions.dislikes,
    checkins: this.interactions.checkins,
    userLiked: this.interactions.likedBy.includes(userId),
    userDisliked: this.interactions.dislikedBy.includes(userId),
    userCheckedIn: this.interactions.checkedInBy.some(checkin => checkin.user.toString() === userId.toString())
  };
};

const StoreSchema = mongoose.model('store new', StoreSchema);
export { StoreSchema };