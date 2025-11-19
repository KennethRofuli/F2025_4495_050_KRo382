// Performance utilities for React Native app

// Debounce function to limit API calls
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility for expensive operations
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Utility to check if an object is empty
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return !obj;
};

// Utility to safely get nested properties
export const get = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
};

// Image optimization utilities
export const imageOptimizer = {
  // Get optimized image URI with size parameters
  getOptimizedUri: (originalUri, width = 400, height = 400) => {
    if (!originalUri) return null;
    
    // If it's a base64 image, return as-is
    if (originalUri.startsWith('data:')) return originalUri;
    
    // Add size parameters for server-side optimization
    const separator = originalUri.includes('?') ? '&' : '?';
    return `${originalUri}${separator}w=${width}&h=${height}&fit=cover`;
  },
  
  // Preload critical images
  preloadImage: (uri) => {
    if (!uri) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = reject;
      image.src = uri;
    });
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Track component render times
  trackRender: (componentName) => {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      if (duration > 100) { // Log slow renders
        console.warn(`🐌 Slow render: ${componentName} took ${duration}ms`);
      }
    };
  },
  
  // Track API call performance
  trackApiCall: (endpoint) => {
    const start = Date.now();
    return (success = true) => {
      const duration = Date.now() - start;
      const status = success ? '✅' : '❌';
      console.log(`${status} API ${endpoint}: ${duration}ms`);
    };
  }
};