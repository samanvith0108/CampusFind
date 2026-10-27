const express = require('express');
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/reports', adminController.getReports);
router.get('/users', adminController.getUsers);
router.patch('/items/:itemId/archive', adminController.adminArchiveItem);
router.patch('/users/:userId/status', adminController.updateUserStatus);

module.exports = router;
