import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import {
  Star,
  Search,
  RefreshCw,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400?text=No+Image";

const getImageUrl = (image) => {
  if (!image) return PLACEHOLDER_IMAGE;

  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) {
    return PLACEHOLDER_IMAGE;
  }

  image = image.trim();

  if (/^https?:\/\//i.test(image)) {
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const formatLocation = (location) => {
  if (!location) return "Location not available";

  if (typeof location === "string") return location;

  return [
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ") || location.address || "Location not available";
};

const getPropertiesFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.data?.properties)) {
    return data.data.properties;
  }
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const FeaturedPropertiesAdmin = () => {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await API.get("/properties");

      setProperties(getPropertiesFromResponse(response.data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Properties load nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleFeatured = async (property) => {
    const propertyId = property._id;

    if (!propertyId) {
      setError("Property ID unavailable.");
      return;
    }

    try {
      setUpdatingId(propertyId);
      setError("");
      setSuccess("");

      const nextValue = !property.isFeatured;

      await API.patch(`/properties/${propertyId}/featured`, {
        isFeatured: nextValue,
      });

      setProperties((previous) =>
        previous.map((item) =>
          item._id === propertyId
            ? { ...item, isFeatured: nextValue }
            : item
        )
      );

      setSuccess(
        nextValue
          ? "Property Featured section mein add ho gayi."
          : "Property Featured section se remove ho gayi."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Featured status update nahi hua. Backend route check karein."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const searchText = [
      property.name,
      property.propertyType,
      property.listingType,
      formatLocation(property.location),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(
      search.trim().toLowerCase()
    );

    const matchesFilter =
      filter === "All" ||
      (filter === "Featured" && property.isFeatured === true) ||
      (filter === "Not Featured" && !property.isFeatured);

    return matchesSearch && matchesFilter;
  });

  const featuredCount = properties.filter(
    (item) => item.isFeatured === true
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              Property Management
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Featured Properties
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Homepage par dikhane ke liye properties select karein.
            </p>
          </div>

          <button
            onClick={fetchProperties}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Properties
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {properties.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm text-orange-700">
              Featured Properties
            </p>

            <h2 className="mt-2 text-3xl font-bold text-orange-700">
              {featuredCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Not Featured
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {properties.length - featuredCount}
            </h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property name or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
          >
            <option value="All">All</option>
            <option value="Featured">Featured</option>
            <option value="Not Featured">Not Featured</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* Property Cards */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <LoaderCircle
              className="animate-spin text-orange-500"
              size={36}
            />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Star
              className="mx-auto mb-3 text-slate-300"
              size={38}
            />

            <h3 className="font-semibold text-slate-800">
              No properties found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Search ya filter change karke dekhein.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const image = Array.isArray(property.images)
                ? property.images[0]
                : property.image;

              const propertyId = property._id;
              const isUpdating = updatingId === propertyId;

              return (
                <div
                  key={propertyId}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-52 bg-slate-100">
                    <img
                      src={getImageUrl(image)}
                      alt={property.name || "Property"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700">
                      {property.propertyType || "Property"}
                    </span>

                    {property.isFeatured && (
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                        <Star size={13} fill="currentColor" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                        {property.name || "Untitled Property"}
                      </h3>

                      <span className="shrink-0 text-sm font-bold text-orange-600">
                        ₹
                        {Number(property.price || 0).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <p className="mb-4 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={15} />
                      {formatLocation(property.location)}
                    </p>

                    <div className="mb-5 flex flex-wrap gap-4 border-y border-slate-100 py-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <BedDouble size={15} />
                        {property.bedrooms ?? 0} Beds
                      </span>

                      <span className="flex items-center gap-1">
                        <Bath size={15} />
                        {property.bathrooms ?? 0} Baths
                      </span>

                      <span className="flex items-center gap-1">
                        <Maximize size={15} />
                        {property.area?.value ??
                          property.area ??
                          "—"}{" "}
                        {property.area?.unit || ""}
                      </span>
                    </div>

                    {/* Featured Toggle */}
                    <button
                      onClick={() => toggleFeatured(property)}
                      disabled={isUpdating}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        property.isFeatured
                          ? "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                          : "bg-slate-900 text-white hover:bg-orange-600"
                      }`}
                    >
                      {isUpdating ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Star
                          size={17}
                          fill={
                            property.isFeatured
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )}

                      {property.isFeatured
                        ? "Remove from Featured"
                        : "Add to Featured"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPropertiesAdmin;