
const mongoose = require("mongoose");

const Location = require("../Modules/location");
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const User = require("../Modules/user");

// ==========================================
// Notification Helper
// ==========================================

const notifyAllUsers = async ({ title, message, link = "/properties" }) => {
  try {
    const users = await User.find().select("_id").lean();

    if (!users.length) return;

    const notifications = users.map((user) => ({
      recipient: user._id,
      title,
      message,
      type: "system",
      link,
    }));

    await Notification.insertMany(notifications);

    console.log("Location notifications sent successfully");
  } catch (error) {
    console.error("Location Notification Error:", error.message);
  }
};

// ==========================================
// Public: Active locations for homepage
// ==========================================

const getPublicLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .sort({ displayOrder: 1, city: 1 })
      .lean();

    const counts = await Property.aggregate([
      {
        $match: {
          approvalStatus: "Approved",
          status: "Available",
        },
      },
      {
        $group: {
          _id: {
            city: {
              $toLower: {
                $trim: { input: "$location.city" },
              },
            },
            state: {
              $toLower: {
                $trim: { input: "$location.state" },
              },
            },
          },
          propertyCount: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      counts.map((item) => [
        `${item._id.city}|${item._id.state}`,
        item.propertyCount,
      ])
    );

    const result = locations.map((location) => ({
      ...location,
      propertyCount:
        countMap.get(
          `${location.city.toLowerCase().trim()}|${location.state.toLowerCase().trim()}`
        ) || 0,
    }));

    return res.status(200).json({
      success: true,
      total: result.length,
      locations: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Admin: Get all locations
// ==========================================

const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: locations.length,
      locations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Admin: Get single location
// ==========================================

const getLocationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      location,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Admin: Create location
// ==========================================

const createLocation = async (req, res) => {
  try {
    const { city, state, country, description, displayOrder } = req.body;

    if (!city?.trim() || !state?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City, state and description are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Location image is required",
      });
    }

    const location = await Location.create({
      city: city.trim(),
      state: state.trim(),
      country: country?.trim() || "India",
      description: description.trim(),
      image: `/uploads/${req.file.filename}`,
      displayOrder: Number(displayOrder) || 0,
    });

    // Notify all registered users
    await notifyAllUsers({
      title: "New Location Available!",
      message: `${location.city}, ${location.state} is now available on GharFinder. Explore properties in this location.`,
      link: "/properties",
    });

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This city and state already exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Admin: Update location
// ==========================================

const updateLocation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const previousIsActive = location.isActive;

    const {
      city,
      state,
      country,
      description,
      displayOrder,
      isActive,
    } = req.body;

    if (city !== undefined) location.city = city.trim();
    if (state !== undefined) location.state = state.trim();
    if (country !== undefined) location.country = country.trim();
    if (description !== undefined) {
      location.description = description.trim();
    }

    if (displayOrder !== undefined) {
      location.displayOrder = Number(displayOrder) || 0;
    }

    if (isActive !== undefined) {
      location.isActive = isActive === true || isActive === "true";
    }

    if (req.file) {
      location.image = `/uploads/${req.file.filename}`;
    }

    await location.save();

    // Notify users only when active status changes
    if (previousIsActive !== location.isActive) {
      await notifyAllUsers({
        title: location.isActive
          ? "Location Activated"
          : "Location Unavailable",

        message: location.isActive
          ? `${location.city}, ${location.state} is now available on GharFinder.`
          : `${location.city}, ${location.state} is currently unavailable.`,

        link: "/properties",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This city and state already exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Admin: Delete location
// ==========================================

const deleteLocation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    await Location.findByIdAndDelete(req.params.id);

    // Notify all registered users
    await notifyAllUsers({
      title: "Location Removed",
      message: `${location.city}, ${location.state} is no longer available on GharFinder.`,
      link: "/properties",
    });

    return res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Exports
// ==========================================

module.exports = {
  getPublicLocations,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
