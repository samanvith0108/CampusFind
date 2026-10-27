const Claim = require('../models/claim.model');
const Item = require('../models/item.model');
const notificationService = require('./notification.service');

const submitClaim = async (itemId, claimantId, verificationDetails) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const error = new Error('Item not found.');
    error.statusCode = 404;
    throw error;
  }

  if (item.type !== 'found') {
    const error = new Error('Claims can only be submitted for "found" items.');
    error.statusCode = 400;
    throw error;
  }

  if (item.status !== 'open') {
    const error = new Error('Claims can only be submitted for items with "open" status.');
    error.statusCode = 400;
    throw error;
  }

  if (item.reportedBy.toString() === claimantId.toString()) {
    const error = new Error('You cannot submit a claim for an item you reported.');
    error.statusCode = 403;
    throw error;
  }

  // Prevent duplicate active claims by same claimant
  const existingClaim = await Claim.findOne({
    item: itemId,
    claimant: claimantId,
    status: { $in: ['pending', 'approved'] },
  });

  if (existingClaim) {
    const error = new Error(
      `You already have an active claim (${existingClaim.status}) for this item.`
    );
    error.statusCode = 409;
    throw error;
  }

  const claim = new Claim({
    item: itemId,
    claimant: claimantId,
    verificationDetails,
    status: 'pending',
  });

  await claim.save();

  // Notify the person who found and reported the item
  await notificationService.createNotification({
    recipient: item.reportedBy,
    type: 'claim_submitted',
    message: `A new claim has been submitted for your found item: "${item.title}".`,
    relatedItem: item._id,
    relatedClaim: claim._id,
  });

  return claim;
};

const getClaimsForItem = async (itemId, requesterId, role) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const error = new Error('Item not found.');
    error.statusCode = 404;
    throw error;
  }

  if (item.reportedBy.toString() !== requesterId.toString() && role !== 'admin') {
    const error = new Error(
      'Access denied. Only the person who reported the item or an admin can view claims.'
    );
    error.statusCode = 403;
    throw error;
  }

  // Explicitly select verificationDetails for review
  const claims = await Claim.find({ item: itemId })
    .select('+verificationDetails')
    .populate('claimant', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  return claims;
};

const getMyClaims = async (userId) => {
  const claims = await Claim.find({ claimant: userId })
    .populate('item', 'title type status location category images dateOccurred')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  return claims;
};

const reviewClaim = async (claimId, reviewerId, role, decision, reviewNote = null) => {
  const claim = await Claim.findById(claimId).populate('item');

  if (!claim) {
    const error = new Error('Claim not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!claim.item) {
    const error = new Error('Associated item not found.');
    error.statusCode = 404;
    throw error;
  }

  if (claim.item.reportedBy.toString() !== reviewerId.toString() && role !== 'admin') {
    const error = new Error(
      'Access denied. Only the finder who reported this item or an admin can review claims.'
    );
    error.statusCode = 403;
    throw error;
  }

  if (claim.status !== 'pending') {
    const error = new Error(`Claim is already resolved with status: "${claim.status}".`);
    error.statusCode = 400;
    throw error;
  }

  // If approving, check if another claim for this item is already approved
  if (decision === 'approved') {
    const alreadyApproved = await Claim.findOne({
      item: claim.item._id,
      status: 'approved',
      _id: { $ne: claimId },
    });

    if (alreadyApproved) {
      const error = new Error(
        'Another claim has already been approved for this item. Only one approved claim is permitted.'
      );
      error.statusCode = 409;
      throw error;
    }
  }

  // Atomic update: ensure claim status is still 'pending' to prevent race conditions
  const updatedClaim = await Claim.findOneAndUpdate(
    { _id: claimId, status: 'pending' },
    {
      $set: {
        status: decision,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    },
    { new: true }
  ).populate('claimant', 'name email');

  if (!updatedClaim) {
    const error = new Error('Conflict detected. The claim was already modified concurrently.');
    error.statusCode = 409;
    throw error;
  }

  // Notify the claimant of the review outcome
  const notificationType = decision === 'approved' ? 'claim_approved' : 'claim_rejected';
  const notificationMsg =
    decision === 'approved'
      ? `Congratulations! Your claim for "${claim.item.title}" was approved.`
      : `Your claim for "${claim.item.title}" was rejected. ${reviewNote ? `Reason: ${reviewNote}` : ''}`;

  await notificationService.createNotification({
    recipient: claim.claimant,
    type: notificationType,
    message: notificationMsg.trim(),
    relatedItem: claim.item._id,
    relatedClaim: updatedClaim._id,
  });

  return updatedClaim;
};

const withdrawClaim = async (claimId, userId) => {
  const claim = await Claim.findById(claimId);

  if (!claim) {
    const error = new Error('Claim not found.');
    error.statusCode = 404;
    throw error;
  }

  if (claim.claimant.toString() !== userId.toString()) {
    const error = new Error('Access denied. You can only withdraw your own claim.');
    error.statusCode = 403;
    throw error;
  }

  if (claim.status !== 'pending') {
    const error = new Error(
      `Cannot withdraw claim because it is currently "${claim.status}". Only pending claims can be withdrawn.`
    );
    error.statusCode = 400;
    throw error;
  }

  claim.status = 'withdrawn';
  await claim.save();

  return claim;
};

module.exports = {
  submitClaim,
  getClaimsForItem,
  getMyClaims,
  reviewClaim,
  withdrawClaim,
};
