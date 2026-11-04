const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const User = require("../Modules/user");
const mongoose = require("mongoose");

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

// Send notification to specific users
const sendPropertyNotification = async ({
  recipients,
  title,
  message,
  link = "/my-properties",
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
    console.error("Property Notification Error:", error.message);
  }
};

// Send notification to all admins
const notifyAdmins = async ({ title, message, link }) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("_id")
      .lean();

    if (!admins.length) return;

    await sendPropertyNotification({
      recipients: admins.map((admin) => admin._id),
      title,
      message,
      link: link || "/dashboard/properties",
    });
  } catch (error) {
    console.error("Admin Notification Error:", error.message);
  }
};


// Parse JSON data received through FormData
const parseField = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};


// ==========================================
// ADD PROPERTY
// ==========================================

const addProperty = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const {
      name,
      description,
      propertyType,
      listingType,
      price,
      priceType,
      location,
      bedrooms,
      bathrooms,
      balconies,
      area,
      furnishing,
      amenities,
    } = req.body;

    const parsedLocation = parseField(location);
    const parsedArea = parseField(area);
    const parsedAmenities = parseField(amenities);

    const images = (req.files || []).map(
      (file) => `/uploads/${file.filename}`
    );

    if (
      !name?.trim() ||
      !description?.trim() ||
      !propertyType ||
      !listingType ||
      price === undefined ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required property details",
      });
    }

    if (
      !parsedLocation?.city ||
      !parsedLocation?.state ||
      !parsedLocation?.address
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid property location is required",
      });
    }

    if (!parsedArea?.value || Number(parsedArea.value) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid property area is required",
      });
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one property image",
      });
    }

    const ownerId = req.user.id || req.user._id;

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid logged-in user",
      });
    }

    const property = await Property.create({
      name: name.trim(),
      description: description.trim(),
      propertyType,
      listingType,
      price: Number(price),
      priceType: priceType || "Negotiable",
      location: parsedLocation,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      balconies: Number(balconies) || 0,
      area: parsedArea,
      furnishing: furnishing || "Unfurnished",
      amenities: Array.isArray(parsedAmenities)
        ? parsedAmenities
        : [],
      images,
      owner: ownerId,

      approvalStatus: "Pending",
      rejectionReason: "",
      status: "Available",
    });

    // Notify admins about new property
    await notifyAdmins({
      title: "New Property Submitted",
      message: `${name.trim()} has been submitted and is waiting for admin approval.`,
      link: "/dashboard/properties",
    });

    return res.status(201).json({
      success: true,
      message: "Property submitted for admin approval",
      property,
    });
  } catch (error) {
    console.error("Add Property Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ALL PUBLIC PROPERTIES
// ==========================================

const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
    } = req.query;

    const filter = {
      approvalStatus: "Approved",
      status: "Available",
    };

    if (city) {
      filter["location.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;

    if (bedrooms) {
      filter.bedrooms = Number(bedrooms);
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate("owner", "fullName userName phone profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get Properties Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET SINGLE PUBLIC PROPERTY
// ==========================================

const getSingleProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    const property = await Property.findOne({
      _id: id,
      approvalStatus: "Approved",
      status: "Available",
    }).populate(
      "owner",
      "fullName userName email phone profileImage"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    property.views = (property.views || 0) + 1;
    await property.save();

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET MY PROPERTIES
// ==========================================

const getMyProperties = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const properties = await Property.find({
      owner: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET PENDING PROPERTIES (ADMIN)
// ==========================================

const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      approvalStatus: "Pending",
    })
      .populate("owner", "fullName userName email phone profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// APPROVE PROPERTY (ADMIN)
// ==========================================

const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    property.approvalStatus = "Approved";
    property.rejectionReason = "";

    await property.save();

    // Notify property owner
    await sendPropertyNotification({
      recipients: [property.owner],
      title: "Property Approved",
      message: `Congratulations! Your property "${property.name}" has been approved and is now visible on GharFinder.`,
      link: "/my-properties",
    });

    return res.status(200).json({
      success: true,
      message: "Property Approved Successfully",
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// REJECT PROPERTY (ADMIN)
// ==========================================

const rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    property.approvalStatus = "Rejected";
    property.rejectionReason = reason.trim();

    await property.save();

    // Notify property owner with rejection reason
    await sendPropertyNotification({
      recipients: [property.owner],
      title: "Property Rejected",
      message: `Your property "${property.name}" was rejected. Reason: ${reason.trim()}`,
      link: "/my-properties",
    });

    return res.status(200).json({
      success: true,
      message: "Property Rejected",
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// UPDATE PROPERTY
// ==========================================

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    const userId = req.user?.id || req.user?._id;

    if (
      property.owner.toString() !== userId?.toString() &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "propertyType",
      "listingType",
      "price",
      "priceType",
      "bedrooms",
      "bathrooms",
      "balconies",
      "furnishing",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] =
          field === "price"
            ? Number(req.body[field])
            : req.body[field];
      }
    });

    if (req.body.location !== undefined) {
      property.location = parseField(req.body.location);
    }

    if (req.body.area !== undefined) {
      property.area = parseField(req.body.area);
    }

    if (req.body.amenities !== undefined) {
      const parsedAmenities = parseField(req.body.amenities);

      if (!Array.isArray(parsedAmenities)) {
        return res.status(400).json({
          success: false,
          message: "Invalid amenities data",
        });
      }

      property.amenities = parsedAmenities;
    }

    // Handle existing and new images
    let existingImages = property.images || [];

    if (req.body.existingImages !== undefined) {
      existingImages = parseField(req.body.existingImages);

      if (!Array.isArray(existingImages)) {
        return res.status(400).json({
          success: false,
          message: "Invalid existing images data",
        });
      }
    }

    const newImages = req.files?.length
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    property.images = [...existingImages, ...newImages];

    // Owner edits require fresh admin approval
    if (req.user?.role !== "admin") {
      property.approvalStatus = "Pending";
      property.rejectionReason = "";

      await property.save();

      // Notify admins about edited property
      await notifyAdmins({
        title: "Property Updated",
        message: `The owner has updated "${property.name}". It is waiting for admin approval.`,
        link: "/dashboard/properties",
      });
    } else {
      await property.save();

      // Notify owner if admin updates the property
      await sendPropertyNotification({
        recipients: [property.owner],
        title: "Property Updated By Admin",
        message: `Your property "${property.name}" has been updated by the admin.`,
        link: "/my-properties",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property Updated Successfully",
      property,
    });
  } catch (error) {
    console.error("Update Property Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// DELETE PROPERTY
// ==========================================

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    const userId = req.user?.id || req.user?._id;

    if (
      property.owner.toString() !== userId?.toString() &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const ownerId = property.owner;
    const propertyName = property.name;

    await Property.findByIdAndDelete(id);

    // Notify owner when admin deletes their property
    if (req.user?.role === "admin") {
      await sendPropertyNotification({
        recipients: [ownerId],
        title: "Property Deleted",
        message: `Your property "${propertyName}" has been deleted by the admin.`,
        link: "/my-properties",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET SINGLE PROPERTY OF LOGGED-IN OWNER
// ==========================================

const getMySingleProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    const property = await Property.findOne({
      _id: id,
      owner: userId,
    }).populate(
      "owner",
      "fullName userName email phone profileImage"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// ADMIN DASHBOARD - PROPERTY OVERVIEW
// ==========================================

const getPropertyOverview = async (req, res) => {
  try {
    const period = req.query.period || "6 Months";
    const now = new Date();

    let startDate;

    if (period === "This Year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1
      );
    }

    const [
      totalProperties,
      approvedProperties,
      pendingProperties,
      rejectedProperties,
      totalViews,
      recentProperties,
      monthlyProperties,
    ] = await Promise.all([
      Property.countDocuments(),

      Property.countDocuments({
        approvalStatus: "Approved",
      }),

      Property.countDocuments({
        approvalStatus: "Pending",
      }),

      Property.countDocuments({
        approvalStatus: "Rejected",
      }),

      Property.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$views" },
          },
        },
      ]),

      Property.find()
        .populate("owner", "fullName userName email")
        .sort({ createdAt: -1 })
        .limit(5),

      Property.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: now,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            properties: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
    ]);

    const chartData = [];
    const monthCount = period === "This Year" ? 12 : 6;

    for (let i = 0; i < monthCount; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );

      const monthNumber = date.getMonth() + 1;
      const year = date.getFullYear();

      const found = monthlyProperties.find(
        (item) =>
          item._id.month === monthNumber &&
          item._id.year === year
      );

      chartData.push({
        month: date.toLocaleString("en-IN", {
          month: "short",
        }),
        properties: found ? found.properties : 0,
      });
    }

    return res.status(200).json({
      success: true,
      overview: {
        stats: {
          totalProperties,
          approvedProperties,
          pendingProperties,
          rejectedProperties,
          totalViews: totalViews[0]?.total || 0,
        },
        chartData,
        recentProperties,
      },
    });
  } catch (error) {
    console.error("Property Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load property overview",
      error: error.message,
    });
  }
};


// ==========================================
// GET FEATURED PROPERTIES
// ==========================================

const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      approvalStatus: "Approved",
      status: "Available",
      isFeatured: true,
    })
      .populate("owner", "fullName phone profileImage")
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET LATEST PROPERTIES
// ==========================================

const getLatestProperties = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 6, 1),
      24
    );

    const properties = await Property.find({
      approvalStatus: "Approved",
      status: "Available",
    })
      .populate("owner", "fullName phone profileImage")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      total: properties.length,
      properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET PROPERTY CATEGORY COUNTS
// ==========================================

const getPropertyCategories = async (req, res) => {
  try {
    const categories = await Property.aggregate([
      {
        $match: {
          approvalStatus: "Approved",
          status: "Available",
        },
      },
      {
        $group: {
          _id: "$propertyType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      categories: categories.map((item) => ({
        name: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET POPULAR LOCATIONS
// ==========================================

const getPopularLocations = async (req, res) => {
  try {
    const locations = await Property.aggregate([
      {
        $match: {
          approvalStatus: "Approved",
          status: "Available",
          "location.city": { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$location.city",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 6,
      },
    ]);

    return res.status(200).json({
      success: true,
      locations: locations.map((item) => ({
        city: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// TOGGLE FEATURED PROPERTY (ADMIN)
// ==========================================

const toggleFeaturedProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be true or false",
      });
    }

    const property = await Property.findById(id);

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
        message: "Only approved and available properties can be featured",
      });
    }

    property.isFeatured = isFeatured;
    await property.save();

    // Notify property owner
    await sendPropertyNotification({
      recipients: [property.owner],
      title: isFeatured
        ? "Property Featured"
        : "Property Removed From Featured",
      message: isFeatured
        ? `Your property "${property.name}" has been added to Featured Properties.`
        : `Your property "${property.name}" has been removed from Featured Properties.`,
      link: "/my-properties",
    });

    return res.status(200).json({
      success: true,
      message: isFeatured
        ? "Property added to Featured"
        : "Property removed from Featured",
      property,
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
  addProperty,
  getAllProperties,
  getSingleProperty,
  getMyProperties,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  updateProperty,
  deleteProperty,
  getMySingleProperty,
  getPropertyOverview,
  getFeaturedProperties,
  getLatestProperties,
  getPropertyCategories,
  getPopularLocations,
  toggleFeaturedProperty,
};