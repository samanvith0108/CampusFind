require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { getJwtSecret } = require('./config/jwt');
const { cloudinaryConfigured, verifyCloudinaryCredentials } = require('./config/cloudinary');

const PORT = process.env.PORT || 5000;

let server;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    getJwtSecret();

    if (cloudinaryConfigured) {
      try {
        await verifyCloudinaryCredentials();
        console.log('[Cloudinary] Credentials verified successfully.');
      } catch (error) {
        if (process.env.NODE_ENV === 'production') {
          throw error;
        }
        console.error(`[Cloudinary] ${error.message}`);
      }
    }

    // Connect to database with retry logic
    await connectDB();

    server = app.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log(` CampusFind Backend Server Running`);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Port        : ${PORT}`);
      console.log(` Client URL  : ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('[FATAL] Failed to initialize server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle graceful shutdown signals (SIGTERM, SIGINT)
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
