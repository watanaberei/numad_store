// routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');


// Handler for a protected route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route. You are authenticated.',
    user: req.user
  });
});

module.exports = router;