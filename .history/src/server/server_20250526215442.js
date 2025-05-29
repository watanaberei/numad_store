import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
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
app.use('/api/blog', routeBlog);



// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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


// Also add the endpoint to get a store by slug
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

// app.post('/api/blog/sync/:slug', async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const blogData = req.body;
    
//     console.log(`[Server] Received blog sync request for slug: ${slug}`);
//     console.log(`[Server] Blog data:`, blogData);
    
//     if (!blogData) {
//       console.error(`[Server] No blog data provided for slug: ${slug}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'No blog data provided' 
//       });
//     }
      
//     // Validate required fields
//     if (!blogData.title && !blogData.headline?.text) {
//       console.error(`[Server] Missing title for blog slug ${slug}`);
//       return res.status(400).json({
//         success: false,
//         message: 'Blog title is required'
//       });
//     }
    
//     console.log(`[Server] Processing blog data for: ${blogData.title || blogData.headline?.text || slug}`);
    
//     // Format the blog data for MongoDB storage
//     const formattedBlogData = {
//       slug: slug,
//       title: blogData.title || blogData.headline?.text || 'Untitled Blog',
//       variant: 'blogs',
      
//       // Handle different possible data structures
//       category: {
//         category: blogData.category?.category || blogData.category || 'dine'
//       },
      
//       snippet: {
//         text: blogData.snippet?.text || blogData.snippet?.subtext || ''
//       },
      
//       content: {
//         introduction: blogData.content?.introduction || '',
//         body: blogData.content?.body || '',
//         conclusion: blogData.content?.conclusion || '',
//         stores: blogData.content?.stores || '',
//         postscript: blogData.content?.postscript || '',
//         blocks: blogData.content?.blocks || []
//       },
      
//       media: {
//         hero: blogData.media?.hero || '',
//         thumbnail: blogData.media?.thumbnail || blogData.media?.hero || '',
//         gallery: blogData.media?.gallery || []
//       },
      
//       tag: blogData.tag || [],
      
//       author: {
//         id: blogData.author?.id || 'default-author',
//         name: blogData.author?.name || 'Anonymous',
//         email: blogData.author?.email || 'anonymous@example.com',
//         slug: blogData.author?.slug || 'anonymous',
//         social: blogData.author?.social || ''
//       },
      
//       series: blogData.series || { series: 'General' },
      
//       summary: blogData.summary || { text: [] },
      
//       status: blogData.status || 'published',
//       template: blogData.template || 'freestyle',
      
//       settings: {
//         public: blogData.settings?.public !== false, // Default to true
//         comments: blogData.settings?.comments !== false, // Default to true
//         autosave: blogData.settings?.autosave || false
//       },
      
//       // Timestamps
//       publishedAt: blogData.publishedAt || new Date(),
//       createdAt: blogData.createdAt || new Date(),
//       updatedAt: new Date(),
//       lastUpdated: new Date(),
      
//       // Store complete original data for reference
//       originalData: blogData
//     };
    
//     // Save to MongoDB
//     const result = await BlogModel.findOneAndUpdate(
//       { slug: slug },
//       formattedBlogData,
//       { 
//         upsert: true, 
//         new: true,
//         setDefaultsOnInsert: true 
//       }
//     );
    
//     console.log(`[Server] Blog saved successfully: ${result.title}`);
//     console.log(`[Server] MongoDB ID: ${result._id}`);
    
//     res.status(200).json({ 
//       success: true, 
//       message: 'Blog data saved successfully',
//       blog: {
//         id: result._id,
//         slug: result.slug,
//         title: result.title,
//         status: result.status
//       }
//     });
    
//   } catch (error) {
//     console.error(`[Server] Error saving blog data:`, error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// });

// Bulk blog sync endpoint for syncing multiple blogs at once

// Blog sync endpoint - updated to match store sync pattern exactly
app.post('/api/blog/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const blogData = req.body; // Direct body like store sync
    
    console.log(`[Server] Received blog sync request for slug: ${slug}`);
    console.log(`[Server] Blog data:`, blogData);
    
    if (!blogData) {
      console.error(`[Server] No blog data provided for slug: ${slug}`);
      return res.status(400).json({ 
        success: false, 
        message: 'No blog data provided' 
      });
    }
      
    // Validate required fields - similar to store validation but for blogs
    if (!blogData.title) {
      console.error(`[Server] Missing title for blog slug ${slug}`);
      return res.status(400).json({
        success: false,
        message: 'Blog title is required'
      });
    }
    
    console.log(`[Server] Processing blog data for: ${blogData.title}`);
    
    // Store the data with all sections - following store pattern exactly
    const result = await BlogModel.findOneAndUpdate(
      { slug: slug },
      {
        ...blogData,
        slug: slug, // Ensure slug is set
        lastUpdated: new Date(),
        // Ensure all sections are included
        title: blogData.title,
        snippet: blogData.snippet || { text: '' },
        category: blogData.category || { category: 'dine' },
        content: blogData.content || { blocks: [] },
        media: blogData.media || { hero: '', thumbnail: '', gallery: [] },
        tag: blogData.tag || [],
        author: blogData.author || {
          id: 'default-author',
          name: 'Anonymous',
          email: 'anonymous@example.com'
        },
        series: blogData.series || { series: 'General' },
        summary: blogData.summary || { text: [] },
        status: blogData.status || 'draft',
        template: blogData.template || 'freestyle',
        settings: blogData.settings || {
          public: true,
          comments: true,
          autosave: false
        },
        publishedAt: blogData.status === 'published' ? (blogData.publishedAt || new Date()) : null,
        createdAt: blogData.createdAt || new Date(),
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log(`[Server] Blog saved successfully: ${result.title}`);
    console.log(`[Server] MongoDB ID: ${result._id}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Blog data saved successfully',
      blog: {
        id: result._id,
        slug: result.slug,
        title: result.title,
        status: result.status
      }
    });
    
  } catch (error) {
    console.error(`[Server] Error saving blog data:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/blog/sync/bulk', async (req, res) => {
  try {
    const { blogs } = req.body;
    
    if (!blogs || !Array.isArray(blogs)) {
      return res.status(400).json({
        success: false,
        message: 'Blogs array is required'
      });
    }
    
    console.log(`[Server] Received bulk blog sync request for ${blogs.length} blogs`);
    
    const results = [];
    const errors = [];
    
    for (const blogData of blogs) {
      try {
        const slug = blogData.slug;
        
        if (!slug) {
          errors.push({ blog: blogData, error: 'Missing slug' });
          continue;
        }
        
        // Format the blog data (same as individual sync)
        const formattedBlogData = {
          slug: slug,
          title: blogData.title || blogData.headline?.text || 'Untitled Blog',
          variant: 'blogs',
          
          category: {
            category: blogData.category?.category || blogData.category || 'dine'
          },
          
          snippet: {
            text: blogData.snippet?.text || blogData.snippet?.subtext || ''
          },
          
          content: {
            introduction: blogData.content?.introduction || '',
            body: blogData.content?.body || '',
            conclusion: blogData.content?.conclusion || '',
            stores: blogData.content?.stores || '',
            postscript: blogData.content?.postscript || '',
            blocks: blogData.content?.blocks || []
          },
          
          media: {
            hero: blogData.media?.hero || '',
            thumbnail: blogData.media?.thumbnail || blogData.media?.hero || '',
            gallery: blogData.media?.gallery || []
          },
          
          tag: blogData.tag || [],
          
          author: {
            id: blogData.author?.id || 'default-author',
            name: blogData.author?.name || 'Anonymous',
            email: blogData.author?.email || 'anonymous@example.com',
            slug: blogData.author?.slug || 'anonymous',
            social: blogData.author?.social || ''
          },
          
          series: blogData.series || { series: 'General' },
          summary: blogData.summary || { text: [] },
          
          status: blogData.status || 'published',
          template: blogData.template || 'freestyle',
          
          settings: {
            public: blogData.settings?.public !== false,
            comments: blogData.settings?.comments !== false,
            autosave: blogData.settings?.autosave || false
          },
          
          publishedAt: blogData.publishedAt || new Date(),
          createdAt: blogData.createdAt || new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date(),
          
          originalData: blogData
        };
        
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
        
        results.push({
          slug: result.slug,
          title: result.title,
          id: result._id,
          status: 'success'
        });
        
        console.log(`[Server] Blog synced: ${result.title}`);
        
      } catch (error) {
        console.error(`[Server] Error syncing blog ${blogData.slug}:`, error);
        errors.push({ 
          blog: blogData.slug || 'unknown', 
          error: error.message 
        });
      }
    }
    
    console.log(`[Server] Bulk sync completed: ${results.length} successful, ${errors.length} errors`);
    
    res.json({
      success: true,
      message: `Bulk sync completed: ${results.length} successful, ${errors.length} errors`,
      results,
      errors,
      summary: {
        total: blogs.length,
        successful: results.length,
        failed: errors.length
      }
    });
    
  } catch (error) {
    console.error(`[Server] Error in bulk blog sync:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get blog by slug endpoint - similar to store endpoint
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`[Server] Fetching blog with slug: ${slug}`);
    
    const blog = await BlogModel.findOne({ slug });
    
    if (blog) {
      console.log(`[Server] Found blog in database: ${blog.title}`);
      
      // Increment view count
      await BlogModel.findByIdAndUpdate(blog._id, {
        $inc: { 'interactions.views': 1 }
      });
      
      return res.json({
        success: true,
        blog: blog
      });
    }
    
    console.log(`[Server] Blog not found in database: ${slug}`);
    
    return res.status(404).json({ 
      success: false,
      error: 'Blog not found' 
    });
    
  } catch (error) {
    console.error(`[Server] Error fetching blog: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch blog' 
    });
  }
});

// Get all blogs endpoint with filtering
app.get('/api/blog', async (req, res) => {
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

    console.log('[Server] Fetching blogs with filters:', req.query);

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

    console.log(`[Server] Found ${blogs.length} blogs`);

    res.json({
      success: true,
      blogs,
      totalPages,
      currentPage: pageNum,
      totalBlogs,
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
    console.error('[Server] Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});






// // Add error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
  
//   // Handle specific error types
//   if (err.name === 'ValidationError') {
//     return res.status(400).json({
//       error: 'Validation Error',
//       details: err.message
//     });
//   }

//   if (err.name === 'UnauthorizedError') {
//     return res.status(401).json({
//       error: 'Unauthorized',
//       details: 'Invalid or missing authentication token'
//     });
//   }

//   // Default error response
//   res.status(500).json({
//     error: 'Internal Server Error',
//     details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
//   });
// });

// // Update store endpoint to use error handling
// app.get('/stores/:id?', async (req, res, next) => {
//   try {
//     let stores;
//     if (req.params.id) {
//       stores = await StoreModel.findById(req.params.id);
//       if (!stores) {
//         return res.status(404).json({ error: 'StoreModel not found' });
//       }
//     } else {
//       stores = await StoreModel.find({});
//     }

//     const geojson = {
//       type: 'FeatureCollection',
//       features: stores.map(store => ({
//         type: 'Feature',
//         geometry: {
//           type: 'Point',
//           coordinates: [store.location.geolocation.lon, store.location.geolocation.lat]
//         },
//         properties: {
//           variant: 'stores',
//           title: store.title,
//           slug: store.slug,
//           address: store.location.address,
//           categoryType: store.category?.categoryType
//         }
//       }))
//     };

//     res.json(geojson);
//   } catch (error) {
//     next(error);
//   }
// });

// // Add authentication middleware
// const authenticateUser = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(403).json({ error: 'Invalid token' });
//   }
// };

// // Add interaction endpoint
// app.post('/api/stores/:storeId/interact', authenticateUser, async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const { action } = req.body;
//     const userId = req.user.id;

//     const store = await StoreModel.findById(storeId);
//     if (!store) {
//       return res.status(404).json({ error: 'Store not found' });
//     }

//     const result = await store.handleInteraction(userId, action);
//     res.json(result);

//   } catch (error) {
//     console.error('Interaction error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });







// // NEW ENDPOINT: Sync store data by slug

// // app.post('/api/stores/sync/:slug', async (req, res) => {
// //   try {
// //     const { slug } = req.params;
// //     const { storeData } = req.body;
    
// //     console.log(`[Server] Received sync request for slug: ${slug}`);
    
// //     let result;
    
// //     if (storeData) {
// //       // Use provided store data from request body
// //       console.log('[Server] Using provided store data from request');
      
// //       // Format data for MongoDB
// //       const storeDocument = {
// //         slug: slug,
// //         title: storeData.hero?.storeName || 'Unnamed Store',
// //         variant: 'stores',
// //         category: {
// //           categoryType: Array.isArray(storeData.hero?.storeType) 
// //             ? storeData.hero.storeType[0]?.title 
// //             : storeData.hero?.storeType
// //         },
// //         location: {
// //           geolocation: {
// //             lat: storeData.location?.geolocation?.lat || 0,
// //             lon: storeData.location?.geolocation?.lon || 0
// //           },
// //           address: storeData.location?.address || '',
// //           region: storeData.location?.neighborhood?.city || ''
// //         },
// //         media: {
// //           gallery: storeData.hero?.gallery || []
// //         },
// //         // Save the complete raw data as well
// //         storeData: storeData
// //       };
      
// //       // Save to MongoDB
// //       result = await StoreModel.findOneAndUpdate(
// //         { slug: slug },
// //         storeDocument,
// //         { 
// //           upsert: true, 
// //           new: true,
// //           setDefaultsOnInsert: true 
// //         }
// //       );
// //     } else {
// //       // Fetch and sync store data using storeOperations
// //       console.log('[Server] Fetching store data via storeOperations');
// //       result = await storeOperations.syncStoreData(slug);
// //     }
    
// //     if (result) {
// //       console.log(`[Server] Store synced successfully: ${result.slug}`);
// //       res.status(200).json({ 
// //         success: true, 
// //         message: 'Store synced successfully',
// //         store: {
// //           id: result._id,
// //           slug: result.slug,
// //           title: result.title
// //         }
// //       });
// //     } else {
// //       console.error(`[Server] Failed to sync store: ${slug}`);
// //       res.status(500).json({ 
// //         success: false, 
// //         message: 'Failed to sync store data' 
// //       });
// //     }
// //   } catch (error) {
// //     console.error(`[Server] Error syncing store: ${error.message}`);
// //     res.status(500).json({ 
// //       success: false, 
// //       error: error.message 
// //     });
// //   }
// // });

// // Store fetch endpoint - Get store by slug
// // app.get('/api/stores/:slug', async (req, res) => {
// //   try {
// //     const store = await StoreModel.findOne({ slug: req.params.slug });
// //     console.log("[Server] Store:", store);
// //     if (!store) {
// //       // If not in database, try to fetch and create it
// //       const syncedStore = await storeOperations.getOrCreateStoreBySlug(req.params.slug);
      
// //       if (!syncedStore) {
// //         return res.status(404).json({ 
// //           success: false,
// //           error: 'Store not found' 
// //         });
// //       }
      
// //       return res.json({
// //         success: true,
// //         store: syncedStore
// //       });
// //     }
    
// //     return res.json({
// //       success: true,
// //       store: store
// //     });
// //   } catch (error) {
// //     console.error('Store fetch error:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       error: 'Failed to fetch store' 
// //     });
// //   }
// // });

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

// GeoJSON endpoint for map data
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
            : [0, 0] // Default coordinates if not available
        },
        properties: {
          variant: 'blogs',
          slug: blog.slug,
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
    console.error('Error fetching blog GeoJSON:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch blog data' 
    });
  }
});

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

// Initialize MongoDB connection
// const initializeServer = async () => {

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

// // Initialize MongoDB and start server
// const initializeServer = async () => {
//   try {
//     await connectDB();
//     console.log('MongoDB connected successfully');
//     // Create endpoints directory if it doesn't exist
//     const endpointsDir = path.join(process.cwd(), 'endpoints');
//     if (!fs.existsSync(endpointsDir)) {
//       fs.mkdirSync(endpointsDir, { recursive: true });
//     }

//     // Log available endpoints
//     const endpoints = [
//       { method: 'POST', path: '/api/stores/sync/:slug', description: 'Sync store data by slug' },
//       { method: 'GET', path: '/api/stores/:slug', description: 'Get store by slug' },
//       { method: 'GET', path: '/api/stores', description: 'Get all stores' },
//       { method: 'POST', path: '/api/stores/:storeId/interact', description: 'Interact with store (like, dislike, etc.)' }
//     ];
    
//     fs.writeFileSync(
//       path.join(endpointsDir, 'endpoints.json'), 
//       JSON.stringify(endpoints, null, 2)
//     );
//     console.log('API endpoints documented in /endpoints/endpoints.json');

//     // Start server
//     const port = process.env.SERVERPORT || 6000; // Using port 6000 to match socket.io in StoreScreen.js
//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//       console.log(`Store sync endpoint available at: http://localhost:${port}/api/stores/sync/:slug`);
//     });

//   } catch (error) {
//     console.error('Server initialization failed:', error.message);
//     process.exit(1);
//   }
// };

// Start the server
initServer();