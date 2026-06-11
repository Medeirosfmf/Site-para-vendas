const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const {
  getCustomers,
  getCustomerById,
  deleteCustomer
} = require('../controllers/customerController');

router.get('/', authMiddleware, adminMiddleware, getCustomers);
router.get('/:id', authMiddleware, adminMiddleware, getCustomerById);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCustomer);

module.exports = router;
