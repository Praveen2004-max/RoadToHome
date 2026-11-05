
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");

// Load environment variables
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const app = express();

// ===============================
// CORS
// ===============================

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS: " + origin)
      );
    },
    credentials: true,
  })
);

// ===============================
// Middleware
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Static Uploads
// ===============================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===============================
// Import Routes
// ===============================

const userRoutes = require("./Routes/userRoutes");
const propertyRoutes = require("./Routes/propertyRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const locationRoutes = require("./Routes/locationRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");

// ===============================
// API Routes
// ===============================

app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/notifications", notificationRoutes);

// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
  res.status(200).send("RoadToHome API is running successfully!");
});

// ===============================
// Health Check
// ===============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    databaseName: mongoose.connection.name || null,
  });
});

// ===============================
// MongoDB Atlas Connection
// ===============================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas Connected Successfully");
    console.log("Database:", mongoose.connection.name);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`RoadToHome Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    console.error("Error Name:", error.name);
    console.error("Error Cause:", error.cause?.message);
    console.error("Error Reason:", error.reason?.message);

    process.exit(1);
  }
};

startServer();