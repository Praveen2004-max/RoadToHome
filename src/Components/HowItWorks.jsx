import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MessageCircle,
  CalendarCheck,
  KeyRound,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Search Property",
    description:
      "Explore houses, apartments and villas using your preferred location, property type and budget.",
    icon: Search,
    label: "Explore",
  },
  {
    id: "02",
    title: "Connect with Owner",
    description:
      "Find the right property and connect with its owner to discuss your requirements and queries.",
    icon: MessageCircle,
    label: "Connect",
  },
  {
    id: "03",
    title: "Schedule a Visit",
    description:
      "Arrange a property visit, explore the space and experience your potential new home.",
    icon: CalendarCheck,
    label: "Visit",
  },
  {
    id: "04",
    title: "Book Your Property",
    description:
      "Take the next step towards your dream home and complete your booking process.",
    icon: KeyRound,
    label: "Get Started",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-8 lg:px-16 lg:py-28">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-orange-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">

          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-semibold text-orange-600">
            <CheckCircle2 size={17} />
            Simple Process
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            How It{" "}
            <span className="text-orange-500">Works</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            Your dream home is just a few steps away. Follow our
            simple process to find and book the perfect property.
          </p>

        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Connecting Line - Desktop */}
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden border-t-2 border-dashed border-orange-200 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="group relative flex flex-col items-center text-center"
              >

                {/* Step Icon */}
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-orange-100 bg-white shadow-lg shadow-orange-100/50 transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-3 group-hover:bg-orange-500">

                  <Icon
                    size={35}
                    strokeWidth={1.7}
                    className="text-orange-500 transition-colors duration-300 group-hover:text-white"
                  />

                  {/* Number */}
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white ring-4 ring-white">
                    {step.id}
                  </span>
                </div>

                {/* Step Label */}
                <span className="mt-7 rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
                  {step.label}
                </span>

                {/* Content */}
                <h3 className="mt-4 text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-500">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-7 text-gray-500">
                  {step.description}
                </p>

                {/* Mobile / Tablet Arrow */}
                {index !== steps.length - 1 && (
                  <div className="mt-6 flex items-center justify-center text-orange-300 lg:hidden">
                    <ArrowRight
                      size={22}
                      className="rotate-90 sm:rotate-0"
                    />
                  </div>
                )}

              </div>
            );
          })}

        </div>

        {/* Bottom Banner */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 rounded-3xl bg-[#17251f] px-7 py-9 text-center sm:px-10 md:flex-row md:text-left">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
              Your New Beginning
            </p>

            <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Let's find your dream home together.
            </h3>

            <p className="mt-2 text-sm text-gray-300">
              Start exploring thousands of possibilities today.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
          >
            Start Exploring
            <ArrowUpRight size={19} />
          </Link>

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;