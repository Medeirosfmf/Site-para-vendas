const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  addEntry,
  addExit,
  addAdjustment,
  getMovements,
  getLowStock
} = require('../controllers/stockController');

router.post('/entry', authMiddleware, adminMiddleware, addEntry);
router.post('/exit', authMiddleware, adminMiddleware, addExit);
router.post('/adjustment', authMiddleware, adminMiddleware, addAdjustment);
router.get('/movements', authMiddleware, adminMiddleware, getMovements);
router.get('/low', authMiddleware, adminMiddleware, getLowStock);

module.exports = router;
