
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getReceivedBookings,
  updateBookingStatus,
  cancelMyBooking,
} = require("../Controllers/bookingController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");


// Customer booking routes
router.post("/", protect, createBooking);

router.get("/my-bookings", protect, getMyBookings);

router.patch("/:id/cancel", protect, cancelMyBooking);


// Property owner received bookings
router.get("/received", protect, getReceivedBookings);


// Admin and property owner status update
router.patch("/:id/status", protect, updateBookingStatus);


// Admin only
router.get("/", protect, adminOnly, getAllBookings);


module.exports = router;
