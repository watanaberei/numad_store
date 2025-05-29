// src/API/userApi.js

// API configuration
const API_BASE_URL = 'http://localhost:4000';

// Logging utility
const apiLog = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[API ${timestamp}] ${action}`, data);
};

// Get stored tokens
function getTokens() {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
}

// Set authorization header
function getAuthHeaders() {
  const { accessToken } = getTokens();
  return accessToken ? {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
}

// Handle API errors
async function handleApiError(response) {
  apiLog('API Error', { status: response.status, statusText: response.statusText });
  
  let message = 'An error occurred';
  try {
    const data = await response.json();
    message = data.message || message;
  } catch (e) {
    // Response might not be JSON
  }
  
  if (response.status === 401) {
    // Token might be expired, try to refresh
    apiLog('Token expired, attempting refresh');
    const refreshed = await refreshToken();
    if (!refreshed) {
      // Refresh failed, clear auth and redirect to login
      clearAuth();
      window.location.href = '/login';
    }
    throw new Error('Please try again');
  }
  
  throw new Error(message);
}

// Clear authentication
function clearAuth() {
  apiLog('Clearing authentication');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('username');
}

// Refresh token
async function refreshToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;
  
  try {
    apiLog('Refreshing access token');
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      apiLog('Token refreshed successfully');
      return true;
    }
  } catch (error) {
    apiLog('Token refresh failed', { error: error.message });
  }
  return false;
}

// Authentication APIs
export async function login(identifier, password) {
  apiLog('Login attempt', { identifier });
  
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, password })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Login successful', { user: data.user });
    
    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('username', data.user.username);
    
    return data;
  } catch (error) {
    apiLog('Login error', { error: error.message });
    throw error;
  }
}

export async function signup(email, username, password) {
  apiLog('Signup attempt', { email, username });
  
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, username, password })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Signup successful', { user: data.user });
    
    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('username', data.user.username);
    
    return data;
  } catch (error) {
    apiLog('Signup error', { error: error.message });
    throw error;
  }
}

export async function checkUsername(username) {
  apiLog('Checking username availability', { username });
  
  try {
    const response = await fetch(`${API_BASE_URL}/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Username check result', data);
    return data;
  } catch (error) {
    apiLog('Username check error', { error: error.message });
    throw error;
  }
}

// User APIs
export async function getUserProfile(username) {
  apiLog('Fetching user profile', { username });
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('User profile fetched', { username });
    return data;
  } catch (error) {
    apiLog('Error fetching user profile', { error: error.message });
    throw error;
  }
}

export async function getCurrentUser() {
  apiLog('Fetching current user');
  
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Current user fetched');
    return data;
  } catch (error) {
    apiLog('Error fetching current user', { error: error.message });
    throw error;
  }
}

export async function getProfile() {
  apiLog('Fetching user profile settings');
  
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Profile settings fetched');
    return data;
  } catch (error) {
    apiLog('Error fetching profile settings', { error: error.message });
    throw error;
  }
}

export async function updateSettings(settings) {
  apiLog('Updating settings', settings);
  
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Settings updated successfully');
    return data;
  } catch (error) {
    apiLog('Error updating settings', { error: error.message });
    throw error;
  }
}

// Store APIs
export async function checkInStore(storeId) {
  apiLog('Checking in to store', { storeId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/store/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ storeId, action: 'checkin' })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Checked in successfully', data);
    return data;
  } catch (error) {
    apiLog('Error checking in', { error: error.message });
    throw error;
  }
}

export async function checkOutStore(storeId) {
  apiLog('Checking out from store', { storeId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/store/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ storeId, action: 'checkout' })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Checked out successfully', data);
    return data;
  } catch (error) {
    apiLog('Error checking out', { error: error.message });
    throw error;
  }
}

export async function getCheckinStatus() {
  apiLog('Fetching check-in status');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/store/checkin/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Check-in status fetched', data);
    return data;
  } catch (error) {
    apiLog('Error fetching check-in status', { error: error.message });
    throw error;
  }
}

export async function addImpression(storeId, sectionId, action) {
  apiLog('Adding impression', { storeId, sectionId, action });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/store/impression`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ storeId, sectionId, action })
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Impression added successfully', data);
    return data;
  } catch (error) {
    apiLog('Error adding impression', { error: error.message });
    throw error;
  }
}

// Store data APIs
export async function getStore(storeId) {
  apiLog('Fetching store data', { storeId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/store/${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Store data fetched', { storeId });
    return data;
  } catch (error) {
    apiLog('Error fetching store', { error: error.message });
    throw error;
  }
}

// Utility function to check if user is authenticated
export function isAuthenticated() {
  const { accessToken } = getTokens();
  return !!accessToken;
}

// Utility function to get current username
export function getCurrentUsername() {
  return localStorage.getItem('username');
}

// Export all auth-related functions
export const auth = {
  login,
  signup,
  checkUsername,
  isAuthenticated,
  getCurrentUsername,
  clearAuth,
  refreshToken
};