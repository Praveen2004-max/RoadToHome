const mongoose = require("mongoose");
const Review = require("../Modules/review");
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const User = require("../Modules/user");

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

// Send notification to specific users
const sendReviewNotification = async ({
  recipients,
  title,
  message,
  link = "/my-reviews",
}) => {
  try {
    if (!recipients || recipients.length === 0) return;

    const uniqueRecipients = [
      ...new Set(
        recipients
          .filter(Boolean)
          .map((id) => id.toString())
      ),
    ];

    if (!uniqueRecipients.length) return;

    const notifications = uniqueRecipients.map((recipientId) => ({
      recipient: recipientId,
      title,
      message,
      type: "property",
      link,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("Review Notification Error:", error.message);
  }
};

// Notify all admins
const notifyReviewAdmins = async ({ title, message }) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("_id")
      .lean();

    if (!admins.length) return;

    await sendReviewNotification({
      recipients: admins.map((admin) => admin._id),
      title,
      message,
      link: "/dashboard/reviews",
    });
  } catch (error) {
    console.error("Admin Review Notification Error:", error.message);
  }
};


// ==========================================
// SUBMIT REVIEW
// ==========================================

const createReview = async (req, res) => {
  try {
    const { propertyId, rating, title, comment } = req.body;

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!propertyId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all review details.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const cleanTitle = String(title).trim();
    const cleanComment = String(comment).trim();

    if (!cleanTitle || !cleanComment || cleanComment.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Title and a comment of at least 10 characters are required.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (String(property.owner) === String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot review your own property.",
      });
    }

    const review = await Review.create({
      user: userId,
      property: propertyId,
      rating: numericRating,
      title: cleanTitle,
      comment: cleanComment,
    });

    // Notify admins about new review
    await notifyReviewAdmins({
      title: "New Property Review",
      message: `A new ${numericRating}-star review has been submitted for "${property.name}" and is waiting for approval.`,
    });

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully. It is awaiting admin approval.",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this property.",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET APPROVED REVIEWS - PUBLIC
// ==========================================

const getApprovedReviews = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 6, 1),
      30
    );

    const reviews = await Review.find({
      status: "Approved",
    })
      .populate("user", "fullName profileImage")
      .populate("property", "name location")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get approved reviews error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET LOGGED-IN USER REVIEWS
// ==========================================

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const reviews = await Review.find({
      user: userId,
    })
      .populate("property", "name location images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// ADMIN - GET ALL REVIEWS
// ==========================================

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "fullName email profileImage")
      .populate("property", "name location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// ADMIN - UPDATE REVIEW STATUS
// ==========================================

const updateReviewStatus = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Approved or Rejected.",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const previousStatus = review.status;

    review.status = status;

    if (adminReply !== undefined) {
      review.adminReply = String(adminReply).trim();
    }

    await review.save();

    // Get property details for notification
    const property = await Property.findById(review.property)
      .select("name")
      .lean();

    const propertyName = property?.name || "your property";

    // Notify user only when status changes
    if (previousStatus !== status) {
      if (status === "Approved") {
        await sendReviewNotification({
          recipients: [review.user],
          title: "Review Approved",
          message: `Your review for "${propertyName}" has been approved and is now published.`,
          link: "/my-reviews",
        });
      }

      if (status === "Rejected") {
        const replyText = review.adminReply
          ? ` Admin reply: ${review.adminReply}`
          : "";

        await sendReviewNotification({
          recipients: [review.user],
          title: "Review Rejected",
          message: `Your review for "${propertyName}" was rejected.${replyText}`,
          link: "/my-reviews",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully.`,
      review,
    });
  } catch (error) {
    console.error("Update review status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// USER - DELETE OWN PENDING/REJECTED REVIEW
// ==========================================

const deleteMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOne({
      _id: id,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.status === "Approved") {
      return res.status(403).json({
        success: false,
        message: "Approved reviews cannot be deleted.",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createReview,
  getApprovedReviews,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
  deleteMyReview,
};