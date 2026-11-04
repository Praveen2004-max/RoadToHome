
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ArrowUpRight,
  Heart,
  LoaderCircle,
} from "lucide-react";

import API from "../services/api";

// Format location
const formatLocation = (location) => {
  if (!location) return "Location unavailable";

  return [
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ") || location.address || "Location unavailable";
};

// Format price
const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return "Price on request";
  }

  return `₹${Number(price).toLocaleString("en-IN")}`;
};

// Format area
const formatArea = (area) => {
  if (!area) return "N/A";

  return `${area.value || ""} ${area.unit || ""}`.trim() || "N/A";
};

// Get backend image URL
const getPropertyImage = (property) => {
  const image = property.images?.[0];

  if (!image) return "/Homes/home9.jpg";

  if (image.startsWith("http")) return image;

  return `http://localhost:5000${image.startsWith("/") ? "" : "/"}${image}`;
};

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch featured properties from backend
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/properties/featured");

        const propertyList = response.data?.properties || [];

        setProperties(propertyList);
      } catch (err) {
        console.error("Featured Properties Error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load featured properties."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-8 lg:px-16 lg:py-24">

      {/* Heading */}
      <div className="mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-end">

        <div>
          <span className="inline-block rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600">
            Handpicked For You
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Featured{" "}
            <span className="text-orange-500">Properties</span>
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            Explore our handpicked properties and find a place
            that perfectly matches your lifestyle.
          </p>
        </div>

        <Link
          to="/properties"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white"
        >
          View All Properties
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-orange-500">
            <LoaderCircle className="animate-spin" size={28} />
            <span className="font-medium text-gray-600">
              Loading featured properties...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mx-auto max-w-7xl rounded-2xl bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && properties.length === 0 && (
        <div className="mx-auto max-w-7xl rounded-2xl bg-gray-50 px-6 py-16 text-center">
          <h3 className="text-xl font-bold text-gray-800">
            No Featured Properties Yet
          </h3>

          <p className="mt-2 text-gray-500">
            Featured properties will appear here once selected by admin.
          </p>

          <Link
            to="/properties"
            className="mt-5 inline-flex rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Explore Properties
          </Link>
        </div>
      )}

      {/* Property Cards */}
      {!loading && !error && properties.length > 0 && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

          {properties.map((property) => {
            const propertyId = property._id;
            const image = getPropertyImage(property);

            return (
              <article
                key={propertyId}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >

                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-gray-100">

                  <img
                    src={image}
                    alt={property.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/Homes/home9.jpg";
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Listing Type */}
                  <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md">
                    {property.listingType}
                  </span>

                  {/* Featured Badge */}
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-gray-800 backdrop-blur-md">
                    ★ Featured
                  </span>

                  {/* Favorite Icon - UI only */}
                  <button
                    type="button"
                    aria-label="Add to favourites"
                    onClick={() =>
                      console.log("Favourite property:", propertyId)
                    }
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition hover:bg-orange-500 hover:text-white"
                  >
                    <Heart size={19} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 sm:p-6">

                  {/* Location */}
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} className="shrink-0 text-orange-500" />

                    <span className="line-clamp-1">
                      {formatLocation(property.location)}
                    </span>
                  </div>

                  {/* Property Name */}
                  <h3 className="line-clamp-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-500">
                    {property.name}
                  </h3>

                  {/* Property Type */}
                  <p className="mt-2 text-sm text-gray-500">
                    {property.propertyType}
                  </p>

                  {/* Price */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400">
                      {property.priceType || "Negotiable"} Price
                    </p>

                    <p className="mt-1 text-2xl font-bold text-orange-500">
                      {formatPrice(property.price)}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-600">

                    <div className="flex items-center gap-2">
                      <BedDouble size={18} className="text-orange-500" />
                      <span>{property.bedrooms} Beds</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Bath size={18} className="text-orange-500" />
                      <span>{property.bathrooms} Baths</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Maximize size={18} className="text-orange-500" />
                      <span>{formatArea(property.area)}</span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <Link
                    to={`/properties/${propertyId}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-500"
                  >
                    View Property Details
                    <ArrowUpRight size={18} />
                  </Link>

                </div>
              </article>
            );
          })}

        </div>
      )}
    </section>
  );
};

export default FeaturedProperties;