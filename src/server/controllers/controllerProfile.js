///////////////////////// START COMPLETE USER SETTINGS CONTROLLER /////////////////////////
// src/server/controllers/controllerProfile.js - Complete user settings controller with MongoDB operations

import { UserModel } from '../data/mongodb/mongodb.js';
import fs from 'fs';
import path from 'path';

console.log('[controllerProfile.js line 7] Loading settings controller');

///////////////////////// START GET USER SETTINGS /////////////////////////
// Get all user settings
export const getUserSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        console.log(`[controllerProfile.js line 14] Getting settings for: ${userEmail}`);
        
        const user = await UserModel.findOne({ email: userEmail })
            .select('-password -refreshTokens -verificationToken -resetPasswordToken')
            .maxTimeMS(10000);
        
        if (!user) {
            console.log('[controllerProfile.js line 21] User not found');
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
        
        console.log('[controllerProfile.js line 67] Settings retrieved successfully for:', userEmail);
        res.json(userSettings);
        
    } catch (error) {
        console.error('[controllerProfile.js line 71] Error getting user settings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error retrieving settings' 
        });
    }
};
///////////////////////// END GET USER SETTINGS /////////////////////////

///////////////////////// START UPDATE PERSONAL SETTINGS /////////////////////////
// Update personal information settings
export const updatePersonalSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 85] Updating personal settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 86] Personal updates:', Object.keys(updates));
        
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
        
        console.log('[controllerProfile.js line 99] Filtered personal updates:', filteredUpdates);
        
        // Update the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 109] User not found for personal update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 116] Personal settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Personal information updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 125] Error updating personal settings:', error);
        
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
};
///////////////////////// END UPDATE PERSONAL SETTINGS /////////////////////////

///////////////////////// START UPDATE PROFESSIONAL SETTINGS /////////////////////////
// Update professional information settings
export const updateProfessionalSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 147] Updating professional settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 148] Professional updates:', Object.keys(updates));
        
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
        
        console.log('[controllerProfile.js line 161] Filtered professional updates:', filteredUpdates);
        
        // Update the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 171] User not found for professional update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 178] Professional settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Professional information updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 187] Error updating professional settings:', error);
        
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
};
///////////////////////// END UPDATE PROFESSIONAL SETTINGS /////////////////////////

///////////////////////// START UPDATE CONTACT SETTINGS /////////////////////////
// Update contact information settings
export const updateContactSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 209] Updating contact settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 210] Contact updates:', Object.keys(updates));
        
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
        
        console.log('[controllerProfile.js line 223] Filtered contact updates:', filteredUpdates);
        
        // Update the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 233] User not found for contact update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 240] Contact settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Contact information updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 249] Error updating contact settings:', error);
        
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
};
///////////////////////// END UPDATE CONTACT SETTINGS /////////////////////////

///////////////////////// START UPDATE ACCOUNT SETTINGS /////////////////////////
// Update account settings
export const updateAccountSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 271] Updating account settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 272] Account updates:', Object.keys(updates));
        
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
        
        console.log('[controllerProfile.js line 285] Filtered account updates:', filteredUpdates);
        
        // Special handling for email change
        if (filteredUpdates.email) {
            // Check if email already exists
            const existingUser = await UserModel.findOne({ 
                email: filteredUpdates.email,
                _id: { $ne: req.user.id }
            });
            
            if (existingUser) {
                console.log('[controllerProfile.js line 296] Email already exists');
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
            console.log('[controllerProfile.js line 311] User not found for account update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 318] Account settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Account information updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 327] Error updating account settings:', error);
        
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
};
///////////////////////// END UPDATE ACCOUNT SETTINGS /////////////////////////

///////////////////////// START UPDATE PRIVACY SETTINGS /////////////////////////
// Update privacy settings
export const updatePrivacySettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 349] Updating privacy settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 350] Privacy updates:', updates);
        
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
        
        console.log('[controllerProfile.js line 363] Filtered privacy updates:', filteredUpdates);
        
        // Update the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 373] User not found for privacy update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 380] Privacy settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Privacy settings updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 389] Error updating privacy settings:', error);
        
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
};
///////////////////////// END UPDATE PRIVACY SETTINGS /////////////////////////

///////////////////////// START UPDATE NOTIFICATION SETTINGS /////////////////////////
// Update notification settings
export const updateNotificationSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 411] Updating notification settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 412] Notification updates:', updates);
        
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
        
        console.log('[controllerProfile.js line 425] Filtered notification updates:', filteredUpdates);
        
        // Update the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 435] User not found for notification update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 442] Notification settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 451] Error updating notification settings:', error);
        
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
};
///////////////////////// END UPDATE NOTIFICATION SETTINGS /////////////////////////

///////////////////////// START UPDATE SOCIAL SETTINGS /////////////////////////
// Update social media settings
export const updateSocialSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[controllerProfile.js line 473] Updating social media settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 474] Social media updates:', updates);
        
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
        
        console.log('[controllerProfile.js line 487] Filtered social media updates:', filteredUpdates);
        
        // Update the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 497] User not found for social media update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 504] Social media settings updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Social media links updated successfully',
            updatedFields: Object.keys(filteredUpdates)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 513] Error updating social media settings:', error);
        
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
};
///////////////////////// END UPDATE SOCIAL SETTINGS /////////////////////////

///////////////////////// START DELETE USER ACCOUNT /////////////////////////
// Delete user account completely
export const deleteUserAccount = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const userId = req.user.id;
        
        console.log(`[controllerProfile.js line 535] Attempting to delete account for: ${userEmail}`);
        
        // Delete user from database
        const deletedUser = await UserModel.findOneAndDelete({ email: userEmail });
        
        if (!deletedUser) {
            console.log('[controllerProfile.js line 542] User not found for deletion');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 549] Account deleted successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 557] Error deleting user account:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting account' 
        });
    }
};

// Deactivate user account
export const deactivateUserAccount = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log(`[ControllerProfile controllerProfile.js line 464] Deactivating account for: ${userEmail}`);
    
    // Update user to set isActive to false
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { 
        $set: { 
          isActive: false,
          deactivatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log(`[ControllerProfile controllerProfile.js line 483] Account deactivated successfully for: ${userEmail}`);
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('[ControllerProfile controllerProfile.js line 491] Error deactivating account:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error deactivating account' 
    });
  }
};
///////////////////////// END DELETE USER ACCOUNT /////////////////////////

///////////////////////// START UPLOAD PROFILE PICTURE /////////////////////////
// Upload and update profile picture
export const uploadProfilePicture = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        console.log(`[controllerProfile.js line 571] Uploading profile picture for: ${userEmail}`);
        
        if (!req.file) {
            console.log('[controllerProfile.js line 575] No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const profilePictureUrl = `/uploads/profile/${req.file.filename}`;
        
        // Update user profile picture
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: { profilePicture: profilePictureUrl } },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 592] User not found for profile picture update');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 599] Profile picture updated successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePictureUrl: profilePictureUrl
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 608] Error uploading profile picture:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error uploading profile picture' 
        });
    }
};

// Upload cover picture
export const uploadCoverPicture = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log(`[ControllerProfile controllerProfile.js line 409] Uploading cover picture for: ${userEmail}`);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const coverPictureUrl = `/uploads/profile/${req.file.filename}`;
    
    console.log(`[ControllerProfile controllerProfile.js line 420] Cover picture path: ${coverPictureUrl}`);
    
    // Update user with new cover picture
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { 
        $set: { 
          coverPicture: {
            url: coverPictureUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date()
          }
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log(`[ControllerProfile controllerProfile.js line 442] Cover picture updated successfully for: ${userEmail}`);
    
    res.json({
      success: true,
      message: 'Cover picture uploaded successfully',
      coverPicture: updatedUser.coverPicture,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('[ControllerProfile controllerProfile.js line 452] Error uploading cover picture:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading cover picture' 
    });
  }
};
///////////////////////// END UPLOAD PROFILE PICTURE /////////////////////////

///////////////////////// START EXPORT USER DATA /////////////////////////
// Export user data
export const exportUserData = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        console.log(`[controllerProfile.js line 622] Exporting user data for: ${userEmail}`);
        
        const user = await UserModel.findOne({ email: userEmail })
            .select('-password -refreshTokens -verificationToken -resetPasswordToken')
            .maxTimeMS(10000);
        
        if (!user) {
            console.log('[controllerProfile.js line 631] User not found for data export');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const exportData = {
            exportedAt: new Date().toISOString(),
            userData: user.toObject()
        };
        
        console.log(`[controllerProfile.js line 642] User data exported successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'User data exported successfully',
            data: exportData
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 651] Error exporting user data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error exporting user data' 
        });
    }
};
///////////////////////// END EXPORT USER DATA /////////////////////////

///////////////////////// START IMPORT USER SETTINGS /////////////////////////
// Import user settings
export const importUserSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const importData = req.body;
        
        console.log(`[controllerProfile.js line 665] Importing user settings for: ${userEmail}`);
        console.log('[controllerProfile.js line 666] Import data keys:', Object.keys(importData));
        
        // List of fields that can be imported
        const allowedImportFields = [
            'firstName', 'lastName', 'additionalName', 'birthdate', 'gender',
            'overview', 'headline', 'profession', 'industry', 'company', 'website',
            'phoneNumber', 'country', 'state', 'city', 'postalCode',
            'profilePrivacy', 'profileVisibility', 'notifications', 'socialMedia'
        ];
        
        // Filter out any fields that aren't allowed
        const filteredImports = {};
        Object.keys(importData).forEach(key => {
            if (allowedImportFields.includes(key)) {
                filteredImports[key] = importData[key];
            }
        });
        
        console.log('[controllerProfile.js line 682] Filtered import data:', Object.keys(filteredImports));
        
        // Update the user with imported data
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: filteredImports },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 692] User not found for settings import');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 699] Settings imported successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Settings imported successfully',
            importedFields: Object.keys(filteredImports)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 708] Error importing user settings:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error during import', 
                errors: error.errors 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error importing settings' 
        });
    }
};
///////////////////////// END IMPORT USER SETTINGS /////////////////////////

///////////////////////// START RESET USER SETTINGS /////////////////////////
// Reset user settings to default
export const resetUserSettings = async (req, res) => {
    try {
        const userEmail = req.user.email;
        
        console.log(`[controllerProfile.js line 730] Resetting user settings for: ${userEmail}`);
        
        // Default settings values
        const defaultSettings = {
            profilePrivacy: 'public',
            profileVisibility: {
                activity: 'public',
                posts: 'public',
                places: 'public',
                reviews: 'public'
            },
            notifications: {
                email: true,
                push: true,
                follows: true,
                comments: true,
                likes: true,
                marketing: false
            },
            socialMedia: {},
            headline: '',
            overview: '',
            profession: '',
            industry: '',
            company: '',
            website: ''
        };
        
        console.log('[controllerProfile.js line 754] Applying default settings');
        
        // Update the user with default settings
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: userEmail },
            { $set: defaultSettings },
            { new: true, runValidators: true }
        ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!updatedUser) {
            console.log('[controllerProfile.js line 764] User not found for settings reset');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[controllerProfile.js line 771] Settings reset successfully for: ${userEmail}`);
        
        res.json({
            success: true,
            message: 'Settings reset to default successfully',
            resetFields: Object.keys(defaultSettings)
        });
        
    } catch (error) {
        console.error('[controllerProfile.js line 780] Error resetting user settings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error resetting settings' 
        });
    }
};


// Get user settings history
export const getUserSettingsHistory = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log(`[ControllerProfile controllerProfile.js line 661] Getting settings history for: ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail })
      .select('settingsHistory updatedAt createdAt')
      .maxTimeMS(5000);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return settings history (if available) or basic info
    const settingsHistory = user.settingsHistory || [{
      action: 'Account created',
      timestamp: user.createdAt,
      details: 'Initial account setup'
    }];
    
    if (user.updatedAt && user.updatedAt !== user.createdAt) {
      settingsHistory.push({
        action: 'Profile updated',
        timestamp: user.updatedAt,
        details: 'Profile information modified'
      });
    }
    
    console.log(`[ControllerProfile controllerProfile.js line 686] Settings history retrieved for: ${userEmail}`);
    
    res.json({
      success: true,
      settingsHistory: settingsHistory
    });
    
  } catch (error) {
    console.error('[ControllerProfile controllerProfile.js line 694] Error getting settings history:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error getting settings history' 
    });
  }
};
///////////////////////// END RESET USER SETTINGS /////////////////////////

///////////////////////// START USER PASSWORD /////////////////////////

// Reset user password
export const resetUserPassword = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { newPassword } = req.body;
    
    console.log(`[ControllerProfile controllerProfile.js line 536] Resetting password for: ${userEmail}`);
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log(`[ControllerProfile controllerProfile.js line 549] Password hashed for: ${userEmail}`);
    
    // Update user with new password
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { 
        $set: { 
          password: hashedPassword,
          passwordResetAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log(`[ControllerProfile controllerProfile.js line 568] Password reset successfully for: ${userEmail}`);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('[ControllerProfile controllerProfile.js line 576] Error resetting password:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password' 
    });
  }
};

// Change user password
export const changeUserPassword = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { currentPassword, newPassword } = req.body;
    
    console.log(`[ControllerProfile controllerProfile.js line 589] Changing password for: ${userEmail}`);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Get user with password for verification
    const user = await UserModel.findOne({ email: userEmail }).select('+password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    console.log(`[ControllerProfile controllerProfile.js line 616] Current password verified for: ${userEmail}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log(`[ControllerProfile controllerProfile.js line 622] New password hashed for: ${userEmail}`);
    
    // Update user with new password
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      { 
        $set: { 
          password: hashedPassword,
          passwordChangedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -verificationToken -resetPasswordToken');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log(`[ControllerProfile controllerProfile.js line 641] Password changed successfully for: ${userEmail}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('[ControllerProfile controllerProfile.js line 649] Error changing password:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error changing password' 
    });
  }
};

///////////////////////// END USER PASSWORD /////////////////////////




// Export all functions as default object for compatibility
export default {
    getUserSettings,
    updatePersonalSettings,
    updateProfessionalSettings,
    updateContactSettings,
    updateAccountSettings,
    updatePrivacySettings,
    updateNotificationSettings,
    updateSocialSettings,
    deleteUserAccount,
    deactivateUserAccount,
    uploadProfilePicture,
    uploadCoverPicture,
    exportUserData,
    importUserSettings,
    resetUserSettings,
    resetUserPassword,
    changeUserPassword,
    getUserSettingsHistory
};

///////////////////////// END COMPLETE USER SETTINGS CONTROLLER /////////////////////////