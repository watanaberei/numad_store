import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import mongoose from 'mongoose';
import { makeServerRequest } from './utils/utils.server.js';
import http from 'http';
import { UserModel, StoreModel, BlogModel, storeOperations, connectDB } from "./data/mongodb/mongodb.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

// Import route modules
import routeBlog from './route/routeBlog.js';

dotenv.config();

const app = express();

let bisectRight;
import('d3').then(d3 => {
  bisectRight = d3.bisectRight;
});

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));



// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));


// Use blog routes
// app.use('/api/blog', routeBlog);



// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

app.post('/settings', async (req, res) => {
  const { email, firstName, lastName, birthdate, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'UserModel not found' });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.birthdate = birthdate;
    user.email= email;
    user.password= password;
    await user.save();
    res.json({ message: 'UserModel settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user settings' });
  }
});

app.post('/login', async (req, res) => {
   const email = req.body.email;
 
   const user = await UserModel.findOne({ email: email });
 
   if (user) {
     res.json({ userExists: true });
   } else {
     res.json({ userExists: false });
   }
 });
 
 
 app.post('/signup', checkNotAuthenticated, async (req, res) => {
   const email = req.body.email;
   const password = req.body.password; 
 
   const hashedPassword = await bcrypt.hash(password, 10);
 
   const newUser = new UserModel({
     email: email,
     password: hashedPassword
   });
 
   newUser.save()
   .then(() => {
     res.json({ message: 'UserModel created' });
   })
   .catch(err => {
     console.error(err);
     res.status(500).send('Server error');
   });
 });

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/screens/SignupScreen.js'));
});

const posts = [
  {
     email: 'to.reiwatanabe@gmail.com',
     password: '123456'
  },
  {
     email: 'wannabearay@gmail.com',
     password: '7891011'
  }
]

app.get('/posts', authenticationToken, (req, res) => {
   res.json(posts.filter(post => post.user === req.user.user))
})

function authenticationToken(req, res, next) {
   const authHeader = req.headers['authorization']
   const token = authHeader && authHeader.split(' ')[1]
   if (token == null) return res.sendStatus(401)

   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
  
      req.user = user;
      next(); // pass the execution off to whatever request the client intended
    });
}

function checkNotAuthenticated(req, res, next) {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
 
   if (token) {
     return res.redirect('/user');
   }
 
   next();
 }

 











//  // Authentication middleware
// const authenticateUser = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Authentication required' });
//   }
  
//   try {
//     const jwt = require('jsonwebtoken');
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };


// // API status endpoint
// app.get('/api/status', (req, res) => {
//   res.json({
//     status: 'online',
//     timestamp: new Date(),
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
//   });
// });



// // Get store by slug
// app.get('/api/stores/:slug', async (req, res) => {
//   try {
//     const { slug } = req.params;
//     console.log(`[Server] Fetching store with slug: ${slug}`);
    
//     const store = await StoreModel.findOne({ slug });
    
//     if (store) {
//       console.log(`[Server] Found store in database: ${store.hero?.storeName || store.slug}`);
//       return res.json({
//         success: true,
//         store: store
//       });
//     }
    
//     console.log(`[Server] Store not found in database: ${slug}`);
    
//     return res.status(404).json({ 
//       success: false,
//       error: 'Store not found' 
//     });
    
//   } catch (error) {
//     console.error(`[Server] Error fetching store: ${error.message}`);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch store' 
//     });
//   }
// });

// Blog API routes (inline to avoid import issues)
// Get all published blogs with filtering and pagination
// app.get('/api/blog', async (req, res) => {
//   try {
//     const { category, tag, page = 1, limit = 12, sort = 'newest' } = req.query;
//     const query = { status: 'published' };
    
//     if (category) {
//       query['category.category'] = category;
//     }
    
//     if (tag) {
//       query['tag.tags'] = tag;
//     }
    
//     let sortOptions = {};
//     switch (sort) {
//       case 'oldest':
//         sortOptions = { publishedAt: 1 };
//         break;
//       case 'popular':
//         sortOptions = { 'interactions.views': -1 };
//         break;
//       default:
//         sortOptions = { publishedAt: -1 };
//     }
    
//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const blogs = await BlogModel.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit));
    
//     const totalBlogs = await BlogModel.countDocuments(query);
//     const totalPages = Math.ceil(totalBlogs / parseInt(limit));
    
//     res.json({
//       success: true,
//       blogs,
//       currentPage: parseInt(page),
//       totalPages,
//       totalBlogs
//     });
//   } catch (error) {
//     console.error('Error fetching blogs:', error);
//     res.status(500).json({ success: false, message: 'Error fetching blogs' });
//   }
// });

// // Get single blog by slug
// app.get('/api/blog/:slug', async (req, res) => {
//   try {
//     const blog = await BlogModel.findOne({ slug: req.params.slug });
    
//     if (!blog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }
    
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






// // Authentication middleware
// const authenticateUser = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
  
//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Authentication required' });
//   }
  
//   try {
//     const jwt = require('jsonwebtoken');
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };




// Authentication middleware
function authenticateUser (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

 // Add this route BEFORE your existing blog routes in server.js:
 app.post('/api/blog', authenticateUser, async (req, res) => {
  try {
    console.log('[Blog API] Creating new blog');
    console.log('[Blog API] Request body:', req.body);
    
    const { title, snippet, category, status = 'draft', tags, settings, content, template } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    // Parse tags if they're a string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = [];
      }
    }
    
    // Parse settings if they're a string
    let parsedSettings = {};
    if (settings) {
      try {
        parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
      } catch (e) {
        parsedSettings = {};
      }
    }
    
    // Parse content if it's a string
    let parsedContent = {};
    if (content) {
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        parsedContent = {};
      }
    }
    
    const blogData = {
      slugBlog: slug, // Use slugBlog to match your model
      title,
      snippet: { text: snippet || '' },
      category: { category: category || 'dine' },
      status,
      tag: parsedTags.length > 0 ? [{ tags: parsedTags }] : [],
      settings: {
        public: parsedSettings.public || false,
        comments: parsedSettings.comments || false,
        autosave: parsedSettings.autosave || false
      },
      content: {
        template: template || 'freestyle',
        blocks: parsedContent.blocks || []
      },
      createdBy: req.user.id,
      author: {
        name: req.user.email.split('@')[0],
        email: req.user.email,
        id: req.user.id
      },
      variant: 'blogs',
      publishedAt: status === 'published' ? new Date() : null,
      interactions: { 
        likes: 0, 
        dislikes: 0, 
        views: 0, 
        comments: [] 
      }
    };
    
    console.log('[Blog API] Creating blog with data:', blogData);
    
    const blog = new BlogModel(blogData);
    await blog.save();
    
    console.log('[Blog API] Blog created successfully:', blog.slugBlog);
    
    res.json({
      success: true,
      message: 'Blog created successfully',
      slug: blog.slugBlog,
      id: blog._id
    });
    
  } catch (error) {
    console.error('[Blog API] Error creating blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating blog: ' + error.message 
    });
  }
});

// Update existing blog route
app.post('/api/blog/:slug', authenticateUser, async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('[Blog API] Updating blog:', slug);
    
    const blog = await BlogModel.findOne({ slugBlog: slug }); // Use slugBlog
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    if (blog.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to edit this blog' 
      });
    }
    
    const { title, snippet, category, status, tags, settings, content, template } = req.body;
    
    // Update fields if provided
    if (title) blog.title = title;
    if (snippet) blog.snippet = { text: snippet };
    if (category) blog.category = { category };
    if (status) blog.status = status;
    
    // Parse and update tags
    if (tags) {
      try {
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        blog.tag = parsedTags.length > 0 ? [{ tags: parsedTags }] : [];
      } catch (e) {
        console.warn('[Blog API] Failed to parse tags:', e);
      }
    }
    
    // Parse and update settings
    if (settings) {
      try {
        const parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
        blog.settings = {
          public: parsedSettings.public || false,
          comments: parsedSettings.comments || false,
          autosave: parsedSettings.autosave || false
        };
      } catch (e) {
        console.warn('[Blog API] Failed to parse settings:', e);
      }
    }
    
    // Parse and update content
    if (content) {
      try {
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        blog.content = {
          template: template || blog.content?.template || 'freestyle',
          blocks: parsedContent.blocks || []
        };
      } catch (e) {
        console.warn('[Blog API] Failed to parse content:', e);
      }
    }
    
    // Update publication date if status changed to published
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    } else if (status !== 'published') {
      blog.publishedAt = null;
    }
    
    blog.updatedAt = new Date();
    
    await blog.save();
    
    console.log('[Blog API] Blog updated successfully:', blog.slugBlog);
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      slug: blog.slugBlog,
      id: blog._id
    });
    
  } catch (error) {
    console.error('[Blog API] Error updating blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating blog: ' + error.message 
    });
  }
});

// Fix the GET blog route to use slug
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const blog = await BlogModel.findOne({ slugBlog: req.params.slug }); // Use slugBlog
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Increment views
    blog.interactions.views += 1;
    await blog.save();
    
    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('[Blog API] Error fetching blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blog' 
    });
  }
});

// Fix the GeoJSON endpoint to use slug
app.get('/api/geojson/blogs', async (req, res) => {
  try {
    const blogs = await BlogModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    
    const geojsonBlogs = {
      type: 'FeatureCollection',
      features: blogs.map(blog => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: blog.location?.geolocation 
            ? [blog.location.geolocation.lon, blog.location.geolocation.lat]
            : [0, 0]
        },
        properties: {
          variant: 'blogs',
          slug: blog.slug, // Use slug
          title: blog.title,
          snippet: blog.snippet?.text,
          thumbnail: blog.media?.thumbnail,
          category: blog.category?.category,
          categoryType: blog.category?.categoryType,
          publishedAt: blog.publishedAt,
          tag: blog.tag
        }
      }))
    };
    
    res.json(geojsonBlogs);
  } catch (error) {
    console.error('[Blog API] Error fetching blog GeoJSON:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch blog data' 
    });
  }
});

// // Create or update blog (simplified version)
// app.post('/api/blog/:slug?', authenticateUser, async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const { title, snippet, category, status = 'draft' } = req.body;
    
//     if (!title) {
//       return res.status(400).json({ success: false, message: 'Title is required' });
//     }
    
//     const blogSlug = slug || title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    
//     let blog;
//     if (slug) {
//       blog = await BlogModel.findOne({ slug });
//       if (blog && blog.createdBy.toString() !== req.user.id) {
//         return res.status(403).json({ success: false, message: 'Not authorized' });
//       }
//     }
    
//     const blogData = {
//       title,
//       slug: blogSlug,
//       snippet: { text: snippet },
//       category: { category },
//       status,
//       createdBy: req.user.id,
//       author: {
//         name: req.user.email.split('@')[0],
//         email: req.user.email
//       }
//     };
    
//     if (blog) {
//       Object.keys(blogData).forEach(key => {
//         blog[key] = blogData[key];
//       });
//       blog.updatedAt = new Date();
//       await blog.save();
//     } else {
//       blog = new BlogModel({
//         ...blogData,
//         variant: 'blogs',
//         publishedAt: status === 'published' ? new Date() : null,
//         interactions: { likes: 0, dislikes: 0, views: 0, comments: [] }
//       });
//       await blog.save();
//     }
    
//     res.json({
//       success: true,
//       message: `Blog ${slug ? 'updated' : 'created'} successfully`,
//       slug: blog.slug,
//       id: blog._id
//     });
//   } catch (error) {
//     console.error('Error saving blog:', error);
//     res.status(500).json({ success: false, message: 'Error saving blog' });
//   }
// });

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Store sync endpoint
app.post('/api/stores/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // const { storeData } = req.body;
    const storeData = req.body;
    
    console.log(`[Server] Received sync request for slug: ${slug}`);
    // console.log(`[Server] Store data size: ${JSON.stringify(storeData).length} bytes`);
    console.log(`[Server] Store data:`, storeData);
    
    if (!storeData) {
      console.error(`[Server] No store data provided for slug: ${slug}`);
      return res.status(400).json({ 
        success: false, 
        message: 'No store data provided' 
      });
    }
      
    // Validate required sections
    const requiredSections = ['hero', 'overview', 'service', 'experience', 'location', 'business'];
    const missingSections = requiredSections.filter(section => !storeData[section]);
    
    if (missingSections.length > 0) {
      console.error(`[Server] Missing required sections for slug ${slug}:`, missingSections);
      return res.status(400).json({
        success: false,
        message: `Missing required sections: ${missingSections.join(', ')}`
      });
    }
    
    console.log(`[Server] Processing store data for: ${storeData.hero?.storeName || slug}`);
    
    // Store the data with all sections
    const result = await StoreModel.findOneAndUpdate(
      { slug: slug },
      // { 
      //   ...storeData, 
      //   // slug: slug,
      //   // ...storeData,
      //   lastUpdated: new Date() 
      {
        ...storeData,
        lastUpdated: new Date(),
        // Ensure all sections are included
        hero: storeData.hero,
        overview: storeData.overview,
        service: storeData.service,
        experience: storeData.experience,
        location: storeData.location,
        business: storeData.business,
        categoryData: storeData.categoryData,
        mapRadiusData: storeData.mapRadiusData,
        // Yelp data sections
        yelpData: storeData.yelpData,
        yelpFoodData: storeData.yelpFoodData,
        yelpFusionData: storeData.yelpFusionData,
        yelpSearchData: storeData.yelpSearchData,
        yelpPhoneData: storeData.yelpPhoneData,
        yelpMatchData: storeData.yelpMatchData,
        yelpDetailsData: storeData.yelpDetailsData,
        yelpDeliveryData: storeData.yelpDeliveryData,
        yelpServiceData: storeData.yelpServiceData,
        yelpInsightData: storeData.yelpInsightData
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log(`[Server] Store saved successfully: ${result.hero?.storeName || result.slug}`);
    console.log(`[Server] MongoDB ID: ${result._id}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Store data saved successfully',
      store: {
        id: result._id,
        slug: result.slug,
        title: result.hero?.storeName || result.slug
      }
    });
    
  } catch (error) {
    console.error(`[Server] Error saving store data:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get store by slug
app.get('/api/stores/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`[Server] Fetching store with slug: ${slug}`);
    
    const store = await StoreModel.findOne({ slug });
    
    if (store) {
      console.log(`[Server] Found store in database: ${store.hero?.storeName || store.slug}`);
      return res.json({
        success: true,
        store: store
      });
    }
    
    console.log(`[Server] Store not found in database: ${slug}`);
    
    return res.status(404).json({ 
      success: false,
      error: 'Store not found' 
    });
    
  } catch (error) {
    console.error(`[Server] Error fetching store: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch store' 
    });
  }
});

// // Create or update blog (simplified version)
// app.post('/api/blog/:slug?', authenticateUser, async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const { title, snippet, category, status = 'draft' } = req.body;
    
//     if (!title) {
//       return res.status(400).json({ success: false, message: 'Title is required' });
//     }
    
//     const blogSlug = slug || title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    
//     let blog;
//     if (slug) {
//       blog = await BlogModel.findOne({ slug });
//       if (blog && blog.createdBy.toString() !== req.user.id) {
//         return res.status(403).json({ success: false, message: 'Not authorized' });
//       }
//     }
    
//     const blogData = {
//       title,
//       slug: blogSlug,
//       snippet: { text: snippet },
//       category: { category },
//       status,
//       createdBy: req.user.id,
//       author: {
//         name: req.user.email.split('@')[0],
//         email: req.user.email
//       }
//     };
    
//     if (blog) {
//       Object.keys(blogData).forEach(key => {
//         blog[key] = blogData[key];
//       });
//       blog.updatedAt = new Date();
//       await blog.save();
//     } else {
//       blog = new BlogModel({
//         ...blogData,
//         variant: 'blogs',
//         publishedAt: status === 'published' ? new Date() : null,
//         interactions: { likes: 0, dislikes: 0, views: 0, comments: [] }
//       });
//       await blog.save();
//     }
    
//     res.json({
//       success: true,
//       message: `Blog ${slug ? 'updated' : 'created'} successfully`,
//       slug: blog.slug,
//       id: blog._id
//     });
//   } catch (error) {
//     console.error('Error saving blog:', error);
//     res.status(500).json({ success: false, message: 'Error saving blog' });
//   }
// });


// Get all stores endpoint
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await StoreModel.find({})
      .select('title slug category location media')
      .lean();
      
    return res.json({
      success: true,
      count: stores.length,
      stores: stores
    });
  } catch (error) {
    console.error('Store listing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch stores' 
    });
  }
});

// Search stores endpoint for blog content
app.get('/api/stores/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ stores: [] });
    }
    
    // Search stores by title or address
    const stores = await StoreModel.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { 'hero.storeName': { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } }
      ]
    }).limit(10).select('title slug location hero');
    
    res.json({
      success: true,
      stores: stores.map(store => ({
        _id: store._id,
        slug: store.slug,
        title: store.hero?.storeName || store.title,
        location: store.location
      }))
    });
  } catch (error) {
    console.error('Error searching stores:', error);
    res.status(500).json({ success: false, message: 'Error searching stores' });
  }
});

// // GeoJSON endpoint for map data
// app.get('/api/geojson/blogs', async (req, res) => {
//   try {
//     const blogs = await BlogModel.find({ status: 'published' })
//       .sort({ publishedAt: -1 })
//       .limit(50)
//       .lean();
    
//     const geojsonBlogs = {
//       type: 'FeatureCollection',
//       features: blogs.map(blog => ({
//         type: 'Feature',
//         geometry: {
//           type: 'Point',
//           coordinates: blog.location?.geolocation 
//             ? [blog.location.geolocation.lon, blog.location.geolocation.lat]
//             : [0, 0] // Default coordinates if not available
//         },
//         properties: {
//           variant: 'blogs',
//           slug: blog.slug,
//           title: blog.title,
//           snippet: blog.snippet?.text,
//           thumbnail: blog.media?.thumbnail,
//           category: blog.category?.category,
//           categoryType: blog.category?.categoryType,
//           publishedAt: blog.publishedAt,
//           tag: blog.tag
//         }
//       }))
//     };
    
//     res.json(geojsonBlogs);
//   } catch (error) {
//     console.error('Error fetching blog GeoJSON:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch blog data' 
//     });
//   }
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid or missing authentication token'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize MongoDB and start server
const initServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    const PORT = process.env.SERVERPORT || 4500;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Blog API available at: http://localhost:${PORT}/api/blog`);
      console.log(`Store API available at: http://localhost:${PORT}/api/stores`);
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};
// Start the server
initServer();
