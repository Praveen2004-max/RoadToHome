import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import API from "../../services/api";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/600x400?text=No+Image";
  if (image.startsWith("http")) return image;
  return `http://localhost:5000${image.startsWith("/") ? "" : "/"}${image}`;
};

const LocationsAdmin = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/locations/admin/all");
      setLocations(response.data?.locations || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Locations load nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const toggleActive = async (location) => {
    try {
      const formData = new FormData();
      formData.append("isActive", String(!location.isActive));

      await API.put(`/locations/${location._id}`, formData);

      setLocations((previous) =>
        previous.map((item) =>
          item._id === location._id
            ? { ...item, isActive: !item.isActive }
            : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Location status update nahi hua."
      );
    }
  };

  const deleteLocation = async (location) => {
    const confirmed = window.confirm(
      `Kya aap ${location.city} location delete karna chahte hain?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/locations/${location._id}`);

      setLocations((previous) =>
        previous.filter((item) => item._id !== location._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Location delete nahi ho paayi."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              Homepage Content
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Popular Locations
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Homepage ke city cards manage karein.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchLocations}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <Link
              to="/dashboard/locations/add"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <Plus size={17} />
              Add Location
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="animate-spin text-orange-500" size={34} />
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <MapPin className="mx-auto mb-3 text-slate-300" size={38} />
            <h2 className="font-semibold text-slate-800">
              No locations added yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add your first city to display it on the homepage.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {locations.map((location) => (
              <div
                key={location._id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <img
                  src={getImageUrl(location.image)}
                  alt={location.city}
                  className="h-48 w-full object-cover"
                />

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {location.city}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {location.state}, {location.country}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        location.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {location.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mb-5 line-clamp-2 text-sm text-slate-500">
                    {location.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      onClick={() => toggleActive(location)}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      {location.isActive ? "Unpublish" : "Publish"}
                    </button>

                    <div className="flex gap-2">
                      <Link
                        to={`/dashboard/locations/edit/${location._id}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        aria-label="Edit location"
                      >
                        <Pencil size={17} />
                      </Link>

                      <button
                        onClick={() => deleteLocation(location)}
                        className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                        aria-label="Delete location"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsAdmin;