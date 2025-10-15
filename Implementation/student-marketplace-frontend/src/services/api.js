import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for your backend API
// Using local IP address instead of localhost for device/simulator access
const BASE_URL = 'http://10.0.0.26:5000/api';

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
      console.log('🔐 Attempting login to:', `${BASE_URL}/auth/login`);
      console.log('📧 Email:', email);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      console.log('✅ Login successful:', response.data);
      
      // Store token if login successful
      if (response.data.token) {
        await tokenManager.setToken(response.data.token);
        console.log('🔑 Token stored successfully');
      }
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log('❌ Login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  },

  // Register user
  async register(name, email, password, campus) {
    try {
      console.log('👤 Attempting registration to:', `${BASE_URL}/auth/register`);
      console.log('📧 Email:', email, '🏫 Campus:', campus);
      
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        campus,
      });
      
      console.log('✅ Registration successful:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log('❌ Registration error:', error.response?.data || error.message);
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

export default api;