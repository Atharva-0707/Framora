const User = require('../models/User');
const Post = require('../models/Post');
const { uploadStreamToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get user profile by ID or username
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    let user;

    // Check if valid ObjectId or query by username
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select('-password');
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() }).select(
        '-password'
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    // Get user's posts
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = req.user ? req.user._id.toString() : null;
    const isFollowing = currentUserId
      ? user.followers.some((f) => f.toString() === currentUserId)
      : false;

    // Format posts with isLiked flags
    const formattedPosts = posts.map((p) => ({
      ...p,
      likesCount: p.likes ? p.likes.length : 0,
      isLiked: currentUserId
        ? p.likes && p.likes.some((l) => l.toString() === currentUserId)
        : false,
    }));

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage || '',
        coverPosition: user.coverPosition || { x: 50, y: 50, zoom: 1 },
        bio: user.bio,
        location: user.location,
        website: user.website,
        role: user.role,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
        postsCount: posts.length,
        createdAt: user.createdAt,
      },
      posts: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const {
      name,
      bio,
      location,
      website,
      avatar: directAvatar,
      coverImage: directCover,
      coverPosition: coverPositionRaw,
    } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (website !== undefined) user.website = website.trim();

    // Check for uploaded avatar file
    const avatarFile = req.file || (req.files && req.files.avatar && req.files.avatar[0]);
    if (avatarFile) {
      const uploadRes = await uploadStreamToCloudinary(avatarFile.buffer, {
        folder: 'framora/avatars',
      });
      if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
      }
      user.avatar = uploadRes.secure_url;
      user.avatarPublicId = uploadRes.public_id;
    } else if (directAvatar) {
      user.avatar = directAvatar.trim();
    }

    // Parse coverPosition if passed (as JSON string or object)
    let parsedCoverPosition = null;
    if (coverPositionRaw) {
      try {
        parsedCoverPosition = typeof coverPositionRaw === 'string'
          ? JSON.parse(coverPositionRaw)
          : coverPositionRaw;
      } catch (e) {
        console.warn('Failed to parse coverPosition JSON:', e.message);
      }
    }

    // ── Cover image upload / removal / reposition ───────────────────────────
    const coverFile = req.files &&
      (req.files.coverImage?.[0] || req.files.coverImageFile?.[0]);

    if (coverFile) {
      // New file: upload first, then safely clean up old Cloudinary asset
      const uploadRes = await uploadStreamToCloudinary(coverFile.buffer, {
        folder: 'framora/covers',
      });
      if (user.coverImagePublicId) {
        await deleteFromCloudinary(user.coverImagePublicId);
      }
      user.coverImage = uploadRes.secure_url;
      user.coverImagePublicId = uploadRes.public_id;
      if (parsedCoverPosition) {
        user.coverPosition = {
          x: Math.max(0, Math.min(100, Number(parsedCoverPosition.x) || 50)),
          y: Math.max(0, Math.min(100, Number(parsedCoverPosition.y) || 50)),
          zoom: Math.max(1, Math.min(3, Number(parsedCoverPosition.zoom) || 1)),
        };
      }
    } else if (directCover !== undefined) {
      if (directCover.trim() === '') {
        // Explicit removal: clean up Cloudinary asset then clear fields
        if (user.coverImagePublicId) {
          await deleteFromCloudinary(user.coverImagePublicId);
        }
        user.coverImage = '';
        user.coverImagePublicId = '';
        user.coverPosition = { x: 50, y: 50, zoom: 1 };
      } else {
        // URL update (legacy / edge-case)
        user.coverImage = directCover.trim();
        if (parsedCoverPosition) {
          user.coverPosition = {
            x: Math.max(0, Math.min(100, Number(parsedCoverPosition.x) || 50)),
            y: Math.max(0, Math.min(100, Number(parsedCoverPosition.y) || 50)),
            zoom: Math.max(1, Math.min(3, Number(parsedCoverPosition.zoom) || 1)),
          };
        }
      }
    } else if (parsedCoverPosition) {
      // User adjusted position of current existing cover without re-uploading file
      user.coverPosition = {
        x: Math.max(0, Math.min(100, Number(parsedCoverPosition.x) || 50)),
        y: Math.max(0, Math.min(100, Number(parsedCoverPosition.y) || 50)),
        zoom: Math.max(1, Math.min(3, Number(parsedCoverPosition.zoom) || 1)),
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        coverImage: updatedUser.coverImage || '',
        coverPosition: updatedUser.coverPosition || { x: 50, y: 50, zoom: 1 },
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        role: updatedUser.role,
        followersCount: updatedUser.followers.length,
        followingCount: updatedUser.following.length,
        bookmarksCount: updatedUser.bookmarks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Follow/Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.',
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const isFollowing = targetUser.followers.some(
      (f) => f.toString() === currentUserId.toString()
    );

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(
        (f) => f.toString() !== currentUserId.toString()
      );
      currentUser.following = currentUser.following.filter(
        (f) => f.toString() !== targetUserId.toString()
      );
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      message: !isFollowing
        ? `Now following @${targetUser.username}`
        : `Unfollowed @${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarked posts of logged-in user
// @route   GET /api/users/bookmarks
// @access  Private
const getUserBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: {
        path: 'user',
        select: 'username name avatar',
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const currentUserId = req.user._id.toString();
    const formattedBookmarks = user.bookmarks
      .filter((post) => post !== null)
      .map((post) => ({
        ...post.toObject(),
        likesCount: post.likes ? post.likes.length : 0,
        isLiked: post.likes
          ? post.likes.some((l) => l.toString() === currentUserId)
          : false,
        isBookmarked: true,
      }));

    res.status(200).json({
      success: true,
      count: formattedBookmarks.length,
      posts: formattedBookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by username or name
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const searchRegex = { $regex: query.trim(), $options: 'i' };
    const users = await User.find({
      $or: [{ username: searchRegex }, { name: searchRegex }],
    })
      .select('username name avatar bio location followers')
      .limit(15)
      .lean();

    const currentUserId = req.user ? req.user._id.toString() : null;
    const formatted = users.map((u) => ({
      ...u,
      followersCount: u.followers ? u.followers.length : 0,
      isFollowing: currentUserId
        ? u.followers && u.followers.some((f) => f.toString() === currentUserId)
        : false,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      users: formatted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  toggleFollowUser,
  getUserBookmarks,
  searchUsers,
};
