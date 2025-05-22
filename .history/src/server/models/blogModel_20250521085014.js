// src/server/models/blogModel.js
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    // Required identifier fields
    slug: {
      type: String,
      required: true,
      unique: true
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
      stores: [String]
    },
    
    // Author information
    author: {
      name: String,
      slug: String,
      social: String,
      email: String
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
      category: String,
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
        lat: Number,
        lon: Number
      },
      address: String,
      region: String
    },
    
    // Publication information
    publishedAt: {
      type: Date,
      default: Date.now
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
          content: String,
          timestamp: { type: Date, default: Date.now },
          likes: { type: Number, default: 0 }
        }
      ],
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
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

// Log operations on blogs
BlogSchema.pre("save", function (next) {
  console.log(`[MongoDB] Saving blog: ${this.slug}`);
  this.updatedAt = new Date();
  next();
});

BlogSchema.post("save", function (doc) {
  console.log(`[MongoDB] Blog saved: ${doc.slug} (ID: ${doc._id})`);
});

BlogSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    console.log(`[MongoDB] Blog updated: ${doc.slug} (ID: ${doc._id})`);
  }
});

const BlogModel = mongoose.model("Blog", BlogSchema);

export { BlogModel };