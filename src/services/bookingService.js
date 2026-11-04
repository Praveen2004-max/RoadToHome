import API from "./api";

// Customer: Create booking
export const createBooking = async (bookingData) => {
  const response = await API.post("/bookings", bookingData);
  return response.data;
};

// Customer: My bookings
export const getMyBookings = async () => {
  const response = await API.get("/bookings/my-bookings");
  return response.data;
};

// Admin: All bookings
export const getAllBookings = async () => {
  const response = await API.get("/bookings");
  return response.data;
};

// Admin: Update booking status
export const updateBookingStatus = async (id, status) => {
  const response = await API.patch(`/bookings/${id}/status`, {
    status,
  });
  return response.data;
};

// Customer: Cancel booking
export const cancelMyBooking = async (id, cancellationReason) => {
  const response = await API.patch(`/bookings/${id}/cancel`, {
    cancellationReason,
  });
  return response.data;
};