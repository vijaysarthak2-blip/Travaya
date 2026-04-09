const User = require("../models/User");
const Destination = require("../models/Destination");
const Booking = require("../models/Booking");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      const error = new Error("Invalid role");
      error.status = 400;
      return next(error);
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await Booking.deleteMany({ userId: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.createDestination = async (req, res, next) => {
  try {
    let imageUrl = req.body.image;
    
    // Handle base64 image upload
    if (req.body.image && req.body.image.startsWith('data:image/')) {
      const base64Data = req.body.image;
      const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1];
        const data = Buffer.from(matches[2], 'base64');
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
        const uploadPath = require('path').join(__dirname, '../uploads', filename);
        
        require('fs').writeFileSync(uploadPath, data);
        imageUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${filename}`;
      }
    } else if (req.file) {
      // Handle regular file upload
      imageUrl = `${process.env.FRONTEND_URL || 'http://localhost:5500'}/uploads/${req.file.filename}`;
    }

    const { state, name, description, price, type, itinerary } = req.body;
    const dest = new Destination({
      state, name, description, price,
      type: type ? type.split(',').map(s => s.trim()) : [],
      image: imageUrl
    });
    await dest.save();

    if (itinerary) {
      const parsedItinerary = JSON.parse(itinerary);
      if (parsedItinerary.length > 0) {
        const Itinerary = require('../models/Itinerary');
        const newItinerary = new Itinerary({
          destinationId: dest._id,
          days: parsedItinerary
        });
        await newItinerary.save();
      }
    }

    res.status(201).json(dest);
  } catch (err) {
    console.error('Create destination error:', err);
    console.error('Request body:', req.body);
    res.status(500).json({ error: err.message || 'Failed to create destination' });
  }
};

exports.updateDestination = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.body.type && typeof req.body.type === 'string') {
      updateData.type = req.body.type.split(',').map(s => s.trim());
    }
    
    // Handle base64 image upload
    if (req.body.image && req.body.image.startsWith('data:image/')) {
      const base64Data = req.body.image;
      const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1];
        const data = Buffer.from(matches[2], 'base64');
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
        const uploadPath = require('path').join(__dirname, '../uploads', filename);
        
        require('fs').writeFileSync(uploadPath, data);
        updateData.image = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${filename}`;
      }
    } else if (req.file) {
      // Handle regular file upload
      updateData.image = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }
    const dest = await Destination.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!dest) return res.status(404).json({ error: "Destination not found" });
    if (req.body.itinerary) {
      const parsedItinerary = JSON.parse(req.body.itinerary);
      const Itinerary = require('../models/Itinerary');
      if (parsedItinerary.length > 0) {
        // Upsert
        let itinDoc = await Itinerary.findOne({ destinationId: dest._id });
        if (itinDoc) {
          itinDoc.days = parsedItinerary;
          await itinDoc.save();
        } else {
          await new Itinerary({ destinationId: dest._id, days: parsedItinerary }).save();
        }
      } else {
        // Clear if 0 length
        await Itinerary.deleteOne({ destinationId: dest._id });
      }
    }

    res.json(dest);
  } catch (err) {
    console.error('Update destination error:', err);
    console.error('Request body:', req.body);
    res.status(500).json({ error: err.message || 'Failed to update destination' });
  }
};

exports.deleteDestination = async (req, res, next) => {
  try {
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });
    await Booking.deleteMany({ destinationId: dest._id });
    res.json({ message: "Destination deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName email")
      .populate("destinationId", "name state price")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, verifiedUsers, totalDests, totalBookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      Destination.countDocuments(),
      Booking.countDocuments()
    ]);

    // Complex Aggregations
    const bookingsByMonth = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 12 }
    ]);

    const popularDestinations = await Booking.aggregate([
      {
        $group: {
          _id: "$destinationId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "destinations",
          localField: "_id",
          foreignField: "_id",
          as: "destination"
        }
      },
      { $unwind: "$destination" },
      {
        $project: {
          name: "$destination.name",
          count: 1
        }
      }
    ]);

    // Calculate revenue (Dest price * travelers)
    const revenueData = await Booking.aggregate([
      {
        $lookup: {
          from: "destinations",
          localField: "destinationId",
          foreignField: "_id",
          as: "destination"
        }
      },
      { $unwind: "$destination" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$travelers", "$destination.price"] } }
        }
      }
    ]);

    res.json({
      overview: {
        users: totalUsers,
        verifiedUsers,
        destinations: totalDests,
        bookings: totalBookings,
        revenue: revenueData.length > 0 ? revenueData[0].total : 0
      },
      trends: bookingsByMonth,
      popularity: popularDestinations
    });
  } catch (err) {
    next(err);
  }
};
