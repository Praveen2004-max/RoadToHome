import React, { useState } from "react";
import API from "../services/api";

import {
    Home,
    Mail,
    Lock,
    LockKeyhole,
    ArrowRight,
    X,
    FolderPen,
    Phone,
    ImagePlus,
    UserRoundPlus,
    MapPinned,
    Transgender,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Camera,
    KeyRound
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        gender: "",
        password: "",
        confirmPassword: ""
    });

    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    // Handle profile image
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, PNG and WEBP images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Profile image must be smaller than 5 MB.");
            e.target.value = "";
            return;
        }

        setProfileImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setError("");
    };

    // Validate form
    const validateForm = () => {
        const {
            fullName,
            email,
            phone,
            location,
            gender,
            password,
            confirmPassword
        } = formData;

        if (
            !fullName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !location.trim() ||
            !gender ||
            !password ||
            !confirmPassword
        ) {
            return "Please fill in all required fields.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return "Please enter a valid email address.";
        }

        // Basic Indian phone number validation
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phone.trim())) {
            return "Please enter a valid 10-digit Indian mobile number.";
        }

        if (password.length < 8) {
            return "Password must contain at least 8 characters.";
        }

        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter.";
        }

        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number.";
        }

        if (password !== confirmPassword) {
            return "Password and Confirm Password do not match.";
        }

        return null;
    };

    // Submit registration
    const handleSignUp = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            data.append("fullName", formData.fullName.trim());
            data.append("email", formData.email.trim().toLowerCase());
            data.append("phone", formData.phone.trim());
            data.append("location", formData.location.trim());
            data.append("gender", formData.gender);
            data.append("password", formData.password);

            if (profileImage) {
                data.append("profileImage", profileImage);
            }

            const response = await API.post(
                "/users/signUp",
                data
            );

            setSuccess(
                response.data?.message ||
                "Your account has been created successfully!"
            );

            // Redirect to SignIn after successful registration
            setTimeout(() => {
                navigate("/signIn", { replace: true });
            }, 1200);

        } catch (err) {
            console.error(
                "SignUp Error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // Reusable input class
    const inputClass =
        "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100";

    const labelClass =
        "mb-2 flex items-center gap-2 text-sm font-medium text-gray-700";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f4f6f8] p-3 sm:p-6 flex items-center justify-center">

            {/* Background */}
            <img
                src="/login-image.jpg"
                alt=""
                className="fixed inset-0 h-full w-full scale-105 object-cover blur-sm"
            />

            <div className="fixed inset-0 bg-black/20" />

            {/* Main Container */}
            <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

                {/* LEFT SECTION */}
                <section className="relative hidden min-h-[850px] overflow-hidden bg-slate-950 lg:block">

                    <img
                        src="/login-image.jpg"
                        alt="Beautiful home"
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/40 to-slate-950/95" />

                    <div className="relative z-10 flex h-full flex-col p-10">

                        {/* Logo */}
                        <Link to="/">
                            <img
                                src="/logo1.png"
                                alt="RoadToHome"
                                className="h-14 w-auto object-contain"
                            />
                        </Link>

                        {/* Left Content - Different from SignIn */}
                        <div className="mt-auto mb-auto pt-24">

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium tracking-wider text-white backdrop-blur-md">
                                <Home size={16} className="text-orange-400" />
                                MORE THAN JUST A PROPERTY
                            </div>

                            <h1 className="mt-7 text-5xl font-extrabold leading-tight tracking-tight text-white">
                                Your next
                                <br />
                                chapter begins
                                <span className="text-orange-500">
                                    {" "}at home.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-md text-sm leading-7 text-gray-300">
                                Every great journey starts with the
                                right place. Create your account to
                                explore properties, connect with
                                owners, and discover a place that
                                feels like yours.
                            </p>

                            {/* Benefits */}
                            <div className="mt-10 space-y-5">

                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                                        <Home size={21} />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            Discover your ideal home
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Explore properties that match your lifestyle.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                                        <ShieldCheck size={21} />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            Connect with confidence
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Manage your property conversations in one place.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                                        <KeyRound size={21} />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            Make your next move
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Start your property journey with RoadToHome.
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* Bottom Text */}
                            <div className="mt-12 border-t border-white/20 pt-6">
                                <p className="text-xs tracking-wide text-gray-400">
                                    FIND YOUR PLACE. BUILD YOUR FUTURE.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* RIGHT SECTION */}
                <section className="flex items-center justify-center bg-white px-5 py-8 sm:px-10 lg:px-12">

                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="flex items-center justify-between">

                            <Link to="/">
                                <img
                                    src="/logo1.png"
                                    alt="RoadToHome"
                                    className="h-12 w-auto object-contain"
                                />
                            </Link>

                            <Link
                                to="/"
                                aria-label="Close signup"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
                            >
                                <X size={20} />
                            </Link>

                        </div>

                        {/* Heading */}
                        <div className="mt-7">

                            <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
                                Create Account
                                <UserRoundPlus
                                    size={26}
                                    className="text-orange-500"
                                />
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Join RoadToHome and take the first step
                                towards your dream home.
                            </p>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                <CheckCircle2
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>{success}</p>
                            </div>
                        )}

                        {/* Registration Form */}
                        <form
                            onSubmit={handleSignUp}
                            className="mt-6 space-y-4"
                        >

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className={labelClass}
                                >
                                    <FolderPen size={17} />
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    maxLength={80}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            {/* Email and Phone */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="email"
                                        className={labelClass}
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
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className={labelClass}
                                    >
                                        <Phone size={17} />
                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        autoComplete="tel"
                                        maxLength={10}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                            </div>

                            {/* Location and Gender */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="location"
                                        className={labelClass}
                                    >
                                        <MapPinned size={17} />
                                        Location
                                    </label>

                                    <input
                                        id="location"
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Your city"
                                        autoComplete="address-level2"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="gender"
                                        className={labelClass}
                                    >
                                        <Transgender size={17} />
                                        Gender
                                    </label>

                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        className={`${inputClass} cursor-pointer`}
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="password"
                                        className={labelClass}
                                    >
                                        <Lock size={17} />
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create password"
                                            autoComplete="new-password"
                                            required
                                            className={`${inputClass} pr-11`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className={labelClass}
                                    >
                                        <LockKeyhole size={17} />
                                        Confirm Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            autoComplete="new-password"
                                            required
                                            className={`${inputClass} pr-11`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword((prev) => !prev)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                                            aria-label="Toggle confirm password visibility"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Password Hint */}
                            <p className="text-[11px] leading-5 text-gray-400">
                                Use at least 8 characters, one uppercase letter
                                and one number.
                            </p>

                            {/* Profile Image */}
                            <div>

                                <label className={labelClass}>
                                    <Camera size={17} />
                                    Profile Picture
                                    <span className="text-xs font-normal text-gray-400">
                                        (Optional)
                                    </span>
                                </label>

                                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 transition hover:border-orange-400 hover:bg-orange-50">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-500">

                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Profile preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImagePlus size={24} />
                                        )}

                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-700">
                                            {profileImage
                                                ? profileImage.name
                                                : "Upload your profile picture"}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            JPG, PNG or WEBP · Max 5 MB
                                        </p>
                                    </div>

                                    <input
                                        type="file"
                                        name="profileImage"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleImageChange}
                                        className="sr-only"
                                    />

                                </label>

                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 pt-1">

                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="mt-1 accent-orange-500"
                                />

                                <label
                                    htmlFor="terms"
                                    className="text-xs leading-5 text-gray-500"
                                >
                                    I agree to the{" "}
                                    <Link
                                        to="/terms"
                                        className="font-medium text-orange-600 hover:underline"
                                    >
                                        Terms & Conditions
                                    </Link>
                                    {" "}and{" "}
                                    <Link
                                        to="/privacy"
                                        className="font-medium text-orange-600 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>.
                                </label>

                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserRoundPlus size={19} />
                                        Create My Account
                                        <ArrowRight
                                            size={19}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* Login Link */}
                        <div className="mt-7 text-center">

                            <p className="text-sm text-gray-500">
                                Already have an account?

                                <Link
                                    to="/signIn"
                                    className="ml-1.5 font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
                                >
                                    Sign In
                                </Link>
                            </p>

                        </div>

                        {/* Footer */}
                        <p className="mt-7 text-center text-xs text-gray-400">
                            © {new Date().getFullYear()} RoadToHome.
                            All rights reserved.
                        </p>

                    </div>
                </section>

            </div>
        </div>
    );
};

export default SignUp;