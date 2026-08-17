const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, hostel, room, rollNo } = req.body;
    
    // Domain validation
    if (!email.endsWith('@iitbhu.ac.in')) {
      return res.status(400).json({ message: 'Email must belong to the @iitbhu.ac.in domain' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Roll number uniqueness validation
    if (rollNo) {
      const rollExists = await User.findOne({ rollNo });
      if (rollExists) return res.status(400).json({ message: 'Roll number is already registered' });
    }

    const user = await User.create({ name, email, password, role, hostel, room, rollNo });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostel: user.hostel,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostel: user.hostel,
        room: user.room,
        rollNo: user.rollNo,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

// @route   POST /api/auth/google
// @desc    Google OAuth2 login/registration
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    if (!email.endsWith('@iitbhu.ac.in')) {
      return res.status(400).json({ message: 'Email must belong to the @iitbhu.ac.in domain' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      user = await User.create({
        name,
        email,
        googleId,
        role: 'student', // default
      });
    } else if (!user.googleId) {
      // Link google account to existing email
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostel: user.hostel,
      room: user.room,
      rollNo: user.rollNo,
      avatar: user.avatar,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password (OTP)
// @access  Public
router.post('/forgotpassword', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Get reset OTP
    const otp = user.getResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    const message = `Your password reset OTP is: ${otp}\nIt is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP',
        message,
      });

      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error(err);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/resetpassword
// @desc    Reset password using OTP
// @access  Public
router.put('/resetpassword', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Hash the entered OTP to compare with DB
    const resetPasswordOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp,
      resetPasswordOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
