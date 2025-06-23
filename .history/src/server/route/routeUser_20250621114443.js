///////////////////////// START COMPLETE USER PROFILE ROUTES /////////////////////////
// src/server/route/routeUser.js - Complete user profile routing system

import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
// import { UserModel } from '../models/userModel.js';
// import { StoreModel } from '../models/storeModel.js';
// import { BlogModel } from '../models/blogModel.js';
import { UserModel, StoreModel, BlogModel } from '../data/mongodb/mongodb.js';

const routeUser = express.Router();

const express = require('express');
// const router = express.Router();
const userController = require('../controllers/UserProfile');
const authenticateToken = require('../middleware/authenticateToken');

console.log('[UserAPI] Loading user routes with complete profile functionality');

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

// Authentication middleware
const authenticateToken = (req, res, next) => {
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
      
      // Return complete profile data for own profile
      const completeProfile = {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.additionalName || user.fullName,
        description: user.overview || user.description,
        headline: user.headline,
        profession: user.profession,
        industry: user.industry,
        company: user.company,
        location: user.location || user.city,
        country: user.country,
        state: user.state,
        postalCode: user.postalCode,
        website: user.website,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
        gender: user.gender,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        socialMedia: user.socialMedia,
        isVerified: user.isVerified,
        isActive: user.isActive,
        profilePrivacy: user.profilePrivacy,
        profileVisibility: user.profileVisibility,
        joinedAt: user.createdAt,
        lastLogin: user.lastLogin,
        
        // Store activity data
        checkedInStore: user.checkedInStore,
        checkedInStores: user.checkedInStores || [],
        visitHistory: user.visitHistory || [],
        savedStores: user.savedStores || [],
        placesWantToVisit: user.placesWantToVisit || [],
        placesRecommended: user.placesRecommended || [],
        placesRequested: user.placesRequested || [],
        likedStores: user.likedStores || [],
        dislikedStores: user.dislikedStores || [],
        impressionsLiked: user.impressionsLiked || [],
        impressionsDisliked: user.impressionsDisliked || [],
        
        // Blog activity data (similar to stores)
        blogPosts: user.blogPosts || [],
        savedBlogs: user.savedBlogs || [],
        likedBlogs: user.likedBlogs || [],
        blogHistory: user.blogHistory || [],
        
        // Social data
        following: user.following || [],
        followers: user.followers || [],
        endorsements: user.endorsements || [],
        blockedUsers: user.blockedUsers || [],
        
        // Content data
        blogsCreated: user.blogsCreated || [],
        
        // Karma system
        neuradicStars: user.neuradicStars || 0,
        starHistory: user.starHistory || []
    };
  
      res.json(completeProfile);
      
    } catch (error) {
    console.error('[UserAPI] Error fetching complete profile:', error.message);
    
    if (error.message.includes('timeout')) {
        res.status(504).json({ message: 'Database timeout. Please try again.' });
    } else {
        res.status(500).json({ message: 'Error fetching profile' });
    }
    }
});


// UPDATE USER PROFILE SETTINGS
routeUser.post('/settings', authenticateToken, async (req, res) => {
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
        'firstName', 'lastName', 'fullName', 'additionalName', 'description', 'overview', 'headline',
        'profession', 'industry', 'company', 'location', 'country', 'state',
        'postalCode', 'website', 'phoneNumber', 'birthdate', 'gender',
        'profilePrivacy', 'profileVisibility', 'socialMedia'
      ];
      
        const updateFields = {};
      
        / Process regular fields
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
          fullName: updatedUser.additionalName || updatedUser.fullName,
          description: updatedUser.overview || updatedUser.description,
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


// GET PUBLIC USER PROFILE BY USERNAME (moved from auth server)
routeUser.get('/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      console.log(`[UserAPI] Fetching profile for username: ${username}`);
      
      // Add timeout to database query
      const user = await UserModel.findOne({ 
        username: username.toLowerCase() 
      }).maxTimeMS(5000);
      
      if (!user) {
        console.log(`[UserAPI] User not found: ${username}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log(`[UserAPI] Profile found for: ${user.username}`);
      
      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.additionalName || user.fullName,
          description: user.overview || user.description,
          headline: user.headline,
          profession: user.profession,
          industry: user.industry,
          company: user.company,
          location: user.location,
          website: user.website,
          profilePicture: user.profilePicture,
          coverPicture: user.coverPicture,
          isVerified: user.isVerified,
          joinedAt: user.createdAt,
          profileStats: {
            checkedInStores: user.checkedInStores ? user.checkedInStores.length : 0,
            visitHistory: user.visitHistory ? user.visitHistory.length : 0,
            followers: user.followers ? user.followers.length : 0,
            following: user.following ? user.following.length : 0,
            neuradicStars: user.neuradicStars || 0
          }
        }
      });
    } catch (error) {
      console.error('[UserAPI] Error fetching user profile:', error.message);
      
      if (error.message.includes('timeout')) {
        res.status(504).json({ message: 'Database timeout. Please try again.' });
      } else {
        res.status(500).json({ message: 'Error fetching user profile' });
      }
    }
  });

///////////////////////// USER DATA ENDPOINTS /////////////////////////

// GET CURRENT USER DATA (for API calls)
routeUser.get('/user', authenticateToken, async (req, res) => {
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

// GET USER STORE DATA (for ProfileScreen) - FIXED ENDPOINT
routeUser.get('/user/store', authenticateToken, async (req, res) => {
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

///////////////////////// PUBLIC PROFILE ENDPOINTS /////////////////////////
  
// 1. GET PUBLIC USER PROFILE BY USERNAME
routeUser.get('/@:username', async (req, res) => {
    try {
      const { username } = req.params;
      console.log(`[UserAPI] Fetching public profile for username: ${username}`);
      
      // Find user by username (case insensitive)
      const user = await UserModel.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') },
        isActive: true
      })
      .select('-password -refreshTokens -verificationToken -resetPasswordToken -blockedUsers -reportedContent')
      .maxTimeMS(5000);
      
      if (!user) {
        console.log(`[UserAPI] User not found: ${username}`);
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Check privacy settings
      if (user.profilePrivacy === 'private') {
        console.log(`[UserAPI] Profile is private: ${username}`);
        return res.status(403).json({ 
          success: false, 
          message: 'This profile is private' 
        });
      }
      
      console.log(`[UserAPI] Public profile found for: ${user.username}`);
      
      // Calculate public stats
      const publicStats = {
        totalPlaces: (user.visitHistory?.length || 0) + (user.savedStores?.length || 0),
        totalContributions: (user.impressionsLiked?.length || 0) + (user.impressionsDisliked?.length || 0),
        totalFollowers: user.followers?.length || 0,
        totalFollowing: user.following?.length || 0,
        totalEndorsements: user.endorsements?.length || 0,
        neuradicStars: user.neuradicStars || 0,
        joinedAt: user.createdAt
      };
      
      // Return limited public profile data
      const publicProfile = {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.additionalName,
        description: user.overview,
        headline: user.headline,
        profession: user.profession,
        industry: user.industry,
        company: user.company,
        location: user.location || user.city,
        website: user.website,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        socialMedia: user.socialMedia,
        isVerified: user.isVerified,
        joinedAt: user.createdAt,
        profileStats: publicStats,
        profileVisibility: user.profileVisibility
      };
  
      res.json({
        success: true,
        user: publicProfile
      });
      
    } catch (error) {
      console.error('[UserAPI] Error fetching public profile:', error.message);
      
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

///////////////////////// AUTHENTICATED USER ENDPOINTS /////////////////////////

// // 5. GET CURRENT USER'S COMPLETE PROFILE
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
    
//     // Calculate complete stats
//     const completeStats = user.getProfileStats();
    
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
//       location: user.location || user.city,
//       country: user.country,
//       state: user.state,
//       postalCode: user.postalCode,
//       website: user.website,
//       phoneNumber: user.phoneNumber,
//       birthdate: user.birthdate,
//       gender: user.gender,
//       profilePicture: user.profilePicture,
//       coverPicture: user.coverPicture,
//       socialMedia: user.socialMedia,
//       isVerified: user.isVerified,
//       isActive: user.isActive,
//       profilePrivacy: user.profilePrivacy,
//       profileVisibility: user.profileVisibility,
//       joinedAt: user.createdAt,
//       lastLogin: user.lastLogin,
      
//       // Store activity data
//       checkedInStore: user.checkedInStore,
//       checkedInStores: user.checkedInStores,
//       visitHistory: user.visitHistory,
//       savedStores: user.savedStores,
//       placesWantToVisit: user.placesWantToVisit,
//       placesRecommended: user.placesRecommended,
//       placesRequested: user.placesRequested,
//       likedStores: user.likedStores,
//       dislikedStores: user.dislikedStores,
//       impressionsLiked: user.impressionsLiked,
//       impressionsDisliked: user.impressionsDisliked,
      
//       // Social data
//       following: user.following,
//       followers: user.followers,
//       endorsements: user.endorsements,
//       blockedUsers: user.blockedUsers,
      
//       // Content data
//       blogsCreated: user.blogsCreated,
      
//       // Karma system
//       neuradicStars: user.neuradicStars,
//       starHistory: user.starHistory,
      
//       // Complete stats
//       profileStats: completeStats,
//       profileCompleteness: user.getProfileCompleteness()
//     };

//     res.json(completeProfile);
    
//   } catch (error) {
//     console.error('[UserAPI] Error fetching complete profile:', error.message);
    
//     if (error.message.includes('timeout')) {
//       res.status(504).json({ message: 'Database timeout. Please try again.' });
//     } else {
//       res.status(500).json({ message: 'Error fetching profile' });
//     }
//   }
// });

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

// // 10. CHECK USERNAME AVAILABILITY
// routeUser.post('/check-username', authenticateToken, async (req, res) => {
//   try {
//     const { username } = req.body;
//     const currentUserEmail = req.user.email;
    
//     if (!username) {
//       return res.status(400).json({ 
//         available: false,
//         message: 'Username is required' 
//       });
//     }
    
//     const trimmedUsername = username.trim().toLowerCase();
    
//     console.log(`[UserAPI] Checking username availability: ${trimmedUsername} for user: ${currentUserEmail}`);
    
//     // Validate username format
//     if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
//       return res.status(400).json({ 
//         available: false,
//         message: 'Username can only contain letters, numbers, underscores, and dashes' 
//       });
//     }
    
//     if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
//       return res.status(400).json({ 
//         available: false,
//         message: 'Username must be between 3 and 30 characters' 
//       });
//     }
    
//     // Check if username exists for a different user
//     const existingUser = await UserModel.findOne({ 
//       username: trimmedUsername,
//       email: { $ne: currentUserEmail } // Exclude current user
//     }).maxTimeMS(5000);
    
//     const result = { 
//       available: !existingUser,
//       message: existingUser ? 'Username is already taken' : 'Username is available'
//     };
    
//     console.log(`[UserAPI] Username availability result: ${result.available} for ${trimmedUsername}`);
//     res.json(result);
    
//   } catch (error) {
//     console.error('[UserAPI] Error checking username availability:', error.message);
    
//     if (error.message.includes('timeout')) {
//       res.status(504).json({ message: 'Database timeout. Please try again.' });
//     } else {
//       res.status(500).json({ message: 'Username check failed. Please try again.' });
//     }
//   }
// });

///////////////////////// SOCIAL INTERACTION ENDPOINTS /////////////////////////

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

///////////////////////// LEGACY ENDPOINTS (for backward compatibility) /////////////////////////

// Legacy endpoint
routeUser.get('/user-profile', authenticateToken, userController.getUserProfile async (req, res) => {
  // Redirect to new endpoint
  console.log('[UserAPI] Legacy endpoint accessed, redirecting to /profile');
  return req.app.handle(req, res);
});

// Legacy endpoint
routeUser.post('/user-profile', authenticateToken, userController.updateUserProfile async (req, res) => {
  // Redirect to new endpoint
  console.log('[UserAPI] Legacy endpoint accessed, redirecting to /profile');
  return req.app.handle(req, res);
});

export default routeUser;

///////////////////////// END COMPLETE USER PROFILE ROUTES /////////////////////////