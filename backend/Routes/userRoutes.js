
const express = require("express");
const router = express.Router();

// Upload Middleware
const upload = require("../middleware/uploads");

// Controllers
const {
  signUP,
  signIN,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
} = require("../Controllers/userController");

// Authentication Middleware
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// User Signup
router.post(
  "/signUp",
  upload.single("profileImage"),
  signUP
);

// User Login
router.post("/signIn", signIN);

// ========================================
// USER PROFILE ROUTES
// ========================================

// Get logged-in user's profile
router.get(
  "/profile",
  protect,
  getMyProfile
);

// Update logged-in user's profile
router.put(
  "/profile",
  protect,
  upload.single("image"),
  updateMyProfile
);

// ========================================
// ADMIN ROUTES
// ========================================

// Get all registered users
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllUsers
);

module.exports = router;