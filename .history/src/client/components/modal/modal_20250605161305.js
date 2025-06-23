///////////////////////// START FIXED AUTHENTICATION MODAL /////////////////////////
// src/client/components/modal.js - UPDATED VERSION

import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import * as glyph from "../icon/glyph.js";

// Global state for authentication
const authState = {
  currentModal: null,
  isChecking: false,
  usernameAvailable: null,
  lastCheckedUsername: '',
  checkTimeout: null,
  requestCache: new Map(), // PREVENT DUPLICATE REQUESTS
  lastRequestTime: 0,
  minRequestInterval: 1000 // Minimum 1 second between requests
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
      authLog('Modal closed', { modalId });
    }
  },
  
  closeAll: () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    authState.currentModal = null; // RESET STATE
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
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('http://localhost:4000/verify-token', {
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
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('http://localhost:4000/refresh-token', {
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


// FIXED: Handle form submissions with proper error handling and no loops
async function handleFormSubmit(e) {
  // Handle all auth-related forms
  if (!e.target.matches('#email-check-form, #login-form, #signup-form')) return;
  
  e.preventDefault();
  console.log('[modal.js line 323] Form submitted:', e.target.id);
  authLog('Form submitted', { formId: e.target.id });
  
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
  } catch (error) {
    console.error('[modal.js line 343] Form submission error:', error);
    authLog('Form submission error', { error: error.message });
    showError(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}
// async function handleFormSubmit(e) {
//   if (!e.target.matches('#email-check-form, #login-form, #signup-form')) return;
  
//   e.preventDefault();
//   console.log('[modal.js line 323] Form submitted:', e.target.id);
//   authLog('Form submitted', { formId: e.target.id });
  
//   // PREVENT DUPLICATE SUBMISSIONS
//   if (e.target.dataset.submitting === 'true') {
//     console.log('[modal.js] Form already submitting, ignoring');
//     return;
//   }
//   e.target.dataset.submitting = 'true';
  
//   authLog('Form submitted', { formId: e.target.id });
  
//   const formData = new FormData(e.target);
//   const submitButton = e.target.querySelector('button[type="submit"]');
  
//   // Show loading state
//   submitButton.disabled = true;
//   const originalText = submitButton.textContent;
//   submitButton.textContent = 'Processing...';
  
//   try {
//     if (e.target.id === 'email-check-form') {
//       await handleEmailCheck(formData);
//     } else if (e.target.id === 'login-form') {
//       await handleLogin(formData);
//     } else if (e.target.id === 'signup-form') {
//       await handleSignup(formData);
//     }
//   } catch (error) {
//     console.error('[modal.js] Form submission error:', error);
//     authLog('Form submission error', { error: error.message });
//     showError(error.message);
//   } finally {
//     submitButton.disabled = false;
//     submitButton.textContent = originalText;
//     e.target.dataset.submitting = 'false';
//   }
// }

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
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      authState.currentModal = null;
    }
  });
}

// Render forms (unchanged but with better error handling)
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

// FIXED: Handle email check with proper caching and throttling
async function handleEmailCheck(formData) {
  const identifier = formData.get('identifier');
  
  console.log('[modal.js line 462] Checking email/username:', identifier);
  authLog('Checking email/username', { identifier });
  
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
    // FIXED: Add timeout and abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('http://localhost:4000/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({ identifier: trimmedIdentifier }),
      body: JSON.stringify({ identifier }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Auth check failed');
    }
    
    // FIXED: Cache the result
    authState.requestCache.set(cacheKey, data.userExists);
    
    sessionStorage.setItem('authIdentifier', trimmedIdentifier);
    
    if (data.userExists) {
      renderLoginFormWithIdentifier(trimmedIdentifier);
    } else {
      renderSignupFormWithIdentifier(trimmedIdentifier);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
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

// IMPROVED: Handle login with better success handling
async function handleLogin(formData) {
  const identifier = formData.get('identifier');
  const password = formData.get('password');
  
  console.log('[modal.js line 565] Attempting login for:', identifier);
  authLog('Attempting login', { identifier });
  
  if (!identifier || !password) {
    throw new Error('Both email/username and password are required');
  }
  
  try {
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify({ identifier: identifier.trim(), password })
      body: JSON.stringify({ identifier, password })
    });
    
    console.log('[modal.js line 577] Login response received, status:', response.status);
    authLog('Login response received', { status: response.status });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
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
    authLog('Login error', { error: error.message });
    throw error;
  }
}

// Render signup form with identifier
function renderSignupFormWithIdentifier(identifier) {
  console.log('[modal.js line 615] Rendering signup form with identifier:', identifier);
  authLog('Rendering signup form with identifier', { identifier });
  
  const content = document.getElementById('auth-form-content');
  if (!content) return;
  
  // Determine if identifier is email or username
  const isEmail = identifier.includes('@');
  
  content.innerHTML = `
    <div class="auth-form-container">
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-subtitle">Complete your registration</p>
      
      <form id="signup-form" class="auth-form">
        ${isEmail ? `
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input 
              type="email" 
              id="signup-email" 
              name="email" 
              value="${identifier}" 
              readonly 
              autocomplete="email"
            />
          </div>
          
          <div class="form-group">
            <label for="signup-username">Choose a Username</label>
            <input 
              type="text" 
              id="signup-username" 
              name="username" 
              placeholder="Choose a username" 
              required 
              autocomplete="username"
              pattern="[a-zA-Z0-9_-]{3,30}"
              title="3-30 characters, letters, numbers, underscores, and dashes only"
            />
            <div id="username-feedback" class="field-feedback"></div>
          </div>
        ` : `
          <div class="form-group">
            <label for="signup-username">Username</label>
            <input 
              type="text" 
              id="signup-username" 
              name="username" 
              value="${identifier}" 
              readonly 
              autocomplete="username"
            />
          </div>
          
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input 
              type="email" 
              id="signup-email" 
              name="email" 
              placeholder="Enter your email" 
              required 
              autocomplete="email"
            />
          </div>
        `}
        
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
          <div id="password-match-feedback" class="field-feedback"></div>
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
  
  // Focus on appropriate input
  setTimeout(() => {
    if (isEmail) {
      document.getElementById('signup-username')?.focus();
    } else {
      document.getElementById('signup-email')?.focus();
    }
  }, 100);
}

// IMPROVED: Handle signup with better validation and error handling
async function handleSignup(formData) {
  const email = formData.get('email');
  const username = formData.get('username');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  console.log('[modal.js line 734] Attempting signup for:', { email, username });
  authLog('Attempting signup', { email, username });
  
  // Validate required fields
  if (!email || !username || !password || !confirmPassword) {
    throw new Error('All fields are required');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  
  // Validate passwords match
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  // Validate password strength
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  // Validate username format
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and dashes');
  }
  
  try {
    const response = await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: email.trim(), 
        username: username.trim(), 
        password 
      })
    });
    
    console.log('[modal.js line 756] Signup response received, status:', response.status);
    authLog('Signup response received', { status: response.status });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    
    console.log('[modal.js line 765] Signup successful');
    authLog('Signup successful', { user: data.user });
    
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
    
    // Show success message
    showSuccessMessage('Account created successfully! Welcome!');
    
    // Redirect to user profile
    setTimeout(() => {
      window.location.href = `/user/${data.user.username}`;
    }, 1000);
    
  } catch (error) {
    console.error('[modal.js line 784] Signup error:', error);
    authLog('Signup error', { error: error.message });
    throw error;
  }
}

// Handle username input for real-time validation
function handleUsernameInput(input) {
  const username = input.value.trim();
  const feedback = document.getElementById('username-feedback');
  
  // Clear previous timeout
  if (authState.checkTimeout) {
    clearTimeout(authState.checkTimeout);
  }
  
  // Reset feedback if empty
  if (!username) {
    feedback.textContent = '';
    feedback.className = 'field-feedback';
    return;
  }
  
  // Validate format first
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    feedback.textContent = 'Only letters, numbers, underscores, and dashes allowed';
    feedback.className = 'field-feedback error';
    return;
  }
  
  if (username.length < 3) {
    feedback.textContent = 'Username must be at least 3 characters';
    feedback.className = 'field-feedback error';
    return;
  }
  
  if (username.length > 30) {
    feedback.textContent = 'Username must be 30 characters or less';
    feedback.className = 'field-feedback error';
    return;
  }
  
  // Show checking state
  feedback.textContent = 'Checking availability...';
  feedback.className = 'field-feedback checking';
  
  // Debounce the API call
  authState.checkTimeout = setTimeout(() => {
    checkUsernameAvailability(username);
  }, 500);
}

// Check username availability
async function checkUsernameAvailability(username) {
  console.log('[modal.js line 836] Checking username availability:', username);
  authLog('Checking username availability', { username });
  
  try {
    const response = await fetch('http://localhost:4000/check-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    const feedback = document.getElementById('username-feedback');
    
    if (!feedback) return; // Feedback element might be gone if user navigated away
    
    console.log('[modal.js line 851] Username check response:', { username, available: data.available });
    authLog('Username check response', { username, available: data.available });
    
    if (data.available) {
      feedback.textContent = '✓ Username is available';
      feedback.className = 'field-feedback success';
    } else {
      feedback.textContent = '✗ Username is already taken';
      feedback.className = 'field-feedback error';
    }
    
  } catch (error) {
    console.error('[modal.js line 863] Username check error:', error);
    authLog('Username check error', { error: error.message });
    const feedback = document.getElementById('username-feedback');
    if (feedback) {
      feedback.textContent = 'Error checking username';
      feedback.className = 'field-feedback error';
    }
  }
}

// Validate password match
function validatePasswordMatch() {
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const feedback = document.getElementById('password-match-feedback');
  
  if (!confirmPassword) {
    feedback.textContent = '';
    return;
  }
  
  if (password === confirmPassword) {
    feedback.textContent = '✓ Passwords match';
    feedback.className = 'field-feedback success';
  } else {
    feedback.textContent = '✗ Passwords do not match';
    feedback.className = 'field-feedback error';
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('auth-error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
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
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// Render login form (for direct access)
function renderLoginForm() {
  console.log('[modal.js line 905] Rendering login form');
  authLog('Rendering login form');
  
  const content = document.getElementById('auth-form-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="auth-form-container">
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Login to your account</p>
      
      <form id="login-form" class="auth-form">
        <div class="form-group">
          <label for="login-identifier">Email or Username</label>
          <input 
            type="text" 
            id="login-identifier" 
            name="identifier" 
            placeholder="Enter your email or username" 
            required 
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
        <p>Don't have an account? <a href="#" class="switch-to-signup">Sign up</a></p>
      </div>
    </div>
  `;
  
  // Focus on first input
  setTimeout(() => {
    document.getElementById('login-identifier')?.focus();
  }, 100);
}

// Render signup form (for direct access)
function renderSignupForm() {
  console.log('[modal.js line 960] Rendering signup form');
  authLog('Rendering signup form');
  
  const content = document.getElementById('auth-form-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="auth-form-container">
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-subtitle">Join our community</p>
      
      <form id="signup-form" class="auth-form">
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input 
            type="email" 
            id="signup-email" 
            name="email" 
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
            placeholder="Choose a username" 
            required 
            autocomplete="username"
            pattern="[a-zA-Z0-9_-]{3,30}"
            title="3-30 characters, letters, numbers, underscores, and dashes only"
          />
          <div id="username-feedback" class="field-feedback"></div>
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
          <div id="password-match-feedback" class="field-feedback"></div>
        </div>
        
        <div id="auth-error" class="error-message" style="display: none;"></div>
        
        <button type="submit" class="auth-submit-btn">Sign Up</button>
      </form>
      
      <div class="auth-switch">
        <p>Already have an account? <a href="#" class="switch-to-login">Login</a></p>
      </div>
    </div>
  `;
  
  // Focus on first input
  setTimeout(() => {
    document.getElementById('signup-email')?.focus();
  }, 100);
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

// IMPROVED: Initialize with automatic auth refresh
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[modal.js line 1142] DOM loaded, initializing modals');
    authLog('DOM loaded, initializing modals');
    const modalSystem = modals.init();
    console.log('[modal.js line 1145] Modal system initialized:', modalSystem);
    authLog('Modal system initialized', { modalSystem });
    
    // Set up periodic auth refresh (every 60 minutes)
    setInterval(async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          authLog('Periodic auth refresh failed, user logged out');
        }
      }
    }, 60 * 60 * 1000); // 60 minutes
  });
} else {
  console.log('[modal.js line 1149] DOM already loaded, initializing modals');
  authLog('DOM already loaded, initializing modals');
  const modalSystem = modals.init();
  console.log('[modal.js line 1152] Modal system initialized:', modalSystem);
  authLog('Modal system initialized', { modalSystem });
}

// FIXED: Initialize only once
if (!window.modalSystemInitialized) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      modals.init();
    });
  } else {
    modals.init();
  }
  window.modalSystemInitialized = true;
}

///////////////////////// END FIXED AUTHENTICATION MODAL /////////////////////////