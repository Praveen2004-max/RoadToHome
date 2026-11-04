
import React, { useState } from "react";
import API from "../services/api";
import {
    HandMetal,
    Mail,
    LockKeyhole,
    ArrowRight,
    X,
    UserRound,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (error) setError("");
    };

    // Handle Login
    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");

        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        // Frontend validation
        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post("/users/signIn", {
                email,
                password
            });

            const { token, user } = response.data;

            // Validate backend response
            if (!token || !user) {
                throw new Error("Invalid login response from server.");
            }

            if (!user.role) {
                throw new Error(
                    "User role is missing. Please check your backend login response."
                );
            }

            // Save authentication data
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Role-based redirect
            if (user.role === "admin") {
                navigate("/dashboard", { replace: true });
            } else {
                navigate("/", { replace: true });
            }

        } catch (err) {
            console.error(
                "SignIn Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to sign in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#f4f6f8] p-3 sm:p-6 flex items-center justify-center overflow-hidden">

            {/* Background */}
            <img
                className="fixed inset-0 w-full h-full object-cover blur-sm scale-105"
                src="/login-image.jpg"
                alt=""
            />

            <div className="fixed inset-0 bg-black/20" />

            {/* Main Container */}
            <div className="relative z-10 mx-auto grid w-full max-w-6xl min-h-70 overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

                {/* Left Side - Image Section */}
                <section className="relative hidden min-h-70 overflow-hidden bg-slate-900 lg:block">

                    <img
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        src="/login-image.jpg"
                        alt="Beautiful modern home"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                    <div className="relative z-10 flex h-full flex-col p-10">

                        <Link to="/">
                            <img
                                className="h-14 w-auto object-contain"
                                src="/logo1.png"
                                alt="RoadToHome"
                            />
                        </Link>

                        <div className="mt-auto mb-16">

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs tracking-wider text-white backdrop-blur-md">
                                <ShieldCheck size={16} />
                                YOUR DREAM HOME AWAITS
                            </div>

                            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
                                Find the perfect
                                <br />
                                home for
                                <span className="text-orange-500">
                                    {" "}your future.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-7 text-gray-200">
                                Explore beautiful properties, discover
                                your perfect place, and start a new
                                journey with RoadToHome.
                            </p>

                            <div className="mt-8 flex items-center gap-3">
                                <span className="h-1 w-12 rounded-full bg-orange-500" />
                                <span className="h-1 w-5 rounded-full bg-white/50" />
                                <span className="h-1 w-5 rounded-full bg-white/50" />
                            </div>

                        </div>
                    </div>
                </section>

                {/* Right Side - Login Form */}
                <section className="flex items-center justify-center bg-white px-5 py-8 sm:px-10 lg:px-12">

                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="flex items-center justify-between">

                            <Link to="/">
                                <img
                                    className="h-12 w-auto object-contain"
                                    src="/logo1.png"
                                    alt="RoadToHome"
                                />
                            </Link>

                            <Link
                                to="/"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
                                aria-label="Close login"
                            >
                                <X size={20} />
                            </Link>

                        </div>

                        {/* Heading */}
                        <div className="mt-9">

                            <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
                                Welcome Back
                                <HandMetal
                                    className="text-yellow-500"
                                    size={27}
                                />
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Sign in to your account and continue
                                your journey with us.
                            </p>

                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form
                            onSubmit={handleSignIn}
                            className="mt-7 space-y-5"
                        >

                            {/* Email */}
                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <Mail size={17} />
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                />

                            </div>

                            {/* Password */}
                            <div>

                                <label
                                    htmlFor="password"
                                    className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                                >
                                    <LockKeyhole size={17} />
                                    Password
                                </label>

                                <div className="relative">

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-orange-500"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">

                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-orange-600 transition hover:text-orange-700 hover:underline"
                                >
                                    Forgot Password?
                                </Link>

                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-4 text-sm font-semibold tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <UserRound size={19} />
                                        Sign In
                                        <ArrowRight
                                            size={19}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* Divider */}
                        <div className="my-7 flex items-center gap-4">
                            <span className="h-px flex-1 bg-gray-200" />
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                Secure Login
                            </span>
                            <span className="h-px flex-1 bg-gray-200" />
                        </div>

                        {/* Signup */}
                        <div className="text-center">

                            <p className="text-sm text-gray-500">
                                Don't have an account?

                                <Link
                                    to="/signUp"
                                    className="ml-1.5 font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
                                >
                                    Create One
                                </Link>
                            </p>

                        </div>

                        {/* Footer */}
                        <p className="mt-8 text-center text-xs text-gray-400">
                            © {new Date().getFullYear()} RoadToHome.
                            All rights reserved.
                        </p>

                    </div>
                </section>
            </div>
        </div>
    );
};

export default SignIn;