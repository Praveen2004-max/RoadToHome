
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Home,
  RefreshCw,
} from "lucide-react";

import {
  getAllProperties,
  deleteProperty,
} from "../../services/propertyService";

const statusStyles = {
  Available: "bg-emerald-50 text-emerald-700",
  Sold: "bg-blue-50 text-blue-700",
  Rented: "bg-purple-50 text-purple-700",
  Pending: "bg-amber-50 text-amber-700",
};

export default function Properties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllProperties();

      console.log("Properties API Response:", response);

      // API response structure handle
      const data = Array.isArray(response)
        ? response
        : response.properties || response.data?.properties || response.data || [];

      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch properties error:", err);

      setError(
        err.response?.data?.message ||
        "Properties load nahi ho payi. Backend connection check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Delete property
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Kya aap is property ko permanently delete karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      await deleteProperty(id);

      setProperties((current) =>
        current.filter((property) => property._id !== id)
      );
    } catch (err) {
      console.error("Delete property error:", err);

      alert(
        err.response?.data?.message ||
        "Property delete nahi ho payi."
      );
    }
  };

  // Get location text
  const getLocation = (location) => {
    if (!location) return "Location not specified";

    if (typeof location === "string") return location;

    return [
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ") || location.address || "Location not specified";
  };

  // Get image URL
  const getImageUrl = (images) => {
    const image = Array.isArray(images) ? images[0] : images;

    if (!image) return "/Images/placeholder.jpg";

    if (image.startsWith("http")) return image;

    return `http://localhost:5000${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // Search and filters
  const filteredProperties = properties.filter((property) => {
    const propertyName = property.name || "";
    const propertyLocation = getLocation(property.location);
    const listingType = property.listingType || "";

    const matchesSearch =
      propertyName.toLowerCase().includes(search.toLowerCase()) ||
      propertyLocation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === "All" || property.status === status;

    const matchesType =
      type === "All" || listingType === type;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Summary values
  const availableCount = properties.filter(
    (property) => property.status === "Available"
  ).length;

  const pendingCount = properties.filter(
    (property) => property.status === "Pending"
  ).length;

  const rentCount = properties.filter(
    (property) => property.listingType === "For Rent"
  ).length;

  // Format price
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const stats = [
    {
      label: "Total Properties",
      value: properties.length,
      icon: Home,
      bgColor: "bg-blue-50",
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      label: "Available",
      value: availableCount,
      icon: Eye,
      bgColor: "bg-emerald-50",
      iconColor: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: SlidersHorizontal,
      bgColor: "bg-amber-50",
      iconColor: "bg-amber-100 text-amber-600",
    },
    {
      label: "For Rent",
      value: rentCount,
      icon: MapPin,
      bgColor: "bg-purple-50",
      iconColor: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-emerald-700">
            ADMIN / PROPERTIES
          </p>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Properties
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and monitor all property listings.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/add-property")}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={19} />
          Add Property
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`rounded-2xl border border-slate-200 ${item.bgColor} p-5 transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${item.iconColor}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property name or location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="All">All Types</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
            <option value="For Buy">For Buy</option>
          </select>

          <button
            onClick={fetchProperties}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {/* Listing heading */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          All Listings
        </h2>

        <p className="text-sm text-slate-500">
          {filteredProperties.length} properties
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-emerald-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading properties...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>

          <button
            onClick={fetchProperties}
            className="mt-3 font-semibold text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProperties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <Home className="mx-auto mb-3 text-slate-400" size={38} />

          <h3 className="font-semibold text-slate-800">
            No properties found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or add a new property.
          </p>

          <button
            onClick={() => navigate("/dashboard/add-property")}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Add Property
          </button>
        </div>
      )}

      {/* Property Cards */}
      {!loading && !error && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProperties.map((property) => {
            const propertyStatus = property.status || "Available";

            return (
              <div
                key={property._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={getImageUrl(property.images)}
                    alt={property.name || "Property"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/Images/placeholder.jpg";
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                    {property.listingType || "For Sale"}
                  </span>

                  <span
                    className={`absolute right-4 top-4 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      statusStyles[propertyStatus] || statusStyles.Pending
                    }`}
                  >
                    {propertyStatus}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {property.name || "Untitled Property"}
                      </h3>

                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={15} className="shrink-0" />
                        <span className="truncate">
                          {getLocation(property.location)}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                      {property.propertyType || "Property"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 py-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        Property Price
                      </p>

                      <p className="mt-1 text-xl font-bold text-emerald-700">
                        {formatPrice(property.price)}

                        {property.listingType === "For Rent" && (
                          <span className="text-xs font-normal text-slate-500">
                            {" "}/ month
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-sm font-semibold text-slate-700">
                        <Eye size={15} />
                        {Number(property.views || 0).toLocaleString("en-IN")}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Views
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() =>
                        navigate(`/properties/${property._id}`)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      onClick={() => handleDelete(property._id)}
                      aria-label={`Delete ${property.name}`}
                      className="flex items-center justify-center rounded-xl border border-red-100 px-3 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
