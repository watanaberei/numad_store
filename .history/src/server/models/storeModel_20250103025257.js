// models/storeModel.js
import mongoose from 'mongoose';

// MongoDB Schema Definition
const storeSchema = new mongoose.Schema({
  sys: mongoose.Schema.Types.Mixed,
  title: String,
  slug: { type: String, required: true, unique: true },
  storeAttributes: [String],
  featured: Boolean,
  attributes: {
    experiences: [mongoose.Schema.Types.Mixed],
    services: mongoose.Schema.Types.Mixed,
    facility: [mongoose.Schema.Types.Mixed],
    location: mongoose.Schema.Types.Mixed
  },
  category: {
    categoryType: String,
    genre: String
  },
  contact: [mongoose.Schema.Types.Mixed],
  content: {
    overview: String
  },
  googleRatings: [mongoose.Schema.Types.Mixed],
  handles: [mongoose.Schema.Types.Mixed],
  headline: {
    text: String,
    subtext: String,
    eyebrow: mongoose.Schema.Types.Mixed
  },
  hours: [mongoose.Schema.Types.Mixed],
  location: {
    type: { type: String, default: 'Store' },
    geolocation: {
      lat: Number,
      lon: Number
    },
    address: String,
    region: String,
    locatedIn: mongoose.Schema.Types.Mixed
  },
  media: {
    logo: String,
    hero: String,
    thumbnail: String,
    gallery: [String],
    service: [String]
  },
  nearbyStore: [mongoose.Schema.Types.Mixed],
  nearbyStoresCollection: {
    items: [mongoose.Schema.Types.Mixed]
  },
  neustar: Number,
  overview: {
    type: String,
    text: String
  },
  overviewTitle: String,
  popularTimes: [mongoose.Schema.Types.Mixed],
  publishedAt: Date,
  ratings: [mongoose.Schema.Types.Mixed],
  recommendation: [mongoose.Schema.Types.Mixed],
  series: {
    seriesName: String
  },
  snippet: {
    title: String,
    text: String,
    overview: String,
    foundations: String
  },
  // Additional fields from your existing schema
  yelpId: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  lastYelpSync: { type: Date, default: Date.now },
  interactions: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    checkIns: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  indexes: [
    { slug: 1, unique: true },
    { 'location.region': 1 },
    { featured: 1 },
    { createdAt: -1 }
  ]
});

// Instance methods
storeSchema.methods.getYelpParams = function() {
  return {
    storeName: this.headline.text,
    storeAddress: this.location.address,
    storeCity: this.location.region,
    storeState: 'CA' // TODO: Extract from address
  };
};

// Static methods
storeSchema.statics.fromContentfulData = function(data) {
  return new this(data);
};

// Export only the Store model and schema
const Store = mongoose.model('Store', storeSchema);
export { Store, storeSchema };

// Add method to update interactions
storeSchema.methods.updateInteractions = async function(action) {
  if (action === 'like') {
    this.interactions.likes++;
  } else if (action === 'dislike') {
    this.interactions.dislikes++;
  }
  this.interactions.lastInteraction = Date.now();
  await this.save();
};