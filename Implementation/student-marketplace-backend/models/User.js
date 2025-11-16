const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  campus: { type: String, required: true },
  avatar: { type: String },
  needsPasswordChange: { type: Boolean, default: false }, // Flag for required password changes
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date, default: null },
  suspensionReason: { type: String, default: null },
  reportCount: { type: Number, default: 0 },
  // Rating system fields
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 },
  // Seller/buyer specific ratings
  sellerRating: { type: Number, default: 0, min: 0, max: 5 },
  buyerRating: { type: Number, default: 0, min: 0, max: 5 },
  sellerTransactions: { type: Number, default: 0 },
  buyerTransactions: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
