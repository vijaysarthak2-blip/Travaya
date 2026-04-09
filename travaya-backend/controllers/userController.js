const User = require("../models/User");
const Booking = require("../models/Booking");

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        const error = new Error("Email already in use");
        error.status = 409;
        return next(error);
      }
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    res.json({ message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Current password is incorrect");
      error.status = 401;
      return next(error);
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    await Booking.deleteMany({ userId: req.user.userId });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};
