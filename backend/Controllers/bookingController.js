
const Booking = require("../Modules/Booking");
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const mongoose = require("mongoose");

// Safe notification helper
const sendNotification = async ({
  recipient,
  title,
  message,
  type = "system",
  link = "",
}) => {
  try {
    if (!recipient) return;

    await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
    });

  } catch (error) {
    // Notification failure should not break booking operations
    console.error("Booking Notification Error:", error.message);
  }
};

// CREATE BOOKING - Logged-in Customer
const createBooking = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const {
      propertyId,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      message,
    } = req.body;

    if (!propertyId || !guestName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required details",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (
      property.approvalStatus !== "Approved" ||
      property.status !== "Available"
    ) {
      return res.status(400).json({
        success: false,
        message: "This property is not available for booking",
      });
    }

    if (!property.owner) {
      return res.status(400).json({
        success: false,
        message: "Property owner information is missing",
      });
    }

    if (
      property.owner.toString() === req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot book your own property",
      });
    }

    if (property.listingType === "For Rent") {
      if (!checkIn || !checkOut) {
        return res.status(400).json({
          success: false,
          message: "Check-in and check-out dates are required",
        });
      }

      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate <= startDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid rental dates",
        });
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: property._id,
      owner: property.owner,
      guestName: guestName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      bookingType: property.listingType,
      checkIn: property.listingType === "For Rent" ? checkIn : null,
      checkOut: property.listingType === "For Rent" ? checkOut : null,
      guests: Number(guests) || 1,
      totalAmount: property.price,
      message: message || "",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "fullName userName email phone")
      .populate("property", "name price images location listingType")
      .populate("owner", "fullName email phone");

    
    // Notify Property Owner
    await sendNotification({
      recipient: property.owner,
      title: "New Booking Received",
      message: `${guestName} has requested a booking for ${property.name || "your property"}.`,
      type: "booking",
      link: "/dashboard/bookings",
    });  

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      booking: populatedBooking,
    });

  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Booking creation failed",
    });
  }
};


// GET ALL BOOKINGS - Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullName userName email phone")
      .populate("property", "name price images location listingType")
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error("Get All Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET BOOKINGS CREATED BY LOGGED-IN CUSTOMER
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("user", "fullName userName email phone")
      .populate("property", "name price images location listingType")
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error("Get My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET BOOKINGS RECEIVED BY PROPERTY OWNER
const getReceivedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      owner: req.user._id,
    })
      .populate("user", "fullName userName email phone")
      .populate("property", "name price images location listingType")
      .populate("owner", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error("Get Received Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE BOOKING STATUS - Admin OR Property Owner
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Confirmed",
      "Rejected",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isOwner =
      booking.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this booking",
      });
    }

    if (booking.status !== "Pending" && status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "This booking status cannot be changed",
      });
    }

    const previousStatus = booking.status;

    booking.status = status;

    await booking.save();

    // Notify customer only when status actually changes
    if (previousStatus !== status) {
      const notificationMessages = {
        Confirmed: "Your booking has been confirmed.",
        Rejected: "Your booking request has been rejected.",
        Completed: "Your booking has been marked as completed.",
      };

      await sendNotification({
        recipient: booking.user,
        title: `Booking ${status}`,
        message: notificationMessages[status],
        type: "booking",
        link: "/profile",
      });
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "fullName userName email phone")
      .populate("property", "name price images location listingType")
      .populate("owner", "fullName email phone");

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Update Booking Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// CANCEL BOOKING - Customer
const cancelMyBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.status === "Cancelled" ||
      booking.status === "Completed" ||
      booking.status === "Rejected"
    ) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled",
      });
    }

    booking.status = "Cancelled";
    booking.cancellationReason = cancellationReason || "";
    booking.cancelledAt = new Date();

    await booking.save();

    // Notify Property Owner
    await sendNotification({
      recipient: booking.owner,
      title: "Booking Cancelled",
      message: `${booking.guestName} has cancelled their booking.`,
      type: "booking",
      link: "/dashboard/bookings",
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });

  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getReceivedBookings,
  updateBookingStatus,
  cancelMyBooking,
};
