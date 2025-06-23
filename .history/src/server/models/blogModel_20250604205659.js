// src/server/models/blogModel.js - Fixed version
import mongoose from "mongoose";

// IMPROVED: Blog Schema (keeping your existing structure)
const BlogSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    // unique: true,
    // trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    default: 'blogs'
  },
  
  // Blog content structure
  snippet: {
    text: String
  },
  category: {
    category: {
      type: String,
      default: 'dine'
    }
  },
  content: {
    introduction: String,
    body: String,
    conclusion: String,
    stores: String,
    postscript: String,
    blocks: [{
      id: String,
      type: String,
      order: Number,
      content: mongoose.Schema.Types.Mixed
    }]
  },
  media: {
    hero: String,
    thumbnail: String,
    gallery: [String]
  },
  tag: [{
    tags: [String]
  }],
  author: {
    id: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    slug: String,
    social: String
  },
  series: {
    series: String
  },
  summary: {
    text: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  template: {
    type: String,
    default: 'freestyle'
  },
  settings: {
    public: {
      type: Boolean,
      default: true
    },
    comments: {
      type: Boolean,
      default: true
    },
    autosave: {
      type: Boolean,
      default: false
    }
  },
  
  // Interaction tracking
  interactions: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'blogs',
  strict: false
});


// Blog indexes
BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ status: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ 'author.id': 1 });
BlogSchema.index({ 'category.category': 1 });
BlogSchema.index({ 'tag.tags': 1 });
BlogSchema.index({ createdBy: 1 });


// Pre-save middleware
BlogSchema.pre("save", function (next) {
  console.log(`[MongoDB] Saving blog: ${this.slug}`);
  this.updatedAt = new Date();
  
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
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

// Update the post-save middleware:
BlogSchema.post("save", function (doc) {
  console.log(`[MongoDB] Blog saved: ${doc.slug} (ID: ${doc._id})`);
});

BlogSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    console.log(`[MongoDB] Blog updated: ${doc.slug} (ID: ${doc._id})`);
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

// Update the static methods:
BlogSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug })
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
  .select('title blog media.thumbnail category publishedAt')
  .lean();
};

const BlogModel = mongoose.model("Blog", BlogSchema);

export { BlogModel };