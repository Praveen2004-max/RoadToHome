const User = require("../Modules/user");
const Notification = require("../Modules/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

// Send notification to specific users
const sendUserNotification = async ({
  recipients,
  title,
  message,
  link = "/my-profile",
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
      type: "account",
      link,
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error("User Notification Error:", error.message);
  }
};

// Notify all admins
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
  try {
    const {
      fullName,
      email,
      phone,
      password,
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields!",
      });
    }

    const cleanFullName = String(fullName).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (!cleanFullName || !normalizedEmail || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid registration details.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      fullName: cleanFullName,
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashedPassword,
      profileImage: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    });

    // Welcome notification to newly registered user
    await sendUserNotification({
      recipients: [user._id],
      title: "Welcome to RoadToHome!",
      message: `Hello ${user.fullName}, welcome to RoadToHome. Your account has been created successfully.`,
      link: "/my-profile",
    });

    // Notify admins about new registration
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
    console.error("Sign Up Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
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

    // Generate JWT token
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
      message: error.message,
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
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Validate full name
    if (fullName !== undefined) {
      const cleanFullName = String(fullName).trim();

      if (!cleanFullName) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty.",
        });
      }

      user.fullName = cleanFullName;
    }

    // Validate and update email
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();

      if (!normalizedEmail) {
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
        return res.status(409).json({
          success: false,
          message: "This email is already registered.",
        });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (gender !== undefined) {
      user.gender = gender;
    }

    if (location !== undefined) {
      user.location = String(location).trim();
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    // Update profile image
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Notify user about profile update
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
    console.error("Update Profile Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
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