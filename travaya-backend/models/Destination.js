const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  type: [{
    type: String,
    enum: ["heritage", "nature", "popular", "adventure", "cultural", "spiritual"]
  }],
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Destination", destinationSchema);
