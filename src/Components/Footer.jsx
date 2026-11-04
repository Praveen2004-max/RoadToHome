import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
const footerLinks = [
{
  title: "Platform",
  links: [
  { name: "Buy Property", path: "/properties" },
  { name: "Rent Property", path: "/properties" },
  { name: "Sell Property", path: "/user-addProperty" },
  { name: "My Properties", path: "/my-properties" },
  ],
},
{
  title: "Solutions",
  links: [
  { name: "Help Center", path: "/contacts" },
  { name: "Feedback", path: "/contacts" },
  { name: "Resolution", path: "/contacts" },
  { name: "Support", path: "/contacts" },
  ],
},
{
  title: "Company",
  links: [
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contacts" },
  { name: "My Profile", path: "/profile" },
  { name: "Home", path: "/" },
  ],
},
];

const socialLinks = [
{
  name: "LinkedIn",
  icon: "/Icons/linkedin.svg",
  url: "https://www.linkedin.com",
},
{
  name: "Instagram",
  icon: "/Icons/instagram.svg",
  url: "https://www.instagram.com",
},
{
  name: "Facebook",
  icon: "/Icons/facebook.svg",
  url: "https://www.facebook.com",
},
];

return (
<footer className="w-full bg-[#f8f7f5] px-4 pt-8 sm:px-7 lg:px-12">

  {/* CTA Banner */}
  <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">

    <img
      src="/footer.jpg"
      alt="Dream home"
      className="absolute inset-0 h-full w-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />

    <div className="relative flex h-auto flex-col items-start justify-center px-6 py-12 sm:min-h-100 sm:px-12 lg:px-16">

      <span className="mb-5 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[3px] text-white backdrop-blur-md">
        Find Your Perfect Place
      </span>

      <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
        Choose Your Dream Home
        <br />
        <span className="text-orange-300">
          Build Your Future Together.
        </span>
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
        Discover beautiful properties, explore new opportunities
        and find a place your family will love.
      </p>

      <Link
        to="/properties"
        className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all duration-300 hover:bg-orange-500 hover:text-white"
      >
        Explore Properties
        <ArrowUpRight
          size={17}
          className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
        />
      </Link>

    </div>
  </div>

  {/* Main Footer */}
  <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">

    {/* Brand Section */}
    <div>
      <Link to="/" className="shrink-0">
        <img
          className="h-9 w-auto sm:h-10 md:h-12"
          src="/logo1.png"
          alt="RoadToHome"
        />
      </Link>

      <p className="mt-5 max-w-xs text-sm leading-7 text-gray-500">
        Your trusted destination for discovering, buying and renting
        beautiful properties. Find a place that feels like home.
      </p>

      <a
        href="mailto:support@roadtohome.com"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-800 transition-colors hover:text-orange-500"
      >
        <Mail size={17} />
        support@roadtohome.com
      </a>

      {/* Social Links */}
      <div className="mt-6 flex items-center gap-3">
        {socialLinks.map((social) => (
          <Link
            key={social.name}
            to={social.url}
            target="_blank"
            rel="noreferrer"
            aria-label={social.name}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:bg-gray-200"
          >
            <img src={social.icon} alt={social.name} className="h-5 w-5"/>
          </Link>
        ))}
      </div>
    </div>

    {/* Dynamic Navigation */}
    {footerLinks.map((section) => (
      <div key={section.title}>
        <h3 className="text-xs font-bold uppercase tracking-[2px] text-gray-400">
          {section.title}
        </h3>

        <ul className="mt-7 flex flex-col gap-4">
          {section.links.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className="group inline-flex items-center gap-2 text-sm text-gray-600 transition-all duration-300 hover:translate-x-1 hover:text-orange-500"
              >
                {link.name}
                <ArrowUpRight
                  size={13}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>

  {/* Newsletter CTA */}
  <div className="mx-auto mb-12 flex max-w-7xl flex-col justify-between gap-5 rounded-2xl bg-[#292524] p-6 sm:flex-row sm:items-center sm:p-8">
    <div>
      <h3 className="text-xl font-semibold text-white">
        Let's find your next home.
      </h3>
      <p className="mt-2 text-sm text-gray-400">
        Have questions? Our team is ready to help you.
      </p>
    </div>

    <Link
      to="/contacts"
      className="inline-flex w-fit items-center gap-3 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600"
    >
      Get in Touch
      <ArrowRight size={17} />
    </Link>
  </div>

  {/* Bottom Footer */}
  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-gray-200 py-7 sm:flex-row">

    <p className="text-center text-xs tracking-wide text-gray-500 sm:text-left">
      © {new Date().getFullYear()} ROADTOHOME. ALL RIGHTS RESERVED.
    </p>

    <Link
      to="/"
      aria-label="Back to home"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white"
    >
      <ArrowUpRight size={19} />
    </Link>

    <p className="text-xs text-gray-500">
      Made with care for your dream home.
    </p>

  </div>
</footer>

);
};

export default Footer;