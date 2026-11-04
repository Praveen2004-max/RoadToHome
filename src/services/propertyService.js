
import API from "./api";

// Get all public properties
export const getAllProperties = async (filters = {}) => {
  const response = await API.get("/properties", {
    params: filters,
  });
  return response.data;
};

// Get single property
export const getSingleProperty = async (id) => {
  const response = await API.get(`/properties/${id}`);
  return response.data;
};

// Add property (Admin or other existing usage)
export const addProperty = async (formData) => {
  const response = await API.post("/properties", formData);
  return response.data;
};

// User Add Property
export const submitUserProperty = async (formData) => {
  const response = await API.post("/properties", formData);
  return response.data;
};

// Update property
export const updateProperty = async (id, formData) => {
  const response = await API.put(`/properties/${id}`, formData);
  return response.data;
};

// Delete property
export const deleteProperty = async (id) => {
  const response = await API.delete(`/properties/${id}`);
  return response.data;
};

// Get my properties
export const getMyProperties = async () => {
  const response = await API.get("/properties/my-properties");
  return response.data;
};

// Get pending properties
export const getPendingProperties = async () => {
  const response = await API.get("/properties/admin/pending");
  return response.data;
};

// Approve property
export const approveProperty = async (id) => {
  const response = await API.patch(`/properties/admin/${id}/approve`);
  return response.data;
};

// Reject property
export const rejectProperty = async (id, reason) => {
  const response = await API.patch(`/properties/admin/${id}/reject`, {
    reason,
  });
  return response.data;
};

// Get my single property
export const getMySingleProperty = async (id) => {
  const response = await API.get(`/properties/my-properties/${id}`);
  return response.data;
};