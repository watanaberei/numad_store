// models/storeModel.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  address: String,
  city: { type: String, index: true },
  area: String,
  state: String,
  zip: String,
  attribute: {
    geotags: [{
      title: String,
      attributes: [{
        label: String,
        score: Number,
        count: Number
      }]
    }]
  }
});

const detailsSchema = new mongoose.Schema({
  rating: String,
  costEstimate: String,
  storeType: String,
  distance: String,
  distanceMiles: String,
  status: String
});

const gallerySchema = new mongoose.Schema({
  hero: {
    url: String,
    gallery: [String]
  },
  area: {
    outside: {
      title: String,
      url: String,
      gallery: [String]
    },
    entrance: {
      title: String,
      url: String,
      gallery: [String]
    },
    main: {
      title: String,
      url: String,
      gallery: [String]
    }
    // ... other areas
  }
});

const storeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true 
  },
  yelpId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  location: locationSchema,
  details: detailsSchema,
  gallery: gallerySchema,
  overview: [{
    header: String,
    summary: mongoose.Schema.Types.Mixed,
    text: mongoose.Schema.Types.Mixed,
    footer: mongoose.Schema.Types.Mixed
  }],
  service: [{
    header: String,
    attributes: mongoose.Schema.Types.Mixed,
    text: mongoose.Schema.Types.Mixed,
    footer: mongoose.Schema.Types.Mixed
  }],
  experience: [{
    header: String,
    area: mongoose.Schema.Types.Mixed,
    attribute: mongoose.Schema.Types.Mixed,
    text: mongoose.Schema.Types.Mixed,
    footer: mongoose.Schema.Types.Mixed
  }],
  business: [{
    header: String,
    area: mongoose.Schema.Types.Mixed,
    attribute: mongoose.Schema.Types.Mixed,
    text: mongoose.Schema.Types.Mixed,
    footer: mongoose.Schema.Types.Mixed
  }],
  lastYelpSync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for common queries
storeSchema.index({ 'location.city': 1, 'details.rating': -1 });
storeSchema.index({ 'details.storeType': 1 });
storeSchema.index({ createdAt: -1 });

export default mongoose.model('Store', storeSchema);