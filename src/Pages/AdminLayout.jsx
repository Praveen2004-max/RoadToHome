import React from "react";
import { Search, Bell, UserRound } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const AdminHooks = [
  {
    hook: "Overview",
    link: "/dashboard",
    textColor: "hover:text-orange-600",
    color: "text-orange-600",
    end: true,
  },
  {
    hook: "Properties",
    link: "/dashboard/properties",
    textColor: "hover:text-green-600",
    color: "text-green-600",
  },
  {
    hook: "Featured Properties",
    link: "/dashboard/featured-properties",
    textColor: "hover:text-yellow-600",
    color: "text-yellow-600",
  },
  {
    hook: "Latest Properties",
    link: "/dashboard/latest-properties",
    textColor: "hover:text-purple-600",
    color: "text-purple-600",
  },
  {
    hook: "Approvals",
    link: "/dashboard/approvals",
    textColor: "hover:text-amber-600",
    color: "text-amber-600",
  },
  {
    hook: "Bookings",
    link: "/dashboard/bookings",
    textColor: "hover:text-indigo-600",
    color: "text-indigo-600",
  },
  {
    hook: "Users",
    link: "/dashboard/users",
    textColor: "hover:text-pink-600",
    color: "text-pink-600",
  },
  {
    hook: "Messages",
    link: "/dashboard/messages",
    textColor: "hover:text-fuchsia-600",
    color: "text-fuchsia-600",
  },
  {
    hook: "Reviews",
    link: "/dashboard/reviews",
    textColor: "hover:text-blue-600",
    color: "text-blue-600",
  },
  {
    hook: "Add-Location",
    link: "/dashboard/add-location",
    textColor: "hover:text-yellow-600",
    color: "text-yellow-600",
  },
  {
    hook: "Location-manage",
    link: "/dashboard/location-manage",
    textColor: "hover:text-yellow-600",
    color: "text-yellow-600",
  },
  {
    hook: "Settings",
    link: "/dashboard/settings",
    textColor: "hover:text-sky-600",
    color: "text-sky-600",
  },
];

const UserHooks = [
  {
    hook: "Bookings",
    link: "/dashboard/bookings",
    textColor: "hover:text-indigo-600",
    color: "text-indigo-600",
  },
  {
    hook: "Messages",
    link: "/dashboard/messages",
    textColor: "hover:text-fuchsia-600",
    color: "text-fuchsia-600",
  },
  {
    hook: "Settings",
    link: "/dashboard/settings",
    textColor: "hover:text-sky-600",
    color: "text-sky-600",
  },
];

const AdminLayout = () => {
  // Logged-in user
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("User data error:", error);
  }

  const isAdmin = user?.role === "admin";

  // Navigation according to role
  const Hooks = isAdmin ? AdminHooks : UserHooks;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-2 sm:p-4 lg:p-5">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">

        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <Link to="/" className="shrink-0">
            <img
              className="h-8 w-auto sm:h-10 md:h-12"
              src="/logo1.png"
              alt="RoadToHome"
            />
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 sm:h-10 sm:w-10"
            >
              <Search size={18} className="text-gray-500" />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 sm:h-10 sm:w-10"
            >
              <Bell size={18} className="text-gray-500" />
            </button>

            <Link
              to="/dashboard/settings"
              aria-label="Profile settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 sm:h-10 sm:w-10"
            >
              <UserRound size={18} className="text-gray-600" />
            </Link>
          </div>
        </header>

        <div className="mt-4 border-b border-gray-200 sm:mt-6" />

        {/* Responsive Navigation */}
        <nav className="mt-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 sm:mt-4 sm:gap-4 md:gap-6 lg:gap-8">
          {Hooks.map((elem) => (
            <NavLink
              key={elem.link}
              to={elem.link}
              end={elem.end}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:text-base ${
                  isActive
                    ? `${elem.color} bg-gray-50`
                    : `text-gray-600 ${elem.textColor}`
                }`
              }
            >
              {elem.hook}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Page Content */}
      <main className="min-w-0 p-2 sm:p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;