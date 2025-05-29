// src/server/route/routeBlog.js
import express from 'express';
import { BlogModel } from '../data/mongodb/mongodb.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/blogs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to process content blocks
const processContentBlocks = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return [];
  
  return blocks.map((block, index) => ({
    ...block,
    order: block.order || index,
    id: block.id || `block-${block.type}-${index}`
  }));
};

// POST /api/blog - Create new blog post
router.post('/', authenticateUser, upload.single('coverImage'), async (req, res) => {
  try {
    console.log('[Blog] Creating new blog post');
    console.log('[Blog] Request body:', req.body);
    
    const {
      title,
      snippet,
      category,
      tags,
      template,
      content,
      settings,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Ensure slug is unique
    let slugExists = await BlogModel.findOne({ slug });
    let slugCounter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${slugCounter}`;
      slugExists = await BlogModel.findOne({ slug });
      slugCounter++;
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      try {
        const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (Array.isArray(tagsArray)) {
          processedTags = [{
            tags: tagsArray.filter(tag => tag && tag.trim())
          }];
        }
      } catch (error) {
        console.warn('[Blog] Error processing tags:', error);
      }
    }

    // Process content blocks
    let processedContent = { blocks: [] };
    if (content) {
      try {
        const contentData = typeof content === 'string' ? JSON.parse(content) : content;
        processedContent.blocks = processContentBlocks(contentData.blocks || []);
      } catch (error) {
        console.warn('[Blog] Error processing content:', error);
      }
    }

    // Process settings
    let processedSettings = {
      public: false,
      comments: true,
      autosave: false
    };
    if (settings) {
      try {
        const settingsData = typeof settings === 'string' ? JSON.parse(settings) : settings;
        processedSettings = { ...processedSettings, ...settingsData };
      } catch (error) {
        console.warn('[Blog] Error processing settings:', error);
      }
    }

    // Handle cover image
    let mediaData = {};
    if (req.file) {
      mediaData.hero = `/uploads/blogs/${req.file.filename}`;
      mediaData.thumbnail = `/uploads/blogs/${req.file.filename}`; // Use same image for thumbnail
    }

    // Create blog document
    const blogData = {
      slug,
      title,
      snippet: {
        text: snippet || ''
      },
      category: {
        category: category || 'dine'
      },
      tag: processedTags,
      template: template || 'freestyle',
      content: processedContent,
      media: mediaData,
      settings: processedSettings,
      status,
      author: {
        id: req.user.id,
        name: req.user.name || req.user.email,
        email: req.user.email
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set publishedAt if status is published
    if (status === 'published') {
      blogData.publishedAt = new Date();
    }

    console.log('[Blog] Saving blog data:', blogData);

    // Save to MongoDB
    const newBlog = new BlogModel(blogData);
    const savedBlog = await newBlog.save();

    console.log('[Blog] Blog saved successfully:', savedBlog.slug);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      blog: savedBlog,
      slug: savedBlog.slug
    });

  } catch (error) {
    console.error('[Blog] Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message
    });
  }
});

// POST /api/blog/:id - Update existing blog post
router.post('/:id', authenticateUser, upload.single('coverImage'), async (req, res) => {
  try {
    const blogId = req.params.id;
    console.log(`[Blog] Updating blog post: ${blogId}`);

    // Find existing blog
    const existingBlog = await BlogModel.findOne({
      $or: [
        { _id: blogId },
        { slug: blogId }
      ]
    });

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user owns the blog post
    if (existingBlog.author.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this blog post'
      });
    }

    const {
      title,
      snippet,
      category,
      tags,
      template,
      content,
      settings,
      status
    } = req.body;

    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };

    // Update fields if provided
    if (title) {
      updateData.title = title;
      
      // Update slug if title changed
      if (title !== existingBlog.title) {
        let newSlug = generateSlug(title);
        let slugExists = await BlogModel.findOne({ 
          slug: newSlug, 
          _id: { $ne: existingBlog._id } 
        });
        let slugCounter = 1;
        while (slugExists) {
          newSlug = `${generateSlug(title)}-${slugCounter}`;
          slugExists = await BlogModel.findOne({ 
            slug: newSlug, 
            _id: { $ne: existingBlog._id } 
          });
          slugCounter++;
        }
        updateData.slug = newSlug;
      }
    }

    if (snippet !== undefined) {
      updateData.snippet = { text: snippet };
    }

    if (category) {
      updateData.category = { category };
    }

    if (tags) {
      try {
        const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (Array.isArray(tagsArray)) {
          updateData.tag = [{
            tags: tagsArray.filter(tag => tag && tag.trim())
          }];
        }
      } catch (error) {
        console.warn('[Blog] Error processing tags:', error);
      }
    }

    if (template) {
      updateData.template = template;
    }

    if (content) {
      try {
        const contentData = typeof content === 'string' ? JSON.parse(content) : content;
        updateData.content = {
          blocks: processContentBlocks(contentData.blocks || [])
        };
      } catch (error) {
        console.warn('[Blog] Error processing content:', error);
      }
    }

    if (settings) {
      try {
        const settingsData = typeof settings === 'string' ? JSON.parse(settings) : settings;
        updateData.settings = { ...existingBlog.settings, ...settingsData };
      } catch (error) {
        console.warn('[Blog] Error processing settings:', error);
      }
    }

    if (status) {
      updateData.status = status;
      
      // Set publishedAt if publishing for the first time
      if (status === 'published' && existingBlog.status !== 'published') {
        updateData.publishedAt = new Date();
      }
    }

    // Handle cover image update
    if (req.file) {
      updateData.media = {
        ...existingBlog.media,
        hero: `/uploads/blogs/${req.file.filename}`,
        thumbnail: `/uploads/blogs/${req.file.filename}`
      };
    }

    console.log('[Blog] Update data:', updateData);

    // Update blog post
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      existingBlog._id,
      updateData,
      { new: true }
    );

    console.log('[Blog] Blog updated successfully:', updatedBlog.slug);

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      blog: updatedBlog,
      slug: updatedBlog.slug
    });

  } catch (error) {
    console.error('[Blog] Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
});

// GET /api/blog - Get all blog posts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      category,
      tag,
      status = 'published',
      author,
      limit = 12,
      page = 1,
      sort = 'newest'
    } = req.query;

    console.log('[Blog] Fetching blogs with filters:', req.query);

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query['category.category'] = category;
    }
    
    if (tag) {
      query['tag.tags'] = { $in: [tag] };
    }
    
    if (author) {
      query['author.id'] = author;
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { publishedAt: 1, createdAt: 1 };
        break;
      case 'popular':
        sortQuery = { views: -1, publishedAt: -1 };
        break;
      case 'newest':
      default:
        sortQuery = { publishedAt: -1, createdAt: -1 };
        break;
    }

    // Calculate pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalBlogs = await BlogModel.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limitNum);

    // Fetch blogs
    const blogs = await BlogModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log(`[Blog] Found ${blogs.length} blogs`);

    res.json({
      success: true,
      blogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('[Blog] Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// GET /api/blog/:slug - Get single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`[Blog] Fetching blog: ${slug}`);

    const blog = await BlogModel.findOne({ slug }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count (optional)
    await BlogModel.findByIdAndUpdate(blog._id, {
      $inc: { views: 1 }
    });

    console.log(`[Blog] Found blog: ${blog.title}`);

    res.json({
      success: true,
      blog
    });

  } catch (error) {
    console.error('[Blog] Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
});

// DELETE /api/blog/:id - Delete blog post
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const blogId = req.params.id;
    console.log(`[Blog] Deleting blog: ${blogId}`);

    const blog = await BlogModel.findOne({
      $or: [
        { _id: blogId },
        { slug: blogId }
      ]
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user owns the blog post
    if (blog.author.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this blog post'
      });
    }

    // Delete the blog post
    await BlogModel.findByIdAndDelete(blog._id);

    console.log(`[Blog] Blog deleted successfully: ${blog.slug}`);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('[Blog] Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
});

// POST /api/blog/sync/:slug - Sync blog data (similar to store sync)
router.post('/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const blogData = req.body;
    
    console.log(`[Blog] Received sync request for slug: ${slug}`);
    console.log(`[Blog] Blog data:`, blogData);
    
    if (!blogData) {
      console.error(`[Blog] No blog data provided for slug: ${slug}`);
      return res.status(400).json({ 
        success: false, 
        message: 'No blog data provided' 
      });
    }
    
    // Validate required fields
    if (!blogData.title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    console.log(`[Blog] Processing blog data for: ${blogData.title}`);
    
    // Prepare the blog data for MongoDB
    const formattedBlogData = {
      ...blogData,
      slug: slug,
      lastUpdated: new Date(),
      // Ensure required fields have defaults
      status: blogData.status || 'published',
      template: blogData.template || 'freestyle',
      settings: blogData.settings || {
        public: true,
        comments: true,
        autosave: false
      },
      createdAt: blogData.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    // Set publishedAt if status is published and not already set
    if (formattedBlogData.status === 'published' && !formattedBlogData.publishedAt) {
      formattedBlogData.publishedAt = new Date();
    }
    
    // Save to MongoDB
    const result = await BlogModel.findOneAndUpdate(
      { slug: slug },
      formattedBlogData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log(`[Blog] Blog saved successfully: ${result.title}`);
    console.log(`[Blog] MongoDB ID: ${result._id}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Blog data saved successfully',
      blog: {
        id: result._id,
        slug: result.slug,
        title: result.title
      }
    });
    
  } catch (error) {
    console.error(`[Blog] Error saving blog data:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;