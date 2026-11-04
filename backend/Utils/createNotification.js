const Notification = require("../Modules/Notification");

const createNotification = async ({
  recipient,
  title,
  message,
  type = "system",
  link = "",
}) => {
  try {
    if (!recipient || !title || !message) {
      throw new Error("Recipient, title and message are required.");
    }

    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

module.exports = createNotification;