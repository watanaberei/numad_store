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
  storeId: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  title: String,
  
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
  contentful: {
    lastSync: Date,
    data: mongoose.Schema.Types.Mixed
  },
  yelp: {
    lastSync: Date, 
    data: mongoose.Schema.Types.Mixed
  },

  // Sections with history and interactions
  sections: {
    service: {
      content: mongoose.Schema.Types.Mixed,
      history: [SectionHistorySchema],
      interactions: SectionInteractionSchema
    },
    summary: {
      content: mongoose.Schema.Types.Mixed, 
      history: [SectionHistorySchema],
      interactions: SectionInteractionSchema
    },
    // Add other sections...
  },

  // Aggregate metrics
  metrics: {
    neustar: Number,
    totalLikes: { type: Number, default: 0 },
    totalDislikes: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    weightedScore: { type: Number, default: 0 }
  },

  // Timestamps
  lastModified: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Pre-save hook to check validation status
StoreSchema.pre('save', function(next) {
  if (this.validations.length >= 15 && !this.isValidated) {
    this.isValidated = true;
  }
  next();
});

// Method to calculate weighted scores
StoreSchema.methods.calculateWeightedScore = function() {
  // Implement 3:1 weighting of user:base scores
  // Update this.metrics.weightedScore
};

const StoreModel = mongoose.model('Store Collection', StoreSchema);
export { StoreModel };