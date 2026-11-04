const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    // Property Basic Details
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    
    propertyType: {
      type: String,
      enum: ["House", "Villa", "Apartment", "Hotel", "Plot", "Commercial"],
      required: true,
    },

    listingType: {
      type: String,
      enum: ["For Sale", "For Rent", "For Buy"],
      required: true,
    },

    // Price Details
    price: {
      type: Number,
      required: true,
      min: 1,
    },

    priceType: {
      type: String,
      enum: ["Fixed", "Negotiable"],
      default: "Negotiable",
    },

    // Location Details
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        default: "India",
      },

      pincode: {
        type: String,
        default: "",
      },
    },

    // Property Specifications
    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    balconies: {
      type: Number,
      default: 0,
      min: 0,
    },

    area: {
      value: {
        type: Number,
        required: true,
        min: 1,
      },

      unit: {
        type: String,
        enum: ["sqft", "sqm", "sqyd"],
        default: "sqft",
      },
    },

    furnishing: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
      default: "Unfurnished",
    },

    // Amenities
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    // Property Images
    images: [
      {
        type: String,
      },
    ],

    // Property Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Property Availability
    status: {
      type: String,
      enum: ["Available", "Sold", "Rented"],
      default: "Available",
    },

    // Admin Approval System
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    // Admin Featured Property
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Property Views
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    timestamps: true,
  }
);

// Indexes for common property searches
propertySchema.index({
  approvalStatus: 1,
  status: 1,
  createdAt: -1,
});

propertySchema.index({
  "location.city": 1,
  propertyType: 1,
  listingType: 1,
});

module.exports = mongoose.model("Property", propertySchema);