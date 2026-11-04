
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  House,
  Building2,
  Castle,
  Store,
  ArrowUpRight,
} from "lucide-react";
import API from "../services/api";

const categories = [
  {
    id: 1,
    name: "Houses",
    description: "Find your perfect family home",
    icon: House,
    image: "/Homes/home9.jpg",
    type: "House",
  },
  {
    id: 2,
    name: "Apartments",
    description: "Modern spaces for modern living",
    icon: Building2,
    image: "/Homes/home10.jpg",
    type: "Apartment",
  },
  {
    id: 3,
    name: "Villas",
    description: "Experience luxury and comfort",
    icon: Castle,
    image: "/Homes/home11.jpg",
    type: "Villa",
  },
  {
    id: 4,
    name: "Commercial",
    description: "Discover spaces for your business",
    icon: Store,
    image: "/Homes/home12.jpg",
    type: "Commercial",
  },
];

const PropertyCategories = () => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch category counts from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get("/properties/categories");

        const categoryList = response.data?.categories || [];

        const counts = {};

        categoryList.forEach((category) => {
          counts[category.name] = category.count;
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="w-full bg-[#f8f9f7] px-4 py-16 sm:px-8 lg:px-16 lg:py-24">

      {/* Section Heading */}
      <div className="mx-auto mb-12 max-w-7xl text-center">

        <span className="mb-4 inline-block rounded-full bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-600">
          Explore Properties
        </span>

        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Find Your Perfect{" "}
          <span className="text-orange-500">Property</span>
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
          Explore a wide range of properties designed to match
          your lifestyle, preferences and budget.
        </p>
      </div>

      {/* Category Cards */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {categories.map((category) => {
          const Icon = category.icon;
          const count = categoryCounts[category.type] || 0;

          return (
            <Link
              key={category.id}
              to={`/properties?propertyType=${encodeURIComponent(category.type)}`}
              className="group relative h-80 overflow-hidden rounded-3xl bg-gray-200 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >

              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = "/Homes/home9.jpg";
                }}
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />

              {/* Top Icon */}
              <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-orange-500">
                <Icon size={23} />
              </div>

              {/* Card Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 text-white">

                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-orange-300">
                  {loading
                    ? "Loading properties..."
                    : `${count} ${count === 1 ? "Property" : "Properties"}`}
                </p>

                <h3 className="text-2xl font-bold">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-gray-200">
                  {category.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/30 pt-4">

                  <span className="text-sm font-semibold">
                    Explore Now
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                    <ArrowUpRight size={19} />
                  </span>

                </div>
              </div>
            </Link>
          );
        })}

      </div>
    </section>
  );
};

export default PropertyCategories;
