const cloudinary = require("../Config/cloudinary");

const uploadToCloudinary = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Image buffer not found. Use multer memoryStorage.");
  }

  const base64Image = file.buffer.toString("base64");

  const dataURI = `data:${file.mimetype};base64,${base64Image}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "RoadToHome",
    resource_type: "image",
  });

  return result.secure_url;
};

module.exports = uploadToCloudinary;
