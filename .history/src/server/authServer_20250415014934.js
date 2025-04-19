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
    const accessToken = jwt.sign({ email: newUser.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
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
    res.json({ accessToken, refreshToken, email: user.email });
  } catch (error) {
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

// Store check-in endpoint
// Add this endpoint to authServer.js

// Store check-in endpoint
// app.post('/api/store/checkin', authenticateToken, async (req, res) => {
//   const { storeId, action } = req.body;
//   const userEmail = req.user.email;
  
//   console.log(`[authServer] ${action} request for store ${storeId} by user ${userEmail}`);
  
//   try {
//     // Find the user by email
//     const user = await UserModel.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     // Try to find the store first
//     let store = await StoreModel.findOne({ slug: storeId });
    
//     // If store doesn't exist, don't try to create it (skip that part)
//     // Just update the user's checked-in status
    
//     // Handle check-in logic
//     if (action === 'checkin') {
//       // Record the check-in in user data
//       user.checkedInStore = storeId;
      
//       // Add to the checkedInStores array for historical data
//       user.checkedInStores.push({
//         storeId: storeId,
//         checkedInAt: new Date()
//       });
      
//       // Record the visit in history
//       user.visitHistory.push({
//         storeId: storeId,
//         timestamp: new Date()
//       });
      
//       // Only update store if it exists
//       if (store) {
//         // Update the store's checkin count if interactions field exists
//         if (store.interactions) {
//           store.interactions.checkins = (store.interactions.checkins || 0) + 1;
//           await store.save();
//         }
//       }
      
//       await user.save();
      
//       // Emit socket event to notify clients
//       io.emit('user_checkin', { 
//         userId: user._id, 
//         storeId: storeId, 
//         timestamp: new Date() 
//       });
      
//       console.log(`[authServer] User ${userEmail} checked in to store ${storeId}`);
//       return res.status(200).json({ 
//         success: true, 
//         message: 'Checked in successfully',
//         storeId: storeId
//       });
      
//     } else if (action === 'checkout') {
//       // Clear check-in status
//       user.checkedInStore = null;
//       await user.save();
      
//       // Emit socket event to notify clients
//       io.emit('user_checkout', { 
//         userId: user._id, 
//         storeId: storeId, 
//         timestamp: new Date() 
//       });
      
//       console.log(`[authServer] User ${userEmail} checked out from store ${storeId}`);
//       return res.status(200).json({ 
//         success: true, 
//         message: 'Checked out successfully',
//         storeId: null
//       });
      
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid action' });
//     }
    
//   } catch (error) {
//     console.error(`[authServer] Check-in error:`, error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Server error processing check-in request',
//       error: error.message
//     });
//   }
// });

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
    
    // Find the store
    let store = await StoreModel.findOne({ slug: storeId });
    if (!store) {
      // Try to create a placeholder store if it doesn't exist
      store = new StoreModel({ 
        slug: storeId,
        title: storeId,
        interactions: {
          likes: 0,
          dislikes: 0,
          checkins: 0
        }
      });
      await store.save();
    }
    
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
      
      // Update the store's checkin count
      if (store.interactions) {
        store.interactions.checkins = (store.interactions.checkins || 0) + 1;
      }
      
      await user.save();
      await store.save();
      
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

// app.get('/api/user/checkedIn', authenticateToken, async (req, res) => {
//   try {
//     const user = await UserModel.findOne({ email: req.user.email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user.checkedInStore);
//   } catch (error) {
//     console.error('Error fetching checked-in stores:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      totalLikes: user.likedStore.length,
      totalDislikes: user.dislikedStore.length,
      // Add other user data as needed
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/impression', authenticateToken, async (req, res) => {
  console.log('Received impression request:', req.body);
  const { storeId, action } = req.body;
  const userEmail = req.user.email;

  console.log('User email:', userEmail);
  console.log('Store ID:', storeId);
  console.log('Action:', action);

  try {
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('User not found:', userEmail);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    let store = await Store.findOne({ storeId });
    if (!store) {
      console.log('Store not found, creating new store:', storeId);
      store = new Store({ storeId, likes: 0, dislikes: 0 });
    }

    console.log('Store before update:', store);

    const impressionUpdate = handleImpression(user, store, action, storeId);
    
    console.log('User before update:', user);
    console.log('Store before update:', store);

    // Update user document
    user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { likedStores: user.likedStores, dislikedStores: user.dislikedStores } },
      { new: true }
    );

    // Update store document
    store = await Store.findOneAndUpdate(
      { storeId: storeId },
      { $set: { likes: store.likes, dislikes: store.dislikes } },
      { new: true, upsert: true }
    );

    console.log('Impression update successful');
    console.log('Updated user:', user);
    console.log('Updated store:', store);

    io.emit('impression_update', { storeId, ...impressionUpdate });

    res.status(200).json({ message: 'Impression added successfully', ...impressionUpdate });
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

function authenticateToken(req, res, next) {
  console.log('Authenticating token...');
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('No auth header found');
    return res.status(401).json({ message: 'Access token is required' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in header');
    return res.status(401).json({ message: 'Access token is required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification error:', err.message);
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


const authPort = process.env.AUTHPORT || 4000;
httpServer.listen(authPort, () => console.log(`authServer running on port ${authPort}`));