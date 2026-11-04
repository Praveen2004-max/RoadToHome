const express = require("express");
const router = express.Router();

const {
  getPublicLocations,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../Controllers/locationController");

const upload = require("../middleware/uploads");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public route
router.get("/", getPublicLocations);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllLocations);
router.get("/admin/:id", protect, adminOnly, getLocationById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createLocation
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateLocation
);

router.delete("/:id", protect, adminOnly, deleteLocation);

module.exports = router;