///////////////////////// START COMPLETE USER SETTING ROUTES /////////////////////////
// src/server/route/routeSetting.js - Complete user settings routing system with MongoDB storage

import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import { UserModel, StoreModel, BlogModel } from '../../data/mongodb/mongodb.js';
import * as userController from '../../controllers/controllerUser.js';

const routeSetting = express.Router();

console.log('[SettingAPI routeSetting.js line 12] Loading user setting routes');

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
    console.log('[routeSetting.js line 42] No token provided');
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.log('[routeSetting.js line 48] Token verification failed:', err.message);
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  
    try {
      // Get full user data
      const userData = await UserModel.findOne({ email: decoded.email })
        .select('_id email username firstName lastName')
        .maxTimeMS(5000);

      if (!userData) {
        console.log('[routeSetting.js line 58] User not found for token');
        return res.status(403).json({ success: false, error: 'User not found' });
      }

      req.user = {
        id: userData._id.toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      console.log('[routeSetting.js line 69] Token verified for user:', req.user.username);
      
      next();
    } catch (error) {
      console.error('[routeSetting.js line 73] Error fetching user data:', error);
      return res.status(500).json({ success: false, error: 'Authentication failed' });
    }
  });
};

///////////////////////// START SETTINGS ENDPOINTS /////////////////////////

// 1. GET USER SETTINGS - Retrieve all user settings
routeSetting.get('/settings', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 82] GET /settings endpoint called');
  try {
    const userEmail = req.user.email;
    console.log(`[routeSetting.js line 85] Getting settings for: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
        .select('-password -refreshTokens -verificationToken -resetPasswordToken')
        .maxTimeMS(10000);
    
    if (!user) {
        console.log('[routeSetting.js line 92] User not found');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    // Compile all user settings into a comprehensive response
    const userSettings = {
        success: true,
        // Personal Information
        firstName: user.firstName,
        lastName: user.lastName,
        additionalName: user.additionalName,
        birthdate: user.birthdate,
        gender: user.gender,
        overview: user.overview,
        headline: user.headline,
        
        // Professional Information  
        profession: user.profession,
        industry: user.industry,
        company: user.company,
        website: user.website,
        
        // Contact Information
        phoneNumber: user.phoneNumber,
        country: user.country,
        state: user.state,
        city: user.city,
        postalCode: user.postalCode,
        
        // Account Information
        username: user.username,
        email: user.email,
        
        // Privacy Settings
        profilePrivacy: user.profilePrivacy,
        profileVisibility: user.profileVisibility,
        
        // Notification Settings
        notifications: user.notifications,
        
        // Social Media
        socialMedia: user.socialMedia,
        
        // Profile Media
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        
        // Metadata
        joinedDate: user.createdAt,
        lastActive: user.lastLogin,
        isActive: user.isActive
    };
    
    console.log('[routeSetting.js line 140] Settings retrieved successfully for:', userEmail);
    res.json(userSettings);
    
  } catch (error) {
    console.error('[routeSetting.js line 144] Error getting user settings:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Server error retrieving settings' 
    });
  }
});

// 2. POST PERSONAL SETTINGS - Update personal information
routeSetting.post('/settings/personal', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 154] POST /settings/personal endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 159] Updating personal settings for: ${userEmail}`);
    console.log('[routeSetting.js line 160] Personal updates:', Object.keys(updates));
    
    // List of allowed personal information fields
    const allowedPersonalFields = [
        'firstName', 'lastName', 'additionalName', 'birthdate', 
        'gender', 'overview', 'headline'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedPersonalFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 175] Filtered personal updates:', filteredUpdates);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 185] User not found for personal update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 192] Personal settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Personal information updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 201] Error updating personal settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating personal information' 
    });
  }
});

// 3. POST PROFESSIONAL SETTINGS - Update professional information  
routeSetting.post('/settings/professional', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 219] POST /settings/professional endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 224] Updating professional settings for: ${userEmail}`);
    console.log('[routeSetting.js line 225] Professional updates:', Object.keys(updates));
    
    // List of allowed professional information fields
    const allowedProfessionalFields = [
        'profession', 'industry', 'company', 'website'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedProfessionalFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 239] Filtered professional updates:', filteredUpdates);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 249] User not found for professional update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 256] Professional settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Professional information updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 265] Error updating professional settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating professional information' 
    });
  }
});

// 4. POST CONTACT SETTINGS - Update contact information
routeSetting.post('/settings/contact', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 281] POST /settings/contact endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 286] Updating contact settings for: ${userEmail}`);
    console.log('[routeSetting.js line 287] Contact updates:', Object.keys(updates));
    
    // List of allowed contact information fields
    const allowedContactFields = [
        'phoneNumber', 'country', 'state', 'city', 'postalCode'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedContactFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 301] Filtered contact updates:', filteredUpdates);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 311] User not found for contact update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 318] Contact settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Contact information updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 327] Error updating contact settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating contact information' 
    });
  }
});

// 5. POST ACCOUNT SETTINGS - Update account information
routeSetting.post('/settings/account', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 343] POST /settings/account endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 348] Updating account settings for: ${userEmail}`);
    console.log('[routeSetting.js line 349] Account updates:', Object.keys(updates));
    
    // List of allowed account fields (username is not changeable)
    const allowedAccountFields = [
        'email'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedAccountFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 363] Filtered account updates:', filteredUpdates);
    
    // Special handling for email change
    if (filteredUpdates.email) {
        // Check if email already exists
        const existingUser = await UserModel.findOne({ 
            email: filteredUpdates.email,
            _id: { $ne: req.user.id }
        });
        
        if (existingUser) {
            console.log('[routeSetting.js line 374] Email already exists');
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
    }
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 389] User not found for account update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 396] Account settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Account information updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 405] Error updating account settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating account information' 
    });
  }
});

// 6. POST PRIVACY SETTINGS - Update privacy settings
routeSetting.post('/settings/privacy', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 421] POST /settings/privacy endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 426] Updating privacy settings for: ${userEmail}`);
    console.log('[routeSetting.js line 427] Privacy updates:', updates);
    
    // List of allowed privacy fields
    const allowedPrivacyFields = [
        'profilePrivacy', 'profileVisibility'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedPrivacyFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 441] Filtered privacy updates:', filteredUpdates);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 451] User not found for privacy update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 458] Privacy settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Privacy settings updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 467] Error updating privacy settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating privacy settings' 
    });
  }
});

// 7. POST NOTIFICATION SETTINGS - Update notification preferences
routeSetting.post('/settings/notifications', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 483] POST /settings/notifications endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 488] Updating notification settings for: ${userEmail}`);
    console.log('[routeSetting.js line 489] Notification updates:', updates);
    
    // List of allowed notification fields
    const allowedNotificationFields = [
        'notifications'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedNotificationFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 503] Filtered notification updates:', filteredUpdates);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 513] User not found for notification update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 520] Notification settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Notification settings updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 529] Error updating notification settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating notification settings' 
    });
  }
});

// 8. POST SOCIAL MEDIA SETTINGS - Update social media links
routeSetting.post('/settings/social', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 545] POST /settings/social endpoint called');
  try {
    const userEmail = req.user.email;
    const updates = req.body;
    
    console.log(`[routeSetting.js line 550] Updating social media settings for: ${userEmail}`);
    console.log('[routeSetting.js line 551] Social media updates:', updates);
    
    // List of allowed social media fields
    const allowedSocialFields = [
        'socialMedia'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
        if (allowedSocialFields.includes(key)) {
            filteredUpdates[key] = updates[key];
        }
    });
    
    console.log('[routeSetting.js line 565] Filtered social media updates:', filteredUpdates);
    
    // Update the user
    const updatedUser = await UserModel.findOneAndUpdate(
        { email: userEmail },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
        console.log('[routeSetting.js line 575] User not found for social media update');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 582] Social media settings updated successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Social media links updated successfully',
        updatedFields: Object.keys(filteredUpdates)
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 591] Error updating social media settings:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Error updating social media settings' 
    });
  }
});

// 9. DELETE ACCOUNT - Delete user account completely
routeSetting.delete('/settings/delete-account', authenticateToken, async (req, res) => {
  console.log('[routeSetting.js line 607] DELETE /settings/delete-account endpoint called');
  try {
    const userEmail = req.user.email;
    const userId = req.user.id;
    
    console.log(`[routeSetting.js line 612] Attempting to delete account for: ${userEmail}`);
    
    // Delete user from database
    const deletedUser = await UserModel.findOneAndDelete({ email: userEmail });
    
    if (!deletedUser) {
        console.log('[routeSetting.js line 619] User not found for deletion');
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
    
    console.log(`[routeSetting.js line 626] Account deleted successfully for: ${userEmail}`);
    
    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 634] Error deleting user account:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Error deleting account' 
    });
  }
});

///////////////////////// START SETTINGS DIAGNOSTIC ENDPOINTS /////////////////////////

// Debug endpoint to check settings status
routeSetting.get('/settings/debug', authenticateToken, async (req, res) => {
  try {
    console.log('[routeSetting.js line 865] Settings debug endpoint called');
    
    const user = await UserModel.findById(req.user.id)
      .select('email username firstName lastName profilePrivacy profileVisibility notifications socialMedia')
      .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const debugInfo = {
      success: true,
      userId: user._id,
      email: user.email,
      username: user.username,
      settingsStatus: {
        profilePrivacy: user.profilePrivacy || 'Not set',
        profileVisibility: user.profileVisibility || 'Not set',
        notifications: user.notifications || 'Not set',
        socialMedia: user.socialMedia || 'Not set'
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('[routeSetting.js line 888] Debug info generated:', debugInfo);
    res.json(debugInfo);
    
  } catch (error) {
    console.error('[routeSetting.js line 892] Settings debug error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test endpoint to verify settings functionality
routeSetting.post('/settings/test', authenticateToken, async (req, res) => {
  try {
    console.log('[routeSetting.js line 903] Settings test endpoint called');
    
    const testData = req.body;
    console.log('[routeSetting.js line 906] Test data received:', testData);
    
    // Test MongoDB connection and user lookup
    const user = await UserModel.findById(req.user.id).maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found during test' 
      });
    }
    
    res.json({
      success: true,
      message: 'Settings system working correctly',
      testData: testData,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[routeSetting.js line 929] Settings test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

///////////////////////// END SETTINGS DIAGNOSTIC ENDPOINTS /////////////////////////

///////////////////////// START LEGACY ENDPOINTS (for backward compatibility) /////////////////////////

// Legacy endpoint
routeSetting.get('/user-setting', authenticateToken, async (req, res) => {
  // Redirect to new endpoint
  console.log('[routeSetting.js line 942] Legacy endpoint accessed, redirecting to /settings');
  return res.redirect('/api/settings');
});

// Legacy endpoint
routeSetting.post('/user-setting', authenticateToken, async (req, res) => {
  // Redirect to new endpoint
  console.log('[routeSetting.js line 948] Legacy endpoint accessed, redirecting to /settings');
  return res.redirect('/api/settings');
});

///////////////////////// END LEGACY ENDPOINTS /////////////////////////

export default routeSetting;

///////////////////////// END COMPLETE USER SETTING ROUTES /////////////////////////