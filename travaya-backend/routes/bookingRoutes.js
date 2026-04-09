const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateToken } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { body } = require("express-validator");

router.post(
  "/",
  authenticateToken,
  body("destinationId").notEmpty().withMessage("Destination is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("travelers").isInt({ min: 1 }).withMessage("At least 1 traveler required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  validate,
  bookingController.createBooking
);

router.get("/", authenticateToken, bookingController.getUserBookings);
router.delete("/:id", authenticateToken, bookingController.deleteBooking);
router.get("/all", authenticateToken, bookingController.getAllBookingsDetailed);

module.exports = router;
