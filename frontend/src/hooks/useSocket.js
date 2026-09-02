import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, joinPostRoom, leavePostRoom } from '../services/socket';

/**
 * Custom hook for Socket.IO connection status & post-specific realtime event subscriptions
 * @param {string} [postId] - Optional post ID to automatically manage post room lifecycle
 */
export const useSocket = (postId = null) => {
  const [status, setStatus] = useState('offline'); // 'connected' | 'reconnecting' | 'offline'
  const activePostIdRef = useRef(postId ? String(postId) : null);

  useEffect(() => {
    activePostIdRef.current = postId ? String(postId) : null;
  }, [postId]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setStatus('connected');
      if (activePostIdRef.current) {
        socket.emit('join-post', String(activePostIdRef.current));
      }
    };

    const handleDisconnect = (reason) => {
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setStatus('offline');
      } else {
        setStatus('reconnecting');
      }
    };

    const handleReconnect = () => {
      setStatus('connected');
      if (activePostIdRef.current) {
        socket.emit('join-post', String(activePostIdRef.current));
      }
    };

    const handleReconnectAttempt = () => {
      setStatus('reconnecting');
    };

    const handleConnectError = () => {
      setStatus('reconnecting');
    };

    if (socket.connected) {
      setStatus('connected');
      if (postId) {
        socket.emit('join-post', String(postId));
      }
    } else {
      socket.connect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('connect_error', handleConnectError);

      if (postId) {
        socket.emit('leave-post', String(postId));
      }
    };
  }, [postId]);

  /**
   * Subscribe to a socket event with automatic cleanup
   */
  const on = useCallback((event, callback) => {
    const socket = getSocket();
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, []);

  return {
    status, // 'connected' | 'reconnecting' | 'offline'
    socket: getSocket(),
    on,
  };
};

export default useSocket;
