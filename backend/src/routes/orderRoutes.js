const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, createOrder);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.patch('/:id/cancel', authMiddleware, cancelOrder);

module.exports = router;
