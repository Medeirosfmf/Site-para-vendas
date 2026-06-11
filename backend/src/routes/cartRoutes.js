const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addToCart);
router.put('/:id', authMiddleware, updateCartItem);
router.delete('/clear', authMiddleware, clearCart);
router.delete('/:id', authMiddleware, removeCartItem);

module.exports = router;
