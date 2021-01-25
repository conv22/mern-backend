/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { check, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const User = require('../models/User');

exports.register = [
  upload.single('file'),
  check('email', 'Enter valid email').isEmail().notEmpty().trim(),
  check('username', 'Enter your username').notEmpty(),
  check('password', 'Enter password between 6 and 20 characters')
    .isLength({ min: 6, max: 20 })
    .trim(),
  check('cpassword', 'Passports dont match').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords should match');
    }
    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    if (req.file) {
      const { file } = req.file;
      const aviUrl = `/uploads/${file.filename}`;
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        aviUrl,
      });
      await newUser.save();
      return res.json({ message: 'User saved with avi', newUser });
    }
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.json({ message: 'User saved', user: newUser.username });
  },
];

exports.login = [
  [
    check('email', 'Enter valid email').isEmail().notEmpty(),
    check('password', 'Enter passport').notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: 'Not valid password' });
      }
      const token = jwt.sign({ user: user._id }, process.env.JwtSecret, {
        expiresIn: '3h',
      });
      return res.json({
        token,
        user: user._id,
        aviUrl: user.aviUrl,
        message: 'You are logged in',
      });
    },
  ],
];
