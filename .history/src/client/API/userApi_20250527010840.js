// src/API/userApi.js

// API configuration
const API_BASE_URL = 'http://localhost:4000';

// Logging utility
const apiLog = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[USER API ${timestamp}] ${action}`, data);
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
    // Token might be expired
    apiLog('Unauthorized - token may be expired');
    throw new Error('Authentication required. Please login again.');
  }
  
  throw new Error(message);
}

// User Profile APIs
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
    apiLog('User profile fetched successfully', { username });
    return data;
  } catch (error) {
    apiLog('Error fetching user profile', { error: error.message });
    throw error;
  }
}

export async function getCurrentUser() {
  apiLog('Fetching current user data');
  
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Current user data fetched successfully');
    return data;
  } catch (error) {
    apiLog('Error fetching current user', { error: error.message });
    throw error;
  }
}

export async function getProfileSettings() {
  apiLog('Fetching profile settings');
  
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Profile settings fetched successfully');
    return data;
  } catch (error) {
    apiLog('Error fetching profile settings', { error: error.message });
    throw error;
  }
}

export async function updateProfileSettings(settings) {
  apiLog('Updating profile settings', settings);
  
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
    apiLog('Profile settings updated successfully');
    return data;
  } catch (error) {
    apiLog('Error updating profile settings', { error: error.message });
    throw error;
  }
}

// User Activity APIs
export async function getUserStoreData() {
  apiLog('Fetching user store data');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/store`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('User store data fetched successfully', data);
    return data;
  } catch (error) {
    apiLog('Error fetching user store data', { error: error.message });
    throw error;
  }
}

export async function getUserCheckedInStores() {
  apiLog('Fetching user checked-in stores');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/checkedIn`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Checked-in stores fetched successfully', data);
    return data;
  } catch (error) {
    apiLog('Error fetching checked-in stores', { error: error.message });
    throw error;
  }
}

export async function getUserData() {
  apiLog('Fetching comprehensive user data');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('User data fetched successfully', data);
    return data;
  } catch (error) {
    apiLog('Error fetching user data', { error: error.message });
    throw error;
  }
}

// Extended Profile API
export async function getUserExtendedProfile() {
  apiLog('Fetching extended user profile');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('Extended profile fetched successfully', data);
    return data.userData;
  } catch (error) {
    apiLog('Error fetching extended profile', { error: error.message });
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  apiLog('Updating user profile', profileData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    apiLog('User profile updated successfully');
    return data;
  } catch (error) {
    apiLog('Error updating user profile', { error: error.message });
    throw error;
  }
}

// Username validation
export async function checkUsernameAvailability(username) {
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
    apiLog('Username availability checked', data);
    return data;
  } catch (error) {
    apiLog('Error checking username', { error: error.message });
    throw error;
  }
}

// Store check-in operations
export async function checkInToStore(storeId) {
  apiLog('Checking in to store', { storeId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/store`, {
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

export async function checkOutFromStore(storeId) {
  apiLog('Checking out from store', { storeId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/store`, {
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

// Impressions/reactions
export async function addStoreImpression(storeId, sectionId, action) {
  apiLog('Adding store impression', { storeId, sectionId, action });
  
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

// Utility functions
export function isAuthenticated() {
  const { accessToken } = getTokens();
  return !!accessToken;
}

export function getCurrentUsername() {
  return localStorage.getItem('username');
}

export function getCurrentUserEmail() {
  return localStorage.getItem('userEmail');
}

// Export grouped API functions
export default {
  // Profile
  getUserProfile,
  getCurrentUser,
  getProfileSettings,
  updateProfileSettings,
  getUserExtendedProfile,
  updateUserProfile,
  
  // Activity
  getUserStoreData,
  getUserCheckedInStores,
  getUserData,
  
  // Validation
  checkUsernameAvailability,
  
  // Store operations
  checkInToStore,
  checkOutFromStore,
  getCheckinStatus,
  addStoreImpression,
  
  // Utils
  isAuthenticated,
  getCurrentUsername,
  getCurrentUserEmail
};