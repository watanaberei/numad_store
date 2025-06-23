///////////////////////// START MODAL WITH CORRECT PORT /////////////////////////
// src/client/components/modal.js - FIXED VERSION with correct port 4000

// ... (keeping all the same code but updating the fetch URLs)

// FIXED: Use the correct port 4000 for all API calls
const API_BASE_URL = 'http://localhost:4000';

// FIXED: Prevent infinite token verification
let tokenVerificationInProgress = false;
async function verifyTokenOnce(token) {
  if (tokenVerificationInProgress) {
    console.log('[modal.js] Token verification already in progress');
    return false;
  }
  
  tokenVerificationInProgress = true;
  
  try {
    // FIXED: Add request timeout and abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
    
    const response = await fetch(`${API_BASE_URL}/verify-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      try {
        const userData = await response.json();
        if (userData.user) {
          localStorage.setItem('userEmail', userData.user.email);
          localStorage.setItem('username', userData.user.username);
        }
      } catch (e) {
        // Response not JSON, but verification succeeded
      }
      return true;
    }
    return false;
  } catch (error) {
    if (error.name === 'AbortError') {
      authLog('Token verification timeout');
    } else {
      authLog('Token verification error', { error: error.message });
    }
    return false;
  } finally {
    tokenVerificationInProgress = false;
  }
}

// FIXED: Prevent infinite refresh loops
let refreshInProgress = false;
async function refreshAccessToken() {
  if (refreshInProgress) {
    console.log('[modal.js] Refresh already in progress');
    return null;
  }
  
  refreshInProgress = true;
  
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  
  try {
    authLog('Attempting to refresh access token');
    
    // FIXED: Add request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds
    
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      
      if (data.user) {
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('username', data.user.username);
      }
      
      authLog('Access token refreshed successfully');
      return data.accessToken;
    } else {
      clearAuthState();
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      authLog('Token refresh timeout');
    } else {
      authLog('Token refresh error', { error: error.message });
    }
    clearAuthState();
  } finally {
    refreshInProgress = false;
  }
  return null;
}

// FIXED: Handle email check with better error handling and retry logic
async function handleEmailCheck(formData) {
  const identifier = formData.get('identifier');
  
  console.log('[modal.js line 462] Checking email/username:', identifier);
  authLog('Checking email/username', { identifier, retryCount: authState.retryCount });
  
  if (!identifier || identifier.trim() === '') {
    throw new Error('Please enter an email or username');
  }
  
  const trimmedIdentifier = identifier.trim();
  
  // FIXED: Check cache first
  const cacheKey = `auth-check-${trimmedIdentifier}`;
  if (authState.requestCache.has(cacheKey)) {
    const cachedResult = authState.requestCache.get(cacheKey);
    authLog('Using cached auth check result', { userExists: cachedResult });
    
    sessionStorage.setItem('authIdentifier', trimmedIdentifier);
    
    if (cachedResult) {
      renderLoginFormWithIdentifier(trimmedIdentifier);
    } else {
      renderSignupFormWithIdentifier(trimmedIdentifier);
    }
    return;
  }
  
  // FIXED: Throttle requests
  const now = Date.now();
  if (now - authState.lastRequestTime < authState.minRequestInterval) {
    throw new Error('Please wait before trying again');
  }
  authState.lastRequestTime = now;
  
  try {
    // FIXED: Add timeout and abort controller with increased timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
    
    console.log('[modal.js] Making auth check request to server');
    
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier: trimmedIdentifier }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('[modal.js] Auth check response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 504) {
        throw new Error('Database timeout. Please try again.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again.');
      } else if (response.status === 404) {
        throw new Error('Auth service not available. Please try again.');
      } else {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Auth check failed');
        } catch (jsonError) {
          // If response is not JSON, throw a generic error
          throw new Error('Service temporarily unavailable. Please try again.');
        }
      }
    }
    
    const data = await response.json();
    console.log('[modal.js] Auth check response data:', data);
    
    // FIXED: Cache the result
    authState.requestCache.set(cacheKey, data.userExists);
    
    sessionStorage.setItem('authIdentifier', trimmedIdentifier);
    
    if (data.userExists) {
      renderLoginFormWithIdentifier(trimmedIdentifier);
    } else {
      renderSignupFormWithIdentifier(trimmedIdentifier);
    }
    
  } catch (error) {
    console.error('[modal.js] Auth check error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to authentication server. Please check if the server is running.');
    } else {
      throw error;
    }
  }
}

// IMPROVED: Handle login with better error handling and timeout
async function handleLogin(formData) {
  const identifier = formData.get('identifier');
  const password = formData.get('password');
  
  console.log('[modal.js line 565] Attempting login for:', identifier);
  authLog('Attempting login', { identifier, retryCount: authState.retryCount });
  
  if (!identifier || !password) {
    throw new Error('Both email/username and password are required');
  }
  
  try {
    // FIXED: Add timeout and abort controller with increased timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('[modal.js line 577] Login response received, status:', response.status);
    authLog('Login response received', { status: response.status });
    
    if (!response.ok) {
      if (response.status === 504) {
        throw new Error('Database timeout. Please try again.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again.');
      } else if (response.status === 404) {
        throw new Error('Login service not available. Please try again.');
      } else {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        } catch (jsonError) {
          throw new Error('Service temporarily unavailable. Please try again.');
        }
      }
    }
    
    const data = await response.json();
    
    console.log('[modal.js line 586] Login successful');
    authLog('Login successful', { user: data.user });
    
    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('username', data.user.username);
    
    // Update UI immediately
    updateUIForAuthenticatedUser(data.user);
    
    // Close modal
    document.getElementById('auth-modal').style.display = 'none';
    
    // Clear any session storage
    sessionStorage.removeItem('authIdentifier');
    
    // Show success message briefly
    showSuccessMessage('Welcome back!');
    
    // Redirect if needed
    if (window.location.pathname === '/login') {
      window.location.href = `/user/${data.user.username}`;
    }
    
  } catch (error) {
    console.error('[modal.js line 607] Login error:', error);
    authLog('Login error', { error: error.message, retryCount: authState.retryCount });
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to authentication server. Please check if the server is running.');
    } else {
      throw error;
    }
  }
}

///////////////////////// END MODAL WITH CORRECT PORT /////////////////////////


// Legacy modal functions (kept for backward compatibility)
export const modalGallery = (modalGalleryData) => {
  const gallery = modalGalleryData.gallery || [];
  const area = modalGalleryData.area || [];

  function modalGalleryHTML(gallery) {
    let mediaGalleryHTML = "";
    gallery.forEach((array) => {
      mediaGalleryHTML += `
        <div class="media-img-m">
            <div class="media-img">
                <img src="${array.url}" class="gallery-item-img media-img-1-x-1-x-m" alt="" />
            </div>
        </div>
      `;
    });
    return mediaGalleryHTML;
  }

  function modalAreaHTML(area) {
    let mediaAreaHTML = "";
    area.forEach((array) => {
      mediaAreaHTML += `
        <div class="media-img-m">
            <div class="media-img">
                <img src="${array.url}" class="gallery-item-img media-img-1-x-1-x-m" alt="" />
            </div>
            <div class="text2">
                <span class="caption">
                    <span class="icon">
                        <i class="icon-container2"></i>
                    </span>
                    <span class="text03 bold">
                        ${array.description}
                    </span>
                </span>
            </div>
        </div>
      `;
    });
    return mediaAreaHTML;
  }

  const mediaGallery = modalGalleryHTML(gallery);
  const mediaArea = modalAreaHTML(area);
  const glyphClose = glyph.glyphClose;

  const modalHTML = `
    <button id="myBtn">Open Modal</button>
    <div id="myModal" class="modal">
      <div class="modal-content">
        <span class="modal-close">${glyphClose}</span>
        
        <span class="header03">Gallery</p>
        <div class="gallery mediaGallery">
          ${mediaGallery}
        </div>
        
        <span class="header03">Area</p>
        <div class="gallery mediaArea">
          ${mediaArea}
        </div>
      </div>
    </div>
  `;

  document.addEventListener('click', (event) => {
    if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
      document.getElementById('myModal').style.display = 'none';
    } else if (event.target.matches('#myBtn')) {
      document.getElementById('myModal').style.display = 'block';
    }
  });

  return modalHTML;
};

// FIXED: Initialize only once
if (!window.modalSystemInitialized) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[modal.js] DOM loaded, initializing modals');
      modals.init();
    });
  } else {
    console.log('[modal.js] DOM already loaded, initializing modals');
    modals.init();
  }
  window.modalSystemInitialized = true;
}

///////////////////////// END FIXED MODAL AUTHENTICATION /////////////////////////