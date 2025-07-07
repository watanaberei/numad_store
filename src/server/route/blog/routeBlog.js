// src/server/route/routeBlog.js
import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { BlogModel } from '../../models/blogModel.js';
import { UserModel } from '../../models/userModel.js';

const routeBlog = express.Router();

console.log('[BlogAPI] Loading blog routes with new endpoints for BlogScreen');

// Helper function to generate slug from title
const generateSlug = (title) => {
  if (!title) return null;
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/blog/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[BlogAPI] No token provided');
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.log('[BlogAPI] Token verification failed:', err.message);
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  
    try {
      // Get full user data
      const userData = await UserModel.findOne({ email: decoded.email })
        .select('_id email username firstName lastName')
        .maxTimeMS(5000);

      if (!userData) {
        console.log('[BlogAPI] User not found for token');
        return res.status(403).json({ success: false, error: 'User not found' });
      }

      req.user = {
        id: userData._id.toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      console.log('[BlogAPI] Token verified for user:', req.user.username);
      
      next();
    } catch (error) {
      console.error('[BlogAPI] Error fetching user data:', error);
      return res.status(500).json({ success: false, error: 'Authentication failed' });
    }
  });
};

// This is the main endpoint for BlogScreen: /:username/blog/:slug
// 1. GET SINGLE BLOG BY SLUG
routeBlog.get('/@:username/:slug', async (req, res) => {
  try {
    const { username, slug } = req.params;
    console.log(`[BlogAPI] Getting blog by username: ${username}, slug: ${slug}`);

    // Find blog by slug and verify author - CASE INSENSITIVE
    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    }).maxTimeMS(10000);

    if (!blog) {
      console.log(`[BlogAPI] Blog not found: ${username}/${slug}`);
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    console.log(`[BlogAPI] Blog found: ${blog.title} by ${blog.author.username}`);
    
    res.json({ 
      success: true, 
      blog: blog.toObject() 
    });

  } catch (error) {
    console.error('[BlogAPI] Error getting blog:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch blog' 
    });
  }
});


routeBlog.post('/@:username/:slug?', authenticateToken, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      title, snippet, category, tags, template, status, 
      content, settings
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    // Generate slug if not provided
    const blogSlug = slug || title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    
    let blog;
    
    // Check if blog exists
    if (slug) {
      blog = await BlogModel.findOne({ slug });
      
      // Check if user is the author
      if (blog && blog.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this blog' });
      }
    }
    
    // Prepare blog data
    const blogData = {
      title,
      slug: blogSlug,
      snippet: { text: snippet },
      category: { category },
      status: status || 'draft',
      content: JSON.parse(content || '{}'),
      tag: tags ? [{ tags: JSON.parse(tags) }] : [],
      settings: JSON.parse(settings || '{}'),
      createdBy: req.user.id,
      author: {
        name: req.user.email.split('@')[0],
        email: req.user.email
      }
    };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage) {
        blogData.media = {
          ...blogData.media,
          hero: `/uploads/blog/${req.files.coverImage[0].filename}`,
          thumbnail: `/uploads/blog/${req.files.coverImage[0].filename}`
        };
      }
      
      if (req.files.gallery) {
        blogData.media = {
          ...blogData.media,
          gallery: req.files.gallery.map(file => `/uploads/blog/${file.filename}`)
        };
      }
    }
    
    // Create or update blog
    if (blog) {
      // Update existing blog
      Object.keys(blogData).forEach(key => {
        blog[key] = blogData[key];
      });
      
      blog.updatedAt = new Date();
      await blog.save();
    } else {
      // Create new blog
      blog = new BlogModel({
        ...blogData,
        variant: 'blogs',
        publishedAt: status === 'published' ? new Date() : null,
        interactions: {
          likes: 0,
          dislikes: 0,
          views: 0,
          comments: []
        }
      });
      
      await blog.save();
    }
    
    res.json({
      success: true,
      message: `Blog ${slug ? 'updated' : 'created'} successfully`,
      slug: blog.slug,
      id: blog._id
    });
  } catch (error) {
    console.error('Error saving blog:', error);
    res.status(500).json({ success: false, message: 'Error saving blog', error: error.message });
  }
});

///////////////////////// NEW: RECORD BLOG VIEW /////////////////////////
// 2. RECORD BLOG VIEW
routeBlog.post('/@:username/:slug/view', authenticateToken, async (req, res) => {
  try {
    const { username, slug } = req.params;
    console.log(`[BlogAPI] Recording view for blog: ${username}/${slug} by user: ${req.user.username}`);

    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    // Increment view count
    await BlogModel.findByIdAndUpdate(blog._id, {
      $inc: { 'interactions.views': 1 }
    });

    console.log(`[BlogAPI] View recorded for blog: ${blog.title}`);

    res.json({ 
      success: true, 
      message: 'View recorded successfully' 
    });

  } catch (error) {
    console.error('[BlogAPI] Error recording view:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record view' 
    });
  }
});

// 3. BLOG LIKE/UNLIKE
routeBlog.post('/@:username/:slug/like', authenticateToken, async (req, res) => {
  try {
    const { username, slug } = req.params;
    const userId = req.user.id;
    
    console.log(`[BlogAPI] Toggle like for blog: ${username}/${slug} by user: ${req.user.username}`);

    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    // Initialize interactions if not exists
    if (!blog.interactions) {
      blog.interactions = {
        likes: 0,
        views: 0,
        comments: 0,
        likedBy: [],
        dislikedBy: []
      };
    }

    if (!blog.interactions.likedBy) {
      blog.interactions.likedBy = [];
    }

    // Check if user already liked
    const likedIndex = blog.interactions.likedBy.indexOf(userId);
    let liked = false;

    if (likedIndex > -1) {
      // Remove like
      blog.interactions.likedBy.splice(likedIndex, 1);
      blog.interactions.likes = Math.max(0, (blog.interactions.likes || 0) - 1);
      liked = false;
    } else {
      // Add like
      blog.interactions.likedBy.push(userId);
      blog.interactions.likes = (blog.interactions.likes || 0) + 1;
      liked = true;
    }

    await blog.save();

    console.log(`[BlogAPI] Blog ${liked ? 'liked' : 'unliked'}: ${blog.title}`);

    res.json({ 
      success: true, 
      liked: liked,
      likes: blog.interactions.likes,
      message: liked ? 'Blog liked successfully' : 'Blog unliked successfully'
    });

  } catch (error) {
    console.error('[BlogAPI] Error toggling like:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle like' 
    });
  }
});

// 4. BLOG SAVE/UNSAVE
routeBlog.post('/@:username/:slug/save', authenticateToken, async (req, res) => {
  try {
    const { username, slug } = req.params;
    const userId = req.user.id;
    
    console.log(`[BlogAPI] Toggle save for blog: ${username}/${slug} by user: ${req.user.username}`);

    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    // Initialize savedBy array if not exists
    if (!blog.savedBy) {
      blog.savedBy = [];
    }

    // Check if user already saved
    const savedIndex = blog.savedBy.indexOf(userId);
    let saved = false;

    if (savedIndex > -1) {
      // Remove save
      blog.savedBy.splice(savedIndex, 1);
      saved = false;
    } else {
      // Add save
      blog.savedBy.push(userId);
      saved = true;
    }

    await blog.save();

    console.log(`[BlogAPI] Blog ${saved ? 'saved' : 'unsaved'}: ${blog.title}`);

    res.json({ 
      success: true, 
      saved: saved,
      message: saved ? 'Blog saved successfully' : 'Blog unsaved successfully'
    });

  } catch (error) {
    console.error('[BlogAPI] Error toggling save:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle save' 
    });
  }
});

///////////////////////// NEW: GET BLOG COMMENTS /////////////////////////
// 5. GET BLOG COMMENTS
routeBlog.get('/@:username/:slug/comments', async (req, res) => {
  try {
    const { username, slug } = req.params;
    console.log(`[BlogAPI] Getting comments for blog: ${username}/${slug}`);

    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('comments interactions.comments');

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    const comments = blog.comments || [];

    console.log(`[BlogAPI] Found ${comments.length} comments for blog: ${slug}`);

    res.json({ 
      success: true, 
      comments: comments,
      count: comments.length
    });

  } catch (error) {
    console.error('[BlogAPI] Error getting comments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch comments' 
    });
  }
});

///////////////////////// NEW: ADD BLOG COMMENT /////////////////////////
// 6. ADD BLOG COMMENT
routeBlog.post('/@:username/:slug/comment', authenticateToken, async (req, res) => {
  try {
    const { username, slug } = req.params;
    const { content } = req.body;
    
    console.log(`[BlogAPI] Adding comment to blog: ${username}/${slug} by user: ${req.user.username}`);

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Comment content is required' 
      });
    }
    
    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    });
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }
    
    // Check if comments are enabled
    if (blog.settings && blog.settings.comments === false) {
      return res.status(403).json({ 
        success: false, 
        error: 'Comments are disabled for this blog' 
      });
    }
    
    // Initialize comments array if not exists
    if (!blog.comments) {
      blog.comments = [];
    }

    if (!blog.interactions) {
      blog.interactions = { views: 0, likes: 0, comments: 0 };
    }
    
    // Add comment
    const newComment = {
      author: req.user.id,
      authorName: req.user.firstName && req.user.lastName 
        ? `${req.user.firstName} ${req.user.lastName}`.trim()
        : req.user.username,
      content: content.trim(),
      timestamp: new Date()
    };

    blog.comments.push(newComment);
    blog.interactions.comments = blog.comments.length;
    
    await blog.save();

    console.log(`[BlogAPI] Comment added to blog: ${blog.title}`);
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
      totalComments: blog.comments.length
    });

  } catch (error) {
    console.error('[BlogAPI] Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add comment' 
    });
  }
});

///////////////////////// NEW: GET USER INTERACTION STATUS /////////////////////////
// 7. GET USER INTERACTION STATUS
routeBlog.get('/@:username/:slug/user-status', authenticateToken, async (req, res) => {
  try {
    const { username, slug } = req.params;
    const userId = req.user.id;
    
    console.log(`[BlogAPI] Getting user interaction status for blog: ${username}/${slug} by user: ${req.user.username}`);

    const blog = await BlogModel.findOne({ 
      slug: slug,
      'author.username': { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('interactions.likedBy savedBy');

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    const liked = blog.interactions?.likedBy ? blog.interactions.likedBy.includes(userId) : false;
    const saved = blog.savedBy ? blog.savedBy.includes(userId) : false;

    console.log(`[BlogAPI] User status for blog ${slug}: liked=${liked}, saved=${saved}`);

    res.json({ 
      success: true, 
      liked: liked,
      saved: saved
    });

  } catch (error) {
    console.error('[BlogAPI] Error getting user status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user interaction status' 
    });
  }
});

///////////////////////// EXISTING: SYNC BLOG DATA (CREATE/UPDATE) /////////////////////////
routeBlog.post('/@:username/post/sync/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const blogData = req.body;
    
    console.log(`[BlogAPI] Syncing blog data for slug: ${slug}`);
    console.log(`[BlogAPI] User: ${req.user.username} (${req.user.id})`);
    console.log(`[BlogAPI] Blog data received:`, {
      title: blogData.title,
      status: blogData.status,
      template: blogData.template
    });

    // Validate required fields
    if (!blogData.title) {
      console.log('[BlogAPI] Missing blog title');
      return res.status(400).json({ 
        success: false, 
        error: 'Blog title is required' 
      });
    }

    // Generate slug from title if not provided or if it's different
    let finalSlug = slug;
    if (!finalSlug || finalSlug === 'undefined' || finalSlug === 'null') {
      finalSlug = generateSlug(blogData.title);
      console.log(`[BlogAPI] Generated new slug: ${finalSlug}`);
    }

    if (!finalSlug) {
      console.log('[BlogAPI] Could not generate valid slug');
      return res.status(400).json({ 
        success: false, 
        error: 'Could not generate valid blog slug from title' 
      });
    }

    // Ensure author information is included
    const authorInfo = {
      id: req.user.id,
      name: req.user.firstName && req.user.lastName 
        ? `${req.user.firstName} ${req.user.lastName}`.trim()
        : req.user.username,
      email: req.user.email,
      username: req.user.username
    };

    // Prepare blog document with all required fields
    const blogDocument = {
      slug: finalSlug,
      title: blogData.title.trim(),
      variant: 'blogs',
      
      snippet: {
        text: blogData.snippet?.text || ''
      },
      
      category: {
        category: blogData.category?.category || 'dine'
      },
      
      content: {
        blocks: Array.isArray(blogData.content?.blocks) ? blogData.content.blocks : [],
        introduction: blogData.content?.introduction || '',
        body: blogData.content?.body || '',
        conclusion: blogData.content?.conclusion || '',
        stores: blogData.content?.stores || '',
        postscript: blogData.content?.postscript || ''
      },
      
      media: {
        hero: blogData.media?.hero || '',
        thumbnail: blogData.media?.thumbnail || blogData.media?.hero || '',
        gallery: Array.isArray(blogData.media?.gallery) ? blogData.media.gallery : []
      },
      
      tag: Array.isArray(blogData.tag) ? blogData.tag : [],
      
      author: authorInfo,
      
      status: blogData.status || 'draft',
      template: blogData.template || 'freestyle',
      
      settings: {
        public: blogData.settings?.public !== false, // Default to true
        comments: blogData.settings?.comments !== false, // Default to true
        autosave: blogData.settings?.autosave === true // Default to false
      },
      
      // Initialize interactions
      interactions: blogData.interactions || {
        views: 0,
        likes: 0,
        comments: 0,
        likedBy: [],
        dislikedBy: []
      },

      // Initialize savedBy array
      savedBy: blogData.savedBy || [],

      // Initialize comments array
      comments: blogData.comments || [],
      
      // Timestamps
      updatedAt: new Date(),
      lastUpdated: new Date()
    };

    // Set publishedAt if status is published
    if (blogDocument.status === 'published') {
      if (!blogData.publishedAt) {
        blogDocument.publishedAt = new Date();
      } else {
        blogDocument.publishedAt = new Date(blogData.publishedAt);
      }
    } else {
      blogDocument.publishedAt = null;
    }

    // Set createdAt for new blogs
    if (!blogData.createdAt) {
      blogDocument.createdAt = new Date();
    } else {
      blogDocument.createdAt = new Date(blogData.createdAt);
    }

    console.log(`[BlogAPI] Prepared blog document for save:`, {
      slug: blogDocument.slug,
      title: blogDocument.title,
      author: blogDocument.author.username,
      status: blogDocument.status
    });

    // Use findOneAndUpdate with proper options to handle duplicates
    const options = {
      new: true, // Return updated document
      upsert: true, // Create if doesn't exist
      runValidators: true,
      setDefaultsOnInsert: true,
      maxTimeMS: 15000 // 15 second timeout
    };

    // Check if blog exists and if user owns it (for updates)
    const existingBlog = await BlogModel.findOne({ slug: finalSlug });
    if (existingBlog && existingBlog.author.id !== req.user.id) {
      console.log(`[BlogAPI] User ${req.user.username} tried to edit blog owned by ${existingBlog.author.username}`);
      return res.status(403).json({ 
        success: false, 
        error: 'You can only edit your own blog posts' 
      });
    }

    // Save the blog
    const savedBlog = await BlogModel.findOneAndUpdate(
      { slug: finalSlug },
      blogDocument,
      options
    );

    console.log(`[BlogAPI] Blog saved successfully:`, {
      id: savedBlog._id,
      slug: savedBlog.slug,
      title: savedBlog.title,
      status: savedBlog.status
    });

    res.json({ 
      success: true, 
      blog: savedBlog.toObject(),
      message: existingBlog ? 'Blog updated successfully' : 'Blog created successfully'
    });

  } catch (error) {
    console.error('[BlogAPI] Error syncing blog:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      console.error('[BlogAPI] Duplicate key error:', error.message);
      
      if (error.message.includes('BlogSlug')) {
        return res.status(400).json({ 
          success: false, 
          error: 'A blog with this title already exists. Please choose a different title.' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Blog with this slug already exists' 
        });
      }
    } else if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        error: `Validation failed: ${validationErrors.join(', ')}` 
      });
    } else if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        success: false, 
        error: 'Database timeout. Please try again.' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save blog. Please try again.' 
      });
    }
  }
});

///////////////////////// EXISTING: UPDATE BLOG STATUS /////////////////////////
routeBlog.post('/@:username/post/:slug/status', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    console.log(`[BlogAPI] Updating blog status: ${slug} -> ${status}`);

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be draft, published, or archived.' 
      });
    }

    const blog = await BlogModel.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    // Check ownership
    if (blog.author.id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only modify your own blog posts' 
      });
    }

    // Update status
    blog.status = status;
    blog.updatedAt = new Date();

    // Set publishedAt when publishing
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    } else if (status !== 'published') {
      blog.publishedAt = null;
    }

    await blog.save();

    console.log(`[BlogAPI] Blog status updated: ${blog.title} -> ${status}`);

    res.json({ 
      success: true, 
      blog: blog.toObject(),
      message: `Blog ${status} successfully` 
    });

  } catch (error) {
    console.error('[BlogAPI] Error updating blog status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update blog status' 
    });
  }
});

///////////////////////// EXISTING: GET BLOGS LIST /////////////////////////
// routeBlog.get('/', async (req, res) => {
//   try {
//     const { 
//       category, 
//       tag, 
//       status = 'published', 
//       limit = 12, 
//       page = 1,
//       sort = 'newest'
//     } = req.query;

//     console.log(`[BlogAPI] Getting blogs list:`, { category, tag, status, limit, page, sort });

//     let query = {};
    
//     // Filter by status
//     if (status) {
//       query.status = status;
//     }
    
//     // Filter by category
//     if (category) {
//       query['category.category'] = category;
//     }
    
//     // Filter by tag
//     if (tag) {
//       query['tag.tags'] = tag;
//     }

//     // Sort options
//     let sortOptions = {};
//     switch (sort) {
//       case 'oldest':
//         sortOptions = { publishedAt: 1 };
//         break;
//       case 'popular':
//         sortOptions = { 'interactions.views': -1, publishedAt: -1 };
//         break;
//       case 'newest':
//       default:
//         sortOptions = { publishedAt: -1 };
//         break;
//     }

//     const limitNum = parseInt(limit, 10);
//     const pageNum = parseInt(page, 10);
//     const skip = (pageNum - 1) * limitNum;

//     // Execute query
//     const [blogs, totalBlogs] = await Promise.all([
//       BlogModel.find(query)
//         .sort(sortOptions)
//         .limit(limitNum)
//         .skip(skip)
//         .select('slug title snippet category tag media author status publishedAt createdAt interactions')
//         .maxTimeMS(10000),
//       BlogModel.countDocuments(query)
//     ]);

//     const totalPages = Math.ceil(totalBlogs / limitNum);

//     console.log(`[BlogAPI] Found ${blogs.length} blogs (${totalBlogs} total)`);

//     res.json({
//       success: true,
//       blogs: blogs.map(blog => blog.toObject()),
//       pagination: {
//         currentPage: pageNum,
//         totalPages,
//         totalBlogs,
//         hasNextPage: pageNum < totalPages,
//         hasPrevPage: pageNum > 1
//       }
//     });

//   } catch (error) {
//     console.error('[BlogAPI] Error getting blogs list:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to fetch blogs' 
//     });
//   }
// });

routeBlog.get('/', async (req, res) => {
  try {
    const { 
      category, 
      tag, 
      status = 'published', 
      limit = 12, 
      page = 1,
      sort = 'newest'
    } = req.query;

    console.log(`[BlogAPI] Getting blogs list:`, { category, tag, status, limit, page, sort });

    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by category
    if (category) {
      query['category.category'] = category;
    }
    
    // Filter by tag
    if (tag) {
      query['tag.tags'] = tag;
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { publishedAt: 1 };
        break;
      case 'popular':
        sortOptions = { 'interactions.views': -1, publishedAt: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { publishedAt: -1 };
        break;
    }

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [blogs, totalBlogs] = await Promise.all([
      BlogModel.find(query)
        .sort(sortOptions)
        .limit(limitNum)
        .skip(skip)
        .select('slug title snippet category tag media author status publishedAt createdAt interactions')
        .maxTimeMS(10000),
      BlogModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalBlogs / limitNum);

    console.log(`[BlogAPI] Found ${blogs.length} blogs (${totalBlogs} total)`);

    res.json({
      success: true,
      blogs: blogs.map(blog => blog.toObject()),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('[BlogAPI] Error getting blogs list:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch blogs' 
    });
  }
});

///////////////////////// GET GEOJSON BLOGS /////////////////////////
routeBlog.get('/geojson/blogs', async (req, res) => {
  try {
    console.log('[BlogAPI] Getting GeoJSON blogs data');

    const blogs = await BlogModel.find({ 
      status: 'published',
      'settings.public': true 
    })
    .select('slug title snippet category tag media author publishedAt location')
    .limit(50) // Limit for performance
    .sort({ publishedAt: -1 })
    .maxTimeMS(10000);

    // Convert to GeoJSON format
    const features = blogs.map(blog => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          blog.location?.geolocation?.lon || -74.006, // Default to NYC
          blog.location?.geolocation?.lat || 40.7128
        ]
      },
      properties: {
        id: blog._id.toString(),
        slug: blog.slug,
        title: blog.title,
        variant: 'blogs',
        categoryType: blog.category?.category || 'dine',
        snippet: blog.snippet?.text || '',
        thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
        author: blog.author?.name || 'Anonymous',
        publishedAt: blog.publishedAt,
        tags: blog.tag && blog.tag[0] ? blog.tag[0].tags : []
      }
    }));

    const geojsonData = {
      type: 'FeatureCollection',
      features: features
    };

    console.log(`[BlogAPI] Returning ${features.length} blog features as GeoJSON`);

    res.json(geojsonData);

  } catch (error) {
    console.error('[BlogAPI] Error getting GeoJSON blogs:', error);
    res.status(500).json({ 
      type: 'FeatureCollection',
      features: []
    });
  }
});

routeBlog.get('/stores/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ stores: [] });
    }
    
    // Search stores by title or address
    const stores = await StoreModel.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } }
      ]
    }).limit(10).select('title slug location');
    
    res.json({
      success: true,
      stores
    });
  } catch (error) {
    console.error('Error searching stores:', error);
    res.status(500).json({ success: false, message: 'Error searching stores' });
  }
});

///////////////////////// EXISTING: DELETE BLOG /////////////////////////
routeBlog.delete('/@:username/post/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;

    console.log(`[BlogAPI] Deleting blog: ${slug} by user: ${req.user.username}`);

    const blog = await BlogModel.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog not found' 
      });
    }

    // Check ownership
    if (blog.author.id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only delete your own blog posts' 
      });
    }

    await BlogModel.findOneAndDelete({ slug });

    console.log(`[BlogAPI] Blog deleted successfully: ${blog.title}`);

    res.json({ 
      success: true, 
      message: 'Blog deleted successfully' 
    });

  } catch (error) {
    console.error('[BlogAPI] Error deleting blog:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete blog' 
    });
  }
});

export default routeBlog;




// routeBlog.get('/:slug', async (req, res) => {
//   try {
//     const blog = await BlogModel.findOne({ slug: req.params.slug });
    
//     if (!blog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }
    
//     // Increment view count
//     blog.interactions.views += 1;
//     await blog.save();
    
//     res.json({
//       success: true,
//       blog
//     });
//   } catch (error) {
//     console.error('Error fetching blog:', error);
//     res.status(500).json({ success: false, message: 'Error fetching blog' });
//   }
// });

// Create or update blog



// ///////////////////////// SYNC BLOG DATA (CREATE/UPDATE) /////////////////////////
// routeBlog.post('/:username/post/sync/:slug', authenticateToken, async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const blogData = req.body;
    
//     console.log(`[BlogAPI] Syncing blog data for slug: ${slug}`);
//     console.log(`[BlogAPI] User: ${req.user.username} (${req.user.id})`);
//     console.log(`[BlogAPI] Blog data received:`, {
//       title: blogData.title,
//       status: blogData.status,
//       template: blogData.template
//     });

//     // Validate required fields
//     if (!blogData.title) {
//       console.log('[BlogAPI] Missing blog title');
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Blog title is required' 
//       });
//     }

//     // FIXED: Generate slug from title if not provided or if it's different
//     let finalSlug = slug;
//     if (!finalSlug || finalSlug === 'undefined' || finalSlug === 'null') {
//       finalSlug = generateSlug(blogData.title);
//       console.log(`[BlogAPI] Generated new slug: ${finalSlug}`);
//     }

//     if (!finalSlug) {
//       console.log('[BlogAPI] Could not generate valid slug');
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Could not generate valid blog slug from title' 
//       });
//     }

//     // Ensure author information is included
//     const authorInfo = {
//       id: req.user.id,
//       name: req.user.firstName && req.user.lastName 
//         ? `${req.user.firstName} ${req.user.lastName}`.trim()
//         : req.user.username,
//       email: req.user.email,
//       username: req.user.username
//     };

//     // FIXED: Prepare blog document with all required fields
//     const blogDocument = {
//       slug: finalSlug,
//       title: blogData.title.trim(),
//       variant: 'blogs',
      
//       snippet: {
//         text: blogData.snippet?.text || ''
//       },
      
//       category: {
//         category: blogData.category?.category || 'dine'
//       },
      
//       content: {
//         blocks: Array.isArray(blogData.content?.blocks) ? blogData.content.blocks : [],
//         introduction: blogData.content?.introduction || '',
//         body: blogData.content?.body || '',
//         conclusion: blogData.content?.conclusion || '',
//         stores: blogData.content?.stores || '',
//         postscript: blogData.content?.postscript || ''
//       },
      
//       media: {
//         hero: blogData.media?.hero || '',
//         thumbnail: blogData.media?.thumbnail || blogData.media?.hero || '',
//         gallery: Array.isArray(blogData.media?.gallery) ? blogData.media.gallery : []
//       },
      
//       tag: Array.isArray(blogData.tag) ? blogData.tag : [],
      
//       author: authorInfo,
      
//       status: blogData.status || 'draft',
//       template: blogData.template || 'freestyle',
      
//       settings: {
//         public: blogData.settings?.public !== false, // Default to true
//         comments: blogData.settings?.comments !== false, // Default to true
//         autosave: blogData.settings?.autosave === true // Default to false
//       },
      
//       // Timestamps
//       updatedAt: new Date(),
//       lastUpdated: new Date()
//     };

//     // Set publishedAt if status is published
//     if (blogDocument.status === 'published') {
//       if (!blogData.publishedAt) {
//         blogDocument.publishedAt = new Date();
//       } else {
//         blogDocument.publishedAt = new Date(blogData.publishedAt);
//       }
//     } else {
//       blogDocument.publishedAt = null;
//     }

//     // Set createdAt for new blogs
//     if (!blogData.createdAt) {
//       blogDocument.createdAt = new Date();
//     } else {
//       blogDocument.createdAt = new Date(blogData.createdAt);
//     }

//     console.log(`[BlogAPI] Prepared blog document for save:`, {
//       slug: blogDocument.slug,
//       title: blogDocument.title,
//       author: blogDocument.author.username,
//       status: blogDocument.status
//     });

//     // FIXED: Use findOneAndUpdate with proper options to handle duplicates
//     const options = {
//       new: true, // Return updated document
//       upsert: true, // Create if doesn't exist
//       runValidators: true,
//       setDefaultsOnInsert: true,
//       maxTimeMS: 15000 // 15 second timeout
//     };

//     // Check if blog exists and if user owns it (for updates)
//     const existingBlog = await BlogModel.findOne({ slug: finalSlug });
//     if (existingBlog && existingBlog.author.id !== req.user.id) {
//       console.log(`[BlogAPI] User ${req.user.username} tried to edit blog owned by ${existingBlog.author.username}`);
//       return res.status(403).json({ 
//         success: false, 
//         error: 'You can only edit your own blog posts' 
//       });
//     }

//     // Save the blog
//     const savedBlog = await BlogModel.findOneAndUpdate(
//       { slug: finalSlug },
//       blogDocument,
//       options
//     );

//     console.log(`[BlogAPI] Blog saved successfully:`, {
//       id: savedBlog._id,
//       slug: savedBlog.slug,
//       title: savedBlog.title,
//       status: savedBlog.status
//     });

//     res.json({ 
//       success: true, 
//       blog: savedBlog.toObject(),
//       message: existingBlog ? 'Blog updated successfully' : 'Blog created successfully'
//     });

//   } catch (error) {
//     console.error('[BlogAPI] Error syncing blog:', error);
    
//     // Handle specific MongoDB errors
//     if (error.code === 11000) {
//       // Duplicate key error
//       console.error('[BlogAPI] Duplicate key error:', error.message);
      
//       if (error.message.includes('BlogSlug')) {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'A blog with this title already exists. Please choose a different title.' 
//         });
//       } else {
//         return res.status(400).json({ 
//           success: false, 
//           error: 'Blog with this slug already exists' 
//         });
//       }
//     } else if (error.name === 'ValidationError') {
//       // Mongoose validation error
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false, 
//         error: `Validation failed: ${validationErrors.join(', ')}` 
//       });
//     } else if (error.message.includes('timeout')) {
//       return res.status(504).json({ 
//         success: false, 
//         error: 'Database timeout. Please try again.' 
//       });
//     } else {
//       return res.status(500).json({ 
//         success: false, 
//         error: 'Failed to save blog. Please try again.' 
//       });
//     }
//   }
// });

///////////////////////// UPDATE BLOG STATUS /////////////////////////
// routeBlog.post('/:username/post/:slug/status', authenticateToken, async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const { status } = req.body;

//     console.log(`[BlogAPI] Updating blog status: ${slug} -> ${status}`);

//     if (!['draft', 'published', 'archived'].includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Invalid status. Must be draft, published, or archived.' 
//       });
//     }

//     const blog = await BlogModel.findOne({ slug });
//     if (!blog) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Blog not found' 
//       });
//     }

//     // Check ownership
//     if (blog.author.id !== req.user.id) {
//       return res.status(403).json({ 
//         success: false, 
//         error: 'You can only modify your own blog posts' 
//       });
//     }

//     // Update status
//     blog.status = status;
//     blog.updatedAt = new Date();

//     // Set publishedAt when publishing
//     if (status === 'published' && !blog.publishedAt) {
//       blog.publishedAt = new Date();
//     } else if (status !== 'published') {
//       blog.publishedAt = null;
//     }

//     await blog.save();

//     console.log(`[BlogAPI] Blog status updated: ${blog.title} -> ${status}`);

//     res.json({ 
//       success: true, 
//       blog: blog.toObject(),
//       message: `Blog ${status} successfully` 
//     });

//   } catch (error) {
//     console.error('[BlogAPI] Error updating blog status:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to update blog status' 
//     });
//   }
// });

///////////////////////// GET BLOGS LIST /////////////////////////
// routeBlog.get('/', async (req, res) => {
//   try {
//     const { 
//       category, 
//       tag, 
//       status = 'published', 
//       limit = 12, 
//       page = 1,
//       sort = 'newest'
//     } = req.query;

//     console.log(`[BlogAPI] Getting blogs list:`, { category, tag, status, limit, page, sort });

//     let query = {};
    
//     // Filter by status
//     if (status) {
//       query.status = status;
//     }
    
//     // Filter by category
//     if (category) {
//       query['category.category'] = category;
//     }
    
//     // Filter by tag
//     if (tag) {
//       query['tag.tags'] = tag;
//     }

//     // Sort options
//     let sortOptions = {};
//     switch (sort) {
//       case 'oldest':
//         sortOptions = { publishedAt: 1 };
//         break;
//       case 'popular':
//         sortOptions = { 'interactions.views': -1, publishedAt: -1 };
//         break;
//       case 'newest':
//       default:
//         sortOptions = { publishedAt: -1 };
//         break;
//     }

//     const limitNum = parseInt(limit, 10);
//     const pageNum = parseInt(page, 10);
//     const skip = (pageNum - 1) * limitNum;

//     // Execute query
//     const [blogs, totalBlogs] = await Promise.all([
//       BlogModel.find(query)
//         .sort(sortOptions)
//         .limit(limitNum)
//         .skip(skip)
//         .select('slug title snippet category tag media author status publishedAt createdAt interactions')
//         .maxTimeMS(10000),
//       BlogModel.countDocuments(query)
//     ]);

//     const totalPages = Math.ceil(totalBlogs / limitNum);

//     console.log(`[BlogAPI] Found ${blogs.length} blogs (${totalBlogs} total)`);

//     res.json({
//       success: true,
//       blogs: blogs.map(blog => blog.toObject()),
//       pagination: {
//         currentPage: pageNum,
//         totalPages,
//         totalBlogs,
//         hasNextPage: pageNum < totalPages,
//         hasPrevPage: pageNum > 1
//       }
//     });

//   } catch (error) {
//     console.error('[BlogAPI] Error getting blogs list:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to fetch blogs' 
//     });
//   }
// });
// ///////////////////////// GET GEOJSON BLOGS /////////////////////////
// routeBlog.get('/geojson/blogs', async (req, res) => {
//   try {
//     console.log('[BlogAPI] Getting GeoJSON blogs data');

//     const blogs = await BlogModel.find({ 
//       status: 'published',
//       'settings.public': true 
//     })
//     .select('slug title snippet category tag media author publishedAt location')
//     .limit(50) // Limit for performance
//     .sort({ publishedAt: -1 })
//     .maxTimeMS(10000);

//     // Convert to GeoJSON format
//     const features = blogs.map(blog => ({
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [
//           blog.location?.geolocation?.lon || -74.006, // Default to NYC
//           blog.location?.geolocation?.lat || 40.7128
//         ]
//       },
//       properties: {
//         id: blog._id.toString(),
//         slug: blog.slug,
//         title: blog.title,
//         variant: 'blogs',
//         categoryType: blog.category?.category || 'dine',
//         snippet: blog.snippet?.text || '',
//         thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
//         author: blog.author?.name || 'Anonymous',
//         publishedAt: blog.publishedAt,
//         tags: blog.tag && blog.tag[0] ? blog.tag[0].tags : []
//       }
//     }));

//     const geojsonData = {
//       type: 'FeatureCollection',
//       features: features
//     };

//     console.log(`[BlogAPI] Returning ${features.length} blog features as GeoJSON`);

//     res.json(geojsonData);

//   } catch (error) {
//     console.error('[BlogAPI] Error getting GeoJSON blogs:', error);
//     res.status(500).json({ 
//       type: 'FeatureCollection',
//       features: []
//     });
//   }
// });

///////////////////////// DELETE BLOG /////////////////////////
// routeBlog.delete('/:username/post/:slug', authenticateToken, async (req, res) => {
//   try {
//     const { slug } = req.params;

//     console.log(`[BlogAPI] Deleting blog: ${slug} by user: ${req.user.username}`);

//     const blog = await BlogModel.findOne({ slug });
//     if (!blog) {
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Blog not found' 
//       });
//     }

//     // Check ownership
//     if (blog.author.id !== req.user.id) {
//       return res.status(403).json({ 
//         success: false, 
//         error: 'You can only delete your own blog posts' 
//       });
//     }

//     await BlogModel.findOneAndDelete({ slug });

//     console.log(`[BlogAPI] Blog deleted successfully: ${blog.title}`);

//     res.json({ 
//       success: true, 
//       message: 'Blog deleted successfully' 
//     });

//   } catch (error) {
//     console.error('[BlogAPI] Error deleting blog:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to delete blog' 
//     });
//   }
// });

// Update blog status (publish, archive, etc.)
// routeBlog.post('/:username/post/:slug/status', authenticateToken, async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const { status } = req.body;
    
//     // Validate status
//     if (!['published', 'draft', 'archived'].includes(status)) {
//       return res.status(400).json({ success: false, message: 'Invalid status' });
//     }
    
//     // Find blog
//     const blog = await BlogModel.findOne({ slug });
    
//     if (!blog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }
    
//     // Check if user is the author
//     if (blog.createdBy.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: 'Not authorized to update this blog' });
//     }
    
//     // Update status
//     blog.status = status;
    
//     // If publishing for the first time, set publishedAt
//     if (status === 'published' && !blog.publishedAt) {
//       blog.publishedAt = new Date();
//     }
    
//     await blog.save();
    
//     res.json({
//       success: true,
//       message: 'Blog status updated successfully',
//       status: blog.status
//     });
//   } catch (error) {
//     console.error('Error updating blog status:', error);
//     res.status(500).json({ success: false, message: 'Error updating blog status' });
//   }
// });

// // Add comment to blog
// routeBlog.post('/:username/blog/:slug/comment', authenticateToken, async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const { content } = req.body;
    
//     // Validate content
//     if (!content) {
//       return res.status(400).json({ success: false, message: 'Comment content is required' });
//     }
    
//     // Find blog
//     const blog = await BlogModel.findOne({ slug });
    
//     if (!blog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }
    
//     // Check if comments are enabled
//     if (!blog.settings.comments) {
//       return res.status(403).json({ success: false, message: 'Comments are disabled for this blog' });
//     }
    
//     // Add comment
//     blog.interactions.comments.push({
//       author: req.user.id,
//       content,
//       timestamp: new Date()
//     });
    
//     await blog.save();
    
//     res.json({
//       success: true,
//       message: 'Comment added successfully'
//     });
//   } catch (error) {
//     console.error('Error adding comment:', error);
//     res.status(500).json({ success: false, message: 'Error adding comment' });
//   }
// });

// Search stores for blog content
// routeBlog.get('/stores/search', async (req, res) => {
//   try {
//     const { q } = req.query;
    
//     if (!q || q.length < 2) {
//       return res.json({ stores: [] });
//     }
    
//     // Search stores by title or address
//     const stores = await StoreModel.find({
//       $or: [
//         { title: { $regex: q, $options: 'i' } },
//         { 'location.address': { $regex: q, $options: 'i' } }
//       ]
//     }).limit(10).select('title slug location');
    
//     res.json({
//       success: true,
//       stores
//     });
//   } catch (error) {
//     console.error('Error searching stores:', error);
//     res.status(500).json({ success: false, message: 'Error searching stores' });
//   }
// });

// export default routeBlog;