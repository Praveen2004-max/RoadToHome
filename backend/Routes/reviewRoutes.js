
const express = require("express");
const router = express.Router();

const {
  createReview,
  getApprovedReviews,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
  deleteMyReview,
} = require("../Controllers/reviewController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public - Approved reviews
router.get("/", getApprovedReviews);

// Logged-in user routes
router.post("/", protect, createReview);
router.get("/my-reviews", protect, getMyReviews);
router.delete("/:id", protect, deleteMyReview);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllReviews);
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateReviewStatus
);

module.exports = router;
