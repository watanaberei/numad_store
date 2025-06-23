import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { UserModel, StoreModel, storeOperations, connectDB } from "./data/mongodb/mongodb.js";

// import { User, Store, connectDB } from "./data/mongodb/mongodb.js";
// import { getStore } from '../client/API/api.js';

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
  origin: 'http://localhost:3000',
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

app.post('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // FIXED: Check cache first
    const cacheKey = `verify-${token}`;
    const cached = tokenCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TOKEN_CACHE_TTL) {
      console.log('[AuthServer] Using cached token verification');
      return res.json(cached.data);
    }
    
    // FIXED: Add timeout to JWT verification
    const verifyPromise = new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          reject(new Error('Invalid token'));
          return;
        }
        
        try {
          const user = await UserModel.findOne({ email: decoded.email }).maxTimeMS(5000);
          if (!user) {
            reject(new Error('User not found'));
            return;
          }
          
          const result = {
            valid: true,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          };
          
          // FIXED: Cache successful verification
          tokenCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    // FIXED: Add 5 second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Token verification timeout')), 5000);
    });
    
    const result = await Promise.race([verifyPromise, timeoutPromise]);
    res.json(result);
    
  } catch (error) {
    console.error('[AuthServer] Token verification error:', error.message);
    res.status(403).json({ message: 'Invalid token' });
  }
});

// FIXED: Refresh token endpoint with better error handling
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
  
  try {
    // FIXED: Add timeout to JWT verification
    const verifyPromise = new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          reject(new Error('Invalid refresh token'));
          return;
        }
        
        try {
          const user = await UserModel.findOne({ email: decoded.email }).maxTimeMS(5000);
          if (!user) {
            reject(new Error('User not found'));
            return;
          }
          
          const accessToken = jwt.sign(
            { 
              email: user.email,
              username: user.username,
              id: user._id 
            }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '90m' }
          );
          
          resolve({
            accessToken,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Refresh timeout')), 5000);
    });
    
    const result = await Promise.race([verifyPromise, timeoutPromise]);
    res.json(result);
    
  } catch (error) {
    console.error('[AuthServer] Token refresh error:', error.message);
    res.status(403).json({ message: 'Token refresh failed' });
  }
});

// FIXED: Auth check endpoint with caching
app.post('/auth', async (req, res) => {
  const { identifier } = req.body;
  console.log(`[AuthServer] Checking if user exists: ${identifier}`);
  
  if (!identifier || identifier.trim() === '') {
    return res.status(400).json({ message: 'Username or email is required', userExists: false });
  }

  try {
    const trimmedIdentifier = identifier.trim();
    
    // FIXED: Check cache first
    const cacheKey = `auth-check-${trimmedIdentifier}`;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      console.log('[AuthServer] Using cached auth check result');
      return res.json({ userExists: cached.userExists });
    }
    
    // FIXED: Add timeout to database query
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier).maxTimeMS(5000);
    const userExists = !!user;
    
    // Cache the result
    requestCache.set(cacheKey, {
      userExists,
      timestamp: Date.now()
    });
    
    console.log(`[AuthServer] User found: ${userExists} for identifier: ${trimmedIdentifier}`);
    res.json({ userExists });
    
  } catch (error) {
    console.error('[AuthServer] Error checking user:', error.message);
    res.status(500).json({ message: 'Server error', userExists: false });
  }
});

// FIXED: Login endpoint with better error handling and caching
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  console.log(`[AuthServer] Login attempt for identifier: ${identifier}`);
  
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required' });
  }
  
  try {
    const trimmedIdentifier = identifier.trim();
    
    // FIXED: Add timeout to database query
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier).maxTimeMS(5000);
    
    if (!user) {
      console.log(`[AuthServer] User not found for identifier: ${trimmedIdentifier}`);
      return res.status(400).json({ message: 'User not found' });
    }
    
    console.log(`[AuthServer] User found: ${user.username} (${user.email})`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AuthServer] Invalid password for user: ${user.username}`);
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    const accessToken = jwt.sign({ 
      email: user.email,
      username: user.username,
      id: user._id 
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '90m' });
    
    const refreshToken = jwt.sign({ 
      email: user.email,
      username: user.username,
      id: user._id 
    }, process.env.REFRESH_TOKEN_SECRET);
    
    refreshTokens.push(refreshToken);
    
    console.log(`[AuthServer] Login successful for user: ${user.username}`);
    
    const data = { 
      accessToken, 
      refreshToken, 
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    };
    
    res.json(data);
    
  } catch (error) {
    console.error('[AuthServer] Login error:', error.message);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// FIXED: Signup endpoint with better validation
app.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;
  
  console.log(`[AuthServer] Signup attempt for email: ${email}, username: ${username}`);
  
  // Validate required fields
  if (!email || !password || !username) {
    return res.status(400).json({ 
      message: 'Email, password, and username are all required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ 
      message: 'Please enter a valid email address' 
    });
  }
  
  // Validate username format
  const trimmedUsername = username.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    return res.status(400).json({ 
      message: 'Username can only contain letters, numbers, underscores, and dashes' 
    });
  }
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return res.status(400).json({ 
      message: 'Username must be between 3 and 30 characters' 
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  try {
    const trimmedEmail = email.trim();
    
    // FIXED: Add timeout to database query
    const existingUser = await UserModel.findOne({
      $or: [
        { email: trimmedEmail },
        { username: trimmedUsername.toLowerCase() }
      ]
    }).maxTimeMS(5000);
    
    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        console.log(`[AuthServer] Email already exists: ${trimmedEmail}`);
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        console.log(`[AuthServer] Username already exists: ${trimmedUsername}`);
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ 
      email: trimmedEmail, 
      password: hashedPassword,
      username: trimmedUsername.toLowerCase()
    });
    
    // FIXED: Add timeout to save operation
    await newUser.save({ maxTimeMS: 10000 });
    
    console.log(`[AuthServer] User created successfully: ${newUser.username} (${newUser.email})`);
    
    const accessToken = jwt.sign({ 
      email: newUser.email,
      username: newUser.username,
      id: newUser._id 
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '90m' });
    
    const refreshToken = jwt.sign({ 
      email: newUser.email,
      username: newUser.username,
      id: newUser._id 
    }, process.env.REFRESH_TOKEN_SECRET);
    
    refreshTokens.push(refreshToken);
    
    res.status(201).json({ 
      accessToken, 
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (error) {
    console.error('[AuthServer] Signup error:', error.message);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// FIXED: Username check with caching
app.post('/check-username', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  
  const trimmedUsername = username.trim();
  
  // Validate username format
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    return res.status(400).json({ 
      available: false,
      message: 'Username can only contain letters, numbers, underscores, and dashes' 
    });
  }
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return res.status(400).json({ 
      available: false,
      message: 'Username must be between 3 and 30 characters' 
    });
  }
  
  try {
    // FIXED: Check cache first
    const cacheKey = `username-check-${trimmedUsername}`;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return res.json(cached.data);
    }
    
    // FIXED: Add timeout to database query
    const existingUser = await UserModel.findOne({ 
      username: trimmedUsername.toLowerCase() 
    }).maxTimeMS(5000);
    
    const result = { 
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    };
    
    // Cache the result
    requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json(result);
  } catch (error) {
    console.error('[AuthServer] Error checking username:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


///////////////////////// END FIXED AUTHENTICATION ENDPOINTS /////////////////////////

///////////////////////// START USER PROFILE ENDPOINTS /////////////////////////


// FIXED: User profile endpoint with caching
app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`[AuthServer] Fetching profile for username: ${username}`);
    
    // FIXED: Add timeout to database query
    const user = await UserModel.findOne({ 
      username: username.toLowerCase() 
    }).maxTimeMS(5000);
    
    if (!user) {
      console.log(`[AuthServer] User not found: ${username}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[AuthServer] Profile found for: ${user.username}`);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        description: user.description,
        location: user.location,
        website: user.website,
        joinedAt: user.createdAt,
        profileStats: {
          checkedInStores: user.checkedInStores ? user.checkedInStores.length : 0,
          visitHistory: user.visitHistory ? user.visitHistory.length : 0
        }
      }
    });
  } catch (error) {
    console.error('[AuthServer] Error fetching user data:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// FIXED: Authentication middleware with timeout
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  // FIXED: Add timeout to JWT verification
  const verifyPromise = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        reject(new Error('Access token is not valid'));
      } else {
        resolve(user);
      }
    });
  });
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Auth timeout')), 5000);
  });
  
  Promise.race([verifyPromise, timeoutPromise])
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('[AuthServer] Token verification error:', error.message);
      res.status(403).json({ message: 'Access token is not valid' });
    });
}

// FIXED: User store data endpoint with better performance
app.get('/api/user/store', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  
  try {
    console.log(`[AuthServer] Fetching store data for user: ${userEmail}`);
    
    // FIXED: Add timeout and optimize query
    const user = await UserModel.findOne({ email: userEmail })
      .select('checkedInStore checkedInStores')
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const currentStore = user.checkedInStore;
    const recentCheckedInStores = user.checkedInStores ? 
      user.checkedInStores.slice(-6).reverse() : [];
    const storeIds = [...new Set([currentStore, ...recentCheckedInStores.map(store => store.storeId)])].filter(Boolean);
    
    console.log('[AuthServer] Fetching stores:', storeIds);

    // FIXED: Add timeout and limit to store query
    const stores = await StoreModel.find({ slug: { $in: storeIds } })
      .select('slug hero location')
      .limit(10)
      .maxTimeMS(5000);
    
    const storeData = stores.map(store => ({
      storeId: store.slug,
      storeInfo: {
        storeName: store.hero?.storeName || store.title,
        city: store.hero?.city || store.location?.city,
        state: store.hero?.state || store.location?.state,
        distance: store.hero?.distance,
        status: store.hero?.status,
        gallery: store.hero?.gallery || [],
        storeType: store.hero?.storeType || [],
        rating: store.hero?.rating,
        review_count: store.hero?.review_count
      }
    }));

    console.log(`[AuthServer] Returning data for ${storeData.length} stores`);

    return res.status(200).json({
      success: true,
      currentStore: currentStore,
      stores: storeData,
      checkedInStores: recentCheckedInStores
    });
    
  } catch (error) {
    console.error(`[AuthServer] Error fetching store data:`, error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching store data',
      error: error.message
    });
  }
});

// IMPROVED: Store check-in endpoint with better error handling
app.post('/api/user/store', authenticateToken, async (req, res) => {
  const { storeId, action } = req.body;
  const userEmail = req.user.email;
  
  console.log(`[checkin] ${action} request for store ${storeId} by user ${userEmail}`);
  
  if (!storeId || !action) {
    return res.status(400).json({ success: false, message: 'Store ID and action are required' });
  }
  
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (action === 'checkin') {
      // Initialize arrays if they don't exist
      if (!user.checkedInStores) user.checkedInStores = [];
      if (!user.visitHistory) user.visitHistory = [];
      
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
      
      await user.save();
      
      // Emit socket event to notify clients
      if (io) {
        io.emit('user_checkin', { 
          userId: user._id, 
          storeId: storeId, 
          timestamp: new Date() 
        });
      }
      
      console.log(`[checkin] User ${userEmail} checked in to store ${storeId}`);

      // Try to fetch store data
      let storeInfo = null;
      try {
        const storeData = await StoreModel.findOne({ slug: storeId });
        if (storeData) {
          storeInfo = {
            storeName: storeData.hero?.storeName || storeData.title,
            city: storeData.hero?.city || storeData.location?.city,
            state: storeData.hero?.state || storeData.location?.state,
            distance: storeData.hero?.distance,
            status: storeData.hero?.status,
            gallery: storeData.hero?.gallery || [],
            storeType: storeData.hero?.storeType || [],
            rating: storeData.hero?.rating,
            review_count: storeData.hero?.review_count
          };
        }
      } catch (storeError) {
        console.error('[checkin] Error fetching store data:', storeError);
        // Continue without store info
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Checked in successfully',
        storeId: storeId,
        storeInfo: storeInfo
      });
      
    } else if (action === 'checkout') {
      // Clear check-in status
      user.checkedInStore = null;
      await user.save();
      
      // Emit socket event to notify clients
      if (io) {
        io.emit('user_checkout', { 
          userId: user._id, 
          storeId: storeId, 
          timestamp: new Date() 
        });
      }
      
      console.log(`[checkin] User ${userEmail} checked out from store ${storeId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Checked out successfully',
        storeId: null
      });
      
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "checkin" or "checkout"' });
    }
    
  } catch (error) {
    console.error(`[checkin] Check-in error:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error processing check-in request',
      error: error.message
    });
  }
});

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


///////////////////////// END USER ACTIVITY ENDPOINTS /////////////////////////

///////////////////////// START IMPRESSION ENDPOINTS /////////////////////////

// IMPROVED: Store impression endpoint with better error handling
app.post('/api/store/impression', authenticateToken, async (req, res) => {
  console.log('[impression] Received impression request:', req.body);
  const { storeId, action, sectionId } = req.body;
  const userEmail = req.user.email;

  console.log('[impression] User email:', userEmail);
  console.log('[impression] Store ID:', storeId);
  console.log('[impression] Action:', action);

  if (!storeId || !action) {
    return res.status(400).json({ success: false, message: 'Store ID and action are required' });
  }

  if (!['like', 'dislike'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be "like" or "dislike"' });
  }

  try {
    let user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('[impression] User found:', user.username);

    // Initialize impression arrays if they don't exist
    if (!user.impressionsLiked) user.impressionsLiked = [];
    if (!user.impressionsDisliked) user.impressionsDisliked = [];

    let store = await StoreModel.findOne({ slug: storeId });
    if (!store) {
      console.log('[impression] Store not found, creating new store:', storeId);
      store = new StoreModel({ 
        slug: storeId,
        title: `Store ${storeId}`,
        interactions: { 
          likes: 0, 
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
          impressions: []
        } 
      });
    }

    // Initialize interactions if they don't exist
    if (!store.interactions) {
      store.interactions = {
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        impressions: []
      };
    }

    const impressionData = {
      userId: user._id,
      storeId: storeId,
      sectionId: sectionId || 'general',
      impressionAt: new Date(),
      action: action,
      timestamp: new Date()
    };
    
    if (action === 'like') {
      // Check if user hasn't already liked this section
      const existingLike = user.impressionsLiked.find(imp => imp.storeId === storeId && imp.sectionId === (sectionId || 'general'));
      if (!existingLike) {
        user.impressionsLiked.push(impressionData);
        
        // Remove any existing dislike for this section
        user.impressionsDisliked = user.impressionsDisliked.filter(imp => !(imp.storeId === storeId && imp.sectionId === (sectionId || 'general')));
        
        store.interactions.likes++;
        
        // Remove from disliked if previously disliked
        if (store.interactions.dislikedBy.includes(user._id)) {
          store.interactions.dislikes = Math.max(0, store.interactions.dislikes - 1);
          store.interactions.dislikedBy = store.interactions.dislikedBy.filter(id => !id.equals(user._id));
        }
        
        // Add to liked by
        if (!store.interactions.likedBy.includes(user._id)) {
          store.interactions.likedBy.push(user._id);
        }
      } else {
        console.log('[impression] User already liked this section');
      }
    } else if (action === 'dislike') {
      // Check if user hasn't already disliked this section
      const existingDislike = user.impressionsDisliked.find(imp => imp.storeId === storeId && imp.sectionId === (sectionId || 'general'));
      if (!existingDislike) {
        user.impressionsDisliked.push(impressionData);
        
        // Remove any existing like for this section
        user.impressionsLiked = user.impressionsLiked.filter(imp => !(imp.storeId === storeId && imp.sectionId === (sectionId || 'general')));
        
        store.interactions.dislikes++;
        
        // Remove from liked if previously liked
        if (store.interactions.likedBy.includes(user._id)) {
          store.interactions.likes = Math.max(0, store.interactions.likes - 1);
          store.interactions.likedBy = store.interactions.likedBy.filter(id => !id.equals(user._id));
        }
        
        // Add to disliked by
        if (!store.interactions.dislikedBy.includes(user._id)) {
          store.interactions.dislikedBy.push(user._id);
        }
      } else {
        console.log('[impression] User already disliked this section');
      }
    }

    // Add impression to store's interactions
    store.interactions.impressions.push(impressionData);

    await user.save();
    await store.save();

    // Emit socket event to notify clients
    if (io) {
      io.emit('user_impression', { 
        userId: user._id, 
        storeId: storeId, 
        sectionId: sectionId,
        action: action,
        timestamp: new Date() 
      });
    }
    
    console.log(`[impression] User ${userEmail} ${action}d store ${storeId}, section ${sectionId || 'general'}`);
    return res.status(200).json({ 
      success: true, 
      message: `Impression ${action} recorded successfully`,
      storeId: storeId,
      sectionId: sectionId || 'general',
      likes: store.interactions.likes,
      dislikes: store.interactions.dislikes
    });

  } catch (error) {
    console.error('[impression] Error adding impression:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding impression', 
      error: error.message 
    });
  }
});

///////////////////////// END IMPRESSION ENDPOINTS /////////////////////////

///////////////////////// START AUTHENTICATION MIDDLEWARE /////////////////////////


app.post('/settings', authenticateToken, async (req, res) => {
  const { firstName, lastName, birthdate, description, location, website, fullName, phoneNumber } = req.body;
  const userEmail = req.user.email;

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update fields that are provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (birthdate !== undefined) user.birthdate = birthdate;
    if (description !== undefined) user.description = description;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (fullName !== undefined) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    
    await user.save();

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

///////////////////////// END USER PROFILE ENDPOINTS /////////////////////////

///////////////////////// START USER ACTIVITY ENDPOINTS /////////////////////////

  
// Update the profile endpoint to include username
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await UserModel.findOne({ email: req.user.email });
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: profile._id,
      email: profile.email,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthdate: profile.birthdate,
      description: profile.description,
      location: profile.location,
      website: profile.website,
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update the user endpoint to include username
app.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: user.birthdate,
      description: user.description,
      location: user.location,
      website: user.website,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});
// app.get('/user', authenticateToken, async (req, res) => {
//   try {
//     const user = await UserModel.findOne({ email: req.user.email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json({
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       birthdate: user.birthdate,
//       description: user.description,
//       location: user.location,
//       website: user.website,
//       fullName: user.fullName,
//       phoneNumber: user.phoneNumber
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching user data' });
//   }
// });

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      checkedInStore: user.checkedInStore,
      checkedInStores: user.checkedInStores || [],
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
    res.json({
      checkedInStore: user.checkedInStore
    });
  } catch (error) {
    console.error('Error fetching checked-in stores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { username, description, location, website, fullName, email, phoneNumber } = req.body;
    
    // Validate username
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Invalid username format' });
    }

    // Validate description
    if (description && description.length > 600) {
      return res.status(400).json({ message: 'Description exceeds 600 characters' });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: req.user.email },
      { 
        username, 
        description, 
        location, 
        website, 
        fullName, 
        email, 
        phoneNumber 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET endpoint to fetch user profile data
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      username: user.username,
      description: user.description,
      location: user.location,
      website: user.website,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }
    console.log('[authServer.js GET /api/user/profile] Fetching user data:', userData);

    return res.status(200).json({
      success: true,
      userData: userData,
    });
    
    
  } catch (error) {
    console.error(`[authServer] Error fetching user data:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user data',
      error: error.message
    });
  }
});
  


// Store check-in endpoint
app.post('/api/user/store', authenticateToken, async (req, res) => {
  const { storeId, action } = req.body;
  const userEmail = req.user.email;
  
  console.log(`[authServer] ${action} request for store ${storeId} by user ${userEmail}`);
  
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Fetch up to 6 most recent checked-in stores
    const recentCheckedInStores = user.checkedInStores.slice(-6).reverse();
    const storeIds = recentCheckedInStores.map(store => store.storeId);
    console.log('[authServer.js.api/user/store] Store:', storeIds);

    // Find stores matching the recent check-ins
    const stores = await StoreModel.find({ slug: { $in: storeIds } }).limit(6);
    
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
      
      // Find the current store in the fetched stores
      const currentStore = stores.find(store => store.slug === storeId);
      
      // Only update store if it exists
      if (currentStore) {
        // Update the store's checkin count if interactions field exists
        if (currentStore.interactions) {
          currentStore.interactions.checkins = (currentStore.interactions.checkins || 0) + 1;
          await currentStore.save();
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

      // Fetch store data for the checked-in store
      const storeData = await StoreModel.findOne({ slug: storeId });
      const storeInfo = storeData ? {
        storeName: storeData.hero.storeName,
        city: storeData.hero.city,
        state: storeData.hero.state,
        distance: storeData.hero.distance,
        status: storeData.hero.status,
        gallery: storeData.hero.gallery,
        storeType: storeData.hero.storeType,
        rating: storeData.hero.rating,
        review_count: storeData.hero.review_count
      } : null;

      return res.status(200).json({ 
        success: true, 
        message: 'Checked in successfully',
        storeId: storeId,
        storeInfo: storeInfo
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

// GET endpoint to fetch store data
app.get('/api/user/store', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get current check-in and recent history
    const currentStore = user.checkedInStore;
    const recentCheckedInStores = user.checkedInStores.slice(-6).reverse();
    const storeIds = [...new Set([currentStore, ...recentCheckedInStores.map(store => store.storeId)])].filter(Boolean);
    
    console.log('[authServer.js GET /api/user/store] Fetching stores:', storeIds);

    // Find stores matching the IDs
    const stores = await StoreModel.find({ slug: { $in: storeIds } });
    
    // Map store data to include only necessary fields
    const storeData = stores.map(store => ({
      storeId: store.slug,
      storeInfo: {
        storeName: store.hero.storeName,
        city: store.hero.city,
        state: store.hero.state,
        distance: store.hero.distance,
        status: store.hero.status,
        gallery: store.hero.gallery,
        storeType: store.hero.storeType,
        rating: store.hero.rating,
        review_count: store.hero.review_count
      }
    }));

    return res.status(200).json({
      success: true,
      currentStore: currentStore,
      stores: storeData,
      checkedInStores: recentCheckedInStores
    });
    
  } catch (error) {
    console.error(`[authServer] Error fetching store data:`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error fetching store data',
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


function authenticateToken(req, res, next) {
  console.log('Authenticating token...');
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader) {
    console.log('No auth header found');
    return res.status(401).json({ message: 'Access token is required' });
  }

  // const token = authHeader && authHeader.split(' ')[1];
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in header');
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

///////////////////////// CLEAN UP FUNCTIONS /////////////////////////

// FIXED: Clean up caches periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  
  // Clean token cache
  for (const [key, value] of tokenCache.entries()) {
    if (now - value.timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(key);
    }
  }
  
  // Clean request cache
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > 60000) { // 1 minute
      requestCache.delete(key);
    }
  }
  
  // Clean rate limit map
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
  
  console.log(`[AuthServer] Cache cleanup completed. Token cache: ${tokenCache.size}, Request cache: ${requestCache.size}, Rate limit: ${rateLimitMap.size}`);
}, 120000); // Every 2 minutes

const authPort = process.env.AUTHPORT || 4000;
httpServer.listen(authPort, () => {
  console.log(`[AuthServer] Server running on port ${authPort}`);
  console.log(`[AuthServer] Memory usage:`, process.memoryUsage());
});
