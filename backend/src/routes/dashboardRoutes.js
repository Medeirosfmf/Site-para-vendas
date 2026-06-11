const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  getStats,
  getRecentOrders,
  getTopProducts
} = require('../controllers/dashboardController');

router.get('/stats', authMiddleware, adminMiddleware, getStats);
router.get('/recent-orders', authMiddleware, adminMiddleware, getRecentOrders);
router.get('/top-products', authMiddleware, adminMiddleware, getTopProducts);

module.exports = router;
