
const multer = require("multer");
const cloudinary = require("../Config/cloudinary");

// ==========================================
// Cloudinary Custom Multer Storage
// ==========================================

const storage = {
  _handleFile(req, file, cb) {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "RoadToHome",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 900, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          return cb(error);
        }

        if (!result) {
          return cb(new Error("Cloudinary upload failed"));
        }

        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          public_id: result.public_id,
          size: result.bytes,
          mimetype: file.mimetype,
          format: result.format,
        });
      }
    );

    stream.on("error", (error) => {
      cb(error);
    });

    file.stream.on("error", (error) => {
      stream.destroy(error);
    });

    file.stream.pipe(stream);
  },

  _removeFile(req, file, cb) {
    if (!file.public_id) {
      return cb(null);
    }

    cloudinary.uploader.destroy(
      file.public_id,
      { resource_type: "image" },
      (error, result) => {
        if (error) return cb(error);
        cb(null, result);
      }
    );
  },
};

// ==========================================
// Image Validation
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, PNG and WEBP images are allowed"));
};

// ==========================================
// Multer Configuration
// ==========================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

module.exports = upload;