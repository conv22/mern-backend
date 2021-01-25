/* eslint-disable no-underscore-dangle */
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const upload = require('../middleware/upload');

exports.GET_MAIN_PAGE = async (req, res) => {
  try {
    const total = await Post.countDocuments({});
    const posts = await Post.find({})
      .skip(req.query.page * 3)
      .limit(3)
      .populate('owner')
      .populate('likes')
      .sort({ date: -1 });
    return res.json({ posts, total: Math.ceil(total / 3) });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.GET_USER = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('friends')
      .populate('friendRequests');
    const posts = await Post.find({ owner: req.params.id });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user, posts });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
exports.GET_CURRENT_USER = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends')
      .populate('friendRequests');
    const userPosts = await Post.find({ owner: user._id });
    return res.json({ user, userPosts });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.GET_ALL_USERS = async (req, res) => {
  try {
    const total = await User.countDocuments({});
    const users = await User.find({})
      .skip(req.query.page * 5)
      .limit(5)
      .sort({ username: 1 });
    return res.json({ users, total: Math.ceil(total / 5) });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.GET_CURRENT_USER_FRIENDS = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends')
      .populate('friendRequests')
      .select('-password');
    return res.json({
      friends: user.friends,
      friendRequests: user.friendRequests,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.GET_POST = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('owner');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comments = await Comment.find({ post: req.params.id })
      .populate('owner')
      .sort({ date: -1 });
    return res.json({ post, comments });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.POST_SEARCH = [
  check('search', 'Should not be empty').notEmpty().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const users = await User.find({}).select('-password');
      const filteredUsers = users.filter((user) =>
        user.username.includes(req.body.search.toLowerCase())
      );
      return res.json(filteredUsers);
    } catch (err) {
      return res.status(500).json({ message: 'Something went wrong' });
    }
  },
];

exports.POST_POST = [
  upload.single('file'),
  check('title', 'Enter valid title')
    .notEmpty()
    .isLength({ min: 3, max: 15 })
    .trim(),
  check('text', 'Enter valid description')
    .notEmpty()
    .isLength({ min: 10, max: 1000 })
    .trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, text } = req.body;
      const post = new Post({
        title,
        text,
        owner: req.user._id,
        imageUrl: `/uploads/${req.file.filename}`,
      });
      await post.save();
      return res.json({ message: 'Post is saved' });
    } catch (err) {
      return res.status(500).json({ message: 'Something went wrong' });
    }
  },
];

exports.POST_FRIEND_REQUEST = async (req, res) => {
  try {
    const to = await User.findById(req.params.id)
      .populate('friendRequests')
      .populate('friends')
      .select('-password');
    if (
      to.friends.some(
        (friend) => friend._id.toString() === req.user._id.toString()
      ) ||
      to.friendRequests.some(
        (request) => request._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(400).json({ message: 'Already friends' });
    }
    to.friendRequests.push(req.user._id);
    await to.save();
    return res.json({ message: 'Request sent' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.POST_ACCEPT_FRIEND = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('friendRequests')
    .populate('friends')
    .select('-password');
  user.friendRequests = user.friendRequests.filter(
    (request) => request._id.toString() !== req.params.id.toString()
  );
  user.friends.push(req.params.id);
  await user.save();
  return res.json({ message: 'Friend added' });
};

exports.DELETE_REQUEST = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friendRequests');
    const filteredArray = user.friendRequests.filter(
      (x) => x._id.toString() !== req.user._id.toString()
    );
    user.friendRequests = filteredArray;
    await user.save();
    return res.json({ message: 'Request deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
exports.DELETE_COMMENT = async (req, res) => {
  try {
    await Comment.findOneAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.DELETE_FRIEND = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends')
      .select('-password');
    user.friends = user.friends.filter(
      (friend) => friend._id.toString() !== req.params.id
    );
    await user.save();
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.POST_LIKE = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });

    const liked = post.likes.some(
      (like) => like.user.toString() === req.user._id.toString()
    );
    if (liked) {
      const filteredArray = post.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString()
      );
      post.likes = filteredArray;
      await post.save();
      return res.json({ message: 'disliked' });
    }

    post.likes.push({ user: req.user._id });
    await post.save();
    return res.json({ message: 'liked' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.POST_COMMENT = [
  check('text', 'Text is required').isLength({ min: 10, max: 300 }).trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const newComment = new Comment({
        owner: req.user._id,
        post: post._id,
        text: req.body.text,
      });
      await newComment.save();
      return res.json({ message: 'Comment sent' });
    } catch (err) {
      return res.status(500).json({ message: 'Something went wrong' });
    }
  },
];

exports.POST_COMMENT_LIKE = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('likes');
    if (!comment) {
      return res.status(400).json({ message: 'Comment not found' });
    }
    const liked = comment.likes.some(
      (like) => like.user.toString() === req.user._id.toString()
    );
    if (liked) {
      const filteredArray = comment.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString()
      );
      comment.likes = filteredArray;
      await comment.save();
      return res.json({ message: 'disliked' });
    }

    comment.likes.push({ user: req.user._id });
    await comment.save();
    return res.json({ message: 'liked' });
  } catch (err) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
