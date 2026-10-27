const itemService = require('../services/item.service');

const createItem = async (req, res, next) => {
  try {
    const item = await itemService.createItem(req.body, req.user.id, req.files);
    return res.status(201).json({
      success: true,
      message: 'Item reported successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listItems = async (req, res, next) => {
  try {
    const result = await itemService.listItems(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await itemService.getItemById(itemId, req.user);
    return res.status(200).json({
      success: true,
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await itemService.updateItem(
      itemId,
      req.user.id,
      req.user.role,
      req.body,
      req.files
    );
    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

const archiveItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await itemService.archiveItem(itemId, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      message: 'Item archived successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmReturn = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await itemService.confirmReturn(itemId, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      message: 'Item marked as returned successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  listItems,
  getItemById,
  updateItem,
  archiveItem,
  confirmReturn,
};
