// Utility functions for common operations

// Image loading utilities
export const imageUtils = {
  onError: () => {
    // Handle image loading errors silently in production
    if (__DEV__) {
      console.warn('Image failed to load');
    }
  },
  
  getPlaceholderImage: () => 'https://via.placeholder.com/300x200?text=No+Image',
};

// Common validation utilities
export const validation = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidPrice: (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  },
};

// Common formatting utilities
export const formatUtils = {
  formatPrice: (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  },
  
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },
  
  truncateText: (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
};