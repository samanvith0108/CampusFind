const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.trim();
    if (!mongoUri) {
      throw new Error('MONGO_URI must point to a persistent MongoDB database before running the seed command.');
    }

    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error('Set SEED_ADMIN_PASSWORD to a password of at least 12 characters before running the seed command.');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    const adminEmail = 'admin@sst.scaler.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.passwordHash = adminPassword;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`[Seed] Admin user (${adminEmail}) already exists. Password synchronized from SEED_ADMIN_PASSWORD.`);
    } else {
      console.log(`[Seed] Creating default admin user: ${adminEmail}...`);
      const admin = new User({
        name: 'Campus Admin',
        email: adminEmail,
        passwordHash: adminPassword,
        role: 'admin',
        isActive: true,
      });

      await admin.save();
      console.log(`[Seed] Default admin created successfully: ${adminEmail} (Role: ${admin.role})`);
    }
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('[Seed Error] Failed to disconnect from MongoDB:', disconnectError.message);
    }
    process.exit(1);
  }
};

seedAdmin();
