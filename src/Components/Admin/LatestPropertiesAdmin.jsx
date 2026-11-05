
import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import {
  Clock3,
  RefreshCw,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

const getImageUrl = (image) => {
  if (!image) return PLACEHOLDER;

  const imageUrl =
    typeof image === "string"
      ? image
      : image.url || image.path || "";

  if (!imageUrl) return PLACEHOLDER;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  if (imageUrl.startsWith("/Homes/") || imageUrl.startsWith("/Images/")) {
    return imageUrl;
  }

  return `${IMAGE_BASE_URL}/${imageUrl.replace(/^\/+/, "")}`;
};

const formatLocation = (location) => {
  if (!location) return "Location not available";

  if (typeof location === "string") return location;

  return (
    [
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    location.address ||
    "Location not available"
  );
};

const getPropertiesFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.data?.properties)) return data.data.properties;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const LatestPropertiesAdmin = () => {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("12");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLatestProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/properties/latest?limit=${limit}`
      );

      setProperties(getPropertiesFromResponse(response.data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Latest properties load nahi ho paayi."
      );
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLatestProperties();
  }, [fetchLatestProperties]);

  const filteredProperties = properties.filter((property) => {
    const searchableText = [
      property.name,
      property.propertyType,
      property.listingType,
      formatLocation(property.location),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-purple-600">
              Property Management
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Latest Properties
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Recently submitted properties ki list.
            </p>
          </div>

          <button
            onClick={fetchLatestProperties}
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

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Latest Properties Loaded
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {properties.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
            <p className="text-sm text-purple-700">
              Display Limit
            </p>

            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="mt-2 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-800 outline-none sm:w-40"
            >
              <option value="6">6 Properties</option>
              <option value="12">12 Properties</option>
              <option value="18">18 Properties</option>
              <option value="24">24 Properties</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Properties */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <LoaderCircle
              className="animate-spin text-purple-500"
              size={36}
            />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Clock3
              className="mx-auto mb-3 text-slate-300"
              size={38}
            />

            <h3 className="font-semibold text-slate-800">
              No latest properties found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Abhi koi property nahi mili.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-800">
                Recent Listings
              </h2>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                Newest First
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredProperties.map((property, index) => {
                const image = Array.isArray(property.images)
                  ? property.images[0]
                  : property.image;

                return (
                  <div
                    key={property._id || index}
                    className="flex flex-col gap-4 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                  >
                    <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32">
                      <img
                        src={getImageUrl(image)}
                        alt={property.name || "Property"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                      />

                      {index < 3 && (
                        <span className="absolute left-2 top-2 rounded-md bg-purple-600 px-2 py-1 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {property.name || "Untitled Property"}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {property.propertyType || "Property"}
                        </span>
                      </div>

                      <p className="mb-2 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={14} />
                        {formatLocation(property.location)}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BedDouble size={14} />
                          {property.bedrooms ?? 0} Beds
                        </span>

                        <span className="flex items-center gap-1">
                          <Bath size={14} />
                          {property.bathrooms ?? 0} Baths
                        </span>

                        <span className="flex items-center gap-1">
                          <Maximize size={14} />
                          {property.area?.value ?? property.area ?? "—"}{" "}
                          {property.area?.unit || ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="font-bold text-orange-600">
                        ₹{formatPrice(property.price)}
                      </p>

                      <p className="text-xs text-slate-400">
                        {formatDate(property.createdAt)}
                      </p>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {property.approvalStatus || "Approved"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestPropertiesAdmin;