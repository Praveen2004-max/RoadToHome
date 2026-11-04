
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

const LatestProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format location object
  const formatLocation = (location) => {
    if (!location) return "Location unavailable";

    if (typeof location === "string") return location;

    return [
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ") || "Location unavailable";
  };

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "Price on request";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // Format area object
  const formatArea = (area) => {
    if (!area) return "N/A";

    if (typeof area === "object") {
      return `${area.value || ""} ${area.unit || ""}`.trim() || "N/A";
    }

    return String(area);
  };

  // Get property image
  const getImage = (property) => {
    const image = property.images?.[0];

    if (!image) return "/Homes/home9.jpg";

    if (image.startsWith("http")) return image;

    return `http://localhost:5000${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // Format date
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

  // Fetch latest properties
  useEffect(() => {
    const fetchLatestProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/properties/latest?limit=6");

        const propertyList = response.data?.properties || [];

        setProperties(propertyList);
      } catch (err) {
        console.error("Latest properties error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load latest properties."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProperties();
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
            {[1, 2, 3].map((item) => (
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
          </div>
        )}

        {/* Empty */}
        {!loading && !error && properties.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <House className="mx-auto mb-4 text-gray-400" size={40} />

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
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={getImage(property)}
                      alt={property.name || "Property"}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/Homes/home9.jpg";
                      }}
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow">
                      {property.listingType || "New Listing"}
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                      <Clock3 size={13} />
                      {formatDate(property.createdAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} className="shrink-0 text-orange-500" />

                      <span className="truncate">
                        {formatLocation(property.location)}
                      </span>
                    </div>

                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-500">
                      {property.propertyType || "Property"}
                    </div>

                    <h3 className="line-clamp-1 text-xl font-bold text-gray-900 transition group-hover:text-orange-500">
                      {property.name || "Beautiful Property"}
                    </h3>

                    <p className="mt-3 text-2xl font-bold text-orange-500">
                      {formatPrice(property.price)}
                    </p>

                    <div className="my-5 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <BedDouble size={17} className="text-orange-500" />
                        {property.bedrooms ?? 0} Beds
                      </span>

                      <span className="flex items-center gap-2">
                        <Bath size={17} className="text-orange-500" />
                        {property.bathrooms ?? 0} Baths
                      </span>

                      <span className="flex items-center gap-2">
                        <Maximize2 size={16} className="text-orange-500" />
                        {formatArea(property.area)}
                      </span>
                    </div>

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