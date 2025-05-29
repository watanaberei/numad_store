// src/client/components/modal.js
import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import * as glyph from "../icon/glyph.js";
import { login, signup } from '../../API/api.js';

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

export const modals = {
  modalSystem: () => {
    authLog('Initializing modal system');
    
    // Get all modal buttons
    const modalBtns = document.querySelectorAll('.modal-btn');
    const modalClose = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal');

    // Add click event to modal buttons
    modalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        authLog('Modal button clicked', { target });
        
        if (target === 'auth-modal') {
          // Use our custom openAuth function for auth modal
          modals.openAuth('check');
        } else {
          // Regular modal handling for other modals
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
          authLog('Modal closed by close button', { modalId: modal.id });
        }
      });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      modalElements.forEach(modal => {
        if (e.target === modal) {
          modal.style.display = 'none';
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

// Check authentication state on page load
function checkAuthenticationState() {
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
  }
}

// Verify token validity
async function verifyToken(token) {
  try {
    const response = await fetch('http://localhost:4000/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    authLog('Token verification error', { error: error.message });
    return false;
  }
}

// Refresh access token
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
      authLog('Access token refreshed successfully');
      return data.accessToken;
    }
  } catch (error) {
    authLog('Token refresh error', { error: error.message });
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

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  authLog('Updating UI for authenticated user', { user });
  
  // Update header or navigation
  const authButtons = document.querySelectorAll('.auth-btn');
  authButtons.forEach(btn => {
    btn.textContent = user.username || user.email;
    btn.setAttribute('data-authenticated', 'true');
  });
  
  // Emit custom event
  window.dispatchEvent(new CustomEvent('user-authenticated', { 
    detail: { user } 
  }));
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  authLog('Updating UI for unauthenticated user');
  
  const authButtons = document.querySelectorAll('.auth-btn');
  authButtons.forEach(btn => {
    btn.textContent = 'Login';
    btn.removeAttribute('data-authenticated');
  });
  
  window.dispatchEvent(new CustomEvent('user-unauthenticated'));
}

// Initialize auth forms
function initAuthForms() {
  authLog('Initializing auth forms');
  
  // Create auth modal if it doesn't exist
  if (!document.getElementById('auth-modal')) {
    authLog('Creating auth modal');
    createAuthModal();
  } else {
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
    authLog('Switching to login form');
    renderLoginForm();
  } else if (e.target.matches('.switch-to-signup')) {
    e.preventDefault();
    authLog('Switching to signup form');
    renderSignupForm();
  } else if (e.target.matches('.back-to-email')) {
    e.preventDefault();
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

// Handle form submissions - CONSOLIDATED FUNCTION
async function handleFormSubmit(e) {
  // Handle all auth-related forms
  if (!e.target.matches('#email-check-form, #login-form, #signup-form')) return;
  
  e.preventDefault();
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
    authLog('Form submission error', { error: error.message });
    showError(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

// Create auth modal structure
function createAuthModal() {
  authLog('Creating auth modal structure');
  
  // Remove existing modal if it exists
  const existingModal = document.getElementById('auth-modal');
  if (existingModal) {
    existingModal.remove();
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
  authLog('Auth modal structure created and appended to body');
  
  // Add close event listener
  modal.querySelector('.auth-modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
    authLog('Auth modal closed');
  });
  
  // Also close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      authLog('Auth modal closed by outside click');
    }
  });
}

// Render email check form
function renderEmailCheckForm() {
  authLog('Rendering email check form');
  
  const content = document.getElementById('auth-form-content');
  if (!content) {
    authLog('ERROR: auth-form-content element not found');
    return;
  }
  
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
  
  authLog('Email check form HTML inserted');
  
  // Focus on first input
  setTimeout(() => {
    const identifierInput = document.getElementById('auth-identifier');
    if (identifierInput) {
      identifierInput.focus();
      authLog('Focused on identifier input');
    } else {
      authLog('ERROR: Could not find identifier input to focus');
    }
  }, 100);
}

// Handle email check
async function handleEmailCheck(formData) {
  const identifier = formData.get('identifier');
  
  authLog('Checking email/username', { identifier });
  
  try {
    const response = await fetch('http://localhost:4000/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier })
    });
    
    authLog('Auth check response received', { status: response.status });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Auth check failed');
    }
    
    authLog('Auth check result', { userExists: data.userExists });
    
    // Store the identifier for next step
    sessionStorage.setItem('authIdentifier', identifier);
    
    if (data.userExists) {
      // User exists, show login form
      renderLoginFormWithIdentifier(identifier);
    } else {
      // User doesn't exist, show signup form
      renderSignupFormWithIdentifier(identifier);
    }
    
  } catch (error) {
    authLog('Email check error', { error: error.message });
    throw error;
  }
}

// Render login form with identifier
function renderLoginFormWithIdentifier(identifier) {
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

// Handle login
async function handleLogin(formData) {
  const identifier = formData.get('identifier');
  const password = formData.get('password');
  
  authLog('Attempting login', { identifier });
  
  try {
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, password })
    });
    
    authLog('Login response received', { status: response.status });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    authLog('Login successful', { user: data.user });
    
    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('username', data.user.username);
    
    // Update UI
    updateUIForAuthenticatedUser(data.user);
    
    // Close modal
    document.getElementById('auth-modal').style.display = 'none';
    
    // Redirect if on login page
    if (window.location.pathname === '/login') {
      window.location.href = `/user/${data.user.username}`;
    }
    
  } catch (error) {
    authLog('Login error', { error: error.message });
    throw error;
  }
}

// Render signup form with identifier
function renderSignupFormWithIdentifier(identifier) {
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

// Handle signup
async function handleSignup(formData) {
  const email = formData.get('email');
  const username = formData.get('username');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  authLog('Attempting signup', { email, username });
  
  // Validate passwords match
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
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
      body: JSON.stringify({ email, username, password })
    });
    
    authLog('Signup response received', { status: response.status });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    
    authLog('Signup successful', { user: data.user });
    
    // Store tokens and user info
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('username', data.user.username);
    
    // Update UI
    updateUIForAuthenticatedUser(data.user);
    
    // Close modal
    document.getElementById('auth-modal').style.display = 'none';
    
    // Redirect to user profile
    window.location.href = `/user/${data.user.username}`;
    
  } catch (error) {
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
    
    authLog('Username check response', { username, available: data.available });
    
    if (data.available) {
      feedback.textContent = '✓ Username is available';
      feedback.className = 'field-feedback success';
    } else {
      feedback.textContent = '✗ Username is already taken';
      feedback.className = 'field-feedback error';
    }
    
  } catch (error) {
    authLog('Username check error', { error: error.message });
    const feedback = document.getElementById('username-feedback');
    feedback.textContent = 'Error checking username';
    feedback.className = 'field-feedback error';
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

// Render login form (for direct access)
function renderLoginForm() {
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
    // const modalSystem = modals.init();
    modalSystem.openAuth(type);
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

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    authLog('DOM loaded, initializing modals');
    // const modalSystem = modals.init();
    authLog('Modal system initialized', { modalSystem });
  });
} else {
  authLog('DOM already loaded, initializing modals');
  // const modalSystem = modals.init();
  authLog('Modal system initialized', { modalSystem });
}