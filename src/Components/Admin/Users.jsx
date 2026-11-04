
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users as UsersIcon,
  ShieldCheck,
  UserCheck,
  SlidersHorizontal,
  Mail,
  Phone,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import API from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch registered users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/users/admin/all");

      setUsers(
        response.data.users ||
        response.data.data ||
        []
      );
    } catch (err) {
      console.error("Users Fetch Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search and role filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (user.fullName || "").toLowerCase().includes(searchText) ||
        (user.userName || "").toLowerCase().includes(searchText) ||
        (user.email || "").toLowerCase().includes(searchText) ||
        (user.phone || "").includes(search);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const normalUserCount = users.filter(
    (user) => user.role === "user"
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      description: "All registered accounts",
      icon: UsersIcon,
      bgColor: "bg-pink-50",
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Normal Users",
      value: normalUserCount,
      description: "Registered members",
      icon: UserCheck,
      bgColor: "bg-emerald-50",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Administrators",
      value: adminCount,
      description: "Admin accounts",
      icon: ShieldCheck,
      bgColor: "bg-violet-50",
      color: "bg-violet-100 text-violet-600",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    return (name || "User")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            ROADTOHOME / MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Users
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage registered accounts and view member information.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Users
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className={`rounded-2xl border border-gray-200/80 ${stat.bgColor} p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">

        {/* Search and Filters */}
        <div className="border-b border-gray-100 p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              All Accounts
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View all registered members.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={17}
                className="text-gray-400"
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-pink-500 sm:flex-none"
              >
                <option value="All">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-pink-600"
            />
            <p className="mt-3 text-sm text-gray-500">
              Loading registered users...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="px-5 py-16 text-center">
            <p className="font-semibold text-rose-600">{error}</p>

            <button
              onClick={fetchUsers}
              className="mt-4 rounded-lg bg-pink-600 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-gray-50/80"
                    >
                      {/* Profile */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img
                              src={
                                user.profileImage.startsWith("http")
                                  ? user.profileImage
                                  : `http://localhost:5000${user.profileImage}`
                              }
                              alt={user.fullName}
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700">
                              {getInitials(user.fullName)}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.fullName || "Unnamed User"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              @{user.userName || "user"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={13} className="text-gray-400" />
                          {user.phone || "Not provided"}
                        </p>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="text-gray-400"
                          />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="px-5 py-16 text-center">
                <UsersIcon
                  size={40}
                  className="mx-auto mb-3 text-gray-300"
                />

                <h3 className="font-semibold text-gray-800">
                  No users found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or role filter.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {filteredUsers.length} of {users.length} users
              </p>

              <p className="text-xs">
                Live data · Connected to MongoDB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
