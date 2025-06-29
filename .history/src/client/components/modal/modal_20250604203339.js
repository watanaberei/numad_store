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
  checkTimeout: null
};

// Logging utility with timestamps
const authLog = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH ${timestamp}] ${action}`, data);
};

///////////////////////// START MODAL SYSTEM OBJECT /////////////////////////
const modalSystem = {
  // Open auth modal with specific form type
  openAuth: (formType = 'check') => {
    console.log('[modal.js line 27] Opening auth modal with form type:', formType);
    authLog('Opening auth modal', { formType });
    
    const modal = document.getElementById('auth-modal');
    if (!modal) {
      console.log('[modal.js line 32] Auth modal not found, creating it');
      authLog('Auth modal not found, creating it');
      createAuthModal();
    }
    
    const modalElement = document.getElementById('auth-modal');
    if (modalElement) {
      modalElement.style.display = 'block';
      console.log('[modal.js line 40] Auth modal displayed');
      authLog('Auth modal displayed');
      
      // Render appropriate form based on formType
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
    } else {
      console.error('[modal.js line 56] Failed to create auth modal');
      authLog('ERROR: Failed to create auth modal');
    }
  },
  
  // Close specific modal by ID
  close: (modalId) => {
    console.log('[modal.js line 63] Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      authLog('Modal closed', { modalId });
    }
  },
  
  // Close all modals
  closeAll: () => {
    console.log('[modal.js line 73] Closing all modals');
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    authLog('All modals closed');
  }
};
///////////////////////// END MODAL SYSTEM OBJECT /////////////////////////

export const modals = {
  init: () => {
    console.log('[modal.js line 85] Initializing modal system');
    authLog('Initializing modal system');
    
    // Get all modal buttons
    const modalBtns = document.querySelectorAll('.modal-btn');
    const modalClose = document.querySelectorAll('.modal-close');
    const modalElements = document.querySelectorAll('.modal');

    console.log('[modal.js line 93] Found modal buttons:', modalBtns.length);
    console.log('[modal.js line 94] Found close buttons:', modalClose.length);
    console.log('[modal.js line 95] Found modals:', modalElements.length);

    // Add click event to modal buttons
    modalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        console.log('[modal.js line 101] Modal button clicked, target:', target);
        authLog('Modal button clicked', { target });
        
        if (target === 'auth-modal') {
          modalSystem.openAuth('check');
        } else {
          const modal = document.getElementById(target);
          if (modal) {
            modal.style.display = 'block';
            authLog('Modal opened by button click', { modalId: target });
          }
        }
      });
    });

    // Add click event to close buttons
    modalClose.forEach(close => {
      close.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          console.log('[modal.js line 124] Modal closed by close button');
          authLog('Modal closed by close button', { modalId: modal.id });
        }
      });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      modalElements.forEach(modal => {
        if (e.target === modal) {
          modal.style.display = 'none';
          console.log('[modal.js line 135] Modal closed by outside click');
          authLog('Modal closed by outside click', { modalId: modal.id });
        }
      });
    });

    // Initialize auth form handlers
    initAuthForms();
    
    // Check authentication state on load
    checkAuthenticationState();

    return modalSystem;
  }
};

// IMPROVED: Check authentication state on page load with better persistence
function checkAuthenticationState() {
  console.log('[modal.js line 153] Checking authentication state');
  authLog('Checking authentication state on load');
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userEmail = localStorage.getItem('userEmail');
  const username = localStorage.getItem('username');
  
  if (accessToken && refreshToken) {
    authLog('User appears to be authenticated', { userEmail, username });
    
    // Verify token is still valid
    verifyToken(accessToken).then(isValid => {
      if (isValid) {
        authLog('Token is valid, user authenticated');
        updateUIForAuthenticatedUser({ email: userEmail, username });
      } else {
        authLog('Token is invalid, attempting refresh');
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

// IMPROVED: Better token verification
async function verifyToken(token) {
  try {
    const response = await fetch('http://localhost:4000/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Token is valid, update user info if needed
      try {
        const userData = await response.json();
        if (userData.user) {
          // Update stored user info
          localStorage.setItem('userEmail', userData.user.email);
          localStorage.setItem('username', userData.user.username);
        }
      } catch (e) {
        // If response is not JSON, that's okay for verification
      }
      return true;
    }
    return false;
  } catch (error) {
    authLog('Token verification error', { error: error.message });
    return false;
  }
}

// IMPROVED: Refresh access token with better error handling
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  
  try {
    authLog('Attempting to refresh access token');
    const response = await fetch('http://localhost:4000/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      
      // Update user info if provided
      if (data.user) {
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('username', data.user.username);
      }
      
      authLog('Access token refreshed successfully');
      return data.accessToken;
    } else {
      // If refresh fails, clear all auth data
      clearAuthState();
    }
  } catch (error) {
    authLog('Token refresh error', { error: error.message });
    clearAuthState();
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

// IMPROVED: Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  authLog('Updating UI for authenticated user', { user });
  
  // Update header navigation
  const authButtons = document.querySelectorAll('.auth-btn');
  authButtons.forEach(btn => {
    btn.textContent = user.username || user.email;
    btn.setAttribute('data-authenticated', 'true');
    
    // Update click handler to go to user profile
    btn.onclick = function(e) {
      e.preventDefault();
      window.location.href = `/user/${user.username}`;
    };
  });
  
  // Update any login/signup links
  const loginLinks = document.querySelectorAll('a[href="/login"], a[href="/signup"]');
  loginLinks.forEach(link => {
    link.textContent = user.username || user.email;
    link.href = `/user/${user.username}`;
  });
  
  // Show authenticated content
  const authContent = document.querySelectorAll('.auth-required');
  authContent.forEach(el => el.style.display = 'block');
  
  const unauthContent = document.querySelectorAll('.unauth-required');
  unauthContent.forEach(el => el.style.display = 'none');
  
  // Emit custom event for other components
  window.dispatchEvent(new CustomEvent('user-authenticated', { 
    detail: { user } 
  }));
}

// IMPROVED: Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  authLog('Updating UI for unauthenticated user');
  
  const authButtons = document.querySelectorAll('.auth-btn');
  authButtons.forEach(btn => {
    btn.textContent = 'Login';
    btn.removeAttribute('data-authenticated');
    
    // Update click handler to open auth modal
    btn.onclick = function(e) {
      e.preventDefault();
      modalSystem.openAuth('check');
    };
  });
  
  // Hide authenticated content
  const authContent = document.querySelectorAll('.auth-required');
  authContent.forEach(el => el.style.display = 'none');
  
  const unauthContent = document.querySelectorAll('.unauth-required');
  unauthContent.forEach(el => el.style.display = 'block');
  
  window.dispatchEvent(new CustomEvent('user-unauthenticated'));
}

// Initialize auth forms
function initAuthForms() {
  console.log('[modal.js line 269] Initializing auth forms');
  authLog('Initializing auth forms');
  
  // Create auth modal if it doesn't exist
  if (!document.getElementById('auth-modal')) {
    console.log('[modal.js line 274] Creating auth modal');
    authLog('Creating auth modal');
    createAuthModal();
  } else {
    console.log('[modal.js line 278] Auth modal already exists');
    authLog('Auth modal already exists');
  }
  
  // Set up event delegation for auth forms
  document.addEventListener('submit', handleFormSubmit);
  document.addEventListener('input', handleFormInput);
  document.addEventListener('click', handleAuthClick);
}

// Handle auth-related clicks
function handleAuthClick(e) {
  if (e.target.matches('.switch-to-login')) {
    e.preventDefault();
    console.log('[modal.js line 292] Switching to login form');
    authLog('Switching to login form');
    renderLoginForm();
  } else if (e.target.matches('.switch-to-signup')) {
    e.preventDefault();
    console.log('[modal.js line 297] Switching to signup form');
    authLog('Switching to signup form');
    renderSignupForm();
  } else if (e.target.matches('.back-to-email')) {
    e.preventDefault();
    console.log('[modal.js line 302] Going back to email check');
    authLog('Going back to email check');
    renderEmailCheckForm();
  }
}

// Handle form input events
function handleFormInput(e) {
  if (e.target.id === 'signup-username') {
    handleUsernameInput(e.target);
  } else if (e.target.id === 'signup-confirm-password') {
    validatePasswordMatch();
  }
}

// IMPROVED: Handle form submissions with better error handling
async function handleFormSubmit(e) {
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

// Create auth modal structure
function createAuthModal() {
  console.log('[modal.js line 354] Creating auth modal structure');
  authLog('Creating auth modal structure');
  
  // Remove existing modal if it exists
  const existingModal = document.getElementById('auth-modal');
  if (existingModal) {
    existingModal.remove();
    console.log('[modal.js line 361] Removed existing auth modal');
    authLog('Removed existing auth modal');
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
  console.log('[modal.js line 378] Auth modal structure created and appended to body');
  authLog('Auth modal structure created and appended to body');
  
  // Add close event listener
  modal.querySelector('.auth-modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
    console.log('[modal.js line 384] Auth modal closed');
    authLog('Auth modal closed');
  });
  
  // Also close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      console.log('[modal.js line 392] Auth modal closed by outside click');
      authLog('Auth modal closed by outside click');
    }
  });
}

///////////////////////// START RENDER EMAIL CHECK FORM /////////////////////////
function renderEmailCheckForm() {
  console.log('[modal.js line 401] Rendering email check form');
  authLog('Rendering email check form');
  
  const content = document.getElementById('auth-form-content');
  if (!content) {
    console.error('[modal.js line 406] ERROR: auth-form-content element not found');
    authLog('ERROR: auth-form-content element not found');
    return;
  }
  
  console.log('[modal.js line 411] Found auth-form-content element, inserting form HTML');
  authLog('Found auth-form-content element, inserting form HTML');
  
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
  
  console.log('[modal.js line 440] Email check form HTML inserted');
  authLog('Email check form HTML inserted');
  
  // Focus on first input
  setTimeout(() => {
    const identifierInput = document.getElementById('auth-identifier');
    if (identifierInput) {
      identifierInput.focus();
      console.log('[modal.js line 448] Focused on identifier input');
      authLog('Focused on identifier input');
    } else {
      console.error('[modal.js line 451] ERROR: Could not find identifier input to focus');
      authLog('ERROR: Could not find identifier input to focus');
    }
  }, 100);
}
///////////////////////// END RENDER EMAIL CHECK FORM /////////////////////////

// IMPROVED: Handle email check with better error handling
async function handleEmailCheck(formData) {
  const identifier = formData.get('identifier');
  
  console.log('[modal.js line 462] Checking email/username:', identifier);
  authLog('Checking email/username', { identifier });
  
  if (!identifier || identifier.trim() === '') {
    throw new Error('Please enter an email or username');
  }
  
  try {
    const response = await fetch('http://localhost:4000/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier: identifier.trim() })
    });
    
    console.log('[modal.js line 474] Auth check response received, status:', response.status);
    authLog('Auth check response received', { status: response.status });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Auth check failed');
    }
    
    console.log('[modal.js line 483] Auth check result:', data.userExists);
    authLog('Auth check result', { userExists: data.userExists });
    
    // Store the identifier for next step
    sessionStorage.setItem('authIdentifier', identifier.trim());
    
    if (data.userExists) {
      // User exists, show login form
      renderLoginFormWithIdentifier(identifier.trim());
    } else {
      // User doesn't exist, show signup form
      renderSignupFormWithIdentifier(identifier.trim());
    }
    
  } catch (error) {
    console.error('[modal.js line 498] Email check error:', error);
    authLog('Email check error', { error: error.message });
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
      body: JSON.stringify({ identifier: identifier.trim(), password })
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
  checkState: checkAuthenticationState,
  logout: () => {
    console.log('[modal.js line 1040] User logging out');
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
    console.log('[modal.js line 1055] Opening auth modal via auth.openAuthModal');
    const modalSystem = modals.init();
    modalSystem.openAuth(type);
  },
  // New method to automatically refresh authentication
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

///////////////////////// END FIXED AUTHENTICATION MODAL /////////////////////////