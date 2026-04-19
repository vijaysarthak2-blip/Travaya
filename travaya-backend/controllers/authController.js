const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMSOTP(mobile, otp) {
  // Using ClickSend (free SMS service - 20 free SMS/day)
  try {
    const axios = require('axios');
    const response = await axios.post('https://rest.clicksend.com/api/v3/sms/send', {
      api_key: process.env.CLICKSEND_API_KEY || 'demo_key',
      to: mobile,
      message: `Your Travaya verification code is: ${otp}`,
      sender: 'Travaya'
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.CLICKSEND_API_KEY || 'demo_key').toString('base64')}`
      }
    });
    
    console.log('SMS sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error.response?.data || error.message);
    
    // Fallback to console logging for development
    console.log(`SMS OTP for ${mobile}: ${otp}`);
    return true;
  }
}

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/verify-email.html?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your Travaya account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #4CAF50;">Welcome to Travaya!</h2>
        <p>Thank you for registering with Travaya. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already registered");
      error.status = 409;
      return next(error);
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    const token = generateVerificationToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      requiresVerification: true
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      return next(error);
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in. Check your inbox for verification email.",
        requiresVerification: true
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      const error = new Error("Invalid or expired verification token");
      error.status = 400;
      return next(error);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    next(err);
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    if (user.isEmailVerified) {
      const error = new Error("Email already verified");
      error.status = 400;
      return next(error);
    }

    const token = generateVerificationToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, token);
    res.json({ message: "Verification email sent! Please check your inbox." });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  res.json({ message: "Logout successful" });
};

exports.googleCallback = (req, res) => {
  const token = jwt.sign(
    { userId: req.user._id, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
    id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role
  }))}`);
};

// Mobile OTP Controllers
exports.sendMobileOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    
    // Normalize mobile number (remove spaces, dashes, etc.)
    const normalizedMobile = mobile.replace(/[\s\-\(\)]/g, '');
    
    // Check if mobile number is valid (basic validation)
    if (!/^\+?\d{10,15}$/.test(normalizedMobile)) {
      return res.status(400).json({ error: "Invalid mobile number format" });
    }
    
    // Check if user exists with this mobile number
    let user = await User.findOne({ mobile: normalizedMobile });
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    if (user) {
      // Update existing user's OTP
      user.mobileOTP = otp;
      user.mobileOTPExpires = otpExpires;
    } else {
      // For demo, we'll allow OTP generation for non-registered numbers
      // In production, you might want to require registration first
      return res.status(404).json({ error: "Mobile number not registered" });
    }
    
    await user.save();
    
    // Send OTP via SMS
    await sendSMSOTP(normalizedMobile, otp);
    
    res.json({ 
      message: "OTP sent successfully",
      mobile: normalizedMobile.substring(0, normalizedMobile.length - 4) + "****" // Masked mobile
    });
    
  } catch (error) {
    next(error);
  }
};

exports.verifyMobileOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    
    // Normalize mobile number
    const normalizedMobile = mobile.replace(/[\s\-\(\)]/g, '');
    
    // Find user with this mobile number
    const user = await User.findOne({ mobile: normalizedMobile });
    
    if (!user) {
      return res.status(404).json({ error: "Mobile number not found" });
    }
    
    // Check if OTP is valid and not expired
    if (user.mobileOTP !== otp || user.mobileOTPExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    
    // Mark mobile as verified
    user.isMobileVerified = true;
    user.mobileOTP = undefined;
    user.mobileOTPExpires = undefined;
    await user.save();
    
    res.json({ message: "Mobile number verified successfully" });
    
  } catch (error) {
    next(error);
  }
};

exports.mobileLogin = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    
    // Normalize mobile number
    const normalizedMobile = mobile.replace(/[\s\-\(\)]/g, '');
    
    // Find user with this mobile number
    const user = await User.findOne({ mobile: normalizedMobile });
    
    if (!user) {
      return res.status(404).json({ error: "Mobile number not registered" });
    }
    
    // Check if OTP is valid and not expired
    if (user.mobileOTP !== otp || user.mobileOTPExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    
    // Clear OTP and update login method
    user.mobileOTP = undefined;
    user.mobileOTPExpires = undefined;
    user.loginMethod = 'mobile';
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        loginMethod: user.loginMethod
      }
    });
    
  } catch (error) {
    next(error);
  }
};
