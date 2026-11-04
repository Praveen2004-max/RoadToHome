import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  House,
  ShieldCheck,
  Search,
  Sparkles,
} from "lucide-react";

const HomeCTA = () => {
  return (
    <section className="bg-white px-4 py-16 sm:px-8 lg:px-16 lg:py-24">

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gray-900 shadow-2xl">

        {/* Background Image */}
        <img
          src="/Homes/home11.jpg"
          alt="Beautiful modern dream home"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#101c17]/95 via-[#101c17]/75 to-[#101c17]/20" />

        {/* Decorative Circle */}
        <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full border-[45px] border-white/10" />

        {/* Content */}
        <div className="relative z-10 grid min-h-[490px] grid-cols-1 items-center gap-10 px-7 py-14 sm:px-12 lg:grid-cols-12 lg:px-16 lg:py-20">

          {/* Left Content */}
          <div className="lg:col-span-8">

            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/20 px-5 py-2 text-sm font-semibold text-orange-300 backdrop-blur-md">
              <Sparkles size={17} />
              Your Next Chapter Starts Here
            </span>

            <h2 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Dream Home
              <br />
              Is Closer Than
              <span className="text-orange-400"> You Think.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-8 text-gray-200 sm:text-base">
              Whether you're buying, renting or selling,
              RoadToHome makes your property journey simple.
              Discover spaces that match your lifestyle and
              start building your future today.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">

              <Link
                to="/properties"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600"
              >
                Explore Properties
                <ArrowUpRight size={19} />
              </Link>

              <Link
                to="/user-addProperty"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/40 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-gray-900"
              >
                <House size={18} />
                List Your Property
              </Link>

            </div>

          </div>

          {/* Right Floating Card */}
          <div className="hidden lg:col-span-4 lg:flex lg:justify-end">

            <div className="w-full max-w-[260px] rounded-3xl border border-white/30 bg-white/10 p-7 text-white shadow-xl backdrop-blur-xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
                <ShieldCheck size={25} />
              </div>

              <h3 className="mt-6 text-xl font-bold">
                A Better Way to Find Home
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-200">
                Explore property listings and take your next
                step with confidence.
              </p>

              <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-5 text-sm font-semibold text-orange-300">
                <Search size={17} />
                Start Exploring
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 via-orange-300 to-transparent" />

      </div>

    </section>
  );
};

export default HomeCTA;