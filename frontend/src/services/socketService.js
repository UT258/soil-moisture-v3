import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupEventListeners() {
    // Sensor events
    this.socket.on('sensor:created', (data) => this.emit('sensor:created', data));
    this.socket.on('sensor:updated', (data) => this.emit('sensor:updated', data));
    this.socket.on('sensor:deleted', (data) => this.emit('sensor:deleted', data));
    this.socket.on('sensor:status', (data) => this.emit('sensor:status', data));

    // Reading events
    this.socket.on('reading:new', (data) => this.emit('reading:new', data));

    // Alert events
    this.socket.on('alert:new', (data) => this.emit('alert:new', data));
    this.socket.on('alert:updated', (data) => this.emit('alert:updated', data));
    this.socket.on('alert:acknowledged', (data) => this.emit('alert:acknowledged', data));
    this.socket.on('alert:resolved', (data) => this.emit('alert:resolved', data));

    // Risk events
    this.socket.on('risk:alert', (data) => this.emit('risk:alert', data));
    this.socket.on('riskzone:created', (data) => this.emit('riskzone:created', data));
    this.socket.on('riskzone:updated', (data) => this.emit('riskzone:updated', data));
    this.socket.on('riskzone:feedback', (data) => this.emit('riskzone:feedback', data));
  }

  // Event emitter pattern
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Join a specific room
  joinRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
    }
  }

  // Leave a specific room
  leaveRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
