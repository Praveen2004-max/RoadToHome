import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Star,
  Send,
  MessageSquareText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const WriteReview = ({ propertyId, onReviewSubmitted }) => {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      navigate("/signIn");
      return;
    }

    if (!propertyId) {
      setError("Property information is missing.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a review title.");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Review must contain at least 10 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/reviews", {
        propertyId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      setMessage(
        response.data?.message ||
        "Your review has been submitted for approval."
      );

      setRating(0);
      setTitle("");
      setComment("");

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit your review. Please try again."
      );

      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">

      {/* Heading */}
      <div className="mb-7">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <MessageSquareText size={25} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Write a Review
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Share your experience and help others make better property decisions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Rating */}
        <div>
          <label className="mb-3 block text-sm font-bold text-gray-800">
            Your Rating
          </label>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} out of 5 stars`}
                className="transition hover:scale-110"
              >
                <Star
                  size={32}
                  fill={
                    star <= (hoverRating || rating)
                      ? "#F59E0B"
                      : "none"
                  }
                  className={
                    star <= (hoverRating || rating)
                      ? "text-amber-500"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}

            <span className="ml-2 text-sm font-semibold text-gray-500">
              {rating > 0 ? `${rating}/5` : "Select rating"}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label
            htmlFor="reviewTitle"
            className="mb-2 block text-sm font-bold text-gray-800"
          >
            Review Title
          </label>

          <input
            id="reviewTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Excellent property experience"
            maxLength={120}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {title.length}/120
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <label
            htmlFor="reviewComment"
            className="mb-2 block text-sm font-bold text-gray-800"
          >
            Your Experience
          </label>

          <textarea
            id="reviewComment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience with this property..."
            rows={5}
            minLength={10}
            maxLength={1000}
            required
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {comment.length}/1000
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{message}</p>
              <p className="mt-1 text-xs">
                Your review will appear publicly after admin approval.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            "Submitting..."
          ) : (
            <>
              Submit Review
              <Send size={17} />
            </>
          )}
        </button>

      </form>
    </section>
  );
};

export default WriteReview;