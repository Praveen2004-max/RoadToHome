import React, { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import {
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  User,
  MapPin,
  Calendar,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) return "";

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
  if (!location) return "Location unavailable";

  if (typeof location === "string") return location;

  return [
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ") || location.address || "Location unavailable";
};

const getReviewsFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.reviews)) return data.reviews;
  if (Array.isArray(data?.data?.reviews)) return data.data.reviews;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [processingId, setProcessingId] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/reviews/admin/all");

      setReviews(getReviewsFromResponse(response.data));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateStatus = async (id, status) => {
    try {
      setProcessingId(id);
      setError("");

      await API.patch(`/reviews/admin/${id}/status`, { status });

      setReviews((previous) =>
        previous.map((review) =>
          review._id === id ? { ...review, status } : review
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Review status update failed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReviews =
    filter === "All"
      ? reviews
      : reviews.filter(
          (review) =>
            String(review.status || "").toLowerCase() ===
            filter.toLowerCase()
        );

  const counts = {
    All: reviews.length,
    Pending: reviews.filter((r) => r.status === "Pending").length,
    Approved: reviews.filter((r) => r.status === "Approved").length,
    Rejected: reviews.filter((r) => r.status === "Rejected").length,
  };

  const statusStyle = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-7">
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-indigo-600">
            CUSTOMER FEEDBACK
          </p>

          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Reviews Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and moderate customer property reviews.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            title: "Total Reviews",
            value: counts.All,
            icon: MessageSquare,
            iconColor: "text-cyan-500",
            bgColor: "bg-cyan-50",
          },
          {
            title: "Pending",
            value: counts.Pending,
            icon: Calendar,
            iconColor: "text-yellow-500",
            bgColor: "bg-yellow-50",
          },
          {
            title: "Approved",
            value: counts.Approved,
            icon: CheckCircle,
            iconColor: "text-green-500",
            bgColor: "bg-green-50",
          },
          {
            title: "Rejected",
            value: counts.Rejected,
            icon: XCircle,
            iconColor: "text-red-500",
            bgColor: "bg-red-50",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`rounded-2xl border border-slate-100 ${item.bgColor} p-5 shadow-sm`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {item.title}
                </span>

                <Icon size={20} className={item.iconColor} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === item
                ? "bg-indigo-600 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item} ({counts[item]})
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-500">
          Loading reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
          <MessageSquare
            size={40}
            className="mx-auto mb-3 text-slate-300"
          />

          <h3 className="font-bold text-slate-800">
            No reviews found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Reviews matching this filter will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredReviews.map((review) => {
            const reviewId = review._id;
            const rating = Math.min(
              5,
              Math.max(0, Number(review.rating) || 0)
            );

            const userImage = getImageUrl(
              review.user?.profileImage
            );

            return (
              <div
                key={reviewId}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6"
              >
                {/* User */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={review.user?.fullName || "User"}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <User size={22} />
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-slate-900">
                        {review.user?.fullName || "Unknown User"}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {review.user?.email || "Email unavailable"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      statusStyle[review.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {review.status || "Unknown"}
                  </span>
                </div>

                {/* Rating */}
                <div className="mt-5 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={17}
                      fill={star <= rating ? "#F59E0B" : "none"}
                      className={
                        star <= rating
                          ? "text-amber-500"
                          : "text-slate-300"
                      }
                    />
                  ))}

                  <span className="ml-2 text-sm font-semibold text-slate-700">
                    {rating}/5
                  </span>
                </div>

                {/* Review */}
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {review.title || "Customer Review"}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {review.comment || "No review comment provided."}
                </p>

                {/* Property */}
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Reviewed Property
                  </p>

                  <h4 className="font-bold text-slate-800">
                    {review.property?.name || "Property unavailable"}
                  </h4>

                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} />
                    {formatLocation(review.property?.location)}
                  </p>
                </div>

                {/* Date and Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Submitted:{" "}
                    {review.createdAt &&
                    !Number.isNaN(new Date(review.createdAt).getTime())
                      ? new Date(review.createdAt).toLocaleDateString(
                          "en-IN"
                        )
                      : "Date unavailable"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {review.status !== "Approved" && (
                      <button
                        disabled={processingId === reviewId}
                        onClick={() =>
                          updateStatus(reviewId, "Approved")
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle size={15} />
                        Approve
                      </button>
                    )}

                    {review.status !== "Rejected" && (
                      <button
                        disabled={processingId === reviewId}
                        onClick={() =>
                          updateStatus(reviewId, "Rejected")
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;