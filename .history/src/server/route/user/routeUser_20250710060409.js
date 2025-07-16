///////////////////////// START COMPLETE USER PROFILE ROUTES WITH BLOG INTEGRATION /////////////////////////
// src/server/route/routeUser.js - Complete user profile routing system with blog posts

import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { UserModel, StoreModel, BlogModel } from '../../data/mongodb/mongodb.js';
import * as userController from '../../controllers/controllerUser.js';

const routeUser = express.Router();

console.log('[UserAPI] Loading user routes with blog integration');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profile/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[UserAPI] No token provided');
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.log('[UserAPI] Token verification failed:', err.message);
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  
    try {
      // Get full user data
      const userData = await UserModel.findOne({ email: decoded.email })
        .select('_id email username firstName lastName')
        .maxTimeMS(5000);

      if (!userData) {
        console.log('[UserAPI] User not found for token');
        return res.status(403).json({ success: false, error: 'User not found' });
      }

      req.user = {
        id: userData._id.toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      console.log('[UserAPI] Token verified for user:', req.user.username);
      
      next();
    } catch (error) {
      console.error('[UserAPI] Error fetching user data:', error);
      return res.status(500).json({ success: false, error: 'Authentication failed' });
    }
  });
};

// Middleware to verify user ownership
const verifyUserOwnership = async (req, res, next) => {
  try {
    const requestedUsername = req.params.username;
    const tokenEmail = req.user.email;
    
    console.log('[UserAPI] Verifying ownership:', { requestedUsername, tokenEmail });
    
    // Find the user by username
    const user = await UserModel.findOne({ username: requestedUsername });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if the token email matches the user's email
    if (user.email !== tokenEmail) {
      console.log('[UserAPI] Ownership verification failed');
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit your own profile' 
      });
    }
    
    req.profileUser = user;
    next();
  } catch (error) {
    console.error('[UserAPI] Error verifying ownership:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

///////////////////////// PUBLIC ENDPOINTS (NO AUTH) /////////////////////////

// Get current user profile (authenticated)
routeUser.get('/user', authenticateToken, userController.getUserProfile);

// Update user profile
routeUser.put('/user', authenticateToken, userController.updateUserProfile);

// Delete user account
routeUser.delete('/user', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log('[UserAPI] Deleting account for:', userEmail);
    
    const user = await UserModel.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Soft delete - just deactivate the account
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    
    console.log('[UserAPI] Account deactivated successfully');
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('[UserAPI] Error deleting account:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

///////////////////////// PROFILE AND SETTINGS ENDPOINTS /////////////////////////

// GET CURRENT USER'S COMPLETE PROFILE (moved from auth server)
routeUser.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`[UserAPI] Fetching complete profile for user: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('-password -refreshTokens -verificationToken -resetPasswordToken')
      .maxTimeMS(5000);
    
    if (!user) {
      console.log(`[UserAPI] User not found: ${userEmail}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[UserAPI] Complete profile found for: ${user.username}`);
    
    // Calculate complete stats including blog posts
    const completeStats = {
      places: (user.visitHistory?.length || 0) + (user.savedStores?.length || 0),
      contributions: (user.impressionsLiked?.length || 0) + (user.impressionsDisliked?.length || 0) + (user.blogsCreated?.length || 0),
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      reviews: user.impressionsLiked?.length || 0,
      endorsements: user.endorsements?.length || 0,
      ///////////////////////// START BLOG STATS /////////////////////////
      blogPosts: user.blogPosts ? user.blogPosts.filter(p => p.status === 'published').length : 0,
      totalBlogs: user.blogsCreated?.length || 0,
      draftBlogs: user.blogPosts ? user.blogPosts.filter(p => p.status === 'draft').length : 0,
      archivedBlogs: user.blogPosts ? user.blogPosts.filter(p => p.status === 'archived').length : 0
      ///////////////////////// END BLOG STATS /////////////////////////
    };
    
    // Return complete profile data for own profile
    const completeProfile = {
      success: true,
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.additionalName,
      description: user.overview,
      headline: user.headline,
      profession: user.profession,
      industry: user.industry,
      company: user.company,
      website: user.website,
      profilePicture: user.profilePicture,
      location: {
        city: user.city,
        state: user.state,
        country: user.country,
        postalCode: user.postalCode
      },
      socialMedia: user.socialMedia,
      phoneNumber: user.phoneNumber,
      birthdate: user.birthdate,
      gender: user.gender,
      joinedDate: user.createdAt,
      lastActive: user.lastLogin,
      neumadicStars: user.neumadicStars,
      starHistory: user.starHistory,
      notifications: user.notifications,
      profileVisibility: user.profileVisibility,
      profilePrivacy: user.profilePrivacy,
      stats: completeStats,
      // Include activity data
      checkedInStore: user.checkedInStore,
      recentCheckIns: user.checkedInStores?.slice(0, 10) || [],
      savedStores: user.savedStores?.slice(0, 10) || [],
      visitHistory: user.visitHistory?.slice(0, 10) || [],
      ///////////////////////// START BLOG DATA /////////////////////////
      blogPosts: user.blogPosts || [],
      blogsCreated: user.blogsCreated || [],
      savedBlogs: user.savedBlogs || [],
      likedBlogs: user.likedBlogs || []
      ///////////////////////// END BLOG DATA /////////////////////////
    };
    
    res.json(completeProfile);
    
  } catch (error) {
    console.error('[UserAPI] Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// UPDATE CURRENT USER'S PROFILE
routeUser.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[UserAPI] Updating profile for user: ${userEmail}`);
    
    // Define allowed fields to update
    const allowedUpdates = [
      'firstName', 'lastName', 'additionalName', 'headline', 'overview',
      'profession', 'industry', 'company', 'website', 'city', 'state',
      'country', 'postalCode', 'phoneNumber', 'birthdate', 'gender',
      'socialMedia', 'notifications', 'profileVisibility', 'profilePrivacy'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    // Handle password update separately
    if (updates.password) {
      user.password = updates.password; // Will be hashed by pre-save middleware
    }
    
    await user.save();
    
    console.log(`[UserAPI] Profile updated successfully for: ${user.username}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error updating profile:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile' 
    });
  }
});

// 6. UPDATE USER PROFILE
routeUser.post('/profile', authenticateToken, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPicture', maxCount: 1 }
]), async (req, res) => {
  try {
    const userEmail = req.user.email;
    const updateData = req.body;
    
    console.log(`[UserAPI] Updating profile for user: ${userEmail}`);
    console.log(`[UserAPI] Update data:`, Object.keys(updateData));
    
    // Find user
    const user = await UserModel.findOne({ email: userEmail }).maxTimeMS(5000);
    
    if (!user) {
      console.log(`[UserAPI] User not found: ${userEmail}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate and update fields
    const allowedFields = [
      'firstName', 'lastName', 'additionalName', 'overview', 'headline',
      'profession', 'industry', 'company', 'location', 'country', 'state',
      'postalCode', 'website', 'phoneNumber', 'birthdate', 'gender',
      'profilePrivacy', 'profileVisibility', 'socialMedia'
    ];
    
    const updateFields = {};
    
    // Process regular fields
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // Special validation for specific fields
        if (field === 'website' && updateData[field]) {
          // Validate website URL
          const website = updateData[field];
          if (website && !website.match(/^https?:\/\//)) {
            updateFields[field] = `https://${website}`;
          } else {
            updateFields[field] = website;
          }
        } else if (field === 'phoneNumber' && updateData[field]) {
          // Basic phone number validation
          const phone = updateData[field].replace(/\D/g, '');
          updateFields[field] = phone;
        } else if (field === 'birthdate' && updateData[field]) {
          // Parse and validate date
          const date = new Date(updateData[field]);
          if (!isNaN(date.getTime())) {
            updateFields[field] = date;
          }
        } else if (field === 'socialMedia' && updateData[field]) {
          // Parse social media if it's a string
          try {
            updateFields[field] = typeof updateData[field] === 'string' 
              ? JSON.parse(updateData[field]) 
              : updateData[field];
          } catch (e) {
            console.warn('[UserAPI] Invalid social media data:', e);
          }
        } else if (field === 'profileVisibility' && updateData[field]) {
          // Parse profile visibility if it's a string
          try {
            updateFields[field] = typeof updateData[field] === 'string' 
              ? JSON.parse(updateData[field]) 
              : updateData[field];
          } catch (e) {
            console.warn('[UserAPI] Invalid profile visibility data:', e);
          }
        } else {
          updateFields[field] = updateData[field];
        }
      }
    });
    
    // Handle file uploads
    if (req.files) {
      if (req.files.profilePicture && req.files.profilePicture[0]) {
        const file = req.files.profilePicture[0];
        updateFields.profilePicture = {
          original: {
            url: `/uploads/profile/${file.filename}`,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: new Date()
          }
        };
      }
      
      if (req.files.coverPicture && req.files.coverPicture[0]) {
        const file = req.files.coverPicture[0];
        updateFields.coverPicture = {
          url: `/uploads/profile/${file.filename}`,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date()
        };
      }
    }
    
    // Update lastUpdated timestamp
    updateFields.updatedAt = new Date();
    
    console.log(`[UserAPI] Updating fields:`, Object.keys(updateFields));
    
    // Update user document
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { $set: updateFields },
      { 
        new: true, 
        runValidators: true,
        maxTimeMS: 10000
      }
    );
    
    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }
    
    console.log(`[UserAPI] Profile updated successfully for: ${updatedUser.username}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.additionalName,
        description: updatedUser.overview,
        headline: updatedUser.headline,
        profession: updatedUser.profession,
        industry: updatedUser.industry,
        company: updatedUser.company,
        location: updatedUser.location,
        website: updatedUser.website,
        phoneNumber: updatedUser.phoneNumber,
        birthdate: updatedUser.birthdate,
        profilePicture: updatedUser.profilePicture,
        coverPicture: updatedUser.coverPicture,
        profilePrivacy: updatedUser.profilePrivacy,
        profileVisibility: updatedUser.profileVisibility,
        updatedAt: updatedUser.updatedAt
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error updating profile:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        message: 'Error updating profile',
        details: error.message 
      });
    }
  }
});

// UPLOAD PROFILE PICTURE
routeUser.post('/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log(`[UserAPI] Uploading profile picture for: ${userEmail}`);
    
    const profilePictureData = {
      profilePicture: {
        original: {
          url: `/uploads/profile/${req.file.filename}`,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date()
        }
      }
    };
    
    const user = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { $set: profilePictureData },
      { new: true }
    )
    .select('profilePicture username')
    .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[UserAPI] Profile picture uploaded for: ${user.username}`);
    res.json({ 
      message: 'Profile picture uploaded successfully', 
      profilePicture: user.profilePicture 
    });
    
  } catch (error) {
    console.error('[UserAPI] Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

// UPDATE USER PROFILE SETTINGS
routeUser.post('/settings', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[UserAPI] Updating profile for user: ${userEmail}`);
    
    // Find user
    const user = await UserModel.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    let stores = [];
    
    // Get stores based on type
    switch(type) {
      case 'visited':
        stores = user.checkedInStores || [];
        break;
      case 'saved':
        stores = user.savedStores || [];
        break;
      case 'want-to-visit':
        stores = user.placesWantToVisit || [];
        break;
      case 'reviewed':
        stores = user.impressions || [];
        break;
      default:
        stores = user.checkedInStores || [];
    }
    
    // Apply pagination
    const paginatedStores = stores.slice(offset, offset + limit);
    
    res.json({
      success: true,
      stores: paginatedStores,
      total: stores.length,
      hasMore: (offset + limit) < stores.length
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user stores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// 7. GET CURRENT USER DATA (for API calls)
routeUser.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`[UserAPI] Fetching current user data: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('email username checkedInStore checkedInStores visitHistory savedStores profilePrivacy')
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log(`[UserAPI] Current user data found: ${user.username}`);
    
    res.json({
      success: true,
      id: user._id,
      email: user.email,
      username: user.username,
      checkedInStore: user.checkedInStore,
      checkedInStores: user.checkedInStores,
      visitHistory: user.visitHistory,
      savedStores: user.savedStores,
      profilePrivacy: user.profilePrivacy
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching current user:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ 
        success: false, 
        message: 'Database timeout. Please try again.'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching user data'
      });
    }
  }
});

// Get current user's store data
routeUser.get('/user/stores', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log(`[UserAPI] Fetching store data for user: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('checkedInStore checkedInStores visitHistory savedStores')
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const currentStore = user.checkedInStore;
    const recentCheckedInStores = user.checkedInStores ? 
      user.checkedInStores.slice(0, 10) : [];
    
    res.json({
      success: true,
      currentStore: currentStore || null,
      recentCheckIns: recentCheckedInStores,
      visitHistory: user.visitHistory || [],
      savedStores: user.savedStores || []
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user store data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// 8. GET USER STORE DATA (for ProfileScreen)
routeUser.get('/store', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`[UserAPI] Fetching store data for user: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('checkedInStore checkedInStores visitHistory savedStores')
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const currentStore = user.checkedInStore;
    const recentCheckedInStores = user.checkedInStores ? 
      user.checkedInStores.slice(-6).reverse() : [];
    const storeIds = [...new Set([currentStore, ...recentCheckedInStores.map(store => store.storeId)])].filter(Boolean);
    
    console.log('[UserAPI] Fetching stores:', storeIds);

    // Get store details from StoreModel
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

    console.log(`[UserAPI] Returning data for ${storeData.length} stores`);

    return res.status(200).json({
      success: true,
      currentStore: currentStore,
      stores: storeData,
      checkedInStores: recentCheckedInStores,
      visitHistory: user.visitHistory || [],
      savedStores: user.savedStores || []
    });
    
  } catch (error) {
    console.error(`[UserAPI] Error fetching store data:`, error.message);
    
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

///////////////////////// END STORE DATA ENDPOINTS /////////////////////////



///////////////////////// USER SEARCH ENDPOINTS /////////////////////////

// 9. SEARCH USERS
routeUser.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }
    
    console.log(`[UserAPI] Searching users for: ${q}`);
    
    // Search users by username, firstName, lastName, or company
    const users = await UserModel.find({
      $and: [
        { profilePrivacy: { $ne: 'private' } }, // Exclude private profiles
        { isActive: true }, // Only active users
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { additionalName: { $regex: q, $options: 'i' } },
            { company: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username firstName lastName additionalName company location profilePicture isVerified neuradicStars')
    .limit(parseInt(limit))
    .maxTimeMS(5000);
    
    const searchResults = users.map(user => ({
      id: user._id,
      username: user.username,
      displayName: user.additionalName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      company: user.company,
      location: user.location,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      neuradicStars: user.neuradicStars || 0
    }));
    
    console.log(`[UserAPI] Found ${searchResults.length} users for search: ${q}`);
    
    res.json({
      success: true,
      users: searchResults,
      query: q,
      total: searchResults.length
    });
    
  } catch (error) {
    console.error('[UserAPI] Error searching users:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Search timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Error searching users' });
    }
  }
});

// 10. CHECK USERNAME AVAILABILITY
routeUser.post('/check-username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const currentUserEmail = req.user.email;
    
    if (!username) {
      return res.status(400).json({ 
        available: false,
        message: 'Username is required' 
      });
    }
    
    const trimmedUsername = username.trim().toLowerCase();
    
    console.log(`[UserAPI] Checking username availability: ${trimmedUsername} for user: ${currentUserEmail}`);
    
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
    
    // Check if username exists for a different user
    const existingUser = await UserModel.findOne({ 
      username: trimmedUsername,
      email: { $ne: currentUserEmail } // Exclude current user
    }).maxTimeMS(5000);
    
    const result = { 
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    };
    
    console.log(`[UserAPI] Username availability result: ${result.available} for ${trimmedUsername}`);
    res.json(result);
    
  } catch (error) {
    console.error('[UserAPI] Error checking username availability:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Username check failed. Please try again.' });
    }
  }
});

///////////////////////// END USER SEARCH ENDPOINTS /////////////////////////




// ///////////////////////// PROFILE AND SETTINGS ENDPOINTS /////////////////////////

// // GET CURRENT USER'S COMPLETE PROFILE (moved from auth server)
// routeUser.get('/profile', authenticateToken, async (req, res) => {
//   try {
//     const userEmail = req.user.email;
//     console.log(`[UserAPI] Fetching complete profile for user: ${userEmail}`);
    
//     const user = await UserModel.findOne({ email: userEmail })
//       .select('-password -refreshTokens -verificationToken -resetPasswordToken')
//       .maxTimeMS(5000);
    
//     if (!user) {
//       console.log(`[UserAPI] User not found: ${userEmail}`);
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     console.log(`[UserAPI] Complete profile found for: ${user.username}`);
    
//     // Calculate complete stats including blog posts
//     const completeStats = {
//       places: (user.visitHistory?.length || 0) + (user.savedStores?.length || 0),
//       contributions: (user.impressionsLiked?.length || 0) + (user.impressionsDisliked?.length || 0) + (user.blogsCreated?.length || 0),
//       followers: user.followers?.length || 0,
//       following: user.following?.length || 0,
//       reviews: user.impressionsLiked?.length || 0,
//       endorsements: user.endorsements?.length || 0,
//       ///////////////////////// START BLOG STATS /////////////////////////
//       blogPosts: user.blogPosts ? user.blogPosts.filter(p => p.status === 'published').length : 0,
//       totalBlogs: user.blogsCreated?.length || 0,
//       draftBlogs: user.blogPosts ? user.blogPosts.filter(p => p.status === 'draft').length : 0,
//       archivedBlogs: user.blogPosts ? user.blogPosts.filter(p => p.status === 'archived').length : 0
//       ///////////////////////// END BLOG STATS /////////////////////////
//     };
    
//     // Return complete profile data for own profile
//     const completeProfile = {
//       success: true,
//       id: user._id,
//       email: user.email,
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       fullName: user.additionalName,
//       description: user.overview,
//       headline: user.headline,
//       profession: user.profession,
//       industry: user.industry,
//       company: user.company,
//       website: user.website,
//       profilePicture: user.profilePicture,
//       location: {
//         city: user.city,
//         state: user.state,
//         country: user.country,
//         postalCode: user.postalCode
//       },
//       socialMedia: user.socialMedia,
//       phoneNumber: user.phoneNumber,
//       birthdate: user.birthdate,
//       gender: user.gender,
//       joinedDate: user.createdAt,
//       lastActive: user.lastLogin,
//       neumadicStars: user.neumadicStars,
//       starHistory: user.starHistory,
//       notifications: user.notifications,
//       profileVisibility: user.profileVisibility,
//       profilePrivacy: user.profilePrivacy,
//       stats: completeStats,
//       // Include activity data
//       checkedInStore: user.checkedInStore,
//       recentCheckIns: user.checkedInStores?.slice(0, 10) || [],
//       savedStores: user.savedStores?.slice(0, 10) || [],
//       visitHistory: user.visitHistory?.slice(0, 10) || [],
//       ///////////////////////// START BLOG DATA /////////////////////////
//       blogPosts: user.blogPosts || [],
//       blogsCreated: user.blogsCreated || [],
//       savedBlogs: user.savedBlogs || [],
//       likedBlogs: user.likedBlogs || []
//       ///////////////////////// END BLOG DATA /////////////////////////
//     };
    
//     res.json(completeProfile);
    
//   } catch (error) {
//     console.error('[UserAPI] Error fetching profile:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error' 
//     });
//   }
// });

// // UPDATE CURRENT USER'S PROFILE
// routeUser.put('/profile', authenticateToken, async (req, res) => {
//   try {
//     const userEmail = req.user.email;
//     const updates = req.body;
    
//     console.log(`[UserAPI] Updating profile for user: ${userEmail}`);
    
//     // Define allowed fields to update
//     const allowedUpdates = [
//       'firstName', 'lastName', 'additionalName', 'headline', 'overview',
//       'profession', 'industry', 'company', 'website', 'city', 'state',
//       'country', 'postalCode', 'phoneNumber', 'birthdate', 'gender',
//       'socialMedia', 'notifications', 'profileVisibility', 'profilePrivacy'
//     ];
    
//     // Filter out any fields that aren't allowed
//     const filteredUpdates = {};
//     Object.keys(updates).forEach(key => {
//       if (allowedUpdates.includes(key)) {
//         filteredUpdates[key] = updates[key];
//       }
//     });
    
//     // Update the user
//     const updatedUser = await UserModel.findOneAndUpdate(
//       { email: userEmail },
//       { $set: filteredUpdates },
//       { new: true, runValidators: true }
//     ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
//     // Update only allowed fields
//     allowedUpdates.forEach(field => {
//       if (updates[field] !== undefined) {
//         user[field] = updates[field];
//       }
//     });

//     // Handle password update separately
//     if (updates.password) {
//       user.password = updates.password; // Will be hashed by pre-save middleware
//     }
    
//     await user.save();
    
//     console.log(`[UserAPI] Profile updated successfully for: ${user.username}`);
    
//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: {
//         id: user._id,
//         email: user.email,
//         username: user.username,
//         firstName: user.firstName,
//         lastName: user.lastName
//       }
//     });
    
//   } catch (error) {
//     console.error('[UserAPI] Error updating profile:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Validation error', 
//         errors: error.errors 
//       });
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error updating profile' 
//     });
//   }
// });

// // UPLOAD PROFILE PICTURE
// routeUser.post('/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
//   try {
//     const userEmail = req.user.email;
    
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }
    
//     console.log(`[UserAPI] Uploading profile picture for: ${userEmail}`);
    
//     const profilePictureData = {
//       profilePicture: {
//         original: {
//           url: `/uploads/profile/${req.file.filename}`,
//           filename: req.file.filename,
//           mimetype: req.file.mimetype,
//           size: req.file.size,
//           uploadedAt: new Date()
//         }
//       }
//     };
    
//     const user = await UserModel.findOneAndUpdate(
//       { email: userEmail },
//       { $set: profilePictureData },
//       { new: true }
//     )
//     .select('profilePicture username')
//     .maxTimeMS(5000);
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     console.log(`[UserAPI] Profile picture uploaded for: ${user.username}`);
//     res.json({ 
//       message: 'Profile picture uploaded successfully', 
//       profilePicture: user.profilePicture 
//     });
    
//   } catch (error) {
//     console.error('[UserAPI] Error uploading profile picture:', error);
//     res.status(500).json({ message: 'Error uploading profile picture' });
//   }
// });

// ///////////////////////// PUBLIC USER PROFILE ENDPOINTS /////////////////////////



///////////////////////// SOCIAL ENDPOINTS /////////////////////////

// Get current user profile (authenticated)
routeUser.get('/user', authenticateToken, userController.getUserProfile);

// Update user profile
routeUser.put('/user', authenticateToken, userController.updateUserProfile);

// 1. GET PUBLIC USER PROFILE BY USERNAME
routeUser.get('/@:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`/@:username [UserAPI] Fetching public profile for: ${username}`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true 
    })
    .select(`
      username email firstName lastName additionalName profilePicture coverPicture
      headline overview profession industry company website
      country city state
      neumadicStars profileVisibility isVerified
      createdAt lastLogin
      followers following
      checkedInStores visitHistory
    `)
    .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log(`/@:username[UserAPI] Public profile found for: ${user.username}`);
    
    // Check profile visibility settings
    const isPublic = user.profileVisibility?.activity === 'public';
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: isPublic ? user.email : undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        additionalName: user.additionalName,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        headline: user.headline,
        overview: user.overview,
        profession: user.profession,
        industry: user.industry,
        company: user.company,
        website: user.website,
        location: {
          country: user.country,
          city: user.city,
          state: user.state
        },
        stats: {
          neumadicStars: user.neumadicStars || 0,
          checkIns: user.checkedInStores ? user.checkedInStores.length : 0,
          visitHistory: user.visitHistory ? user.visitHistory.length : 0,
          followers: user.followers ? user.followers.length : 0,
          following: user.following ? user.following.length : 0,
          neuradicStars: user.neuradicStars || 0
        }
      }
    });
  } catch (error) {
    console.error('/@:username [UserAPI] Error fetching user profile:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }
});

// 2. GET PUBLIC USER ACTIVITY
routeUser.get('/@:username/activity', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    console.log(`[UserAPI] Fetching public activity for: ${username}`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    })
    .select('profileVisibility checkedInStores visitHistory blogsCreated placesRecommended')
    .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if activity is public
    if (user.profileVisibility?.activity !== 'public') {
      return res.status(403).json({ 
        success: false, 
        message: 'User activity is private' 
      });
    }
    
    // Get recent activity (limited public view)
    const recentActivity = [];
    if (user.checkedInStores) {
      recentActivity.push(...user.checkedInStores.slice(-parseInt(limit)));
    }
    
    res.json({
      success: true,
      activity: recentActivity,
      totalItems: recentActivity.length
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user activity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user activity' 
    });
  }
});

// 3. GET PUBLIC USER PLACES
routeUser.get('/@:username/places', async (req, res) => {
try {
  const { username } = req.params;
  const { category = 'visited', limit = 12, page = 1 } = req.query;
  
  console.log(`[UserAPI] Fetching public places for: ${username}, category: ${category}`);
  
  const user = await UserModel.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, 'i') },
    isActive: true
  })
  .select('profileVisibility visitHistory savedStores placesWantToVisit placesRecommended checkedInStores')
  .maxTimeMS(5000);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }
  
  // Check if places are public
  if (user.profileVisibility?.places !== 'public') {
    return res.status(403).json({ 
      success: false, 
      message: 'User places are private' 
    });
  }
  
  // Get places by category
  let places = [];
  switch (category) {
    case 'visited':
      places = user.visitHistory || [];
      break;
    case 'saved':
      places = user.savedStores || [];
      break;
    case 'want-to-visit':
      places = user.placesWantToVisit || [];
      break;
    case 'recommended':
      places = user.placesRecommended || [];
      break;
    case 'checked-in':
      places = user.checkedInStores || [];
      break;
    default:
      places = user.visitHistory || [];
  }
  
  // Pagination
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;
  const paginatedPlaces = places.slice(skip, skip + limitNum);
  
  res.json({
    success: true,
    places: paginatedPlaces,
    category: category,
    pagination: {
      currentPage: pageNum,
      totalItems: places.length,
      totalPages: Math.ceil(places.length / limitNum),
      hasNextPage: skip + limitNum < places.length,
      hasPrevPage: pageNum > 1
    }
  });
  
} catch (error) {
  console.error('[UserAPI] Error fetching user places:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Error fetching user places' 
  });
}
});

// 4. GET PUBLIC USER POSTS/BLOGS
routeUser.get('/@:username/posts', async (req, res) => {
try {
  const { username } = req.params;
  const { limit = 12, page = 1 } = req.query;
  
  console.log(`[UserAPI] Fetching public posts for: ${username}`);
  
  const user = await UserModel.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, 'i') },
    isActive: true
  })
  .select('profileVisibility')
  .maxTimeMS(5000);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }
  
  // Check if posts are public
  if (user.profileVisibility?.posts !== 'public') {
    return res.status(403).json({ 
      success: false, 
      message: 'User posts are private' 
    });
  }
  
  // Get published blogs by this user
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;
  
  const blogs = await BlogModel.find({
    'author.username': { $regex: new RegExp(`^${username}$`, 'i') },
    status: 'published',
    'settings.public': true
  })
  .select('slug title snippet category media publishedAt interactions')
  .sort({ publishedAt: -1 })
  .limit(limitNum)
  .skip(skip)
  .maxTimeMS(10000);
  
  const totalBlogs = await BlogModel.countDocuments({
    'author.username': { $regex: new RegExp(`^${username}$`, 'i') },
    status: 'published',
    'settings.public': true
  });
  
  res.json({
    success: true,
    posts: blogs,
    pagination: {
      currentPage: pageNum,
      totalItems: totalBlogs,
      totalPages: Math.ceil(totalBlogs / limitNum),
      hasNextPage: skip + limitNum < totalBlogs,
      hasPrevPage: pageNum > 1
    }
  });
  
} catch (error) {
  console.error('[UserAPI] Error fetching user posts:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Error fetching user posts' 
  });
}
});

// GET PUBLIC USER PROFILE (by username)
routeUser.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`/user/:username [UserAPI] Fetching public profile for username: ${username}`);
    
    
    // Try case-insensitive search for username
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}`, 'i') },
      // username: username,
      isActive: true 
    })
    .maxTimeMS(10000);
    console.log(`/user/:username [UserAPI] User found: ${username}`);
    
    if (!user) {
      console.log(`/user/:username [UserAPI] User not found: ${username}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`/user/:username [UserAPI] Public profile found for: ${username}`);
    
  // Get published blog posts for public profile
  const publishedBlogPosts = user.blogPosts ? 
  user.blogPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 20) // Limit to 20 most recent
    .map(p => ({
      blogId: p.blogId,
      title: p.title,
      slug: p.slug,
      category: p.category,
      snippet: p.snippet,
      thumbnail: p.thumbnail,
      publishedAt: p.publishedAt,
      tags: p.tags || []
    })) : [];

    // Return public profile data with blog posts
    res.json({
      success: true,
      profile: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        headline: user.headline,
        description: user.overview,
        profession: user.profession,
        company: user.company,
        industry: user.industry,
        profilePicture: user.profilePicture,
        location: {
          city: user.city,
          state: user.state,
          country: user.country
        },
        website: user.website,
        socialMedia: user.socialMedia,
        joinedDate: user.createdAt,
        lastActive: user.lastLogin,
        neumadicStars: user.neumadicStars,
        ///////////////////////// START BLOG DATA /////////////////////////
        blogPosts: publishedBlogPosts,
        ///////////////////////// END BLOG DATA /////////////////////////
        stats: {
          places: user.checkedInStores ? user.checkedInStores.length : 0,
          contributions: user.impressions ? user.impressions.length : 0,
          reviews: user.impressions ? user.impressions.length : 0,
          checkedIn: user.checkedInStores ? user.checkedInStores.length : 0,
          visitHistory: user.visitHistory ? user.visitHistory.length : 0,
          followers: user.followers ? user.followers.length : 0,
          following: user.following ? user.following.length : 0,
          neuradicStars: user.neumadicStars || 0,
          ///////////////////////// START BLOG STATS /////////////////////////
          blogPosts: user.blogPosts ? user.blogPosts.filter(p => p.status === 'published').length : 0,
          totalBlogs: user.blogsCreated ? user.blogsCreated.length : 0
          ///////////////////////// END BLOG STATS /////////////////////////
        }
      }
    });
  } catch (error) {
    console.error('/user/:username [UserAPI] Error fetching user profile:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }
});

// Update user profile by username (with ownership verification)
routeUser.put('/user/:username', authenticateToken, verifyUserOwnership, async (req, res) => {
  try {
    const user = req.profileUser;
    const updates = req.body;
    
    console.log('[UserAPI] Updating profile for:', user.username);
    
    // List of fields that can be updated
    const allowedUpdates = [
      'firstName', 'lastName', 'additionalName', 'overview', 'headline',
      'profession', 'industry', 'company', 'location', 'city', 'country',
      'state', 'postalCode', 'website', 'phoneNumber', 'birthdate', 'gender',
      'socialMedia', 'profileVisibility', 'emailNotifications', 'privacy'
    ];
    
    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });
    
    await user.save();
    
    console.log('[UserAPI] Profile updated successfully');
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user
    });
    
  } catch (error) {
    console.error('[UserAPI] Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Upload profile picture
routeUser.post('/user/:username/photo', authenticateToken, verifyUserOwnership, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = req.profileUser;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    console.log('[UserAPI] Uploading profile picture for:', user.username);
    
    // Update user's profile picture
    user.profilePicture = {
      original: {
        url: `/uploads/profile/${req.file.filename}`,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      }
    };
    
    await user.save();
    
    console.log('[UserAPI] Profile picture uploaded successfully');
    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
    
  } catch (error) {
    console.error('[UserAPI] Error uploading profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Follow/unfollow a user
routeUser.post('/user/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { follow = true } = req.body;
    const currentUserEmail = req.user.email;
    
    console.log(`[UserAPI] ${follow ? 'Following' : 'Unfollowing'} user: ${username}`);
    
    // Get both users
    const [currentUser, targetUser] = await Promise.all([
      UserModel.findOne({ email: currentUserEmail }),
      UserModel.findOne({ 
        username: { $regex: new RegExp(`^${username}`, 'i') },
        // username: { $regex: new RegExp(`^${username}`, 'i') }, 
        isActive: true })
    ]);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (currentUser._id.equals(targetUser._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot follow yourself' 
      });
    }
    
    const followingIndex = currentUser.following.findIndex(
      f => f.userId.equals(targetUser._id)
    );
    const followerIndex = targetUser.followers.findIndex(
      f => f.userId.equals(currentUser._id)
    );
    
    if (follow) {
      if (followingIndex === -1) {
        // Add to following
        currentUser.following.push({
          userId: targetUser._id,
          followedAt: new Date()
        });
        
        // Add to followers
        targetUser.followers.push({
          userId: currentUser._id,
          followedAt: new Date()
        });
        
        await Promise.all([currentUser.save(), targetUser.save()]);
        
        console.log(`[UserAPI] ${currentUser.username} now follows ${targetUser.username}`);
      }
    } else {
      if (followingIndex >= 0) {
        // Remove from following
        currentUser.following.splice(followingIndex, 1);
        
        // Remove from followers
        if (followerIndex >= 0) {
          targetUser.followers.splice(followerIndex, 1);
        }
        
        await Promise.all([currentUser.save(), targetUser.save()]);
        
        console.log(`[UserAPI] ${currentUser.username} unfollowed ${targetUser.username}`);
      }
    }
    
    res.json({
      success: true,
      following: follow,
      message: follow ? 'User followed' : 'User unfollowed'
    });
    
  } catch (error) {
    console.error('[UserAPI] Error following/unfollowing user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// 11. FOLLOW/UNFOLLOW USER
routeUser.post('/@:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;
    
    console.log(`[UserAPI] Follow/unfollow request: ${req.user.username} -> ${username}`);
    
    // Find target user
    const targetUser = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    });
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Can't follow yourself
    if (targetUser._id.toString() === currentUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot follow yourself' 
      });
    }
    
    // Find current user
    const currentUser = await UserModel.findById(currentUserId);
    
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Current user not found' 
      });
    }
    
    // Check if already following
    const isFollowing = currentUser.isFollowing(targetUser._id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        follow => follow.userId.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        follower => follower.userId.toString() !== currentUserId
      );
      
      await Promise.all([currentUser.save(), targetUser.save()]);
      
      console.log(`[UserAPI] ${req.user.username} unfollowed ${username}`);
      
      res.json({
        success: true,
        following: false,
        message: `You are no longer following ${username}`,
        followerCount: targetUser.followers.length
      });
    } else {
      // Follow
      currentUser.following.push({
        userId: targetUser._id,
        followedAt: new Date()
      });
      targetUser.followers.push({
        userId: currentUser._id,
        followedAt: new Date()
      });
      
      await Promise.all([currentUser.save(), targetUser.save()]);
      
      console.log(`[UserAPI] ${req.user.username} followed ${username}`);
      
      res.json({
        success: true,
        following: true,
        message: `You are now following ${username}`,
        followerCount: targetUser.followers.length
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error following/unfollowing user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing follow request' 
    });
  }
});

// Get user's followers
routeUser.get('/user/:username/followers', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    console.log(`[UserAPI] Fetching followers for user: ${username}`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}`, 'i') },
      // username: { $regex: new RegExp(`^${username}`, 'i') },
      isActive: true 
    })
    .populate({
      path: 'followers.userId',
      select: 'username firstName lastName profilePicture headline neumadicStars',
      options: {
        skip: skip,
        limit: limitNum
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const totalFollowers = user.followers.length;
    const totalPages = Math.ceil(totalFollowers / limitNum);
    
    res.json({
      success: true,
      followers: user.followers.slice(skip, skip + limitNum).map(f => ({
        user: f.userId,
        followedAt: f.followedAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalFollowers: totalFollowers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error getting followers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching followers' 
    });
  }
});

// 14. GET USER FOLLOWERS
routeUser.get('/@:username/followers', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    console.log(`[UserAPI] Getting followers for: ${username}`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    })
    .select('followers profileVisibility')
    .populate({
      path: 'followers.userId',
      select: 'username firstName lastName additionalName profilePicture isVerified',
      match: { isActive: true }
    })
    .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if followers list is public
    if (user.profileVisibility?.followers !== 'public') {
      return res.status(403).json({ 
        success: false, 
        message: 'Followers list is private' 
      });
    }
    
    // Pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;
    
    const followers = user.followers
      .filter(follower => follower.userId) // Remove null users
      .slice(skip, skip + limitNum)
      .map(follower => ({
        id: follower.userId._id,
        username: follower.userId.username,
        displayName: follower.userId.additionalName || 
                    `${follower.userId.firstName || ''} ${follower.userId.lastName || ''}`.trim() || 
                    follower.userId.username,
        profilePicture: follower.userId.profilePicture,
        isVerified: follower.userId.isVerified,
        followedAt: follower.followedAt
      }));
    
    res.json({
      success: true,
      followers: followers,
      pagination: {
        currentPage: pageNum,
        totalItems: user.followers.length,
        totalPages: Math.ceil(user.followers.length / limitNum),
        hasNextPage: skip + limitNum < user.followers.length,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error getting followers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching followers' 
    });
  }
});

// Get user's following
routeUser.get('/user/:username/following', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    console.log(`[UserAPI] Fetching following for user: ${username}`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}`, 'i') },
      // username: { $regex: new RegExp(`^${username}`, 'i') },
      isActive: true 
    })
    .populate({
      path: 'following.userId',
      select: 'username firstName lastName profilePicture headline neumadicStars',
      options: {
        skip: skip,
        limit: limitNum
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const totalFollowing = user.following.length;
    const totalPages = Math.ceil(totalFollowing / limitNum);
    
    res.json({
      success: true,
      following: user.following.slice(skip, skip + limitNum).map(f => ({
        user: f.userId,
        followedAt: f.followedAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalFollowing: totalFollowing,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error getting following:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching following' 
    });
  }
});

// 15. GET USER FOLLOWING
routeUser.get('/@:username/following', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    console.log(`[UserAPI] Getting following for: ${username}`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    })
    .select('following profileVisibility')
    .populate({
      path: 'following.userId',
      select: 'username firstName lastName additionalName profilePicture isVerified',
      match: { isActive: true }
    })
    .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if following list is public
    if (user.profileVisibility?.following !== 'public') {
      return res.status(403).json({ 
        success: false, 
        message: 'Following list is private' 
      });
    }
    
    // Pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;
    
    const following = user.following
      .filter(follow => follow.userId) // Remove null users
      .slice(skip, skip + limitNum)
      .map(follow => ({
        id: follow.userId._id,
        username: follow.userId.username,
        displayName: follow.userId.additionalName || 
                    `${follow.userId.firstName || ''} ${follow.userId.lastName || ''}`.trim() || 
                    follow.userId.username,
        profilePicture: follow.userId.profilePicture,
        isVerified: follow.userId.isVerified,
        followedAt: follow.followedAt
      }));
    
    res.json({
      success: true,
      following: following,
      pagination: {
        currentPage: pageNum,
        totalItems: user.following.length,
        totalPages: Math.ceil(user.following.length / limitNum),
        hasNextPage: skip + limitNum < user.following.length,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error getting following:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching following' 
    });
  }
});

// Get user stats
routeUser.get('/user/:username/stats', async (req, res) => {
  try {
    const username = req.params.username;
    console.log('[UserAPI] Getting stats for:', username);
    
    const user = await UserModel.findOne({ 
      // username: { $regex: new RegExp(`^${username}`, 'i') }
      username: { $regex: new RegExp(`^${username}`, 'i') },
     });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const stats = user.getStats();
    const profileStats = user.getProfileStats();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        ...profileStats
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// 12. ENDORSE USER
routeUser.post('/@:username/endorse', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { skill, message } = req.body;
    const currentUserId = req.user.id;
    
    console.log(`[UserAPI] Endorse request: ${req.user.username} -> ${username}`);
    
    // Find target user
    const targetUser = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    });
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Can't endorse yourself
    if (targetUser._id.toString() === currentUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot endorse yourself' 
      });
    }
    
    // Check if already endorsed for this skill
    const existingEndorsement = targetUser.endorsements.find(
      endorsement => 
        endorsement.fromUserId.toString() === currentUserId && 
        endorsement.skill === skill
    );
    
    if (existingEndorsement) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already endorsed this user for this skill' 
      });
    }
    
    // Add endorsement
    targetUser.endorsements.push({
      fromUserId: currentUserId,
      skill: skill || 'General',
      message: message || '',
      endorsedAt: new Date()
    });
    
    await targetUser.save();
    
    console.log(`[UserAPI] ${req.user.username} endorsed ${username} for ${skill}`);
    
    res.json({
      success: true,
      message: `You have endorsed ${username}`,
      endorsementCount: targetUser.endorsements.length
    });
    
  } catch (error) {
    console.error('[UserAPI] Error endorsing user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing endorsement' 
    });
  }
});

// 13. BLOCK/UNBLOCK USER
routeUser.post('/@:username/block', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { reason } = req.body;
    const currentUserId = req.user.id;
    
    console.log(`[UserAPI] Block/unblock request: ${req.user.username} -> ${username}`);
    
    // Find target user
    const targetUser = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    });
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Can't block yourself
    if (targetUser._id.toString() === currentUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot block yourself' 
      });
    }
    
    // Find current user
    const currentUser = await UserModel.findById(currentUserId);
    
    // Check if already blocked
    const isBlocked = currentUser.hasBlocked(targetUser._id);
    
    if (isBlocked) {
      // Unblock
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        blocked => blocked.userId.toString() !== targetUser._id.toString()
      );
      
      await currentUser.save();
      
      console.log(`[UserAPI] ${req.user.username} unblocked ${username}`);
      
      res.json({
        success: true,
        blocked: false,
        message: `You have unblocked ${username}`
      });
    } else {
      // Block
      currentUser.blockedUsers.push({
        userId: targetUser._id,
        blockedAt: new Date(),
        reason: reason || 'No reason provided'
      });
      
      // Also remove from following/followers
      currentUser.following = currentUser.following.filter(
        follow => follow.userId.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        follower => follower.userId.toString() !== currentUserId
      );
      
      await Promise.all([currentUser.save(), targetUser.save()]);
      
      console.log(`[UserAPI] ${req.user.username} blocked ${username}`);
      
      res.json({
        success: true,
        blocked: true,
        message: `You have blocked ${username}`
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error blocking/unblocking user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing block request' 
    });
  }
});

// Delete user account
routeUser.delete('/user', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log('[UserAPI] Deleting account for:', userEmail);
    
    const user = await UserModel.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Soft delete - just deactivate the account
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    
    console.log('[UserAPI] Account deactivated successfully');
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('[UserAPI] Error deleting account:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

///////////////////////// SOCIAL ENDPOINTS /////////////////////////




///////////////////////// START STORE DATA ENDPOINTS /////////////////////////
// Get user's stores data
routeUser.get('/user/:username/stores', async (req, res) => {
  try {
    // const username = req.params.username;
    const { username } = req.params;
    const { type = 'visited', limit = 20, offset = 0 } = req.query;
    console.log('[UserAPI] Getting stores data for:', username);
    
    // const user = await UserModel.findOne({ username: { $regex: new RegExp(`^${username}`, 'i') } })
    //   .select('stores checkedInStores visitHistory savedStores')
    //   .lean();
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}`, 'i') },
      username: { $regex: new RegExp(`^${username}`, 'i') },
      isActive: true 
    }).select('checkedInStores visitHistory savedStores placesWantToVisit impressions');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      stores: user.stores || [],
      checkedInStores: user.checkedInStores || [],
      visitHistory: user.visitHistory || [],
      savedStores: user.savedStores || [],
      stats: {
        totalStores: user.stores?.length || 0,
        totalCheckins: user.checkedInStores?.length || 0,
        totalVisits: user.visitHistory?.length || 0,
        totalSaved: user.savedStores?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user stores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get current user's store data
routeUser.get('/user/stores', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log(`[UserAPI] Fetching store data for user: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('checkedInStore checkedInStores visitHistory savedStores')
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const currentStore = user.checkedInStore;
    const recentCheckedInStores = user.checkedInStores ? 
      user.checkedInStores.slice(0, 10) : [];
    
    res.json({
      success: true,
      currentStore: currentStore || null,
      recentCheckIns: recentCheckedInStores,
      visitHistory: user.visitHistory || [],
      savedStores: user.savedStores || []
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user store data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

///////////////////////// END STORE DATA ENDPOINTS /////////////////////////




///////////////////////// START BLOG DATA ENDPOINTS /////////////////////////
// Get user's blog data (posts, created, saved, liked)

// GET USER BLOG DATA WITH POPULATED BLOG POSTS
routeUser.get('/user/blogs', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`[UserAPI] Fetching blog data for user: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('blogPosts blogsCreated savedBlogs likedBlogs')
      .populate({
        path: 'blogPosts.blogId',
        model: 'Blog',
        select: 'slug title snippet category media publishedAt status author interactions'
      })
      .maxTimeMS(5000);
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Also fetch blogs from the Blog collection where this user is the author
    const authoredBlogs = await BlogModel.find({
      'author.username': user.username,
      status: 'published'
    })
    .select('slug title snippet category media publishedAt status interactions')
    .sort({ publishedAt: -1 })
    .limit(20)
    .maxTimeMS(5000);
    
    console.log(`[UserAPI] Found ${authoredBlogs.length} authored blogs for: ${user.username}`);
    
    // Merge blogPosts with authored blogs (avoiding duplicates)
    const blogIds = new Set(user.blogPosts.map(bp => bp.blogId?._id?.toString()).filter(Boolean));
    
    // Add authored blogs to blogPosts if not already there
    for (const blog of authoredBlogs) {
      if (!blogIds.has(blog._id.toString())) {
        user.blogPosts.push({
          blogId: blog,
          title: blog.title,
          slug: blog.slug,
          category: blog.category?.category || 'dine',
          snippet: blog.snippet?.text || '',
          thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
          status: blog.status,
          publishedAt: blog.publishedAt,
          addedAt: blog.publishedAt
        });
      }
    }
    
    // Sort by publishedAt date
    const sortedBlogPosts = user.blogPosts
      .filter(post => post.blogId) // Only include posts with valid blog references
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.addedAt);
        const dateB = new Date(b.publishedAt || b.addedAt);
        return dateB - dateA;
      });
    
    console.log(`[UserAPI] Blog data retrieved for: ${userEmail}`);
    console.log(`[UserAPI] Blog posts: ${sortedBlogPosts.length}`);
    console.log(`[UserAPI] Blogs created: ${user.blogsCreated?.length || 0}`);
    console.log(`[UserAPI] Saved blogs: ${user.savedBlogs?.length || 0}`);
    console.log(`[UserAPI] Liked blogs: ${user.likedBlogs?.length || 0}`);
    
    res.json({
      success: true,
      // blogPosts: sortedBlogPosts,
      blogPosts: user.blogPosts || [],
      blogsCreated: user.blogsCreated || [],
      savedBlogs: user.savedBlogs || [],
      likedBlogs: user.likedBlogs || [],
      blogHistory: user.blogHistory || [],
      stats: {
        totalBlogPosts: sortedBlogPosts.filter(post => post.status === 'published').length,
        totalBlogsCreated: user.blogsCreated?.length || 0,
        totalSavedBlogs: user.savedBlogs?.length || 0,
        totalLikedBlogs: user.likedBlogs?.length || 0,
        totalBlogViews: user.blogHistory?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user blog data:', error.message);
    
    if (error.message.includes('timeout')) {
      res.status(504).json({ 
        success: false, 
        message: 'Database timeout. Please try again.'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching blog data'
      });
    }
  }
});

routeUser.get('/user/:username/blogs', async (req, res) => {
  try {
    const { username } = req.params;
    const { status = 'published', limit = 20, offset = 0 } = req.query;
    // const username = req.params.username;
    // const { status = 'published', limit = 20, offset = 0 } = req.query;
    const { tab = 'posts' } = req.query;
    
    console.log(`[UserAPI] Fetching blogs for user: ${username}, status: ${status}`);
    // Determine if this is the authenticated user
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isOwnProfile = false;
    let userEmail = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        userEmail = decoded.email;
        isOwnProfile = true;
        console.log('[UserAPI] Authenticated request from:', userEmail);
      } catch (error) {
        console.log('[UserAPI] Invalid token, treating as public request');
      }
    }
    
    console.log(`[UserAPI] Fetching blogs for user: ${username}, status: ${status}`);
    
    // const user = await UserModel.findOne({ 
    //   username: { $regex: new RegExp(`^${username}`, 'i') },
    //   // username: { $regex: new RegExp(`^${username}`, 'i') },
    //   isActive: true 
    // })
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}`, 'i') },
      isActive: true 
    })
      .select('blogPosts')
      .populate({
        path: 'blogPosts.blogId',
        model: 'Blog',
        select: 'title slug category snippet media status publishedAt author'
      })
      .lean()
      .select('blogPosts');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify ownership if authenticated
    if (isOwnProfile && user.email !== userEmail) {
      isOwnProfile = false;
    }
    
    // Get authored blogs from Blog collection
    const authoredBlogs = await BlogModel.find({ 
      'author.username': username,
      status: 'published'
    })
    .select('title slug category snippet media status publishedAt author likes comments')
    .sort({ publishedAt: -1 })
    .limit(20)
    .maxTimeMS(5000);
    
    console.log(`[UserAPI] Found ${authoredBlogs.length} authored blogs for: ${user.username}`);
    
    // Filter blog posts by status
    let blogs = user.blogPosts || [];
    if (status !== 'all') {
      blogs = blogs.filter(blog => blog.status === status);
    }
    
    // Sort by publishedAt or addedAt
    blogs.sort((a, b) => {
      const dateA = a.publishedAt || a.addedAt;
      const dateB = b.publishedAt || b.addedAt;
      return new Date(dateB) - new Date(dateA);
    });
    
    // Apply pagination
    const paginatedBlogs = blogs.slice(offset, offset + limit);
    
    // Merge blogPosts with authored blogs (avoiding duplicates)
    const blogIds = new Set(user.blogPosts.map(bp => bp.blogId?._id?.toString()).filter(Boolean));
    
    // Add authored blogs to blogPosts if not already there
    for (const blog of authoredBlogs) {
      if (!blogIds.has(blog._id.toString())) {
        user.blogPosts.push({
          blogId: blog,
          title: blog.title,
          slug: blog.slug,
          category: blog.category?.category || 'dine',
          snippet: blog.snippet?.text || '',
          thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
          status: blog.status,
          publishedAt: blog.publishedAt,
          addedAt: blog.publishedAt
        });
      }
    }
    
    // Sort by publishedAt date
    const sortedBlogPosts = user.blogPosts
      .filter(post => post.blogId) // Only include posts with valid blog references
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.addedAt);
        const dateB = new Date(b.publishedAt || b.addedAt);
        return dateB - dateA;
      });
    
    console.log(`[UserAPI] Blog data retrieved for: ${userEmail}`);
    console.log(`[UserAPI] Blog posts: ${sortedBlogPosts.length}`);
    console.log(`[UserAPI] Blogs created: ${user.blogsCreated?.length || 0}`);
    console.log(`[UserAPI] Saved blogs: ${user.savedBlogs?.length || 0}`);
    console.log(`[UserAPI] Liked blogs: ${user.likedBlogs?.length || 0}`);
    
    res.json({
      success: true,
      blogs: paginatedBlogs,
      total: blogs.length,
      hasMore: (offset + limit) < blogs.length,
      blogPosts: sortedBlogPosts,
      // blogs: paginatedBlogs,
      // total: blogs.length,
      // hasMore: (offset + limit) < blogs.length,
      blogsCreated: user.blogsCreated || [],
      savedBlogs: user.savedBlogs || [],
      likedBlogs: user.likedBlogs || [],
      blogHistory: user.blogHistory || [],
      stats: {
        totalBlogPosts: sortedBlogPosts.filter(post => post.status === 'published').length,
        totalBlogsCreated: user.blogsCreated?.length || 0,
        totalSavedBlogs: user.savedBlogs?.length || 0,
        totalLikedBlogs: user.likedBlogs?.length || 0,
        totalBlogViews: user.blogHistory?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[UserAPI] Error fetching user blog data:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('[UserAPI] Error updating profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating profile' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Add blog to user's blogPosts
routeUser.post('/user/blog', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { blogId } = req.body;
    
    console.log('[UserAPI] Adding blog to user blogPosts:', { userEmail, blogId });
    
    // Find the user
    const user = await UserModel.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Find the blog
    const blog = await BlogModel.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    
    // Check if blog already exists in blogPosts
    const existingIndex = user.blogPosts.findIndex(bp => 
      bp.blogId?.toString() === blogId
    );
    
    if (existingIndex === -1) {
      // Add blog to blogPosts
      user.blogPosts.push({
        blogId: blog._id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category?.category || 'dine',
        snippet: blog.snippet?.text || '',
        thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
        status: blog.status,
        publishedAt: blog.publishedAt,
        addedAt: new Date()
      });
      
      // Also add to blogsCreated if user is the author
      if (blog.author?.email === userEmail || blog.author?.username === user.username) {
        const createdIndex = user.blogsCreated.findIndex(bc => 
          bc.blogId?.toString() === blogId
        );
        
        if (createdIndex === -1) {
          user.blogsCreated.push({
            blogId: blog._id,
            title: blog.title,
            slug: blog.slug,
            status: blog.status,
            publishedAt: blog.publishedAt,
            createdAt: blog.createdAt || new Date()
          });
        }
      }
      
      await user.save();
      
      console.log('[UserAPI] Blog added to user successfully');
      res.json({
        success: true,
        message: 'Blog added to user successfully',
        blogPost: user.blogPosts[user.blogPosts.length - 1]
      });
    } else {
      console.log('[UserAPI] Blog already exists in user blogPosts');
      res.json({
        success: true,
        message: 'Blog already in user posts',
        blogPost: user.blogPosts[existingIndex]
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error adding blog to user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Save/unsave blog
routeUser.post('/user/blog/save', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { blogId, save = true } = req.body;
    
    console.log('[UserAPI] Save/unsave blog:', { userEmail, blogId, save });
    
    const user = await UserModel.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const savedIndex = user.savedBlogs.findIndex(sb => 
      sb.blogId?.toString() === blogId
    );
    
    if (save && savedIndex === -1) {
      // Save the blog
      user.savedBlogs.push({
        blogId: blogId,
        savedAt: new Date()
      });
      await user.save();
      
      console.log('[UserAPI] Blog saved successfully');
      res.json({
        success: true,
        message: 'Blog saved successfully',
        saved: true
      });
    } else if (!save && savedIndex !== -1) {
      // Unsave the blog
      user.savedBlogs.splice(savedIndex, 1);
      await user.save();
      
      console.log('[UserAPI] Blog unsaved successfully');
      res.json({
        success: true,
        message: 'Blog unsaved successfully',
        saved: false
      });
    } else {
      res.json({
        success: true,
        message: save ? 'Blog already saved' : 'Blog not in saved list',
        saved: save
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error saving/unsaving blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Like/unlike blog
routeUser.post('/user/blog/like', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { blogId, like = true } = req.body;
    
    console.log('[UserAPI] Like/unlike blog:', { userEmail, blogId, like });
    
    const user = await UserModel.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const likedIndex = user.likedBlogs.findIndex(lb => 
      lb.blogId?.toString() === blogId
    );
    
    if (like && likedIndex === -1) {
      // Like the blog
      user.likedBlogs.push({
        blogId: blogId,
        likedAt: new Date()
      });
      await user.save();
      
      // Update blog's like count
      await BlogModel.findByIdAndUpdate(blogId, {
        $inc: { 'likes.count': 1 }
      });
      
      console.log('[UserAPI] Blog liked successfully');
      res.json({
        success: true,
        message: 'Blog liked successfully',
        liked: true
      });
    } else if (!like && likedIndex !== -1) {
      // Unlike the blog
      user.likedBlogs.splice(likedIndex, 1);
      await user.save();
      
      // Update blog's like count
      await BlogModel.findByIdAndUpdate(blogId, {
        $inc: { 'likes.count': -1 }
      });
      
      console.log('[UserAPI] Blog unliked successfully');
      res.json({
        success: true,
        message: 'Blog unliked successfully',
        liked: false
      });
    } else {
      res.json({
        success: true,
        message: like ? 'Blog already liked' : 'Blog not in liked list',
        liked: like
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error liking/unliking blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Add blog to user's blogPosts when published
routeUser.post('/user/blogs/add', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { blogId, title, slug, category, snippet, thumbnail, status, publishedAt } = req.body;
    
    console.log(`[UserAPI] Adding blog to user's posts: ${slug}`);
    
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if blog already exists in user's posts
    const existingIndex = user.blogPosts.findIndex(p => p.blogId?.toString() === blogId);
    
    if (existingIndex >= 0) {
      // Update existing blog post
      user.blogPosts[existingIndex] = {
        blogId,
        title,
        slug,
        category: category || 'dine',
        snippet: snippet || '',
        thumbnail: thumbnail || '',
        status: status || 'draft',
        publishedAt: status === 'published' ? (publishedAt || new Date()) : null,
        addedAt: user.blogPosts[existingIndex].addedAt
      };
    } else {
      // Add new blog post
      user.blogPosts.push({
        blogId,
        title,
        slug,
        category: category || 'dine',
        snippet: snippet || '',
        thumbnail: thumbnail || '',
        status: status || 'draft',
        publishedAt: status === 'published' ? (publishedAt || new Date()) : null,
        addedAt: new Date()
      });
    }
    
    // Also update blogsCreated if needed
    const createdIndex = user.blogsCreated.findIndex(b => b.blogId?.toString() === blogId);
    if (createdIndex >= 0) {
      user.blogsCreated[createdIndex].status = status;
      user.blogsCreated[createdIndex].publishedAt = status === 'published' ? (publishedAt || new Date()) : null;
    } else if (status === 'published') {
      user.blogsCreated.push({
        blogId,
        title,
        slug,
        status,
        publishedAt: publishedAt || new Date(),
        createdAt: new Date()
      });
    }
    
    await user.save();
    
    console.log(`[UserAPI] Blog added to user's posts: ${slug}`);
    
    res.json({
      success: true,
      message: 'Blog added to profile',
      blogPostsCount: user.blogPosts.length
    });
    
  } catch (error) {
    console.error('[UserAPI] Error adding blog to user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Save/unsave a blog post
routeUser.post('/user/blogs/:blogId/save', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { blogId } = req.params;
    const { save = true } = req.body;
    
    console.log(`[UserAPI] ${save ? 'Saving' : 'Unsaving'} blog: ${blogId}`);
    
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const savedIndex = user.savedBlogs.findIndex(b => b.blogId?.toString() === blogId);
    
    if (save && savedIndex === -1) {
      // Save the blog
      user.savedBlogs.push({
        blogId,
        savedAt: new Date()
      });
      await user.save();
      
      res.json({
        success: true,
        message: 'Blog saved',
        saved: true
      });
    } else if (!save && savedIndex >= 0) {
      // Unsave the blog
      user.savedBlogs.splice(savedIndex, 1);
      await user.save();
      
      res.json({
        success: true,
        message: 'Blog unsaved',
        saved: false
      });
    } else {
      res.json({
        success: true,
        message: save ? 'Blog already saved' : 'Blog not in saved list',
        saved: save
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error saving/unsaving blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Like/unlike a blog post
routeUser.post('/user/blogs/:blogId/like', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { blogId } = req.params;
    const { like = true } = req.body;
    
    console.log(`[UserAPI] ${like ? 'Liking' : 'Unliking'} blog: ${blogId}`);
    
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const likedIndex = user.likedBlogs.findIndex(b => b.blogId?.toString() === blogId);
    
    if (like && likedIndex === -1) {
      // Like the blog
      user.likedBlogs.push({
        blogId,
        likedAt: new Date()
      });
      await user.save();
      
      res.json({
        success: true,
        message: 'Blog liked',
        liked: true
      });
    } else if (!like && likedIndex >= 0) {
      // Unlike the blog
      user.likedBlogs.splice(likedIndex, 1);
      await user.save();
      
      res.json({
        success: true,
        message: 'Blog unliked',
        liked: false
      });
    } else {
      res.json({
        success: true,
        message: like ? 'Blog already liked' : 'Blog not in liked list',
        liked: like
      });
    }
    
  } catch (error) {
    console.error('[UserAPI] Error liking/unliking blog:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// SYNC USER BLOG POSTS - Add blog reference to user's blogPosts array
routeUser.post('/user/blogs/sync', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`[UserAPI] Syncing blog posts for user: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Find all blogs authored by this user
    const userBlogs = await BlogModel.find({
      'author.username': user.username
    })
    .select('_id slug title snippet category media status publishedAt')
    .maxTimeMS(10000);
    
    console.log(`[UserAPI] Found ${userBlogs.length} blogs to sync for user: ${user.username}`);
    
    // Update user's blogPosts array
    const blogPostsToAdd = [];
    const existingBlogIds = new Set(user.blogPosts.map(bp => bp.blogId?.toString()));
    
    for (const blog of userBlogs) {
      if (!existingBlogIds.has(blog._id.toString())) {
        blogPostsToAdd.push({
          blogId: blog._id,
          title: blog.title,
          slug: blog.slug,
          category: blog.category?.category || 'dine',
          snippet: blog.snippet?.text || '',
          thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
          status: blog.status,
          publishedAt: blog.publishedAt,
          addedAt: new Date()
        });
      }
    }
    
    if (blogPostsToAdd.length > 0) {
      user.blogPosts.push(...blogPostsToAdd);
      await user.save();
      console.log(`[UserAPI] Added ${blogPostsToAdd.length} blog posts to user: ${user.username}`);
    }
    
    res.json({
      success: true,
      message: `Synced ${blogPostsToAdd.length} blog posts`,
      totalBlogPosts: user.blogPosts.length
    });
    
  } catch (error) {
    console.error('[UserAPI] Error syncing blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error syncing blog posts'
    });
  }
});

///////////////////////// END BLOG DATA ENDPOINTS /////////////////////////



///////////////////////// START USER DIAGNOSTIC AND FIX /////////////////////////
// Add these endpoints to your routeUser.js for debugging

// DIAGNOSTIC: List all users (remove in production)
routeUser.get('/debug/users', async (req, res) => {
  try {
    console.log('[UserAPI DEBUG] Listing all users');
    
    const users = await UserModel.find({})
      .select('username email isActive createdAt')
      .limit(50);
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        username: u.username,
        email: u.email,
        isActive: u.isActive,
        created: u.createdAt
      }))
    });
  } catch (error) {
    console.error('[UserAPI DEBUG] Error listing users:', error);
    res.status(500).json({ error: error.message });
  }
});

// DIAGNOSTIC: Find user by partial username
routeUser.get('/debug/find-user/:partial', async (req, res) => {
  try {
    const { partial } = req.params;
    console.log(`[UserAPI DEBUG] Finding users matching: ${partial}`);
    
    const users = await UserModel.find({
      username: { $regex: partial, $options: 'i' }
    })
    .select('username email isActive')
    .limit(10);
    
    res.json({
      success: true,
      searchTerm: partial,
      found: users.length,
      users: users
    });
  } catch (error) {
    console.error('[UserAPI DEBUG] Error finding users:', error);
    res.status(500).json({ error: error.message });
  }
});

// FIX: Create or update a user for testing
routeUser.post('/debug/create-test-user', async (req, res) => {
  try {
    const { username = 'neumad', email = 'neumad@example.com', password = 'test123' } = req.body;
    
    console.log(`[UserAPI DEBUG] Creating/updating test user: ${username}`);
    
    // Check if user exists
    let user = await UserModel.findOne({ 
      $or: [
        { username: { $regex: new RegExp(`^${username}`, 'i') } },
        { email: email.toLowerCase() }
      ]
    });
    
    if (user) {
      // Update existing user
      user.username = username.toLowerCase();
      user.isActive = true;
      await user.save();
      
      res.json({
        success: true,
        message: 'User updated',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive
        }
      });
    } else {
      // Create new user
      const newUser = new UserModel({
        username: { $regex: new RegExp(`^${username}`, 'i') },
        email: email.toLowerCase(),
        password: password,
        isActive: true,
        firstName: 'Test',
        lastName: 'User',
        headline: 'Test Profile',
        overview: 'This is a test user profile for development.',
        profileVisibility: {
          activity: 'public',
          posts: 'public',
          places: 'public',
          reviews: 'public'
        }
      });
      
      await newUser.save();
      
      res.json({
        success: true,
        message: 'User created',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          isActive: newUser.isActive
        }
      });
    }
  } catch (error) {
    console.error('[UserAPI DEBUG] Error creating test user:', error);
    res.status(500).json({ error: error.message });
  }
});

///////////////////////// END USER DIAGNOSTIC AND FIX /////////////////////////




///////////////////////// LEGACY ENDPOINTS (for backward compatibility) /////////////////////////

// Legacy endpoint
routeUser.get('/user-profile', authenticateToken, userController.getUserProfile, async (req, res) => {
  // Redirect to new endpoint
  console.log('[UserAPI] Legacy endpoint accessed, redirecting to /profile');
  return res.redirect('/api/profile');
});

// Legacy endpoint
routeUser.post('/user-profile', authenticateToken, userController.updateUserProfile, async (req, res) => {
  // Redirect to new endpoint
  console.log('[UserAPI] Legacy endpoint accessed, redirecting to /profile');
  return res.redirect('/api/profile');
});

export default routeUser;
///////////////////////// END COMPLETE USER PROFILE ROUTES /////////////////////////