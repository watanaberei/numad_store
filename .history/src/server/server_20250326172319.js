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

// Update the initializeServer function
const initializeServer = async (slug) => {
  try {
    // 1. Connect to DB first
    await connectDB();
    console.log('[Init] MongoDB connected successfully');

    // Normalize the slug to match database format
    const normalizedSlug = slug.toLowerCase().replace(/-/g, '_');
    console.log('[Init] Normalized slug:', normalizedSlug);

    // 2. Initialize store data
    console.log('[Init] Starting initial store sync');
    const storeData = new data.StoreData();
    
    // 3. Get store data using the provided slug
    console.log('[Init] Fetching store with slug:', normalizedSlug);
    const storeDetails = await storeData.store(normalizedSlug);
    // Write store details to file for debugging
    const storesDir = path.join(process.cwd(), '_specs', 'stores');
    if (!fs.existsSync(storesDir)) {
      fs.mkdirSync(storesDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(storesDir, `store_${slug}.json`), 
      JSON.stringify(storeDetails, null, 2)
    );

    if (!storeDetails) {
      console.error('[Init] No store found for slug:', normalizedSlug);
      throw new Error('Failed to fetch initial store data');
    }

        // Store the data in MongoDB
        const store = await Store.findOneAndUpdate(
          { slug: slug },
          storeDetails,
          { 
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );
        

    console.log('[Init] Store details found:', {
      title: storeDetails.title,
      slug: storeDetails.slug,
      location: storeDetails.location
    });

    // Format store data
    const storeDoc = {
      title: storeDetails.title,
      // slug: storeDetails.slug,
      slug: normalizedSlug,
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

    // 4. Save store in MongoDB
    try {
      const store = await Store.findOneAndUpdate(
        // { slug: slug },
        { slug: normalizedSlug },
        { $set: storeDoc },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );
      console.log('[Init] Store saved/updated:', {
        _id: store._id,
        slug: store.slug,
        title: store.title
      });
    } catch (error) {
      console.error('[Init] Error saving store:', error.message);
      throw error;
    }

    // 5. Start server if not already running
    if (!app.listening) {
      const port = process.env.SERVERPORT || 6000;
      app.listen(port, () => {
        console.log(`[Init] Server running on port ${port}`);
      });
    }

  } catch (error) {
    console.error('[Init] Server initialization failed:', error.message);
    throw error; // Let the caller handle the error
  }
};




const initializeDatabase = async (slug) => {
  try {
    // 1. Connect to DB first
    await connectDB();
    // // console.log('[Init] MongoDB connected successfully');

    // 2. Initialize store data
    // // console.log('[Init] Starting initial store sync');
    const storeData = new data.StoreData();
    
    // 3. Get store data using the provided slug
    // // console.log('[Init] Fetching store with slug:', slug);
    const storeDetails = await storeData.store(slug);
    // // console.log('[Init] Store details:', storeDetails.slug);

    if (!storeDetails) {
      // // console.log('[Init] No store found for slug:', slug);
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
      // // console.log('[Init] Test store created/updated:', {
      //   _id: store._id,
      //   slug: store.slug,
      //   title: store.title
      // });
    } catch (error) {
      // // console.error('[Init] Error creating test store:', error);
      console.error('[Init] Error creating test store:');
      throw error;
    }

    // 5. Start server
    const port = process.env.SERVERPORT || 6000;
    // app.listen(port, () => {
    //   console.log(`[Init] Server running on port ${port}`);
    // });

  } catch (error) {
    // // console.error('[Init] Server initialization failed:', error);
    console.error('[Init] Server initialization failed:');
    process.exit(1);
  }
};



// Update the store visit endpoint
app.post('/api/stores/visit/:slug', authenticateUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.email;
    // // console.log('[Store Visit] Recording visit:', { slug, userId });

    await initializeServer(slug);


    // 1. Get store data from StoreData
    const storeData = new data.StoreData();
    const storeDetails = await storeData.store(slug); // Use store() instead of getStoreBySlug()
    // // console.log('[Store Visit] Store details fetched:', storeDetails?.title);

    if (!storeDetails) {
      // // console.error('[Store Visit] Store not found:', slug);
      console.error('[Store Visit] Store not found:');
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
    // // console.log('[Store Visit] Store saved/updated:', store._id);

    // 3. Update user's visited stores if user is logged in
    if (userId) {
      const user = await User.findOne({ email: userId });
      if (!user) {
        // // console.error('[Store Visit] User not found:', userId);
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
        // // console.log('[Store Visit] Added to user history:', user.email);
      }
    }

    res.json({ 
      success: true,
      store: {
        _id: store._id,
        title: store.title,
        slug: store.slug
      }
    });

  } catch (error) {
    console.error('[Store Visit] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.get('/api/stores/test', async (req, res) => {
  try {
    const stores = await Store.find({}).lean();
    // // console.log(`Found ${stores.length} stores in database`);
    
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
    // // console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Store sync endpoint
app.post('/api/stores/sync', async (req, res) => {
  try {
    const result = await storeOperations.syncStoreData();
    res.json({ success: true, stores: result });
  } catch (error) {
    // // console.error('Store sync error:', error);
    console.error('Store sync error:');
    res.status(500).json({ error: 'Failed to sync stores' });
  }
});

// Store fetch endpoint
app.get('/api/stores/:slug', async (req, res) => {
  try {
    
    const { slug } = req.params;
    // // console.log('[Store Fetch] Captured slug:', slug);
    // // console.log('[Store Fetch] Requesting store:', slug);
    // 1. First check MongoDB
    let store = await Store.findOne({ slug });
    
    // 2. If not in MongoDB, get from data.js and save
    if (!store) {
      // // console.log('[Store Fetch] Store not found in DB, fetching from data.js');
      const storeData = new data.StoreData();
      const freshStoreData = await storeData.getStoreBySlug(slug);

      if (!freshStoreData) {
        // // console.log('[Store Fetch] Store not found in data.js');
        return res.status(404).json({ error: 'Store not found' });
      }

      // Save to MongoDB
      store = await Store.create(freshStoreData);
      await initializeServer(store.slug);
      res.json({ success: true });
   
      // // console.log('[Store Fetch] Stored new store in DB:', store._id);
    } else {
      // 3. If store exists but is older than 24 hours, update it
      const lastUpdated = store.updatedAt || store.createdAt;
      const isStale = Date.now() - lastUpdated > 24 * 60 * 60 * 1000;

      if (isStale) {
        // // console.log('[Store Fetch] Updating stale store data');
        const storeData = new data.StoreData();
        const freshStoreData = await storeData.getStoreBySlug(slug);
        
        if (freshStoreData) {
          Object.assign(store, freshStoreData);
          await store.save();
          // // console.log('[Store Fetch] Updated store data');
        }
      }
    }

    // Log store details for debugging
    // // console.log('[Store Fetch] Returning store:', {
    //   id: store._id,
    //   slug: store.slug,
    //   title: store.title,
    //   updatedAt: store.updatedAt
    // });

    return res.json(store);

  } catch (error) {
    // // console.error('[Store Fetch] Error:', error);
    console.error('[Store Fetch] Error:');
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Update the sync endpoint to handle single store sync
app.post('/api/stores/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // // console.log('[Store Sync] Captured slug:', slug);
    // // console.log('[Store Sync] Syncing store:', slug);

    const storeData = new data.StoreData();
    const freshStoreData = await storeData.getStoreBySlug(slug);

    if (!freshStoreData) {
      // // console.log('[Store Sync] Store not found in data.js');
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

    // // console.log('[Store Sync] Store synced successfully:', store._id);
    res.json({ success: true, store });

  } catch (error) {
    // // console.error('[Store Sync] Error:', error);
    res.status(500).json({ error: 'Failed to sync store' });
  }
});

// // Create a function to get the current store slug
// const getCurrentStoreSlug = () => {
//   const request = parseRequestUrl();
//   console.log('[Init] Parsed request URL:', request);
  
//   // If no slug in URL, use a fallback
//   if (!request.slug) {
//     console.log('[Init] No slug in URL, using fallback store');
//     return 'ca_orange-county_newport_blueBottle-coffee';
//   }
  
//   console.log('[Init] Using slug from URL:', request.slug);
//   return request.slug;
// };
// Start the server with dynamic slug
// const initializeServer = async () => {
//   try {
//     const server = http.createServer(app);
//     const port = process.env.PORT || 4000;
    
//     server.listen(port, () => {
//       console.log(`Server running at http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// };
// Initialize server with API endpoint to handle dynamic store initialization
app.get('/api/init-store/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    await initializeServer(slug);
    res.json({ success: true });
  } catch (error) {
    // // console.error('Failed to initialize store:', error);
    console.error('Failed to initialize store:');
    res.status(500).json({ error: error.message });
  }
});








// Start server with default configuration
const port = process.env.SERVERPORT || 6000;

const API_URL = 'http://localhost:3000';
// Get store slug using server-side request
const getStoreSlug = async () => {
  try {
    // Make server-side request to get store data
    const storeData = await makeServerRequest(`${API_URL}/api/stores/current`, 'POST');
    console.log('[Server] Got store data:', storeData);
    return storeData.slug;
  } catch (error) {
    // // console.error('[Server] Error getting store slug:', error);
    console.error('[Server] Error getting store slug:');
    // Return default slug if request fails
    return 'ca_los-angeles-county_cerritos_smoking-tiger-bread-factory';
  }
};

// Initialize server with store data
const initServer = async () => {
  try {
    const slug = await getStoreSlug();
    console.log('[Server] Initializing with slug:', slug);
    await initializeServer(slug);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Store initialized with slug: ${slug}`);
    });

  } catch (error) {
    // // console.error('[Server] Error during initialization:');
    console.log('[Server] Attempting initialization with default store...');
    await initializeServer('ca_los-angeles-county_cerritos_smoking-tiger-bread-factory');
  }
};

// Start server
initServer();



// // Start server with default configuration
// const port = process.env.SERVERPORT || 6000;



// // Get store slug from URL
// const getStoreSlug = () => {
//   const request = parseRequestUrl();
//   console.log('[Server] Parsed request URL:', request);
  
//   // Use default slug if none in URL
//   if (!request.slug) {
//     console.log('[Server] No slug in URL, using default store');
//     // return 'ca_orange-county_newport_blueBottle-coffee';
//     return request.slug;
//   }
  
//   console.log('[Server] Using slug from URL:', request.slug);
//   return request.slug;
// };

// // Initialize server with store data
// const initServer = async () => {
//   try {
//     const slug = getStoreSlug();
//     console.log('[Server] Initializing with slug:', slug);
//     await initializeServer(slug);

//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//       console.log(`Store initialized with slug: ${slug}`);
//     });

//   } catch (error) {
//     console.error('[Server] Error during initialization:', error);
//     // Don't exit process, try with default store
//     console.log('[Server] Attempting initialization with default store...');
//     await initializeServer('ca_orange-county_newport_blueBottle-coffee');
//   }
// };

// // Start server
// initServer();
