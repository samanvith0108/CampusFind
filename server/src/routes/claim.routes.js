const express = require('express');
const rateLimit = require('express-rate-limit');
const claimController = require('../controllers/claim.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  submitClaimValidator,
  reviewClaimValidator,
} = require('../validators/claim.validators');

// Rate limiter for claim submissions: 10 submissions per 15 minutes
const claimSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many claim submissions from this IP. Please try again after 15 minutes.',
  },
});

// Item-scoped claim router for /api/items/:itemId/claims
const itemClaimsRouter = express.Router({ mergeParams: true });
itemClaimsRouter.post(
  '/',
  authenticate,
  claimSubmitLimiter,
  submitClaimValidator,
  validate,
  claimController.submitClaim
);
itemClaimsRouter.get('/', authenticate, claimController.getClaimsForItem);

// User-scoped claim router for /api/claims
const router = express.Router();
router.get('/my', authenticate, claimController.getMyClaims);
router.patch(
  '/:claimId/review',
  authenticate,
  reviewClaimValidator,
  validate,
  claimController.reviewClaim
);
router.patch('/:claimId/withdraw', authenticate, claimController.withdrawClaim);

// Direct convenience fallback routes for /api/claims/items/:itemId/claims
router.post(
  '/items/:itemId',
  authenticate,
  claimSubmitLimiter,
  submitClaimValidator,
  validate,
  claimController.submitClaim
);
router.get('/items/:itemId', authenticate, claimController.getClaimsForItem);

module.exports = router;
module.exports.itemClaimsRouter = itemClaimsRouter;
module.exports.claimSubmitLimiter = claimSubmitLimiter;
