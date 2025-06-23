// src/server/controllers/controllerUser.js
// Fixed to use ES6 exports and proper async/await

import { UserModel } from '../data/mongodb/mongodb.js';

// Get user profile handler
export const getUserProfile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        console.log(`[UserController] Getting profile for: ${userEmail}`);
        
        const user = await UserModel.findOne({ email: userEmail })
            .select('-password -refreshTokens -verificationToken -resetPasswordToken');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('[UserController] Error getting profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update user profile handler
export const updateUserProfile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const updates = req.body;
        
        console.log(`[UserController] Updating profile for: ${userEmail}`);
        
        // List of fields that can be updated
        const allowedUpdates = [
            'firstName', 'lastName', 'additionalName', 'overview', 'headline',
            'profession', 'industry', 'company', 'location', 'city', 'country',
            'state', 'postalCode', 'website', 'phoneNumber', 'birthdate', 'gender',
            'socialMedia', 'profilePrivacy', 'profileVisibility'
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
        
        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        console.log(`[UserController] Profile updated successfully`);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error('[UserController] Error updating profile:', error);
        
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
};

// Legacy signup handlers (if still needed)
export const signup_get = (req, res) => {
    console.log("signup get");
    res.render('SignupScreen');
};

export const signup_post = async (req, res) => {
    console.log("signup post");
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birthdate: req.body.birthdate
        };
        
        // Note: This should use proper hashing and validation
        const newUser = new UserModel(data);
        await newUser.save();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('[UserController] Signup error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// Legacy login handlers (if still needed)
export const login_get = (req, res) => {
    console.log("login get");
    res.render('LoginScreen');
};

export const login_post = async (req, res) => {
    console.log("login post");
    try {
        const { email, password } = req.body;
        
        // Note: This should use proper password hashing comparison
        const user = await UserModel.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Here you would typically:
        // 1. Compare hashed passwords
        // 2. Generate JWT token
        // 3. Return token to client
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });
        
    } catch (error) {
        console.error('[UserController] Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Export all functions as default object for compatibility
export default {
    getUserProfile,
    updateUserProfile,
    signup_get,
    signup_post,
    login_get,
    login_post
};

///////////////////////// END FIXED USER CONTROLLER /////////////////////////