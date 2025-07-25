import dotenv from 'dotenv';
import mongoose from 'mongoose';
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
// import blogRoutes from './route/routeBlog.js'; // Adjust path as needed

// Import route modules
import routeBlog from './route/routeBlog.js';
import routeStore from './route/routeStore.js';

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
app.use('/uploads', express.static('uploads'));``

// Use blog routes
app.use('/api', routeBlog);
app.use('/api', routeStore);


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

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

// Parse JSON bodies
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Get all stores endpoint
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await StoreModel.find({})
      .select('title slug category location media hero')
      .lean();
      
    return res.json({
      success: true,
      count: stores.length,
      stores: stores.map(store => ({
        _id: store._id,
        slug: store.slug,
        title: store.hero?.storeName || store.title || store.slug,
        category: store.category,
        location: store.location,
        media: store.media,
        hero: store.hero
      }))
    });
  } catch (error) {
    console.error('[Server.js line 386] Store listing error:', error);
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
        { 'location.neighborhood.address': { $regex: q, $options: 'i' } }
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
    console.error('[Server.js line 421] Error searching stores:', error);
    res.status(500).json({ success: false, message: 'Error searching stores' });
  }
});


///////////////////////// STORE INTERACTION ENDPOINTS /////////////////////////
// Store check-in endpoint
app.post('/api/store/checkin', authenticationToken, async (req, res) => {
  try {
    const { storeId, action } = req.body;
    const userId = req.user.id;
    
    console.log(`[Server.js line 433] Check-in request: ${action} for store ${storeId} by user ${userId}`);
    
    const store = await StoreModel.findOne({ slug: storeId });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }
    
    // Handle check-in/check-out logic
    if (action === 'checkin') {
      // Add to checkedInBy if not already there
      if (!store.interactions.checkedInBy.find(c => c.user.toString() === userId)) {
        store.interactions.checkedInBy.push({ user: userId });
        store.interactions.checkins++;
      }
    } else if (action === 'checkout') {
      // Remove from checkedInBy
      store.interactions.checkedInBy = store.interactions.checkedInBy.filter(
        c => c.user.toString() !== userId
      );
    }
    
    await store.save();
    
    res.json({
      success: true,
      message: `Successfully ${action === 'checkin' ? 'checked in to' : 'checked out from'} store`,
      checkins: store.interactions.checkins
    });
    
  } catch (error) {
    console.error('[Server.js line 467] Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Store impression endpoint
app.post('/api/store/impression', authenticationToken, async (req, res) => {
  try {
    const { storeId, action, section } = req.body;
    const userId = req.user.id;
    
    console.log(`[Server.js line 480] Impression request: ${action} for store ${storeId} section ${section} by user ${userId}`);
    
    const store = await StoreModel.findOne({ slug: storeId });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }
    
    // Check if user is checked in
    const isCheckedIn = store.interactions.checkedInBy.some(
      c => c.user.toString() === userId
    );
    
    if (!isCheckedIn) {
      return res.status(403).json({
        success: false,
        message: 'You must be checked in to this store to like or dislike'
      });
    }
    
    // Handle the interaction
    const result = await store.handleInteraction(userId, action, section || 'general');
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('[Server.js line 511] Impression error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// Get check-in status
app.get('/api/store/checkin/status', authenticationToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find stores where user is checked in
    const checkedInStore = await StoreModel.findOne({
      'interactions.checkedInBy.user': userId
    }).select('slug');
    
    res.json({
      success: true,
      checkedInStore: checkedInStore ? checkedInStore.slug : null
    });
    
  } catch (error) {
    console.error('[Server.js line 534] Check-in status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user impressions for a store
app.get('/api/user/impressions/:storeId', authenticationToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    
    const store = await StoreModel.findOne({ slug: storeId });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }
    
    const hasLiked = store.interactions.likedBy.includes(userId);
    const hasDisliked = store.interactions.dislikedBy.includes(userId);
    
    res.json({
      success: true,
      hasLiked,
      hasDisliked,
      likes: store.interactions.likes,
      dislikes: store.interactions.dislikes
    });
    
  } catch (error) {
    console.error('[Server.js line 567] User impressions error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

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
        lastUpdated: new Date(),
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
    console.error(`[Server] Error details:`, error.message);
    console.error(`[Server] Stack trace:`, error.stack);

    res.status(500).json({ 
      success: false, 
      error: 'Failed to save blog. Please try again.',
      details: error.message 
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



///////////////////////// GEOJSON ENDPOINTS /////////////////////////
// GeoJSON endpoint for blog map data
app.get('/api/geojson/blogs', async (req, res) => {
  try {
    console.log('[Server] Getting GeoJSON blogs data for mapping');

    const blogs = await BlogModel.find({ 
      status: 'published',
      'settings.public': true 
    })
    .select('slug title snippet category tag media author publishedAt location')
    .limit(50) // Limit for performance
    .sort({ publishedAt: -1 })
    .maxTimeMS(10000);

    // Convert to GeoJSON format for mapping
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
        variant: 'blogs', // This is important for HomeScreen rendering
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

    console.log(`[Server] Returning ${features.length} blog features as GeoJSON`);

    res.json(geojsonData);

  } catch (error) {
    console.error('[Server] Error getting GeoJSON blogs:', error);
    res.status(500).json({ 
      type: 'FeatureCollection',
      features: []
    });
  }
});

// FIXED: Database cleanup endpoint to fix existing duplicate key issues
app.post('/api/admin/fix-blog-indexes', async (req, res) => {
  try {
    console.log('[Server] Starting blog index cleanup...');
    
    // Get admin authentication (you should add proper admin auth here)
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.includes('admin-token')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const db = mongoose.connection.db;
    const collection = db.collection('Blog');
    
    // STEP 1: Remove the problematic unique index if it exists
    try {
      await collection.dropIndex('BlogSlug_1');
      console.log('[Server] Dropped old BlogSlug_1 index');
    } catch (error) {
      console.log('[Server] BlogSlug_1 index not found or already dropped');
    }
    
    // STEP 2: Remove documents with null slugs
    const deleteResult = await collection.deleteMany({ 
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' },
        { slug: 'undefined' }
      ]
    });
    console.log(`[Server] Removed ${deleteResult.deletedCount} documents with invalid slugs`);
    
    // STEP 3: Fix documents with duplicate slugs
    const pipeline = [
      { $group: { _id: '$slug', count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ];
    
    const duplicates = await collection.aggregate(pipeline).toArray();
    console.log(`[Server] Found ${duplicates.length} duplicate slug groups`);
    
    for (const duplicate of duplicates) {
      const [keepId, ...removeIds] = duplicate.docs;
      
      // Keep the first document, remove the rest
      if (removeIds.length > 0) {
        await collection.deleteMany({ _id: { $in: removeIds } });
        console.log(`[Server] Removed ${removeIds.length} duplicate documents for slug: ${duplicate._id}`);
      }
    }
    
    // STEP 4: Create the new sparse unique index
    try {
      await collection.createIndex(
        { slug: 1 }, 
        { 
          unique: true, 
          sparse: true, 
          background: true,
          name: 'slug_unique_sparse'
        }
      );
      console.log('[Server] Created new sparse unique index on slug');
    } catch (error) {
      console.log('[Server] Index already exists or creation failed:', error.message);
    }
    
    // STEP 5: Verify the fix
    const remainingNulls = await collection.countDocuments({ 
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' }
      ]
    });
    
    console.log(`[Server] Blog index cleanup completed. Remaining null slugs: ${remainingNulls}`);
    
    res.json({ 
      success: true, 
      message: 'Blog indexes fixed successfully',
      deletedDocuments: deleteResult.deletedCount,
      duplicateGroups: duplicates.length,
      remainingNulls: remainingNulls
    });

  } catch (error) {
    console.error('[Server] Error fixing blog indexes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fix blog indexes: ' + error.message 
    });
  }
});


// Get blog by slug endpoint - similar to store endpoint
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`[Server] Fetching blog with slug: ${slug}`);
    
    const blog = await BlogModel.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
    }
    
    
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
    
    // return res.status(404).json({ 
    //   success: false,
    //   error: 'Blog not found' 
    // });

    res.json({
      success: true,
      blog: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
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

///////////////////////// BLOG INDEX INITIALIZATION /////////////////////////
// Add this function to your server startup to ensure indexes are properly created
async function initializeBlogIndexes() {
  try {
    console.log('[Server] Initializing blog indexes...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('Blog');
    
    // Check if the problematic index exists and remove it
    const indexes = await collection.indexes();
    const problemIndex = indexes.find(idx => idx.name === 'BlogSlug_1');
    
    if (problemIndex) {
      console.log('[Server] Found problematic BlogSlug_1 index, removing...');
      try {
        await collection.dropIndex('BlogSlug_1');
        console.log('[Server] Successfully removed BlogSlug_1 index');
      } catch (error) {
        console.log('[Server] Error removing index:', error.message);
      }
    }
    
    // Create the correct sparse index
    const sparseIndex = indexes.find(idx => idx.name === 'slug_unique_sparse');
    if (!sparseIndex) {
      console.log('[Server] Creating sparse unique index for blog slugs...');
      await collection.createIndex(
        { slug: 1 }, 
        { 
          unique: true, 
          sparse: true, 
          background: true,
          name: 'slug_unique_sparse'
        }
      );
      console.log('[Server] Sparse unique index created successfully');
    } else {
      console.log('[Server] Sparse unique index already exists');
    }
    
  } catch (error) {
    console.error('[Server] Error initializing blog indexes:', error);
  }
}

///////////////////////// SERVER INITIALIZATION /////////////////////////
// Initialize MongoDB and start server
const initServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    await initializeBlogIndexes();

    const PORT = process.env.SERVERPORT || 4500;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Blog API available at: http://localhost:${PORT}/api/@:username/:slug`);
      console.log(`Store API available at: http://localhost:${PORT}/api/stores`);
      console.log(`Available store endpoints:`);
      console.log(`  - GET    /api/stores                   - Get all stores`);
      console.log(`  - GET    /api/stores/:slug             - Get single store`);
      console.log(`  - POST   /api/stores/sync/:slug        - Sync/create store`);
      console.log(`  - POST   /api/stores/:slug/sync-yelp   - Sync Yelp data`);
      console.log(`  - POST   /api/stores/:slug/visit       - Record store visit`);
      console.log(`  - GET    /api/stores/search            - Search stores`);
      console.log(`  - POST   /api/store/checkin            - Check in/out of store`);
      console.log(`  - POST   /api/store/impression         - Like/dislike store`);
      console.log(`  - GET    /api/store/checkin/status     - Get check-in status`);
      console.log(`  - GET    /api/user/impressions/:storeId - Get user impressions`);
      console.log(`  - GET    /api/geojson/stores           - Get stores for map`);
      console.log(`Available blog endpoints:`);
      console.log(`  - GET    /api/@:username/:slug           - Get single blog`);
      console.log(`  - POST   /api/@:username/:slug/view      - Record blog view`);
      console.log(`  - POST   /api/@:username/:slug/like      - Like/unlike blog`);
      console.log(`  - POST   /api/@:username/:slug/save      - Save/unsave blog`);
      console.log(`  - GET    /api/@:username/:slug/comments  - Get blog comments`);
      console.log(`  - POST   /api/@:username/:slug/comment   - Add blog comment`);
      console.log(`  - GET    /api/@:username/:slug/user-status - Get user interaction status`);
      console.log(`  - POST   /api/@:username/post/sync/:slug      - Sync/create blog`);
      console.log(`  - POST   /api/@:username/post/:slug/status    - Update blog status`);
      console.log(`  - DELETE /api/@:username/post/:slug           - Delete blog`);
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Start the server
initServer();
///////////////////////// END UPDATED SERVER.JS /////////////////////////