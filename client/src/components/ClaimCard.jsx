import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  FileCheck,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const ClaimCard = ({
  claim,
  isOwner = false,
  onApprove,
  onReject,
  onWithdraw,
}) => {
  const [showDetails, setShowDetails] = useState(!isOwner);
  const [rejecting, setRejecting] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  if (!claim) return null;

  const claimantName =
    claim.claimant?.name || claim.userId?.name || 'Fellow Campus Member';
  const claimantEmail = claim.claimant?.email || claim.userId?.email || '';
  const itemTitle = claim.item?.title || claim.itemId?.title || 'Reported Item';
  const claimStatus = (claim.status || 'pending').toLowerCase();
  const formattedDate = claim.createdAt
    ? new Date(claim.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const handleConfirmReject = () => {
    if (onReject) {
      onReject(claim._id || claim.id, reviewNote);
      setRejecting(false);
      setReviewNote('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          {isOwner ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                {claimantName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{claimantName}</p>
                {claimantEmail && (
                  <p className="text-xs text-slate-400">{claimantEmail}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">{itemTitle}</p>
                <p className="text-xs text-slate-400">Claimant Submission</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <StatusBadge status={claimStatus} />
        </div>
      </div>

      {/* Verification Details */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verification Details
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              {showDetails ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Proof
                </>
              )}
            </button>
          )}
        </div>

        {showDetails ? (
          <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 border border-slate-100 leading-relaxed break-words whitespace-pre-wrap">
            {claim.verificationDetails || 'No additional details provided.'}
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-400 border border-dashed border-slate-200 italic flex items-center justify-between">
            <span>Hidden for privacy. Click "View Proof" to inspect claim details.</span>
          </div>
        )}

        {/* If claim was rejected or has review note */}
        {claim.reviewNote && (
          <div className="mt-3 p-3 bg-red-50/70 border border-red-100 rounded-xl">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-red-700">Review Note: </span>
                <span className="text-red-600">{claim.reviewNote}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
        {/* Item Finder / Owner actions when claim is pending */}
        {isOwner && claimStatus === 'pending' && !rejecting && (
          <>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject Claim
            </button>
            <button
              type="button"
              onClick={() => onApprove && onApprove(claim._id || claim.id)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Approve Claim
            </button>
          </>
        )}

        {/* Inline Reject Form */}
        {isOwner && rejecting && (
          <div className="w-full mt-2 p-3 bg-red-50/50 rounded-xl border border-red-200 space-y-2 animate-fadeIn">
            <label className="block text-xs font-semibold text-red-800">
              Optional reason for rejecting this claim:
            </label>
            <input
              type="text"
              placeholder="e.g. Item color does not match description..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* Claimant action: withdraw pending claim */}
        {!isOwner && claimStatus === 'pending' && onWithdraw && (
          <button
            type="button"
            onClick={() => onWithdraw(claim._id || claim.id)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Withdraw Claim
          </button>
        )}
      </div>
    </div>
  );
};

export default ClaimCard;
