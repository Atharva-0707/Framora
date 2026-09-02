import { io } from 'socket.io-client';

let socket = null;

// Determine backend socket server URL
const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  // In development, using window.location.origin leverages Vite's /socket.io proxy
  // Fallback to http://localhost:5050 if running in a non-browser environment
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5050';
};

/**
 * Initialize and connect Socket.IO client
 * @param {string} token - Optional JWT token
 */
export const connectSocket = (token) => {
  const authToken = token || localStorage.getItem('framora_token');

  if (socket) {
    // Update auth token in case user logged in / out
    socket.auth = { token: authToken };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: {
      token: authToken,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 4000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
  });

  return socket;
};

/**
 * Get active socket instance or create one
 */
export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

/**
 * Join a post room for realtime comments and sale events
 * @param {string} postId 
 */
export const joinPostRoom = (postId) => {
  if (!postId) return;
  const cleanId = String(postId).trim();
  const s = getSocket();
  if (s.connected) {
    s.emit('join-post', cleanId);
  } else {
    s.once('connect', () => {
      s.emit('join-post', cleanId);
    });
  }
};

/**
 * Leave a post room
 * @param {string} postId 
 */
export const leavePostRoom = (postId) => {
  if (!postId) return;
  const cleanId = String(postId).trim();
  const s = getSocket();
  if (s.connected) {
    s.emit('leave-post', cleanId);
  }
};

/**
 * Disconnect socket on logout or app unload
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  connectSocket,
  getSocket,
  joinPostRoom,
  leavePostRoom,
  disconnectSocket,
};
