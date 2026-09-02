const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleBookmarkPost,
  updatePostSaleSettings,
} = require('../controllers/postController');
const {
  addComment,
  getPostComments,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Post feed & creation
router
  .route('/')
  .get(optionalAuth, getPosts)
  .post(protect, upload.single('image'), createPost);

// Single post operations
router
  .route('/:id')
  .get(optionalAuth, getPostById)
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

// Marketplace sale settings
router.put('/:id/sale', protect, updatePostSaleSettings);

// Social interactions
router.post('/:id/like', protect, toggleLikePost);
router.post('/:id/bookmark', protect, toggleBookmarkPost);

// Post Comments
router
  .route('/:id/comments')
  .get(getPostComments)
  .post(protect, addComment);

module.exports = router;
