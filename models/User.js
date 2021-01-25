const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
  ],
  friends: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  friendRequests: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  aviUrl: {
    type: String,
    default: '/uploads/default.jpg',
  },
});

module.exports = mongoose.model('User', UserSchema);
