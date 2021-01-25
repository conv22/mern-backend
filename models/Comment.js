const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  post: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Post',
  },
  text: {
    type: String,
    max: 300,
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
});

module.exports = mongoose.model('Comment', CommentSchema);
