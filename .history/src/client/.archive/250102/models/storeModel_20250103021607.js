// models/storeModel.js
import mongoose from 'mongoose';



export class StoreModel {
  constructor(data = {}) {
    this.sys = data.sys || {};
    this.title = data.title || '';
    this.slug = data.slug || '';
    this.storeAttributes = data.storeAttributes || [];
    this.featured = data.featured || false;
    this.attributes = {
      experiences: data.attributes?.experiences || [],
      services: data.attributes?.services || null,
      facility: data.attributes?.facility || [],
      location: data.attributes?.location || null
    };
    this.category = {
      categoryType: data.category?.categoryType || '',
      genre: data.category?.genre || ''
    };
    this.contact = data.contact || [];
    this.content = {
      overview: data.content?.overview || ''
    };
    this.googleRatings = data.googleRatings || [];
    this.handles = data.handles || [];
    this.headline = {
      text: data.headline?.text || '',
      subtext: data.headline?.subtext || '',
      eyebrow: data.headline?.eyebrow || null
    };
    this.hours = data.hours || [];
    this.location = {
      type: data.location?.type || 'Store',
      geolocation: data.location?.geolocation || {},
      address: data.location?.address || '',
      region: data.location?.region || '',
      locatedIn: data.location?.locatedIn || null
    };
    this.media = {
      logo: data.media?.logo || '',
      hero: data.media?.hero || '',
      thumbnail: data.media?.thumbnail || '',
      gallery: data.media?.gallery || [],
      service: data.media?.service || []
    };
    this.nearbyStore = data.nearbyStore || [];
    this.nearbyStoresCollection = {
      items: data.nearbyStoresCollection?.items || []
    };
    this.neustar = data.neustar || 0;
    this.overview = {
      type: data.overview?.type,
      text: data.overview?.text || ''
    };
    this.overviewTitle = data.overviewTitle || '';
    this.popularTimes = data.popularTimes || [];
    this.publishedAt = data.publishedAt;
    this.ratings = data.ratings || [];
    this.recommendation = data.recommendation || [];
    this.series = {
      seriesName: data.series?.seriesName
    };
    this.snippet = {
      title: data.snippet?.title || '',
      text: data.snippet?.text || '',
      overview: data.snippet?.overview || '',
      foundations: data.snippet?.foundations || ''
    };
  }

  // Helper method to convert store data to model instance
  static fromData(data) {
    return new StoreModel(data);
  }

  // Helper method to get store params for Yelp API
  getYelpParams() {
    return {
      storeName: this.headline.text,
      storeAddress: this.location.address,
      storeCity: this.location.region,
      storeState: 'CA' // TODO: Extract from address
    };
  }
}

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