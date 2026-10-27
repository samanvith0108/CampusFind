const path = require('path');
const Item = require('../models/item.model');
const Claim = require('../models/claim.model');
const notificationService = require('./notification.service');

const normalizeImage = (file) => {
  const rawPath = typeof file?.path === 'string' ? file.path : '';
  const fileName = file?.filename || 'upload-image';

  if (!rawPath) {
    return null;
  }

  const isLocalUpload = path.isAbsolute(rawPath) || rawPath.startsWith('/uploads/');

  return {
    url: isLocalUpload ? `/uploads/${path.basename(rawPath)}` : rawPath,
    publicId: file.public_id || fileName,
  };
};

const ALLOWED_SORT_FIELDS = [
  'createdAt',
  '-createdAt',
  'dateOccurred',
  '-dateOccurred',
  'title',
  '-title',
];

const createItem = async (data, userId, files = []) => {
  const images = (files || []).map(normalizeImage).filter(Boolean);

  const item = new Item({
    title: data.title,
    description: data.description,
    type: data.type,
    category: data.category,
    location: data.location,
    dateOccurred: data.dateOccurred,
    images,
    reportedBy: userId,
  });

  await item.save();
  return item.populate('reportedBy', 'name email');
};

const listItems = async (query = {}) => {
  const filter = {};

  // Status filtering (default to excluding archived)
  if (query.status && ['open', 'resolved', 'returned'].includes(query.status)) {
    filter.status = query.status;
  } else {
    filter.status = { $ne: 'archived' };
  }

  // Type filter
  if (query.type && ['lost', 'found'].includes(query.type)) {
    filter.type = query.type;
  }

  // Category filter
  if (query.category) {
    filter.category = query.category;
  }

  // Location filter (case-insensitive regex, sanitized)
  if (query.location && typeof query.location === 'string') {
    const escapedLocation = query.location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.location = { $regex: escapedLocation, $options: 'i' };
  }

  // Keyword search on title and description
  if (query.keyword && typeof query.keyword === 'string') {
    const escapedKeyword = query.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escapedKeyword, $options: 'i' } },
      { description: { $regex: escapedKeyword, $options: 'i' } },
    ];
  }

  // Date range filter
  if (query.dateFrom || query.dateTo) {
    filter.dateOccurred = {};
    if (query.dateFrom) {
      filter.dateOccurred.$gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      const dateTo = new Date(query.dateTo);
      if (/^\d{4}-\d{2}-\d{2}$/.test(query.dateTo)) {
        dateTo.setUTCDate(dateTo.getUTCDate() + 1);
        filter.dateOccurred.$lt = dateTo;
      } else {
        filter.dateOccurred.$lte = dateTo;
      }
    }
  }

  // Pagination
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Sorting
  let sortOption = '-createdAt';
  if (query.sort && ALLOWED_SORT_FIELDS.includes(query.sort)) {
    sortOption = query.sort;
  }

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name')
      .lean(),
    Item.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

const getItemById = async (itemId, user = null) => {
  const item = await Item.findById(itemId).populate('reportedBy', 'name email');

  if (!item) {
    const error = new Error('Item not found.');
    error.statusCode = 404;
    throw error;
  }

  // Non-admins cannot view archived items
  if (item.status === 'archived' && (!user || user.role !== 'admin')) {
    const error = new Error('Item not found or has been archived.');
    error.statusCode = 404;
    throw error;
  }

  return item;
};

const updateItem = async (itemId, userId, role, data, files = []) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const error = new Error('Item not found.');
    error.statusCode = 404;
    throw error;
  }

  if (item.reportedBy.toString() !== userId.toString() && role !== 'admin') {
    const error = new Error('Access denied. You can only update your own reported items.');
    error.statusCode = 403;
    throw error;
  }

  if (item.status === 'archived') {
    const error = new Error('Cannot update an archived item.');
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = ['title', 'description', 'category', 'location', 'dateOccurred', 'type'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      item[field] = data[field];
    }
  });

  let retainedImages = item.images;
  if (data.existingImages !== undefined) {
    let requestedImages;
    try {
      requestedImages =
        typeof data.existingImages === 'string'
          ? JSON.parse(data.existingImages)
          : data.existingImages;
    } catch (error) {
      const invalidImagesError = new Error('Existing images must be a valid JSON array.');
      invalidImagesError.statusCode = 400;
      throw invalidImagesError;
    }

    if (!Array.isArray(requestedImages)) {
      const invalidImagesError = new Error('Existing images must be an array.');
      invalidImagesError.statusCode = 400;
      throw invalidImagesError;
    }

    const requestedKeys = new Set(
      requestedImages
        .map((image) => (typeof image === 'string' ? image : image?.publicId || image?.url))
        .filter((key) => typeof key === 'string' && key.length > 0)
    );
    retainedImages = item.images.filter(
      (image) => requestedKeys.has(image.publicId) || requestedKeys.has(image.url)
    );
  }

  const newImages = (files || []).map(normalizeImage).filter(Boolean);
  if (retainedImages.length + newImages.length > 5) {
    const tooManyImagesError = new Error('You can keep or upload a maximum of 5 images.');
    tooManyImagesError.statusCode = 400;
    throw tooManyImagesError;
  }

  item.images = retainedImages;
  if (files && files.length > 0) {
    item.images.push(...newImages);
  }

  await item.save();
  return item.populate('reportedBy', 'name email');
};

const archiveItem = async (itemId, userId, role) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const error = new Error('Item not found.');
    error.statusCode = 404;
    throw error;
  }

  if (item.reportedBy.toString() !== userId.toString() && role !== 'admin') {
    const error = new Error('Access denied. You can only archive your own items.');
    error.statusCode = 403;
    throw error;
  }

  item.status = 'archived';
  await item.save();

  // Close any pending claims associated with this archived item
  await Claim.updateMany(
    { item: itemId, status: 'pending' },
    { $set: { status: 'closed', reviewNote: 'Item was archived by the reporter or admin.' } }
  );

  return item;
};

const confirmReturn = async (itemId, userId, role) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const error = new Error('Item not found.');
    error.statusCode = 404;
    throw error;
  }

  if (item.reportedBy.toString() !== userId.toString() && role !== 'admin') {
    const error = new Error('Access denied. Only the reporter or an admin can confirm return.');
    error.statusCode = 403;
    throw error;
  }

  if (item.status !== 'open') {
    const error = new Error(`Item cannot be marked as returned because its status is "${item.status}".`);
    error.statusCode = 400;
    throw error;
  }

  const approvedClaim = await Claim.findOne({ item: itemId, status: 'approved' });
  if (!approvedClaim) {
    const error = new Error('Cannot confirm return without an approved claim on the item.');
    error.statusCode = 400;
    throw error;
  }

  item.status = 'returned';
  item.returnedAt = new Date();
  item.returnedBy = userId;
  await item.save();

  // Close all other remaining pending claims
  await Claim.updateMany(
    { item: itemId, status: 'pending' },
    { $set: { status: 'closed', reviewNote: 'Item returned to verified claimant.' } }
  );

  // Notify claimant about the completed return
  await notificationService.createNotification({
    recipient: approvedClaim.claimant,
    type: 'item_returned',
    message: `Your claimed item "${item.title}" has been confirmed as returned!`,
    relatedItem: item._id,
    relatedClaim: approvedClaim._id,
  });

  return item.populate('reportedBy', 'name email');
};

module.exports = {
  createItem,
  listItems,
  getItemById,
  updateItem,
  archiveItem,
  confirmReturn,
};
