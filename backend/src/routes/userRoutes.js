const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  toggleFollowUser,
  getUserBookmarks,
  searchUsers,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// User search
router.get('/search', optionalAuth, searchUsers);

// User bookmarks
router.get('/bookmarks', protect, getUserBookmarks);

// User profile update (supports avatar and cover image files)
router.put(
  '/profile',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'coverImageFile', maxCount: 1 },
  ]),
  updateUserProfile
);

// Follow / Unfollow
router.post('/:id/follow', protect, toggleFollowUser);

// Get user profile by ID or username
router.get('/:id', optionalAuth, getUserProfile);

module.exports = router;
