const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getJwtSecret } = require('../config/jwt');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password, // Pre-save hook will hash this with bcrypt (saltRounds=12)
    role: 'student',
    isActive: true,
  });

  await user.save();
  return user.toJSON();
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  return user.toJSON();
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User account is deactivated.');
    error.statusCode = 403;
    throw error;
  }

  return user.toJSON();
};

module.exports = {
  signToken,
  registerUser,
  loginUser,
  getCurrentUser,
};
