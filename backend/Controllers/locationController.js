
const mongoose = require("mongoose");
const { Readable } = require("stream");

const Location = require("../Modules/location");
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const User = require("../Modules/user");
const cloudinary = require("../Config/cloudinary");

// ==========================================
// Cloudinary Upload Helper
// ==========================================

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("Image buffer not found. Use multer memoryStorage."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "gharfinder/locations",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

// ==========================================
// Notification Helper
// ==========================================

const notifyAllUsers = async ({
  title,
  message,
  link = "/properties",
}) => {
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
// Public: Active Locations
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
// Admin: Get All Locations
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
// Admin: Get Single Location
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
// Admin: Create Location
// ==========================================

const createLocation = async (req, res) => {
  try {
    const {
      city,
      state,
      country,
      description,
      displayOrder,
    } = req.body;

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

    // Upload image to Cloudinary
    const uploadedImage = await uploadToCloudinary(req.file);

    const location = await Location.create({
      city: city.trim(),
      state: state.trim(),
      country: country?.trim() || "India",
      description: description.trim(),

      // Cloudinary URL
      image: uploadedImage.secure_url,

      displayOrder: Number(displayOrder) || 0,
    });

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
// Admin: Update Location
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
      location.isActive =
        isActive === true || isActive === "true";
    }

    // Upload new image only when provided
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file);

      location.image = uploadedImage.secure_url;
    }

    await location.save();

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
// Admin: Delete Location
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