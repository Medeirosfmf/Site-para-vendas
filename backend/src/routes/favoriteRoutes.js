const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');

router.get('/', authMiddleware, getFavorites);
router.post('/', authMiddleware, addFavorite);
router.delete('/:productId', authMiddleware, removeFavorite);

module.exports = router;
