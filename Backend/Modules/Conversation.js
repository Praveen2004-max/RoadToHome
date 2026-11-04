
const mongoose = require("mongoose");

// Individual message schema
const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Conversation schema
const conversationSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        messages: [messageSchema],

        lastMessage: {
            type: String,
            default: ""
        },

        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Indexes
conversationSchema.index({
    participants: 1,
    lastMessageAt: -1
});

conversationSchema.index({
    property: 1,
    participants: 1
});

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);
