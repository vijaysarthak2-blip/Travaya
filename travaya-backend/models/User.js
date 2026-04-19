const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 8 },
  mobile: {
    type: String,
    sparse: true, // Allows multiple null values for unique index
    unique: true,
    trim: true
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  isMobileVerified: { type: Boolean, default: false },
  mobileOTP: { type: String },
  mobileOTPExpires: { type: Date },
  loginMethod: { type: String, enum: ['email', 'mobile'], default: 'email' }
}, { timestamps: true });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.mobileOTP;
  delete obj.mobileOTPExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
