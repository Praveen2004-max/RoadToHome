
const User = require("../Modules/user");
const Notification = require("../Modules/Notification");
const cloudinary = require("../Config/cloudinary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// CLOUDINARY HELPERS
// ==========================================

// Get Cloudinary public ID from an uploaded file.
const getUploadedPublicId = (file) => {
  return file?.public_id || file?.filename || null;
};

// Extract public ID from a standard Cloudinary URL.
// Works for URLs without additional transformations.
const getCloudinaryPublicId = (imageUrl) => {
  if (
    typeof imageUrl !== "string" ||
    !imageUrl.includes("res.cloudinary.com")
  ) {
    return null;
  }

  try {
    const pathname = new URL(imageUrl).pathname;
    const marker = "/upload/";
    const index = pathname.indexOf(marker);

    if (index === -1) return null;

    let imagePath = pathname.substring(index + marker.length);

    imagePath = imagePath.replace(/^v\d+\//, "");
    imagePath = imagePath.replace(/\.[^/.]+$/, "");

    return imagePath || null;
  } catch {
    return null;
  }
};

// Delete Cloudinary image using public ID.
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary Image Delete Error:", error.message);
  }
};

// Clean up a newly uploaded image if request fails.
const cleanupUploadedImage = async (file) => {
  const publicId = getUploadedPublicId(file);

  if (publicId) {
    await deleteCloudinaryImage(publicId);
  }
};

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

const sendUserNotification = async ({
  recipients,
  title,
  message,
  link = "/my-profile",
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

    const notifications = uniqueRecipients.map((recipientId) => ({
      recipient: recipientId,
      title,
      message,
      type: "account",
      link,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("User Notification Error:", error.message);
  }
};

const notifyAdmins = async ({ title, message }) => {
  try {
    const admins = await User.find({
      role: "admin",
    })
      .select("_id")
      .lean();

    if (!admins.length) return;

    await sendUserNotification({
      recipients: admins.map((admin) => admin._id),
      title,
      message,
      link: "/dashboard/users",
    });
  } catch (error) {
    console.error("Admin Notification Error:", error.message);
  }
};

// ==========================================
// SIGN UP
// ==========================================

const signUP = async (req, res) => {
  const uploadedFile = req.file;

  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(400).json({
        success: false,
        message: "Please fill all required fields!",
      });
    }

    const cleanFullName = String(fullName).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (!cleanFullName || !normalizedEmail || !cleanPhone) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(400).json({
        success: false,
        message: "Please provide valid registration details.",
      });
    }

    if (String(password).length < 8) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (uploadedFile && !uploadedFile.path?.startsWith("https://")) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(400).json({
        success: false,
        message: "Profile image upload failed. Please try again.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: cleanFullName,
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashedPassword,
      profileImage: uploadedFile ? uploadedFile.path : "",
    });

    await sendUserNotification({
      recipients: [user._id],
      title: "Welcome to RoadToHome!",
      message: `Hello ${user.fullName}, welcome to RoadToHome. Your account has been created successfully.`,
      link: "/my-profile",
    });

    await notifyAdmins({
      title: "New User Registered",
      message: `${user.fullName} has created a new RoadToHome account.`,
    });

    return res.status(201).json({
      success: true,
      message: "Sign up successful.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    await cleanupUploadedImage(uploadedFile);

    console.error("Sign Up Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
      error: error.message,
    });
  }
};

// ==========================================
// SIGN IN
// ==========================================

const signIN = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Sign in successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Sign In Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in.",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY PROFILE
// ==========================================

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get My Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE MY PROFILE
// ==========================================

const updateMyProfile = async (req, res) => {
  const uploadedFile = req.file;
  let profileSaved = false;

  try {
    const {
      fullName,
      email,
      phone,
      gender,
      location,
      bio,
    } = req.body;

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      await cleanupUploadedImage(uploadedFile);

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update full name
    if (fullName !== undefined) {
      const cleanFullName = String(fullName).trim();

      if (!cleanFullName) {
        await cleanupUploadedImage(uploadedFile);

        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty.",
        });
      }

      user.fullName = cleanFullName;
    }

    // Update email
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();

      if (!normalizedEmail) {
        await cleanupUploadedImage(uploadedFile);

        return res.status(400).json({
          success: false,
          message: "Email cannot be empty.",
        });
      }

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        await cleanupUploadedImage(uploadedFile);

        return res.status(409).json({
          success: false,
          message: "This email is already registered.",
        });
      }

      user.email = normalizedEmail;
    }

    // Update phone (User Schema uses Number)
    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();

      if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
        await cleanupUploadedImage(uploadedFile);

        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit phone number.",
        });
      }

      user.phone = cleanPhone ? Number(cleanPhone) : undefined;
    }

    // Update gender
    if (gender !== undefined) {
      user.gender = gender;
    }

    // Update location
    if (location !== undefined) {
      user.location = String(location).trim();
    }

    // Update bio
    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    const oldProfileImage = user.profileImage;

    // Update Cloudinary image
    if (uploadedFile) {
      if (
        typeof uploadedFile.path !== "string" ||
        !uploadedFile.path.startsWith("https://")
      ) {
        await cleanupUploadedImage(uploadedFile);

        return res.status(400).json({
          success: false,
          message: "Profile image upload failed.",
        });
      }

      user.profileImage = uploadedFile.path;
    }

    // Save user
    await user.save();
    profileSaved = true;

    // Delete old image only after successful save
    if (
      uploadedFile &&
      oldProfileImage &&
      oldProfileImage !== user.profileImage
    ) {
      try {
        const oldPublicId = getCloudinaryPublicId(oldProfileImage);

        if (oldPublicId) {
          await deleteCloudinaryImage(oldPublicId);
        }
      } catch (imageError) {
        console.error(
          "Old Profile Image Delete Error:",
          imageError.message
        );
      }
    }

    // Send notification
    await sendUserNotification({
      recipients: [user._id],
      title: "Profile Updated",
      message: "Your RoadToHome profile has been updated successfully.",
      link: "/my-profile",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        location: user.location,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    // Do not delete the new image if profile was already saved.
    if (!profileSaved) {
      await cleanupUploadedImage(uploadedFile);
    }

    console.error("Update Profile Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET ALL REGISTERED USERS
// ==========================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "fullName userName email phone profileImage role createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  signUP,
  signIN,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
};