// src/utils/utils.js

///////////////////////// START UPDATED URL PARSING /////////////////////////
export const parseRequestUrl = (url = window.location.pathname) => {
  const pathParts = url.split('/').filter(Boolean);
  const request = {
    resource: null,
    slug: null,
    verb: null,
    action: null,
    username: null
  };
  
  // If no parts, it's home
  if (pathParts.length === 0) {
    return request;
  }
  
  // Check for @username routes
  if (pathParts[0] && pathParts[0].startsWith('@')) {
    request.username = pathParts[0].substring(1); // Remove @ symbol
    request.resource = request.username;
    
    if (pathParts.length >= 2) {
      if (pathParts[1] === 'setting') {
        request.action = 'setting';
      } else {
        request.slug = pathParts[1]; // Blog slug
        
        if (pathParts.length >= 3 && pathParts[2] === 'edit') {
          request.action = 'edit';
        }
      }
    }
  }
  // Static routes
  else if (['blogs', 'stores', 'post', 'signup', 'login', 'Auth', 'user', 'settings', 'profile'].includes(pathParts[0])) {
    request.resource = pathParts[0];
    
    if (pathParts.length >= 2) {
      request.slug = pathParts[1];
    }
    
    if (pathParts.length >= 3) {
      request.verb = pathParts[2];
    }
  }
  // Handle legacy username/post/slug pattern
  else if (pathParts.length === 3 && pathParts[1] === 'post') {
    request.resource = 'blog';
    request.username = pathParts[0];
    request.slug = pathParts[2];
    request.verb = '';
  }
  // Default to store route
  else {
    request.slug = pathParts[0];
  }
  
  console.log('[parseRequestUrl] Parsed:', { url, request });
  return request;
};
///////////////////////// END UPDATED URL PARSING /////////////////////////

export const rerender = async (component) => {
  document.getElementById("content").innerHTML = await component.render();
  await component.after_render();
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const showLoading = () => {
  const loader = document.getElementById('loader');
  const loading = document.getElementById('loading');
  
  if (loader) {
    loader.style.display = 'block';
  }
  if (loading) {
    loading.classList.add('active');
  }
};

export const hideLoading = () => {
  const loader = document.getElementById('loader');
  const loading = document.getElementById('loading');
  
  if (loader) {
    loader.style.display = 'none';
  }
  if (loading) {
    loading.classList.remove('active');
  }
};

export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const updateQueryParams = (updates) => {
  const params = new URLSearchParams(window.location.search);
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const k = item[key];
    return seen.has(k) ? false : seen.add(k);
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Geolocation and distance functions
export const sortByDistance = (selectedLocation, data) => {
  if (!selectedLocation) {
    return data;
  }

  return data.slice().sort((a, b) => {
    if (!a.geometry || !a.geometry.coordinates || !b.geometry || !b.geometry.coordinates) {
      return 0;
    }

    const distanceA = calculateDistance(
      selectedLocation,
      a.geometry.coordinates
    );
    const distanceB = calculateDistance(
      selectedLocation,
      b.geometry.coordinates
    );

    return distanceA - distanceB;
  });
};

export const calculateDistance = (coord1, coord2) => {
  // Using the Haversine formula for more accurate distance calculation
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const R = 6371e3; // Earth's radius in meters
  
  const lat1 = toRadians(coord1[1]);
  const lat2 = toRadians(coord2[1]);
  const deltaLat = toRadians(coord2[1] - coord1[1]);
  const deltaLng = toRadians(coord2[0] - coord1[0]);
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
};

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// API helper functions
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add authorization token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Form validation helpers
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !value) {
      errors[field] = `${field} is required`;
    }
    
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
    }
    
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = `${field} must be less than ${fieldRules.maxLength} characters`;
    }
    
    if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || `${field} is invalid`;
    }
    
    if (fieldRules.custom && !fieldRules.custom(value, formData)) {
      errors[field] = fieldRules.message || `${field} is invalid`;
    }
  });
  
  return errors;
};

// Image upload helpers
export const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type, quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Export all functions as default object as well
export default {
  parseRequestUrl,
  rerender,
  formatDate,
  showLoading,
  hideLoading,
  getQueryParams,
  updateQueryParams,
  debounce,
  throttle,
  formatCurrency,
  truncateText,
  generateSlug,
  isValidEmail,
  getRelativeTime,
  deepClone,
  groupBy,
  sortBy,
  uniqueBy,
  chunk,
  sortByDistance,
  calculateDistance,
  formatDistance,
  storage,
  apiRequest,
  validateForm,
  compressImage
};