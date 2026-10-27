const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/read-all', authenticate, notificationController.markAllAsRead);
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

module.exports = router;
