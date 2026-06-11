const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  getMostViewed,
  getMostSold,
  getCategoryStats,
  getLowStockReport,
  getProfitReport
} = require('../controllers/reportController');

router.get('/most-viewed', authMiddleware, adminMiddleware, getMostViewed);
router.get('/most-sold', authMiddleware, adminMiddleware, getMostSold);
router.get('/categories', authMiddleware, adminMiddleware, getCategoryStats);
router.get('/low-stock', authMiddleware, adminMiddleware, getLowStockReport);
router.get('/profit', authMiddleware, adminMiddleware, getProfitReport);

module.exports = router;
