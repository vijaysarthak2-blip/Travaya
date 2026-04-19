const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");

const { authenticateToken } = require("../middleware/auth");

router.get("/", destinationController.getAllDestinations);
router.get("/:id", destinationController.getDestinationById);
router.get("/:id/itinerary", destinationController.getItineraryByDestinationId);

// Reviews
router.post("/:id/reviews", authenticateToken, destinationController.createReview);
router.get("/:id/reviews", destinationController.getReviews);

module.exports = router;
