const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });

// Ensure a user can only review a destination once (optional, but good practice)
reviewSchema.index({ destinationId: 1, userId: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(destinationId) {
    const stats = await this.aggregate([
        { $match: { destinationId } },
        { 
            $group: {
                _id: "$destinationId",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);
    
    if (stats.length > 0) {
        await mongoose.model("Destination").findByIdAndUpdate(destinationId, {
            reviewCount: stats[0].nRating,
            rating: stats[0].avgRating.toFixed(1)
        });
    } else {
        await mongoose.model("Destination").findByIdAndUpdate(destinationId, {
            reviewCount: 0,
            rating: 4.8 // fallback to default
        });
    }
};

// Post-save middleware
reviewSchema.post("save", function() {
    this.constructor.calculateAverageRating(this.destinationId);
});

// Post-remove/delete middleware (if needed later)
reviewSchema.post(/^findOneAnd/, async function(doc) {
    if(doc) {
        await doc.constructor.calculateAverageRating(doc.destinationId);
    }
});

module.exports = mongoose.model("Review", reviewSchema);
