import {io, Socket} from 'socket.io-client';
import {API_URL} from '../constants/config';

// Extract base URL from API_URL (remove /api)
const socketUrl = API_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(socketUrl, {
      auth: {token},
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('connect_error', err => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUser(userId: string) {
    this.socket?.emit('join_user', userId);
  }

  onDocumentStatusUpdated(callback: (data: any) => void) {
    this.socket?.on('DOCUMENT_STATUS_UPDATED', callback);
  }

  joinQueue(counterId: string) {
    this.socket?.emit('join_queue', counterId);
  }

  onQueueUpdate(callback: (data: any) => void) {
    this.socket?.on('queueUpdated', callback);
  }

  onTurnApproaching(callback: (data: any) => void) {
    this.socket?.on('turnApproaching', callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
