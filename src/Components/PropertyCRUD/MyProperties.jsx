
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Home,
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
} from "lucide-react";

import { getMyProperties } from "../../services/propertyService";

const API_URL = "http://localhost:5000";

export default function MyProperties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [refresh, setRefresh] = useState(0);

  // Fetch logged-in user's properties
  useEffect(() => {
    let isMounted = true;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/signIn", {
            replace: true,
            state: { from: "/my-properties" },
          });
          return;
        }

        const response = await getMyProperties();

        // Supports both array and object API responses
        const propertyList = Array.isArray(response)
          ? response
          : response?.properties ||
            response?.data ||
            [];

        if (isMounted) {
          setProperties(propertyList);
        }
      } catch (err) {
        console.error("My Properties Error:", err);

        if (err.response?.status === 401) {
          navigate("/signIn", {
            replace: true,
            state: { from: "/my-properties" },
          });
          return;
        }

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load your properties. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [navigate, refresh]);

  // Status counts
  const pendingCount = properties.filter(
    (item) => item.approvalStatus === "Pending"
  ).length;

  const approvedCount = properties.filter(
    (item) => item.approvalStatus === "Approved"
  ).length;

  const rejectedCount = properties.filter(
    (item) => item.approvalStatus === "Rejected"
  ).length;

  // Filter properties
  const filteredProperties =
    activeFilter === "All"
      ? properties
      : properties.filter(
          (item) => item.approvalStatus === activeFilter
        );

  // Image URL
  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `${API_URL}/${image}`;
    }

    return `${API_URL}/uploads/${image}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={15} />;

      case "Rejected":
        return <XCircle size={15} />;

      default:
        return <Clock size={15} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">

      {/* Header */}
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <Link to="/profile" className="flex gap-1 items-center text-gray-600 hover:text-emerald-700 mb-1"><LogOut size={18} strokeWidth={2.25} />
                <span>return My Profile</span>
            </Link>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              My Account / Properties
            </p>

            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              My Properties
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage and track your submitted property listings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => setRefresh((prev) => prev + 1)}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/user-addProperty"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Property
            </Link>

          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Properties"
            value={properties.length}
            icon={<Home size={22} />}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending Approval"
            value={pendingCount}
            icon={<Clock size={22} />}
            color="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Approved"
            value={approvedCount}
            icon={<CheckCircle size={22} />}
            color="bg-green-50 text-green-600"
          />

          <StatCard
            title="Rejected"
            value={rejectedCount}
            icon={<XCircle size={22} />}
            color="bg-red-50 text-red-600"
          />

        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">

          {["All", "Pending", "Approved", "Rejected"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "bg-emerald-600 text-white shadow"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter}
                {" "}
                {filter === "All"
                  ? `(${properties.length})`
                  : `(${
                      properties.filter(
                        (item) =>
                          item.approvalStatus === filter
                      ).length
                    })`}
              </button>
            )
          )}

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => setRefresh((prev) => prev + 1)}
              className="ml-2 font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-emerald-600"
              />
              <p className="mt-3 text-sm text-gray-500">
                Loading your properties...
              </p>
            </div>
          </div>
        ) : !error && filteredProperties.length === 0 ? (

          /* Empty State */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Home size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              {activeFilter === "All"
                ? "No Properties Yet"
                : `No ${activeFilter} Properties`}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {activeFilter === "All"
                ? "You haven't submitted any properties yet. Start by adding your first property."
                : "There are no properties in this category right now."}
            </p>

            {activeFilter === "All" && (
              <Link
                to="/add-property"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus size={18} />
                Add Your Property
              </Link>
            )}

          </div>

        ) : (

          /* Property Cards */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {filteredProperties.map((property) => {

              const imageUrl = getImageUrl(
                property.images?.[0]
              );

              const location =
                typeof property.location === "object"
                  ? `${property.location?.city || ""}, ${property.location?.state || ""}`
                  : property.location || "Location unavailable";

              return (
                <div
                  key={property._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Image */}
                  <div className="relative h-56 bg-gray-100">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Home size={45} />
                      </div>
                    )}

                    <span
                      className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${getStatusStyle(
                        property.approvalStatus
                      )}`}
                    >
                      {getStatusIcon(property.approvalStatus)}
                      {property.approvalStatus || "Pending"}
                    </span>

                  </div>

                  {/* Details */}
                  <div className="p-5">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {property.name}
                        </h2>

                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={15} />
                          {location}
                        </p>
                      </div>

                      <p className="flex items-center text-lg font-bold text-emerald-700">
                        <IndianRupee size={17} />
                        {Number(property.price || 0).toLocaleString("en-IN")}
                      </p>

                    </div>

                    {/* Property Info */}
                    <div className="mt-5 flex flex-wrap gap-5 border-y border-gray-100 py-4 text-sm text-gray-600">

                      <span className="flex items-center gap-2">
                        <BedDouble size={17} />
                        {property.bedrooms || 0} Beds
                      </span>

                      <span className="flex items-center gap-2">
                        <Bath size={17} />
                        {property.bathrooms || 0} Baths
                      </span>

                      <span className="flex items-center gap-2">
                        <Home size={17} />
                        {property.area?.value || property.area || 0} Sq.ft.
                      </span>

                    </div>

                    {/* Rejection Reason */}
                    {property.approvalStatus === "Rejected" &&
                      property.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                          <p className="text-xs font-bold text-red-700">
                            Rejection Reason
                          </p>
                          <p className="mt-1 text-sm text-red-600">
                            {property.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* Pending Message */}
                    {property.approvalStatus === "Pending" && (
                      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                        Your property is waiting for admin approval.
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between gap-3">

                      <span className="text-xs text-gray-400">  
                        Listed:{" "}
                        {property.createdAt
                          ? new Date(
                              property.createdAt
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </span>

                      {/* <p className="text-xs text-red-500">
                            ID: {property._id || "Missing ID"}
                    </p>     */}

                      <Link
                        to={`/my-properties/${property._id}`}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-500 hover:text-emerald-700"
                      >
                        <Eye size={16} />
                        View
                      </Link>

                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => navigate(`/edit-property/${property._id}`)}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg"
                      >
                        Edit Property
                      </button>

                      <button
                        onClick={() => handleDelete(property._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                      >
                        Delete Property
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

// Statistics Card
function StatCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          {icon}
        </div>

      </div>

    </div>
  );
}
