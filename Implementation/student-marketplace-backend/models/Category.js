const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  icon: { 
    type: String, 
    required: true,
    default: '📦'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  // AI Pricing Configuration
  aiConfig: {
    seasonalMultiplier: {
      Fall: { type: Number, default: 1.0 },
      Spring: { type: Number, default: 1.0 },
      Summer: { type: Number, default: 1.0 }
    },
    retentionRate: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    avgDepreciationPerMonth: {
      type: Number,
      default: 0.03,
      min: 0,
      max: 1
    }
  },
  // Metadata
  description: {
    type: String,
    default: ''
  },
  keywords: [{
    type: String,
    lowercase: true
  }]
}, { 
  timestamps: true 
});

// Index for performance (name index created automatically by unique: true)
categorySchema.index({ active: 1, displayOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);