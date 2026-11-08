
import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  Home,
  Ruler,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  UserRound,
  CheckCircle,
  X,
  Maximize2,
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSingleProperty } from "../../services/propertyService";
import WriteReview from "../../Components/WriteReview";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  const placeholder = "https://placehold.co/1200x800?text=Property+Image";

  if (!image) return placeholder;

  const imagePath =
    typeof image === "object"
      ? image.url || image.secure_url || image.path
      : image;

  if (!imagePath || typeof imagePath !== "string") return placeholder;

  if (
    imagePath.startsWith("https://") ||
    imagePath.startsWith("http://")
  ) {
    return imagePath.replace(
      "http://localhost:5000",
      IMAGE_BASE_URL
    );
  }

  return `${IMAGE_BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};

const getStatusStyle = (status) => {
  const value = String(status || "Pending").toLowerCase();

  if (value === "approved" || value === "active") {
    return "bg-green-100 text-green-700";
  }

  if (value === "rejected") {
    return "bg-red-100 text-red-700";
  }

  if (value === "pending") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (value === "available") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (value === "sold") {
    return "bg-gray-200 text-gray-700";
  }

  if (value === "rented") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-gray-100 text-gray-700";
};

const getPriceLabel = (listingType) => {
  const value = String(listingType || "").toLowerCase();

  if (value.includes("rent")) return "Per Month";
  if (value.includes("sale")) return "For Sale";
  if (value.includes("buy")) return "For Buy";

  return "Property Price";
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!/^[0-9a-fA-F]{24}$/.test(id || "")) {
        throw new Error("Invalid property ID");
      }

      const response = await getSingleProperty(id);

      const propertyData =
        response?.property ||
        response?.data?.property ||
        response?.data ||
        response;

      if (!propertyData?._id) {
        throw new Error("Property not found");
      }

      setProperty(propertyData);
      setActiveImage(0);
    } catch (err) {
      console.error("Property fetch error:", err);

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to load property details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const images =
    Array.isArray(property?.images) && property.images.length
      ? property.images.filter(Boolean)
      : property?.image
        ? [property.image]
        : [];

  const nextImage = useCallback(() => {
    if (!images.length) return;

    setActiveImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const previousImage = useCallback(() => {
    if (!images.length) return;

    setActiveImage(
      (prev) => (prev - 1 + images.length) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsFullscreen(false);
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, nextImage, previousImage]);

  const owner = property?.owner || property?.user || {};

  const phone = String(
    owner?.phone || property?.ownerPhone || ""
  ).replace(/\D/g, "");

  const whatsappNumber =
    phone.length === 10 ? `91${phone}` : phone;

  const location =
    typeof property?.location === "object"
      ? [
          property.location?.address,
          property.location?.city,
          property.location?.state,
        ]
            .filter(Boolean)
            .join(", ")
      : property?.location || property?.address || "Location not available";

  const price = Number(property?.price || 0);

  const amenities = Array.isArray(property?.amenities)
    ? property.amenities
        .map((item) =>
          typeof item === "string" ? item : item?.name
        )
        .filter(Boolean)
    : [];

  const ownerName =
    owner?.fullName || owner?.userName || "Property Owner";

  const ownerImage = getImageUrl(owner?.profileImage);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium">
          Loading property details...
        </p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <Home className="w-16 h-16 text-gray-300 mb-4" />

        <h2 className="text-2xl font-bold text-gray-800">
          Property Not Found
        </h2>

        <p className="text-gray-500 mt-2 text-center">
          {error || "The requested property could not be found."}
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={fetchProperty}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Back Button */}
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 transition"
        >
          <ArrowLeft size={19} />
          Back to Properties
        </Link>

        {/* Property Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {property.name || property.title || "Property Details"}
            </h1>

            <p className="flex items-center gap-2 text-gray-500 mt-2">
              <MapPin size={17} className="text-blue-600 shrink-0" />
              {location}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusStyle(
                property.approvalStatus || "Pending"
              )}`}
            >
              {property.approvalStatus || "Pending"}
            </span>

            {property.status && (
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusStyle(
                  property.status
                )}`}
              >
                {property.status}
              </span>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
          <div className="lg:col-span-3 relative h-[300px] sm:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden bg-gray-200 group">
            <img
              src={getImageUrl(images[activeImage])}
              alt={property.name || "Property"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/1200x800?text=Image+Unavailable";
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white p-3 rounded-xl shadow-lg transition"
              aria-label="View fullscreen"
            >
              <Maximize2 size={20} />
            </button>

            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {images.length ? activeImage + 1 : 0} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {images.slice(0, 3).map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative h-24 sm:h-28 lg:h-[157px] rounded-xl overflow-hidden border-2 transition ${
                  activeImage === index
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://placehold.co/500x350?text=Image";
                  }}
                />
              </button>
            ))}

            {images.length === 0 && (
              <div className="col-span-3 lg:col-span-1 h-24 lg:h-full rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                No images available
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Price */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    {getPriceLabel(property.listingType)}
                  </p>

                  <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-1">
                    <IndianRupee size={26} />
                    {price > 0
                      ? price.toLocaleString("en-IN")
                      : "Price on request"}
                  </h2>
                </div>

                <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold w-fit">
                  {property.listingType || "Property"}
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Property Overview
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Home size={22} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Type</p>
                    <p className="font-semibold text-gray-800">
                      {property.propertyType || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Bedrooms</p>
                    <p className="font-semibold text-gray-800">
                      {property.bedrooms ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Bath size={22} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Bathrooms</p>
                    <p className="font-semibold text-gray-800">
                      {property.bathrooms ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Ruler size={22} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Area</p>
                    <p className="font-semibold text-gray-800">
                      {property.area || property.size
                        ? `${property.area || property.size} ${
                            property.areaUnit || "sq.ft"
                          }`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About This Property
              </h2>

              <p className="text-gray-600 leading-8 whitespace-pre-line">
                {property.description ||
                  "No description available for this property."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Amenities & Facilities
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle
                        size={19}
                        className="text-green-600 shrink-0"
                      />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <WriteReview propertyId={property._id} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Owner Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Property Owner
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={ownerImage}
                  alt={ownerName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div>
                  <h3 className="font-bold text-gray-900">
                    {ownerName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Property Owner
                  </p>
                </div>
              </div>

              {phone ? (
                <div className="space-y-3">
                  <a
                    href={`tel:${phone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    <Phone size={19} />
                    Call Owner
                  </a>

                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                  >
                    <MessageCircle size={19} />
                    WhatsApp
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-3">
                  Owner contact details are not available.
                </p>
              )}
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Property Information
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Property ID</span>
                  <span className="font-medium text-gray-800 break-all text-right">
                    {property._id}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium text-gray-800">
                    {property.propertyType || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Listing Type</span>
                  <span className="font-medium text-gray-800">
                    {property.listingType || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {property.approvalStatus || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 text-white hover:text-red-400 transition"
            aria-label="Close fullscreen"
          >
            <X size={32} />
          </button>

          {images.length > 1 && (
            <button
              onClick={previousImage}
              className="absolute left-4 sm:left-8 text-white hover:text-blue-400 transition"
              aria-label="Previous image"
            >
              <ChevronLeft size={40} />
            </button>
          )}

          <img
            src={getImageUrl(images[activeImage])}
            alt={property.name || "Property"}
            className="max-w-full max-h-[85vh] object-contain"
          />

          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 sm:right-8 text-white hover:text-blue-400 transition"
              aria-label="Next image"
            >
              <ChevronRight size={40} />
            </button>
          )}

          <div className="absolute bottom-5 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;