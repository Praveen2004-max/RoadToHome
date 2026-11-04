
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
    adminOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploads");


/* PUBLIC HOME PAGE ROUTES */

router.get("/featured", getFeaturedProperties);

router.get("/latest", getLatestProperties);

router.get("/categories", getPropertyCategories);

router.get("/locations", getPopularLocations);

// Existing public route
router.get("/", getAllProperties);


// PUBLIC ROUTES
router.get("/", getAllProperties);

// USER ROUTES
router.get("/my-properties", protect, getMyProperties);

router.post(
    "/",
    protect,
    upload.array("images", 10),
    addProperty
);

router.get(
    "/my-properties/:id",
    protect,
    getMySingleProperty
);

router.put(
    "/:id",
    protect,
    upload.array("images", 10),
    updateProperty
);

router.delete("/:id", protect, deleteProperty);

// ADMIN ROUTES
router.get(
    "/admin/pending",
    protect,
    adminOnly,
    getPendingProperties
);

router.patch(
    "/admin/:id/approve",
    protect,
    adminOnly,
    approveProperty
);

router.patch(
    "/admin/:id/reject",
    protect,
    adminOnly,
    rejectProperty
);

router.get(
    "/admin/overview",
    protect,
    adminOnly,
    getPropertyOverview
);

router.patch(
  "/:id/featured",
  protect,
  adminOnly,
  toggleFeaturedProperty
);

// SINGLE PROPERTY ROUTE
router.get("/:id", getSingleProperty);

module.exports = router;
