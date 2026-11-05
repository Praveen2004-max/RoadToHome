
import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) return "";

  image = image.trim();

  if (/^https?:\/\//i.test(image)) {
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const getConversationId = (conversation) =>
  conversation?._id || conversation?.id || null;

const getConversationList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.data?.conversations)) {
    return data.data.conversations;
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getConversationData = (data) =>
  data?.conversation ||
  data?.data?.conversation ||
  data?.data ||
  data;

const getUserId = (user) =>
  String(user?._id || user?.id || user || "");

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const currentUserId = getUserId(user);
  const isAdmin = user.role === "admin";

  const inboxEndpoint = isAdmin
    ? "/messages/all"
    : "/messages/my-conversations";

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(inboxEndpoint);
      const list = getConversationList(response.data);

      setConversations(list);

      // Keep selected conversation updated after inbox refresh.
      const selectedId = getConversationId(selectedConversation);

      if (selectedId) {
        const updatedSelected = list.find(
          (item) => getConversationId(item) === selectedId
        );

        if (updatedSelected) {
          setSelectedConversation((prev) => ({
            ...prev,
            ...updatedSelected,
          }));
        }
      }
    } catch (err) {
      console.error("Messages inbox error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Unable to load conversations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [inboxEndpoint, selectedConversation]);

  const openConversation = async (id) => {
    if (!id) {
      setError("Invalid conversation ID.");
      return;
    }

    try {
      setOpening(true);
      setError("");

      const response = await API.get(
        `/messages/conversation/${id}`
      );

      const conversation = getConversationData(response.data);

      if (!getConversationId(conversation)) {
        console.error("Invalid conversation response:", response.data);
        setError("Invalid conversation data received.");
        return;
      }

      setSelectedConversation(conversation);
    } catch (err) {
      console.error("Open conversation error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Unable to open this conversation."
      );
    } finally {
      setOpening(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const conversationId = getConversationId(selectedConversation);
    const text = message.trim();

    if (!conversationId || !text || sending) return;

    try {
      setSending(true);
      setError("");

      await API.post(`/messages/reply/${conversationId}`, { text });

      setMessage("");

      const conversationResponse = await API.get(
        `/messages/conversation/${conversationId}`
      );

      const updatedConversation = getConversationData(
        conversationResponse.data
      );

      setSelectedConversation(updatedConversation);

      const inboxResponse = await API.get(inboxEndpoint);

      setConversations(getConversationList(inboxResponse.data));
    } catch (err) {
      console.error("Send message error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Message could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [inboxEndpoint]);

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherParticipant = (conversation) => {
    const participants = conversation?.participants || [];

    return (
      participants.find(
        (participant) => getUserId(participant) !== currentUserId
      ) || participants[0]
    );
  };

  const totalMessages = conversations.reduce(
    (total, item) => total + (item.messages?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="animate-pulse text-gray-500">
          Loading messages...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Messages
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Manage all property inquiries."
              : "View your property conversations."}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConversations}
          disabled={loading}
          className="rounded-xl bg-black px-5 py-2.5 text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          Refresh Inbox
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Conversations
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {conversations.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Messages
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {totalMessages}
          </h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main Section */}
      <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-[350px_minmax(0,1fr)]">
        {/* Conversation List */}
        <div
          className={`border-r border-gray-200 ${
            selectedConversation ? "hidden lg:block" : "block"
          }`}
        >
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800">
              {isAdmin ? "All Conversations" : "My Conversations"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Property inquiries inbox
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {conversations.length === 0 ? (
              <p className="p-8 text-center text-gray-400">
                No conversations yet.
              </p>
            ) : (
              conversations.map((item) => {
                const itemId = getConversationId(item);
                const otherUser = getOtherParticipant(item);
                const selectedId = getConversationId(
                  selectedConversation
                );

                return (
                  <button
                    type="button"
                    key={itemId}
                    onClick={() => openConversation(itemId)}
                    className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                      selectedId === itemId
                        ? "border-l-4 border-orange-500 bg-orange-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100">
                        {otherUser?.profileImage ? (
                          <img
                            src={getImageUrl(otherUser.profileImage)}
                            alt={otherUser.fullName || "Profile"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="font-bold text-orange-600">
                            {(
                              otherUser?.fullName ||
                              otherUser?.userName ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-800">
                          {otherUser?.fullName ||
                            otherUser?.userName ||
                            "User"}
                        </h3>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {item.property?.name ||
                            item.property?.title ||
                            "Property Inquiry"}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {item.lastMessage || "No messages"}
                        </p>

                        <p className="mt-2 text-[10px] text-gray-400">
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
          className={`flex min-w-0 flex-col ${
            selectedConversation
              ? "block"
              : "hidden lg:flex"
          }`}
        >
          {!selectedConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-3xl">
                💬
              </div>

              <h2 className="mt-5 text-lg font-semibold text-gray-700">
                Welcome to Messages
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Select a conversation to view messages.
              </p>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="flex items-center gap-3 border-b border-gray-200 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="text-xl text-gray-600 lg:hidden"
                  aria-label="Back to conversations"
                >
                  ←
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  {(
                    getOtherParticipant(selectedConversation)?.fullName ||
                    getOtherParticipant(selectedConversation)?.userName ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-gray-800">
                    {getOtherParticipant(selectedConversation)?.fullName ||
                      getOtherParticipant(selectedConversation)?.userName ||
                      "Conversation"}
                  </h2>

                  <p className="truncate text-xs text-gray-500">
                    {selectedConversation.property?.name ||
                      selectedConversation.property?.title ||
                      "Property Inquiry"}
                  </p>
                </div>
              </div>

              {/* Property Information */}
              {selectedConversation.property && (
                <div className="m-4 rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-orange-600">
                    PROPERTY INQUIRY
                  </p>

                  <h3 className="mt-1 font-semibold text-gray-800">
                    {selectedConversation.property.name ||
                      selectedConversation.property.title}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {typeof selectedConversation.property.location ===
                    "object"
                      ? selectedConversation.property.location?.city
                      : selectedConversation.property.location}
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="max-h-[500px] min-h-[300px] flex-1 space-y-5 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                {opening ? (
                  <p className="text-center text-sm text-gray-400">
                    Loading conversation...
                  </p>
                ) : selectedConversation.messages?.length > 0 ? (
                  selectedConversation.messages.map((msg, index) => {
                    const sender = msg.sender;
                    const senderId = getUserId(sender);
                    const isOwnMessage =
                      senderId === currentUserId;

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${
                          isOwnMessage
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <p className="mb-1 text-xs text-gray-500">
                          {typeof sender === "object"
                            ? sender?.fullName ||
                              sender?.userName ||
                              "Participant"
                            : isOwnMessage
                              ? user.fullName || "You"
                              : "Participant"}
                        </p>

                        <div
                          className={`max-w-[85%] rounded-2xl border p-3 shadow-sm ${
                            isOwnMessage
                              ? "rounded-tr-sm border-orange-500 bg-orange-500 text-white"
                              : "rounded-tl-sm border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap text-sm">
                            {msg.text}
                          </p>

                          <p
                            className={`mt-2 text-right text-[10px] ${
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
                className="flex gap-3 border-t border-gray-200 p-4"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                />

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-white transition hover:bg-orange-600 disabled:opacity-50"
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