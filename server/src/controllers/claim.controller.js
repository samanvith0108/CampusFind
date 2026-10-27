const claimService = require('../services/claim.service');

const submitClaim = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { verificationDetails } = req.body;
    const claim = await claimService.submitClaim(itemId, req.user.id, verificationDetails);

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. The finder has been notified.',
      data: {
        claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getClaimsForItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const claims = await claimService.getClaimsForItem(itemId, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      data: {
        claims,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyClaims = async (req, res, next) => {
  try {
    const claims = await claimService.getMyClaims(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        claims,
      },
    });
  } catch (error) {
    next(error);
  }
};

const reviewClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { decision, reviewNote } = req.body;
    const claim = await claimService.reviewClaim(
      claimId,
      req.user.id,
      req.user.role,
      decision,
      reviewNote
    );

    return res.status(200).json({
      success: true,
      message: `Claim ${decision} successfully`,
      data: {
        claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

const withdrawClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const claim = await claimService.withdrawClaim(claimId, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Claim withdrawn successfully',
      data: {
        claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitClaim,
  getClaimsForItem,
  getMyClaims,
  reviewClaim,
  withdrawClaim,
};
