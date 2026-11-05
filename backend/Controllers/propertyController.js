
const Property = require("../Modules/property");
const Notification = require("../Modules/Notification");
const User = require("../Modules/user");
const cloudinary = require("../Config/cloudinary");
const mongoose = require("mongoose");

// ==========================================
// COMMON HELPERS
// ==========================================

const parseField = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getUserId = (req) => req.user?.id || req.user?._id;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get Cloudinary public ID from a standard uploaded secure_url.
// This assumes URLs are stored as returned by Cloudinary upload_stream,
// without additional URL transformations.
const getCloudinaryPublicId = (imageUrl) => {
  if (typeof imageUrl !== "string" ||
      !imageUrl.includes("res.cloudinary.com")) {
    return null;
  }

  try {
    const pathname = new URL(imageUrl).pathname;
    const marker = "/upload/";
    const index = pathname.indexOf(marker);

    if (index === -1) return null;

    let imagePath = pathname.substring(index + marker.length);

    // Remove Cloudinary version prefix.
    imagePath = imagePath.replace(/^v\d+\//, "");

    // Remove file extension.
    imagePath = imagePath.replace(/\.[^/.]+$/, "");

    return imagePath || null;
  } catch {
    return null;
  }
};

// Delete Cloudinary images using their URLs.
const deleteCloudinaryImages = async (images = []) => {
  const publicIds = [
    ...new Set(
      images
        .map(getCloudinaryPublicId)
        .filter(Boolean)
    ),
  ];

  if (!publicIds.length) return;

  const results = await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      })
    )
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Cloudinary delete error:", result.reason);
    }
  });
};

// Delete newly uploaded files if a request fails.
const cleanupUploadedFiles = async (files = []) => {
  const publicIds = [
    ...new Set(
      files
        .map((file) => file.public_id || file.filename)
        .filter(Boolean)
    ),
  ];

  if (!publicIds.length) return;

  await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      })
    )
  );
};

// Notifications
const sendPropertyNotification = async ({
  recipients,
  title,
  message,
  link = "/my-properties",
}) => {
  try {
    if (!recipients?.length) return;

    const uniqueRecipients = [
      ...new Set(
        recipients
          .filter(Boolean)
          .map((id) => id.toString())
      ),
    ];

    if (!uniqueRecipients.length) return;

    await Notification.insertMany(
      uniqueRecipients.map((recipientId) => ({
        recipient: recipientId,
        title,
        message,
        type: "property",
        link,
      }))
    );
  } catch (error) {
    console.error("Property Notification Error:", error.message);
  }
};

const notifyAdmins = async ({ title, message, link }) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("_id")
      .lean();

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

// ==========================================
// ADD PROPERTY
// ==========================================

const addProperty = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const userId = getUserId(req);

    if (!userId || !isValidId(userId)) {
      await cleanupUploadedFiles(uploadedFiles);

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

    // IMPORTANT: Save Cloudinary HTTPS URLs, not local uploads paths.
    const images = uploadedFiles
      .map((file) => file.path)
      .filter((url) => typeof url === "string" && url.startsWith("https://"));

    if (
      !name?.trim() ||
      !description?.trim() ||
      !propertyType ||
      !listingType ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Please fill all required property details",
      });
    }

    if (
      !parsedLocation?.address?.trim?.() ||
      !parsedLocation?.city?.trim?.() ||
      !parsedLocation?.state?.trim?.()
    ) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Valid property location is required",
      });
    }

    if (!parsedArea?.value || Number(parsedArea.value) <= 0) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Valid property area is required",
      });
    }

    if (!Array.isArray(parsedAmenities)) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Invalid amenities data",
      });
    }

    if (!images.length) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Please upload at least one property image",
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
      amenities,
      images,
      owner: userId,
      approvalStatus: "Pending",
      rejectionReason: "",
      status: "Available",
    });

    await notifyAdmins({
      title: "New Property Submitted",
      message: `${property.name} has been submitted and is waiting for admin approval.`,
      link: "/dashboard/properties",
    });

    return res.status(201).json({
      success: true,
      message: "Property submitted for admin approval",
      property,
    });
  } catch (error) {
    await cleanupUploadedFiles(uploadedFiles);

    console.error("Add Property Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add property",
      error: error.message,
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

    if (!isValidId(id)) {
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
    const userId = getUserId(req);

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
// GET PENDING PROPERTIES - ADMIN
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
// APPROVE PROPERTY - ADMIN
// ==========================================

const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
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

    await sendPropertyNotification({
      recipients: [property.owner],
      title: "Property Approved",
      message: `Congratulations! Your property "${property.name}" has been approved and is now visible.`,
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
// REJECT PROPERTY - ADMIN
// ==========================================

const rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidId(id)) {
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
  const uploadedFiles = req.files || [];

  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Invalid Property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      await cleanupUploadedFiles(uploadedFiles);

      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    const userId = getUserId(req);

    const isOwner =
      property.owner.toString() === userId?.toString();

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      await cleanupUploadedFiles(uploadedFiles);

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
        await cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Invalid amenities data",
        });
      }

      property.amenities = parsedAmenities;
    }

    // Keep only images that already belong to this property.
    let existingImages = property.images || [];

    if (req.body.existingImages !== undefined) {
      const requestedImages = parseField(req.body.existingImages);

      if (!Array.isArray(requestedImages)) {
        await cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Invalid existing images data",
        });
      }

      existingImages = requestedImages.filter((url) =>
        property.images.includes(url)
      );
    }

    // New Cloudinary HTTPS URLs.
    const newImages = uploadedFiles
      .map((file) => file.path)
      .filter((url) => typeof url === "string" && url.startsWith("https://"));

    const oldImages = [...(property.images || [])];

    property.images = [...existingImages, ...newImages];

    if (isOwner && !isAdmin) {
      property.approvalStatus = "Pending";
      property.rejectionReason = "";
    }

    await property.save();

    // Delete removed images only after successful database save.
    const removedImages = oldImages.filter(
      (url) => !property.images.includes(url)
    );

    await deleteCloudinaryImages(removedImages);

    if (isOwner && !isAdmin) {
      await notifyAdmins({
        title: "Property Updated",
        message: `The owner has updated "${property.name}". It is waiting for admin approval.`,
        link: "/dashboard/properties",
      });
    } else {
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
    await cleanupUploadedFiles(uploadedFiles);

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

    if (!isValidId(id)) {
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

    const userId = getUserId(req);

    const isOwner =
      property.owner.toString() === userId?.toString();

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const ownerId = property.owner;
    const propertyName = property.name;
    const imagesToDelete = [...(property.images || [])];

    await Property.findByIdAndDelete(id);

    // Delete images after the property is deleted from MongoDB.
    await deleteCloudinaryImages(imagesToDelete);

    if (isAdmin) {
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
    console.error("Delete Property Error:", error);

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
    const userId = getUserId(req);

    if (!isValidId(id)) {
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

    const startDate =
      period === "This Year"
        ? new Date(now.getFullYear(), 0, 1)
        : new Date(now.getFullYear(), now.getMonth() - 5, 1);

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

    const monthCount = period === "This Year" ? 12 : 6;
    const chartData = [];

    for (let i = 0; i < monthCount; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );

      const found = monthlyProperties.find(
        (item) =>
          item._id.month === date.getMonth() + 1 &&
          item._id.year === date.getFullYear()
      );

      chartData.push({
        month: date.toLocaleString("en-IN", {
          month: "short",
        }),
        properties: found?.properties || 0,
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
          "location.city": {
            $exists: true,
            $ne: "",
          },
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
// TOGGLE FEATURED PROPERTY - ADMIN
// ==========================================

const toggleFeaturedProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (!isValidId(id)) {
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
  deleteCloudinaryImages,
};
