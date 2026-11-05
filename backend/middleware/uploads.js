
const multer = require("multer");
const cloudinary = require("../Config/cloudinary");

const storage = {
    _handleFile(req, file, cb) {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "RoadToHome",
                resource_type: "image",
                transformation: [
                    { width: 1200, height: 900, crop: "limit" },
                    { quality: "auto" },
                ],
            },
            (error, result) => {
                if (error) return cb(error);

                cb(null, {
                    path: result.secure_url,
                    filename: result.public_id,
                    public_id: result.public_id,
                    size: result.bytes,
                    mimetype: `image/${result.format}`,
                });
            }
        );

        file.stream.pipe(stream);
    },

    _removeFile(req, file, cb) {
        if (!file.public_id) return cb(null);

        cloudinary.uploader.destroy(
            file.public_id,
            { resource_type: "image" },
            (error) => cb(error)
        );
    },
};

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowed.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WEBP images are allowed"));
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
});