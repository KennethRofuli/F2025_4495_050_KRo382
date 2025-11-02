const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  // User being rated
  ratedUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // User giving the rating
  raterUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Associated listing/transaction
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  // Rating details
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  review: { 
    type: String, 
    maxlength: 500 
  },
  // Rating type (seller or buyer)
  ratingType: { 
    type: String, 
    enum: ['seller', 'buyer'], 
    required: true 
  },
  // Rating categories
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    reliability: { type: Number, min: 1, max: 5 },
    itemCondition: { type: Number, min: 1, max: 5 }, // For seller ratings
    timeliness: { type: Number, min: 1, max: 5 }
  },
  // Status
  isVisible: { 
    type: Boolean, 
    default: true 
  },
  // Prevent duplicate ratings
  transactionId: { 
    type: String, 
    unique: true 
  }
}, { timestamps: true });

// Compound index to prevent duplicate ratings for same transaction
ratingSchema.index({ ratedUser: 1, raterUser: 1, listing: 1 }, { unique: true });

// Method to calculate average rating for categories
ratingSchema.methods.getCategoryAverage = function() {
  const categories = this.categories;
  const validCategories = Object.values(categories).filter(val => val > 0);
  return validCategories.length > 0 
    ? validCategories.reduce((sum, val) => sum + val, 0) / validCategories.length 
    : this.rating;
};

module.exports = mongoose.model("Rating", ratingSchema);