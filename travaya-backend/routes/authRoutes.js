const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { body } = require("express-validator");

router.post(
  "/register",
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  validate,
  authController.register
);

router.post(
  "/login",
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
  authController.login
);

router.get("/verify-email/:token", authController.verifyEmail);

router.post(
  "/resend-verification",
  body("email").isEmail().withMessage("Valid email is required"),
  validate,
  authController.resendVerification
);

router.post("/logout", authenticateToken, authController.logout);

// Mobile OTP endpoints
router.post(
  "/send-mobile-otp",
  body("mobile").notEmpty().withMessage("Mobile number is required"),
  validate,
  authController.sendMobileOTP
);

router.post(
  "/verify-mobile-otp",
  body("mobile").notEmpty().withMessage("Mobile number is required"),
  body("otp").notEmpty().withMessage("OTP is required"),
  validate,
  authController.verifyMobileOTP
);

router.post(
  "/mobile-login",
  body("mobile").notEmpty().withMessage("Mobile number is required"),
  body("otp").notEmpty().withMessage("OTP is required"),
  validate,
  authController.mobileLogin
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google-auth-failed` }),
  authController.googleCallback
);

module.exports = router;
