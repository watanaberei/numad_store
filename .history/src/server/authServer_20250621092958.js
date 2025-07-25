///////////////////////// START FIXED AUTHENTICATION SERVER /////////////////////////
// authServer.js - FIXED VERSION with proper caching and error handling

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { UserModel, StoreModel, storeOperations, connectDB } from "./data/mongodb/mongodb.js";

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

// FIXED: Add missing cache implementations
const tokenCache = new Map();
const requestCache = new Map();
const rateLimitMap = new Map();
const TOKEN_CACHE_TTL = 300000; // 5 minutes

console.log('[AuthServer] Initializing authentication server with caching');

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
  console.log('[AuthServer] MongoDB connected successfully');
}).catch(err => {
  console.error('[AuthServer] MongoDB connection error:', err);
});

// FIXED: Rate limiting middleware
const rateLimit = (windowMs, maxRequests) => {
  return (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, {
        requests: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientId);
    
    if (now > clientData.resetTime) {
      clientData.requests = 1;
      clientData.resetTime = now + windowMs;
      return next();
    }
    
    if (clientData.requests >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.' 
      });
    }
    
    clientData.requests++;
    next();
  };
};

// FIXED: Token verification endpoint with proper caching
app.post('/verify-token', rateLimit(60000, 30), async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('[AuthServer] Token verification request received');
    
    if (!token) {
      console.log('[AuthServer] No token provided');
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
          console.log('[AuthServer] Token verification failed:', err.message);
          reject(new Error('Invalid token'));
          return;
        }
        
        try {
          const user = await UserModel.findOne({ email: decoded.email }).maxTimeMS(5000);
          if (!user) {
            console.log('[AuthServer] User not found for token');
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
          
          console.log('[AuthServer] Token verification successful for user:', user.username);
          resolve(result);
        } catch (error) {
          console.error('[AuthServer] Database error during token verification:', error.message);
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
app.post('/refresh-token', rateLimit(60000, 10), async (req, res) => {
  const { refreshToken } = req.body;
  
  console.log('[AuthServer] Refresh token request received');
  
  if (!refreshToken) {
    console.log('[AuthServer] No refresh token provided');
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  if (!refreshTokens.includes(refreshToken)) {
    console.log('[AuthServer] Invalid refresh token');
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
  
  try {
    // FIXED: Add timeout to JWT verification
    const verifyPromise = new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          console.log('[AuthServer] Refresh token verification failed:', err.message);
          reject(new Error('Invalid refresh token'));
          return;
        }
        
        try {
          const user = await UserModel.findOne({ email: decoded.email }).maxTimeMS(5000);
          if (!user) {
            console.log('[AuthServer] User not found for refresh token');
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
          
          console.log('[AuthServer] Access token refreshed for user:', user.username);
          
          resolve({
            accessToken,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          });
        } catch (error) {
          console.error('[AuthServer] Database error during refresh:', error.message);
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

// FIXED: Auth check endpoint with proper caching and error handling
app.post('/auth', rateLimit(60000, 20), async (req, res) => {
  const { identifier } = req.body;
  console.log(`[AuthServer] Auth check request for identifier: ${identifier}`);
  
  if (!identifier || identifier.trim() === '') {
    console.log('[AuthServer] No identifier provided');
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
    
    console.log('[AuthServer] Checking database for user:', trimmedIdentifier);
    
    // FIXED: Properly await the async function
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier);
    
    const userExists = !!user;
    
    // Cache the result
    requestCache.set(cacheKey, {
      userExists,
      timestamp: Date.now()
    });
    
    console.log(`[AuthServer] User check result - exists: ${userExists} for identifier: ${trimmedIdentifier}`);
    res.json({ userExists });
    
  } catch (error) {
    console.error('[AuthServer] Error checking user:', error.message);
    
    // FIXED: Return proper error response instead of generic server error
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.', userExists: false });
    } else {
      res.status(500).json({ message: 'Database connection issue. Please try again.', userExists: false });
    }
  }
});

// FIXED: Login endpoint with better error handling and caching
app.post('/login', rateLimit(60000, 15), async (req, res) => {
  const { identifier, password } = req.body;
  
  console.log(`[AuthServer] Login attempt for identifier: ${identifier}`);
  
  if (!identifier || !password) {
    console.log('[AuthServer] Missing login credentials');
    return res.status(400).json({ message: 'Username/email and password are required' });
  }
  
  try {
    const trimmedIdentifier = identifier.trim();
    
    console.log('[AuthServer] Finding user for login:', trimmedIdentifier);
    
    // FIXED: Properly await the async function
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier);
        
    if (!user) {
      console.log(`[AuthServer] User not found for identifier: ${trimmedIdentifier}`);
      return res.status(400).json({ message: 'User not found' });
    }
    
    console.log(`[AuthServer] User found for login: ${user.username} (${user.email})`);
    
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
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  }
});

// FIXED: Signup endpoint with better validation and error handling
app.post('/signup', rateLimit(60000, 10), async (req, res) => {
  const { email, password, username } = req.body;
  
  console.log(`[AuthServer] Signup attempt for email: ${email}, username: ${username}`);
  
  // Validate required fields
  if (!email || !password || !username) {
    console.log('[AuthServer] Missing signup fields');
    return res.status(400).json({ 
      message: 'Email, password, and username are all required' 
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    console.log('[AuthServer] Invalid email format');
    return res.status(400).json({ 
      message: 'Please enter a valid email address' 
    });
  }
  
  // Validate username format
  const trimmedUsername = username.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    console.log('[AuthServer] Invalid username format');
    return res.status(400).json({ 
      message: 'Username can only contain letters, numbers, underscores, and dashes' 
    });
  }
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    console.log('[AuthServer] Invalid username length');
    return res.status(400).json({ 
      message: 'Username must be between 3 and 30 characters' 
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    console.log('[AuthServer] Password too short');
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  try {
    const trimmedEmail = email.trim();
    
    console.log('[AuthServer] Checking for existing user');
    
    // FIXED: Add timeout to database query
    const existingUser = await UserModel.findOne({
      $or: [
        { email: trimmedEmail.toLowerCase() },
        { username: trimmedUsername.toLowerCase() }
      ]
    }).maxTimeMS(5000);
    
    if (existingUser) {
      if (existingUser.email === trimmedEmail.toLowerCase()) {
        console.log(`[AuthServer] Email already exists: ${trimmedEmail}`);
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        console.log(`[AuthServer] Username already exists: ${trimmedUsername}`);
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    console.log('[AuthServer] Creating new user');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ 
      email: trimmedEmail.toLowerCase(), 
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
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern?.email) {
        res.status(400).json({ message: 'Email already exists' });
      } else if (error.keyPattern?.username) {
        res.status(400).json({ message: 'Username already exists' });
      } else {
        res.status(400).json({ message: 'Email or username already exists' });
      }
    } else {
      res.status(500).json({ message: 'Account creation failed. Please try again.' });
    }
  }
});

// FIXED: Username check with caching and better error handling
app.post('/check-username', rateLimit(60000, 30), async (req, res) => {
  const { username } = req.body;
  
  console.log(`[AuthServer] Username check for: ${username}`);
  
  if (!username) {
    console.log('[AuthServer] No username provided for check');
    return res.status(400).json({ message: 'Username is required' });
  }
  
  const trimmedUsername = username.trim();
  
  // Validate username format
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    console.log('[AuthServer] Invalid username format for check');
    return res.status(400).json({ 
      available: false,
      message: 'Username can only contain letters, numbers, underscores, and dashes' 
    });
  }
  
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    console.log('[AuthServer] Invalid username length for check');
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
      console.log('[AuthServer] Using cached username check result');
      return res.json(cached.data);
    }
    
    console.log('[AuthServer] Checking database for username availability');
    
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
    
    console.log(`[AuthServer] Username check result: ${result.available} for ${trimmedUsername}`);
    res.json(result);
  } catch (error) {
    console.error('[AuthServer] Error checking username:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Username check failed. Please try again.' });
    }
  }
});

// Add a simple test route to verify the server is working
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Auth server is running',
    port: authPort,
    timestamp: new Date().toISOString()
  });
});

// Add a GET route for /auth to show available endpoints
app.get('/auth', (req, res) => {
  res.json({
    message: 'Authentication API',
    availableEndpoints: {
      'POST /auth': 'Check if user exists',
      'POST /login': 'User login',
      'POST /signup': 'User registration',
      'POST /verify-token': 'Verify access token',
      'POST /refresh-token': 'Refresh access token',
      'POST /check-username': 'Check username availability',
      'GET /health': 'Health check'
    },
    note: 'This endpoint only accepts POST requests for authentication'
  });
});

///////////////////////// END FIXED AUTHENTICATION ENDPOINTS /////////////////////////

///////////////////////// START USER PROFILE ENDPOINTS /////////////////////////

// FIXED: User profile endpoint with better error handling
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
    console.error('[AuthServer] Error fetching user profile:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }
});

// FIXED: Authentication middleware with timeout and better error handling
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  console.log('[AuthServer] Authenticating token...');
  
  if (!authHeader) {
    console.log('[AuthServer] No auth header found');
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('[AuthServer] No token found in header');
    return res.status(401).json({ message: 'Access token is required' });
  }

  // FIXED: Add timeout to JWT verification
  const verifyPromise = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log('[AuthServer] Token verification failed:', err.message);
        reject(new Error('Access token is not valid'));
      } else {
        console.log('[AuthServer] Token verified for user:', user.email);
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

// Add the rest of your endpoints here with the authenticateToken middleware...
// (I'll include a few key ones to show the pattern)

app.get('/api/user/store', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  
  try {
    console.log(`[AuthServer] Fetching store data for user: ${userEmail}`);
    
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
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        success: false, 
        message: 'Database timeout. Please try again.'
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching store data'
      });
    }
  }
});

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[AuthServer] Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const authPort = process.env.AUTHPORT || 4500;
httpServer.listen(authPort, () => {
  console.log(`[AuthServer] Server running on port ${authPort}`);
  console.log(`[AuthServer] Memory usage:`, process.memoryUsage());
});

///////////////////////// END FIXED AUTHENTICATION SERVER /////////////////////////