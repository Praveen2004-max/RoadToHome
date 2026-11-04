
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Camera,
  Pencil,
  Save,
  X,
  Home,
  Heart,
  ShieldCheck,
  LoaderCircle,
  House,
} from "lucide-react";

const API = "http://localhost:5000/api/users";

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    location: "",
    bio: "",
  });

  const token = localStorage.getItem("token");

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile load nahi ho payi");
      }

      const profile = data.user;
      setUser(profile);

      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        gender: profile.gender || "",
        bio: profile.bio || "",
      });

      setPreview(getImageUrl(profile.profileImage));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage("Please login to view your profile.");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, []);

  // Input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Image selection
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("Valid Image size is 5mb");
      return;
    }

    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  // Update profile
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      if (image) {
        form.append("image", image);
      }

      const response = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update nahi hui");
      }

      setUser(data.user);

      setPreview(getImageUrl(data.user.profileImage));
      setImage(null);
      setEditing(false);
      setMessage("Profile updated successfully!");

      // Refresh navbar profile data
      const oldUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...data.user,
        })
      );

      window.dispatchEvent(new Event("authChanged"));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoaderCircle className='animate-spin text-orange-500' size={35} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <UserRound size={45} className='text-gray-400' />
        <p className='text-gray-600'>{message || 'Please login first.'}</p>
        <Link
          to='/'
          className='bg-orange-500 text-white px-6 py-2 rounded-xl'
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8'>
      <div className='max-w-6xl mx-auto'>

        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
          <div>
            <p onClick={()=>navigate("/")} className="flex items-center gap-1 text-gray-500 hover:text-orange-500 cursor-pointer mb-1">
              <House size={18} strokeWidth={2.25} /><span>return to Home</span>
            </p>
            <p className='text-orange-500 text-sm font-semibold'>
              ROADTOHOME / ACCOUNT
            </p>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mt-2'>
              My Profile
            </h1>
            <p className='text-gray-500 mt-2'>
              Manage your personal information and account settings.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setMessage('');
                setEditing(true);
              }}
              className='flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-orange-500 transition'
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing(false);
                setImage(null);
                setMessage('');
                fetchProfile();
              }}
              className='flex items-center justify-center gap-2 border border-gray-300 bg-white px-5 py-3 rounded-xl'
            >
              <X size={17} />
              Cancel
            </button>
          )}
        </div>

        {message && (
          <div className='mb-5 rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-700'>
            {message}
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

          {/* Left Profile Card */}
          <div className='bg-white rounded-3xl border border-gray-100 p-7 shadow-sm h-fit'>
            <div className='flex flex-col items-center text-center'>

              <div className='relative'>
                <div className='w-32 h-32 rounded-full overflow-hidden bg-orange-100 border-4 border-orange-50'>
                  {preview ? (
                    <img
                      src={preview}
                      alt='Profile'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-orange-500'>
                      <UserRound size={55} />
                    </div>
                  )}
                </div>

                {editing && (
                  <label className='absolute bottom-1 right-1 bg-orange-500 text-white p-3 rounded-full cursor-pointer hover:bg-orange-600'>
                    <Camera size={17} />
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                  </label>
                )}
              </div>

              <h2 className='text-xl font-bold mt-5 text-gray-900'>
                {user.fullName}
              </h2>

              <p className='text-gray-500 text-sm mt-1'>
                @{user.email || user.email?.split('@')[0]}
              </p>

              <span className='mt-4 inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-semibold capitalize'>
                <ShieldCheck size={15} />
                {user.role || 'user'} Account
              </span>
            </div>

            <div className='border-t border-gray-100 mt-7 pt-6 space-y-4'>
              <div className='flex items-center gap-3 text-gray-600 text-sm'>
                <Mail size={18} className='text-orange-500' />
                <span className='break-all'>{user.email}</span>
              </div>

              <div className='flex items-center gap-3 text-gray-600 text-sm'>
                <Phone size={18} className='text-orange-500' />
                <span>{user.phone || 'Not added'}</span>
              </div>

              <div className='flex items-center gap-3 text-gray-600 text-sm'>
                <MapPin size={18} className='text-orange-500' />
                <span>{user.location || 'Location not added'}</span>
              </div>

              <div className='flex items-center gap-3 text-gray-600 text-sm'>
                <CalendarDays size={18} className='text-orange-500' />
                <span>
                  Joined{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Details */}
          <div className='lg:col-span-2 space-y-6'>

            <form
              onSubmit={handleSave}
              className='bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm'
            >
              <div className='flex items-center justify-between mb-7'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Personal Information
                  </h2>
                  <p className='text-sm text-gray-500 mt-1'>
                    Your personal account details.
                  </p>
                </div>
                <UserRound className='text-orange-500' size={25} />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>

                {[
                  { label: 'Full Name', name: 'fullName', type: 'text' },
                  { label: 'email', name: 'email', type: 'text' },
                  { label: 'Phone Number', name: 'phone', type: 'tel' },
                  { label: 'Location', name: 'location', type: 'text' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className='text-sm font-semibold text-gray-700'>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      disabled={!editing}
                      className='w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-500'
                    />
                  </div>
                ))}

                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    value={user.email || ''}
                    disabled
                    className='w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500'
                  />
                </div>

                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    Gender
                  </label>
                  <select
                    name='gender'
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!editing}
                    className='w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 disabled:bg-gray-50'
                  >
                    <option value=''>Select Gender</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <label className='text-sm font-semibold text-gray-700'>
                    About Me
                  </label>
                  <textarea
                    name='bio'
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!editing}
                    rows='4'
                    placeholder='Write something about yourself...'
                    className='w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 disabled:bg-gray-50 resize-none'
                  />
                </div>
              </div>

              {editing && (
                <div className='flex justify-end mt-7'>
                  <button
                    type='submit'
                    disabled={saving}
                    className='flex items-center gap-2 bg-orange-500 text-white px-7 py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-60'
                  >
                    {saving ? (
                      <LoaderCircle size={18} className='animate-spin' />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>

            {/* Account Activity */}
            <div className='bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm'>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>
                Account Activity
              </h2>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Link
                  to='/my-properties'
                  className='flex items-center gap-4 p-5 rounded-2xl bg-orange-50 hover:bg-orange-100 transition'
                >
                  <div className='bg-white p-3 rounded-xl text-orange-500'>
                    <Home size={23} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      My Properties
                    </h3>
                    <p className='text-xs text-gray-500 mt-1'>
                      Manage your listings
                    </p>
                  </div>
                </Link>

                <Link
                  to='/saved-properties'
                  className='flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition'
                >
                  <div className='bg-white p-3 rounded-xl text-red-500'>
                    <Heart size={23} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      Saved Properties
                    </h3>
                    <p className='text-xs text-gray-500 mt-1'>
                      Your favourite homes
                    </p>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;