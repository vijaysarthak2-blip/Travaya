const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
    required: true
  },
  days: [
    {
      day: {
        type: Number,
        required: true,
        min: 1
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Itinerary", itinerarySchema);
