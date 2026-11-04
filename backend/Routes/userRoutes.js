
const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploads");

const {
    signUP,
    signIN,
    getMyProfile,
    updateMyProfile,
    getAllUsers
} = require("../Controllers/userController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// Authentication
router.post(
    "/signUp",
    upload.single("profileImage"),
    signUP
);

router.post("/signIn", signIN);

// User Profile
router.get("/profile", protect, getMyProfile);

router.put(
    "/profile",
    protect,
    upload.single("image"),
    updateMyProfile
);

// Admin - All Registered Users
router.get(
    "/admin/all",
    protect,
    adminOnly,
    getAllUsers
);

module.exports = router;
