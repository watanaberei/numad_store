import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import User from "../mongodb.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// import jwt from 'jsonwebtoken';

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

let bisectRight;
import('d3').then(d3 => {
  bisectRight = d3.bisectRight;
});


//fix this for production
let refreshTokens = []



app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email });

  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign({ user: user.email }, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send('Incorrect password');
    }
  } else {
    res.status(200).json({ user: null });
  }
});


// app.post('/login', async (req, res) => {
//    const email = req.body.email;
//    const password = req.body.password;
 
//    const user = await User.findOne({ email: email });
 
//    if (user && await bcrypt.compare(password, user.password)) {
//      const accessToken = jwt.sign({ user: user.email }, process.env.ACCESS_TOKEN_SECRET);
//      res.json({ accessToken: accessToken });
//    } else {
//      res.status(401).send('Login failed');
//    }
//  });



// app.post('/login', async (req, res) => {
//    const { email, password } = req.body;
 
//    const user = await User.findOne({ email });
//    if (!user) {
//      return res.status(404).json({ message: 'User not found' });
//    }
 
//    const isMatch = await bcrypt.compare(password, user.password);
//    if (!isMatch) {
//      return res.status(400).json({ message: 'Invalid password' });
//    }
 
//    const accessToken = generateAccessToken({ name: user.email });
//    const refreshToken = jwt.sign({ name: user.email }, process.env.REFRESH_TOKEN_SECRET);
//    refreshTokens.push(refreshToken);
 
//    res.json({ accessToken, refreshToken });
//  });




 app.get('/user', authenticateToken, async (req, res) => {
   const user = await User.findOne({ email: req.user.name });
   if (!user) {
     return res.status(404).json({ message: 'User not found' });
   }
 
   res.json({
     firstName: user.firstName,
     lastName: user.lastName,
     birthdate: user.birthdate
   });
 });

 app.post('/profile', authenticateToken, async (req, res) => {
   const { firstName, lastName, birthdate } = req.body;
 
   const user = await User.findOne({ email: req.user.name });
   if (!user) {
     return res.status(404).json({ message: 'User not found' });
   }
 
   user.firstName = firstName;
   user.lastName = lastName;
   user.birthdate = birthdate;
   await user.save();
 
   res.json({ message: 'Profile updated successfully' });
 });
// app.post('/login', (req, res) => {
//    const email = req.body.email;
//    const password = req.body.password; // Assuming you're sending password in the request

//    User.findOne({ email: email })
//       .then(user => {
//          if (!user) {
//             return res.status(404).send('User not found');
//          }

//          // Check password
//          bcrypt.compare(password, user.password)
//             .then(isMatch => {
//                if (!isMatch) {
//                   return res.status(400).send('Invalid password');
//                }

//                // User is authenticated, generate tokens
//                const userForToken = { name: user.email };
//                const accessToken = generateAccessToken(userForToken);
//                const refreshToken = jwt.sign(userForToken, process.env.REFRESH_TOKEN_SECRET);
//                refreshTokens.push(refreshToken);
//                res.json({ accessToken: accessToken, refreshToken: refreshToken });
//             });
//       })
//       .catch(err => {
//          console.error(err);
//          res.status(500).send('Server error');
//       });
// });


app.post('/token', (req, res) => {
   const { token: refreshToken } = req.body;
 
   if (!refreshToken || !refreshTokens.includes(refreshToken)) {
     return res.status(403).json({ message: 'Refresh token is not valid' });
   }
 
   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
     if (err) {
       return res.status(403).json({ message: 'Refresh token is not valid' });
     }
 
     const accessToken = generateAccessToken({ name: user.name });
     res.json({ accessToken });
   });
 });

// app.post('/token', (req, res) => {
//    const refreshToken = req.body.token
//    if (refreshToken == null) return res.sendStatus(401)
//    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
//    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//       if (err) return res.sendStatus(403)
//       const accessToken = generateAccessToken({ 
//       name: user.name })
//       res.json({ accessToken: accessToken })
//    })
// })

// app.delete('/logout', (req, res) => {
//    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//    res.sendStatus(204)
// })




// app.post('/login',  (req, res) => {
//    // Authenticate the user

//    const email = req.body.email
//    const user = { name: email }

//    const accessToken = generateAccessToken(user)
//    const refreshToken = jwt.sign(user, 
//    process.env.REFRESH_TOKEN_SECRET)
//    refreshTokens.push(refreshToken)a
//    res.json({ accessToken: accessToken, 
//       refreshToken: refreshToken }) 
   
// })


 app.delete('/logout', authenticateToken, (req, res) => {
   const { token: refreshToken } = req.body;
 
   refreshTokens = refreshTokens.filter(token => token !== refreshToken);
   console.log(`User ${req.user.name} has been logged out`);
   res.sendStatus(204);
 });


const authPort = process.env.AUTHPORT || 4000;
app.listen(authPort, () => console.log(`authServer running on port ${authPort}`));













function generateAccessToken(user) {
   return jwt.sign(user, 
      process.env.ACCESS_TOKEN_SECRET, { expiresIn: 
         '1500s' }) // { expiresIn: '1500s' })
}


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

 function checkAuthenticated(req, res, next) {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];
 
   if (!token) {
     return res.redirect('/login');
   }
 
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
     if (err) {
       return res.redirect('/login');
     }
 
     req.user = user;
     next();
   });
 }

//  function checkNotAuthenticated(req, res, next) {
//    const authHeader = req.headers['authorization'];
//    const token = authHeader && authHeader.split(' ')[1];
 
//    if (token) {
//      return res.redirect('/user');
//    }
 
//    next();
//  }