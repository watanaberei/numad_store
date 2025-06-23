// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserProfile');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/user-profile', authenticateToken, userController.getUserProfile);
router.post('/user-profile', authenticateToken, userController.updateUserProfile);

module.exports = router;