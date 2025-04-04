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
const initServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    const PORT = process.env.SERVERPORT || 6000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Store sync endpoint available at: http://localhost:${PORT}/api/stores/:slug`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initServer();
