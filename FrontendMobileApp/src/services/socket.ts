import {io, Socket} from 'socket.io-client';
import api from './api';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const currentBaseUrl = api.defaults.baseURL as string || 'http://192.168.1.6:8989';
    const dynamicSocketUrl = currentBaseUrl.replace('/api/', '').replace('/api', '');

    this.socket = io(dynamicSocketUrl, {
      auth: {token},
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (err: Error) => {
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

  onTokenStarted(callback: (data: any) => void) {
    this.socket?.on('tokenStarted', callback);
  }

  onTokenCompleted(callback: (data: any) => void) {
    this.socket?.on('tokenCompleted', callback);
  }

  onTurnApproaching(callback: (data: any) => void) {
    this.socket?.on('turnApproaching', callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
