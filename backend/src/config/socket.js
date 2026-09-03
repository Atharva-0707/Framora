const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const getAllowedOrigins = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const productionOrigins = Array.from(
    new Set([
      ...rawUrls,
      'https://framora-sigma.vercel.app',
      'https://framora.vercel.app',
    ])
  );

  if (isProduction) {
    return productionOrigins;
  }

  return Array.from(
    new Set([
      ...productionOrigins,
      'http://localhost:5174',
      'http://localhost:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5173',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ])
  );
};

/**
 * Initialize Socket.IO with the existing HTTP Server
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        const normalizedOrigin = origin.trim().replace(/\/+$/, '');
        const allowed = getAllowedOrigins();
        if (allowed.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by Socket.IO CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware using existing JWT system
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.startsWith('Bearer ') &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('_id username name avatar');
          if (user) {
            socket.user = user;
          }
        } catch {
          socket.user = null;
        }
      } else {
        socket.user = null;
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    const userInfo = socket.user ? `@${socket.user.username}` : 'guest';
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket.IO] Client connected: ${socket.id} (${userInfo})`);
    }

    // Join a specific post room
    socket.on('join-post', (postId) => {
      if (!postId) return;
      const cleanPostId = String(postId).trim();
      const room = `post:${cleanPostId}`;
      socket.join(room);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Socket.IO] ${socket.id} (${userInfo}) joined room: ${room}`);
      }
    });

    // Leave a specific post room
    socket.on('leave-post', (postId) => {
      if (!postId) return;
      const cleanPostId = String(postId).trim();
      const room = `post:${cleanPostId}`;
      socket.leave(room);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Socket.IO] ${socket.id} left room: ${room}`);
      }
    });

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
      }
    });
  });

  return io;
};

/**
 * Get active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket first.');
  }
  return io;
};

/**
 * Safely emit event to a specific post room
 * @param {string|mongoose.Types.ObjectId} postId 
 * @param {string} event 
 * @param {object} payload 
 */
const emitToPost = (postId, event, payload) => {
  if (!io || !postId) return;
  try {
    const cleanPostId = String(postId).trim();
    const room = `post:${cleanPostId}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket.IO] Broadcasting '${event}' to ${room}`);
    }
    io.to(room).emit(event, payload);
  } catch (error) {
    console.error(`[Socket.IO Emit Error] Event: ${event} on post:${postId}:`, error.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToPost,
};
