
import React, { useCallback, useEffect, useState } from "react";
import {
  Check,
  X,
  MapPin,
  RefreshCw,
  ClipboardCheck,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  getPendingProperties,
  approveProperty,
  rejectProperty,
} from "../../services/propertyService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

const getImageUrl = (images) => {
  const image = Array.isArray(images)
    ? images[0]
    : images;

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

const getPropertiesFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.properties)) return response.properties;
  if (Array.isArray(response?.data?.properties)) {
    return response.data.properties;
  }
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getLocation = (location) => {
  if (!location) return "Location not specified";

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
    "Location not specified"
  );
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const PendingApprovals = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

  const fetchPendingProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingProperties();
      const data = getPropertiesFromResponse(response);

      setProperties(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Pending properties load nahi ho paayi."
      );
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingProperties();
  }, [fetchPendingProperties]);

  const handleApprove = async (property) => {
    if (!property?._id || processingId) return;

    const confirmed = window.confirm(
      `Approve "${property.name || "this property"}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(property._id);
      setError("");

      await approveProperty(property._id);

      setProperties((current) =>
        current.filter((item) => item._id !== property._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Property approve nahi ho paayi."
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async (property) => {
    if (!property?._id || processingId) return;

    const reason = window.prompt(
      "Property reject karne ka reason enter karein:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      setError("Reject karne ke liye reason zaroori hai.");
      return;
    }

    try {
      setProcessingId(property._id);
      setError("");

      await rejectProperty(property._id, reason.trim());

      setProperties((current) =>
        current.filter((item) => item._id !== property._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Property reject nahi ho paayi."
      );
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-emerald-700">
              ADMIN / APPROVALS
            </p>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Pending Approvals
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review property listings before publishing them.
            </p>
          </div>

          <button
            onClick={fetchPendingProperties}
            disabled={loading || Boolean(processingId)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3">
            <ClipboardCheck
              className="text-amber-700"
              size={24}
            />

            <div>
              <p className="text-sm text-amber-800">
                Waiting for review
              </p>

              <p className="text-2xl font-bold text-amber-900">
                {properties.length}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border bg-white py-16 text-center">
            <RefreshCw
              className="mx-auto animate-spin text-emerald-600"
              size={30}
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading pending properties...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <ClipboardCheck
              className="mx-auto mb-3 text-slate-400"
              size={40}
            />

            <h2 className="font-semibold text-slate-800">
              No pending properties
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              New property submissions will appear here.
            </p>
          </div>
        )}

        {/* Property Cards */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {properties.map((property) => (
              <article
                key={property._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <img
                    src={getImageUrl(property.images || property.image)}
                    alt={property.name || "Property"}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = PLACEHOLDER;
                    }}
                    className="h-56 w-full bg-slate-100 object-cover sm:h-full"
                  />

                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Pending Review
                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {property.propertyType || "Property"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {property.name || "Untitled Property"}
                    </h2>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin size={15} className="shrink-0" />
                      {getLocation(property.location)}
                    </p>

                    <p className="mt-4 text-xl font-bold text-emerald-700">
                      {formatPrice(property.price)}

                      {property.listingType === "For Rent" && (
                        <span className="text-xs font-normal text-slate-500">
                          {" "}/ month
                        </span>
                      )}
                    </p>

                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {property.description ||
                        "No description provided."}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Submitted by:{" "}
                      {property.owner?.fullName ||
                        property.owner?.userName ||
                        "Property owner"}
                    </p>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleApprove(property)}
                        disabled={Boolean(processingId)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {processingId === property._id ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Check size={17} />
                        )}
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(property)}
                        disabled={Boolean(processingId)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X size={17} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;
