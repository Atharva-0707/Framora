const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createPurchaseOrder,
  verifyPurchasePayment,
  getMyPurchases,
  getMySales,
  getDownloadAccess,
} = require('../controllers/purchaseController');

const router = express.Router();

// Protected Buyer & Seller routes
router.get('/me', protect, getMyPurchases);
router.get('/sales', protect, getMySales);
router.get('/download/:postId', protect, getDownloadAccess);
router.post('/:postId/create-order', protect, createPurchaseOrder);
router.post('/:postId/verify', protect, verifyPurchasePayment);

module.exports = router;
