import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { User, Store } from "../../models/storeModel.js";
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









app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
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
    const user = await User.findOne({ email });
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
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid password' });
//     }
//     const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET);
//     refreshTokens.push(refreshToken);
//     res.json({ accessToken, refreshToken });
//   } catch (error) {
//     res.status(500).json({ message: 'Error logging in' });
//   }
// });

app.post('/settings', authenticateToken, async (req, res) => {
  const { firstName, lastName, birthdate } = req.body;
  const userEmail = req.user.email;

  try {
    const user = await User.findOne({ email: userEmail });
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
    const user = await User.findOne({ email: req.user.email });
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



// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET);
//     refreshTokens.push(refreshToken);
//     res.json({ accessToken, refreshToken });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

app.get('/api/user/checkedIn', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.checkedInStores);
  } catch (error) {
    console.error('Error fetching checked-in stores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      totalLikes: user.likedStores.length,
      totalDislikes: user.dislikedStores.length,
      // Add other user data as needed
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});






app.post('/api/impression', authenticateToken, async (req, res) => {
  const { storeId, action } = req.body;
  const userEmail = req.user.email;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let store = await Store.findOne({ storeId });
    if (!store) {
      // Fetch store data from Contentful
      const storeData = await getStore(1, 1, 0);  // Assuming getStore returns an array
      if (storeData && storeData.length > 0) {
        store = new Store({
          storeId,
          ...storeData[0]  // Spread the store data from Contentful
        });
      } else {
        return res.status(404).json({ message: 'Store not found in Contentful' });
      }
    }

    // Check if the user has already checked in to this store
    let checkedInStore = user.checkedInStores.find(s => s.storeId === storeId);
    
    if (!checkedInStore) {
      // If not checked in, add to checked-in stores
      user.checkedInStores.push({ 
        storeId, 
        impression: action,
        ...store.toObject()  // Include all store details
      });
      checkedInStore = user.checkedInStores[user.checkedInStores.length - 1];
    } else {
      // If already checked in, update the impression
      if (checkedInStore.impression === action) {
        // If the same action, remove the impression
        checkedInStore.impression = null;
        action = 'remove';
      } else {
        checkedInStore.impression = action;
      }
    }

    // Update store likes/dislikes
    if (action === 'like') {
      store.likes++;
      if (checkedInStore.impression === 'dislike') store.dislikes--;
    } else if (action === 'dislike') {
      store.dislikes++;
      if (checkedInStore.impression === 'like') store.likes--;
    } else if (action === 'remove') {
      if (checkedInStore.impression === 'like') store.likes--;
      else if (checkedInStore.impression === 'dislike') store.dislikes--;
    }

    await user.save();
    await store.save();

    // Get total counts
    const totalLikes = user.checkedInStores.filter(s => s.impression === 'like').length;
    const totalDislikes = user.checkedInStores.filter(s => s.impression === 'dislike').length;

    res.status(200).json({ 
      message: 'Impression updated successfully', 
      likes: store.likes, 
      dislikes: store.dislikes,
      totalLikes,
      totalDislikes
    });
  } catch (error) {
    console.error('Error updating impression:', error);
    res.status(500).json({ message: 'Error updating impression' });
  }
});


// app.post('/api/impression', authenticateToken, async (req, res) => {
//   const { storeId, action } = req.body;
//   const userEmail = req.user.email;

//   try {
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     let store = await Store.findOne({ storeId });
//     if (!store) {
//       store = new Store({ storeId });
//     }

//     // Check if the user has already checked in to this store
//     let checkedInStore = user.checkedInStores.find(s => s.storeId === storeId);
    
//     if (!checkedInStore) {
//       // If not checked in, add to checked-in stores
//       user.checkedInStores.push({ storeId, impression: action });
//       checkedInStore = user.checkedInStores[user.checkedInStores.length - 1];
//     } else {
//       // If already checked in, update the impression
//       if (checkedInStore.impression === action) {
//         // If the same action, remove the impression
//         checkedInStore.impression = null;
//         action = 'remove';
//       } else {
//         checkedInStore.impression = action;
//       }
//     }

//     // Update store likes/dislikes
//     if (action === 'like') {
//       store.likes++;
//       if (checkedInStore.impression === 'dislike') store.dislikes--;
//     } else if (action === 'dislike') {
//       store.dislikes++;
//       if (checkedInStore.impression === 'like') store.likes--;
//     } else if (action === 'remove') {
//       if (checkedInStore.impression === 'like') store.likes--;
//       else if (checkedInStore.impression === 'dislike') store.dislikes--;
//     }

//     await user.save();
//     await store.save();

//     // Get total counts
//     const totalLikes = user.checkedInStores.filter(s => s.impression === 'like').length;
//     const totalDislikes = user.checkedInStores.filter(s => s.impression === 'dislike').length;

//     res.status(200).json({ 
//       message: 'Impression updated successfully', 
//       likes: store.likes, 
//       dislikes: store.dislikes,
//       totalLikes,
//       totalDislikes
//     });
//   } catch (error) {
//     console.error('Error updating impression:', error);
//     res.status(500).json({ message: 'Error updating impression' });
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


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token is required' });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Access token is not valid' });
    req.user = user;
    next();
  });
}



const authPort = process.env.AUTHPORT || 4000;
httpServer.listen(authPort, () => console.log(`authServer running on port ${authPort}`));
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

// const authPort = process.env.AUTHPORT || 4000;
// httpServer.listen(authPort, () => console.log(`authServer running on port ${authPort}`));