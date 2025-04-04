import dotenv from 'dotenv';
import { makeServerRequest } from './utils/utils.server.js';
import express from 'express';
import path from 'path';
import http from 'http';
import { User, Store, connectDB, storeOperations } from "./data/mongodb/mongodb.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import * as data from './data/data.js';
import * as mongodb from './data/mongodb/mongodb.js';
import { Yelp } from './data/yelp/yelp.js';
import { parseRequestUrl } from '../client/utils/utils.js';
// import { DataPost } from './data/dataPost/dataPost.js';

dotenv.config();

const app = express();

let bisectRight;
import('d3').then(d3 => {
  bisectRight = d3.bisectRight;
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.post('/settings', async (req, res) => {
  const { email, firstName, lastName, birthdate, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.birthdate = birthdate;
    user.email= email;
    user.password= password;
    await user.save();
    res.json({ message: 'User settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user settings' });
  }
});

app.post('/login', async (req, res) => {
   const email = req.body.email;
 
   const user = await User.findOne({ email: email });
 
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
 
   const newUser = new User({
     email: email,
     password: hashedPassword
   });
 
   newUser.save()
   .then(() => {
     res.json({ message: 'User created' });
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

// Add error handling middleware
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

// Update store endpoint to use error handling
app.get('/stores/:id?', async (req, res, next) => {
  try {
    let stores;
    const { storeId } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    if (req.params.id) {
      stores = await Store.findById(storeId);
      if (!stores) {
        return res.status(404).json({ error: 'Store not found' });
      }
    } else {
      stores = await Store.find({});
    }

    const geojson = {
      type: 'FeatureCollection',
      features: stores.map(store => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.location.geolocation.lon, store.location.geolocation.lat]
        },
        properties: {
          variant: 'stores',
          title: store.title,
          slug: store.slug,
          address: store.location.address,
          categoryType: store.category?.categoryType
        }
      }))
    };

    res.json(geojson);
  } catch (error) {
    next(error);
  }
});

// Add authentication middleware
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

// Add interaction endpoint
app.post('/api/stores/:storeId/interact', authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const result = await store.handleInteraction(userId, action);
    res.json(result);

  } catch (error) {
    console.error('Interaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this after your existing endpoints
app.post('/api/stores/:storeId/visit', authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.email; // Assuming we get user email from auth token
    console.log("storeId", storeId);
    // Log visit to store
    const store = await Store.findById(storeId);
    console.log("store", store);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Add visit to user's history
    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to checked in stores if not already there
    const existingVisit = user.checkedInStore.find(s => s.storeId === storeId);
    if (!existingVisit) {
      user.checkedInStore.push({
        storeId,
        checkedInAt: new Date(),
        // Add other store fields you want to track
        title: store.title,
        address: store.address,
        city: store.city
      });
      await user.save();
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Store visit error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Update the store visit endpoint
app.post('/api/stores/visit/:slug', authenticateUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.email;
    
    // Add clear console log separator
    console.log('\n=== Store Visit Started ===');
    console.log('[Store Visit] Slug:', slug);

    // Initialize dataset and log the full store data
    const initializedStore = await initializeDataset(slug);
    console.log('\n[Store Visit] Initialized Store Data:', JSON.stringify(initializedStore, null, 2));

    // 1. Get store data from StoreData
    const storeData = new data.StoreData();
    const storeDetails = await storeData.store(slug);
    console.log('[Store Visit] Store details fetched:', storeDetails?.title);

    if (!storeDetails) {
      console.error('[Store Visit] Store not found:', slug);
      return res.status(404).json({ error: 'Store not found' });
    }

    // 2. Save/update store in MongoDB with all necessary fields
    const store = await Store.findOneAndUpdate(
      { slug: slug },
      {
        $set: {
          title: storeDetails.title,
          slug: storeDetails.slug,
          sys: storeDetails.sys || {},
          isValidated: storeDetails.isValidated || false,
          storeAttributes: storeDetails.storeAttributes || [],
          hours: storeDetails.hours || [],
          storeWebsite: storeDetails.storeWebsite || [],
          googleRatings: storeDetails.googleRatings || [],
          yelpRatings: storeDetails.yelpRatings || [],
          storeRatings: storeDetails.storeRatings || [],
          recommendation: storeDetails.recommendation || [],
          popularTimes: storeDetails.popularTimes || [],
          storeServices: storeDetails.storeServices || [],
          handles: storeDetails.handles || [],
          contact: storeDetails.contact || [],
          storeChainStoresCollection: storeDetails.storeChainStoresCollection || {},
          attributes: storeDetails.attributes || {},
          location: storeDetails.location || {},
          media: storeDetails.media || {},
          interactions: storeDetails.interactions || {},
          validations: storeDetails.validations || [],
          updatedAt: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    console.log('[Store Visit] Store saved/updated:', store._id);

    // 3. Update user's visited stores if user is logged in
    if (userId) {
      const user = await User.findOne({ email: userId });
      if (!user) {
        console.error('[Store Visit] User not found:', userId);
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if store already in checkedInStore array
      const existingVisit = user.checkedInStore.find(s => s.storeId === store._id.toString());
      if (!existingVisit) {
        // Add new visit with all relevant store data
        user.checkedInStore.push({
          storeId: store._id.toString(),
          checkedInAt: new Date(),
          title: store.title,
          slug: store.slug,
          address: store.location?.address,
          city: store.location?.region,
          storeCurrentStatus: store.status,
          storeRange: store.distanceMiles,
          storeAttributes: store.storeAttributes,
          media: store.media
        });
        await user.save();
        console.log('[Store Visit] Added to user history:', user.email);
      }
    }

    console.log('\n=== Store Visit Completed ===\n');

    res.json({ 
      success: true,
      store: {
        _id: store._id,
        title: store.title,
        slug: store.slug
      }
    });

  } catch (error) {
    console.error('\n[Store Visit] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new initializeDataset function
const initializeDataset = async (slug) => {
  try {
    console.log('\n=== Initialize Dataset Started ===');
    console.log('[Dataset] Processing slug:', slug);
    
    // 1. Get store data
    const storeData = new data.StoreData();
    const storeDetails = await storeData.store(slug);
    console.log('[Dataset] Raw store details:', JSON.stringify(storeDetails, null, 2));

    if (!storeDetails) {
      console.log('[Dataset] No store found for slug:', slug);
      throw new Error('Failed to fetch store data');
    }

    // 2. Format store data for MongoDB
    const storeDoc = {
      title: storeDetails.title,
      slug: storeDetails.slug,
      sys: storeDetails.sys || {},
      isValidated: storeDetails.isValidated || false,
      storeAttributes: storeDetails.storeAttributes || [],
      hours: storeDetails.hours || [],
      storeWebsite: storeDetails.storeWebsite || [],
      googleRatings: storeDetails.googleRatings || [],
      yelpRatings: storeDetails.yelpRatings || [],
      storeRatings: storeDetails.storeRatings || [],
      recommendation: storeDetails.recommendation || [],
      popularTimes: storeDetails.popularTimes || [],
      storeServices: storeDetails.storeServices || [],
      handles: storeDetails.handles || [],
      contact: storeDetails.contact || [],
      storeChainStoresCollection: storeDetails.storeChainStoresCollection || {},
      attributes: storeDetails.attributes || {},
      location: {
        type: 'Store',
        geolocation: {
          lat: storeDetails.location?.geolocation?.lat || 0,
          lon: storeDetails.location?.geolocation?.lon || 0
        },
        address: storeDetails.location?.address || '',
        region: storeDetails.location?.region || '',
        locatedIn: storeDetails.location?.locatedIn || null
      },
      media: storeDetails.media || {},
      interactions: {
        likes: 0,
        dislikes: 0,
        checkins: 0,
        likedBy: [],
        dislikedBy: [],
        checkedInBy: []
      },
      updatedAt: new Date()
    };

    // 3. Save/update store in MongoDB
    const store = await Store.findOneAndUpdate(
      { slug },
      { $set: storeDoc },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log('\n[Dataset] Store saved/updated:', {
      _id: store._id,
      slug: store.slug,
      title: store.title
    });
    console.log('=== Initialize Dataset Completed ===\n');

    return store;

  } catch (error) {
    console.error('\n[Dataset] Error:', error);
    throw error;
  }
};

// Update initializeServer to be simpler
const initializeServer = async () => {
  try {
    // 1. Connect to DB first
    await connectDB();
    console.log('[Init] MongoDB connected successfully');

    // 2. Start server
    const port = process.env.SERVERPORT || 6000;
    app.listen(port, () => {
      console.log(`[Init] Server running on port ${port}`);
    });

  } catch (error) {
    console.error('[Init] Server initialization failed:', error);
    process.exit(1);
  }
};

// Update the store fetch endpoint
app.get('/api/stores/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('\n=== Store Fetch Request ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Slug Parameter:', slug);

    // Initialize dataset first
    console.log('\n[Store Fetch] Initializing dataset...');
    const initializedStore = await initializeDataset(slug);
    
    if (!initializedStore) {
      console.log('[Store Fetch] Failed to initialize dataset');
      return res.status(404).json({ error: 'Store not found' });
    }

    console.log('[Store Fetch] Dataset initialized:', {
      title: initializedStore.title,
      slug: initializedStore.slug,
      location: initializedStore.location
    });

    // Then get from MongoDB
    let store = await Store.findOne({ slug });
    
    if (!store) {
      console.log('[Store Fetch] Store not found in MongoDB, using initialized data');
      store = initializedStore;
    } else if (Date.now() - store.updatedAt > 24 * 60 * 60 * 1000) {
      console.log('[Store Fetch] Store data is stale, refreshing...');
      store = await initializeDataset(slug);
    }

    console.log('[Store Fetch] Returning store:', {
      id: store._id,
      slug: store.slug,
      title: store.title
    });
    console.log('=== Store Fetch Completed ===\n');

    return res.json(store);

  } catch (error) {
    console.error('\n[Store Fetch] Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// API Routes
app.get('/api/stores/test', async (req, res) => {
  try {
    const stores = await Store.find({}).lean();
    console.log(`Found ${stores.length} stores in database`);
    
    // Return first store as sample
    const sample = stores[0];
    res.json({
      count: stores.length,
      sample: sample ? {
        title: sample.title,
        slug: sample.slug,
        sys: sample.sys
      } : null
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Store sync endpoint
app.post('/api/stores/sync', async (req, res) => {
  try {
    const result = await storeOperations.syncStoreData();
    res.json({ success: true, stores: result });
  } catch (error) {
    console.error('Store sync error:', error);
    res.status(500).json({ error: 'Failed to sync stores' });
  }
});

// Update the sync endpoint to handle single store sync
app.post('/api/stores/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('[Store Sync] Captured slug:', slug);
    console.log('[Store Sync] Syncing store:', slug);

    const storeData = new data.StoreData();
    const freshStoreData = await storeData.getStoreBySlug(slug);

    if (!freshStoreData) {
      console.log('[Store Sync] Store not found in data.js');
      return res.status(404).json({ error: 'Store not found in source data' });
    }

    // Update or create in MongoDB
    const store = await Store.findOneAndUpdate(
      { slug },
      freshStoreData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );

    console.log('[Store Sync] Store synced successfully:', store._id);
    res.json({ success: true, store });

  } catch (error) {
    console.error('[Store Sync] Error:', error);
    res.status(500).json({ error: 'Failed to sync store' });
  }
});

// Start the server without relying on window.location
initializeServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
