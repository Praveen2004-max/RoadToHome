
const express = require("express");
const router = express.Router();

const {
    sendMessage,
    getMyConversations,
    getConversationById,
    replyToConversation,
    getAllConversations
} = require("../Controllers/messageController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

// User - Send property inquiry
router.post("/send", protect, sendMessage);

// User - Get own conversations
router.get("/my-conversations", protect, getMyConversations);

// Admin - Get all conversations
router.get("/all", protect, adminOnly, getAllConversations);

// Both - Open conversation
router.get("/conversation/:id", protect, getConversationById);

// Both - Reply to conversation
router.post("/reply/:id", protect, replyToConversation);

module.exports = router;