import dotenv from 'dotenv';
import { makeServerRequest } from './utils/utils.server.js';
import express from 'express';
import path from 'path';
import http from 'http';
import { UserModel, StoreModel, storeOperations, connectDB } from "./data/mongodb/mongodb.js";
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

// Configure CORS
app.use(cors({
  // origin: ['http://localhost:3000'],  // Your frontend URL
  // methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

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

 // In server.js, add this route
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
    console.log(`[Server] Store data size: ${JSON.stringify(storeData).length} bytes`);
    
    if (!storeData) {
      console.error(`[Server] No store data provided for slug: ${slug}`);
      return res.status(400).json({ 
        success: false, 
        message: 'No store data provided' 
      });
    }
    
    console.log(`[Server] Processing store data for: ${storeData.hero?.storeName || slug}`);
    
    // Store the data exactly as received with minimal processing
    const result = await StoreModel.findOneAndUpdate(
      { slug: slug },
      { 
        ...storeData, 
        slug: slug,
        lastUpdated: new Date() 
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
    // console.error(`[Server] Error saving store data: ${error.message}`);
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

// Initialize MongoDB connection
// const initializeServer = async () => {
const initServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    

    // // Create endpoints directory if it doesn't exist
    // const endpointsDir = path.join(process.cwd(), 'endpoints');
    // if (!fs.existsSync(endpointsDir)) {
    //   fs.mkdirSync(endpointsDir, { recursive: true });
    // }

    // // Log available endpoints
    // const endpoints = [
    //   { method: 'POST', path: '/stores/sync/:slug', description: 'Sync store data by slug' },
    //   { method: 'GET', path: '/stores/:slug', description: 'Get store by slug' },
    //   { method: 'GET', path: '/stores', description: 'Get all stores' },
    //   { method: 'POST', path: '/stores/:storeId/interact', description: 'Interact with store (like, dislike, etc.)' }
    // ];
    
    // fs.writeFileSync(
    //   path.join(endpointsDir, 'endpoints.json'), 
    //   JSON.stringify(endpoints, null, 2)
    // );
    // console.log('API endpoints documented in /endpoints/endpoints.json');

    // // Start server on port 6000
    // const port = process.env.SERVERPORT || 6000;
    // app.listen(port, () => {
    //   console.log(`Server running on port ${port}`);
    //   console.log(`Store sync endpoint available at: http://localhost:${port}/stores/:slug`);

    const PORT = process.env.SERVERPORT || 6000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Store sync endpoint available at: http://localhost:${PORT}/api/stores/:slug`);
    });

  } catch (error) {
    // console.error('Server initialization failed:', error.message);
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
// initializeServer();
initServer();
