import dotenv from 'dotenv';
import { makeServerRequest, parseRequestUrl } from './utils/utils.server.js';
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
// import { parseRequestUrl } from './utils/utils.server.js';
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
   //  console.error(err);
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
//  console.error('Server error:', err);
  
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
  //  console.error('Interaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this after your existing endpoints
app.post('/api/stores/:storeId/visit', authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.email; // Assuming we get user email from auth token

    // Log visit to store
    const store = await Store.findById(storeId);
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
  //  console.error('Store visit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the initializeServer function
const initializeServer = async (slug) => {
  try {
    // 1. Connect to DB first
    await connectDB();
  //  console.log('[Init] MongoDB connected successfully');

    // 2. Initialize store data
  //  console.log('[Init] Starting initial store sync');
    const storeData = new data.StoreData();
    
    // 3. Get store data using the provided slug
  //  console.log('[Init] Fetching store with slug:', slug);
    const storeDetails = await storeData.store(slug); 
  //  console.log('[Init] Store details:', slug);

    if (!storeDetails) { 
    //  console.log('[Init] No store found for slug:', slug);
      throw new Error('Failed to fetch initial store data');
    }

    // Format store data
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

    // 4. Save test store
    try {
      const store = await Store.findOneAndUpdate(
        { slug: slug },
        { $set: storeDoc },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );
      // console.log('[Init] Test store created/updated:', {
      //   _id: store._id,
      //   slug: store.slug,
      //   title: store.title
      // });
    } catch (error) {
    //  console.error('[Init] Error creating test store:', error);
      throw error;
    }

    // 5. Start server
    const port = process.env.SERVERPORT || 6000;
    app.listen(port, () => {
    //  console.log(`[Init] Server running on port ${port}`);
    });

  } catch (error) {
  //  console.error('[Init] Server initialization failed:', error);
    process.exit(1);
  }
};

// Add this before the initServer function
let currentStoreSlug = null;

// Add endpoint to set current store
app.post('/api/stores/current', async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }
    currentStoreSlug = slug;
  //  console.log('[Server] Current store slug set to:', slug);
    res.json({ success: true, slug }); 
  } catch (error) {
  //  console.error('[Server] Error setting current store:', error);
    res.status(500).json({ error: 'Failed to set current store' });
  }
});

// Add endpoint to get current store
app.get('/api/stores/current', async (req, res) => {
  try {
    if (!currentStoreSlug) {
      return res.status(404).json({ error: 'No current store set' });
    }
    res.json({ slug: currentStoreSlug });
  } catch (error) {
  //  console.error('[Server] Error getting current store:', error);
    res.status(500).json({ error: 'Failed to get current store' });
  }
});

// Update the getStoreSlug function to use the current store
const getStoreSlug = async () => {
  try {
    // First try to get the current store from the endpoint
    const storeData = await makeServerRequest(`${API_URL}/api/stores/current`);
  //  console.log('[Server] Got current store data:',);
    return storeData.slug;
  } catch (error) {
  //  console.error('[Server] Error getting current store:', error);
    // Return default slug if request fails
    return 'ca_los-angeles-county_cerritos_smoking-tiger-bread-factory';
  }
};

// Initialize server with API endpoint to handle dynamic store initialization
app.get('/api/init-store/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    await initializeServer(slug);
    res.json({ success: true });
  } catch (error) {
  //  console.error('Failed to initialize store:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server with default configuration
const port = process.env.SERVERPORT || 6000;
const API_URL = 'http://localhost:3000';

// Initialize server with store data
const initServer = async () => {
  try {
    const slug = await getStoreSlug();
  //  console.log('[Server] Initializing with slug:', slug);
    await initializeServer(slug);

    // // Only start the server if it's not already running
    // if (!app.listening) {
    //   app.listen(port, () => {
    //   //  console.log(`Server running on port ${port}`);
    //   //  console.log(`Store initialized with slug: ${slug}`);
    //   });
    // }

  } catch (error) {
  //  console.error('[Server] Error during initialization:', error);
    // Don't exit process, try with default store
  //  console.log('[Server] Attempting initialization with default store...');
    // await initializeServer('ca_los-angeles-county_cerritos_smoking-tiger-bread-factory');
    await initializeServer(slug);
  }
};

// Start server only once
if (!app.listening) {
  initServer();
}

