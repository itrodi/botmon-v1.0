import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://api.automation365.io';

const SocketContext = createContext({
  socket: null,
  connected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('[Socket] Already connected:', socketRef.current.id);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[Socket] ❌ No token in localStorage — cannot connect');
      return;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('═══════════════════════════════════════════');
    console.log('[Socket] 🔌 CONNECTING...');
    console.log('[Socket] URL:', SOCKET_URL);
    console.log('[Socket] Token:', token.substring(0, 40) + '...');
    console.log('[Socket] Method: query: { token }');
    console.log('[Socket] Transport: websocket');
    console.log('═══════════════════════════════════════════');

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { token: token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    newSocket.on('connect', () => {
      console.log('═══════════════════════════════════════════');
      console.log('[Socket] ✅ CONNECTED');
      console.log('[Socket] Socket ID:', newSocket.id);
      console.log('[Socket] Transport:', newSocket.io.engine.transport.name);
      console.log('═══════════════════════════════════════════');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] ⚠️ DISCONNECTED — Reason:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.log('═══════════════════════════════════════════');
      console.error('[Socket] ❌ CONNECTION FAILED');
      console.error('[Socket] Error message:', err.message);
      console.error('[Socket] Error type:', err.type);
      console.error('[Socket] Error description:', err.description);
      console.log('═══════════════════════════════════════════');
      setConnected(false);

      if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
        console.warn('[Socket] → Token rejected. Stopping reconnect.');
        newSocket.disconnect();
      }
    });

    // Catch EVERY event the server sends
    newSocket.onAny((eventName, ...args) => {
      console.log(`[Socket] 📡 EVENT: "${eventName}"`, JSON.stringify(args).substring(0, 500));
    });

    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket] 🔄 Reconnect attempt #${attempt}`);
    });

    newSocket.io.on('reconnect_failed', () => {
      console.error('[Socket] ❌ All reconnection attempts failed');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Manually disconnecting');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    }
  }, []);

  // Auto-connect on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[Socket] SocketProvider mounted. Token exists:', !!token);
    if (token) connect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;