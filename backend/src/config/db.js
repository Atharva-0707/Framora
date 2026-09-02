const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/framora';

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[FATAL] Production MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    }

    console.warn(`[MongoDB Notice]: Local MongoDB at ${mongoUri} not available (${err.message}). Starting development in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected successfully to in-memory instance: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB Connection Error]: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
