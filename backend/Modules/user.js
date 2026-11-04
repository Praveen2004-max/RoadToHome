const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, 
    },

    phone: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },

    profileImage: {
        type: String,
        default: ""
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);