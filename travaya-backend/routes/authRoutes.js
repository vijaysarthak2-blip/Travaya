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

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html?error=google-auth-failed" }),
  authController.googleCallback
);

module.exports = router;
