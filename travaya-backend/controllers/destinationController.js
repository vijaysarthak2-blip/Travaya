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
