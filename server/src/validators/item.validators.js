const { body } = require('express-validator');

const VALID_CATEGORIES = [
  'Electronics',
  'Identity Cards',
  'Books & Stationery',
  'Bags & Accessories',
  'Clothing',
  'Keys',
  'Water Bottles',
  'Other',
];

const createItemValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['lost', 'found'])
    .withMessage('Type must be either "lost" or "found"'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 3, max: 300 })
    .withMessage('Location must be between 3 and 300 characters'),

  body('dateOccurred')
    .notEmpty()
    .withMessage('Date occurred is required')
    .isISO8601()
    .withMessage('Date occurred must be a valid ISO 8601 date string')
    .custom((value) => {
      const inputDate = new Date(value);
      if (inputDate > new Date()) {
        throw new Error('Date occurred cannot be in the future');
      }
      return true;
    }),
];

const updateItemValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('type')
    .optional()
    .isIn(['lost', 'found'])
    .withMessage('Type must be either "lost" or "found"'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage('Location must be between 3 and 300 characters'),

  body('dateOccurred')
    .optional()
    .isISO8601()
    .withMessage('Date occurred must be a valid ISO 8601 date string')
    .custom((value) => {
      const inputDate = new Date(value);
      if (inputDate > new Date()) {
        throw new Error('Date occurred cannot be in the future');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['open', 'resolved', 'returned', 'archived'])
    .withMessage('Status must be one of: open, resolved, returned, archived'),
];

module.exports = {
  VALID_CATEGORIES,
  createItemValidator,
  updateItemValidator,
};
