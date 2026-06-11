const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
