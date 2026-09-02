const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { emitToPost } = require('../config/socket');

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      content: content.trim(),
    });

    // Increment comment count on post
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'username name avatar'
    );

    // Emit real-time Socket.IO event to all users viewing this post
    emitToPost(postId, 'comment:created', {
      postId: postId.toString(),
      comment: populatedComment,
      commentsCount: post.commentsCount,
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment,
      commentsCount: post.commentsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getPostComments = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId })
      .populate('user', 'username name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    // Check ownership or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    const postId = comment.post.toString();
    const commentId = comment._id.toString();

    await Comment.findByIdAndDelete(comment._id);

    // Decrement post comment count
    const post = await Post.findById(postId);
    if (post && post.commentsCount > 0) {
      post.commentsCount = post.commentsCount - 1;
      await post.save();
    }

    const finalCommentsCount = post ? post.commentsCount : 0;

    // Emit real-time Socket.IO event to all users viewing this post
    emitToPost(postId, 'comment:deleted', {
      postId,
      commentId,
      commentsCount: finalCommentsCount,
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
      commentsCount: finalCommentsCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getPostComments,
  deleteComment,
};
