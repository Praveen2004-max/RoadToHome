
import React, { useCallback, useEffect, useState } from "react";
import {
  Home,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  ArrowUpRight,
  MapPin,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Link } from "react-router-dom";
import API from "../../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "/Images/placeholder.jpg";

  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) {
    return "/Images/placeholder.jpg";
  }

  image = image.trim();

  if (/^https?:\/\//i.test(image)) {
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const Overview = () => {
  const [filter, setFilter] = useState("6 Months");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/properties/admin/overview", {
        params: { period: filter },
      });

      const data = response.data?.overview || response.data?.data || response.data;

      setOverview(data || {});
    } catch (err) {
      console.error("Overview Error:", err);

      setError(
        err.response?.data?.message ||
          "Dashboard data load nahi ho paya."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const stats = [
    {
      title: "Total Properties",
      value: overview?.stats?.totalProperties ?? 0,
      icon: Home,
      bgColor: "bg-sky-50",
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: "Approved Properties",
      value: overview?.stats?.approvedProperties ?? 0,
      icon: CheckCircle2,
      bgColor: "bg-emerald-50",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Pending Approvals",
      value: overview?.stats?.pendingProperties ?? 0,
      icon: Clock,
      bgColor: "bg-orange-50",
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Total Property Views",
      value: overview?.stats?.totalViews ?? 0,
      icon: Eye,
      bgColor: "bg-violet-50",
      color: "bg-violet-100 text-violet-700",
    },
  ];

  const chartData = Array.isArray(overview?.chartData)
    ? overview.chartData
    : [];

  const properties = Array.isArray(overview?.recentProperties)
    ? overview.recentProperties
    : [];

  if (loading && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-orange-600" size={30} />
        <span className="ml-3 text-gray-500">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-red-500">{error}</p>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="rounded-xl bg-orange-600 px-5 py-2.5 text-white hover:bg-orange-700 disabled:opacity-60"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-orange-600">
              ROADTOHOME / ADMIN
            </p>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Welcome back! Here's what's happening with your properties.
            </p>
          </div>

          <Link
            to="/dashboard/add-property"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700"
          >
            <Plus size={18} />
            Add Property
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`group rounded-2xl border border-gray-200 ${stat.bgColor} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>

                <p className="mt-5 text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h2 className="mt-1 text-3xl font-bold text-gray-900">
                  {Number(stat.value).toLocaleString("en-IN")}
                </h2>

                <p className="mt-3 text-xs text-gray-400">
                  Live database statistics
                </p>
              </div>
            );
          })}
        </div>

        {/* Property Performance */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Property Performance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track newly added properties over time
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
            >
              <option value="6 Months">6 Months</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">Total Listings</p>

            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {overview?.stats?.totalProperties ?? 0}
            </h3>
          </div>

          <div className="h-[280px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="propertyGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#F97316"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#F97316"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                    }}
                    formatter={(value) => [value, "Properties Listed"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="properties"
                    stroke="#F97316"
                    strokeWidth={3}
                    fill="url(#propertyGradient)"
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No property performance data available.
              </div>
            )}
          </div>
        </section>

        {/* Recent Properties */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Property Listings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest properties added to RoadToHome
              </p>
            </div>

            <Link
              to="/dashboard/properties"
              className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-800"
            >
              View All <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {properties.length > 0 ? (
              properties.map((property) => {
                const image = property.images?.[0] || property.image;
                const location = property.location || {};

                return (
                  <div
                    key={property._id}
                    className="group flex flex-col gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center"
                  >
                    <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-28">
                      <img
                        src={getImageUrl(image)}
                        alt={property.name || "Property"}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/Images/placeholder.jpg";
                        }}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {property.name || "Untitled Property"}
                        </h3>

                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                          {property.listingType || "N/A"}
                        </span>
                      </div>

                      <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        {[
                          location.city,
                          location.state,
                        ].filter(Boolean).join(", ") ||
                          location.address ||
                          "Location not available"}
                      </p>

                      <p className="mt-2 font-bold text-gray-900">
                        ₹{Number(property.price || 0).toLocaleString("en-IN")}
                        {property.listingType === "For Rent" ? "/month" : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          property.approvalStatus === "Approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : property.approvalStatus === "Rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {property.approvalStatus || "Pending"}
                      </span>

                      <Link
                        to={`/dashboard/properties/${property._id}`}
                        aria-label={`View ${property.name || "property"}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="p-8 text-center text-sm text-gray-400">
                No properties found.
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 p-4 text-center">
            <Link
              to="/dashboard/properties"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800"
            >
              View All Properties
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;