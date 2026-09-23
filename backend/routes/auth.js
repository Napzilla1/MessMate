const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ─── Helper: Get Redis client from Express app ─────────────────
const getRedis = (req) => req.app.get("redisClient");

// @route   POST /api/auth/register
// @desc    Initiate registration (Send OTP via Redis)
// @access  Public
router.post("/register", rateLimiter(5, 60), async (req, res) => {
  try {
    const { name, email, password, role, hostel, room, rollNo } = req.body;

    // Domain validation
    if (!email.endsWith("@iitbhu.ac.in")) {
      return res
        .status(400)
        .json({ message: "Email must belong to the @iitbhu.ac.in domain" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Roll number uniqueness validation
    if (rollNo) {
      const rollExists = await User.findOne({ rollNo });
      if (rollExists)
        return res
          .status(400)
          .json({ message: "Roll number is already registered" });
    }

    const redis = getRedis(req);
    if (!redis) return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store registration data + OTP in Redis (auto-expires in 10 mins)
    await redis.setex(
      `reg_otp:${email}`,
      600,
      JSON.stringify({ name, email, password, role, hostel, room, rollNo, otp })
    );

    const message = `Welcome to MessMate! Your registration OTP is: ${otp}\nIt is valid for 10 minutes.`;

    try {
      await sendEmail({
        email,
        subject: "MessMate - Verify your account",
        message,
      });
      res.status(200).json({
        message: "OTP sent to email. Please verify to complete registration.",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration (Redis lookup)
// @access  Public
router.post("/verify-otp", rateLimiter(5, 60), async (req, res) => {
  try {
    const { email, otp } = req.body;

    const redis = getRedis(req);
    if (!redis) return res.status(500).json({ message: "Redis not available" });

    const data = await redis.get(`reg_otp:${email}`);
    if (!data) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpRecord = JSON.parse(data);
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid, create the user!
    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
      role: otpRecord.role,
      hostel: otpRecord.hostel,
      room: otpRecord.room,
      rollNo: otpRecord.rollNo,
    });

    // Delete the OTP from Redis
    await redis.del(`reg_otp:${email}`);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostel: user.hostel,
      room: user.room,
      rollNo: user.rollNo,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post("/login", rateLimiter(10, 60), async (req, res) => {
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
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (Requires OTP if email/phone changes)
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone, hostel, room } = req.body;
    
    // Check if sensitive fields changed
    const sensitiveChanged = (email && email !== user.email) || (phone && phone !== user.phone);

    if (sensitiveChanged) {
      const redis = getRedis(req);
      if (!redis) return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      // Store OTP + pending changes in Redis (auto-expires in 10 mins)
      await redis.setex(
        `profile_otp:${user._id}`,
        600,
        JSON.stringify({ otp: hashedOtp, updates: { name, email, phone, hostel, room } })
      );

      // Send OTP to CURRENT email to authorize the change
      const message = `You requested a profile update. Your authorization OTP is: ${otp}\nIt is valid for 10 minutes.`;
      await sendEmail({ email: user.email, subject: "Profile Update OTP", message });

      return res.json({ requiresOtp: true, message: "OTP sent to your current email to authorize changes." });
    }

    // No sensitive changes, update immediately
    user.name = name || user.name;
    user.hostel = hostel || user.hostel;
    user.room = room || user.room;
    if (phone) user.phone = phone;

    const updatedUser = await user.save();
    res.json({
      requiresOtp: false,
      user: {
        _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        phone: updatedUser.phone, hostel: updatedUser.hostel, room: updatedUser.room,
        role: updatedUser.role, avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile/verify
// @desc    Verify OTP and apply profile updates (Redis lookup)
// @access  Private
router.put("/profile/verify", protect, rateLimiter(5, 60), async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    const redis = getRedis(req);
    if (!redis) return res.status(500).json({ message: "Redis not available" });

    const data = await redis.get(`profile_otp:${user._id}`);
    if (!data) {
      return res.status(400).json({ message: "No pending update found or OTP expired" });
    }

    const record = JSON.parse(data);
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== record.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Apply pending changes
    const updates = record.updates;
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.phone) user.phone = updates.phone;
    if (updates.hostel) user.hostel = updates.hostel;
    if (updates.room) user.room = updates.room;

    const updatedUser = await user.save();

    // Clear OTP from Redis
    await redis.del(`profile_otp:${user._id}`);

    res.json({
      _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
      phone: updatedUser.phone, hostel: updatedUser.hostel, room: updatedUser.room,
      role: updatedUser.role, avatar: updatedUser.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users
// @access  Private/Admin
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/staff
// @desc    Add a staff member directly (admin only)
// @access  Private/Admin
router.post("/staff", protect, admin, async (req, res) => {
  try {
    const { name, email, password, role, hostel } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name, email, password, role, hostel
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password (OTP via Redis)
// @access  Public
router.post("/forgotpassword", rateLimiter(3, 60), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email" });
    }

    const redis = getRedis(req);
    if (!redis) return res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });

    // Generate OTP and store hash in Redis
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await redis.setex(`reset_otp:${user.email}`, 600, hashedOtp);

    const message = `Your password reset OTP is: ${otp}\nIt is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP",
        message,
      });

      res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
      // Clean up Redis on email failure
      if (redis) await redis.del(`reset_otp:${user.email}`);
      console.error(err);
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/auth/resetpassword
// @desc    Reset password using OTP (Redis lookup)
// @access  Public
router.put("/resetpassword", rateLimiter(5, 60), async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const redis = getRedis(req);
    if (!redis) return res.status(500).json({ message: "Redis not available" });

    const storedHash = await redis.get(`reset_otp:${email}`);
    if (!storedHash) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the entered OTP to compare
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== storedHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Clean up Redis
    await redis.del(`reset_otp:${email}`);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
