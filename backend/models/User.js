const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required because of Google Auth
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['student', 'manager', 'admin'], default: 'student' },
  hostel: { type: String },
  room: { type: String },
  rollNo: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: 'U' },
  resetPasswordOtp: String,
  resetPasswordOtpExpire: Date
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP
UserSchema.methods.getResetPasswordOtp = function() {
  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to resetPasswordOtp field
  this.resetPasswordOtp = require('crypto')
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

module.exports = mongoose.model('User', UserSchema);
