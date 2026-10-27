const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getJwtSecret } = require('../config/jwt');

const authenticate = async (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Authorization: Bearer <token> if cookie is not present
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }

  try {
    const user = await User.findById(decoded.id).select('role isActive');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please log in again.',
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated.',
      });
    }

    req.user = { ...decoded, id: user._id.toString(), role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
