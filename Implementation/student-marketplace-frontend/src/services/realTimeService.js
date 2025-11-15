import { messagingAPI } from './api';

class RealTimeService {
  constructor() {
    this.isActive = false;
    this.pollingInterval = null;
    this.currentConversations = new Map();
    this.messageListeners = new Set();
    this.lastMessageTimestamp = new Date();
  }

  // Start polling for new messages (only if authenticated)
  async startPolling(intervalMs = 3000) {
    if (this.isActive) return;
    
    // Check authentication before starting
    const { authAPI } = require('./api');
    const isAuthenticated = await authAPI.isAuthenticated();
    
    if (!isAuthenticated) {
      console.log('⚠️ User not authenticated, skipping real-time polling');
      return;
    }
    
    console.log('🔄 Starting real-time message polling');
    this.isActive = true;
    this.lastMessageTimestamp = new Date();
    
    this.pollingInterval = setInterval(() => {
      this.checkForNewMessages();
    }, intervalMs);
  }

  // Stop polling
  stopPolling() {
    if (!this.isActive) return;
    
    console.log('⏹️ Stopping real-time message polling');
    this.isActive = false;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check for new messages across all conversations
  async checkForNewMessages() {
    try {
      // Check if user is authenticated before making API calls
      const { authAPI } = require('./api');
      const isAuthenticated = await authAPI.isAuthenticated();
      
      if (!isAuthenticated) {
        // User not logged in, stop polling immediately
        console.log('🔐 User not authenticated, stopping real-time service');
        this.stopPolling();
        return;
      }
      
      const result = await messagingAPI.getConversations();
      
      if (result.success && result.data.conversations) {
        const conversations = result.data.conversations;
        
        // Check each conversation for new messages
        conversations.forEach(conversation => {
          const conversationKey = `${conversation.user._id}_${conversation.listing?._id || 'general'}`;
          const lastMessage = conversation.lastMessage;
          
          if (lastMessage && new Date(lastMessage.createdAt) > this.lastMessageTimestamp) {
            // New message found!
            console.log('📨 New message detected:', lastMessage);
            
            // Notify listeners
            this.messageListeners.forEach(callback => {
              callback(lastMessage, 'new');
            });
            
            // Update timestamp
            this.lastMessageTimestamp = new Date(lastMessage.createdAt);
          }
        });
      }
    } catch (error) {
      // Check if this is an authentication error
      if (error.response?.status === 401 || error.message?.includes('token')) {
        console.log('🔐 Authentication error, stopping real-time service');
        this.stopPolling();
        return;
      }
      
      // Only log other errors if user is authenticated (to avoid spam during login/signup)
      try {
        const { authAPI } = require('./api');
        const isAuthenticated = await authAPI.isAuthenticated();
        
        if (isAuthenticated) {
          console.error('Error checking for new messages:', error);
        } else {
          // User not authenticated, stop polling
          this.stopPolling();
        }
      } catch (authError) {
        // If we can't check auth status, stop polling to be safe
        console.log('🚨 Cannot verify auth status, stopping polling');
        this.stopPolling();
      }
    }
  }

  // Add listener for new messages
  onMessage(callback) {
    this.messageListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  // Remove all listeners
  removeAllListeners() {
    this.messageListeners.clear();
  }

  // Check if service is active
  isPolling() {
    return this.isActive;
  }

  // Send message (just use regular API)
  async sendMessage(receiverId, content, listingId = null) {
    try {
      const result = await messagingAPI.sendMessage(receiverId, content, listingId);
      
      if (result.success) {
        console.log('📤 Message sent via API');
        
        // Immediately check for updates to refresh the UI
        setTimeout(() => {
          this.checkForNewMessages();
        }, 500);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // Start service after user login
  async startAfterLogin() {
    console.log('👤 User logged in, starting real-time service');
    await this.startPolling(3000);
  }

  // Stop service after user logout
  stopAfterLogout() {
    console.log('👤 User logged out, stopping real-time service');
    this.stopPolling();
    // Also clear any listeners to prevent memory leaks
    this.removeAllListeners();
  }

  // Force stop all activities (emergency cleanup)
  forceStop() {
    console.log('🚨 Force stopping real-time service');
    this.isActive = false;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.removeAllListeners();
  }
}

// Export singleton instance
export default new RealTimeService();