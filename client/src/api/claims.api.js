import axiosInstance from './axiosInstance';

export const submitClaim = async (itemId, data) => {
  const response = await axiosInstance.post(`/items/${itemId}/claims`, data);
  return response.data;
};

export const getClaimsForItem = async (itemId) => {
  const response = await axiosInstance.get(`/items/${itemId}/claims`);
  return response.data;
};

export const getMyClaims = async () => {
  const response = await axiosInstance.get('/claims/my');
  return response.data;
};

export const reviewClaim = async (claimId, data) => {
  const response = await axiosInstance.patch(`/claims/${claimId}/review`, data);
  return response.data;
};

export const withdrawClaim = async (claimId) => {
  const response = await axiosInstance.patch(`/claims/${claimId}/withdraw`);
  return response.data;
};
