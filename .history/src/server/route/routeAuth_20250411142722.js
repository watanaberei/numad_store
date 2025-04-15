// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('authController:', authController);

router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/logout', authController.logout_get);
router.get('/admin', authController.admin_get);
router.post('/callback', authController.callback_post);

module.exports = router;


































// const express = require('express');
// const { auth, requiresAuth } = require('express-openid-connect');

// const app = express();

// app.use(
//   auth({
//     routes: {
//       login: false,
//       postLogoutRedirect: '/custom-logout',

//     },
//   })
// );

// console.log("Express auth middleware is set up.");

// app.get('/login', (req, res) => {
//   console.log("Handling /login route.");
//   res.oidc.login({
//     returnTo: '/profile',
//     authorizationParams: {
//       redirect_uri: 'http://localhost:3000/',
//     },
//   });
// });

// app.get('/custom-logout', (req, res) => {
//   console.log("Handling /custom-logout route.");
//   res.send('Bye!');
// });

// app.get('/admin', requiresAuth(), (req, res) => {
//   console.log("Handling /admin route.");
//   res.send(`Hello ${req.oidc.user.sub}, this is the admin section.`);
// });

// app.post('/callback', express.urlencoded({ extended: false }), (req, res) => {
//   console.log("Handling POST /callback route.");
//   res.oidc.callback({
//     redirectUri: 'http://localhost:3000/callback',
//   });
// });

// app.post('/login', express.urlencoded({ extended: false }), (req, res) => {
//   console.log("Handling POST /login route.");
//   res.oidc.callback({
//     redirectUri: 'http://localhost:3000/login',
//   });
// });

// console.log("Express app is set up.");

// module.exports = app;