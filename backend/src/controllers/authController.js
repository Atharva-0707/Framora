const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, name, email, password, bio, location } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, full name, email, and password.',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (userExists) {
      const field = userExists.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} is already in use by another account.`,
      });
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      bio: bio || '',
      location: location || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
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
        bookmarksCount: user.bookmarks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password.',
      });
    }

    // Find user by email or username, explicitly selecting password
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: email.toLowerCase().trim() },
      ],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
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
        bookmarksCount: user.bookmarks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

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
        bookmarksCount: user.bookmarks.length,
        followers: user.followers,
        following: user.following,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
