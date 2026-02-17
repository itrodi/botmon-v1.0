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
      console.warn('[Socket] No token — cannot connect');
      return;
    }

    // Tear down any stale socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('[Socket] Connecting to', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { token },           // Backend reads token from query params
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected — id:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setConnected(false);

      if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
        console.warn('[Socket] Auth rejected — stopping reconnection');
        newSocket.disconnect();
      }
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