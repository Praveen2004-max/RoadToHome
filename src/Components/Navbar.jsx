
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  Home,
  Building2,
  Info,
  Mail,
  LayoutDashboard,
  UserRound,
  LogOut,
  Plus,
  ChevronDown,
  Settings,
  Bell,
  CheckCheck,
  Trash2,
  LoaderCircle,
  BellRing,
  UserCircle,
  House,
} from "lucide-react";

import API from "../services/api";

// Backend URL
const BACKEND_URL = (
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api"
).replace(/\/api\/?$/, "");

// Profile image URL helper
const getProfileImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image.url || image.secure_url || image.path || "";
  }

  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image.replace(
      /^http:\/\/(localhost|127\.0\.0\.1):5000/i,
      BACKEND_URL
    );
  }

  return `${BACKEND_URL}/${image.replace(/^\/+/, "")}`;
};

const Navbar = () => {
  const navigate = useNavigate();

  // User state
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  // Navbar states
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  // Profile image fallback
  const [imageFailed, setImageFailed] = useState(false);

  // Refs
  const notificationDesktopRef = useRef(null);
  const notificationMobileRef = useRef(null);
  const profileRef = useRef(null);

  // Scroll hide/show
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  // Role-based dashboard
  const isAdmin = user?.role === "admin";

  const dashboardPath = isAdmin
    ? "/dashboard"
    : "/user-dashboard";

  const dashboardLabel = isAdmin
    ? "Admin Dashboard"
    : "User Dashboard";

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Get token
  const getToken = () => localStorage.getItem("token");

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setNotificationLoading(true);
      setNotificationError("");

      const response = await API.get("/notifications");

      const notificationList =
        response.data?.notifications || [];

      setNotifications(notificationList);

      setUnreadCount(
        response.data?.unreadCount ??
          notificationList.filter((item) => !item.isRead).length
      );
    } catch (error) {
      console.error(
        "Notification Fetch Error:",
        error.response?.data || error.message
      );

      setNotificationError(
        error.response?.data?.message ||
          "Notifications load nahi ho paaye."
      );
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  // Notification polling
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  // Update user after login/logout/profile update
  useEffect(() => {
    const updateUser = () => {
      try {
        setUser(
          JSON.parse(localStorage.getItem("user") || "null")
        );
      } catch {
        setUser(null);
      }

      setImageFailed(false);
      fetchNotifications();
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("authChanged", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("authChanged", updateUser);
    };
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideDesktop =
        notificationDesktopRef.current?.contains(event.target);

      const clickedInsideMobile =
        notificationMobileRef.current?.contains(event.target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowNotifications(false);
      }

      if (!profileRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Mark one notification as read
  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error.response?.data || error.message
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await API.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark All Read Error:",
        error.response?.data || error.message
      );
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);

      const deletedNotification = notifications.find(
        (item) => item._id === id
      );

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error.response?.data || error.message
      );
    }
  };

  // Notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setShowNotifications(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setImageFailed(false);

    setIsOpen(false);
    setProfileMenuOpen(false);
    setShowNotifications(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/signIn");
  };

  // Format notification time
  const formatTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Profile image
  const ProfileImage = ({
    size = "h-9 w-9",
    iconSize = 20,
  }) => {
    const imageUrl = getProfileImageUrl(user?.profileImage);

    if (!imageUrl || imageFailed) {
      return (
        <div
          className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600`}
        >
          <UserRound size={iconSize} />
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt="Profile"
        onError={() => setImageFailed(true)}
        className={`${size} shrink-0 rounded-full border border-gray-200 object-cover`}
      />
    );
  };

  // Notification panel
  const NotificationPanel = () => (
    <div className="absolute right-0 top-full z-[9999] mt-3 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-2xl">

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div>
          <h3 className="font-bold text-gray-900">
            Notifications
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {unreadCount} unread notifications
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={15} />
          Mark all read
        </button>
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {notificationLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500">
            <LoaderCircle className="animate-spin" size={25} />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notificationError && notifications.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-red-500">
              {notificationError}
            </p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-3 text-sm font-semibold text-orange-600"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <BellRing size={35} strokeWidth={1.5} />

            <p className="mt-3 font-semibold text-gray-600">
              No notifications
            </p>

            <p className="mt-1 text-xs">
              You are all caught up!
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start gap-3 border-b border-gray-100 px-4 py-4 transition hover:bg-orange-50 ${
                !notification.isRead ? "bg-orange-50/60" : ""
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  handleNotificationClick(notification)
                }
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Bell size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-bold text-gray-800">
                      {notification.title}
                    </h4>

                    {!notification.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-[11px] text-gray-400">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
              </button>

              <button
                type="button"
                title="Delete notification"
                onClick={() =>
                  deleteNotification(notification._id)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={fetchNotifications}
          className="w-full text-center text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          Refresh notifications
        </button>
      </div>
    </div>
  );

  // Notification bell
  const renderNotificationBell = (bellRef) => (
    <div
      className="relative z-[100] shrink-0"
      ref={bellRef}
    >
      <button
        type="button"
        onClick={() => {
          setShowNotifications((previous) => !previous);
          setProfileMenuOpen(false);

          if (!showNotifications) {
            fetchNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && <NotificationPanel />}
    </div>
  );

  // Navigation link style
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 text-sm font-semibold transition ${
      isActive
        ? "text-orange-600"
        : "text-gray-700 hover:text-orange-600"
    }`;

  // Profile dropdown
  const ProfileMenu = () => (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        onClick={() => {
          setProfileMenuOpen((previous) => !previous);
          setShowNotifications(false);
        }}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pr-3 transition hover:border-orange-300"
      >
        <ProfileImage />

        <span className="max-w-[110px] truncate text-sm font-semibold text-gray-700">
          {user?.fullName || user?.userName || "My Account"}
        </span>

        <ChevronDown
          size={15}
          className={`transition ${
            profileMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {profileMenuOpen && (
        <div className="absolute right-0 top-full z-[9999] mt-3 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-gray-800">
              {user?.fullName || user?.userName}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user?.email}
            </p>
          </div>

          <Link
            to="/profile"
            onClick={() => setProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <UserCircle size={17} />
            My Profile
          </Link>

          <Link
            to="/my-properties"
            onClick={() => setProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <House size={17} />
            My Properties
          </Link>

          {/* Role-based Dashboard */}
          <Link
            to={dashboardPath}
            onClick={() => setProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <LayoutDashboard size={17} />
            {dashboardLabel}
          </Link>

          {/* Admin-only Settings */}
          {isAdmin && (
            <Link
              to="/dashboard/Settings"
              onClick={() => setProfileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            >
              <Settings size={17} />
              Settings
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav
        className={`fixed left-0 top-0 z-[100] w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md transition-transform duration-500 ease-in-out ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img
              className="h-9 w-auto sm:h-10 md:h-12"
              src="/logo1.png"
              alt="RoadToHome"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-7 md:flex">
            <NavLink to="/" className={navLinkClass}>
              <Home size={17} />
              Home
            </NavLink>

            <NavLink to="/properties" className={navLinkClass}>
              <Building2 size={17} />
              Properties
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              <Info size={17} />
              About
            </NavLink>

            <NavLink to="/contacts" className={navLinkClass}>
              <Mail size={17} />
              Contact
            </NavLink>

            {/* Admin and User Dashboard */}
            {user && (
              <NavLink
                to={dashboardPath}
                className={navLinkClass}
              >
                <LayoutDashboard size={17} />
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Desktop right section */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/user-addProperty"
              className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Plus size={17} />
              Add Property
            </Link>

            {user ? (
              <>
                {renderNotificationBell(notificationDesktopRef)}
                <ProfileMenu />
              </>
            ) : (
              <Link
                to="/signIn"
                className="rounded-full border border-orange-500 px-5 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-500 hover:text-white"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile right section */}
          <div className="flex items-center gap-2 md:hidden">
            {user &&
              renderNotificationBell(notificationMobileRef)}

            <button
              type="button"
              onClick={() => {
                setIsOpen((previous) => !previous);
                setShowNotifications(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="max-h-[80vh] overflow-y-auto border-t border-gray-100 bg-white px-5 py-5 shadow-lg md:hidden">
            <div className="flex flex-col gap-5">
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                <Home size={18} />
                Home
              </NavLink>

              <NavLink
                to="/properties"
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                <Building2 size={18} />
                Properties
              </NavLink>

              <NavLink
                to="/about"
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                <Info size={18} />
                About
              </NavLink>

              <NavLink
                to="/contacts"
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                <Mail size={18} />
                Contact
              </NavLink>

              {/* Role-based Dashboard */}
              {user && (
                <NavLink
                  to={dashboardPath}
                  onClick={() => setIsOpen(false)}
                  className={navLinkClass}
                >
                  <LayoutDashboard size={18} />
                  {dashboardLabel}
                </NavLink>
              )}

              <Link
                to="/user-addProperty"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                <Plus size={18} />
                Add Property
              </Link>

              {user ? (
                <>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
                    <ProfileImage
                      size="h-11 w-11"
                      iconSize={22}
                    />

                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-800">
                        {user.fullName || user.userName}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600"
                  >
                    <UserCircle size={18} />
                    My Profile
                  </Link>

                  <Link
                    to="/my-properties"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600"
                  >
                    <House size={18} />
                    My Properties
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/dashboard/Settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600"
                    >
                      <Settings size={18} />
                      Settings
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 border-t border-gray-100 pt-4 text-left text-sm font-semibold text-red-500 hover:text-red-600"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/signIn"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-orange-500 py-3 text-center font-bold text-orange-600 hover:bg-orange-500 hover:text-white"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Navbar spacer */}
      <div className="h-[68px] w-full" />
    </>
  );
};

export default Navbar;