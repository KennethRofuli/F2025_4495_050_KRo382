// Utility functions for common operations

// Image loading utilities with performance optimizations
export const imageUtils = {
  // Image cache for faster subsequent loads
  _imageCache: new Map(),
  
  onError: () => {
    // Handle image loading errors silently in production
    if (__DEV__) {
      console.warn('Image failed to load');
    }
  },
  
  getPlaceholderImage: () => 'https://via.placeholder.com/300x200?text=No+Image',
  
  // Get optimized image URI
  getImageUri: (imageData, width = 400, height = 300) => {
    if (!imageData) return null;
    
    // If it's already a full URI, return as-is
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData;
    }
    
    // If it's base64 data
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's an object with uri property (from image picker)
    if (typeof imageData === 'object' && imageData.uri) {
      return imageData.uri;
    }
    
    // Default case - return the data as-is
    return imageData;
  },
  
  // Preload critical images for better UX
  preloadImage: (uri) => {
    if (!uri || imageUtils._imageCache.has(uri)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        imageUtils._imageCache.set(uri, true);
        resolve();
      };
      image.onerror = reject;
      image.src = uri;
    });
  },
  
  // Clear image cache when memory is low
  clearCache: () => {
    imageUtils._imageCache.clear();
  }
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