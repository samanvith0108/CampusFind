import axiosInstance from './axiosInstance';

export const getItems = async (params = {}) => {
  const response = await axiosInstance.get('/items', { params });
  return response.data;
};

export const getItem = async (id) => {
  const response = await axiosInstance.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (formData) => {
  const response = await axiosInstance.post('/items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateItem = async (id, formData) => {
  const response = await axiosInstance.patch(`/items/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const archiveItem = async (id) => {
  const response = await axiosInstance.delete(`/items/${id}`);
  return response.data;
};

export const confirmReturn = async (id) => {
  const response = await axiosInstance.patch(`/items/${id}/returned`);
  return response.data;
};
