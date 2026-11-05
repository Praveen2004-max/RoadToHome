
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Upload,
  X,
  Home,
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  Ruler,
  Save,
  Image as ImageIcon,
} from "lucide-react";

import { addProperty } from "../../services/propertyService";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const amenityOptions = [
  "Parking",
  "Garden",
  "Swimming Pool",
  "Air Conditioning",
  "WiFi",
  "Gym",
  "Security",
  "Balcony",
  "Furnished",
  "Power Backup",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function AddProperty() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imagesRef = useRef([]);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    propertyType: "",
    listingType: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    amenities: [],
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signIn", {
        replace: true,
        state: { from: "/dashboard/properties/add" },
      });
    } else {
      setAuthChecking(false);
    }
  }, [navigate]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
  const selectedFiles = Array.from(e.target.files || []);

  if (!selectedFiles.length) return;

  if (images.length + selectedFiles.length > MAX_IMAGES) {
    setError(`You can upload maximum ${MAX_IMAGES} images.`);
    e.target.value = "";
    return;
  }

  const newImages = [];

  for (const file of selectedFiles) {
    if (!allowedTypes.includes(file.type)) {
      newImages.forEach((item) => URL.revokeObjectURL(item.preview));
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      newImages.forEach((item) => URL.revokeObjectURL(item.preview));
      setError(`${file.name} exceeds the 5 MB size limit.`);
      e.target.value = "";
      return;
    }

    newImages.push({
      file,
      preview: URL.createObjectURL(file),
    });
  }

  setImages((prev) => [...prev, ...newImages]);
  setError("");
  e.target.value = "";
};

const removeImage = (index) => {
  setImages((prev) => {
    const selectedImage = prev[index];

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
    }

    return prev.filter((_, i) => i !== index);
  });

  setError("");
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;

  if (!localStorage.getItem("token")) {
    navigate("/signIn", { replace: true });
    return;
  }

  if (!formData.name.trim()) {
    setError("Please enter property name.");
    return;
  }

  if (!formData.propertyType || !formData.listingType) {
    setError("Please select property category and listing type.");
    return;
  }

  if (!formData.price || Number(formData.price) <= 0) {
    setError("Please enter a valid property price.");
    return;
  }

  if (!formData.description.trim()) {
    setError("Please enter property description.");
    return;
  }

  if (!formData.area || Number(formData.area) <= 0) {
    setError("Please enter a valid property area.");
    return;
  }

  if (images.length === 0) {
    setError("Please upload at least one property image.");
    return;
  }

  const locationParts = formData.location
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (locationParts.length < 2) {
    setError("Please enter location in City, State format.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = new FormData();

    data.append("name", formData.name.trim());
    data.append("description", formData.description.trim());
    data.append("propertyType", formData.propertyType);
    data.append("listingType", formData.listingType);
    data.append("price", String(Number(formData.price)));
    data.append("bedrooms", String(Number(formData.bedrooms || 0)));
    data.append("bathrooms", String(Number(formData.bathrooms || 0)));

    data.append(
      "location",
      JSON.stringify({
        address: formData.location.trim(),
        city: locationParts[0],
        state: locationParts.slice(1).join(", "),
        country: "India",
        pincode: "",
      })
    );

    data.append(
      "area",
      JSON.stringify({
        value: Number(formData.area),
        unit: "sqft",
      })
    );

    data.append("amenities", JSON.stringify(formData.amenities));

    // Send original files to backend.
    // Backend Multer will upload them to Cloudinary.
    images.forEach(({ file }) => {
      data.append("images", file);
    });

    const response = await addProperty(data);

    console.log("Property added successfully:", response);

    alert("Property added successfully!");

    navigate("/dashboard/properties", {
      replace: true,
    });

  } catch (err) {
    console.error("Admin Add Property Error:", err);
    console.error("Backend Response:", err.response?.data);

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Unable to add property. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard/properties")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft size={18} />
          Back to Properties
        </button>

        <p className="text-sm font-medium text-emerald-700">
          ADMIN / PROPERTIES / ADD
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Add New Property
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter property details to create a new listing.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Home size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Basic Information
              </h2>
              <p className="text-sm text-slate-500">
                Property name, category and listing type
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Property Name" required>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Modern Luxury Villa"
                className={inputClass}
              />
            </FormField>

            <FormField label="Location (City, State)" required>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Jaipur, Rajasthan"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>

            <FormField label="Property Category" required>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select category</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Hotel">Hotel</option>
                <option value="Plot">Plot</option>
              </select>
            </FormField>

            <FormField label="Listing Type" required>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select listing type</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="For Buy">For Buy</option>
              </select>
            </FormField>

            <FormField label="Price (₹)" required>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter price"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="mb-6 text-lg font-bold text-slate-900">
            Property Details
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField label="Bedrooms">
              <div className="relative">
                <BedDouble size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="Bedrooms"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>

            <FormField label="Bathrooms">
              <div className="relative">
                <Bath size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="Bathrooms"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>

            <FormField label="Area (sq. ft.)" required>
              <div className="relative">
                <Ruler size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="area"
                  type="number"
                  min="1"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  placeholder="Area"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
          </div>

          <div className="mt-5">
            <FormField label="Description" required>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe the property..."
                className={`${inputClass} resize-y`}
              />
            </FormField>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 className="mb-2 text-lg font-bold text-slate-900">Amenities</h2>
          <p className="mb-5 text-sm text-slate-500">
            Select the amenities available at this property.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition ${
                  formData.amenities.includes(amenity)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="accent-emerald-600"
                />
                {amenity}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="mb-2 flex items-center gap-2">
            <ImageIcon className="text-emerald-600" size={22} />
            <h2 className="text-lg font-bold text-slate-900">
              Property Images
            </h2>
          </div>

          <p className="mb-5 text-sm text-slate-500">
            Upload up to 10 JPG, PNG or WEBP images. Maximum 5 MB per image.
          </p>

          {images.length > 0 && (
            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200"
                >
                  <img
                    src={item.preview}
                    alt={`Property ${index + 1}`}
                    className="h-36 w-full object-cover"
                  />

                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                    Image {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <Upload size={30} className="mb-3 text-emerald-600" />
              <span className="font-semibold text-slate-700">
                Click to upload images
              </span>
              <span className="mt-1 text-sm text-slate-500">
                Select multiple images from your device
              </span>
              <span className="mt-2 text-xs text-emerald-700">
                {images.length}/{MAX_IMAGES} images selected
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/properties")}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "Saving Property..." : "Save Property"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
