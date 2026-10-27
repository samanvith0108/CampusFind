const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getJwtSecret } = require('../config/jwt');
const itemController = require('../controllers/item.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { uploadImages, handleUploadError } = require('../middleware/upload');
const {
  createItemValidator,
  updateItemValidator,
} = require('../validators/item.validators');
const { itemClaimsRouter } = require('./claim.routes');

const router = express.Router();

// Optional authentication helper to identify admins for public routes
const optionalAuthenticate = async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select('role isActive');
      if (user?.isActive) {
        req.user = { ...decoded, id: user._id.toString(), role: user.role };
      }
    } catch (err) {
      if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') {
        return next(err);
      }
    }
  }
  return next();
};

// Item CRUD routes
router.post(
  '/',
  authenticate,
  uploadImages,
  handleUploadError,
  createItemValidator,
  validate,
  itemController.createItem
);

router.get('/', optionalAuthenticate, itemController.listItems);

router.get('/:itemId', optionalAuthenticate, itemController.getItemById);

router.patch(
  '/:itemId',
  authenticate,
  uploadImages,
  handleUploadError,
  updateItemValidator,
  validate,
  itemController.updateItem
);

router.delete('/:itemId', authenticate, itemController.archiveItem);

router.patch('/:itemId/returned', authenticate, itemController.confirmReturn);

// Mount item-scoped claim routes:
// POST /api/items/:itemId/claims and GET /api/items/:itemId/claims
router.use('/:itemId/claims', itemClaimsRouter);

module.exports = router;
