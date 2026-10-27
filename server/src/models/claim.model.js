const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
      index: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required'],
      index: true,
    },
    verificationDetails: {
      type: String,
      required: [true, 'Verification details are required'],
      maxlength: [2000, 'Verification details cannot exceed 2000 characters'],
      select: false, // Excluded by default for privacy
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'withdrawn', 'closed'],
        message: '{VALUE} is not a valid claim status',
      },
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      maxlength: [500, 'Review note cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of a user's claim on an item
claimSchema.index({ item: 1, claimant: 1 });
// Compound index for item claim status queries
claimSchema.index({ item: 1, status: 1 });
claimSchema.index({ claimant: 1, createdAt: -1 });

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
