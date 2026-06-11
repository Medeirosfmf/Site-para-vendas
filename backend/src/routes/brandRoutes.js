const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');

router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', authMiddleware, adminMiddleware, createBrand);
router.put('/:id', authMiddleware, adminMiddleware, updateBrand);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBrand);

module.exports = router;
