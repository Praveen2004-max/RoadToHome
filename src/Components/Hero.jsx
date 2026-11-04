import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  House,
  ShieldCheck,
  Headset,
  ArrowRight,
} from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (location.trim()) params.set("city", location.trim());
    if (propertyType) params.set("propertyType", propertyType);

    if (budget === "2500000") {
      params.set("maxPrice", "2500000");
    } else if (budget === "2500000-5000000") {
      params.set("minPrice", "2500000");
      params.set("maxPrice", "5000000");
    } else if (budget === "5000000") {
      params.set("minPrice", "5000000");
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section
      className="relative flex min-h-[720px] w-full items-center overflow-hidden
      bg-white bg-cover bg-center bg-no-repeat lg:min-h-screen lg:bg-right"
      style={{
        backgroundImage: `linear-gradient(
          to right,
          #ffffff 0%,
          #ffffff 32%,
          rgba(255,255,255,0.96) 43%,
          rgba(255,255,255,0.80) 52%,
          rgba(255,255,255,0.25) 68%,
          transparent 85%
        ), url('/home.jpg')`,
      }}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-orange-100/40 blur-3xl" />

      {/* Hero Content */}
      <div className="relative z-10 w-full px-5 py-24 sm:px-10 lg:w-[68%] lg:px-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50/90 px-4 py-2">
          <span className="size-2 animate-pulse rounded-full bg-orange-500" />
          <p className="text-xs font-bold uppercase tracking-[2px] text-orange-600">
            Buy · Rent · Sell
          </p>
        </div>

        <h1 className="mb-6 text-4xl font-extrabold leading-[1.12]
          tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
          Find Your
          <br />
          <span className="bg-gradient-to-r from-orange-600 to-amber-500
            bg-clip-text text-transparent">
            Road To Home
          </span>
        </h1>

        <p className="mb-9 max-w-lg text-base leading-8 text-slate-500 sm:text-lg">
          Explore the best properties for buying, selling and renting.
          Your perfect home is just a search away.
        </p>

        {/* Dynamic Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-4xl rounded-3xl border border-white/80
            bg-white/95 p-3 shadow-[0_15px_50px_rgba(15,23,42,0.12)]
            ring-1 ring-slate-100 backdrop-blur-xl sm:rounded-full"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Location */}
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl
              px-3 py-2 transition hover:bg-orange-50/60 sm:rounded-full">
              <MapPin className="shrink-0 text-orange-500" size={21} />

              <div className="min-w-0 flex-1">
                <label className="block text-[10px] font-bold uppercase
                  tracking-wider text-slate-400">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search city..."
                  className="w-full bg-transparent text-sm font-medium
                    text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="hidden h-10 w-px bg-slate-200 sm:block" />

            {/* Property Type */}
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl
              px-3 py-2 transition hover:bg-orange-50/60 sm:rounded-full">
              <House className="shrink-0 text-orange-500" size={21} />

              <div className="min-w-0 flex-1">
                <label className="block text-[10px] font-bold uppercase
                  tracking-wider text-slate-400">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm
                    font-medium text-slate-700 outline-none"
                >
                  <option value="">All Properties</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Plot">Plot</option>
                </select>
              </div>
            </div>

            <div className="hidden h-10 w-px bg-slate-200 sm:block" />

            {/* Budget */}
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl
              px-3 py-2 transition hover:bg-orange-50/60 sm:rounded-full">
              <span className="shrink-0 text-xl font-semibold text-orange-500">
                ₹
              </span>

              <div className="min-w-0 flex-1">
                <label className="block text-[10px] font-bold uppercase
                  tracking-wider text-slate-400">
                  Your Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm
                    font-medium text-slate-700 outline-none"
                >
                  <option value="">Any Budget</option>
                  <option value="2500000">Under ₹25 Lakh</option>
                  <option value="2500000-5000000">₹25–50 Lakh</option>
                  <option value="5000000">Above ₹50 Lakh</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="group flex shrink-0 items-center justify-center gap-2
                rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500
                px-7 py-4 text-sm font-bold text-white shadow-lg
                shadow-orange-500/25 transition-all duration-300
                hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30
                active:scale-95 sm:rounded-full"
            >
              <Search size={18} />
              Search
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-10">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center
              rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <House size={22} />
            </span>
            <p className="text-sm font-semibold leading-5 text-slate-700">
              Verified
              <br />
              Properties
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center
              rounded-2xl bg-green-50 text-green-600 ring-1 ring-green-100">
              <ShieldCheck size={22} />
            </span>
            <p className="text-sm font-semibold leading-5 text-slate-700">
              Secure
              <br />
              Transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center
              rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
              <Headset size={22} />
            </span>
            <p className="text-sm font-semibold leading-5 text-slate-700">
              24/7
              <br />
              Support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;