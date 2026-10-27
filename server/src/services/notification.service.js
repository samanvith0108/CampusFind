const Notification = require('../models/notification.model');

const createNotification = async ({
  recipient,
  type,
  message,
  relatedItem = null,
  relatedClaim = null,
}) => {
  return Notification.create({
    recipient,
    type,
    message,
    relatedItem,
    relatedClaim,
  });
};

const getNotificationsForUser = async (userId) => {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('relatedItem', 'title type status')
    .populate('relatedClaim', 'status');

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    notifications,
    unreadCount,
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  if (notification.recipient.toString() !== userId.toString()) {
    const error = new Error('Access denied. You do not own this notification.');
    error.statusCode = 403;
    throw error;
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
};
