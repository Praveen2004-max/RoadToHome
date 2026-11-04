import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../Components/Navbar.jsx";
import CustomerFilterBuy from "../Components/CustomerFilterBuy.jsx";
import PropertyListing from "../Components/PropertyListing.jsx";
import HouseDetails from "../Components/HouseDetails.jsx";

import { getAllProperties } from "../services/propertyService";
import Footer from "../Components/Footer.jsx";

const Properties = () => {
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read search filters coming from Hero section
  useEffect(() => {
    const city = searchParams.get("city") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const hasSearchParams =
      city || propertyType || minPrice || maxPrice;

    if (hasSearchParams) {
      setFilters({
        keyword: "",
        location: city,
        propertyType,
        listingType: "All",
        bedrooms: "",
        bathrooms: "",
        minPrice: minPrice ? Number(minPrice) : 0,
        maxPrice: maxPrice ? Number(maxPrice) : 100000000,
        minSize: 0,
        maxSize: 10000,
        amenities: [],
      });
    }
  }, [searchParams]);

  // Fetch approved properties from backend
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllProperties();

      const propertyData = Array.isArray(response)
        ? response
        : response?.properties ||
          response?.data?.properties ||
          response?.data ||
          [];

      if (!Array.isArray(propertyData)) {
        throw new Error("Invalid properties response from server.");
      }

      setProperties(propertyData);
    } catch (err) {
      console.error("Property Fetch Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Properties could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSelectHouse = (house) => {
    setSelectedHouse((previous) =>
      previous?._id === house._id ? null : house
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fb]">
      <Navbar />

      <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-orange-500">
              Discover your next home
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Explore Properties
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Find the perfect property that matches your lifestyle,
              location and budget.
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-400">
              Properties Available
            </p>
            <p className="text-2xl font-extrabold text-orange-600">
              {properties.length}
            </p>
          </div>
        </div>

        {/* Main Layout */}
        <main
          className={`grid items-start gap-6 ${
            selectedHouse
              ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]"
              : "grid-cols-1"
          }`}
        >
          <section
            className={`grid min-w-0 items-start gap-6 ${
              selectedHouse
                ? "grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]"
                : "grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]"
            }`}
          >
            {/* Filters */}
            <CustomerFilterBuy
              initialFilters={filters}
              onApplyFilters={setFilters}
            />

            {/* Listings */}
            <div className="min-w-0">
              {loading ? (
                <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center shadow-sm">
                  <div className="mx-auto mb-4 size-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                  <p className="font-medium text-slate-500">
                    Finding your perfect home...
                  </p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-white px-5 py-16 text-center">
                  <p className="font-semibold text-red-600">{error}</p>

                  <button
                    onClick={fetchProperties}
                    className="mt-5 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <PropertyListing
                  properties={properties}
                  filters={filters}
                  onSelectHouse={handleSelectHouse}
                  selectedHouse={selectedHouse}
                />
              )}
            </div>
          </section>

          {/* Selected Property Details */}
          {selectedHouse && (
            <HouseDetails
              key={selectedHouse._id}
              elem={selectedHouse}
              onClose={() => setSelectedHouse(null)}
            />
          )}
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default Properties;