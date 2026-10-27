import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  submitClaim as submitClaimApi,
  reviewClaim as reviewClaimApi,
  withdrawClaim as withdrawClaimApi,
} from '../api/claims.api';

export const useClaims = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitClaim = useCallback(async (itemId, data) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitClaimApi(itemId, data);
      toast.success(res.message || 'Claim submitted successfully!');
      return res.data?.claim || res.claim || res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit claim';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const reviewClaim = useCallback(async (claimId, data) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await reviewClaimApi(claimId, data);
      toast.success(res.message || `Claim ${data.status || 'updated'} successfully!`);
      return res.data?.claim || res.claim || res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to review claim';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const withdrawClaim = useCallback(async (claimId) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await withdrawClaimApi(claimId);
      toast.success(res.message || 'Claim withdrawn successfully!');
      return res.data?.claim || res.claim || res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to withdraw claim';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    error,
    submitClaim,
    reviewClaim,
    withdrawClaim,
  };
};

export default useClaims;
