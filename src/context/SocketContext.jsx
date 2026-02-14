import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext({
  socket: null,
  connected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Connect the socket — call this explicitly after login
  const connect = useCallback(() => {
    // Don't double-connect
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[Socket] No token found — cannot connect');
      return;
    }

    // Clean up any lingering socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('[Socket] Connecting to https://api.automation365.io ...');

    const socket = io('https://api.automation365.io', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setConnected(false);

      // If the server rejects the token, stop retrying
      if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
        console.warn('[Socket] Auth rejected — stopping reconnection');
        socket.disconnect();
      }
    });

    socketRef.current = socket;
  }, []);

  // Disconnect the socket — call this explicitly on logout
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Manually disconnecting');
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  // Cleanup on unmount only (no auto-connect)
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;