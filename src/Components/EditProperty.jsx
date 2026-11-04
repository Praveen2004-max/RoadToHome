import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    propertyType: "House",
    listingType: "For Sale",
    price: "",
    priceType: "Fixed",
    location: {
      address: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    area: {
      value: "",
      unit: "sqft",
    },
    furnishing: "Unfurnished",
    amenities: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const amenitiesList = [
    "Parking",
    "Swimming Pool",
    "Garden",
    "Gym",
    "Security",
    "Lift",
    "Air Conditioning",
    "Power Backup",
    "WiFi",
    "Balcony",
  ];

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);

        // Owner ki property fetch karne wala endpoint
        const response = await API.get(`/properties/my-properties/${id}`);

        const property = response.data.property || response.data;

        setFormData({
          name: property.name || "",
          description: property.description || "",
          propertyType: property.propertyType || "House",
          listingType: property.listingType || "For Sale",
          price: property.price || "",
          priceType: property.priceType || "Fixed",

          location: {
            address: property.location?.address || "",
            city: property.location?.city || "",
            state: property.location?.state || "",
            country: property.location?.country || "India",
            pincode: property.location?.pincode || "",
          },

          bedrooms: property.bedrooms ?? "",
          bathrooms: property.bathrooms ?? "",
          balconies: property.balconies ?? "",

          area: {
            value: property.area?.value ?? "",
            unit: property.area?.unit || "sqft",
          },

          furnishing: property.furnishing || "Unfurnished",
          amenities: property.amenities || [],
        });

        setExistingImages(property.images || []);
      } catch (err) {
        console.error("Property fetch error:", err);
        setError(
          err.response?.data?.message || "Unable to load property details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Normal input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Nested location and area handler
  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Amenities handler
  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // New images handler
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setNewImages((prev) => [...prev, ...selectedFiles]);

    // Same file ko dobara select karne ki permission
    e.target.value = "";
  };

  // Remove existing image from UI
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove newly selected image
  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit updated property
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!formData.name.trim() || !formData.description.trim()) {
        setError("Please enter property name and description.");
        return;
      }

      if (!formData.location.address || !formData.location.city ||
          !formData.location.state) {
        setError("Please complete property address, city and state.");
        return;
      }

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("propertyType", formData.propertyType);
      data.append("listingType", formData.listingType);
      data.append("price", formData.price);
      data.append("priceType", formData.priceType);

      data.append("location", JSON.stringify(formData.location));
      data.append("area", JSON.stringify({
        value: Number(formData.area.value),
        unit: formData.area.unit,
      }));

      data.append("bedrooms", formData.bedrooms);
      data.append("bathrooms", formData.bathrooms);
      data.append("balconies", formData.balconies);
      data.append("furnishing", formData.furnishing);
      data.append("amenities", JSON.stringify(formData.amenities));

      // Existing images jo user ne remove nahi ki
      data.append("existingImages", JSON.stringify(existingImages));

      // New images
      newImages.forEach((image) => {
        data.append("images", image);
      });

      await API.put(`/properties/${id}`, data);

      alert("Property updated successfully!");

      navigate("/my-properties");
    } catch (err) {
      console.error("Update property error:", err);

      setError(
        err.response?.data?.message || "Failed to update property."
      );
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (image) => {
    if (image.startsWith("http")) return image;
    return `http://localhost:5000${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin text-orange-500" size={35} />
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-900 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-xl shadow-sm hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Property
            </h1>
            <p className="text-gray-500 mt-1">
              Update your property information
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-9 space-y-8"
        >

          {error && (
            <p className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Basic Information */}
          <section>
            <h2 className="text-xl font-semibold mb-5">
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter property name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                >
                  {["House", "Villa", "Apartment", "Hotel", "Plot", "Commercial"].map(
                    (type) => (
                      <option key={type} value={type}>{type}</option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Listing Type
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                >
                  {["For Sale", "For Rent", "For Buy"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full border rounded-xl p-3"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Type
                </label>
                <select
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Negotiable">Negotiable</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
                className="w-full border rounded-xl p-3 resize-none"
                placeholder="Describe your property..."
              />
            </div>
          </section>

          <hr />

          {/* Location */}
          <section>
            <h2 className="text-xl font-semibold mb-5">
              Property Location
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {["address", "city", "state", "country", "pincode"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {field}
                    </label>
                    <input
                      value={formData.location[field]}
                      onChange={(e) =>
                        handleNestedChange("location", field, e.target.value)
                      }
                      required={["address", "city", "state"].includes(field)}
                      className="w-full border rounded-xl p-3"
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                )
              )}
            </div>
          </section>

          <hr />

          {/* Property Details */}
          <section>
            <h2 className="text-xl font-semibold mb-5">
              Property Details
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {["bedrooms", "bathrooms", "balconies"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {field}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Area
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.area.value}
                  onChange={(e) =>
                    handleNestedChange("area", "value", e.target.value)
                  }
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Area Unit
                </label>
                <select
                  value={formData.area.unit}
                  onChange={(e) =>
                    handleNestedChange("area", "unit", e.target.value)
                  }
                  className="w-full border rounded-xl p-3"
                >
                  <option value="sqft">Square Feet</option>
                  <option value="sqm">Square Meter</option>
                  <option value="sqyd">Square Yard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Furnishing
                </label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Furnished">Furnished</option>
                </select>
              </div>
            </div>
          </section>

          <hr />

          {/* Amenities */}
          <section>
            <h2 className="text-xl font-semibold mb-5">
              Amenities
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  className={`border rounded-xl p-3 flex items-center gap-2 cursor-pointer ${
                    formData.amenities.includes(amenity)
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </section>

          <hr />

          {/* Images */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Property Images
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Remove old images or upload new ones.
            </p>

            {existingImages.length > 0 && (
              <>
                <h3 className="font-medium mb-3">Existing Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {existingImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative">
                      <img
                        src={getImageUrl(image)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400">
              <Upload size={30} className="text-orange-500 mb-3" />
              <span className="font-medium">Upload New Images</span>
              <span className="text-sm text-gray-400 mt-1">
                JPG, PNG or WEBP
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {newImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {newImages.map((image, index) => (
                  <div key={`${image.name}-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 border border-gray-300 rounded-xl py-3 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoaderCircle className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;