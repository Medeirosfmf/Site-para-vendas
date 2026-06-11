const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middlewares/auth');
const { uploadSingle, uploadMultiple } = require('../middlewares/upload');
const { createReview, getProductReviews } = require('../controllers/reviewController');
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getPromotions,
  searchProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  toggleProduct,
  uploadImages,
  deleteImage
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/promotions', getPromotions);
router.get('/search', searchProducts);
router.get('/id/:id', authMiddleware, getProductById);
router.get('/:slug', optionalAuth, getProductBySlug);
router.post('/', authMiddleware, adminMiddleware, uploadSingle, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, uploadSingle, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.post('/:id/duplicate', authMiddleware, adminMiddleware, duplicateProduct);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, toggleProduct);
router.post('/:id/images', authMiddleware, adminMiddleware, uploadMultiple, uploadImages);
router.delete('/:id/images/:imageId', authMiddleware, adminMiddleware, deleteImage);

// Review routes
router.post('/:id/reviews', authMiddleware, uploadMultiple, createReview);
router.get('/:id/reviews', getProductReviews);

module.exports = router;
