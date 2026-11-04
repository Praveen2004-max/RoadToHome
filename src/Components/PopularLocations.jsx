import React, { useEffect, useState } from "react";
import { MapPin, ArrowUpRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../services/api";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/900x600?text=Location";

  if (image.startsWith("http")) return image;

  return `http://localhost:5000${image.startsWith("/") ? "" : "/"}${image}`;
};

const PopularLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await API.get("/locations");
        setLocations(response.data?.locations || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Popular locations load nahi ho paayi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[3px] text-orange-500">
              Find Your Dream Home
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Explore Popular Locations
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              Discover properties in locations selected by our team.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700"
          >
            View All Properties <ArrowUpRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoaderCircle className="animate-spin text-orange-500" size={35} />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
            Popular locations abhi available nahi hain.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Link
                key={location._id}
                to={`/properties?city=${encodeURIComponent(location.city)}`}
                className="group relative h-72 overflow-hidden rounded-3xl shadow-md"
              >
                <img
                  src={getImageUrl(location.image)}
                  alt={location.city}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/900x600?text=Location";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                    <MapPin size={17} />
                    {location.state}
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {location.city}
                      </h3>

                      <p className="mt-2 text-sm text-white/80">
                        {location.propertyCount}{" "}
                        {location.propertyCount === 1
                          ? "Property"
                          : "Properties"}{" "}
                        Available
                      </p>

                      {location.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-white/70">
                          {location.description}
                        </p>
                      )}
                    </div>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 transition group-hover:bg-orange-500 group-hover:text-white">
                      <ArrowUpRight size={21} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularLocations;