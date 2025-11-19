import io from 'socket.io-client';
import { tokenManager } from './api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.messageListeners = new Set();
    this.typingListeners = new Set();
    this.statusListeners = new Set();
  }

  async connect() {
    try {
      // Get user token and ID
      const token = await tokenManager.getToken();
      if (!token) {
        console.log('No token found, cannot connect socket');
        return false;
      }

      this.userId = await this.getUserIdFromToken(token);
      if (!this.userId) {
        console.log('No user ID found, cannot connect socket');
        return false;
      }

      // Connect to socket server
      // For production: 
      //const SOCKET_URL = 'https://studentmartketplace-backend.onrender.com';
      // For local development:
      const SOCKET_URL = 'http://10.0.0.26:5000';
      
      console.log('🔄 Attempting to connect to Socket.IO server:', SOCKET_URL);
      console.log('👤 User ID:', this.userId);
      
      this.socket = io(SOCKET_URL, {
        // Temporarily remove auth to test basic connection
        // auth: { token },
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 3,
        timeout: 10000,
        forceNew: true
      });

      // Set up event listeners
      this.setupEventListeners();

      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          console.log('🟢 Socket connected:', this.socket.id);
          this.isConnected = true;
          
          // Join user's personal room
          this.socket.emit('join', this.userId);
          
          // Emit user online status
          this.socket.emit('userOnline', this.userId);
          
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('🔴 Socket connection error:', error);
          console.error('Error details:', error.message);
          console.error('Error type:', error.type);
          this.isConnected = false;
          resolve(false);
        });

        // Add timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏰ Socket connection timeout after 20 seconds');
            resolve(false);
          }
        }, 20000);
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      return false;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Handle connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🟡 Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('reconnect', () => {
      console.log('🟢 Socket reconnected');
      this.isConnected = true;
      if (this.userId) {
        this.socket.emit('join', this.userId);
        this.socket.emit('userOnline', this.userId);
      }
    });

    // Handle new messages
    this.socket.on('newMessage', (message) => {
      console.log('📨 New message received:', message);
      this.messageListeners.forEach(callback => callback(message));
    });

    // Handle message delivery confirmation
    this.socket.on('messageDelivered', (message) => {
      console.log('✅ Message delivered:', message._id);
      this.messageListeners.forEach(callback => callback(message, 'delivered'));
    });

    // Handle message errors
    this.socket.on('messageError', (error) => {
      console.error('❌ Message error:', error);
      this.messageListeners.forEach(callback => callback(null, 'error', error));
    });

    // Handle typing indicators
    this.socket.on('userTyping', (data) => {
      this.typingListeners.forEach(callback => callback(data));
    });

    // Handle user status changes
    this.socket.on('userStatusChanged', (data) => {
      this.statusListeners.forEach(callback => callback(data));
    });
  }

  // Send a message via socket
  sendMessage(receiverId, content, listingId = null) {
    console.log('🔍 Checking socket connection...');
    console.log('Socket exists:', !!this.socket);
    console.log('Is connected:', this.isConnected);
    
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected, cannot send message');
      console.error('Socket:', this.socket ? 'exists' : 'null');
      console.error('Connected:', this.isConnected);
      return false;
    }

    const messageData = {
      senderId: this.userId,
      receiverId,
      content,
      listingId,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message via socket:', messageData);
    this.socket.emit('sendMessage', messageData);
    return true;
  }

  // Send typing indicator
  sendTyping(receiverId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        senderId: this.userId,
        receiverId,
        isTyping
      });
    }
  }

  // Listen for new messages
  onMessage(callback) {
    this.messageListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  // Listen for typing indicators
  onTyping(callback) {
    this.typingListeners.add(callback);
    
    return () => {
      this.typingListeners.delete(callback);
    };
  }

  // Listen for user status changes
  onUserStatus(callback) {
    this.statusListeners.add(callback);
    
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  // Clean up all listeners
  removeAllListeners() {
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.statusListeners.clear();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔴 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      this.removeAllListeners();
    }
  }

  // Get user ID from JWT token
  async getUserIdFromToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.id || decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Get current user ID
  getCurrentUserId() {
    return this.userId;
  }
}

// Export singleton instance
export default new SocketService();