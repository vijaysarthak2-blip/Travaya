const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const adminController = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(authenticateToken);
router.use(requireAdmin);

// User Management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

// Destination Management
router.post("/destinations", adminController.createDestination);
router.put("/destinations/:id", adminController.updateDestination);
router.delete("/destinations/:id", adminController.deleteDestination);

// Booking Management
router.get("/bookings", adminController.getAllBookings);
router.delete("/bookings/:id", adminController.deleteBooking);

// Analytics
router.get("/stats", adminController.getStats);

module.exports = router;
