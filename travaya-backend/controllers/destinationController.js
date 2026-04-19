const Destination = require("../models/Destination");
const Itinerary = require("../models/Itinerary");
const seedData = require("../seedData");

exports.getAllDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    next(err);
  }
};

exports.getDestinationById = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      const error = new Error("Destination not found");
      error.status = 404;
      return next(error);
    }
    res.json(destination);
  } catch (err) {
    next(err);
  }
};

exports.seedDestinations = async (req, res, next) => {
  try {
    await Destination.deleteMany();
    await Destination.insertMany(seedData);
    res.json({ message: "All destinations inserted" });
  } catch (err) {
    next(err);
  }
};

exports.getItineraryByDestinationId = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      destinationId: req.params.id,
    });
    res.json(itinerary || { days: [] });
  } catch (err) {
    next(err);
  }
};

exports.seedItineraries = async (req, res, next) => {
  try {
    await Itinerary.deleteMany();
    const destinations = await Destination.find();
    const itineraries = destinations.map((dest) => ({
      destinationId: dest._id.toString(),
      days: [
        { day: 1, title: "Arrival & City Tour", description: `Arrival at ${dest.name}. Local sightseeing and hotel check-in.` },
        { day: 2, title: "Explore Attractions", description: `Visit famous places in ${dest.name}.` },
        { day: 3, title: "Departure", description: "Shopping and departure." }
      ]
    }));
    await Itinerary.insertMany(itineraries);
    res.json({ message: "Dummy itineraries inserted" });
  } catch (err) {
    next(err);
  }
};

const Review = require("../models/Review");

exports.createReview = async (req, res, next) => {
    try {
        const destinationId = req.params.id;
        const userId = req.user.id;
        const { rating, reviewText } = req.body;

        const bookingExists = await require("../models/Booking").findOne({
            userId,
            destinationId,
            paymentStatus: { $in: ["completed", "success"] }
        });

        if (!bookingExists) {
            return res.status(403).json({ error: "Only verified travelers can leave a review." });
        }

        const newReview = await Review.create({
            destinationId,
            userId,
            rating,
            reviewText
        });

        res.status(201).json(newReview);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "You have already reviewed this destination." });
        }
        next(err);
    }
};

exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ destinationId: req.params.id })
            .populate("userId", "fullName")
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        next(err);
    }
};
