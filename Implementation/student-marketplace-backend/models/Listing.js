const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  photo: { type: String, default: null }, // Legacy base64 field (for backward compatibility)
  imageUrl: { type: String, default: null }, // New Cloudinary URL field
  cloudinaryId: { type: String, default: null }, // For image deletion if needed
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Listing", listingSchema);
