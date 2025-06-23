///////////////////////// START FIXED AUTH SERVER ENDPOINTS /////////////////////////
// src/authServer.js - CRITICAL FIXES FOR AUTHENTICATION

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

///////////////////////// START FIXED AUTHENTICATION ENDPOINTS /////////////////////////

// FIXED: Token verification endpoint
app.post('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      
      try {
        // Get fresh user data from database
        const user = await UserModel.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
          valid: true,
          user: {
            id: user._id,
            email: user.email,
            username: user.username
          }
        });
      } catch (error) {
        console.error('Error fetching user for token verification:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FIXED: Improved refresh token endpoint
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  // Verify the refresh token is in our list
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
  
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    try {
      // Get fresh user data
      const user = await UserModel.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create a new access token with updated user info
      const accessToken = jwt.sign(
        { 
          email: user.email,
          username: user.username,
          id: user._id 
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '90m' }
      );
      
      res.json({ 
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// FIXED: Updated auth check endpoint with better error handling
app.post('/auth', async (req, res) => {
  const { identifier } = req.body;
  console.log(`[auth] Checking if user exists: ${identifier}`);
  
  if (!identifier || identifier.trim() === '') {
    console.log('[auth] No identifier provided');
    return res.status(400).json({ message: 'Username or email is required', userExists: false });
  }

  try {
    const trimmedIdentifier = identifier.trim();
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier);
    console.log(`[auth] User found: ${!!user} for identifier: ${trimmedIdentifier}`);
    
    res.json({ userExists: !!user });
  } catch (error) {
    console.error('[auth] Error checking user:', error);
    res.status(500).json({ message: 'Server error', userExists: false });
  }
});

// FIXED: Updated login endpoint with better validation
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  console.log(`[login] Login attempt for identifier: ${identifier}`);
  
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required' });
  }
  
  try {
    const trimmedIdentifier = identifier.trim();
    
    // Find user by username or email
    const user = await UserModel.findByUsernameOrEmail(trimmedIdentifier);
    
    if (!user) {
      console.log(`[login] User not found for identifier: ${trimmedIdentifier}`);
      return res.status(400).json({ message: 'User not found' });
    }
    
    console.log(`[login] User found: ${user.username} (${user.email})`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[login] Invalid password for user: ${user.username}`);
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
    
    console.log(`[login] Login successful for user: ${user.username}`);
    
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
    console.error('[login] Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// FIXED: Updated signup endpoint with better validation
app.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;
  
  console.log(`[signup] Signup attempt for email: ${email}, username: ${username}`);
  
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
    
    // Check if user already exists (by email or username)
    const existingUser = await UserModel.findOne({
      $or: [
        { email: trimmedEmail },
        { username: trimmedUsername.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        console.log(`[signup] Email already exists: ${trimmedEmail}`);
        return res.status(400).json({ message: 'Email already exists' });
      } else {
        console.log(`[signup] Username already exists: ${trimmedUsername}`);
        return res.status(400).json({ message: 'Username already exists' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ 
      email: trimmedEmail, 
      password: hashedPassword,
      username: trimmedUsername.toLowerCase()
    });
    
    await newUser.save();
    
    console.log(`[signup] User created successfully: ${newUser.username} (${newUser.email})`);
    
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
    console.error('[signup] Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// FIXED: Username availability check
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
    const existingUser = await UserModel.findOne({ username: trimmedUsername.toLowerCase() });
    res.json({ 
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

///////////////////////// END FIXED AUTHENTICATION ENDPOINTS /////////////////////////

///////////////////////// START USER PROFILE ENDPOINTS /////////////////////////

// FIXED: Get user profile by username (for public profiles)
app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`[profile] Fetching profile for username: ${username}`);
    
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    
    if (!user) {
      console.log(`[profile] User not found: ${username}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[profile] Profile found for: ${user.username}`);
    
    // Return only public profile information
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
        // Add any other fields you want to make public
        joinedAt: user.createdAt,
        profileStats: {
          checkedInStores: user.checkedInStores ? user.checkedInStores.length : 0,
          visitHistory: user.visitHistory ? user.visitHistory.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FIXED: Get current user profile (authenticated)
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
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// FIXED: Update user settings
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

// IMPROVED: Get user data with better error handling
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
    console.error('Error fet