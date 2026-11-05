
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Clock3,
  House,
} from "lucide-react";

import API from "../services/api";

// Backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Get Property Image URL
const getImageUrl = (image) => {
  if (!image) return "";

  // Support image object: {url} or {path}
  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  image = image.trim();

  // Already absolute URL
  if (/^https?:\/\//i.test(image)) {
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  // Relative image path
  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const LatestProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format Location
  const formatLocation = (location) => {
    if (!location) return "Location unavailable";

    if (typeof location === "string") {
      return location;
    }

    return [
      location.address,
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ") || "Location unavailable";
  };

  // Format Price
  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") {
      return "Price on request";
    }

    const amount = Number(price);

    if (Number.isNaN(amount)) {
      return "Price on request";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Format Area
  const formatArea = (area) => {
    if (!area) return "N/A";

    if (typeof area === "object") {
      return `${area.value || ""} ${area.unit || "Sq.ft."}`.trim();
    }

    return `${area} Sq.ft.`;
  };

  // Get Property Image
  const getPropertyImage = (property) => {
    const image =
      property?.images?.[0] ||
      property?.image ||
      "";

    return getImageUrl(image);
  };

  // Format Date
  const formatDate = (date) => {
    if (!date) return "Recently added";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently added";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch Latest Properties
  useEffect(() => {
    let isMounted = true;

    const fetchLatestProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/properties/latest?limit=6");

        const propertyList =
          response.data?.properties ||
          response.data?.data?.properties ||
          response.data?.data ||
          response.data ||
          [];

        if (!Array.isArray(propertyList)) {
          throw new Error("Invalid properties response from server.");
        }

        if (isMounted) {
          setProperties(propertyList);
        }
      } catch (err) {
        console.error("Latest properties error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load latest properties."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-[#f8f9f7] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-[2px] w-8 bg-orange-500"></span>

              <span className="text-xs font-bold uppercase tracking-[3px] text-orange-500">
                Fresh Listings
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Latest Properties
              <span className="text-orange-500">.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
              Explore the newest properties added to RoadToHome
              and find a place that feels like home.
            </p>
          </div>

          <Link
            to="/properties"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
          >
            Explore All

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[390px] animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 block mx-auto rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && properties.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <House
              className="mx-auto mb-4 text-gray-400"
              size={40}
            />

            <h3 className="text-xl font-semibold text-gray-800">
              No properties available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              New property listings will appear here.
            </p>
          </div>
        )}

        {/* Property Cards */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const propertyId = property._id;

              return (
                <article
                  key={propertyId}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    {getPropertyImage(property) ? (
                      <img
                        src={getPropertyImage(property)}
                        alt={property.name || "Property"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/Homes/home9.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <House size={55} className="text-gray-400" />
                      </div>
                    )}

                    {/* Listing Type */}
                    <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow">
                      {property.listingType || "New Listing"}
                    </div>

                    {/* Date */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                      <Clock3 size={13} />
                      {formatDate(property.createdAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Location */}
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin
                        size={16}
                        className="shrink-0 text-orange-500"
                      />

                      <span className="truncate">
                        {formatLocation(property.location)}
                      </span>
                    </div>

                    {/* Property Type */}
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-500">
                      {property.propertyType || "Property"}
                    </div>

                    {/* Name */}
                    <h3 className="line-clamp-1 text-xl font-bold text-gray-900 transition group-hover:text-orange-500">
                      {property.name || "Beautiful Property"}
                    </h3>

                    {/* Price */}
                    <p className="mt-3 text-2xl font-bold text-orange-500">
                      {formatPrice(property.price)}
                    </p>

                    {/* Property Details */}
                    <div className="my-5 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <BedDouble
                          size={17}
                          className="text-orange-500"
                        />
                        {property.bedrooms ?? 0} Beds
                      </span>

                      <span className="flex items-center gap-2">
                        <Bath
                          size={17}
                          className="text-orange-500"
                        />
                        {property.bathrooms ?? 0} Baths
                      </span>

                      <span className="flex items-center gap-2">
                        <Maximize2
                          size={16}
                          className="text-orange-500"
                        />
                        {formatArea(property.area)}
                      </span>
                    </div>

                    {/* View Property */}
                    {propertyId ? (
                      <Link
                        to={`/properties/${propertyId}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                      >
                        View Property

                        <ArrowRight size={17} />
                      </Link>
                    ) : (
                      <span className="block rounded-xl bg-gray-200 py-3 text-center text-sm text-gray-500">
                        Property details unavailable
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestProperties;