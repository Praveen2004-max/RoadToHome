import React, { useEffect, useState } from "react";
import { MoveRight, RotateCcw, SlidersHorizontal } from "lucide-react";

const DEFAULT_FILTERS = {
  keyword: "",
  location: "",
  propertyType: "",
  listingType: "All",
  bedrooms: "",
  bathrooms: "",
  minPrice: 0,
  maxPrice: 100000000,
  minSize: 0,
  maxSize: 10000,
  amenities: [],
};

const amenityList = [
  "Air Conditioner",
  "Cable TV",
  "Ceiling Height",
  "Fireplace",
  "Swimming Pool",
  "Garden",
  "Parking",
  "WiFi",
];

const formatPrice = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(0)} L`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const RangeSlider = ({
  label,
  min,
  max,
  values,
  setValues,
  step,
  formatValue,
}) => {
  const updateValue = (index, value) => {
    const next = [...values];
    next[index] = Number(value);

    if (index === 0 && next[0] > next[1]) {
      next[0] = next[1];
    }

    if (index === 1 && next[1] < next[0]) {
      next[1] = next[0];
    }

    setValues(next);
  };

  const left = ((values[0] - min) / (max - min)) * 100;
  const right = ((values[1] - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-xs font-semibold text-orange-600">
          {formatValue(values[0])} – {formatValue(values[1])}
        </p>
      </div>

      <div className="relative h-7">
        <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-orange-100" />

        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-orange-500"
          style={{
            left: `${left}%`,
            width: `${right - left}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[0]}
          onChange={(e) => updateValue(0, e.target.value)}
          aria-label={`${label} minimum`}
          className="dual-range-thumb pointer-events-none absolute inset-0 z-20 h-7 w-full appearance-none bg-transparent"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[1]}
          onChange={(e) => updateValue(1, e.target.value)}
          aria-label={`${label} maximum`}
          className="dual-range-thumb pointer-events-none absolute inset-0 z-30 h-7 w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
};

const CustomerFilterBuy = ({ onApplyFilters, initialFilters }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [price, setPrice] = useState([
    DEFAULT_FILTERS.minPrice,
    DEFAULT_FILTERS.maxPrice,
  ]);
  const [size, setSize] = useState([
    DEFAULT_FILTERS.minSize,
    DEFAULT_FILTERS.maxSize,
  ]);
  const [amenities, setAmenities] = useState([]);

  // Sync filters coming from Hero search
  useEffect(() => {
    if (!initialFilters) return;

    setFilters((prev) => ({
      ...prev,
      ...initialFilters,
    }));

    setPrice([
      initialFilters.minPrice ?? 0,
      initialFilters.maxPrice ?? 100000000,
    ]);

    setSize([
      initialFilters.minSize ?? 0,
      initialFilters.maxSize ?? 10000,
    ]);

    setAmenities(initialFilters.amenities || []);
  }, [initialFilters]);

  const updateFilter = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const handleFindProperties = (e) => {
    e.preventDefault();

    onApplyFilters?.({
      ...filters,
      minPrice: price[0],
      maxPrice: price[1],
      minSize: size[0],
      maxSize: size[1],
      amenities,
    });
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPrice([0, 100000000]);
    setSize([0, 10000]);
    setAmenities([]);
    onApplyFilters?.(null);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50";

  return (
    <aside className="h-fit w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Smart Filters</h2>
            <p className="text-xs text-slate-400">
              Find your ideal property
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          title="Reset filters"
          className="rounded-full p-2 text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
        >
          <RotateCcw size={17} />
        </button>
      </div>

      <form onSubmit={handleFindProperties} className="space-y-6 p-5">
        {/* Listing Type */}
        <div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Listing Type
          </label>

          <div className="grid grid-cols-2 gap-2">
            {["All", "For Buy", "For Rent", "For Sale"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, listingType: type }))
                }
                className={`rounded-xl px-2 py-3 text-xs font-bold transition ${
                  filters.listingType === type
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Search Property
          </label>

          <input
            name="keyword"
            value={filters.keyword}
            onChange={updateFilter}
            placeholder="Property name or keyword"
            className={inputClass}
          />

          <input
            name="location"
            value={filters.location}
            onChange={updateFilter}
            placeholder="City or location"
            className={inputClass}
          />

          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={updateFilter}
            className={inputClass}
          >
            <option value="">All Property Types</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="Hotel">Hotel</option>
            <option value="Plot">Plot</option>
          </select>
        </div>

        {/* Bedrooms and Bathrooms */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-500">
              Bedrooms
            </label>

            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n === 5 ? "5+" : n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-500">
              Bathrooms
            </label>

            <select
              name="bathrooms"
              value={filters.bathrooms}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 4 ? "4+" : n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price and Size */}
        <div className="space-y-7 rounded-2xl bg-slate-50 p-4">
          <RangeSlider
            label="Price Range"
            min={0}
            max={100000000}
            values={price}
            setValues={setPrice}
            step={50000}
            formatValue={formatPrice}
          />

          <div className="border-t border-slate-200" />

          <RangeSlider
            label="Property Size"
            min={0}
            max={10000}
            values={size}
            setValues={setSize}
            step={50}
            formatValue={(value) => `${value} sqft`}
          />
        </div>

        {/* Amenities */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Amenities
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {amenityList.map((amenity) => (
              <label
                key={amenity}
                className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="size-4 accent-orange-500"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
          >
            Find Properties
            <MoveRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Reset All Filters
          </button>
        </div>
      </form>

      <style>{`
        .dual-range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #f97316;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #f97316;
          cursor: grab;
        }

        .dual-range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #f97316;
          border: 3px solid white;
          cursor: grab;
        }
      `}</style>
    </aside>
  );
};

export default CustomerFilterBuy;