
const mongoose = require("mongoose");

const Location = require("../Modules/location");
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const User = require("../Modules/user");
const cloudinary = require("../Config/cloudinary");

// ==========================================
// Cloudinary Delete Helper
// ==========================================

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      console.warn("Cloudinary delete result:", result);
    }
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
  }
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
// Public: Get Active Locations
// ==========================================

const getPublicLocations = async (req, res) => {
  try {
    const locations = await Location.find({
      isActive: true,
    })
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
    console.error("Get Public Locations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load locations",
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
      if (req.file?.public_id) {
        await deleteCloudinaryImage(req.file.public_id);
      }

      return res.status(400).json({
        success: false,
        message: "City, state and description are required",
      });
    }

    if (!req.file?.path || !req.file?.public_id) {
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

      // Already uploaded by Multer Cloudinary storage
      image: req.file.path,
      imagePublicId: req.file.public_id,

      displayOrder: Number(displayOrder) || 0,
    });

    await notifyAllUsers({
      title: "New Location Available!",
      message: `${location.city}, ${location.state} is now available on RoadToHome. Explore properties in this location.`,
      link: "/properties",
    });

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    // Remove newly uploaded image if database creation fails
    if (req.file?.public_id) {
      await deleteCloudinaryImage(req.file.public_id);
    }

    console.error("Create Location Error:", error);

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
  let newImageUploaded = false;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      if (req.file?.public_id) {
        await deleteCloudinaryImage(req.file.public_id);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid location ID",
      });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      if (req.file?.public_id) {
        await deleteCloudinaryImage(req.file.public_id);
      }

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

    if (city !== undefined) {
      if (!city.trim()) {
        throw new Error("City cannot be empty");
      }
      location.city = city.trim();
    }

    if (state !== undefined) {
      if (!state.trim()) {
        throw new Error("State cannot be empty");
      }
      location.state = state.trim();
    }

    if (country !== undefined) {
      location.country = country.trim();
    }

    if (description !== undefined) {
      location.description = description.trim();
    }

    if (displayOrder !== undefined) {
      const order = Number(displayOrder);

      if (!Number.isFinite(order)) {
        throw new Error("Invalid display order");
      }

      location.displayOrder = order;
    }

    if (isActive !== undefined) {
      location.isActive =
        isActive === true || isActive === "true";
    }

    // Save old public ID before replacing the image
    const oldImagePublicId = location.imagePublicId;

    // New image is already uploaded by Multer
    if (req.file) {
      if (!req.file.path || !req.file.public_id) {
        throw new Error("Cloudinary image upload failed");
      }

      newImageUploaded = true;

      location.image = req.file.path;
      location.imagePublicId = req.file.public_id;
    }

    await location.save();

    // Delete old image only after successful database save
    if (
      req.file &&
      oldImagePublicId &&
      oldImagePublicId !== req.file.public_id
    ) {
      await deleteCloudinaryImage(oldImagePublicId);
    }

    if (previousIsActive !== location.isActive) {
      await notifyAllUsers({
        title: location.isActive
          ? "Location Activated"
          : "Location Unavailable",

        message: location.isActive
          ? `${location.city}, ${location.state} is now available on RoadToHome.`
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
    // Clean up newly uploaded image if update fails
    if (newImageUploaded && req.file?.public_id) {
      await deleteCloudinaryImage(req.file.public_id);
    }

    console.error("Update Location Error:", error);

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

    // Delete Cloudinary image
    await deleteCloudinaryImage(location.imagePublicId);

    await notifyAllUsers({
      title: "Location Removed",
      message: `${location.city}, ${location.state} is no longer available on RoadToHome.`,
      link: "/properties",
    });

    return res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Delete Location Error:", error);

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