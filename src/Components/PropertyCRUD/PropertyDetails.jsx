
import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

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

import { getSingleProperty } from "../../services/propertyService";
import WriteReview from "../WriteReview";

// Render backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Convert image path into a complete URL
function getImageUrl(image) {
  if (!image) return "";

  // Support image object: { url } or { path }
  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  image = image.trim();

  // Already an absolute URL
  if (/^https?:\/\//i.test(image)) {
    // Replace old localhost URL with deployed backend
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  // Relative image path
  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [isImageOpen, setIsImageOpen] = useState(false);

  // Fetch Property
  useEffect(() => {
    let isMounted = true;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error("Invalid Property ID");
        }

        const response = await getSingleProperty(id);

        const data =
          response?.property ||
          response?.data?.property ||
          response?.data ||
          response;

        if (!data?._id) {
          throw new Error("Property not found");
        }

        if (isMounted) {
          setProperty(data);
          setActiveImage(0);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load property"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Get Property Images
  const images = Array.isArray(property?.images)
    ? property.images.filter(Boolean)
    : property?.image
      ? [property.image]
      : [];

  const totalImages = images.length;

  // Next Image
  const nextImage = useCallback(() => {
    if (!totalImages) return;

    setActiveImage((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  // Previous Image
  const previousImage = useCallback(() => {
    if (!totalImages) return;

    setActiveImage((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  // Fullscreen Keyboard Controls
  useEffect(() => {
    if (!isImageOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsImageOpen(false);
      }

      if (e.key === "ArrowRight") {
        nextImage();
      }

      if (e.key === "ArrowLeft") {
        previousImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isImageOpen, nextImage, previousImage]);

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw
          className="animate-spin text-emerald-600"
          size={35}
        />
      </div>
    );
  }

  // Error
  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-red-600">
          {error || "Property not found"}
        </h2>

        <Link
          to="/my-properties"
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-white"
        >
          Back to My Properties
        </Link>
      </div>
    );
  }

  // Owner Details
  const owner =
    property.owner && typeof property.owner === "object"
      ? property.owner
      : {};

  const phone = String(owner.phone || "").replace(/\D/g, "");

  const whatsappNumber =
    phone.length === 10 ? `91${phone}` : phone;

  // Property Location
  const location =
    typeof property.location === "object" && property.location
      ? [
          property.location.address,
          property.location.city,
          property.location.state,
        ]
            .filter(Boolean)
            .join(", ") || "Location unavailable"
      : property.location || "Location unavailable";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 font-semibold text-gray-600 hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Properties
        </button>

        {/* IMAGE GALLERY */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Main Image */}
          <div className="group relative h-[280px] bg-gray-100 sm:h-[480px]">
            {totalImages > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="h-full w-full cursor-zoom-in"
                  aria-label="Open image fullscreen"
                >
                  <img
                    src={getImageUrl(images[activeImage])}
                    alt={property.name || "Property"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </button>

                {/* Fullscreen Icon */}
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="absolute right-4 top-4 rounded-full bg-black/60 p-3 text-white transition hover:bg-black/80"
                  aria-label="View fullscreen"
                >
                  <Maximize2 size={20} />
                </button>

                {/* Image Count */}
                <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
                  {activeImage + 1} / {totalImages}
                </span>

                {/* Previous and Next */}
                {totalImages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={previousImage}
                      aria-label="Previous image"
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow transition hover:bg-white"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow transition hover:bg-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Home size={60} className="text-gray-400" />
                <span className="ml-3 text-gray-500">
                  No property images available
                </span>
              </div>
            )}
          </div>

          {/* ALL IMAGE THUMBNAILS */}
          {totalImages > 1 && (
            <div className="flex gap-3 overflow-x-auto p-4">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${index}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 ${
                    activeImage === index
                      ? "border-emerald-600"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Property ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* PROPERTY INFORMATION */}
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {property.name || "Property Details"}
              </h1>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                {property.approvalStatus || "Pending"}
              </span>
            </div>

            <p className="mt-3 flex items-center gap-2 text-gray-500">
              <MapPin size={18} />
              {location}
            </p>

            <p className="mt-5 flex items-center text-2xl font-bold text-emerald-700">
              <IndianRupee size={22} />
              {Number(property.price || 0).toLocaleString("en-IN")}
            </p>

            {/* Property Stats */}
            <div className="my-7 grid grid-cols-2 gap-5 border-y border-gray-100 py-6 sm:grid-cols-4">
              <Info
                icon={<Home size={21} />}
                label="Property Type"
                value={property.propertyType || "N/A"}
              />

              <Info
                icon={<BedDouble size={21} />}
                label="Bedrooms"
                value={property.bedrooms ?? 0}
              />

              <Info
                icon={<Bath size={21} />}
                label="Bathrooms"
                value={property.bathrooms ?? 0}
              />

              <Info
                icon={<Ruler size={21} />}
                label="Area"
                value={
                  property.area?.value
                    ? `${property.area.value} ${
                        property.area.unit || "Sq.ft."
                      }`
                    : typeof property.area === "number"
                      ? `${property.area} Sq.ft.`
                      : "N/A"
                }
              />
            </div>

            {/* Description */}
            <h2 className="text-xl font-bold text-gray-900">
              Description
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
              {property.description || "No description available."}
            </p>

            {/* Amenities */}
            {Array.isArray(property.amenities) &&
              property.amenities.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold">
                    Amenities
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {property.amenities.map((item, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
                      >
                        <CheckCircle size={16} />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Contact Owner */}
            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7">
              <h2 className="text-xl font-bold text-gray-900">
                Contact Property Owner
              </h2>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <UserRound size={28} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    {owner.fullName ||
                      owner.userName ||
                      "Property Owner"}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Property Seller / Owner
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                  >
                    <Phone size={18} />
                    Call Owner
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hello, I am interested in your property: ${property.name}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                )}

                {!phone && (
                  <p className="text-sm text-gray-500">
                    Owner contact number is not available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE VIEWER */}
      {isImageOpen && totalImages > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8"
          onClick={() => setIsImageOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            aria-label="Close image viewer"
            className="absolute right-5 top-5 z-20 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <X size={26} />
          </button>

          {/* Image Count */}
          <span className="absolute left-5 top-6 text-sm text-white">
            {activeImage + 1} / {totalImages}
          </span>

          {/* Previous Button */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              aria-label="Previous fullscreen image"
              className="absolute left-3 z-20 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-8"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          {/* Fullscreen Image */}
          <img
            src={getImageUrl(images[activeImage])}
            alt={`${property.name} - Image ${activeImage + 1}`}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = "none";
            }}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />

          {/* Next Button */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next fullscreen image"
              className="absolute right-3 z-20 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-8"
            >
              <ChevronRight size={30} />
            </button>
          )}

          {/* Fullscreen Thumbnails */}
          {totalImages > 1 && (
            <div
              className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === index
                      ? "border-white"
                      : "border-transparent opacity-50"
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Write Review */}
      <WriteReview propertyId={property._id} />
    </div>
  );
}

// Reusable Information Component
function Info({ icon, label, value }) {
  return (
    <div>
      <div className="mb-2 text-emerald-600">
        {icon}
      </div>

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}