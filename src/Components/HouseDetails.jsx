import React, { useEffect, useState } from "react";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Send,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserRound,
  Link,
} from "lucide-react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "/Homes/home1.jpg";

  const path =
    typeof image === "string"
      ? image
      : image.url || image.path;

  if (!path) return "/Homes/home1.jpg";

  if (path.startsWith("http")) return path;

  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const HouseDetails = ({ elem, onClose, property }) => {
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Message states
  const [message, setMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState("");
  const [messageError, setMessageError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [bookingData, setBookingData] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    message: "",
  });

  // Reset details when selected property changes
  useEffect(() => {
    setActiveImage(0);
    setActiveTab("Overview");
    setShowBookingForm(false);
    setBookingSuccess("");
    setBookingError("");
    setMessage("");
    setMessageSuccess("");
    setMessageError("");
    setIsFavorite(false);
  }, [elem?._id]);

  // Get logged-in user
  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      setCurrentUser(user);

      if (user) {
        setBookingData((prev) => ({
          ...prev,
          guestName: user.fullName || user.userName || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
      }
    } catch (error) {
      console.error("User Data Error:", error);
      setCurrentUser(null);
    }
  }, []);

  if (!elem) return null;

  // Multiple property images
  const images =
    elem.images?.length > 0
      ? elem.images
      : ["/Homes/home1.jpg"];

  const ownerId = elem.owner?._id || elem.owner;
  const userId = currentUser?._id || currentUser?.id;

  const isOwner =
    ownerId &&
    userId &&
    String(ownerId) === String(userId);

  const isRent = elem.listingType === "For Rent";

  const location = [
    elem.location?.address,
    elem.location?.city,
    elem.location?.state,
    elem.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const formattedPrice = Number(
    elem.price || 0
  ).toLocaleString("en-IN");

  // Previous image
  const previousImage = () => {
    setActiveImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  // Next image
  const nextImage = () => {
    setActiveImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Booking form input handler
  const updateBookingData = (e) => {
    const { name, value } = e.target;

    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send message to property owner
  const sendMessage = async (e) => {
    e.preventDefault();

    setMessageError("");
    setMessageSuccess("");

    if (!localStorage.getItem("token")) {
      setMessageError("Please login first to send a message.");
      return;
    }

    if (isOwner) {
      setMessageError("You cannot message your own property.");
      return;
    }

    if (!message.trim()) {
      setMessageError("Please enter your message.");
      return;
    }

    try {
      setMessageLoading(true);

      const response = await API.post("/messages/send", {
        propertyId: elem._id,
        text: message.trim(),
      });

      setMessageSuccess(
        response.data.message || "Message sent successfully!"
      );

      setMessage("");
    } catch (error) {
      console.error(
        "Message Error:",
        error.response?.data || error
      );

      setMessageError(
        error.response?.data?.message ||
          "Unable to send message. Please try again."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  // Submit booking request
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    if (!localStorage.getItem("token")) {
      setBookingError("Please login first to book this property.");
      return;
    }

    if (isOwner) {
      setBookingError("You cannot book your own property.");
      return;
    }

    if (
      !bookingData.guestName.trim() ||
      !bookingData.email.trim() ||
      !bookingData.phone.trim()
    ) {
      setBookingError("Please fill all required fields.");
      return;
    }

    if (
      isRent &&
      (!bookingData.checkIn || !bookingData.checkOut)
    ) {
      setBookingError("Please select check-in and check-out dates.");
      return;
    }

    if (
      isRent &&
      new Date(bookingData.checkOut) <=
        new Date(bookingData.checkIn)
    ) {
      setBookingError("Check-out date must be after check-in.");
      return;
    }

    try {
      setBookingLoading(true);

      const response = await API.post("/bookings", {
        propertyId: elem._id,
        guestName: bookingData.guestName.trim(),
        email: bookingData.email.trim(),
        phone: bookingData.phone.trim(),
        checkIn: isRent ? bookingData.checkIn : null,
        checkOut: isRent ? bookingData.checkOut : null,
        guests: Number(bookingData.guests),
        message: bookingData.message.trim(),
      });

      setBookingSuccess(
        response.data.message ||
          "Booking request submitted successfully!"
      );

      setBookingData((prev) => ({
        ...prev,
        checkIn: "",
        checkOut: "",
        guests: 1,
        message: "",
      }));
    } catch (error) {
      console.error(
        "Booking Error:",
        error.response?.data || error
      );

      setBookingError(
        error.response?.data?.message ||
          "Booking request failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Property Details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Explore your dream property
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-gray-100 p-2 transition hover:bg-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 sm:p-6">

        {/* MULTIPLE IMAGE GALLERY */}
        <div className="mt-2">

          {/* Main Image */}
          <div className="group relative overflow-hidden rounded-2xl">
            <img
              src={getImageUrl(images[activeImage])}
              alt={elem.name}
              onError={(e) => {
                e.currentTarget.src = "/Homes/home1.jpg";
              }}
              className="h-60 w-full object-cover transition-all duration-500 sm:h-75"
            />

            {/* Listing Type */}
            <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow">
              {elem.listingType}
            </span>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={() => setIsFavorite((prev) => !prev)}
              className="absolute right-4 top-4 rounded-full bg-white p-3 shadow transition hover:scale-110"
            >
              <Heart
                size={20}
                className={
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-700"
                }
              />
            </button>

            {/* Previous Image */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Next Image */}
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
              {activeImage + 1} / {images.length}
            </span>
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    activeImage === index
                      ? "border-orange-500 opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${elem.name} ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/Homes/home1.jpg";
                    }}
                    className="h-16 w-full object-cover sm:h-20"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PROPERTY INFORMATION */}
        <div className="mt-7">

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {elem.name}
              </h2>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={17} className="text-orange-500" />
                {location || "Location not available"}
              </p>
            </div>

            <span className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
              {elem.propertyType}
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-orange-600">
            ₹{formattedPrice}

            {elem.priceType && (
              <span className="text-sm font-medium text-gray-500">
                {" "}/ {elem.priceType}
              </span>
            )}
          </p>

          {/* PROPERTY FEATURES */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-xl bg-gray-50 p-4">
              <BedDouble className="mb-2 text-orange-500" size={23} />
              <p className="text-lg font-bold text-gray-900">
                {elem.bedrooms ?? 0}
              </p>
              <p className="text-sm text-gray-500">Bedrooms</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <Bath className="mb-2 text-orange-500" size={23} />
              <p className="text-lg font-bold text-gray-900">
                {elem.bathrooms ?? 0}
              </p>
              <p className="text-sm text-gray-500">Bathrooms</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <Maximize className="mb-2 text-orange-500" size={23} />
              <p className="text-lg font-bold text-gray-900">
                {elem.area?.value ?? 0}
              </p>
              <p className="text-sm text-gray-500">
                {elem.area?.unit || "Area"}
              </p>
            </div>

          </div>

          {/* PROPERTY TABS */}
          <div className="mt-8 flex gap-6 overflow-x-auto border-b border-gray-200">

            {["Overview", "Amenities", "About"].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-3 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}

          </div>

          {/* TAB CONTENT */}
          <div className="min-h-[120px] py-5">

            {activeTab === "Overview" && (
              <div>
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  Property Description
                </h3>

                <p className="leading-7 text-gray-600">
                  {elem.description ||
                    "No description available for this property."}
                </p>
              </div>
            )}

            {activeTab === "Amenities" && (
              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Property Amenities
                </h3>

                <div className="flex flex-wrap gap-3">
                  {elem.amenities?.length > 0 ? (
                    elem.amenities.map((item, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No amenities listed.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "About" && (
              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  About This Property
                </h3>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <p className="text-gray-600">
                    <strong>Property Type:</strong>{" "}
                    {elem.propertyType || "Not specified"}
                  </p>

                  <p className="text-gray-600">
                    <strong>Listing Type:</strong>{" "}
                    {elem.listingType || "Not specified"}
                  </p>

                  <p className="text-gray-600">
                    <strong>Furnishing:</strong>{" "}
                    {elem.furnishing || "Not specified"}
                  </p>

                  <p className="text-gray-600">
                    <strong>Bedrooms:</strong>{" "}
                    {elem.bedrooms ?? 0}
                  </p>

                  <p className="text-gray-600">
                    <strong>Bathrooms:</strong>{" "}
                    {elem.bathrooms ?? 0}
                  </p>

                  <p className="text-gray-600">
                    <strong>Location:</strong>{" "}
                    {location || "Not specified"}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOOKING SECTION */}
        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-5 sm:p-6">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-orange-500">
              <CalendarDays size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Interested in this property?
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Submit a booking request to the property owner.
              </p>
            </div>
          </div>

          {!isOwner && (
            <button
              type="button"
              onClick={() => {
                setShowBookingForm((prev) => !prev);
                setBookingError("");
                setBookingSuccess("");
              }}
              className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              {showBookingForm
                ? "Close Booking Form"
                : "Book This Property"}
            </button>
          )}

          {isOwner && (
            <p className="mt-4 rounded-lg bg-white p-3 text-sm text-gray-600">
              This is your own property.
            </p>
          )}

          {showBookingForm && !isOwner && (
            <form
              onSubmit={handleBookingSubmit}
              className="mt-5 space-y-4"
            >

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>

                <input
                  type="text"
                  name="guestName"
                  value={bookingData.guestName}
                  onChange={updateBookingData}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={updateBookingData}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={updateBookingData}
                  required
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* RENT DATES */}
              {isRent && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Check In
                    </label>

                    <input
                      type="date"
                      name="checkIn"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingData.checkIn}
                      onChange={updateBookingData}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white p-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Check Out
                    </label>

                    <input
                      type="date"
                      name="checkOut"
                      min={
                        bookingData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      value={bookingData.checkOut}
                      onChange={updateBookingData}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white p-3"
                    />
                  </div>

                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Number of Guests
                </label>

                <input
                  type="number"
                  name="guests"
                  min="1"
                  value={bookingData.guests}
                  onChange={updateBookingData}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Additional Message
                </label>

                <textarea
                  name="message"
                  rows="3"
                  value={bookingData.message}
                  onChange={updateBookingData}
                  placeholder="Write your requirements..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-orange-500"
                />
              </div>

              {bookingError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {bookingError}
                </p>
              )}

              {bookingSuccess && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {bookingSuccess}
                </p>
              )}

              <p className="text-xs leading-5 text-gray-500">
                This is a booking request. It will remain pending
                until the property owner reviews it. No payment
                is collected through this form.
              </p>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading
                  ? "Submitting Request..."
                  : "Submit Booking Request"}
              </button>

            </form>
          )}
        </div>

        {/* MESSAGE OWNER SECTION */}
        {!isOwner && (
          <div className="mt-6 rounded-2xl border border-gray-200 p-5 sm:p-6">

            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <UserRound size={23} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Contact Property Owner
                </h3>

                <p className="text-sm text-gray-500">
                  Have questions? Send an inquiry.
                </p>
              </div>
            </div>

            <form onSubmit={sendMessage}>

              <textarea
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message to the property owner..."
                className="w-full resize-none rounded-xl border border-gray-200 p-3 outline-none focus:border-orange-500"
              />

              {messageError && (
                <p className="mt-2 text-sm text-red-600">
                  {messageError}
                </p>
              )}

              {messageSuccess && (
                <p className="mt-2 text-sm text-green-700">
                  {messageSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={messageLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
              >
                <Send size={18} />
                {messageLoading ? "Sending..." : "Send Message"}
              </button>

            </form>
          </div>
        )}

        <button
          onClick={() => {
            const propertyId = elem?._id || elem?.id;

            if (!propertyId) {
              console.error("Property ID not found:", elem);
              return;
            }

            navigate(`/properties/${propertyId}`);
          }}
          className="w-full rounded-xl bg-orange-500 px-5 py-3 text-white font-semibold hover:bg-orange-600 mt-3"
        >
          Property Details
        </button>
      </div>
    </div>
  );
};

export default HouseDetails;