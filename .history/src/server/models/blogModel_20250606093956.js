// src/server/models/blogModel.js - Fixed version
///////////////////////// START FIXED BLOG MODEL /////////////////////////
// src/server/models/blogModel.js - FIXED VERSION that resolves duplicate key issues

import mongoose from "mongoose";

console.log('[BlogModel] Loading blog model with fixed indexing');

// FIXED: Blog Schema with proper indexing to avoid duplicate key errors
const BlogSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    trim: true,
    // REMOVED: unique: true - we'll handle this with a custom index
    validate: {
      validator: function(slug) {
        return slug && slug.length > 0 && slug !== 'null' && slug !== 'undefined';
      },
      message: 'Slug must be a valid non-empty string'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title must be no more than 200 characters']
  },
  variant: {
    type: String,
    default: 'blogs'
  },
  
  // Blog content structure
  snippet: {
    text: {
      type: String,
      maxlength: [500, 'Snippet must be no more than 500 characters']
    }
  },
  category: {
    category: {
      type: String,
      enum: ['dine', 'work', 'stay', 'play'],
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
    gallery: [{
      type: String,
      validate: {
        validator: function(url) {
          return !url || /^https?:\/\/.+/.test(url);
        },
        message: 'Gallery items must be valid URLs'
      }
    }]
  },
  tag: [{
    tags: [{
      type: String,
      trim: true
    }]
  }],
  author: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    username: String,
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
    enum: ['freestyle', 'top3'],
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
  
  // Location data for mapping
  location: {
    type: {
      type: String,
      default: 'Blog'
    },
    geolocation: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lon: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    address: String,
    region: String
  },
  
  // Interaction tracking
  interactions: {
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    comments: {
      type: Number,
      default: 0,
      min: 0
    },
    likedBy: [{
      type: String // User IDs
    }],
    dislikedBy: [{
      type: String // User IDs
    }]
  },
  
  // Comments array
  comments: [{
    author: String,
    authorName: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: null
  },
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
  collection: 'Blog',
  strict: false, // Allow additional fields for flexibility
  minimize: false,
  versionKey: false
});

// FIXED: Create a SPARSE unique index on slug to handle null values properly
// Sparse indexes skip documents where the indexed field is null/undefined
BlogSchema.index({ slug: 1 }, { 
  unique: true, 
  sparse: true, // This is the key fix - allows multiple null values
  background: true,
  name: 'slug_unique_sparse'
});

// FIXED: Additional indexes for performance
BlogSchema.index({ status: 1 }, { background: true });
BlogSchema.index({ status: 1, publishedAt: -1 }, { background: true });
BlogSchema.index({ 'author.id': 1 }, { background: true });
BlogSchema.index({ 'author.id': 1, status: 1 }, { background: true });
BlogSchema.index({ 'category.category': 1 }, { background: true });
BlogSchema.index({ 'tag.tags': 1 }, { background: true });
BlogSchema.index({ publishedAt: -1 }, { background: true });
BlogSchema.index({ createdAt: -1 }, { background: true });

// Compound indexes for common queries
BlogSchema.index({ 
  status: 1, 
  'settings.public': 1, 
  publishedAt: -1 
}, { background: true });

BlogSchema.index({ 
  'category.category': 1, 
  status: 1, 
  publishedAt: -1 
}, { background: true });

// FIXED: Pre-save middleware with better error handling
BlogSchema.pre("save", function (next) {
  const blog = this;
  
  console.log(`[BlogModel] Pre-save middleware for blog: ${blog.title || 'Untitled'}`);
  
  try {
    // Update timestamps
    blog.updatedAt = new Date();
    blog.lastUpdated = new Date();
    
    // FIXED: Generate slug if not provided or invalid
    if (!blog.slug || blog.slug === 'null' || blog.slug === 'undefined' || blog.slug.trim() === '') {
      if (blog.title) {
        blog.slug = blog.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim('-') // Remove leading/trailing hyphens
          .substring(0, 100); // Limit length
        
        console.log(`[BlogModel] Generated slug: ${blog.slug}`);
      } else {
        // If no title, generate a unique slug
        blog.slug = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        console.log(`[BlogModel] Generated random slug: ${blog.slug}`);
      }
    }
    
    // Ensure slug is not empty after processing
    if (!blog.slug || blog.slug.trim() === '') {
      blog.slug = `blog-${Date.now()}`;
      console.log(`[BlogModel] Fallback slug generated: ${blog.slug}`);
    }
    
    // FIXED: Set publishedAt when status changes to published
    if (blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
      console.log(`[BlogModel] Set publishedAt for: ${blog.title}`);
    }
    
    // Clear publishedAt if status changes from published
    if (blog.status !== 'published' && blog.publishedAt) {
      blog.publishedAt = null;
      console.log(`[BlogModel] Cleared publishedAt for: ${blog.title}`);
    }
    
    // Validate author information
    if (!blog.author || !blog.author.id || !blog.author.email) {
      const error = new Error('Blog must have valid author information');
      error.context = 'Missing author data';
      return next(error);
    }
    
    // Ensure interactions object exists
    if (!blog.interactions) {
      blog.interactions = {
        views: 0,
        likes: 0,
        comments: 0,
        likedBy: [],
        dislikedBy: []
      };
    }
    
    // Clean up arrays to prevent unlimited growth
    if (blog.interactions.likedBy && blog.interactions.likedBy.length > 10000) {
      console.log(`[BlogModel] Trimming likedBy array for blog: ${blog.slug}`);
      blog.interactions.likedBy = blog.interactions.likedBy.slice(-10000);
    }
    
    if (blog.interactions.dislikedBy && blog.interactions.dislikedBy.length > 10000) {
      console.log(`[BlogModel] Trimming dislikedBy array for blog: ${blog.slug}`);
      blog.interactions.dislikedBy = blog.interactions.dislikedBy.slice(-10000);
    }
    
    if (blog.comments && blog.comments.length > 1000) {
      console.log(`[BlogModel] Trimming comments array for blog: ${blog.slug}`);
      blog.comments = blog.comments.slice(-1000);
    }
    
    next();
  } catch (error) {
    console.error(`[BlogModel] Error in pre-save middleware:`, error);
    next(error);
  }
});

// FIXED: Post-save middleware with better logging
BlogSchema.post("save", function (doc, next) {
  console.log(`[BlogModel] Blog saved successfully: ${doc.title} (Slug: ${doc.slug}, ID: ${doc._id})`);
  next();
});

BlogSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    console.log(`[BlogModel] Blog updated: ${doc.title} (Slug: ${doc.slug}, ID: ${doc._id})`);
  }
});

// FIXED: Error handling for save operations
BlogSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    console.error('[BlogModel] Duplicate key error:', error);
    if (error.message.includes('slug')) {
      next(new Error('A blog with this slug already exists'));
    } else {
      next(new Error('Duplicate entry detected'));
    }
  } else {
    console.error('[BlogModel] Save error:', error);
    next(error);
  }
});

// FIXED: Error handling for update operations
BlogSchema.post('findOneAndUpdate', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    console.error('[BlogModel] Duplicate key error on update:', error);
    if (error.message.includes('slug')) {
      next(new Error('A blog with this slug already exists'));
    } else {
      next(new Error('Duplicate entry detected'));
    }
  } else if (error) {
    console.error('[BlogModel] Update error:', error);
    next(error);
  } else {
    next();
  }
});

// Instance methods
BlogSchema.methods.addComment = function(userId, content, authorName) {
  if (!this.comments) {
    this.comments = [];
  }
  
  this.comments.push({
    author: userId,
    authorName: authorName || 'Anonymous',
    content: content,
    timestamp: new Date()
  });
  
  // Update comments count
  this.interactions.comments = this.comments.length;
  
  return this.save();
};

BlogSchema.methods.toggleLike = function(userId) {
  if (!this.interactions.likedBy) {
    this.interactions.likedBy = [];
  }
  if (!this.interactions.dislikedBy) {
    this.interactions.dislikedBy = [];
  }
  
  const likedIndex = this.interactions.likedBy.indexOf(userId);
  const dislikedIndex = this.interactions.dislikedBy.indexOf(userId);
  
  if (likedIndex > -1) {
    // User already liked, remove like
    this.interactions.likedBy.splice(likedIndex, 1);
    this.interactions.likes = Math.max(0, this.interactions.likes - 1);
  } else {
    // Add like
    this.interactions.likedBy.push(userId);
    this.interactions.likes = (this.interactions.likes || 0) + 1;
    
    // Remove dislike if exists
    if (dislikedIndex > -1) {
      this.interactions.dislikedBy.splice(dislikedIndex, 1);
    }
  }
  
  return this.save();
};

BlogSchema.methods.incrementViews = function() {
  this.interactions.views = (this.interactions.views || 0) + 1;
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
  
  let query = { 
    status: 'published',
    'settings.public': true
  };
  
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
    .lean()
    .maxTimeMS(10000);
};

BlogSchema.statics.findBySlug = function(slug) {
  if (!slug) {
    return Promise.resolve(null);
  }
  
  return this.findOne({ slug })
    .maxTimeMS(10000);
};

BlogSchema.statics.getRelated = function(blogId, category, limit = 3) {
  return this.find({
    _id: { $ne: blogId },
    status: 'published',
    'settings.public': true,
    'category.category': category
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug media.thumbnail category publishedAt')
  .lean()
  .maxTimeMS(10000);
};

// FIXED: Add method to check for duplicate slugs before save
BlogSchema.statics.isSlugAvailable = async function(slug, excludeId = null) {
  if (!slug) return false;
  
  const query = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingBlog = await this.findOne(query).select('_id').lean();
  return !existingBlog;
};

// FIXED: Add method to generate unique slug
BlogSchema.statics.generateUniqueSlug = async function(title, excludeId = null) {
  if (!title) {
    throw new Error('Title is required to generate slug');
  }
  
  let baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 90); // Leave room for suffix
  
  if (!baseSlug) {
    baseSlug = 'blog';
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await this.isSlugAvailable(slug, excludeId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
};

// Create the model
const BlogModel = mongoose.model("Blog", BlogSchema);

// FIXED: Handle initial index creation errors
BlogModel.on('index', (error) => {
  if (error) {
    console.error('[BlogModel] Index creation error:', error.message);
    if (error.code === 11000 && error.message.includes('BlogSlug')) {
      console.log('[BlogModel] Attempting to fix BlogSlug index issue...');
      // The sparse index should resolve this automatically
    }
  } else {
    console.log('[BlogModel] All indexes created successfully');
  }
});

export { BlogModel };

///////////////////////// END FIXED BLOG MODEL /////////////////////////











// import mongoose from "mongoose";

// // IMPROVED: Blog Schema (keeping your existing structure)
// const BlogSchema = new mongoose.Schema({
//   slug: {
//     type: String,
//     required: true,
//     // unique: true,
//     // trim: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   variant: {
//     type: String,
//     default: 'blogs'
//   },
  
//   // Blog content structure
//   snippet: {
//     text: String
//   },
//   category: {
//     category: {
//       type: String,
//       default: 'dine'
//     }
//   },
//   content: {
//     introduction: String,
//     body: String,
//     conclusion: String,
//     stores: String,
//     postscript: String,
//     blocks: [{
//       id: String,
//       type: String,
//       order: Number,
//       content: mongoose.Schema.Types.Mixed
//     }]
//   },
//   media: {
//     hero: String,
//     thumbnail: String,
//     gallery: [String]
//   },
//   tag: [{
//     tags: [String]
//   }],
//   author: {
//     id: {
//       type: String,
//       required: true
//     },
//     name: String,
//     email: String,
//     slug: String,
//     social: String
//   },
//   series: {
//     series: String
//   },
//   summary: {
//     text: [String]
//   },
//   status: {
//     type: String,
//     enum: ['draft', 'published', 'archived'],
//     default: 'draft'
//   },
//   template: {
//     type: String,
//     default: 'freestyle'
//   },
//   settings: {
//     public: {
//       type: Boolean,
//       default: true
//     },
//     comments: {
//       type: Boolean,
//       default: true
//     },
//     autosave: {
//       type: Boolean,
//       default: false
//     }
//   },
  
//   // Interaction tracking
//   interactions: {
//     views: {
//       type: Number,
//       default: 0
//     },
//     likes: {
//       type: Number,
//       default: 0
//     },
//     comments: {
//       type: Number,
//       default: 0
//     }
//   },
  
//   // Timestamps
//   publishedAt: Date,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   },
//   lastUpdated: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true,
//   collection: 'Blog',
//   strict: false
// });


// // Blog indexes
// BlogSchema.index({ slug: 1 }, { unique: true });
// BlogSchema.index({ status: 1 });
// BlogSchema.index({ publishedAt: -1 });
// BlogSchema.index({ 'author.id': 1 });
// BlogSchema.index({ 'category.category': 1 });
// BlogSchema.index({ 'tag.tags': 1 });
// BlogSchema.index({ createdBy: 1 });


// // Pre-save middleware
// BlogSchema.pre("save", function (next) {
//   console.log(`[MongoDB] Saving blog: ${this.slug}`);
//   this.updatedAt = new Date();
  
//   // Auto-generate slug if not provided
//   if (!this.slug && this.title) {
//     this.slug = this.title
//       .toLowerCase()
//       .replace(/[^\w\s]/gi, '')
//       .replace(/\s+/g, '-')
//       .substring(0, 50);
//   }
  
//   // Set publishedAt when status changes to published
//   if (this.status === 'published' && !this.publishedAt) {
//     this.publishedAt = new Date();
//   }
  
//   // Clear publishedAt if status changes from published
//   if (this.status !== 'published' && this.publishedAt) {
//     this.publishedAt = null;
//   }
  
//   next();
// });

// // Update the post-save middleware:
// BlogSchema.post("save", function (doc) {
//   console.log(`[MongoDB] Blog saved: ${doc.slug} (ID: ${doc._id})`);
// });

// BlogSchema.post("findOneAndUpdate", function (doc) {
//   if (doc) {
//     console.log(`[MongoDB] Blog updated: ${doc.slug} (ID: ${doc._id})`);
//   }
// });

// // Instance methods
// BlogSchema.methods.addComment = function(userId, content, authorName) {
//   this.interactions.comments.push({
//     author: userId,
//     authorName: authorName,
//     content: content,
//     timestamp: new Date()
//   });
//   return this.save();
// };

// BlogSchema.methods.toggleLike = function(userId) {
//   const likedIndex = this.interactions.likedBy.indexOf(userId);
//   const dislikedIndex = this.interactions.dislikedBy.indexOf(userId);
  
//   if (likedIndex > -1) {
//     // User already liked, remove like
//     this.interactions.likedBy.splice(likedIndex, 1);
//     this.interactions.likes = Math.max(0, this.interactions.likes - 1);
//   } else {
//     // Add like
//     this.interactions.likedBy.push(userId);
//     this.interactions.likes++;
    
//     // Remove dislike if exists
//     if (dislikedIndex > -1) {
//       this.interactions.dislikedBy.splice(dislikedIndex, 1);
//       this.interactions.dislikes = Math.max(0, this.interactions.dislikes - 1);
//     }
//   }
  
//   return this.save();
// };

// BlogSchema.methods.incrementViews = function() {
//   this.interactions.views++;
//   return this.save();
// };

// // Static methods
// BlogSchema.statics.findPublished = function(options = {}) {
//   const { 
//     category, 
//     tag, 
//     limit = 10, 
//     skip = 0, 
//     sort = { publishedAt: -1 } 
//   } = options;
  
//   let query = { status: 'published' };
  
//   if (category) {
//     query['category.category'] = category;
//   }
  
//   if (tag) {
//     query['tag.tags'] = tag;
//   }
  
//   return this.find(query)
//     .sort(sort)
//     .limit(limit)
//     .skip(skip)
//     .populate('createdBy', 'email firstName lastName')
//     .lean();
// };

// // Update the static methods:
// BlogSchema.statics.findBySlug = function(slug) {
//   return this.findOne({ slug })
//     .populate('createdBy', 'email firstName lastName')
//     .populate('interactions.comments.author', 'email firstName lastName');
// };

// BlogSchema.statics.getRelated = function(blogId, category, limit = 3) {
//   return this.find({
//     _id: { $ne: blogId },
//     status: 'published',
//     'category.category': category
//   })
//   .sort({ publishedAt: -1 })
//   .limit(limit)
//   .select('title blog media.thumbnail category publishedAt')
//   .lean();
// };

// const BlogModel = mongoose.model("Blog", BlogSchema);

// export { BlogModel };