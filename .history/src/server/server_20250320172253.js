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
    console.error('Store visit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint after your existing endpoints
app.post('/api/stores/visit/:slug', authenticateUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.email;
    console.log('[Store Visit] Recording visit:', { slug, userId });

    // 1. Get store data from data.js
    const storeData = new data.StoreData();
    const storeDetails = await storeData.getStoreBySlug(slug);

    if (!storeDetails) {
      console.error('[Store Visit] Store not found:', slug);
      return res.status(404).json({ error: 'Store not found' });
    }

    // 2. Save/update store in MongoDB
    const store = await Store.findOneAndUpdate(
      { slug: slug },
      storeDetails,
      { upsert: true, new: true }
    );
    console.log('[Store Visit] Store saved/updated:', store._id);

    // 3. Update user's visited stores
    const user = await User.findOne({ email: userId });
    if (!user) {
      console.error('[Store Visit] User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if store already in checkedInStore array
    const existingVisit = user.checkedInStore.find(s => s.storeId === store._id.toString());
    if (!existingVisit) {
      // Add new visit
      user.checkedInStore.push({
        storeId: store._id.toString(),
        checkedInAt: new Date(),
        title: store.title,
        address: store.location?.address,
        city: store.location?.region,
        storeCurrentStatus: store.status,
        storeRange: store.distanceMiles,
        neustar: store.neustar,
        ratings: store.ratings,
        genre: store.category?.genre,
        storeAttributes: store.storeAttributes,
        best: store.summary?.best,
        gallery: store.media?.gallery
      });
      await user.save();
      console.log('[Store Visit] Added to user history:', user.email);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('[Store Visit] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the initializeServer function
const initializeServer = async () => {
  try {
    // Connect to DB first
    await connectDB();
    console.log('MongoDB connected successfully');

    // Initialize store data with proper collection
    console.log('[Init] Starting initial store sync');
     // Use the same logic as /api/stores/:slug endpoint
     let store = await Store.findOne({ slug });
    // Get the store data using the same pattern as the store fetch endpoint
    const storeData = new store();
    const slug = store.slug; // Example initial store
       
    
    if (!store) {
      console.log('[Init] Store not found in DB, fetching from data.js');
      const freshStoreData = await storeData.getStoreBySlug(slug);
    // Use the same store fetch logic that works in the endpoint
    const testSlug = 'ca_orange-ca_los-angeles_long-beach_the-library'; // Example store slug
    
    try {
      console.log('[Init] Attempting to sync store:', testSlug);
      
      // 1. First check MongoDB
      let store = await Store.findOne({ slug: testSlug });
      
      // 2. If not in MongoDB, get from data.js and save
      if (!store) {
        console.log('[Init] Store not found in DB, fetching from data.js');
        const storeData = new data.StoreData();
        const freshStoreData = await storeData.getStoreBySlug(testSlug);

        if (!freshStoreData) {
          console.log('[Init] Store not found in data.js');
          throw new Error('Initial store not found in data source');
        }

        // Save to MongoDB using create
        store = await Store.create(freshStoreData);
        console.log('[Init] Initial store created in DB:', store._id);
      } else {
        // 3. If store exists but is older than 24 hours, update it
        const lastUpdated = store.updatedAt || store.createdAt;
        const isStale = Date.now() - lastUpdated > 24 * 60 * 60 * 1000;

        if (isStale) {
          console.log('[Init] Updating stale store data');
          const storeData = new data.StoreData();
          const freshStoreData = await storeData.getStoreBySlug(testSlug);
          
          if (freshStoreData) {
            Object.assign(store, freshStoreData);
            await store.save();
            console.log('[Init] Updated initial store data');
          }
        }
      }

      // Get all stores for testing
      const stores = await Store.find({}).lean();
      console.log(`[Init] Found ${stores.length} stores in database`);

      // Create test directory if it doesn't exist
      const testDir = path.join(process.cwd(), '_specs', 'test');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Write test data
      const testData = {
        timestamp: new Date().toISOString(),
        count: stores.length,
        samples: stores.slice(0, 3).map(store => ({
          title: store.title,
          slug: store.slug,
          sys: store.sys,
          location: store.location,
          media: {
            hero: store.media?.hero,
            thumbnail: store.media?.thumbnail
          },
          overview: store.overview?.text,
          category: store.category
        }))
      };

      const testFile = path.join(testDir, 'stores_test.json');
      fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));

      // Start server only after DB operations complete
      const port = process.env.SERVERPORT || 6000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });

    } catch (error) {
      console.error('[Init] Error during store sync:', error);
      throw error;
    }


};

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

// Store fetch endpoint
app.get('/api/stores/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('[Store Fetch] Requesting store:', slug);

    // 1. First check MongoDB
    let store = await Store.findOne({ slug });
    
    // 2. If not in MongoDB, get from data.js and save
    if (!store) {
      console.log('[Store Fetch] Store not found in DB, fetching from data.js');
      const storeData = new data.StoreData();
      const freshStoreData = await storeData.getStoreBySlug(slug);

      if (!freshStoreData) {
        console.log('[Store Fetch] Store not found in data.js');
        return res.status(404).json({ error: 'Store not found' });
      }

      // Save to MongoDB
      store = await Store.create(freshStoreData);
      console.log('[Store Fetch] Stored new store in DB:', store._id);
    } else {
      // 3. If store exists but is older than 24 hours, update it
      const lastUpdated = store.updatedAt || store.createdAt;
      const isStale = Date.now() - lastUpdated > 24 * 60 * 60 * 1000;

      if (isStale) {
        console.log('[Store Fetch] Updating stale store data');
        const storeData = new data.StoreData();
        const freshStoreData = await storeData.getStoreBySlug(slug);
        
        if (freshStoreData) {
          Object.assign(store, freshStoreData);
          await store.save();
          console.log('[Store Fetch] Updated store data');
        }
      }
    }

    // Log store details for debugging
    console.log('[Store Fetch] Returning store:', {
      id: store._id,
      slug: store.slug,
      title: store.title,
      updatedAt: store.updatedAt
    });

    return res.json(store);

  } catch (error) {
    console.error('[Store Fetch] Error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Update the sync endpoint to handle single store sync
app.post('/api/stores/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
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

// Add this temporarily to server.js right after connectDB()
const testInsert = async () => {
  try {
    const testStore = new Store({
      title: "Test Store",
      slug: "test-store",
      sys: { id: "test-123" }
    });
    const saved = await testStore.save();
    console.log("Test store saved:", saved);
  } catch (error) {
    console.error("Test insert failed:", error);
  }
};
await testInsert();

// Start the server
initializeServer();
