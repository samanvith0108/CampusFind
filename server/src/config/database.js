const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const MAX_RETRIES = 5;
const INITIAL_RETRY_INTERVAL_MS = 2000;
let memoryServer;

const getMongoUri = async () => {
  const configuredUri = process.env.MONGO_URI?.trim();
  if (configuredUri) {
    return configuredUri;
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  memoryServer = memoryServer || (await MongoMemoryServer.create());
  return memoryServer.getUri();
};

const connectDB = async (retryCount = 0) => {
  const mongoUri = await getMongoUri();

  if (!mongoUri) {
    console.error('CRITICAL: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);

    if (retryCount < MAX_RETRIES - 1) {
      const waitTime = INITIAL_RETRY_INTERVAL_MS * Math.pow(2, retryCount);
      console.log(`[MongoDB] Retrying connection in ${waitTime / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return connectDB(retryCount + 1);
    } else {
      console.error('[MongoDB] Max connection retries reached. Exiting application.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error event:', err.message);
});

module.exports = { connectDB };
