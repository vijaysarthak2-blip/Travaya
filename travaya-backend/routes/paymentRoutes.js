const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { body } = require("express-validator");

router.post(
  "/process",
  authenticateToken,
  body("bookingId").notEmpty().withMessage("Booking ID is required"),
  body("method").isIn(["card", "upi"]).withMessage("Invalid payment method"),
  validate,
  paymentController.processPayment
);

module.exports = router;
