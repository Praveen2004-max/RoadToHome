
import { useEffect, useState } from "react";
import {
  UserRound,
  LockKeyhole,
  Bell,
  Palette,
  ShieldCheck,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Home,
  LogOut,
} from "lucide-react";

import API from "../../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://roadtohome-api.onrender.com/api";

const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image.url || image.path || "";
  }

  if (typeof image !== "string" || !image.trim()) return "";

  image = image.trim();

  if (/^https?:\/\//i.test(image)) {
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      IMAGE_BASE_URL
    );
  }

  return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const DEFAULT_NOTIFICATIONS = {
  bookings: true,
  messages: true,
  newUsers: false,
  weeklyReport: true,
  emailUpdates: false,
};

const DEFAULT_PREFERENCES = {
  theme: "light",
  language: "English",
  currency: "INR (₹)",
  timezone: "Asia/Kolkata",
};

const readStoredSettings = (key, defaults) => {
  try {
    const stored = localStorage.getItem(key);

    return stored
      ? { ...defaults, ...JSON.parse(stored) }
      : defaults;
  } catch {
    return defaults;
  }
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "user",
    location: "",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState(() =>
    readStoredSettings(
      "RoadToHomeNotifications",
      DEFAULT_NOTIFICATIONS
    )
  );

  const [preferences, setPreferences] = useState(() =>
    readStoredSettings(
      "RoadToHomePreferences",
      DEFAULT_PREFERENCES
    )
  );

  const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "security", label: "Security", icon: LockKeyhole },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "account", label: "Account", icon: ShieldCheck },
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  // Fetch logged-in user profile
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");

        const response = await API.get("/users/profile");

        const user =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.data ||
          response.data;

        if (!isMounted || !user) return;

        setProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "user",
          location: user.location || "",
        });

        if (user.profileImage) {
          setImagePreview(getImageUrl(user.profileImage));
        }
      } catch (err) {
        if (isMounted) {
          console.error(
            "Fetch profile error:",
            err.response?.data || err
          );

          setError(
            err.response?.data?.message ||
              "Unable to load profile information."
          );
        }
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Revoke temporary image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Update profile inputs
  const updateProfile = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  // Select profile image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setError("");
    setSaved(false);
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Save settings
  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSaved(false);

    // Security tab
    if (activeTab === "security") {
      if (!password.current) {
        setError("Please enter your current password.");
        return;
      }

      if (password.newPassword.length < 8) {
        setError(
          "New password must contain at least 8 characters."
        );
        return;
      }

      if (password.newPassword !== password.confirm) {
        setError(
          "New password and confirmation do not match."
        );
        return;
      }

      setError(
        "Password change API is not connected yet. Please add a backend password update route."
      );
      return;
    }

    // Notifications tab
    if (activeTab === "notifications") {
      try {
        localStorage.setItem(
          "RoadToHomeNotifications",
          JSON.stringify(notifications)
        );

        setSaved(true);
      } catch {
        setError("Unable to save notification preferences.");
      }

      return;
    }

    // Preferences tab
    if (activeTab === "preferences") {
      try {
        localStorage.setItem(
          "RoadToHomePreferences",
          JSON.stringify(preferences)
        );

        setSaved(true);
      } catch {
        setError("Unable to save preferences.");
      }

      return;
    }

    // Profile tab
    if (activeTab !== "profile") return;

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("fullName", profile.fullName.trim());
      formData.append("email", profile.email.trim());
      formData.append("phone", profile.phone);
      formData.append("location", profile.location);

      if (profileImage) {
        formData.append("image", profileImage);
      }

      const response = await API.put(
        "/users/profile",
        formData
      );

      const updatedUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        response.data;

      setProfile((prev) => ({
        ...prev,
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        location: updatedUser.location || "",
        role: updatedUser.role || prev.role,
      }));

      // Update localStorage user information
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const updatedLocalUser = {
          ...storedUser,
          ...updatedUser,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedLocalUser)
        );

        window.dispatchEvent(new Event("authChanged"));
      } catch (storageError) {
        console.error("Local user update error:", storageError);
      }

      if (updatedUser.profileImage) {
        setImagePreview(getImageUrl(updatedUser.profileImage));
      }

      setProfileImage(null);
      setSaved(true);
    } catch (err) {
      console.error(
        "Update profile error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle notification
  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  // Update preferences
  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  // Logout
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("RoadToHomeUser");

    window.dispatchEvent(new Event("authChanged"));

    window.location.href = "/";
  };

  // Apply theme and persist preferences
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      preferences.theme === "dark"
    );

    try {
      localStorage.setItem(
        "RoadToHomePreferences",
        JSON.stringify(preferences)
      );
    } catch (err) {
      console.error("Preference storage error:", err);
    }
  }, [preferences]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Home size={16} />
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-sky-600">Settings</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your profile, security and website preferences.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="User profile"
                onError={() => setImagePreview("")}
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <UserRound size={22} />
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-800">
                {profile.fullName || "User"}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {profile.role}
              </p>
            </div>
          </div>
        </div>

        {/* Success */}
        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} />
            Changes saved successfully.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loadingProfile ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading profile...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="px-3 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                General
              </p>

              <div className="flex gap-2 overflow-x-auto lg:flex-col">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setError("");
                        setSaved(false);
                      }}
                      className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={19} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 hidden rounded-xl bg-slate-50 p-4 lg:block">
                <ShieldCheck
                  className="mb-3 text-sky-600"
                  size={24}
                />

                <p className="text-sm font-semibold text-slate-800">
                  Keep your account secure
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Use a strong password and keep your account details updated.
                </p>
              </div>
            </aside>

            {/* Main Content */}
            <main className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Profile */}
              {activeTab === "profile" && (
                <form onSubmit={handleSave}>
                  <SectionHeader
                    title="Profile Information"
                    description="Update the personal information associated with your account."
                  />

                  <div className="space-y-6 p-5 sm:p-7">
                    {/* Profile Image */}
                    <div className="flex flex-wrap items-center gap-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="h-20 w-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-100 text-3xl font-bold text-sky-700">
                          {(profile.fullName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-slate-800">
                          Profile photo
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          JPG, PNG or WebP. Maximum 5 MB.
                        </p>

                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          <Camera size={15} />
                          Change photo

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Full name
                        </label>

                        <input
                          className={inputClass}
                          name="fullName"
                          value={profile.fullName}
                          onChange={updateProfile}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Email address
                        </label>

                        <input
                          className={inputClass}
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={updateProfile}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Phone number
                        </label>

                        <input
                          className={inputClass}
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={updateProfile}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Role
                        </label>

                        <input
                          className={`${inputClass} bg-slate-50`}
                          value={profile.role}
                          readOnly
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelClass}>
                          Location
                        </label>

                        <input
                          className={inputClass}
                          name="location"
                          value={profile.location}
                          onChange={updateProfile}
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                  </div>

                  <SaveFooter saving={saving} />
                </form>
              )}

              {/* Security */}
              {activeTab === "security" && (
                <form onSubmit={handleSave}>
                  <SectionHeader
                    title="Security Settings"
                    description="Review your password security."
                  />

                  <div className="max-w-2xl space-y-5 p-5 sm:p-7">
                    {[
                      {
                        key: "current",
                        label: "Current password",
                      },
                      {
                        key: "newPassword",
                        label: "New password",
                      },
                      {
                        key: "confirm",
                        label: "Confirm new password",
                      },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className={labelClass}>
                          {field.label}
                        </label>

                        <div className="relative">
                          <input
                            className={`${inputClass} pr-12`}
                            type={showPassword ? "text" : "password"}
                            value={password[field.key]}
                            onChange={(e) =>
                              setPassword((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            required
                            minLength={
                              field.key === "current"
                                ? undefined
                                : 8
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((prev) => !prev)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      Password changes are not connected to the backend yet.
                      This form currently validates the password fields only.
                    </div>
                  </div>

                  <SaveFooter saving={false} />
                </form>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <form onSubmit={handleSave}>
                  <SectionHeader
                    title="Notification Settings"
                    description="Choose which updates you want to receive."
                  />

                  <div className="divide-y divide-slate-100 px-5 sm:px-7">
                    {[
                      {
                        key: "bookings",
                        title: "New bookings",
                        description:
                          "Get notified when a property is booked.",
                      },
                      {
                        key: "messages",
                        title: "Customer messages",
                        description:
                          "Receive alerts when customers contact you.",
                      },
                      {
                        key: "newUsers",
                        title: "New user registrations",
                        description:
                          "Know when a new user joins RoadToHome.",
                      },
                      {
                        key: "weeklyReport",
                        title: "Weekly reports",
                        description:
                          "Get a weekly summary of website activity.",
                      },
                      {
                        key: "emailUpdates",
                        title: "Product updates",
                        description:
                          "Receive updates and feature announcements.",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-4 py-5"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifications[item.key]}
                          onClick={() =>
                            toggleNotification(item.key)
                          }
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            notifications[item.key]
                              ? "bg-sky-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                              notifications[item.key]
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <SaveFooter saving={false} />
                </form>
              )}

              {/* Preferences */}
              {activeTab === "preferences" && (
                <form onSubmit={handleSave}>
                  <SectionHeader
                    title="Preferences"
                    description="Customize how the dashboard is displayed."
                  />

                  <div className="space-y-6 p-5 sm:p-7">
                    {/* Theme */}
                    <div>
                      <label className={labelClass}>
                        Appearance
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {["light", "dark"].map((theme) => (
                          <button
                            type="button"
                            key={theme}
                            onClick={() =>
                              updatePreference("theme", theme)
                            }
                            className={`rounded-xl border p-4 text-left transition ${
                              preferences.theme === theme
                                ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500/10"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`mb-3 h-12 rounded-lg border ${
                                theme === "dark"
                                  ? "border-slate-700 bg-slate-900"
                                  : "border-slate-200 bg-white"
                              }`}
                            />

                            <p className="font-semibold capitalize text-slate-800">
                              {theme} mode
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {theme === "light"
                                ? "Bright and clean appearance"
                                : "Dark appearance preference"}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language and Currency */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Language
                        </label>

                        <select
                          className={inputClass}
                          value={preferences.language}
                          onChange={(e) =>
                            updatePreference(
                              "language",
                              e.target.value
                            )
                          }
                        >
                          <option>English</option>
                          <option>Hindi</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Currency
                        </label>

                        <select
                          className={inputClass}
                          value={preferences.currency}
                          onChange={(e) =>
                            updatePreference(
                              "currency",
                              e.target.value
                            )
                          }
                        >
                          <option>INR (₹)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelClass}>
                          Time zone
                        </label>

                        <select
                          className={inputClass}
                          value={preferences.timezone}
                          onChange={(e) =>
                            updatePreference(
                              "timezone",
                              e.target.value
                            )
                          }
                        >
                          <option value="Asia/Kolkata">
                            India Standard Time (IST)
                          </option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">
                            Eastern Time
                          </option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs leading-5 text-slate-500">
                      Preferences are saved in this browser. Dashboard-wide
                      themes, translations and currency formatting need
                      additional implementation.
                    </p>
                  </div>

                  <SaveFooter saving={false} />
                </form>
              )}

              {/* Account */}
              {activeTab === "account" && (
                <div>
                  <SectionHeader
                    title="Account Management"
                    description="Account information and administrative options."
                  />

                  <div className="space-y-5 p-5 sm:p-7">
                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Account status
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Current status of your account.
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Account access
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Access control is enforced by your backend.
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold capitalize text-sky-700">
                        {profile.role}
                      </span>
                    </div>

                    {/* Logout */}
                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-800">
                          Log out
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Sign out from this device.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                      <h3 className="font-semibold text-rose-700">
                        Danger zone
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Account deletion is not connected to the backend.
                        No account will be deleted from this page.
                      </p>

                      <button
                        type="button"
                        disabled
                        className="mt-4 cursor-not-allowed rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-400"
                      >
                        Delete account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-slate-100 p-5 sm:p-7">
      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SaveFooter({ saving }) {
  return (
    <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:px-7">
      <p className="text-xs text-slate-500">
        Profile changes are saved to your account. Other settings are saved
        in this browser.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save size={17} />
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

export default Settings;