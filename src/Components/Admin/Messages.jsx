
import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    // Logged-in user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = String(user._id || user.id || "");
    const isAdmin = user.role === "admin";

    // Admin and User use different inbox APIs
    const inboxEndpoint = isAdmin
        ? "/messages/all"
        : "/messages/my-conversations";

    // Normalize conversation response
    const getConversationData = (data) => {
        return data?.conversation ||
            data?.data?.conversation ||
            data?.data ||
            data;
    };

    // Get conversation ID
    const getConversationId = (conversation) => {
        return conversation?._id || conversation?.id || null;
    };

    // Normalize inbox response
    const getConversationList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.conversations)) return data.conversations;
        if (Array.isArray(data?.data?.conversations)) {
            return data.data.conversations;
        }
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    // Fetch inbox
    const fetchConversations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get(inboxEndpoint);

            setConversations(getConversationList(response.data));

        } catch (error) {
            console.error(
                "Messages Error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load conversations"
            );
        } finally {
            setLoading(false);
        }
    };

    // Open conversation
    const openConversation = async (id) => {
        if (!id) {
            setError("Invalid conversation ID.");
            return;
        }

        try {
            setError("");

            const response = await API.get(
                `/messages/conversation/${id}`
            );

            const conversation = getConversationData(response.data);

            if (!getConversationId(conversation)) {
                setError("Invalid conversation data received.");
                console.error("Conversation response:", response.data);
                return;
            }

            setSelectedConversation(conversation);

        } catch (error) {
            console.error(
                "Open Conversation Error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Unable to open conversation"
            );
        }
    };

    // Send reply
    const handleSendMessage = async (e) => {
        e.preventDefault();

        const conversationId = getConversationId(selectedConversation);
        const text = message.trim();

        if (!conversationId || !text) return;

        try {
            setSending(true);
            setError("");

            await API.post(
                `/messages/reply/${conversationId}`,
                { text }
            );

            setMessage("");

            // Refresh selected conversation
            const conversationResponse = await API.get(
                `/messages/conversation/${conversationId}`
            );

            const updatedConversation = getConversationData(
                conversationResponse.data
            );

            setSelectedConversation(updatedConversation);

            // Refresh correct inbox for current role
            const inboxResponse = await API.get(inboxEndpoint);

            setConversations(
                getConversationList(inboxResponse.data)
            );

        } catch (error) {
            console.error(
                "Send Reply Error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Message could not be sent"
            );
        } finally {
            setSending(false);
        }
    };

    // Initial inbox load
    useEffect(() => {
        fetchConversations();
    }, [inboxEndpoint]);

    // Format date
    const formatDate = (date) => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "";

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Profile image URL
    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http")) return image;
        return `http://localhost:5000${image}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-gray-500 animate-pulse">
                    Loading messages...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Messages
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        {isAdmin
                            ? "Manage all property inquiries."
                            : "View your property conversations."}
                    </p>
                </div>

                <button
                    onClick={fetchConversations}
                    className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                    Refresh Inbox
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <p className="text-sm text-gray-500">
                        Total Conversations
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {conversations.length}
                    </h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <p className="text-sm text-gray-500">
                        Total Messages
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {conversations.reduce(
                            (total, item) =>
                                total + (item.messages?.length || 0),
                            0
                        )}
                    </h2>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[350px_minmax(0,1fr)] bg-white border border-gray-200 rounded-2xl overflow-hidden min-h-[600px]">

                {/* Conversation List */}
                <div
                    className={`border-r border-gray-200 ${
                        selectedConversation
                            ? "hidden lg:block"
                            : "block"
                    }`}
                >
                    <div className="p-5 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-800">
                            {isAdmin ? "All Conversations" : "My Conversations"}
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            Property inquiries inbox
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {conversations.length === 0 ? (
                            <p className="text-center text-gray-400 p-8">
                                No conversations yet.
                            </p>
                        ) : (
                            conversations.map((item) => {
                                const itemId = getConversationId(item);

                                // Find the other participant
                                const otherUser = item.participants?.find(
                                    (participant) => {
                                        const participantId = String(
                                            participant?._id || participant?.id || ""
                                        );

                                        return participantId !== currentUserId;
                                    }
                                ) || item.participants?.[0];

                                return (
                                    <button
                                        key={itemId}
                                        onClick={() => openConversation(itemId)}
                                        className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                                            getConversationId(selectedConversation) === itemId
                                                ? "bg-orange-50 border-l-4 border-orange-500"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {otherUser?.profileImage ? (
                                                    <img
                                                        src={getImageUrl(otherUser.profileImage)}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-orange-600">
                                                        {otherUser?.fullName?.charAt(0) || "U"}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm text-gray-800 truncate">
                                                    {otherUser?.fullName ||
                                                        otherUser?.userName ||
                                                        "User"}
                                                </h3>

                                                <p className="text-xs text-gray-500 truncate mt-1">
                                                    {item.property?.name ||
                                                        item.property?.title ||
                                                        "Property Inquiry"}
                                                </p>

                                                <p className="text-xs text-gray-400 truncate mt-1">
                                                    {item.lastMessage || "No messages"}
                                                </p>

                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {formatDate(item.lastMessageAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Conversation Details */}
                <div
                    className={`flex flex-col min-w-0 ${
                        selectedConversation
                            ? "block"
                            : "hidden lg:flex"
                    }`}
                >
                    {!selectedConversation ? (
                        <div className="flex flex-col justify-center items-center flex-1 text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-3xl">
                                💬
                            </div>

                            <h2 className="text-lg font-semibold text-gray-700 mt-5">
                                Welcome to Messages
                            </h2>

                            <p className="text-sm text-gray-400 mt-2">
                                Select a conversation to view messages.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Conversation Header */}
                            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="lg:hidden text-gray-600 text-xl"
                                >
                                    ←
                                </button>

                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                                    {selectedConversation.participants?.find(
                                        (participant) =>
                                            String(participant?._id || participant?.id) !== currentUserId
                                    )?.fullName?.charAt(0) || "U"}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="font-semibold text-gray-800">
                                        {selectedConversation.participants
                                            ?.map((participant) =>
                                                participant.fullName ||
                                                participant.userName
                                            )
                                            .filter(Boolean)
                                            .join(" & ") || "Conversation"}
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        {selectedConversation.property?.name ||
                                            selectedConversation.property?.title ||
                                            "Property Inquiry"}
                                    </p>
                                </div>
                            </div>

                            {/* Property Information */}
                            {selectedConversation.property && (
                                <div className="m-4 p-3 bg-orange-50 rounded-xl">
                                    <p className="text-xs text-orange-600 font-semibold">
                                        PROPERTY INQUIRY
                                    </p>

                                    <h3 className="font-semibold text-gray-800 mt-1">
                                        {selectedConversation.property.name ||
                                            selectedConversation.property.title}
                                    </h3>

                                    <p className="text-xs text-gray-500 mt-1">
                                        {typeof selectedConversation.property.location === "object"
                                            ? selectedConversation.property.location?.city
                                            : selectedConversation.property.location}
                                    </p>
                                </div>
                            )}

                            {/* Messages */}
                            <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50">
                                {selectedConversation.messages?.length > 0 ? (
                                    selectedConversation.messages.map((msg) => {
                                        const sender =
                                            typeof msg.sender === "object"
                                                ? msg.sender
                                                : null;

                                        const senderId = String(
                                            sender?._id || sender?.id || msg.sender || ""
                                        );

                                        const isOwnMessage =
                                            senderId === currentUserId;

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex flex-col ${
                                                    isOwnMessage
                                                        ? "items-end"
                                                        : "items-start"
                                                }`}
                                            >
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {sender?.fullName ||
                                                        sender?.userName ||
                                                        "Conversation participant"}
                                                </p>

                                                <div
                                                    className={`max-w-[85%] border rounded-2xl p-3 shadow-sm ${
                                                        isOwnMessage
                                                            ? "bg-orange-500 text-white border-orange-500 rounded-tr-sm"
                                                            : "bg-white text-gray-700 border-gray-200 rounded-tl-sm"
                                                    }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {msg.text}
                                                    </p>

                                                    <p
                                                        className={`text-[10px] mt-2 text-right ${
                                                            isOwnMessage
                                                                ? "text-orange-100"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {formatDate(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-400">
                                        No messages found.
                                    </p>
                                )}
                            </div>

                            {/* Reply Form */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-4 border-t border-gray-200 flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm"
                                />

                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    className="px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition"
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
