import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Home from "./Pages/Home.jsx";
import Properties from "./Pages/Properties.jsx";
import SignIn from "./Components/SignIn.jsx";
import SignUp from "./Components/SignUp.jsx";

import AdminLayout from "./Pages/AdminLayout.jsx";

import Overview from "./Components/Admin/Overview.jsx";
import Property from "./Components/Admin/Properties.jsx";
import Bookings from "./Components/Admin/Bookings.jsx";
import Users from "./Components/Admin/Users.jsx";
import Messages from "./Components/Admin/Messages.jsx";
import Settings from "./Components/Admin/Settings.jsx";
import PendingApprovals from "./Components/Admin/PendingApprovals.jsx";

import About from "./Pages/About.jsx";
import Contacts from "./Pages/Contacts.jsx";
import MyProfile from "./Components/MyProfile.jsx";

import AddProperty from "./Components/PropertyCRUD/addProperties.jsx";
import UserAddProperty from "./Components/PropertyCRUD/UserAddProperty.jsx";
import MyProperties from "./Components/PropertyCRUD/MyProperties.jsx";
import PropertyDetails from "./Components/PropertyCRUD/PropertyDetails.jsx";
import Reviews from "./Components/Admin/Reviews.jsx";
import FeaturedPropertiesAdmin from "./Components/Admin/FeaturedPropertiesAdmin.jsx";
import LatestPropertiesAdmin from "./Components/Admin/LatestPropertiesAdmin.jsx";
import AddLocation from "./Components/Admin/AddLocation.jsx";
import LocationsAdmin from "./Components/Admin/LocationsAdmin.jsx";
import EditProperty from "./Components/EditProperty.jsx";

// Get logged-in user
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// Check login
const PrivateRoute = ({ children }) => {
  const user = getCurrentUser();

  if (!user || !localStorage.getItem("token")) {
    return <Navigate to="/signIn" replace />;
  }

  return children;
};

// Check admin role
const AdminRoute = ({ children }) => {
  const user = getCurrentUser();

  if (!user || !localStorage.getItem("token")) {
    return <Navigate to="/signIn" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard/bookings" replace />;
  }

  return children;
};

// Dashboard default redirect
const DashboardHome = () => {
  const user = getCurrentUser();

  if (!user || !localStorage.getItem("token")) {
    return <Navigate to="/signIn" replace />;
  }

  return user.role === "admin"
    ? <Overview />
    : <Navigate to="/dashboard/bookings" replace />;
};

const App = () => {
  return (
    <div className="h-auto w-full font-karla">
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />

        {/* User Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MyProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/user-addProperty"
          element={
            <PrivateRoute>
              <UserAddProperty />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-properties"
          element={
            <PrivateRoute>
              <MyProperties />
            </PrivateRoute>
          }
        />


        <Route path="/properties/:id" element={<PropertyDetails />} />

        <Route
          path="/my-properties/:id"
          element={
            <PrivateRoute>
              <PropertyDetails />
            </PrivateRoute>
          }
        />

        {/* Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >

          {/* Admin Overview / User Redirect */}
          <Route index element={<DashboardHome />} />

          {/* Admin Only Routes */}
          <Route
            path="properties"
            element={
              <AdminRoute>
                <Property />
              </AdminRoute>
            }
          />

          <Route
            path="featured-properties"
            element={<FeaturedPropertiesAdmin />}
          />

          <Route
            path="latest-properties"
            element={<LatestPropertiesAdmin />}
          />

          <Route
            path="add-property"
            element={
              <AdminRoute>
                <AddProperty />
              </AdminRoute>
            }
          />

          <Route
            path="approvals"
            element={
              <AdminRoute>
                <PendingApprovals />
              </AdminRoute>
            }
          />

          <Route
            path="users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          {/* Both Admin and User */}
          <Route path="bookings" element={<Bookings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="add-location" element={<AddLocation />} />
          <Route path="location-manage" element={<LocationsAdmin />} />
          <Route path="settings" element={<Settings />} />

        </Route>

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
          path="/edit-property/:id"
          element={
            <EditProperty />
          }
        />

      </Routes>
    </div>
  );
};

export default App;
