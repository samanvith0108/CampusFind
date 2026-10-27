const { body } = require('express-validator');

const submitClaimValidator = [
  body('verificationDetails')
    .trim()
    .notEmpty()
    .withMessage('Verification details are required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Verification details must be between 20 and 2000 characters to provide sufficient proof'),
];

const reviewClaimValidator = [
  body('decision')
    .notEmpty()
    .withMessage('Decision is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Decision must be either "approved" or "rejected"'),

  body('reviewNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review note cannot exceed 500 characters'),
];

module.exports = {
  submitClaimValidator,
  reviewClaimValidator,
};
