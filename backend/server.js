const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const http = require('http');
const connectDB = require('./src/config/db');
const { validateEnv } = require('./src/config/envValidator');
const seedData = require('./src/utils/seedData');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');

const startServer = async () => {
  // Validate critical environment configuration
  validateEnv();

  // Connect to Database
  await connectDB();

  // Ensure demo accounts and initial community data exist
  try {
    await seedData();
  } catch (seedErr) {
    console.error(`[Database] Seeding error: ${seedErr.message}`);
  }

  const PORT = process.env.PORT || 5050;
  const server = http.createServer(app);

  // Initialize Socket.IO with HTTP server
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Framora API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`⚡ Socket.IO Server integrated and active on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
