import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  Tag,
  User,
  ArrowLeft,
  Edit3,
  Archive,
  CheckCircle,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { getItem, archiveItem, confirmReturn } from '../api/items.api';
import { getClaimsForItem, submitClaim, getMyClaims, reviewClaim, withdrawClaim } from '../api/claims.api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ClaimCard from '../components/ClaimCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { ItemDetailSkeleton } from '../components/Skeleton';
import { getImageUrl } from '../utils/imageUrl';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [myClaim, setMyClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Claim form state
  const [claimText, setClaimText] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Dialog states
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load item details
  const fetchItemData = useCallback(async () => {
    try {
      const res = await getItem(id);
      const itemData = res.data?.item || res.item || res.data;
      setItem(itemData);
      return itemData;
    } catch (err) {
      setError(err.response?.data?.message || 'Item not found');
      return null;
    }
  }, [id]);

  // Load claims for owner or my claim for visitor
  const fetchClaimsData = useCallback(
    async (itemData) => {
      if (!user || !itemData) return;

      const ownerId = itemData.reportedBy?._id || itemData.reportedBy?.id || itemData.reportedBy;
      const currentUserId = user._id || user.id;
      const isOwner = ownerId && currentUserId && String(ownerId) === String(currentUserId);

      if (isOwner) {
        try {
          const res = await getClaimsForItem(id);
          const claimsList = res.data?.claims || res.claims || (Array.isArray(res.data) ? res.data : []);
          setClaims(claimsList);
        } catch (err) {
          console.error('Failed to load item claims:', err);
        }
      } else {
        try {
          const myClaimsRes = await getMyClaims();
          const allMyClaims = myClaimsRes.data?.claims || myClaimsRes.claims || (Array.isArray(myClaimsRes.data) ? myClaimsRes.data : []);
          const existing = allMyClaims.find(
            (c) => (c.item?._id || c.item?.id || c.item) === id || (c.itemId?._id || c.itemId) === id
          );
          setMyClaim(existing || null);
        } catch (err) {
          console.error('Failed to load user claim:', err);
        }
      }
    },
    [id, user]
  );

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setError(null);
      const itemData = await fetchItemData();
      if (isMounted && itemData) {
        await fetchClaimsData(itemData);
      }
      if (isMounted) setLoading(false);
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [fetchItemData, fetchClaimsData]);

  if (loading) {
    return <ItemDetailSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Item Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error || "The item you're looking for does not exist or may have been deleted."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner =
    user &&
    item.reportedBy &&
    String(item.reportedBy._id || item.reportedBy.id || item.reportedBy) ===
      String(user._id || user.id);

  const isLost = item.type === 'lost';
  const hasApprovedClaim = claims.some((c) => (c.status || '').toLowerCase() === 'approved');

  const imagesList = Array.isArray(item.images)
    ? item.images
    : typeof item.images === 'string' && item.images
    ? [item.images]
    : [];

  const mainImageUrl = getImageUrl(imagesList[selectedImageIndex]);

  // Handle Submit Claim
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimText.trim()) {
      toast.error('Please enter details to verify your ownership.');
      return;
    }
    setIsSubmittingClaim(true);
    try {
      const res = await submitClaim(id, { verificationDetails: claimText });
      const created = res.data?.claim || res.claim || res.data;
      setMyClaim(created);
      setClaimText('');
      toast.success('Ownership claim submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Handle Approve Claim
  const handleApproveClaim = async (claimId) => {
    try {
      await reviewClaim(claimId, { decision: 'approved' });
      toast.success('Claim approved! You can now coordinate handover.');
      // Refresh
      const updatedClaims = await getClaimsForItem(id);
      setClaims(updatedClaims.data?.claims || updatedClaims.claims || updatedClaims.data);
      fetchItemData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    }
  };

  // Handle Reject Claim
  const handleRejectClaim = async (claimId, reviewNote) => {
    try {
      await reviewClaim(claimId, { decision: 'rejected', reviewNote });
      toast.success('Claim rejected.');
      const updatedClaims = await getClaimsForItem(id);
      setClaims(updatedClaims.data?.claims || updatedClaims.claims || updatedClaims.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    }
  };

  // Handle Withdraw Claim
  const handleWithdrawClaim = async (claimId) => {
    try {
      await withdrawClaim(claimId);
      toast.success('Claim withdrawn');
      setMyClaim(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw claim');
    }
  };

  // Handle Archive Item
  const handleConfirmArchive = async () => {
    setActionLoading(true);
    try {
      await archiveItem(id);
      toast.success('Item has been archived');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive item');
    } finally {
      setActionLoading(false);
      setShowArchiveDialog(false);
    }
  };

  // Handle Confirm Return
  const handleConfirmReturn = async () => {
    setActionLoading(true);
    try {
      await confirmReturn(id);
      toast.success('Item marked as returned successfully!');
      fetchItemData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm return');
    } finally {
      setActionLoading(false);
      setShowReturnDialog(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm flex items-center justify-center">
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br ${
                  isLost
                    ? 'from-amber-100/60 via-amber-50 to-orange-100/50 text-amber-600'
                    : 'from-emerald-100/60 via-emerald-50 to-teal-100/50 text-emerald-600'
                }`}
              >
                <Tag className="w-16 h-16 stroke-[1.4] mb-3 opacity-80" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-75">
                  No images provided
                </span>
              </div>
            )}

            {/* Type badge on image */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                  isLost
                    ? 'bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-emerald-600 text-white shadow-emerald-600/20'
                }`}
              >
                {isLost ? 'Lost Item' : 'Found Item'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {imagesList.map((url, idx) => (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(url)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Title + Badges */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <StatusBadge status={item.status || 'open'} />
              <span className="text-xs font-medium text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                {item.category || 'General Item'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {item.title}
            </h1>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Location
              </span>
              <p className="font-bold text-slate-800 truncate">{item.location || 'Campus'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Date Occurred
              </span>
              <p className="font-bold text-slate-800">
                {item.dateOccurred
                  ? new Date(item.dateOccurred).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <span className="text-slate-400 font-medium flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Reported By
              </span>
              <p className="font-bold text-slate-800 truncate">
                {item.reportedBy?.name || 'Campus Student'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Owner Action Buttons */}
          {isOwner && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/items/${id}/edit`}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-1.5 text-slate-500" />
                Edit Listing
              </Link>

              <button
                type="button"
                onClick={() => setShowArchiveDialog(true)}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 shadow-sm transition-colors"
              >
                <Archive className="w-4 h-4 mr-1.5" />
                Archive Listing
              </button>

              {item.status !== 'returned' && (
                <button
                  type="button"
                  onClick={() => setShowReturnDialog(true)}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Confirm Return Handover
                </button>
              )}
            </div>
          )}

          {/* Claimant view: If current user already submitted a claim */}
          {!isOwner && myClaim && (
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Your Ownership Claim
                </span>
                <StatusBadge status={myClaim.status} />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 whitespace-pre-wrap">
                <span className="font-semibold text-slate-800">Your proof details:</span>
                <p className="mt-1">{myClaim.verificationDetails}</p>
              </div>

              {myClaim.reviewNote && (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-200">
                  <span className="font-semibold">Finder note: </span>
                  <span>{myClaim.reviewNote}</span>
                </div>
              )}

              {myClaim.status === 'pending' && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleWithdrawClaim(myClaim._id || myClaim.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white"
                  >
                    Withdraw My Claim
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Non-Owner Found Item Claim Form (If logged in, item is found & open, and no claim yet) */}
          {!isOwner && !isLost && item.status === 'open' && !myClaim && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                  <Lock className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-slate-900">Is this yours? Submit an Ownership Claim</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide unique identifying details (e.g., serial number, distinctive scratch, wallpaper, lock pattern, contents).
                  Your description is kept completely private and visible only to the person who found this item.
                </p>
              </div>

              {isAuthenticated ? (
                <form onSubmit={handleSubmitClaim} className="space-y-3">
                  <textarea
                    rows={4}
                    placeholder="Describe specific features or proofs that confirm you are the rightful owner..."
                    value={claimText}
                    onChange={(e) => setClaimText(e.target.value)}
                    required
                    className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingClaim}
                      className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
                    >
                      {isSubmittingClaim ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Submit Private Claim
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 mb-3">
                    You must sign in with your institutional student email to submit a claim.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign In to Claim
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Owner View: Incoming Claims Section (for found items) */}
      {isOwner && (
        <section className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Ownership Claims Received ({claims.length})
              </h2>
              <p className="text-xs text-slate-500">
                Review proofs submitted by fellow students to verify ownership
              </p>
            </div>
            {hasApprovedClaim && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                ✓ Approved Claim Active
              </span>
            )}
          </div>

          {claims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claims.map((claim) => (
                <ClaimCard
                  key={claim._id || claim.id}
                  claim={claim}
                  isOwner={true}
                  onApprove={handleApproveClaim}
                  onReject={handleRejectClaim}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No claims have been submitted for this item yet.
            </div>
          )}
        </section>
      )}

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={showArchiveDialog}
        title="Archive this Listing?"
        message="Archiving will remove this item from active public campus listings. You can still view it in your dashboard."
        confirmText="Archive Item"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleConfirmArchive}
        onCancel={() => setShowArchiveDialog(false)}
      />

      {/* Confirm Return Dialog */}
      <ConfirmDialog
        isOpen={showReturnDialog}
        title="Confirm Item Handover?"
        message="This marks the item as officially returned to its rightful owner and closes the case. Would you like to proceed?"
        confirmText="Mark Returned"
        confirmVariant="primary"
        isLoading={actionLoading}
        onConfirm={handleConfirmReturn}
        onCancel={() => setShowReturnDialog(false)}
      />
    </div>
  );
};

export default ItemDetails;
