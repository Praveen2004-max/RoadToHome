
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  House,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import API from "../services/api";
import Footer from "../Components/Footer";

const contactOptions = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Have a question? Send us an email.",
    value: "Contact form available",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Our support contact details.",
    value: "Contact details coming soon",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: MapPin,
    title: "Our Location",
    description: "Explore properties across locations.",
    value: "Explore our property locations",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const faqs = [
  {
    question: "How can I find my dream property?",
    answer:
      "Visit our Properties page to explore available homes. You can use search and filter options to find properties according to your location, budget and requirements.",
  },
  {
    question: "Can I list my property on RoadToHome?",
    answer:
      "Yes! Create an account, sign in and use the Add Property option to submit your property listing. Your listing will go through the approval process before being published.",
  },
  {
    question: "Can I schedule a property visit?",
    answer:
      "Yes. Open a property listing and use the booking option to request a visit. You can track your booking status from your account.",
  },
  {
    question: "How can I contact a property owner?",
    answer:
      "Open the property details page and use the available contact or booking options to connect with the property owner.",
  },
  {
    question: "How can I get help with my account?",
    answer:
      "Send us an enquiry using the contact form. Our support team can review your message through the Messages section of the admin dashboard.",
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "Property Enquiry",
  message: "",
};

const Contacts = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("Message must contain at least 10 characters.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      };

      const response = await API.post("/messages", payload);

      setSuccess(
        response.data?.message ||
          "Your message has been submitted successfully!"
      );

      setForm(initialForm);
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-800">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative isolate mt-20 overflow-hidden bg-gray-950">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-orange-200 backdrop-blur">
              <Sparkles size={16} />
              We're Here to Help
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Let's Find Your
              <span className="block text-orange-400">
                Way Home.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-300 sm:text-lg">
              Questions about buying, selling or renting? Our team is here
              to help you take the next step in your property journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-1 hover:bg-orange-500"
              >
                Send a Message
                <ArrowRight size={18} />
              </a>

              <Link
                to="/properties"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <House size={18} />
                Explore Homes
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-3 text-sm text-gray-300">
              <div className="flex -space-x-2">
                {["A", "R", "S"].map((letter, index) => (
                  <div
                    key={letter}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-950 text-xs font-bold text-white ${
                      index === 0
                        ? "bg-orange-600"
                        : index === 1
                        ? "bg-violet-600"
                        : "bg-emerald-600"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span>Here to help you move forward</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-3 rotate-3 rounded-3xl bg-orange-500/20" />

            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <img
                src="/Homes/home10.jpg"
                alt="Modern home interior"
                className="h-72 w-full rounded-2xl object-cover sm:h-96"
              />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/50 bg-white/95 p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Headphones size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Need a little guidance?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start with a message. We'll help you find the next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="mb-9 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            Get in Touch
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            We'd Love to Hear From You
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-500">
            Choose the most convenient way to connect with RoadToHome.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <article
                key={option.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${option.color} transition duration-300 group-hover:scale-110`}
                >
                  <Icon size={25} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {option.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {option.description}
                </p>

                <p className="mt-4 break-words text-sm font-semibold text-orange-600">
                  {option.value}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* FORM + SIDE PANEL */}
      <section
        id="contact-form"
        className="scroll-mt-24 bg-gray-50 px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          {/* LEFT INFORMATION */}
          <div className="lg:sticky lg:top-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Contact Our Team
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              Tell Us What
              <span className="text-orange-600"> You Need.</span>
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Whether you're searching for a home, exploring a listing or
              need help using our platform, share your question below.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Your Details Stay Yours
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    We collect the details needed to handle your enquiry.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <MessageCircle size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Tell Us About Your Needs
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Add enough detail so your enquiry is clear.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Clock size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Simple and Convenient
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Submit your enquiry whenever it suits you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/60 sm:p-8 lg:p-10"
          >
            <div className="mb-7">
              <h3 className="text-2xl font-extrabold text-gray-900">
                Send Us a Message
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Fields marked with * are required.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name *
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address *
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={15}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Enquiry Type *
                </label>

                <select
                  id="contact-subject"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                >
                  <option>Property Enquiry</option>
                  <option>Buying a Property</option>
                  <option>Selling a Property</option>
                  <option>Renting a Property</option>
                  <option>List My Property</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Your Message *
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  disabled={loading}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-right text-xs text-gray-400">
                  {form.message.length}/2000
                </p>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
              >
                <AlertCircle size={21} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <div
                role="status"
                className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
              >
                <CheckCircle2 size={21} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-bold">Message submitted successfully!</p>
                  <p className="mt-1 text-sm leading-6">{success}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* LOCATION */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            Find Us
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Let's Connect, Wherever You Are.
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Looking for a property in your city? Explore our listings and
            discover available options for your next move.
          </p>

          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 font-bold text-orange-600 hover:text-orange-800"
          >
            Explore Properties
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 via-gray-100 to-indigo-100 p-8">
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />

          <div className="absolute -bottom-16 -right-8 h-48 w-48 rounded-full bg-violet-200/60 blur-2xl" />

          <div className="relative max-w-sm rounded-2xl border border-white/80 bg-white/90 p-7 text-center shadow-xl backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white">
              <MapPin size={27} />
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Your Next Home Awaits
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Explore properties across locations and find the right fit
              for your lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              FAQs
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-4 leading-7 text-gray-500">
              Quick answers to common questions about RoadToHome.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border bg-white transition ${
                    isOpen
                      ? "border-orange-200 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-bold text-gray-900">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-orange-600 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="border-t border-gray-100 pt-4 text-sm leading-7 text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#102c26] p-7 text-white sm:p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Still Looking for Your Perfect Home?
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-gray-300">
              Explore available properties and take the next step toward
              finding your place.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition hover:-translate-y-1 hover:bg-orange-600"
          >
            Browse Properties
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <Link to="/">
            <img
              className="h-12"
              src="/logo1.png"
              alt="RoadToHome"
            />
          </Link>

          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} RoadToHome. All rights reserved.
          </p>
        </div>
      </footer>
      <Footer/>
    </main>
  );
};

export default Contacts;
