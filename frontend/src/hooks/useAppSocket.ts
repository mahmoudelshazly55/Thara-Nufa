import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function useAppSocket(
  siteUser: { id: string } | null,
  siteToken: string | null,
  currentPage: string,
  onUnread: () => void,
) {
  const socketRef   = useRef<Socket | null>(null);
  const pageRef     = useRef(currentPage);
  const onUnreadRef = useRef(onUnread);
  useEffect(() => { pageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { onUnreadRef.current = onUnread; }, [onUnread]);

  useEffect(() => {
    if (!siteUser?.id || !siteToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 20,
      auth: { token: siteToken },
    });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join:user', siteUser.id));
    socket.on('notification', () => {
      if (!pageRef.current.startsWith('dashboard')) { onUnreadRef.current(); }
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [siteUser?.id, siteToken]);

  return socketRef;
}
