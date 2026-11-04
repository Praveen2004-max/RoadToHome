import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, LoaderCircle, Save } from "lucide-react";
import API from "../../services/api";

const AddLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    city: "",
    state: "",
    country: "India",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const fetchLocation = async () => {
      try {
        const response = await API.get(`/locations/admin/${id}`);
        const location = response.data.location;

        setForm({
          city: location.city || "",
          state: location.state || "",
          country: location.country || "India",
          description: location.description || "",
          displayOrder: location.displayOrder ?? 0,
          isActive: location.isActive ?? true,
        });

        setCurrentImage(location.image || "");
      } catch (err) {
        setError(
          err.response?.data?.message || "Location load nahi ho paayi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit && !image) {
      setError("Please select a city image.");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      setSaving(true);

      if (isEdit) {
        await API.put(`/locations/${id}`, formData);
      } else {
        await API.post("/locations", formData);
      }

      navigate("/dashboard/locations");
    } catch (err) {
      setError(
        err.response?.data?.message || "Location save nahi ho paayi."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="animate-spin text-yellow-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard/locations"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-yellow-600"
        >
          <ArrowLeft size={17} /> Back to Locations
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Location" : "Add Location"}
          </h1>
          <p className="mt-2 text-gray-500">
            Homepage ke Explore Popular Locations section ko manage karein.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
        >
          {error && (
            <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                City *
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                requiyellow
                placeholder="e.g. Jaipur"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                State *
              </label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                requiyellow
                placeholder="e.g. Rajasthan"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Country
              </label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                min="0"
                value={form.displayOrder}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Short Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              requiyellow
              maxLength={500}
              rows={4}
              placeholder="Write a short description about this city..."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              City Cover Image {!isEdit && "*"}
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-yellow-400 hover:bg-yellow-50">
              <ImagePlus size={30} className="mb-2 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">
                Choose image
              </span>
              <span className="mt-1 text-xs text-gray-500">
                JPG, PNG, WEBP
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            {image && (
              <p className="mt-2 text-sm text-green-700">
                Selected: {image.name}
              </p>
            )}

            {!image && currentImage && (
              <img
                src={
                  currentImage.startsWith("http")
                    ? currentImage
                    : `http://localhost:5000${currentImage}`
                }
                alt="Current location"
                className="mt-4 h-48 w-full rounded-xl object-cover"
              />
            )}
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 accent-yellow-500"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-800">
                Active location
              </span>
              <span className="text-xs text-gray-500">
                Active locations homepage par visible hongi.
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard/locations"
              className="rounded-xl border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {isEdit ? "Update Location" : "Save Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocation;