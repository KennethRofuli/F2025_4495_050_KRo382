import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for your backend API
// Using cloud backend for international peer testing (no WiFi dependency)
const BASE_URL = 'http://10.0.0.26:5000/api';
//const BASE_URL = 'https://studentmartketplace-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  // Store token securely
  async setToken(token) {
    try {
      await SecureStore.setItemAsync('userToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  // Get stored token
  async getToken() {
    try {
      return await SecureStore.getItemAsync('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Remove token
  async removeToken() {
    try {
      await SecureStore.deleteItemAsync('userToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

// Add request interceptor to include token in headers
api.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      await tokenManager.removeToken();
      // You can add navigation to login screen here if needed
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Store token if login successful
      if (response.data.token) {
        await tokenManager.setToken(response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  },

  // Register user
  async register(name, email, password, campus) {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        campus,
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  },

  // Logout user
  async logout() {
    try {
      await tokenManager.removeToken();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await tokenManager.getToken();
    return !!token;
  },

  // Get current user ID from token
  async getCurrentUserId() {
    try {
      const token = await tokenManager.getToken();
      if (!token) return null;
      
      // Simple JWT decode (just for user ID, not for security validation)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.id;
    } catch (error) {
      console.log('Error decoding token:', error);
      return null;
    }
  },

  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile',
      };
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile',
      };
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change password',
      };
    }
  },
};

// Listings API methods
export const listingsAPI = {
  // Get all listings
  async getAllListings(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.campus) params.append('campus', filters.campus);
      
      const response = await api.get(`/listings?${params}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch listings',
      };
    }
  },

  // Get single listing
  async getListing(id) {
    try {
      const response = await api.get(`/listings/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch listing',
      };
    }
  },

  // Create new listing
  async createListing(listingData) {
    try {
      const response = await api.post('/listings', listingData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create listing',
      };
    }
  },

  // Update listing
  async updateListing(id, listingData) {
    try {
      const response = await api.put(`/listings/${id}`, listingData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update listing',
      };
    }
  },

  // Delete listing
  async deleteListing(id) {
    try {
      const response = await api.delete(`/listings/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete listing',
      };
    }
  },

  // Get user's listings
  async getMyListings() {
    try {
      const response = await api.get('/listings/user/my-listings');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch your listings',
      };
    }
  },
};

// Favorites API methods
export const favoritesAPI = {
  // Add listing to favorites
  async addFavorite(listingId) {
    try {
      const response = await api.post(`/favorites/add/${listingId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to favorites',
      };
    }
  },

  // Remove listing from favorites
  async removeFavorite(listingId) {
    try {
      const response = await api.delete(`/favorites/remove/${listingId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from favorites',
      };
    }
  },

  // Get user's favorites
  async getFavorites() {
    try {
      const response = await api.get('/favorites');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch favorites',
      };
    }
  },

  // Check if listing is favorited
  async checkFavorite(listingId) {
    try {
      const response = await api.get(`/favorites/check/${listingId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check favorite status',
      };
    }
  },
};

// Reports API methods
export const reportsAPI = {
  // Submit a report
  async submitReport(listingId, reason, description = '') {
    try {
      const response = await api.post('/reports', {
        listingId,
        reason,
        description,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit report',
      };
    }
  },

  // Get user's reports
  async getMyReports() {
    try {
      const response = await api.get('/reports/my-reports');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch reports',
      };
    }
  },
};

// Admin API methods
export const adminAPI = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard stats',
      };
    }
  },

  // Get all reports
  async getAllReports(status = 'all', page = 1) {
    try {
      const response = await api.get(`/admin/reports?status=${status}&page=${page}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch reports',
      };
    }
  },

  // Get users with reports
  async getUsersWithReports(page = 1) {
    try {
      const response = await api.get(`/admin/users?page=${page}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users',
      };
    }
  },

  // Update report
  async updateReport(reportId, status, actionTaken, adminNotes) {
    try {
      const response = await api.put(`/admin/reports/${reportId}`, {
        status,
        actionTaken,
        adminNotes,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update report',
      };
    }
  },

  // Moderate user
  async moderateUser(userId, action, duration, reason) {
    try {
      const response = await api.put(`/admin/users/${userId}/moderate`, {
        action,
        duration,
        reason,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to moderate user',
      };
    }
  },

  // Delete listing
  async deleteListing(listingId, reason) {
    try {
      const response = await api.delete(`/admin/listings/${listingId}`, {
        data: { reason },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete listing',
      };
    }
  },
};

// Rating API methods
export const ratingAPI = {
  // Create a new rating
  async createRating(ratingData) {
    try {
      const response = await api.post('/ratings/create', ratingData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create rating',
      };
    }
  },

  // Get ratings for a user
  async getUserRatings(userId, params = {}) {
    try {
      const response = await api.get(`/ratings/user/${userId}`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch ratings',
      };
    }
  },

  // Get rating statistics for a user
  async getUserRatingStats(userId) {
    try {
      const response = await api.get(`/ratings/stats/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch rating stats',
      };
    }
  },

  // Update existing rating
  async updateRating(ratingId, ratingData) {
    try {
      const response = await api.put(`/ratings/${ratingId}`, ratingData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update rating',
      };
    }
  },

  // Delete rating (admin only)
  async deleteRating(ratingId) {
    try {
      const response = await api.delete(`/ratings/${ratingId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete rating',
      };
    }
  },

  // Check if user can rate (has transaction with rated user)
  async canUserRate(listingId, ratedUserId) {
    try {
      const response = await api.get(`/ratings/can-rate/${listingId}/${ratedUserId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check rating eligibility',
      };
    }
  },

  // Get rating for a specific transaction
  async getTransactionRating(transactionId) {
    try {
      const response = await api.get(`/ratings/transaction/${transactionId}`);
      return {
        success: true,
        data: response.data.rating, // Extract the rating from the response
        hasRated: response.data.hasRated
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch transaction rating',
      };
    }
  },
};

// Messaging API methods
export const messagingAPI = {
  // Send a message (now with Socket.IO integration)
  async sendMessage(receiverId, content, listingId = null) {
    try {
      // Try to send via socket first for real-time delivery
      const socketService = require('./socketService').default;
      
      if (socketService.isSocketConnected()) {
        // Send via socket for real-time delivery
        const socketSent = socketService.sendMessage(receiverId, content, listingId);
        
        if (socketSent) {
          // Socket sent successfully, return immediately
          // The actual message saving is handled by the socket server
          return {
            success: true,
            data: {
              receiver: receiverId,
              content,
              listing: listingId,
              createdAt: new Date().toISOString(),
              _id: 'pending', // Temporary ID until server confirms
            },
            method: 'socket'
          };
        }
      }
      
      // Fallback to REST API if socket fails or not connected
      console.log('Falling back to REST API for message sending');
      const response = await api.post('/messages/send', {
        receiverId,
        content,
        listingId
      });
      return {
        success: true,
        data: response.data,
        method: 'api'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send message',
      };
    }
  },

  // Get conversation with a user (optionally for a specific listing)
  async getConversation(userId, listingId = null, page = 1, limit = 50) {
    try {
      const url = listingId 
        ? `/messages/conversation/${userId}/${listingId}`
        : `/messages/conversation/${userId}`;
      
      const response = await api.get(url, {
        params: { page, limit }
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch messages',
      };
    }
  },

  // Get all conversations
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch conversations',
      };
    }
  },

  // Mark messages as read (optionally for a specific listing)
  async markAsRead(conversationUserId, listingId = null) {
    try {
      const url = listingId 
        ? `/messages/read/${conversationUserId}/${listingId}`
        : `/messages/read/${conversationUserId}`;
      
      const response = await api.put(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to mark as read',
      };
    }
  },
};

// AI Pricing Intelligence API
export const pricingAPI = {
  // Get AI price suggestion for new listing
  async getPriceSuggestion(itemData) {
    try {
      const response = await api.post('/pricing/suggestion', itemData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get price suggestion',
      };
    }
  },

  // Get market statistics for category
  async getMarketStats(category) {
    try {
      const response = await api.get(`/pricing/market-stats/${category}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get market stats',
      };
    }
  },

  // Get deal score for specific listing
  async getDealScore(listingId) {
    try {
      const response = await api.get(`/pricing/deal-score/${listingId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get deal score',
      };
    }
  },

  // Get market overview
  async getMarketOverview() {
    try {
      const response = await api.get('/pricing/overview');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get market overview',
      };
    }
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories with listing counts and AI config
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get categories',
      };
    }
  },

  // Get specific category by name
  async getCategory(name) {
    try {
      const response = await api.get(`/categories/${encodeURIComponent(name)}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get category',
      };
    }
  },
};

export default api;