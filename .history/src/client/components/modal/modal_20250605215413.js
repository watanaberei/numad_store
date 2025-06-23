///////////////////////// START COMPLETE FIXED MODAL /////////////////////////
// src/client/components/modal.js - COMPLETE FIXED VERSION with correct port 4000

import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import * as glyph from "../icon/glyph.js";

// API configuration
const API_BASE_URL = 'http://localhost:4000';

// Global state for authentication
const authState = {
  currentModal: null,
  isChecking: false,
  usernameAvailable: null,
  lastCheckedUsername: '',
  checkTimeout: null,
  requestCache: new Map(), // PREVENT DUPLICATE REQUESTS
  lastRequestTime: 0,
  minRequestInterval: 1000, // Minimum 1 second between requests
  retryCount: 0,
  maxRetries: 3
};

let logCount = 0;
const MAX_LOGS = 50;
// Logging utility with timestamps
const authLog = (action, data = {}) => {
  if (logCount < MAX_LOGS) {
    const timestamp = new Date().toISOString();
    console.log(`[AUTH ${timestamp}] ${action}`, data);
    logCount++;
  }
};

///////////////////////// START MODAL SYSTEM OBJECT /////////////////////////
const modalSystem = {
  openAuth: (formType = 'check') => {
    // PREVENT MULTIPLE SIMULTANEOUS MODAL OPENS
    if (authState.currentModal === formType) {
      console.log('[modal.js] Modal already open, preventing duplicate');
      return;
    }
    
    authLog('Opening auth modal', { formType });
    
    const modal = document.getElementById('auth-modal');
    if (!modal) {
      createAuthModal();
    }
    
    const modalElement = document.getElementById('auth-modal');
    if (modalElement) {
      modalElement.style.display = 'block';
      authState.currentModal = formType;
      
      // Render appropriate form
      switch (formType) {
        case 'login':
          renderLoginForm();
          break;
        case 'signup':
          renderSignupForm();
          break;
        case 'check':
        default:
          renderEmailCheckForm();
          break;
      }
    }
  },
  
  close: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      authState.currentModal = null; // RESET STATE
      authState.retryCount = 0; // RESET RETRY COUNT
      authLog('Modal closed', { modalId });
    }
  },
  
  closeAll: () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    authState.currentModal = null; // RESET STATE
    authState.retryCount = 0; // RESET RETRY COUNT
    authLog('All modals closed');
  }
};
///////////////////////// END MODAL SYSTEM OBJECT /////////////////////////

export const modals = {
  init: () => {
    console.log('[modal.js line 85] Initializing modal system');
    authLog('Initializing modal system');
    
    // Get modal elements with error checking
    const modalBtns = document.querySelectorAll('.modal-btn');
    const modalClose = document.querySelectorAll('.modal-close');
    const modalElements = document.querySelectorAll('.modal');

    console.log('[modal.js line 93] Found modal buttons:', modalBtns.length);
    console.log('[modal.js line 94] Found close buttons:', modalClose.length);
    console.log('[modal.js line 95] Found modals:', modalElements.length);

    // FIXED: Prevent duplicate event listeners
    modalBtns.forEach(btn => {
      if (!btn.dataset.listenerAdded) {
        btn.addEventListener('click', function() {
          const target = this.getAttribute('data-target');
          if (target === 'auth-modal') {
            modalSystem.openAuth('check');
          } else {
            const modal = document.getElementById(target);
            if (modal) modal.style.display = 'block';
          }
        });
        btn.dataset.listenerAdded = 'true';
      }
    });

    // FIXED: Prevent duplicate event listeners  
    modalClose.forEach(close => {
      if (!close.dataset.listenerAdded) {
        close.addEventListener('click', function() {
          const modal = this.closest('.modal');
          if (modal) {
            modal.style.display = 'none';
            authState.currentModal = null;
            authState.retryCount = 0;
          }
        });
        close.dataset.listenerAdded = 'true';
      }
    });

    // FIXED: Single window click listener
    if (!window.modalClickListenerAdded) {
      window.addEventListener('click', function(e) {
        modalElements.forEach(modal => {
          if (e.target === modal) {
            modal.style.display = 'none';
            authState.currentModal = null;
            authState.retryCount = 0;
          }
        });
      });
      window.modalClickListenerAdded = true;
    }

    // Initialize auth forms
    initAuthForms();
    
    // FIXED: Check auth state without causing loops
    checkAuthenticationStateOnce();

    return modalSystem;
  }
};

// FIXED: Prevent multiple auth state checks
let authStateChecked = false;
function checkAuthenticationStateOnce() {
  if (authStateChecked) {
    console.log('[modal.js] Auth state already checked, skipping');
    return;
  }
  authStateChecked = true;
  
  authLog('Checking authentication state on load');
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userEmail = localStorage.getItem('userEmail');
  const username = localStorage.getItem('username');
  
  if (accessToken && refreshToken) {
    authLog('User appears to be authenticated', { userEmail, username });
    
    // FIXED: Verify token without infinite retry loops
    verifyTokenOnce(accessToken).then(isValid => {
      if (isValid) {
        authLog('Token is valid, user authenticated');
        updateUIForAuthenticatedUser({ email: userEmail, username });
      } else {
        authLog('Token is invalid, attempting single refresh');
        refreshAccessToken().then(newToken => {
          if (newToken) {
            authLog('Token refreshed successfully');
            updateUIForAuthenticatedUser({ email: userEmail, username });
          } else {
            authLog('Token refresh failed, clearing auth state');
            clearAuthState();
          }
        });
      }
    });
  } else {
    authLog('No authentication tokens found');
    updateUIForUnauthenticatedUser();
  }
}

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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds
    
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds
    
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

// Clear authentication state
function clearAuthState() {
  authLog('Clearing authentication state');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('username');
  updateUIForUnauthenticatedUser();
}

// FIXED: Update UI without causing re-renders
let uiUpdateInProgress = false;
function updateUIForAuthenticatedUser(user) {
  if (uiUpdateInProgress) return;
  uiUpdateInProgress = true;
  
  authLog('Updating UI for authenticated user', { user });
  
  try {
    const authButtons = document.querySelectorAll('.auth-btn');
    authButtons.forEach(btn => {
      btn.textContent = user.username || user.email;
      btn.setAttribute('data-authenticated', 'true');
      
      // FIXED: Remove existing listeners before adding new ones
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.onclick = function(e) {
        e.preventDefault();
        window.location.href = `/user/${user.username}`;
      };
    });
    
    const loginLinks = document.querySelectorAll('a[href="/login"], a[href="/signup"]');
    loginLinks.forEach(link => {
      link.textContent = user.username || user.email;
      link.href = `/user/${user.username}`;
    });
    
    const authContent = document.querySelectorAll('.auth-required');
    authContent.forEach(el => el.style.display = 'block');
    
    const unauthContent = document.querySelectorAll('.unauth-required');
    unauthContent.forEach(el => el.style.display = 'none');
    
    // FIXED: Dispatch event only once
    if (!window.userAuthenticatedEventDispatched) {
      window.dispatchEvent(new CustomEvent('user-authenticated', { 
        detail: { user } 
      }));
      window.userAuthenticatedEventDispatched = true;
    }
  } finally {
    uiUpdateInProgress = false;
  }
}

function updateUIForUnauthenticatedUser() {
  if (uiUpdateInProgress) return;
  uiUpdateInProgress = true;
  
  authLog('Updating UI for unauthenticated user');
  
  try {
    const authButtons = document.querySelectorAll('.auth-btn');
    authButtons.forEach(btn => {
      btn.textContent = 'Login';
      btn.removeAttribute('data-authenticated');
      
      // FIXED: Remove existing listeners before adding new ones
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.onclick = function(e) {
        e.preventDefault();
        modalSystem.openAuth('check');
      };
    });
    
    const authContent = document.querySelectorAll('.auth-required');
    authContent.forEach(el => el.style.display = 'none');
    
    const unauthContent = document.querySelectorAll('.unauth-required');
    unauthContent.forEach(el => el.style.display = 'block');
    
    // FIXED: Dispatch event only once
    if (!window.userUnauthenticatedEventDispatched) {
      window.dispatchEvent(new CustomEvent('user-unauthenticated'));
      window.userUnauthenticatedEventDispatched = true;
    }
  } finally {
    uiUpdateInProgress = false;
  }
}

// FIXED: Initialize auth forms without duplicate listeners
let authFormsInitialized = false;
function initAuthForms() {
  if (authFormsInitialized) {
    console.log('[modal.js] Auth forms already initialized');
    return;
  }
  authFormsInitialized = true;
  
  authLog('Initializing auth forms');
  
  if (!document.getElementById('auth-modal')) {
    createAuthModal();
  }
  
  // FIXED: Use single event delegation to prevent duplicates
  document.addEventListener('submit', handleFormSubmit);
  document.addEventListener('input', handleFormInput);
  document.addEventListener('click', handleAuthClick);
}

// Handle auth-related clicks
function handleAuthClick(e) {
  if (e.target.matches('.switch-to-login')) {
    e.preventDefault();
    renderLoginForm();
  } else if (e.target.matches('.switch-to-signup')) {
    e.preventDefault();
    renderSignupForm();
  } else if (e.target.matches('.back-to-email')) {
    e.preventDefault();
    renderEmailCheckForm();
  }
}

// FIXED: Handle form input with debouncing
function handleFormInput(e) {
  if (e.target.id === 'signup-username') {
    handleUsernameInput(e.target);
  } else if (e.target.id === 'signup-confirm-password') {
    validatePasswordMatch();
  }
}

// FIXED: Handle form submissions with proper error handling and retry logic
async function handleFormSubmit(e) {
  // Handle all auth-related forms
  if (!e.target.matches('#email-check-form, #login-form, #signup-form')) return;
  
  e.preventDefault();
  console.log('[modal.js line 323] Form submitted:', e.target.id);
  authLog('Form submitted', { formId: e.target.id, retryCount: authState.retryCount });
  
  const formData = new FormData(e.target);
  const submitButton = e.target.querySelector('button[type="submit"]');
  
  // Disable submit button and show loading state
  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Processing...';
  
  try {
    if (e.target.id === 'email-check-form') {
      await handleEmailCheck(formData);
    } else if (e.target.id === 'login-form') {
      await handleLogin(formData);
    } else if (e.target.id === 'signup-form') {
      await handleSignup(formData);
    }
    
    // Reset retry count on success
    authState.retryCount = 0;
    
  } catch (error) {
    console.error('[modal.js line 343] Form submission error:', error);
    authLog('Form submission error', { error: error.message, retryCount: authState.retryCount });
    
    // FIXED: Better error handling with user-friendly messages
    let errorMessage = error.message;
    
    if (error.message.includes('timeout') || error.message.includes('504')) {
      errorMessage = 'Request timed out. Please check your connection and try again.';
      authState.retryCount++;
    } else if (error.message.includes('Server error') || error.message.includes('500')) {
      errorMessage = 'Server is temporarily unavailable. Please try again.';
      authState.retryCount++;
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Cannot connect')) {
      errorMessage = 'Cannot connect to authentication server. Please check your connection and try again.';
      authState.retryCount++;
    }
    
    // Show retry option if under max retries
    if (authState.retryCount < authState.maxRetries && (error.message.includes('timeout') || error.message.includes('Server error') || error.message.includes('Network') || error.message.includes('Cannot connect'))) {
      errorMessage += ` (Attempt ${authState.retryCount}/${authState.maxRetries})`;
    } else if (authState.retryCount >= authState.maxRetries) {
      errorMessage = 'Multiple attempts failed. Please try again later or contact support.';
      authState.retryCount = 0; // Reset for next attempt
    }
    
    showError(errorMessage);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

// FIXED: Create auth modal without duplicates
function createAuthModal() {
  // Remove existing modal
  const existingModal = document.getElementById('auth-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content auth-modal-content">
      <span class="modal-close auth-modal-close">&times;</span>
      <div id="auth-form-content">
        <!-- Dynamic content will be inserted here -->
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add close event listener
  modal.querySelector('.auth-modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
    authState.currentModal = null;
    authState.retryCount = 0;
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      authState.currentModal = null;
      authState.retryCount = 0;
    }
  });
}

// Render forms
function renderEmailCheckForm() {
  const content = document.getElementById('auth-form-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="auth-form-container">
      <h2 class="auth-title">Welcome</h2>
      <p class="auth-subtitle">Enter your email or username to continue</p>
      
      <form id="email-check-form" class="auth-form">
        <div class="form-group">
          <label for="auth-identifier">Email or Username</label>
          <input 
            type="text" 
            id="auth-identifier" 
            name="identifier" 
            placeholder="Enter your email or username" 
            required 
            autocomplete="username"
          />
        </div>
        
        <div id="auth-error" class="error-message" style="display: none;"></div>
        
        <button type="submit" class="auth-submit-btn">Continue</button>
      </form>
    </div>
  `;
  
  // Focus on input
  setTimeout(() => {
    const identifierInput = document.getElementById('auth-identifier');
    if (identifierInput) identifierInput.focus();
  }, 100);
}

// FIXED: Handle email check with better error handling and cache clearing
async function handleEmailCheck(formData) {
  const identifier = formData.get('identifier');
  
  console.log('[modal.js line 462] Checking email/username:', identifier);
  authLog('Checking email/username', { identifier, retryCount: authState.retryCount });
  
  if (!identifier || identifier.trim() === '') {
    throw new Error('Please enter an email or username');
  }
  
  const trimmedIdentifier = identifier.trim();
  
  // FIXED: Clear cache to force fresh check - especially important for usernames
  const cacheKey = `auth-check-${trimmedIdentifier}`;
  
  // Check if we should use cache (only if very recent - within 10 seconds)
  const cached = authState.requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 10000) { // Only 10 seconds cache
    authLog('Using cached auth check result', { userExists: cached.userExists });
    
    sessionStorage.setItem('authIdentifier', trimmedIdentifier);
    
    if (cached.userExists) {
      renderLoginFormWithIdentifier(trimmedIdentifier);
    } else {
      renderSignupFormWithIdentifier(trimmedIdentifier);
    }
    return;
  }
  
  // FIXED: Clear any stale cache entries for this identifier
  authState.requestCache.delete(cacheKey);
  authState.requestCache.delete(`auth-check-${trimmedIdentifier.toLowerCase()}`);
  
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
    
    console.log('[modal.js] Making auth check request to server for:', trimmedIdentifier);
    
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
        throw new Error('Auth service not available. Please check if the server is running.');
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
    
    // FIXED: Cache the result with timestamp
    authState.requestCache.set(cacheKey, {
      userExists: data.userExists,
      timestamp: Date.now()
    });
    
    sessionStorage.setItem('authIdentifier', trimmedIdentifier);
    
    if (data.userExists) {
      console.log('[modal.js] User exists, rendering login form');
      renderLoginFormWithIdentifier(trimmedIdentifier);
    } else {
      console.log('[modal.js] User does not exist, rendering signup form');
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

// Render login form with identifier
function renderLoginFormWithIdentifier(identifier) {
  console.log('[modal.js line 506] Rendering login form with identifier:', identifier);
  authLog('Rendering login form with identifier', { identifier });
  
  const content = document.getElementById('auth-form-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="auth-form-container">
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Enter your password to continue</p>
      
      <form id="login-form" class="auth-form">
        <div class="form-group">
          <label for="login-identifier">Email or Username</label>
          <input 
            type="text" 
            id="login-identifier" 
            name="identifier" 
            value="${identifier}" 
            readonly 
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label for="login-password">Password</label>
          <input 
            type="password" 
            id="login-password" 
            name="password" 
            placeholder="Enter your password" 
            required 
            autocomplete="current-password"
          />
        </div>
        
        <div id="auth-error" class="error-message" style="display: none;"></div>
        
        <button type="submit" class="auth-submit-btn">Login</button>
      </form>
      
      <div class="auth-switch">
        <p><a href="#" class="back-to-email">← Back</a></p>
        <p>Don't have an account? <a href="#" class="switch-to-signup">Sign up</a></p>
      </div>
    </div>
  `;
  
  // Focus on password input
  setTimeout(() => {
    document.getElementById('login-password')?.focus();
  }, 100);
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
        throw new Error('Login service not available. Please check if the server is running.');
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

// Render signup form with identifier (placeholder)
function renderSignupFormWithIdentifier(identifier) {
  console.log('[modal.js] Rendering signup form with identifier:', identifier);
  // Placeholder - implement full signup form as needed
  const content = document.getElementById('auth-form-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="auth-form-container">
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-subtitle">Complete your registration</p>
      
      <form id="signup-form" class="auth-form">
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input 
            type="email" 
            id="signup-email" 
            name="email" 
            value="${identifier.includes('@') ? identifier : ''}" 
            placeholder="Enter your email" 
            required 
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="signup-username">Username</label>
          <input 
            type="text" 
            id="signup-username" 
            name="username" 
            value="${!identifier.includes('@') ? identifier : ''}" 
            placeholder="Choose a username" 
            required 
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label for="signup-password">Password</label>
          <input 
            type="password" 
            id="signup-password" 
            name="password" 
            placeholder="Create a password" 
            required 
            autocomplete="new-password"
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="signup-confirm-password">Confirm Password</label>
          <input 
            type="password" 
            id="signup-confirm-password" 
            name="confirmPassword" 
            placeholder="Confirm your password" 
            required 
            autocomplete="new-password"
          />
        </div>
        
        <div id="auth-error" class="error-message" style="display: none;"></div>
        
        <button type="submit" class="auth-submit-btn">Sign Up</button>
      </form>
      
      <div class="auth-switch">
        <p><a href="#" class="back-to-email">← Back</a></p>
        <p>Already have an account? <a href="#" class="switch-to-login">Login</a></p>
      </div>
    </div>
  `;
}

// Handle signup (placeholder)
async function handleSignup(formData) {
  const email = formData.get('email');
  const username = formData.get('username');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  if (!email || !username || !password || !confirmPassword) {
    throw new Error('All fields are required');
  }
  
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  // Implement actual signup logic
  console.log('Signup attempt:', { email, username });
  throw new Error('Signup functionality not yet implemented');
}

// Helper functions
function renderLoginForm() {
  renderEmailCheckForm(); // Fallback to email check
}

function renderSignupForm() {
  renderEmailCheckForm(); // Fallback to email check
}

function handleUsernameInput(input) {
  // Placeholder for username validation
}

function validatePasswordMatch() {
  // Placeholder for password validation
}

// Show error message with better styling
function showError(message) {
  const errorDiv = document.getElementById('auth-error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#d32f2f';
    errorDiv.style.padding = '10px';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.border = '1px solid #d32f2f';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.backgroundColor = '#ffebee';
    
    // Auto-hide after 10 seconds for non-critical errors
    if (!message.includes('Multiple attempts failed')) {
      setTimeout(() => {
        if (errorDiv.style.display === 'block') {
          errorDiv.style.display = 'none';
        }
      }, 10000);
    }
  }
}

// Show success message
function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// Export authentication utilities
export const auth = {
  checkState: checkAuthenticationStateOnce,
  logout: () => {
    authLog('User logging out');
    clearAuthState();
    window.location.href = '/';
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  getCurrentUser: () => {
    return {
      email: localStorage.getItem('userEmail'),
      username: localStorage.getItem('username')
    };
  },
  openAuthModal: (type = 'login') => {
    const modalSystemInstance = modals.init();
    modalSystemInstance.openAuth(type);
  },
  refreshAuth: async () => {
    return await refreshAccessToken();
  }
};

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

///////////////////////// END COMPLETE FIXED MODAL /////////////////////////