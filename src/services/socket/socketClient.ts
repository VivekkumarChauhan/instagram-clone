import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_RECONNECT_ATTEMPTS, SOCKET_RECONNECT_DELAY_MS } from '@utils/constants';
import { getAccessToken } from '@utils/tokenStorage';

type SocketEventHandler = (...args: unknown[]) => void;

class SocketClient {
  private socket: Socket | null = null;
  private registeredEvents: Map<string, SocketEventHandler> = new Map();
  private isConnecting = false;

  connect(): void {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;
    const token = getAccessToken();

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: SOCKET_RECONNECT_ATTEMPTS,
      reconnectionDelay: SOCKET_RECONNECT_DELAY_MS,
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      this.reRegisterEvents();
    });

    this.socket.on('disconnect', () => {
      this.isConnecting = false;
    });

    this.socket.on('connect_error', () => {
      this.isConnecting = false;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.registeredEvents.clear();
    this.isConnecting = false;
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, handler: SocketEventHandler): void {
    this.registeredEvents.set(event, handler);
    if (this.socket) {
      this.socket.off(event);
      this.socket.on(event, handler);
    }
  }

  off(event: string): void {
    this.registeredEvents.delete(event);
    this.socket?.off(event);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  updateToken(): void {
    const token = getAccessToken();
    if (this.socket && token) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        this.socket.connect();
      }
    }
  }

  private reRegisterEvents(): void {
    if (!this.socket) return;
    this.registeredEvents.forEach((handler, event) => {
      this.socket!.off(event);
      this.socket!.on(event, handler);
    });
  }
}

export const socketClient = new SocketClient();
