
const mongoose = require("mongoose");

const Conversation = require("../Modules/Conversation");
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");

// ==========================================
// Get logged-in user ID
// ==========================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

// ==========================================
// Check admin role
// ==========================================

const isAdminUser = (req) => {
  return req.user?.role === "admin";
};

// ==========================================
// Notification Helper
// ==========================================

const sendMessageNotification = async ({
  recipients,
  senderId,
  propertyName,
  message,
}) => {
  try {
    if (!recipients || recipients.length === 0) return;

    // Remove sender and duplicate recipients
    const uniqueRecipients = [
      ...new Set(
        recipients
          .filter(Boolean)
          .map((id) => id.toString())
          .filter((id) => id !== senderId.toString())
      ),
    ];

    if (uniqueRecipients.length === 0) return;

    const notifications = uniqueRecipients.map((recipientId) => ({
      recipient: recipientId,
      title: "New Message Received",
      message: `${message} (Property: ${propertyName || "GharFinder"})`,
      type: "message",
      link: "/messages",
    }));

    await Notification.insertMany(notifications);

    console.log("Message notifications sent successfully");
  } catch (error) {
    // Notification failure must not stop message delivery
    console.error("Message Notification Error:", error.message);
  }
};

// ==========================================
// 1. Send new property inquiry
// ==========================================

const sendMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { propertyId, text } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!propertyId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Property ID and message are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId).select(
      "owner name"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const ownerId = property.owner;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Property owner is not configured",
      });
    }

    if (ownerId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message your own property",
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      property: propertyId,
      participants: {
        $all: [userId, ownerId],
        $size: 2,
      },
    });

    // Create new conversation if not found
    if (!conversation) {
      conversation = new Conversation({
        property: propertyId,
        participants: [userId, ownerId],
        messages: [],
      });
    }

    // Add message
    conversation.messages.push({
      sender: userId,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();

    await conversation.save();

    // Notify property owner
    await sendMessageNotification({
      recipients: [ownerId],
      senderId: userId,
      propertyName: property.name,
      message: "You have received a new property inquiry.",
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      conversation,
    });

  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// ==========================================
// 2. Get logged-in user's conversations
// ==========================================

const getMyConversations = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate(
        "participants",
        "fullName userName profileImage role"
      )
      .populate(
        "property",
        "name location price images"
      )
      .populate(
        "messages.sender",
        "fullName userName profileImage role"
      )
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      conversations,
    });

  } catch (error) {
    console.error("Get My Conversations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// ==========================================
// 3. Get single conversation
// ==========================================

const getConversationById = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const conversationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate(
        "participants",
        "fullName userName profileImage email role"
      )
      .populate(
        "property",
        "name location price images"
      )
      .populate(
        "messages.sender",
        "fullName userName profileImage role"
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if logged-in user is a participant
    const isParticipant = conversation.participants.some(
      (participant) =>
        participant._id.toString() === userId.toString()
    );

    // Admin can view all conversations
    const isAdmin = isAdminUser(req);

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this conversation",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    console.error("Get Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
};

// ==========================================
// 4. Reply to conversation
// ==========================================

const replyToConversation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { text } = req.body;
    const conversationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) =>
        participant.toString() === userId.toString()
    );

    const isAdmin = isAdminUser(req);

    // Only participants or admins can reply
    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reply",
      });
    }

    // Add reply
    conversation.messages.push({
      sender: userId,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();

    await conversation.save();

    // Get property name for notification
    const property = await Property.findById(
      conversation.property
    ).select("name");

    // Notify all other participants
    // If admin replies, all conversation participants are notified.
    await sendMessageNotification({
      recipients: conversation.participants,
      senderId: userId,
      propertyName: property?.name || "GharFinder",
      message: "You have received a new reply.",
    });

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully",
      conversation,
    });

  } catch (error) {
    console.error("Reply Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};

// ==========================================
// 5. Admin inbox - All conversations
// ==========================================

const getAllConversations = async (req, res) => {
  try {
    if (!isAdminUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    const conversations = await Conversation.find()
      .populate(
        "participants",
        "fullName userName email profileImage role"
      )
      .populate(
        "property",
        "name location price images"
      )
      .populate(
        "messages.sender",
        "fullName userName profileImage role"
      )
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      conversations,
    });

  } catch (error) {
    console.error("Admin Inbox Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin inbox",
      error: error.message,
    });
  }
};

// ==========================================
// Exports
// ==========================================

module.exports = {
  sendMessage,
  getMyConversations,
  getConversationById,
  replyToConversation,
  getAllConversations,
};