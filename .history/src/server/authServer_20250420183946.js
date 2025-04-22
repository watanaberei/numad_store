import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { UserModel, StoreModel, storeOperations, connectDB } from "./data/mongodb/mongodb.js";

// import { User, Store, connectDB } from "./data/mongodb/mongodb.js";
import { getStore } from '../../src/client/api.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

let refreshTokens = [];

// Initialize MongoDB connection
connectDB().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    // const accessToken = jwt.sign({ email: newUser.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const accessToken = jwt.sign({ email: newUser.email }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign({ email: newUser.email }, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    const data = { accessToken, refreshToken, email: user.email };
    res.json(data);
    
    // Remove client-side localStorage operations from server
    // The client should handle storing tokens after receiving the response

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/settings', authenticateToken, async (req, res) => {
  const { firstName, lastName, birthdate } = req.body;
  const userEmail = req.user.email;

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthdate = birthdate;
    await user.save();

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Store check-in endpoint (simplified)
app.post('/api/store/checkin', authenticateToken, async (req, res) => {
  const { storeId, action } = req.body;
  const userEmail = req.user.email;
  
  console.log(`[authServer] ${action} request for store ${storeId} by user ${userEmail}`);
  
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Handle check-in/checkout without creating a new store
    if (action === 'checkin') {
      // Record the check-in in user data
      user.checkedInStore = storeId;
      
      // Add to the checkedInStores array if it exists
      if (Array.isArray(user.checkedInStores)) {
        user.checkedInStores.push({
          storeId: storeId,
          checkedInAt: new Date()
        });
      }
      
      // Record the visit in history if it exists
      if (Array.isArray(user.visitHistory)) {
        user.visitHistory.push({
          storeId: storeId,
          timestamp: new Date()
        });
      }
      
      await user.save();
      
      // Emit socket event to notify clients if socket.io is available
      if (io) {
        io.emit('user_checkin', { 
          userId: user._id, 
          storeId: storeId, 
          timestamp: new Date() 
        });
      }
      
      console.log(`[authServer] User ${userEmail} checked in to store ${storeId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Checked in successfully',
        storeId: storeId
      });
      
    } else if (action === 'checkout') {
      // Clear check-in status
      user.checkedInStore = null;
      await user.save();
      
      // Emit socket event to notify clients if socket.io is available
      if (io) {
        io.emit('user_checkout', { 
          userId: user._id, 
          storeId: storeId, 
          timestamp: new Date() 
        });
      }
      
      console.log(`[authServer] User ${userEmail} checked out from store ${storeId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Checked out successfully',
        storeId: null
      });
      
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    
  } catch (error) {
    console.error(`[authServer] Check-in error:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error processing check-in request',
      error: error.message
    });
  }
});

// In authServer.js
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  // Verify the refresh token is in our list
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
  
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Create a new access token
    const accessToken = jwt.sign(
      { email: user.email }, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '30m' }
    );
    
    res.json({ accessToken });
  });
});

// USER ONLY [GET]
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: user.birthdate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      totalLikes: user.likedStore.length,
      totalDislikes: user.dislikedStore.length,
      checkedInStore: user.checkedInStore,
      checkedInStores: user.checkedInStores,
      savedStores: user.savedStores,
      visitHistory: user.visitHistory,
      likedStores: user.likedStores,
      dislikedStores: user.dislikedStores,
      impressionsLiked: user.impressionsLiked,
      impressionsDisliked: user.impressionsDisliked
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user/checkedIn', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.checkedInStore);
  } catch (error) {
    console.error('Error fetching checked-in stores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Store check-in endpoint
// Add this endpoint to authServer.js

// Store check-in endpoint
app.post('/api/store/checkin', authenticateToken, async (req, res) => {
  const { storeId, action } = req.body;
  const userEmail = req.user.email;
  
  console.log(`[authServer] ${action} request for store ${storeId} by user ${userEmail}`);
  
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Try to find the store first
    let store = await StoreModel.findOne({ slug: storeId });
    
    // If store doesn't exist, don't try to create it (skip that part)
    // Just update the user's checked-in status
    
    // Handle check-in logic
    if (action === 'checkin') {
      // Record the check-in in user data
      user.checkedInStore = storeId;
      
      // Add to the checkedInStores array for historical data
      user.checkedInStores.push({
        storeId: storeId,
        checkedInAt: new Date()
      });
      
      // Record the visit in history
      user.visitHistory.push({
        storeId: storeId,
        timestamp: new Date()
      });
      
      // Only update store if it exists
      if (store) {
        // Update the store's checkin count if interactions field exists
        if (store.interactions) {
          store.interactions.checkins = (store.interactions.checkins || 0) + 1;
          await store.save();
        }
      }
      
      await user.save();
      
      // Emit socket event to notify clients
      io.emit('user_checkin', { 
        userId: user._id, 
        storeId: storeId, 
        timestamp: new Date() 
      });
      
      console.log(`[authServer] User ${userEmail} checked in to store ${storeId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Checked in successfully',
        storeId: storeId
      });
      
    } else if (action === 'checkout') {
      // Clear check-in status
      user.checkedInStore = null;
      await user.save();
      
      // Emit socket event to notify clients
      io.emit('user_checkout', { 
        userId: user._id, 
        storeId: storeId, 
        timestamp: new Date() 
      });
      
      console.log(`[authServer] User ${userEmail} checked out from store ${storeId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Checked out successfully',
        storeId: null
      });
      
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    
  } catch (error) {
    console.error(`[authServer] Check-in error:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error processing check-in request',
      error: error.message
    });
  }
});

// Get user's check-in status
app.get('/api/store/checkin/status', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      checkedInStore: user.checkedInStore
    });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});





app.post('/api/store/impression', authenticateToken, async (req, res) => {
  console.log('Received impression request:', req.body);
  const { storeId, action, sectionId } = req.body;
  const userEmail = req.user.email;

  console.log('User email:', userEmail);
  console.log('Store ID:', storeId);
  console.log('Action:', action);

  try {
    let user = await UserModel.findOne({ email: userEmail });
    let store = await StoreModel.findOne({ storeId });
    if (!user) {
      return res.status(404).json({ success: false, message: '[authServer./api/store/impression] User not found' });
    }

    console.log('User found:', user);

    // let store = await StoreModel.findOne({ storeId });
    // if (!store) {
    //   console.log('Store not found, creating new store:', storeId);
    //   user.likedI
    //   // store = new StoreModel({ storeId, likes: 0, dislikes: 0 });
    if (!store) {
      console.log('Store not found, creating new store:', storeId);
      store = new StoreModel({ 
        storeId, 
        interactions: { 
          likes: 0, 
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
          impressions: []
        } 
      });
    }

    const impressionData = {
      userId: user._id,
      storeId: storeId,
      sectionId: sectionId,
      impressionAt: new Date(),
      action: action,
      timestamp: new Date()
    };

    // if (Array.isArray(user.impressionsLiked)) {
    //   user.impressionsLiked.push({
    //     storeId: storeId,
    //     sectionId: sectionId,
    //     impressionAt: new Date()
    //   });
    // }
    // if (Array.isArray(user.impressionsDisliked)) {
    //   user.impressionsDisliked.push({
    //     storeId: storeId,
    //     sectionId: sectionId,
    //     impressionAt: new Date()
    //   });
    // }
    
    if (action === 'like') {
      if (!user.impressionsLiked.some(imp => imp.storeId === storeId && imp.sectionId === sectionId)) {
        user.impressionsLiked.push(impressionData);
        user.impressionsDisliked = user.impressionsDisliked.filter(imp => !(imp.storeId === storeId && imp.sectionId === sectionId));
        store.interactions.likes++;
        if (store.interactions.dislikedBy.includes(user._id)) {
          store.interactions.dislikes--;
          store.interactions.dislikedBy = store.interactions.dislikedBy.filter(id => !id.equals(user._id));
        }
        store.interactions.likedBy.addToSet(user._id);
      }
    } else if (action === 'dislike') {
      if (!user.impressionsDisliked.some(imp => imp.storeId === storeId && imp.sectionId === sectionId)) {
        user.impressionsDisliked.push(impressionData);
        user.impressionsLiked = user.impressionsLiked.filter(imp => !(imp.storeId === storeId && imp.sectionId === sectionId));
        store.interactions.dislikes++;
        if (store.interactions.likedBy.includes(user._id)) {
          store.interactions.likes--;
          store.interactions.likedBy = store.interactions.likedBy.filter(id => !id.equals(user._id));
        }
        store.interactions.dislikedBy.addToSet(user._id);
      }
    }

    // Add impression to store's interactions
    store.interactions.impressions.push(impressionData);

    await user.save();
    await store.save();

    // Emit socket event to notify clients if socket.io is available
    if (io) {
      io.emit('user_impression', { 
        userId: user._id, 
        storeId: storeId, 
        sectionId: sectionId,
        action: action,
        timestamp: new Date() 
      });
    }
    
    console.log(`[authServer] User ${userEmail} impressioned ${action} in store ${storeId}, section ${sectionId}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Impression ' + action + ' successfully',
      storeId: storeId,
      sectionId: sectionId,
      likes: store.interactions.likes,
      dislikes: store.interactions.dislikes
    });

      //  } else if (action === 'checkout') {
      // // Clear check-in status
      // user.checkedInStore = null;
      // await user.save();
      
      // // Emit socket event to notify clients if socket.io is available
      // if (io) {
      //   io.emit('user_checkout', { 
      //     userId: user._id, 
      //     storeId: storeId, 
      //     timestamp: new Date() 
      //   });
      // }


    // console.log('Store before update:', store);

    // const impressionUpdate = handleImpression(user, store, action, storeId);
    
    // console.log('User before update:', user);
    // console.log('Store before update:', store);

    // // Update user document
    // user = await UserModel.findOneAndUpdate(
    //   { email: userEmail },
    //   { $set: { likedStores: user.impressionsDisliked, impressionsLiked: user.impressionsDisliked } },
    //   { new: true }
    // );

    // // Update store document
    // store = await StoreModel.findOneAndUpdate(
    //   { storeId: storeId },
    //   { $set: { likes: store.likes, dislikes: store.dislikes } },
    //   { new: true, upsert: true }
    // );

    // console.log('Impression update successful');
    // console.log('Updated user:', user);
    // console.log('Updated store:', store);

    // io.emit('impression_update', { storeId, ...impressionUpdate });

    // res.status(200).json({ message: 'Impression added successfully', ...impressionUpdate });
  } catch (error) {
    console.error('Error adding impression:', error);
    res.status(500).json({ message: 'Error adding impression', error: error.message });
  }
});


function handleImpression(user, store, action, storeId) {
  console.log('Handling impression:', { user: user._id, store: store._id, action, storeId });

  let likes = store.likes;
  let dislikes = store.dislikes;

  switch (action) {
    case 'like':
      if (!user.likedStores.includes(storeId)) {
        user.likedStores.push(storeId);
        user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
        likes++;
        if (user.dislikedStores.includes(storeId)) {
          dislikes--;
        }
      }
      break;
    case 'dislike':
      if (!user.dislikedStores.includes(storeId)) {
        user.dislikedStores.push(storeId);
        user.likedStores = user.likedStores.filter(id => id !== storeId);
        dislikes++;
        if (user.likedStores.includes(storeId)) {
          likes--;
        }
      }
      break;
  }

  store.likes = likes;
  store.dislikes = dislikes;

  console.log('Impression handled:', { likes, dislikes });

  return { likes, dislikes };
}

// function authenticateToken(req, res, next) {
//   console.log('Authenticating token...');
//   const authHeader = req.headers['authorization'];
//   console.log('Auth header:', authHeader);
  
//   if (!authHeader) {
//     console.log('No auth header found');
//     return res.status(401).json({ message: 'Access token is required' });
//   }
  
//   const token = authHeader.split(' ')[1];
//   if (!token) {
//     console.log('No token found in header');
//     return res.status(401).json({ message: 'Access token is required' });
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       console.log('Token verification error:', err.message);
//       return res.status(403).json({ message: 'Access token is not valid' });
//     }
    
//     console.log('Token verified successfully for user:', user.email);
//     req.user = user;
//     next();
//   });
// }

function authenticateToken(req, res, next) {
  console.log('Authenticating token...');
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader && authHeader.split(' ')[1];
  
  // const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  console.log('Verifying token...');
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ message: 'Access token is not valid' });
    }
    
    console.log('Token verified successfully for user:', user.email);
    req.user = user;
    next();
  });
}

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Access token is required' });
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: 'Access token is not valid' });
//     }
//     req.user = user;
//     next();
//   });
// }

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = process.env.ACCESS_TOKEN_SECRET;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch('http://localhost:4000/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    localStorage.setItem(accessToken, data.accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login or handle accordingly
    window.location.href = '/login';
    throw error;
  }
};

const authPort = process.env.AUTHPORT || 4000;
httpServer.listen(authPort, () => console.log(`authServer running on port ${authPort}`));