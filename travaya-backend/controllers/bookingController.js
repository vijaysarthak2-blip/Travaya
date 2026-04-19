const Booking = require("../models/Booking");

exports.createBooking = async (req, res, next) => {
  try {
    const bookingDate = new Date(req.body.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      const error = new Error("Travel date cannot be in the past");
      error.status = 400;
      return next(error);
    }

    const Destination = require("../models/Destination");
    const destination = await Destination.findById(req.body.destinationId);
    if (!destination) {
      const error = new Error("Destination not found");
      error.status = 404;
      return next(error);
    }
    
    const totalAmount = destination.price * (req.body.travelers || 1);

    const booking = new Booking({
      ...req.body,
      userId: req.user.userId,
      totalAmount
    });
    await booking.save();
    res.status(201).json({ message: "Booking Successful", bookingId: booking._id });
  } catch (err) {
    next(err);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate('destinationId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.userId })
      .populate('destinationId', 'name state image price');
    if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      return next(error);
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      return next(error);
    }

    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      const error = new Error("Cannot cancel bookings for past dates");
      error.status = 400;
      return next(error);
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookingsDetailed = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate("destinationId", "name state image price")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
