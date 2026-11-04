
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Home,
  ShieldCheck,
  Users,
  Zap,
  Heart,
  Star,
  MapPin,
  Target,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Headset,
  Handshake,
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import API from "../services/api";
import Footer from "../Components/Footer.jsx";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description:
      "We believe property decisions should be clear, honest and transparent.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Our focus is to make every property search simple and comfortable.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We use modern technology to make property discovery easier and faster.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We aim to connect property seekers with owners and opportunities.",
  },
];

const features = [
  {
    icon: Search,
    title: "Easy Property Search",
    description:
      "Explore properties with useful filters for location, price and property type.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Listings",
    description:
      "We aim to provide clear property information so users can make informed decisions.",
  },
  {
    icon: Handshake,
    title: "Direct Connections",
    description:
      "Connect with property owners and arrange property visits through the platform.",
  },
  {
    icon: Headset,
    title: "User Support",
    description:
      "We want your property journey to be smooth, simple and convenient.",
  },
];

const About = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeReview, setActiveReview] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch approved reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await API.get("/reviews?limit=6");
        setTestimonials(response.data?.reviews || []);
      } catch (error) {
        console.error("Reviews loading error:", error);
        setTestimonials([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  const nextReview = () => {
    setActiveReview((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const previousReview = () => {
    setActiveReview((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const review = testimonials[activeReview];

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `http://localhost:5000${
      image.startsWith("/") ? image : `/${image}`
    }`;
  };

  return (
    <>
      {/* Remove Navbar here if it is already rendered in your main Layout/App */}
      <Navbar />

      <main className="overflow-hidden bg-white text-gray-800">

        {/* HERO SECTION */}
        <section className="relative flex min-h-[560px] items-center overflow-hidden bg-[#102c26] px-5 py-24 md:min-h-[650px]">
          <div className="absolute inset-0">
            <img
              src="/Homes/home1.jpg"
              alt="Beautiful property"
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#102c26] via-[#102c26]/90 to-transparent" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-orange-300 backdrop-blur-md">
                <Home size={16} />
                Welcome to RoadToHome
              </span>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-7xl">
                Find a Place
                <br />
                <span className="text-orange-400">To Call Home.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-gray-300 md:text-lg">
                We make discovering your dream property easier. Explore
                properties, connect with owners and take the next step
                towards your perfect home.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-orange-600"
                >
                  Explore Properties
                  <ArrowRight size={19} />
                </Link>

                <Link
                  to="/contacts"
                  className="rounded-full border border-white/40 px-7 py-4 font-semibold text-white transition duration-300 hover:bg-white hover:text-[#102c26]"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full border-[45px] border-orange-400/10" />
        </section>

        {/* OUR STORY */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

            <div className="relative">
              <img
                src="/Homes/home2.jpg"
                alt="Modern home"
                className="h-[350px] w-full rounded-3xl object-cover shadow-xl md:h-[500px]"
              />

              <div className="absolute -bottom-7 right-5 rounded-2xl bg-orange-500 p-6 text-white shadow-xl md:right-8">
                <Home size={32} />
                <p className="mt-3 text-lg font-bold">Your Journey</p>
                <p className="text-sm text-orange-100">
                  Starts With Home
                </p>
              </div>
            </div>

            <div className="pt-5 lg:pt-0">
              <span className="font-semibold uppercase tracking-[3px] text-orange-500">
                Our Story
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                Making Your Property Journey
                <span className="text-orange-500"> Easier.</span>
              </h2>

              <p className="mt-7 leading-8 text-gray-600">
                Finding the right property is an important decision.
                RoadToHome is designed to make that journey more convenient
                by bringing property seekers and owners together on one
                platform.
              </p>

              <p className="mt-5 leading-8 text-gray-600">
                Whether you are looking to buy, rent or list a property,
                our goal is to provide a simple and user-friendly experience
                where you can discover opportunities and connect with
                confidence.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Explore different property categories",
                  "Discover properties by location",
                  "Connect with property owners",
                  "Schedule property visits",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2
                      size={21}
                      className="shrink-0 text-orange-500"
                    />
                    <span className="font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/properties"
                className="mt-9 inline-flex items-center gap-3 font-semibold text-orange-600 transition hover:gap-5"
              >
                Discover Properties
                <ArrowRight size={19} />
              </Link>
            </div>
          </div>
        </section>

        {/* MISSION AND VISION */}
        <section className="bg-gray-50 px-5 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="font-semibold uppercase tracking-[3px] text-orange-500">
                Our Purpose
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-5xl">
                What Drives Us
              </h2>
              <p className="mt-5 leading-7 text-gray-500">
                Our mission and vision guide the way we build a better
                property discovery experience.
              </p>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              <div className="rounded-3xl bg-[#102c26] p-8 text-white shadow-lg md:p-12">
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
                  <Target size={32} />
                </div>

                <h3 className="text-2xl font-bold md:text-3xl">
                  Our Mission
                </h3>

                <p className="mt-5 leading-8 text-gray-300">
                  To simplify the property search process by creating a
                  convenient platform where people can discover properties,
                  connect with owners and make informed decisions.
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg md:p-12">
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Eye size={32} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Our Vision
                </h3>

                <p className="mt-5 leading-8 text-gray-600">
                  To build a trusted and accessible property platform that
                  helps people find the right place and creates better
                  connections in the real estate community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OUR VALUES */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="font-semibold uppercase tracking-[3px] text-orange-500">
                Our Core Values
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-5xl">
                What We Believe In
              </h2>
              <p className="mt-5 leading-7 text-gray-500">
                These principles shape the experience we want to provide
                to every RoadToHome user.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition duration-300 group-hover:bg-orange-500 group-hover:text-white">
                      <Icon size={30} />
                    </div>

                    <h3 className="mt-7 text-xl font-bold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="mt-4 leading-7 text-gray-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE ROADTOHOME */}
        <section className="bg-[#102c26] px-5 py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="font-semibold uppercase tracking-[3px] text-orange-400">
                Why RoadToHome
              </span>

              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                A Better Way to Find Your Home
              </h2>

              <p className="mt-5 leading-7 text-gray-300">
                Everything you need to make your property search easier,
                all in one place.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-white/10 bg-white/5 p-7 transition duration-300 hover:-translate-y-2 hover:bg-white/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white">
                      <Icon size={27} />
                    </div>

                    <h3 className="mt-6 text-xl font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-4 leading-7 text-gray-300">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS - BACKEND DYNAMIC */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="font-semibold uppercase tracking-[3px] text-orange-500">
                Testimonials
              </span>

              <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-5xl">
                What Our Users Say
              </h2>

              <p className="mt-5 text-gray-500">
                Experiences shared by our community.
              </p>
            </div>

            {loadingReviews ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                <p className="mt-4 text-gray-500">
                  Loading reviews...
                </p>
              </div>
            ) : testimonials.length > 0 && review ? (
              <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-gray-50 p-7 shadow-sm md:p-12">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-orange-500">
                    {Array.from(
                      { length: Math.min(5, Math.max(0, review.rating || 0)) },
                      (_, index) => (
                        <Star
                          key={index}
                          size={21}
                          fill="currentColor"
                        />
                      )
                    )}
                  </div>

                  <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
                    Approved Review
                  </span>
                </div>

                <h3 className="mt-8 text-2xl font-bold text-gray-900 md:text-3xl">
                  {review.title || "User Experience"}
                </h3>

                <p className="mt-5 text-lg leading-9 text-gray-600">
                  “{review.comment}”
                </p>

                <div className="mt-9 flex flex-wrap items-center justify-between gap-5 border-t border-gray-200 pt-7">
                  <div className="flex items-center gap-4">
                    {review.user?.profileImage ? (
                      <img
                        src={getImageUrl(review.user.profileImage)}
                        alt={review.user?.fullName || "User"}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                        {getInitials(review.user?.fullName) || "U"}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900">
                        {review.user?.fullName || "RoadToHome User"}
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        {review.property?.name || "RoadToHome Community"}
                      </p>
                    </div>
                  </div>

                  {testimonials.length > 1 && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={previousReview}
                        aria-label="Previous review"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        <ChevronLeft size={22} />
                      </button>

                      <button
                        type="button"
                        onClick={nextReview}
                        aria-label="Next review"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </div>
                  )}
                </div>

                {testimonials.length > 1 && (
                  <div className="mt-7 flex justify-center gap-2">
                    {testimonials.map((item, index) => (
                      <button
                        key={item._id || index}
                        type="button"
                        onClick={() => setActiveReview(index)}
                        aria-label={`Show review ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          activeReview === index
                            ? "w-8 bg-orange-500"
                            : "w-2.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-gray-50 px-6 py-14 text-center">
                <Star
                  size={40}
                  className="mx-auto text-orange-400"
                />
                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  No reviews yet
                </h3>
                <p className="mt-3 text-gray-500">
                  Approved user reviews will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 md:pb-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-orange-500 px-7 py-16 text-center md:px-16 md:py-20">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full border-[35px] border-white/10" />

            <div className="relative">
              <MapPin
                size={42}
                className="mx-auto text-white"
              />

              <h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">
                Ready to Find Your Dream Home?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-8 text-orange-50">
                Start exploring properties today and take one step closer
                to the place you have always wanted.
              </p>

              <Link
                to="/properties"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-orange-600 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
              >
                Explore Properties
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
};

export default About;
