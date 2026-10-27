const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getImageUrl = (image) => {
  const imagePath = typeof image === 'string' ? image : image?.url;
  if (!imagePath) return '';

  if (/^(https?:|data:|blob:)/i.test(imagePath)) {
    return imagePath;
  }

  if (/^https?:\/\//i.test(API_URL)) {
    return new URL(imagePath, new URL(API_URL).origin).toString();
  }

  return imagePath;
};
