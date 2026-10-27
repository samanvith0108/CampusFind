export const getApiErrorMessage = (error, fallback) => {
  const response = error?.response;
  const responseData = response?.data;

  if (!response) {
    return 'Cannot reach the API server. Start the backend with "npm run dev" from the server folder and try again.';
  }

  if (typeof responseData?.message === 'string' && responseData.message !== 'Validation failed') {
    return responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors.map((validationError) => validationError.message).join('. ');
  }

  if (response.status >= 500) {
    return 'The API server encountered an error. Check the backend terminal for details and confirm it is running.';
  }

  return responseData?.message || fallback;
};
