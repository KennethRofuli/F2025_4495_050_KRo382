const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The seller
  reason: { 
    type: String, 
    required: true,
    enum: [
      'inappropriate_content',
      'spam',
      'scam_suspicious',
      'fake_listing',
      'offensive_language',
      'prohibited_item',
      'duplicate_listing',
      'other'
    ]
  },
  description: { type: String, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  adminNotes: { type: String, default: null },
  actionTaken: { 
    type: String, 
    enum: ['none', 'listing_removed', 'user_warned', 'user_suspended', 'user_banned'], 
    default: 'none' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ listing: 1 });

module.exports = mongoose.model("Report", reportSchema);