import dotenv from 'dotenv';
import { makeServerRequest } from './utils/utils.server.js';
import express from 'express';
import path from 'path';
import http from 'http';
import { User, StoreModel, storeOperations } from "./data/mongodb/mongodb.js"; // Update this line
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';


dotenv.config();

const app = express();


let bisectRight;
import('d3').then(d3 => {
  bisectRight = d3.bisectRight;
});


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());






app.post('/settings', async (req, res) => {
  const { email, firstName, lastName, birthdate, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.birthdate = birthdate;
    user.email= email;
    user.password= password;``
    await user.save();
    res.json({ message: 'User settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user settings' });
  }
});








app.post('/login', async (req, res) => {
   const email = req.body.email;
 
   const user = await User.findOne({ email: email });
 
   if (user) {
     res.json({ userExists: true });
   } else {
     res.json({ userExists: false });
   }
 });
 
 
 app.post('/signup', checkNotAuthenticated, async (req, res) => {
   const email = req.body.email;
   const password = req.body.password; 
 
   const hashedPassword = await bcrypt.hash(password, 10);
 
   const newUser = new User({
     email: email,
     password: hashedPassword
   });
 
   newUser.save()
   .then(() => {
     res.json({ message: 'User created' });
   })
   .catch(err => {
     console.error(err);
     res.status(500).send('Server error');
   });
 });







app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/screens/SignupScreen.js'));
});

const posts = [
  {
     email: 'to.reiwatanabe@gmail.com',
     password: '123456'
  },
  {
     email: 'wannabearay@gmail.com',
     password: '7891011'
  }
]



app.get('/posts', authenticationToken, (req, res) => {
   res.json(posts.filter(post => post.user === req.user.user))
})

function authenticationToken(req, res, next) {
   const authHeader = req.headers['authorization']
   const token = authHeader && authHeader.split(' ')[1]
   if (token == null) return res.sendStatus(401)

   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
  
      req.user = user;
      next(); // pass the execution off to whatever request the client intended
    });
}

// const port = process.env.SERVERPORT || 6000;
// app.listen(port, () => console.log(`Server running on port ${port}`));


















function checkNotAuthenticated(req, res, next) {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
 
   if (token) {
     return res.redirect('/user');
   }
 
   next();
 }

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'Invalid or missing authentication token'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Update store endpoint to use error handling
app.get('/stores/:id?', async (req, res, next) => {
  try {
    let stores;
    if (req.params.id) {
      stores = await StoreModel.findById(req.params.id);
      if (!stores) {
        return res.status(404).json({ error: 'StoreModel not found' });
      }
    } else {
      stores = await StoreModel.find({});
    }

    const geojson = {
      type: 'FeatureCollection',
      features: stores.map(store => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.location.geolocation.lon, store.location.geolocation.lat]
        },
        properties: {
          variant: 'stores',
          title: store.title,
          slug: store.slug,
          address: store.location.address,
          categoryType: store.category?.categoryType
        }
      }))
    };

    res.json(geojson);
  } catch (error) {
    next(error);
  }
});





const port = process.env.SERVERPORT || 6000;
app.listen(port, () => console.log(`Server running on port ${port}`));








// Test store sync
const testStoreModelSync = async () => {
  try {
    const store = await storeOperations.syncStoreData('ca_orange-county_fullerton_dripp');

    console.log('StoreModel synced:', store);
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

testStoreModelSync();