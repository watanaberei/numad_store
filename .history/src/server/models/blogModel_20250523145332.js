// src/server/models/blogModel.js - Fixed version
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    // Required identifier fields
    slugBlog: {
      type: String,
      required: true,
      unique: true
      // Removed index: true to prevent duplicate index warning
    },
    title: {
      type: String,
      required: true
    },
    
    // Content sections
    content: {
      introduction: String,
      body: String,
      conclusion: String,
      postscript: String,
      stores: [String],
      blocks: [mongoose.Schema.Types.Mixed], // For the new block-based content
      template: {
        type: String,
        enum: ['freestyle', 'top3'],
        default: 'freestyle'
      }
    },
    
    // Author information
    author: {
      name: String,
      slugAuthor: String,
      social: String,
      email: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    
    // Content metadata
    headline: {
      text: String,
      subtext: String,
      eyebrow: String
    },
    
    snippet: {
      text: String,
      subtext: String
    },
    
    // Blog attributes and categories
    category: {
      category: {
        type: String,
        enum: ['dine', 'work', 'stay', 'play'],
        default: 'dine'
      },
      categoryType: String,
      genre: String
    },
    
    // Display information
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'draft'
    },
    
    // Related content
    series: {
      series: String,
      seriesName: String
    },
    
    // Media assets
    media: {
      hero: String,
      thumbnail: String,
      gallery: [String]
    },
    
    // Tags
    tag: [{
      tags: [String]
    }],
    
    // Location reference
    location: {
      geolocation: {
        lat: { type: Number, default: 0 },
        lon: { type: Number, default: 0 }
      },
      address: String,
      region: String
    },
    
    // Publication information
    publishedAt: {
      type: Date,
      default: null
    },
    
    // Summary
    summary: {
      text: [String],
      best: [String]
    },
    
    // User interactions
    interactions: {
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      comments: [
        {
          author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          authorName: String,
          content: String,
          timestamp: { type: Date, default: Date.now },
          likes: { type: Number, default: 0 }
        }
      ],
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    
    // Blog settings
    settings: {
      public: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      autosave: { type: Boolean, default: false }
    },
    
    // Creation and update info
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
    variant: {
      type: String,
      default: "blogs"
    }
  },
  {
    timestamps: true,
    collection: "Blog",
    strict: false
  }
);

// Add indexes manually (only once each)
// BlogSchema.index({ slugBlog: 1 }, { unique: true });
BlogSchema.index( { unique: true });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ 'category.category': 1 });
BlogSchema.index({ 'tag.tags': 1 });
BlogSchema.index({ createdBy: 1 });

// Pre-save middleware
BlogSchema.pre("save", function (next) {
  console.log(`[MongoDB] Saving blog: ${this.slugBlog}`);
  this.updatedAt = new Date();
  
  // Auto-generate slug if not provided
  if (!this.slugBlog && this.title) {
    this.slugBlog = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  // Set publishedAt when status changes to published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Clear publishedAt if status changes from published
  if (this.status !== 'published' && this.publishedAt) {
    this.publishedAt = null;
  }
  
  next();
});

// Post-save middleware
BlogSchema.post("save", function (doc) {
  console.log(`[MongoDB] Blog saved: ${doc.slugBlog} (ID: ${doc._id})`);
});

// Post-update middleware
BlogSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    console.log(`[MongoDB] Blog updated: ${doc.slugBlog} (ID: ${doc._id})`);
  }
});

// Instance methods
BlogSchema.methods.addComment = function(userId, content, authorName) {
  this.interactions.comments.push({
    author: userId,
    authorName: authorName,
    content: content,
    timestamp: new Date()
  });
  return this.save();
};

BlogSchema.methods.toggleLike = function(userId) {
  const likedIndex = this.interactions.likedBy.indexOf(userId);
  const dislikedIndex = this.interactions.dislikedBy.indexOf(userId);
  
  if (likedIndex > -1) {
    // User already liked, remove like
    this.interactions.likedBy.splice(likedIndex, 1);
    this.interactions.likes = Math.max(0, this.interactions.likes - 1);
  } else {
    // Add like
    this.interactions.likedBy.push(userId);
    this.interactions.likes++;
    
    // Remove dislike if exists
    if (dislikedIndex > -1) {
      this.interactions.dislikedBy.splice(dislikedIndex, 1);
      this.interactions.dislikes = Math.max(0, this.interactions.dislikes - 1);
    }
  }
  
  return this.save();
};

BlogSchema.methods.incrementViews = function() {
  this.interactions.views++;
  return this.save();
};

// Static methods
BlogSchema.statics.findPublished = function(options = {}) {
  const { 
    category, 
    tag, 
    limit = 10, 
    skip = 0, 
    sort = { publishedAt: -1 } 
  } = options;
  
  let query = { status: 'published' };
  
  if (category) {
    query['category.category'] = category;
  }
  
  if (tag) {
    query['tag.tags'] = tag;
  }
  
  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('createdBy', 'email firstName lastName')
    .lean();
};

BlogSchema.statics.findByslugBlog = function(slugBlog) {
  return this.findOne({ slugBlog })
    .populate('createdBy', 'email firstName lastName')
    .populate('interactions.comments.author', 'email firstName lastName');
};

BlogSchema.statics.getRelated = function(blogId, category, limit = 3) {
  return this.find({
    _id: { $ne: blogId },
    status: 'published',
    'category.category': category
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slugBlog media.thumbnail category publishedAt')
  .lean();
};

const BlogModel = mongoose.model("Blog", BlogSchema);

export { BlogModel };