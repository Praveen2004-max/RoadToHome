
const express = require("express");
const router = express.Router();

// Controllers
const {
  addProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getMySingleProperty,
  getPropertyOverview,
  getFeaturedProperties,
  getLatestProperties,
  getPropertyCategories,
  getPopularLocations,
  toggleFeaturedProperty,
} = require("../Controllers/propertyController");

// Middleware
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// PUBLIC HOME PAGE ROUTES
// ========================================

router.get("/featured", getFeaturedProperties);

router.get("/latest", getLatestProperties);

router.get("/categories", getPropertyCategories);

router.get("/locations", getPopularLocations);

// ========================================
// USER PROPERTY ROUTES
// ========================================

// Get logged-in user's properties
router.get("/my-properties", protect, getMyProperties);

// Get one property belonging to logged-in user
router.get("/my-properties/:id", protect, getMySingleProperty);

// Add property (user/admin)
router.post(
  "/",
  protect,
  upload.array("images", 10),
  addProperty
);

// Update property (owner/admin authorization in controller)
router.put(
  "/:id",
  protect,
  upload.array("images", 10),
  updateProperty
);

// Delete property (owner/admin authorization in controller)
router.delete("/:id", protect, deleteProperty);

// ========================================
// ADMIN PROPERTY ROUTES
// ========================================

// Get pending properties
router.get(
  "/admin/pending",
  protect,
  adminOnly,
  getPendingProperties
);

// Approve property
router.patch(
  "/admin/:id/approve",
  protect,
  adminOnly,
  approveProperty
);

// Reject property
router.patch(
  "/admin/:id/reject",
  protect,
  adminOnly,
  rejectProperty
);

// Property overview
router.get(
  "/admin/overview",
  protect,
  adminOnly,
  getPropertyOverview
);

// Toggle featured property
router.patch(
  "/:id/featured",
  protect,
  adminOnly,
  toggleFeaturedProperty
);

// ========================================
// PUBLIC PROPERTY ROUTES
// ========================================

// Get all properties
router.get("/", getAllProperties);

// Get single property
router.get("/:id", getSingleProperty);

module.exports = router;