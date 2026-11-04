
import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  BadgeCheck,
  Headset,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Home,
  Users,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Verified Properties",
    description:
      "Explore genuine property listings with detailed information to help you make confident decisions.",
    number: "01",
  },
  {
    id: 2,
    icon: Wallet,
    title: "Best Property Deals",
    description:
      "Discover properties across different budgets and find the right home without compromising.",
    number: "02",
  },
  {
    id: 3,
    icon: Headset,
    title: "Dedicated Support",
    description:
      "Our support team is here to guide you throughout your property search and buying journey.",
    number: "03",
  },
  {
    id: 4,
    icon: Users,
    title: "Trusted Connections",
    description:
      "Connect with property owners and discover opportunities that match your requirements.",
    number: "04",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-[#f8f9f7] px-4 py-20 sm:px-8 lg:px-16 lg:py-28">

      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">

          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-600">
            <BadgeCheck size={17} />
            Why RoadToHome
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Your Journey Home,
            <br />
            <span className="text-orange-500">
              Our Priority.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            Finding a perfect property should feel exciting, not
            complicated. We make your property journey easier,
            smarter and more convenient.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl sm:p-8"
              >

                {/* Number */}
                <span className="absolute right-6 top-5 text-5xl font-black text-gray-100 transition-colors duration-300 group-hover:text-orange-100">
                  {feature.number}
                </span>

                {/* Icon */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-all duration-300 group-hover:rotate-6 group-hover:bg-orange-500 group-hover:text-white">
                  <Icon size={27} strokeWidth={1.8} />
                </div>

                {/* Text */}
                <h3 className="mt-7 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {feature.description}
                </p>

                {/* Bottom line */}
                <div className="mt-7 h-1 w-12 rounded-full bg-orange-200 transition-all duration-500 group-hover:w-full group-hover:bg-orange-500" />

              </div>
            );
          })}

        </div>

        {/* Bottom CTA */}
        <div className="relative mt-14 overflow-hidden rounded-[2rem] bg-[#17251f] px-7 py-10 sm:px-12 sm:py-14">

          {/* Decoration */}
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-2 border-white/5" />
          <div className="absolute -bottom-24 right-48 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

            <div className="max-w-2xl">

              <span className="text-sm font-semibold uppercase tracking-widest text-orange-400">
                Start Your Journey
              </span>

              <h3 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                Ready to find a place
                <br className="hidden sm:block" />
                you'll love to call home?
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300">
                Explore our property collection and take the first
                step towards your dream home.
              </p>

            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

              <Link
                to="/properties"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
              >
                Explore Properties
                <ArrowUpRight size={19} />
              </Link>

              <Link
                to="/contacts"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-white hover:text-gray-900"
              >
                Contact Us
              </Link>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;