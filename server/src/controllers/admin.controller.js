const Item = require('../models/item.model');
const User = require('../models/user.model');
const Claim = require('../models/claim.model');
const notificationService = require('../services/notification.service');

const getReports = async (req, res, next) => {
  try {
    const filter = {};

    if (['open', 'resolved', 'returned', 'archived'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.type && ['lost', 'found'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (typeof req.query.keyword === 'string' && req.query.keyword.trim()) {
      const keyword = req.query.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const [items, total, statusCounts] = await Promise.all([
      Item.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name email role isActive')
        .lean(),
      Item.countDocuments(filter),
      Item.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const counts = statusCounts.reduce(
      (result, entry) => {
        result[entry._id] = entry.count;
        return result;
      },
      { open: 0, resolved: 0, returned: 0, archived: 0 }
    );

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        stats: {
          total: Object.values(counts).reduce((sum, count) => sum + count, 0),
          ...counts,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select('name email role isActive createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const adminArchiveItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    item.status = 'archived';
    await item.save();

    // Close any associated pending claims
    await Claim.updateMany(
      { item: itemId, status: 'pending' },
      { $set: { status: 'closed', reviewNote: 'Item was moderated/archived by campus administrator.' } }
    );

    // Notify the user who reported the item
    await notificationService.createNotification({
      recipient: item.reportedBy,
      type: 'report_moderated',
      message: `Your item report "${item.title}" has been archived by a campus administrator.`,
      relatedItem: item._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Item has been archived by administrator',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive field must be a boolean (true or false)',
      });
    }

    // Safety check: Prevent admin from locking themselves out
    if (userId === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own accounts',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  getUsers,
  adminArchiveItem,
  updateUserStatus,
};
