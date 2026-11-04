import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  Star,
  Quote,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MessageSquareQuote,
  User,
} from "lucide-react";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch approved reviews from backend
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);

        const response = await API.get("/reviews?limit=6");

        setTestimonials(response.data?.reviews || []);
      } catch (error) {
        console.error("Testimonials fetch error:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Reset index if reviews change
  useEffect(() => {
    if (activeIndex >= testimonials.length) {
      setActiveIndex(0);
    }
  }, [testimonials, activeIndex]);

  const activeTestimonial = testimonials[activeIndex];

  const previousTestimonial = () => {
    setActiveIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const nextTestimonial = () => {
    setActiveIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `http://localhost:5000${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  const formatLocation = (location) => {
    if (!location) return "";

    if (typeof location === "string") return location;

    return [
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <section className="relative overflow-hidden bg-[#f7f8f5] px-4 py-20 sm:px-8 lg:px-16 lg:py-28">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2 text-sm font-semibold text-orange-600">
              <MessageSquareQuote size={17} />
              Customer Experiences
            </span>

            <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Stories That Make
              <br />
              <span className="text-orange-500">
                Us Proud.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
              Every home has a story. Discover experiences
              shared by people exploring their property journey
              with RoadToHome.
            </p>
          </div>

          <Link
            to="/contacts"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
          >
            Share Your Experience
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
            <p className="mt-4 text-sm text-gray-500">
              Loading customer experiences...
            </p>
          </div>
        ) : testimonials.length === 0 ? (

          /* Empty State */
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <MessageSquareQuote size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Your story could be next!
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-500">
              We are waiting for our first approved customer
              experiences. Share your experience with RoadToHome.
            </p>

            <Link
              to="/contacts"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Share Your Experience
              <ArrowUpRight size={17} />
            </Link>
          </div>

        ) : (

          /* Main Testimonial Layout */
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

              {/* Left Side */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#17251f] p-8 text-white sm:p-10 lg:col-span-5 lg:p-12">

                <Quote
                  size={110}
                  className="absolute -right-3 top-5 text-white/5"
                />

                <div className="relative">
                  <span className="inline-block rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-orange-300">
                    Made For Your Next Chapter
                  </span>

                  <h3 className="mt-9 text-3xl font-bold leading-tight sm:text-4xl">
                    Your trust
                    <br />
                    inspires our
                    <span className="text-orange-400">
                      {" "}journey.
                    </span>
                  </h3>

                  <p className="mt-5 max-w-sm text-sm leading-7 text-gray-300">
                    We believe finding a home is more than a transaction.
                    It's about discovering a place where your next
                    beautiful memories begin.
                  </p>
                </div>

                {/* Bottom Decoration */}
                <div className="relative mt-12 border-t border-white/15 pt-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
                      <Quote size={24} className="text-white" />
                    </div>

                    <div>
                      <p className="font-bold text-white">
                        RoadToHome
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Your journey, your home.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10 lg:col-span-7 lg:p-12">

                {/* Review Top */}
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                      Customer Story
                    </span>

                    <div className="flex items-center gap-1 text-orange-400">
                      {Array.from({
                        length: Math.min(
                          5,
                          Math.max(0, Number(activeTestimonial.rating) || 0)
                        ),
                      }).map((_, index) => (
                        <Star
                          key={index}
                          size={17}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quote Icon */}
                  <div className="mt-9 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Quote size={29} />
                  </div>

                  {/* Review */}
                  <h3
                    key={activeTestimonial._id}
                    className="mt-7 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl"
                  >
                    "{activeTestimonial.title}"
                  </h3>

                  <p
                    key={`review-${activeTestimonial._id}`}
                    className="mt-5 text-sm leading-8 text-gray-500 sm:text-base"
                  >
                    {activeTestimonial.comment}
                  </p>
                </div>

                {/* Customer Profile */}
                <div className="mt-10 flex flex-col justify-between gap-6 border-t border-gray-100 pt-7 sm:flex-row sm:items-center">

                  <div className="flex items-center gap-4">

                    {activeTestimonial.user?.profileImage ? (
                      <img
                        src={getImageUrl(
                          activeTestimonial.user.profileImage
                        )}
                        alt={activeTestimonial.user.fullName || "Customer"}
                        className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-orange-50"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600 ring-4 ring-orange-50">
                        {getInitials(
                          activeTestimonial.user?.fullName
                        )}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900">
                        {activeTestimonial.user?.fullName || "RoadToHome Customer"}
                      </h4>

                      <p className="mt-1 text-xs font-medium text-orange-500">
                        Verified Platform Review
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatLocation(
                          activeTestimonial.property?.location
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-3">
                    <span className="mr-2 text-sm font-semibold tabular-nums text-gray-400">
                      {String(activeIndex + 1).padStart(2, "0")} /{" "}
                      {String(testimonials.length).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={previousTestimonial}
                      aria-label="Previous testimonial"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <ArrowLeft size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={nextTestimonial}
                      aria-label="Next testimonial"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600"
                    >
                      <ArrowRight size={19} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Indicators */}
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((item, index) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show testimonial ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "w-9 bg-orange-500"
                      : "w-2 bg-gray-300 hover:bg-orange-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Testimonials;