const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const http = require('http');
const connectDB = require('./src/config/db');
const { validateEnv } = require('./src/config/envValidator');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');

const seedData = require('./src/utils/seedData');

const startServer = async () => {
  validateEnv();

  await connectDB();

  // Automatically seed the database when it is empty.
  await seedData();

  const PORT = process.env.PORT || 5050;
  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => {
    console.log(
      `🚀 Framora API Server running in ${
        process.env.NODE_ENV || 'development'
      } mode on port ${PORT}`
    );
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`⚡ Socket.IO Server integrated and active on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
