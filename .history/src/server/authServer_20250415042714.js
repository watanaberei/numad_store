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

// Get user's check-in status
app.get('/api/store/checkin/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log(`[authServer] Getting check-in status for user ${userEmail}`);
    
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.log(`[authServer] User not found: ${userEmail}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const checkedInStore = user.checkedInStore || null;
    console.log(`[authServer] User ${userEmail} is checked in to: ${checkedInStore}`);
    
    res.json({
      success: true,
      checkedInStore: checkedInStore,
      checkedIn: !!checkedInStore
    });
  } catch (error) {
    console.error('[authServer] Error fetching check-in status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});
// app.get('/api/store/checkin/status', authenticateToken, async (req, res) => {
//   try {
//     const user = await UserModel.findOne({ email: req.user.email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     res.json({
//       success: true,
//       checkedInStore: user.checkedInStore
//     });
//   } catch (error) {
//     console.error('Error fetching check-in status:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });


// Get user's impressions for a specific store
app.get('/api/user/impressions/:storeId', authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userEmail = req.user.email;
    
    console.log(`[authServer] Getting impressions for store ${storeId} by user ${userEmail}`);
    
    // Find the user
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Find the store
    const store = await StoreModel.findOne({ slug: storeId });
    
    // Prepare the response
    const response = {
      success: true,
      storeId,
      hasLiked: user.likedStores?.includes(storeId) || false,
      hasDisliked: user.dislikedStores?.includes(storeId) || false,
      isCheckedIn: user.checkedInStore === storeId,
      sections: {}
    };
    
    // If store exists, add section-specific impressions
    if (store) {
      // Add overall counts
      response.likes = store.interactions?.likes || 0;
      response.dislikes = store.interactions?.dislikes || 0;
      
      // Add section-specific data
      const sections = ['overview', 'experience', 'service', 'business', 'location'];
      
      sections.forEach(section => {
        if (store[section]) {
          response.sections[section] = {
            likes: store[section].likes || 0,
            dislikes: store[section].dislikes || 0,
            userLiked: store[section].likedBy?.includes(userEmail) || false,
            userDisliked: store[section].dislikedBy?.includes(userEmail) || false
          };
        }
      });
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user impressions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
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


// Add or update this endpoint in authServer.js
// app.post('/api/impression', authenticateToken, async (req, res) => {
//   console.log('Received impression request:', req.body);
//   const { storeId, action } = req.body;
//   const userEmail = req.user.email;

//   console.log('User email:', userEmail);
//   console.log('Store ID:', storeId);
//   console.log('Action:', action);

//   try {
//     // First, check if user is checked in to this store
//     const user = await UserModel.findOne({ email: userEmail });
//     if (!user) {
//       console.log('User not found:', userEmail);
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     console.log('User found:', user);
    
//     // Check if the user is checked in to this store
//     if (user.checkedInStore !== storeId) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'You must be checked in to this store to leave an impression' 
//       });
//     }

//     // Find or create the store
//     let store = await StoreModel.findOne({ slug: storeId });
//     if (!store) {
//       // Create a minimal store document without required fields
//       // We'll use the strict: false option in the schema to allow this
//       store = new StoreModel({ 
//         slug: storeId,
//         interactions: {
//           likes: 0,
//           dislikes: 0
//         }
//       });
//     }

//     // Initialize interactions if not present
//     if (!store.interactions) {
//       store.interactions = {
//         likes: 0,
//         dislikes: 0,
//         likedBy: [],
//         dislikedBy: []
//       };
//     }

//     // Get current likes and dislikes counts
//     let likes = store.interactions.likes || 0;
//     let dislikes = store.interactions.dislikes || 0;

//     // Initialize arrays if they don't exist
//     if (!Array.isArray(user.likedStores)) user.likedStores = [];
//     if (!Array.isArray(user.dislikedStores)) user.dislikedStores = [];

//     // Handle different impression types
//     switch (action) {
//       case 'like':
//         // Check if already liked
//         if (!user.likedStores.includes(storeId)) {
//           // Remove from dislikes if needed
//           if (user.dislikedStores.includes(storeId)) {
//             user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
//             dislikes = Math.max(0, dislikes - 1);
//           }
          
//           // Add to likes
//           user.likedStores.push(storeId);
//           likes += 1;
//         } else {
//           // Unlike (toggle)
//           user.likedStores = user.likedStores.filter(id => id !== storeId);
//           likes = Math.max(0, likes - 1);
//         }
//         break;
        
//       case 'dislike':
//         // Check if already disliked
//         if (!user.dislikedStores.includes(storeId)) {
//           // Remove from likes if needed
//           if (user.likedStores.includes(storeId)) {
//             user.likedStores = user.likedStores.filter(id => id !== storeId);
//             likes = Math.max(0, likes - 1);
//           }
          
//           // Add to dislikes
//           user.dislikedStores.push(storeId);
//           dislikes += 1;
//         } else {
//           // Undislike (toggle)
//           user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
//           dislikes = Math.max(0, dislikes - 1);
//         }
//         break;
        
//       default:
//         return res.status(400).json({ success: false, message: 'Invalid action' });
//     }

//     // Update store interactions
//     store.interactions.likes = likes;
//     store.interactions.dislikes = dislikes;
    
//     // Save changes
//     await user.save();
//     await store.save();

//     console.log('Updated impression counts:', { likes, dislikes });

//     // Broadcast update via socket.io
//     io.emit('impression_update', { 
//       storeId, 
//       likes, 
//       dislikes,
//       userLiked: user.likedStores.includes(storeId),
//       userDisliked: user.dislikedStores.includes(storeId)
//     });

//     // Send response
//     res.status(200).json({ 
//       success: true, 
//       message: 'Impression updated successfully', 
//       likes, 
//       dislikes,
//       userLiked: user.likedStores.includes(storeId),
//       userDisliked: user.dislikedStores.includes(storeId)
//     });
//   } catch (error) {
//     console.error('Error updating impression:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error updating impression', 
//       error: error.message 
//     });
//   }
// });


// Updated impression endpoint
app.post('/api/impression', authenticateToken, async (req, res) => {
  console.log('Received impression request:', req.body);
  const { storeId, action, section = 'overview' } = req.body;
  const userEmail = req.user.email;

  console.log('User email:', userEmail);
  console.log('Store ID:', storeId);
  console.log('Action:', action);
  console.log('Section:', section);

  try {
    // Find the user
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.log('User not found:', userEmail);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found:', user);
    console.log('User checked in store:', user.checkedInStore);
    
    // Check if the user is checked in to this store
    if (!user.checkedInStore || user.checkedInStore !== storeId) {
      console.log('User not checked in to this store. Checked in to:', user.checkedInStore);
      return res.status(403).json({ 
        success: false, 
        message: 'You must be checked in to this store to leave an impression' 
      });
    }

    // Find or create the store record
    let store = await StoreModel.findOne({ slug: storeId });
    if (!store) {
      console.log('Store not found, creating minimal record');
      
      store = new StoreModel({ 
        slug: storeId,
        name: storeId, // Required field
        location: {
          city: 'Unknown',
          designator: 'None',
          zip: '00000',
          state: 'CA',
          streetName: 'Unknown',
          streetNumber: '0',
          address: 'Unknown'
        },
        interactions: {
          likes: 0,
          dislikes: 0
        }
      });
      
      try {
        await store.save();
        console.log('Created minimal store record');
      } catch (storeError) {
        console.error('Error creating store:', storeError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create store record', 
          error: storeError.message 
        });
      }
    }

    // Ensure interactions object exists
    if (!store.interactions) {
      store.interactions = { likes: 0, dislikes: 0 };
    }

    // Ensure section-specific impressions exist
    if (!store[section]) {
      store[section] = { likes: 0, dislikes: 0, likedBy: [], dislikedBy: [] };
    }
    
    if (!store[section].likes) store[section].likes = 0;
    if (!store[section].dislikes) store[section].dislikes = 0;
    if (!Array.isArray(store[section].likedBy)) store[section].likedBy = [];
    if (!Array.isArray(store[section].dislikedBy)) store[section].dislikedBy = [];

    // Initialize user arrays if needed
    if (!Array.isArray(user.likedStores)) user.likedStores = [];
    if (!Array.isArray(user.dislikedStores)) user.dislikedStores = [];
    
    // Get current likes and dislikes counts
    let sectionLikes = store[section].likes || 0;
    let sectionDislikes = store[section].dislikes || 0;
    
    // Overall store interactions
    let totalLikes = store.interactions.likes || 0;
    let totalDislikes = store.interactions.dislikes || 0;

    // Handle the impression action
    switch (action) {
      case 'like':
        // Check if already liked this section
        const alreadyLiked = store[section].likedBy.includes(userEmail);
        const alreadyDisliked = store[section].dislikedBy.includes(userEmail);
        
        if (!alreadyLiked) {
          // Add like to this section
          store[section].likedBy.push(userEmail);
          sectionLikes++;
          
          // Remove dislike if needed
          if (alreadyDisliked) {
            store[section].dislikedBy = store[section].dislikedBy.filter(email => email !== userEmail);
            sectionDislikes = Math.max(0, sectionDislikes - 1);
          }
          
          // Update total counters
          totalLikes++;
          if (alreadyDisliked) {
            totalDislikes = Math.max(0, totalDislikes - 1);
          }
          
          // Update user record
          if (!user.likedStores.includes(storeId)) {
            user.likedStores.push(storeId);
          }
          user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
        } else {
          // Toggle like off
          store[section].likedBy = store[section].likedBy.filter(email => email !== userEmail);
          sectionLikes = Math.max(0, sectionLikes - 1);
          totalLikes = Math.max(0, totalLikes - 1);
          
          // Remove from user's liked stores
          user.likedStores = user.likedStores.filter(id => id !== storeId);
        }
        break;
        
      case 'dislike':
        // Check if already disliked this section
        const dislikeExists = store[section].dislikedBy.includes(userEmail);
        const likeExists = store[section].likedBy.includes(userEmail);
        
        if (!dislikeExists) {
          // Add dislike to this section
          store[section].dislikedBy.push(userEmail);
          sectionDislikes++;
          
          // Remove like if needed
          if (likeExists) {
            store[section].likedBy = store[section].likedBy.filter(email => email !== userEmail);
            sectionLikes = Math.max(0, sectionLikes - 1);
          }
          
          // Update total counters
          totalDislikes++;
          if (likeExists) {
            totalLikes = Math.max(0, totalLikes - 1);
          }
          
          // Update user record
          if (!user.dislikedStores.includes(storeId)) {
            user.dislikedStores.push(storeId);
          }
          user.likedStores = user.likedStores.filter(id => id !== storeId);
        } else {
          // Toggle dislike off
          store[section].dislikedBy = store[section].dislikedBy.filter(email => email !== userEmail);
          sectionDislikes = Math.max(0, sectionDislikes - 1);
          totalDislikes = Math.max(0, totalDislikes - 1);
          
          // Remove from user's disliked stores
          user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
        }
        break;
        
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Update store counts
    store[section].likes = sectionLikes;
    store[section].dislikes = sectionDislikes;
    store.interactions.likes = totalLikes;
    store.interactions.dislikes = totalDislikes;
    
    // Save changes
    await Promise.all([
      user.save(),
      store.save()
    ]);

    console.log('Updated impression counts:', { 
      section, 
      sectionLikes, 
      sectionDislikes,
      totalLikes,
      totalDislikes
    });

    // Broadcast update via socket.io
    if (io) {
      io.emit('impression_update', { 
        storeId, 
        section,
        likes: sectionLikes, 
        dislikes: sectionDislikes,
        totalLikes,
        totalDislikes,
        userLiked: store[section].likedBy.includes(userEmail),
        userDisliked: store[section].dislikedBy.includes(userEmail)
      });
    }

    // Send response
    res.status(200).json({ 
      success: true, 
      message: 'Impression updated successfully', 
      section,
      likes: sectionLikes, 
      dislikes: sectionDislikes,
      totalLikes,
      totalDislikes,
      userLiked: store[section].likedBy.includes(userEmail),
      userDisliked: store[section].dislikedBy.includes(userEmail)
    });
  } catch (error) {
    console.error('Error updating impression:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating impression', 
      error: error.message 
    });
  }
});


// app.post('/api/impression', authenticateToken, async (req, res) => {
//   const { storeId, action } = req.body;
//   const userEmail = req.user.email;

//   console.log(`[authServer] Impression request: ${action} for store ${storeId} by user ${userEmail}`);

//   try {
//     // First check if user is checked into this store
//     const user = await UserModel.findOne({ email: userEmail });
//     if (!user) {
//       console.log(`[authServer] User not found: ${userEmail}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     // Check if user is checked in to this store
//     if (user.checkedInStore !== storeId) {
//       console.log(`[authServer] User not checked in to this store. Current check-in: ${user.checkedInStore}`);
//       return res.status(403).json({ 
//         success: false, 
//         message: 'You must be checked in to this store to leave an impression' 
//       });
//     }

//     // Find or create store document
//     let store = await StoreModel.findOne({ slug: storeId });
//     if (!store) {
//       // Create minimal store record just for impressions
//       store = new StoreModel({ 
//         slug: storeId,
//         title: storeId.split('_').pop().replace(/-/g, ' '),
//         interactions: {
//           likes: 0,
//           dislikes: 0
//         }
//       });
//     }

//     // Initialize likes/dislikes if not present
//     if (!store.interactions) {
//       store.interactions = { likes: 0, dislikes: 0 };
//     }

//     // Handle impression
//     let likes = store.interactions.likes || 0;
//     let dislikes = store.interactions.dislikes || 0;

//     // Update user's liked/disliked stores
//     if (!user.likedStores) user.likedStores = [];
//     if (!user.dislikedStores) user.dislikedStores = [];

//     if (action === 'like') {
//       // Check if already liked
//       const alreadyLiked = user.likedStores.includes(storeId);
      
//       // Remove from dislikes if previously disliked
//       if (user.dislikedStores.includes(storeId)) {
//         user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
//         dislikes = Math.max(0, dislikes - 1);
//       }
      
//       // Toggle like status
//       if (alreadyLiked) {
//         // Unlike
//         user.likedStores = user.likedStores.filter(id => id !== storeId);
//         likes = Math.max(0, likes - 1);
//       } else {
//         // Like
//         user.likedStores.push(storeId);
//         likes++;
//       }
//     } else if (action === 'dislike') {
//       // Check if already disliked
//       const alreadyDisliked = user.dislikedStores.includes(storeId);
      
//       // Remove from likes if previously liked
//       if (user.likedStores.includes(storeId)) {
//         user.likedStores = user.likedStores.filter(id => id !== storeId);
//         likes = Math.max(0, likes - 1);
//       }
      
//       // Toggle dislike status
//       if (alreadyDisliked) {
//         // Remove dislike
//         user.dislikedStores = user.dislikedStores.filter(id => id !== storeId);
//         dislikes = Math.max(0, dislikes - 1);
//       } else {
//         // Add dislike
//         user.dislikedStores.push(storeId);
//         dislikes++;
//       }
//     } else {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Invalid action' 
//       });
//     }

//     // Update store's impression counts
//     store.interactions.likes = likes;
//     store.interactions.dislikes = dislikes;

//     // Save changes
//     await user.save();
//     await store.save();

//     // Broadcast update via Socket.io
//     io.emit('impression_update', { 
//       storeId, 
//       likes,
//       dislikes,
//       userLiked: user.likedStores.includes(storeId),
//       userDisliked: user.dislikedStores.includes(storeId)
//     });

//     console.log(`[authServer] Impression updated: Store ${storeId} now has ${likes} likes and ${dislikes} dislikes`);

//     // Send response with updated counts
//     res.status(200).json({
//       success: true,
//       message: 'Impression recorded successfully',
//       likes,
//       dislikes,
//       userLiked: user.likedStores.includes(storeId),
//       userDisliked: user.dislikedStores.includes(storeId)
//     });

//   } catch (error) {
//     console.error(`[authServer] Impression error:`, error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error recording impression',
//       error: error.message
//     });
//   }
// });



// app.post('/api/impression', authenticateToken, async (req, res) => {
//   console.log('Received impression request:', req.body);
//   const { storeId, action } = req.body;
//   const userEmail = req.user.email;

//   console.log('User email:', userEmail);
//   console.log('Store ID:', storeId);
//   console.log('Action:', action);

//   try {
//     let user = await User.findOne({ email: userEmail });
//     if (!user) {
//       console.log('User not found:', userEmail);
//       return res.status(404).json({ message: 'User not found' });
//     }

//     console.log('User found:', user);

//     let store = await Store.findOne({ storeId });
//     if (!store) {
//       console.log('Store not found, creating new store:', storeId);
//       store = new Store({ storeId, likes: 0, dislikes: 0 });
//     }

//     console.log('Store before update:', store);

//     const impressionUpdate = handleImpression(user, store, action, storeId);
    
//     console.log('User before update:', user);
//     console.log('Store before update:', store);

//     // Update user document
//     user = await User.findOneAndUpdate(
//       { email: userEmail },
//       { $set: { likedStores: user.likedStores, dislikedStores: user.dislikedStores } },
//       { new: true }
//     );

//     // Update store document
//     store = await Store.findOneAndUpdate(
//       { storeId: storeId },
//       { $set: { likes: store.likes, dislikes: store.dislikes } },
//       { new: true, upsert: true }
//     );

//     console.log('Impression update successful');
//     console.log('Updated user:', user);
//     console.log('Updated store:', store);

//     io.emit('impression_update', { storeId, ...impressionUpdate });

//     res.status(200).json({ message: 'Impression added successfully', ...impressionUpdate });
//   } catch (error) {
//     console.error('Error adding impression:', error);
//     res.status(500).json({ message: 'Error adding impression', error: error.message });
//   }
// });




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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Access token is not valid' });
    }
    req.user = user;
    next();
  });
}


const authPort = process.env.AUTHPORT || 4000;
httpServer.listen(authPort, () => console.log(`authServer running on port ${authPort}`));