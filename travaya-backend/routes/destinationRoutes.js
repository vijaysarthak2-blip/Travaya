const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");

router.get("/", destinationController.getAllDestinations);
router.get("/:id", destinationController.getDestinationById);
router.get("/:id/itinerary", destinationController.getItineraryByDestinationId);

module.exports = router;
