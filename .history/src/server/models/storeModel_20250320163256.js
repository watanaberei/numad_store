// models/storeModel.js
import mongoose from 'mongoose';

const SectionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
  timestamp: { type: Date, default: Date.now },
  content: mongoose.Schema.Types.Mixed,
  requestId: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

const SectionInteractionSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
    rating: { type: Number, min: 1, max: 3 },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
});


const StoreSchema = new mongoose.Schema({
  // Core store info
  sys: {
    id: String
  },
  title: String,
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
   
  // Validation tracking
  validations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
    timestamp: { type: Date, default: Date.now }
  }],
  isValidated: {
    type: Boolean,
    default: false
  },

  // Source data
  storeAttributes: [mongoose.Schema.Types.Mixed],
  featured: Boolean,
  storeNickname: String,
  hours: [mongoose.Schema.Types.Mixed],
  storeWebsite: [String],
  storeChain: Boolean,
  neustar: Number,
  googleRatings: [mongoose.Schema.Types.Mixed],
  yelpRatings: [mongoose.Schema.Types.Mixed],
  storeRatings: [mongoose.Schema.Types.Mixed],
  recommendation: [mongoose.Schema.Types.Mixed],
  overviewTitle: String,
  popularTimes: [[mongoose.Schema.Types.Mixed]],
  storeServices: [mongoose.Schema.Types.Mixed],
  handles: [mongoose.Schema.Types.Mixed],
  contact: [mongoose.Schema.Types.Mixed],
  storeChainStoresCollection: {
    items: [mongoose.Schema.Types.Mixed]
  },
  headline: {
    text: String,
    subtext: String,
    eyebrow: String
  },
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
  location: {
    type: {
      type: String,
      enum: ['Store'], // Restrict to 'Store' type
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
  content: {
    overview: String
  },
  media: {
    logo: String,
    hero: String,
    thumbnail: String,
    gallery: [mongoose.Schema.Types.Mixed],
    service: [mongoose.Schema.Types.Mixed],
    area: [mongoose.Schema.Types.Mixed],
    arrangement: mongoose.Schema.Types.Mixed
  },
  variant: String,
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
  }
}, {
  timestamps: true,
  collection: 'Store' // Changed collection name
});

// Add validation
// Pre-save hook to check validation status
StoreSchema.pre('save', function(next) {
  if (this.validations.length >= 15 && !this.isValidated) {
    this.isValidated = true;
  }
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
  next();
});

// Method to calculate weighted scores
StoreSchema.methods.calculateWeightedScore = function() {
  // Calculate user score from likes/dislikes
  const totalInteractions = this.totalLikes + this.totalDislikes;
  const userScore = totalInteractions > 0 ? 
    (this.totalLikes / totalInteractions) * 5 : // Scale to 0-5 range
    0;

  // Get base score (Yelp rating 0-5)
  const baseScore = this.metrics?.yelpRating || 0;

  // Apply 3:1 weighting
  const weightedScore = ((userScore * 3) + baseScore) / 4;

  // Update metrics object if it doesn't exist
  if (!this.metrics) {
    this.metrics = {};
  }

  // Update the weightedScore
  this.metrics.weightedScore = weightedScore;
  this.markModified('metrics'); // Mark metrics as modified for Mongoose

  // Log calculation for debugging
  console.log('[calculateWeightedScore]', {
    userScore,
    baseScore, 
    weightedScore,
    totalLikes: this.totalLikes,
    totalDislikes: this.totalDislikes,
    updatedMetrics: this.metrics
  });

  return weightedScore;
};

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

const StoreModel = mongoose.model('Store', StoreSchema);
export { StoreModel };