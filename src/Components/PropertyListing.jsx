import React, { useMemo, useState } from "react";
import {
  MapPin,
  BedDouble,
  Bath,
  Heart,
  Maximize,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "/Homes/home1.jpg";

  const imagePath =
    typeof image === "string" ? image : image.url || image.path;

  if (!imagePath) return "/Homes/home1.jpg";

  if (imagePath.startsWith("http")) return imagePath;

  return `${BACKEND_URL}${
    imagePath.startsWith("/") ? "" : "/"
  }${imagePath}`;
};

const PropertyListing = ({
  properties = [],
  onSelectHouse,
  selectedHouse,
  searchTerm = "",
  listingType = "All",
  propertyType = "All",
}) => {
  const [favorites, setFavorites] = useState([]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const search = searchTerm.toLowerCase();

      const searchableText = [
        property.name,
        property.description,
        property.location?.city,
        property.location?.state,
        property.propertyType,
        property.listingType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search);

      const matchesListing =
        listingType === "All" ||
        property.listingType === listingType;

      const matchesType =
        propertyType === "All" ||
        property.propertyType === propertyType;

      return (
        matchesSearch &&
        matchesListing &&
        matchesType &&
        property.approvalStatus === "Approved" &&
        property.status === "Available"
      );
    });
  }, [properties, searchTerm, listingType, propertyType]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();

    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  if (!properties.length) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-xl font-semibold text-gray-700">
          No properties available
        </h3>
        <p className="mt-2 text-gray-500">
          Properties will appear here when they are approved.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Available Properties
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {filteredProperties.length} properties found
          </p>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-14 text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            No matching properties found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProperties.map((property) => {
            const image = property.images?.[0];
            const imageUrl = getImageUrl(image);
            const isSelected =
              selectedHouse?._id === property._id;

            const location = [
              property.location?.city,
              property.location?.state,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <article
                key={property._id}
                onClick={() => onSelectHouse?.(property)}
                className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? "border-orange-500 ring-2 ring-orange-200"
                    : "border-gray-200"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={property.name}
                    onError={(e) => {
                      e.currentTarget.src = "/Homes/home1.jpg";
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow">
                    {property.listingType}
                  </span>

                  <button
                    type="button"
                    onClick={(e) =>
                      toggleFavorite(e, property._id)
                    }
                    className="absolute right-4 top-4 rounded-full bg-white p-2 shadow transition hover:scale-110"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      size={19}
                      className={
                        favorites.includes(property._id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }
                    />
                  </button>

                  {property.isFeatured && (
                    <span className="absolute bottom-4 left-4 rounded-md bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {property.name}
                    </h3>

                    <p className="whitespace-nowrap font-bold text-orange-600">
                      ₹{Number(property.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={16} className="text-orange-500" />
                    {location || "Location not available"}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BedDouble size={17} />
                      {property.bedrooms ?? 0} Beds
                    </span>

                    <span className="flex items-center gap-1">
                      <Bath size={17} />
                      {property.bathrooms ?? 0} Baths
                    </span>

                    <span className="flex items-center gap-1">
                      <Maximize size={17} />
                      {property.area?.value ?? 0}{" "}
                      {property.area?.unit || "sqft"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHouse?.(property);
                    }}
                    className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
                  >
                    View Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PropertyListing;