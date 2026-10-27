const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['lost', 'found'],
        message: '{VALUE} is not a valid item type',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Electronics',
          'Identity Cards',
          'Books & Stationery',
          'Bags & Accessories',
          'Clothing',
          'Keys',
          'Water Bottles',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters'],
    },
    dateOccurred: {
      type: Date,
      required: [true, 'Date occurred is required'],
      validate: {
        validator: function (value) {
          return !value || value <= new Date();
        },
        message: 'Date occurred cannot be in the future',
      },
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'resolved', 'returned', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting user is required'],
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ type: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ dateOccurred: -1 });
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
