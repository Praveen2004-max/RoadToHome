import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  IndianRupee,
  Eye,
  Check,
  X,
  Clock,
  MapPin,
  BedDouble,
  Phone,
  Mail,
  User,
  LoaderCircle,
} from "lucide-react";
import API from "../../services/api";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getBookingList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getId = (value) => {
  if (!value) return "";
  return String(typeof value === "object" ? value._id || value.id || "" : value);
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatLocation = (location) => {
  if (!location) return "Location unavailable";

  if (typeof location === "string") return location;

  if (typeof location === "object") {
    return [
      location.address,
      location.city,
      location.state,
      location.country,
      location.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "Location unavailable";
  }

  return "Location unavailable";
};

const getStatusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "rejected":
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const currentUser = useMemo(() => getStoredUser(), []); 
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = getId(currentUser?._id || currentUser?.id);

  const canManageBooking = useCallback(
    (booking) => {
      if (isAdmin) return true;
      return getId(booking?.owner) === currentUserId;
    },
    [isAdmin, currentUserId]
  );

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      if (!currentUserId || !localStorage.getItem("token")) {
        setBookings([]);
        return;
      }

      if (isAdmin) {
        const response = await API.get("/bookings");
        setBookings(getBookingList(response));
        return;
      }

      const results = await Promise.allSettled([
        API.get("/bookings/my-bookings"),
        API.get("/bookings/received"),
      ]);

      const combined = results.flatMap((result) =>
        result.status === "fulfilled" ? getBookingList(result.value) : []
      );

      const uniqueBookings = [
        ...new Map(
          combined.map((booking) => [getId(booking), booking])
        ).values(),
      ];

      setBookings(uniqueBookings);

      if (results.every((result) => result.status === "rejected")) {
        throw results[0].reason;
      }
    } catch (error) {
      console.error("Bookings Fetch Error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to load bookings. Please try again."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isAdmin]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (booking, status) => {
    const bookingId = getId(booking);

    if (!bookingId || !canManageBooking(booking)) {
      alert("You are not authorized to update this booking.");
      return;
    }

    try {
      setUpdatingId(bookingId);

      await API.patch(`/bookings/${bookingId}/status`, { status });

      if (selectedBooking && getId(selectedBooking) === bookingId) {
        setSelectedBooking({ ...selectedBooking, status });
      }

      await fetchBookings();
    } catch (error) {
      console.error("Booking Status Update Error:", error);
      alert(
        error.response?.data?.message || "Unable to update booking status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const guestName =
        booking.guestName ||
        booking.user?.fullName ||
        booking.user?.userName ||
        "";
      const propertyName =
        booking.property?.name || booking.property?.title || "";
      const email = booking.email || booking.user?.email || "";
      const status = String(booking.status || "Pending");

      const matchesSearch =
        !normalizedSearch ||
        [
          guestName,
          propertyName,
          email,
          booking.bookingType,
          formatLocation(booking.property?.location),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          );

      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const pendingCount = bookings.filter(
    (booking) => String(booking.status).toLowerCase() === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => String(booking.status).toLowerCase() === "confirmed"
  ).length;

  const totalAmount = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {isAdmin ? "Bookings Management" : "My Bookings"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin
                ? "Manage all property booking requests."
                : "View your bookings and requests received for your properties."}
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LoaderCircle size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Bookings"
            value={bookings.length}
            icon={<CalendarDays size={20} />}
            bgColor="bg-blue-50"
            color="blue"
          />
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={<Clock size={20} />}
            bgColor="bg-amber-50"
            color="amber"
          />
          <StatCard
            title="Confirmed"
            value={confirmedCount}
            icon={<Users size={20} />}
            bgColor="bg-green-50"
            color="green"
          />
          <StatCard
            title="Total Booking Amount"
            value={formatCurrency(totalAmount)}
            icon={<IndianRupee size={20} />}
            bgColor="bg-purple-50"
            color="purple"
          />
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, property, or email..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center gap-3 text-gray-500">
              <LoaderCircle size={22} className="animate-spin" />
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
              <CalendarDays size={38} className="mb-3 text-gray-300" />
              <h3 className="font-semibold text-gray-800">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Guest</th>
                    <th className="px-5 py-4">Property</th>
                    <th className="px-5 py-4">Dates</th>
                    <th className="px-5 py-4">Guests</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => {
                    const bookingId = getId(booking);
                    const guestName =
                      booking.guestName ||
                      booking.user?.fullName ||
                      booking.user?.userName ||
                      "Guest";
                    const propertyName =
                      booking.property?.name ||
                      booking.property?.title ||
                      "Property";
                    const status = booking.status || "Pending";
                    const isUpdating = updatingId === bookingId;

                    return (
                      <tr key={bookingId} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {guestName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {booking.email || booking.user?.email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">
                            {propertyName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatLocation(booking.property?.location)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                          <p>{formatDate(booking.checkIn)}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            to {formatDate(booking.checkOut)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {booking.guests || 1}
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              title="View details"
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                            >
                              <Eye size={16} />
                            </button>

                            {String(status).toLowerCase() === "pending" &&
                              canManageBooking(booking) && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateBookingStatus(booking, "Confirmed")
                                    }
                                    disabled={isUpdating}
                                    title="Confirm booking"
                                    className="rounded-lg border border-green-200 p-2 text-green-700 hover:bg-green-50 disabled:opacity-50"
                                  >
                                    {isUpdating ? (
                                      <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Check size={16} />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      updateBookingStatus(booking, "Rejected")
                                    }
                                    disabled={isUpdating}
                                    title="Reject booking"
                                    className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Booking ID: {getId(selectedBooking) || "—"}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedBooking.property?.name ||
                    selectedBooking.property?.title ||
                    "Property"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  {formatLocation(selectedBooking.property?.location)}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                  selectedBooking.status
                )}`}
              >
                {selectedBooking.status || "Pending"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={<User size={17} />}
                label="Guest Name"
                value={
                  selectedBooking.guestName ||
                  selectedBooking.user?.fullName ||
                  selectedBooking.user?.userName ||
                  "—"
                }
              />
              <DetailItem
                icon={<Mail size={17} />}
                label="Email"
                value={
                  selectedBooking.email || selectedBooking.user?.email || "—"
                }
              />
              <DetailItem
                icon={<Phone size={17} />}
                label="Phone"
                value={
                  selectedBooking.phone || selectedBooking.user?.phone || "—"
                }
              />
              <DetailItem
                icon={<BedDouble size={17} />}
                label="Booking Type"
                value={selectedBooking.bookingType || "—"}
              />
              <DetailItem
                icon={<CalendarDays size={17} />}
                label="Check-in"
                value={formatDate(selectedBooking.checkIn)}
              />
              <DetailItem
                icon={<CalendarDays size={17} />}
                label="Check-out"
                value={formatDate(selectedBooking.checkOut)}
              />
              <DetailItem
                icon={<Users size={17} />}
                label="Guests"
                value={selectedBooking.guests || 1}
              />
              <DetailItem
                icon={<IndianRupee size={17} />}
                label="Total Amount"
                value={formatCurrency(selectedBooking.totalAmount)}
              />
            </div>

            {selectedBooking.message && (
              <div className="mt-5 rounded-xl border border-gray-100 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-800">
                  Guest Message
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  {selectedBooking.message}
                </p>
              </div>
            )}

            {String(selectedBooking.status).toLowerCase() === "pending" &&
              canManageBooking(selectedBooking) && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() =>
                      updateBookingStatus(selectedBooking, "Rejected")
                    }
                    disabled={updatingId === getId(selectedBooking)}
                    className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject Booking
                  </button>

                  <button
                    onClick={() =>
                      updateBookingStatus(selectedBooking, "Confirmed")
                    }
                    disabled={updatingId === getId(selectedBooking)}
                    className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    Confirm Booking
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, bgColor }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className={`rounded-xl border border-gray-200 ${bgColor} p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`rounded-lg p-2 ${colors[color] || colors.blue}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}