import dotenv from 'dotenv';
import { makeServerRequest } from './utils/utils.server.js';
import express from 'express';
import path from 'path';
import http from 'http';
import { User, StoreModel, storeOperations, connectDB } from "./data/mongodb/mongodb.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';

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
    if (req.params.id) {
      stores = await StoreModel.findById(req.params.id);
      if (!stores) {
        return res.status(404).json({ error: 'StoreModel not found' });
      }
    } else {
      stores = await StoreModel.find({});
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

// Initialize MongoDB and start server
const initializeServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('MongoDB connected successfully');

    // Initialize store data
    const result = await storeOperations.syncStoreData('ca_orange-county_fullerton_dripp');
    console.log('Initial store sync complete:', result ? 'Success' : 'Failed');

    // Start server only after DB is connected
    const port = process.env.SERVERPORT || 6000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
};

// API Routes
app.get('/api/stores/test', async (req, res) => {
  try {
    const stores = await StoreModel.find({}).lean();
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
    const store = await storeOperations.getOrCreateStoreBySlug(req.params.slug);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    return res.json(store);
  } catch (error) {
    console.error('Store fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Start the server
initializeServer();