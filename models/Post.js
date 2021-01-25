const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [
    {
      user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Post', PostSchema);
