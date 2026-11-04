const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../Controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(protect);

// Get logged-in user's notifications
// GET /api/notifications
router.get("/", getMyNotifications);

// Mark all notifications as read
// PATCH /api/notifications/read-all
router.patch("/read-all", markAllNotificationsAsRead);

// Mark one notification as read
// PATCH /api/notifications/:id/read
router.patch("/:id/read", markNotificationAsRead);

// Delete notification
// DELETE /api/notifications/:id
router.delete("/:id", deleteNotification);

module.exports = router;