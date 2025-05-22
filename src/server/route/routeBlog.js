// src/server/route/routeBlog.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { BlogModel } from '../models/blogModel.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/blogs/');
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

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get all published blogs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 12, sort = 'newest' } = req.query;
    const query = { status: 'published' };
    
    // Apply category filter if provided
    if (category) {
      query['category.category'] = category;
    }
    
    // Apply tag filter if provided
    if (tag) {
      query['tag.tags'] = tag;
    }
    
    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { publishedAt: 1 };
        break;
      case 'popular':
        sortOptions = { 'interactions.views': -1 };
        break;
      default: // 'newest'
        sortOptions = { publishedAt: -1 };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const blogs = await BlogModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalBlogs = await BlogModel.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / parseInt(limit));
    
    res.json({
      success: true,
      blogs,
      currentPage: parseInt(page),
      totalPages,
      totalBlogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Error fetching blogs' });
  }
});

// Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await BlogModel.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    // Increment view count
    blog.interactions.views += 1;
    await blog.save();
    
    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Error fetching blog' });
  }
});

// Create or update blog
router.post('/:slug?', authenticateUser, upload.fields([
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
          hero: `/uploads/blogs/${req.files.coverImage[0].filename}`,
          thumbnail: `/uploads/blogs/${req.files.coverImage[0].filename}`
        };
      }
      
      if (req.files.gallery) {
        blogData.media = {
          ...blogData.media,
          gallery: req.files.gallery.map(file => `/uploads/blogs/${file.filename}`)
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

// Update blog status (publish, archive, etc.)
router.post('/:slug/status', authenticateUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    // Find blog
    const blog = await BlogModel.findOne({ slug });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    // Check if user is the author
    if (blog.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this blog' });
    }
    
    // Update status
    blog.status = status;
    
    // If publishing for the first time, set publishedAt
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    
    res.json({
      success: true,
      message: 'Blog status updated successfully',
      status: blog.status
    });
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ success: false, message: 'Error updating blog status' });
  }
});

// Add comment to blog
router.post('/:slug/comment', authenticateUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const { content } = req.body;
    
    // Validate content
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    // Find blog
    const blog = await BlogModel.findOne({ slug });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    // Check if comments are enabled
    if (!blog.settings.comments) {
      return res.status(403).json({ success: false, message: 'Comments are disabled for this blog' });
    }
    
    // Add comment
    blog.interactions.comments.push({
      author: req.user.id,
      content,
      timestamp: new Date()
    });
    
    await blog.save();
    
    res.json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});

// Search stores for blog content
router.get('/stores/search', async (req, res) => {
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

export default router;