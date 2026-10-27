import axiosInstance from './axiosInstance';

export const getAdminReports = async (params = {}) => {
  const response = await axiosInstance.get('/admin/reports', { params });
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await axiosInstance.get('/admin/users', { params });
  return response.data;
};

export const archiveAdminItem = async (itemId) => {
  const response = await axiosInstance.patch(`/admin/items/${itemId}/archive`);
  return response.data;
};

export const updateAdminUserStatus = async (userId, isActive) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};
