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
  init: () => {
    authLog('Initializing modal system');
    
    // Get all modal buttons
    const modalBtns = document.querySelectorAll('.modal-btn');
    const modalClose = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal');

    // Add click event to modal buttons
    modalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const modal = document.getElementById(target);
        if (modal) {
          modal.style.display = 'block';
          authLog('Modal opened by button click', { modalId: target });
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
      modals.forEach(modal => {
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

    return {
      open: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
          modal.style.display = 'block';
          authLog('Modal opened programmatically', { modalId: id });
        }
      },
      close: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
          modal.style.display = 'none';
          authLog('Modal closed programmatically', { modalId: id });
        }
      },
      openAuth: (type = 'login') => {
        authLog('Opening auth modal', { type });
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authState.currentModal = type;
          authModal.style.display = 'block';
          if (type === 'login') {
            renderLoginForm();
          } else {
            renderSignupForm();
          }
        }
      }
    };
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
    createAuthModal();
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

// Handle form submissions
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
    authLog('Auth modal closed');
  });
}

// Update the openAuth function
modals.openAuth = (type = 'check') => {
  authLog('Opening auth modal', { type });
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authState.currentModal = type;
    authModal.style.display = 'block';
    
    // Always start with email check
    renderEmailCheckForm();
  }
};

// Handle form submissions
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

// Handle form input events
function handleFormInput(e) {
  if (e.target.id === 'signup-username') {
    handleUsernameInput(e.target);
  } else if (e.target.id === 'signup-confirm-password') {
    validatePasswordMatch();
  }
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

function renderSignupFormWithIdentifier(identifier) {
  authLog('Rendering signup form with identifier', { identifier });
  
  // const content = document.getElementById('auth-form-content');
  // if (!content) return;
  
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
    modals.init().openAuth(type);
  }
};


























  ///////////////////////////////////////////////////////
  //////////////////////// MODAL ////////////////////////
  ///////////////////////////////////////////////////////
  export const modalGallery = (modalGalleryData) => {
    const gallery = modalGalleryData.gallery || [];
    const area = modalGalleryData.area || [];

    function modalGalleryHTML(gallery) {
      console.log('gallery', gallery);
      // Generate the HTML
      let mediaGalleryHTML = "";
      gallery.forEach((array) => {
        mediaGalleryHTML += `
        <div class="media-img-m">
            <div class="media-img">
                <img src="${array.url}" class="gallery-item-img media-img-1-x-1-x-m" alt="" />
            </div>
            <!--
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
            -->
        </div>
              `;
      });
      return mediaGalleryHTML; // Add this line
    }

    function modalAreaHTML(area) {
      console.log('area', area);
      // Generate the HTML
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
      return mediaAreaHTML; // Add this line
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
  ///////////////////////////////////////////////////////
  //////////////////////// MODAL ////////////////////////
  ///////////////////////////////////////////////////////









    //////////////////////////////////////////////////////
    //////////////////// MODALAUTH ////////////////////
    //////////////////////////////////////////////////////
    export const modalAuth = () => {
      const glyphClose = glyph.glyphClose;

      const modalAuthHTML = () => `
        

            <div class="header">
              <div class="s">
                <div class="_30">30</div>
              </div>
              <div class="header2">
                <div class="bread-crumb">
                  <div class="bread-crumb-item">
                    <div class="title">Title</div>
                  </div>
                  <div class="divider">
                    <div class="div">/</div>
                  </div>
                  <div class="bread-crumb-item">
                    <div class="spaces">Spaces</div>
                  </div>
                  <div class="divider2">
                    <div class="div">/</div>
                  </div>
                  <div class="bread-crumb-item">
                    <div class="outside-patio">Outside Patio</div>
                  </div>
                </div>
                <button id="auth-btn" class="close modal-close">
                  ${glyphClose}
                </button>
              </div>
              <div class="s">
                <div class="_30">30</div>
              </div>
            </div>



            <div class="modal-content">
              <fieldset class="step-hide">
                <div class="title">
                  <span class="header06">
                    Log in or create an account
                  </span>
                </div>
                <div class="form-container">
                  <span class="text02 medium">
                    Enter your email
                  </span>
                  <form id="auth-form">
                  
                    <input type="email" id="email" name="email" placeholder="Email" required>
                    <button type="check" id="check" name="check">Next</button>
                    <!--<button type="next" id="next" name="next">Next</button>-->
                  </form>
                </div>
              </fieldset>
            </div>



            <div class="footer">
              <div class="tag">
                <div class="frame-1321322379">
                  <div class="cerritos">Smoking Tiger Bread Factory</div>
                </div>
              </div>
              <div class="div2">/</div>
              <div class="tag">
                <div class="frame-1321322379">
                  <div class="cerritos">Gallery</div>
                </div>
              </div>
              <div class="div2">/</div>
              <div class="tag">
                <div class="place">Category</div>
                <div class="frame-1321322379">
                  <div class="cerritos">Spaces</div>
                </div>
              </div>
            </div>
      



    <!--
      <div class="auth-header">
        <div class="auth-headline">
            <fieldset class="step-hide">
              <div class="title">
                <span class="header06">
                  Log in or create an account
                </span>
              </div>
              <div class="form-container">
                <span class="text02 medium">
                  Enter your email
                </span>
                <form id="auth-form">
                
                  <input type="email" id="email" name="email" placeholder="Email" required>
                  <button type="check" id="check" name="check">Next</button>
                </form>
              </div>
            </fieldset>
          </div>
        </div>
        -->
      `;

      const modalAuthDom = modalAuthHTML();

      const modalAuth = `
      <button id="auth-btn">Account</button>
      <!--
      <div id="myModalAuth" class="modal">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
    -->
          <div id="myModalAuth" class="grid05 modal">
            ${modalAuthDom}
          </div>
      <!--  
        </div>
      </div>
      -->
      `;
      const after_render = async () => {
        const authForm = document.getElementById('auth-form');
        if (authForm) {
          console.log('auth-form element found');
          // Prevent default form submission for the email check
          authForm.addEventListener('submit', (event) => {
            event.preventDefault();
          });
          // Listen for the check button click
          const checkBtn = document.getElementById('check');
          if (checkBtn) {
            checkBtn.addEventListener('click', async (event) => {
              event.preventDefault();
              const emailInput = document.getElementById('email');
              if (emailInput) {
                const email = emailInput.value;
                console.log('[modal] Checking email:', email);
                try {
                  const response = await fetch('http://localhost:4000/auth', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                  });
                  if (!response.ok) throw new Error('Check user failed');
                  const data = await response.json();
                  if (data.errors) {
                    console.error(data.errors);
                  } else {
                    if (data.user) {
                      // User exists, show login form
                      console.log('[modal] Email found, rendering login form for:', email);
                      authForm.innerHTML = `
                        <form id="login-form">
                          <input type="password" id="password" placeholder="Password" required />
                          <button type="submit" id="login-submit">Login</button>
                        </form>
                      `;
                      // Attach login form submit event after DOM update
                      setTimeout(() => {
                        const loginForm = document.getElementById('login-form');
                        console.log('loginForm', loginForm);
                        if (loginForm) {
                          console.log('loginForm found');
                          loginForm.addEventListener('submit', async (event) => {
                            console.log('loginForm submit event');
                            event.preventDefault();
                            const passwordInput = document.getElementById('password');
                            if (passwordInput) {
                              console.log('passwordInput found');
                              const password = passwordInput.value;
                              console.log('[modal] Login form submitted. Email:', email, 'Password:', password);
                              try {
                                console.log('[modal] Posting to /login...');
                                const response = await fetch('http://localhost:4000/login', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ email, password })
                                });
                                if (!response.ok) {
                                  console.error('[modal] Login failed. Status:', response.status);
                                  throw new Error('Login failed');
                                }
                                const data = await response.json();
                                console.log('[modal] Login response:', data);
                                if (data.accessToken && data.refreshToken) {
                                  localStorage.setItem('accessToken', data.accessToken);
                                  localStorage.setItem('refreshToken', data.refreshToken);
                                  localStorage.setItem('userEmail', data.email);
                                  // Close modal
                                  const authModal = document.getElementById('myModalAuth');
                                  if (authModal) {
                                    authModal.classList.remove('show');
                                    authModal.classList.add('hide');
                                    console.log('[modal] Modal closed after login');
                                  }
                                  window.dispatchEvent(new CustomEvent('user-logged-in', { detail: { email: data.email } }));
                                }
                              } catch (error) {
                                console.error('[modal] Login error:', error);
                              }
                            }
                          });
                        }
                      }, 0);
                    } else {
                      // User does not exist, show signup form
                      console.log('[modal] Email not found, rendering signup form for:', email);
                      authForm.innerHTML = `
                        <form id="signup-form">
                          <input type="text" id="username" placeholder="Username" required />
                          <input type="password" id="password" placeholder="Password" required />
                          <button type="submit" id="signup-submit">Sign Up</button>
                        </form>
                      `;
                      // Attach signup form submit event after DOM update
                      setTimeout(() => {
                        const signupForm = document.getElementById('signup-form');
                        if (signupForm) {
                          signupForm.addEventListener('submit', async (event) => {
                            event.preventDefault();
                            const username = document.getElementById('username').value;
                            const password = document.getElementById('password').value;
                            console.log('[modal] Signup form submitted. Email:', email, 'Username:', username, 'Password:', password);
                            try {
                              const response = await fetch('http://localhost:4000/signup', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email, password }) // Match server endpoint which only expects email and password
                              });
                              if (!response.ok) {
                                const errorData = await response.json();
                                console.error('[modal] Signup failed:', errorData);
                                throw new Error(errorData.message || 'Signup failed');
                              }
                              const data = await response.json();
                              console.log('[modal] Signup response:', data);
                              if (data.accessToken && data.refreshToken) {
                                localStorage.setItem('accessToken', data.accessToken);
                                localStorage.setItem('refreshToken', data.refreshToken);
                                localStorage.setItem('userEmail', email); // Store email for header display
                                
                                // Close modal
                                const authModal = document.getElementById('myModalAuth');
                                if (authModal) {
                                  authModal.classList.remove('show');
                                  authModal.classList.add('hide');
                                  console.log('[modal] Modal closed after signup');
                                }
                                
                                // Trigger event to update UI
                                window.dispatchEvent(new CustomEvent('user-logged-in', { 
                                  detail: { email: email } 
                                }));
                              }
                            } catch (error) {
                              console.error('[modal] Signup error:', error);
                              // Optionally show error to user
                              // You could add a div with id="signup-error" and set its text here
                            }
                          });
                        }
                      }, 0);
                    }
                  }
                } catch (error) {
                  console.error('[modal] Email check error:', error);
                }
              }
            });
          }
        } else {
          console.log('auth-form element not found');
        }
      
        // Modal close button logic
        document.addEventListener('click', (event) => {
          const authModal = document.getElementById('myModalAuth');
          if (!authModal) return;
          
          // Handle close clicks (on background or close button)
          if (event.target.classList.contains('modal-close') || 
              event.target === authModal || 
              event.target.closest('.modal-close')) {
            authModal.classList.remove('show');
            authModal.classList.add('hide');
            console.log('[modal] Modal closed by click');
          } 
          // Handle open clicks from any button that should open the modal
          else if (event.target.matches('#auth-btn') || 
                  event.target.matches('#btn-login') ||
                  event.target.closest('#auth-btn') || 
                  event.target.closest('#btn-login')) {
            authModal.classList.remove('hide');
            authModal.classList.add('show');
            console.log('[modal] Modal opened by button click');
          }
        });
      };
      //  const after_render = async () => {
      //   const accountForm = document.getElementById('account-form');
      //   if (accountForm) {
      //     console.log('account-form element found');
      //     accountForm.addEventListener('submit', async (event) => {
      //       event.preventDefault(); // This will prevent the form from submitting normally
      
      //       const email = document.getElementById('email').value;
      
      //       try {
      //         const response = await fetch('http://localhost:4500/account', {
      //           method: 'POST',
      //           headers: {
      //             'Content-Type': 'application/json'
      //           },
      //           body: JSON.stringify({ email })
      //         });
      
      //         if (!response.ok) throw new Error('Check user failed');
      
      //         const data = await response.json();
      
      //         if (data.errors) {
      //           // Handle errors here
      //           console.error(data.errors);
      //         } else {
      //           // User exists, proceed to login
      //           if (data.user) {
      //             accountForm.innerHTML = `
      //               <button id="edit-email-btn">Edit Email</button>
      //               <form id="login-form">
      //                 <input type="password" id="password" placeholder="Password" required />
      //                 <button type="submit">Login</button>
      //               </form>
      //             `;
      //           } 
      //           // User does not exist, proceed to signup
      //           else {
      //             accountForm.innerHTML = `
      //               <button id="edit-email-btn">Edit Email</button>
      //               <form id="signup-form">
      //                 <input type="text" id="username" placeholder="Username" required />
      //                 <input type="password" id="password" placeholder="Password" required />
      //                 <button type="submit">Sign Up</button>
      //               </form>
      //             `;
      //           }
      //         }
      //       } catch (error) {
      //         console.error(error);
      //       }
      //     });
      //   } else {
      //     console.log('account-form element not found');
      //   }
      
      //   document.addEventListener('click', (event) => {
      //     if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
      //       document.getElementById('myModalAccount').style.display = 'none';
      //     } else if (event.target.matches('#account-btn')) {
      //       document.getElementById('myModalAccount').style.display = 'block';
      //     }
      //   });
      // };
      return {
        modalAuth: modalAuth,
        after_render: after_render
      };
    };




// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    authLog('DOM loaded, initializing modals');
    modals.init();
  });
} else {
  authLog('DOM already loaded, initializing modals');
  modals.init();
}



















// export const modals = {
//   init: function() {
//     // Get all modal buttons
//     const modalBtns = document.querySelectorAll('.modal-btn');
//     const modalClose = document.querySelectorAll('.modal-close');
//     const modals = document.querySelectorAll('.modal');

//      // Add click event to modal buttons
//      modalBtns.forEach(btn => {
//       btn.addEventListener('click', function() {
//         const target = this.getAttribute('data-target');
//         const modal = document.getElementById(target);
//         if (modal) {
//           modal.style.display = 'block';
//           console.log('[modal] Modal opened by button click');
//         }
//       });
//     });

//     // Add click event to close buttons
//     modalClose.forEach(close => {
//       close.addEventListener('click', function() {
//         const modal = this.closest('.modal');
//         if (modal) {
//           modal.style.display = 'none';
//           console.log('[modal] Modal closed by close button');
//         }
//       });
//     });

//     // Close modal when clicking outside
//     window.addEventListener('click', function(e) {
//       modals.forEach(modal => {
//         if (e.target === modal) {
//           modal.style.display = 'none';
//           console.log('[modal] Modal closed by click');
//         }
//       });
//     });


//     // Initialize auth form handlers
//     initAuthForms();

//     return {
//       open: (id) => {
//         const modal = document.getElementById(id);
//         if (modal) {
//           modal.style.display = 'block';
//           console.log(`[modal] Modal ${id} opened programmatically`);
//         }
//       },
//       close: (id) => {
//         const modal = document.getElementById(id);
//         if (modal) {
//           modal.style.display = 'none';
//           console.log(`[modal] Modal ${id} closed programmatically`);
//         }
//       }
//     };
//   }
// };

// // export const modals = {
// //   init: function() {
// //     // Get all modal buttons
// //     console.log("modals.init");
// //     document.addEventListener('DOMContentLoaded', () => {
// //       console.log("DOMContentLoaded - Modals are being initialized");

// //       const bindModal = (targetModel) => {
// //         let modal = document.getElementById(targetModel);
// //         console.log(`Attempting to bind model: ${targetModel}`);

// //         if (modal) {
// //           console.log(`Modal found: ${targetModel}`);
// //           document.getElementById(`${targetModel}-close`).onclick = function() {
// //             modal.style.display = "none";
// //             console.log(`Closing modal: ${targetModel}`);
// //           };
// //           modal.style.display = "block";
// //           window.onclick = function(event) {
// //             if (event.target === modal) {
// //               modal.style.display = "none";
// //               console.log(`Clicked outside to close modal: ${targetModel}`);
// //             }
// //           };
// //         } else {
// //           console.log(`Modal not found: ${targetModel}`);
// //         }
// //       };

// //       const myBtn = document.getElementById("myBtn");
// //       const myBtn1 = document.getElementById("myBtn1");
// //       const authBtn = document.getElementById("auth-btn");

// //       if (myBtn) {
// //         console.log("Button myBtn found, attaching click event");
// //         myBtn.onclick = function() {
// //           console.log("myBtn clicked");
// //           bindModal("myModal");
// //         };
// //       } else {
// //         console.log("Button myBtn not found");
// //       }

// //       if (myBtn1) {
// //         console.log("Button myBtn1 found, attaching click event");
// //         myBtn1.onclick = function() {
// //           console.log("myBtn1 clicked");
// //           bindModal("myModal1");
// //         };
// //       } else {
// //         console.log("Button myBtn1 not found");
// //       }
      
// //       if (authBtn) {
// //         console.log("Button authBtn found, attaching click event");
// //         authBtn.onclick = function() {
// //           console.log("authBtn clicked");
// //           bindModal("myModalAuth");
// //         };
// //       } else {
// //         console.log("Button myBtn1 not found");
// //       }
      
// //     });
// //   }
// // };







//   ///////////////////////////////////////////////////////
//   //////////////////////// MODAL ////////////////////////
//   ///////////////////////////////////////////////////////
 
 
//   export const modalGallery = (modalGalleryData) => {
//     const gallery = modalGalleryData.gallery || [];
//     const area = modalGalleryData.area || [];

//     function modalGalleryHTML(gallery) {
//       console.log('gallery', gallery);
//       // Generate the HTML
//       let mediaGalleryHTML = "";
//       gallery.forEach((array) => {
//         mediaGalleryHTML += `
//         <div class="media-img-m">
//             <div class="media-img">
//                 <img src="${array.url}" class="gallery-item-img media-img-1-x-1-x-m" alt="" />
//             </div>
//             <!--
//             <div class="text2">
//                 <span class="caption">
//                     <span class="icon">
//                         <i class="icon-container2"></i>
//                     </span>
//                     <span class="text03 bold">
//                         ${array.description}
//                     </span>
//                 </span>
//             </div>
//             -->
//         </div>
//               `;
//       });
//       return mediaGalleryHTML; // Add this line
//     }

//     function modalAreaHTML(area) {
//       console.log('area', area);
//       // Generate the HTML
//       let mediaAreaHTML = "";
//       area.forEach((array) => {
//         mediaAreaHTML += `
//               <div class="media-img-m">
//                   <div class="media-img">
//                       <img src="${array.url}" class="gallery-item-img media-img-1-x-1-x-m" alt="" />
//                   </div>
//                   <div class="text2">
//                       <span class="caption">
//                           <span class="icon">
//                               <i class="icon-container2"></i>
//                           </span>
//                           <span class="text03 bold">
//                               ${array.description}
//                           </span>
//                       </span>
//                   </div>
//               </div>
//               `;
//       });
//       return mediaAreaHTML; // Add this line
//     }

//     const mediaGallery = modalGalleryHTML(gallery);
//     const mediaArea = modalAreaHTML(area);
//     const glyphClose = glyph.glyphClose;

    
    
//     const modalHTML = `
//       <button id="myBtn">Open Modal</button>
//       <div id="myModal" class="modal">
//         <div class="modal-content">
//           <span class="modal-close">${glyphClose}</span>
          
//           <span class="header03">Gallery</p>
//           <div class="gallery mediaGallery">
//             ${mediaGallery}
//           </div>
          
//           <span class="header03">Area</p>
//           <div class="gallery mediaArea">
//             ${mediaArea}
//           </div>
//         </div>
//       </div>
      
//     `;
  
//     document.addEventListener('click', (event) => {
//       if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
//         document.getElementById('myModal').style.display = 'none';
//       } else if (event.target.matches('#myBtn')) {
//         document.getElementById('myModal').style.display = 'block';
//       }
//     });
  
//     return modalHTML;
//   };
//   ///////////////////////////////////////////////////////
//   //////////////////////// MODAL ////////////////////////
//   ///////////////////////////////////////////////////////









// //////////////////////////////////////////////////////
// //////////////////// MODALAUTH ////////////////////
// //////////////////////////////////////////////////////
// export const modalAuth = () => {
//   const glyphClose = glyph.glyphClose;

//   const modalAuthHTML = () => `
    

//         <div class="header">
//           <div class="s">
//             <div class="_30">30</div>
//           </div>
//           <div class="header2">
//             <div class="bread-crumb">
//               <div class="bread-crumb-item">
//                 <div class="title">Title</div>
//               </div>
//               <div class="divider">
//                 <div class="div">/</div>
//               </div>
//               <div class="bread-crumb-item">
//                 <div class="spaces">Spaces</div>
//               </div>
//               <div class="divider2">
//                 <div class="div">/</div>
//               </div>
//               <div class="bread-crumb-item">
//                 <div class="outside-patio">Outside Patio</div>
//               </div>
//             </div>
//             <button id="auth-btn" class="close modal-close">
//               ${glyphClose}
//             </button>
//           </div>
//           <div class="s">
//             <div class="_30">30</div>
//           </div>
//         </div>



//         <div class="modal-content">
//           <fieldset class="step-hide">
//             <div class="title">
//               <span class="header06">
//                 Log in or create an account
//               </span>
//             </div>
//             <div class="form-container">
//               <span class="text02 medium">
//                 Enter your email
//               </span>
//               <form id="auth-form">
              
//                 <input type="email" id="email" name="email" placeholder="Email" required>
//                 <button type="check" id="check" name="check">Next</button>
//                 <!--<button type="next" id="next" name="next">Next</button>-->
//               </form>
//             </div>
//           </fieldset>
//         </div>



//         <div class="footer">
//           <div class="tag">
//             <div class="frame-1321322379">
//               <div class="cerritos">Smoking Tiger Bread Factory</div>
//             </div>
//           </div>
//           <div class="div2">/</div>
//           <div class="tag">
//             <div class="frame-1321322379">
//               <div class="cerritos">Gallery</div>
//             </div>
//           </div>
//           <div class="div2">/</div>
//           <div class="tag">
//             <div class="place">Category</div>
//             <div class="frame-1321322379">
//               <div class="cerritos">Spaces</div>
//             </div>
//           </div>
//         </div>
   



// <!--
//   <div class="auth-header">
//     <div class="auth-headline">
//         <fieldset class="step-hide">
//           <div class="title">
//             <span class="header06">
//               Log in or create an account
//             </span>
//           </div>
//           <div class="form-container">
//             <span class="text02 medium">
//               Enter your email
//             </span>
//              <form id="auth-form">
             
//               <input type="email" id="email" name="email" placeholder="Email" required>
//               <button type="check" id="check" name="check">Next</button>
//             </form>
//           </div>
//         </fieldset>
//       </div>
//     </div>
//     -->
//   `;

//   const modalAuthDom = modalAuthHTML();

//   const modalAuth = `
//   <button id="auth-btn">Account</button>
//   <!--
//   <div id="myModalAuth" class="modal">
//     <div class="modal-content">
//       <span class="modal-close">&times;</span>
// -->
//       <div id="myModalAuth" class="grid05 modal">
//         ${modalAuthDom}
//       </div>
//   <!--  
//     </div>
//   </div>
//   -->
//    `;
//    const after_render = async () => {
//     const authForm = document.getElementById('auth-form');
//     if (authForm) {
//       console.log('auth-form element found');
//       // Prevent default form submission for the email check
//       authForm.addEventListener('submit', (event) => {
//         event.preventDefault();
//       });
//       // Listen for the check button click
//       const checkBtn = document.getElementById('check');
//       if (checkBtn) {
//         checkBtn.addEventListener('click', async (event) => {
//           event.preventDefault();
//           const emailInput = document.getElementById('email');
//           if (emailInput) {
//             const email = emailInput.value;
//             console.log('[modal] Checking email:', email);
//             try {
//               const response = await fetch('http://localhost:4000/auth', {
//                 method: 'POST',
//                 headers: {
//                   'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ email })
//               });
//               if (!response.ok) throw new Error('Check user failed');
//               const data = await response.json();
//               if (data.errors) {
//                 console.error(data.errors);
//               } else {
//                 if (data.user) {
//                   // User exists, show login form
//                   console.log('[modal] Email found, rendering login form for:', email);
//                   authForm.innerHTML = `
//                     <form id="login-form">
//                       <input type="password" id="password" placeholder="Password" required />
//                       <button type="submit" id="login-submit">Login</button>
//                     </form>
//                   `;
//                   // Attach login form submit event after DOM update
//                   setTimeout(() => {
//                     const loginForm = document.getElementById('login-form');
//                     console.log('loginForm', loginForm);
//                     if (loginForm) {
//                       console.log('loginForm found');
//                       loginForm.addEventListener('submit', async (event) => {
//                         console.log('loginForm submit event');
//                         event.preventDefault();
//                         const passwordInput = document.getElementById('password');
//                         if (passwordInput) {
//                           console.log('passwordInput found');
//                           const password = passwordInput.value;
//                           console.log('[modal] Login form submitted. Email:', email, 'Password:', password);
//                           try {
//                             console.log('[modal] Posting to /login...');
//                             const response = await fetch('http://localhost:4000/login', {
//                               method: 'POST',
//                               headers: {
//                                 'Content-Type': 'application/json'
//                               },
//                               body: JSON.stringify({ email, password })
//                             });
//                             if (!response.ok) {
//                               console.error('[modal] Login failed. Status:', response.status);
//                               throw new Error('Login failed');
//                             }
//                             const data = await response.json();
//                             console.log('[modal] Login response:', data);
//                             if (data.accessToken && data.refreshToken) {
//                               localStorage.setItem('accessToken', data.accessToken);
//                               localStorage.setItem('refreshToken', data.refreshToken);
//                               localStorage.setItem('userEmail', data.email);
//                               // Close modal
//                               const authModal = document.getElementById('myModalAuth');
//                               if (authModal) {
//                                 authModal.classList.remove('show');
//                                 authModal.classList.add('hide');
//                                 console.log('[modal] Modal closed after login');
//                               }
//                               window.dispatchEvent(new CustomEvent('user-logged-in', { detail: { email: data.email } }));
//                             }
//                           } catch (error) {
//                             console.error('[modal] Login error:', error);
//                           }
//                         }
//                       });
//                     }
//                   }, 0);
//                 } else {
//                   // User does not exist, show signup form
//                   console.log('[modal] Email not found, rendering signup form for:', email);
//                   authForm.innerHTML = `
//                     <form id="signup-form">
//                       <input type="text" id="username" placeholder="Username" required />
//                       <input type="password" id="password" placeholder="Password" required />
//                       <button type="submit" id="signup-submit">Sign Up</button>
//                     </form>
//                   `;
//                   // Attach signup form submit event after DOM update
//                   setTimeout(() => {
//                     const signupForm = document.getElementById('signup-form');
//                     if (signupForm) {
//                       signupForm.addEventListener('submit', async (event) => {
//                         event.preventDefault();
//                         const username = document.getElementById('username').value;
//                         const password = document.getElementById('password').value;
//                         console.log('[modal] Signup form submitted. Email:', email, 'Username:', username, 'Password:', password);
//                         try {
//                           const response = await fetch('http://localhost:4000/signup', {
//                             method: 'POST',
//                             headers: {
//                               'Content-Type': 'application/json'
//                             },
//                             body: JSON.stringify({ email, password }) // Match server endpoint which only expects email and password
//                           });
//                           if (!response.ok) {
//                             const errorData = await response.json();
//                             console.error('[modal] Signup failed:', errorData);
//                             throw new Error(errorData.message || 'Signup failed');
//                           }
//                           const data = await response.json();
//                           console.log('[modal] Signup response:', data);
//                           if (data.accessToken && data.refreshToken) {
//                             localStorage.setItem('accessToken', data.accessToken);
//                             localStorage.setItem('refreshToken', data.refreshToken);
//                             localStorage.setItem('userEmail', email); // Store email for header display
                            
//                             // Close modal
//                             const authModal = document.getElementById('myModalAuth');
//                             if (authModal) {
//                               authModal.classList.remove('show');
//                               authModal.classList.add('hide');
//                               console.log('[modal] Modal closed after signup');
//                             }
                            
//                             // Trigger event to update UI
//                             window.dispatchEvent(new CustomEvent('user-logged-in', { 
//                               detail: { email: email } 
//                             }));
//                           }
//                         } catch (error) {
//                           console.error('[modal] Signup error:', error);
//                           // Optionally show error to user
//                           // You could add a div with id="signup-error" and set its text here
//                         }
//                       });
//                     }
//                   }, 0);
//                 }
//               }
//             } catch (error) {
//               console.error('[modal] Email check error:', error);
//             }
//           }
//         });
//       }
//     } else {
//       console.log('auth-form element not found');
//     }
  
//     // Modal close button logic
//     document.addEventListener('click', (event) => {
//       const authModal = document.getElementById('myModalAuth');
//       if (!authModal) return;
      
//       // Handle close clicks (on background or close button)
//       if (event.target.classList.contains('modal-close') || 
//           event.target === authModal || 
//           event.target.closest('.modal-close')) {
//         authModal.classList.remove('show');
//         authModal.classList.add('hide');
//         console.log('[modal] Modal closed by click');
//       } 
//       // Handle open clicks from any button that should open the modal
//       else if (event.target.matches('#auth-btn') || 
//                event.target.matches('#btn-login') ||
//                event.target.closest('#auth-btn') || 
//                event.target.closest('#btn-login')) {
//         authModal.classList.remove('hide');
//         authModal.classList.add('show');
//         console.log('[modal] Modal opened by button click');
//       }
//     });
//   };
//   //  const after_render = async () => {
//   //   const accountForm = document.getElementById('account-form');
//   //   if (accountForm) {
//   //     console.log('account-form element found');
//   //     accountForm.addEventListener('submit', async (event) => {
//   //       event.preventDefault(); // This will prevent the form from submitting normally
  
//   //       const email = document.getElementById('email').value;
  
//   //       try {
//   //         const response = await fetch('http://localhost:4500/account', {
//   //           method: 'POST',
//   //           headers: {
//   //             'Content-Type': 'application/json'
//   //           },
//   //           body: JSON.stringify({ email })
//   //         });
  
//   //         if (!response.ok) throw new Error('Check user failed');
  
//   //         const data = await response.json();
  
//   //         if (data.errors) {
//   //           // Handle errors here
//   //           console.error(data.errors);
//   //         } else {
//   //           // User exists, proceed to login
//   //           if (data.user) {
//   //             accountForm.innerHTML = `
//   //               <button id="edit-email-btn">Edit Email</button>
//   //               <form id="login-form">
//   //                 <input type="password" id="password" placeholder="Password" required />
//   //                 <button type="submit">Login</button>
//   //               </form>
//   //             `;
//   //           } 
//   //           // User does not exist, proceed to signup
//   //           else {
//   //             accountForm.innerHTML = `
//   //               <button id="edit-email-btn">Edit Email</button>
//   //               <form id="signup-form">
//   //                 <input type="text" id="username" placeholder="Username" required />
//   //                 <input type="password" id="password" placeholder="Password" required />
//   //                 <button type="submit">Sign Up</button>
//   //               </form>
//   //             `;
//   //           }
//   //         }
//   //       } catch (error) {
//   //         console.error(error);
//   //       }
//   //     });
//   //   } else {
//   //     console.log('account-form element not found');
//   //   }
  
//   //   document.addEventListener('click', (event) => {
//   //     if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
//   //       document.getElementById('myModalAccount').style.display = 'none';
//   //     } else if (event.target.matches('#account-btn')) {
//   //       document.getElementById('myModalAccount').style.display = 'block';
//   //     }
//   //   });
//   // };
//   return {
//     modalAuth: modalAuth,
//     after_render: after_render
//   };
// };











// function initAuthForms() {
//   // Check for auth form elements
//   const authForm = document.getElementById('auth-form');
//   if (!authForm) {
//     console.log('No auth-form element found in the DOM');
//     return;
//   }
//   console.log('auth-form element found');

//   // Email check form
//   const emailCheckForm = document.getElementById('email-check-form');
//   if (emailCheckForm) {
//     emailCheckForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const email = document.getElementById('email-check').value;
//       console.log(`[modal] Checking email: ${email}`);
      
//       try {
//         // Check if email exists
//         const response = await fetch(`http://localhost:4000/auth`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ email }),
//         });
        
//         const data = await response.json();
        
//         if (data.userExists) {
//           console.log(`[modal] Email found, rendering login form for: ${email}`);
//           renderLoginForm(email);
//         } else {
//           console.log(`[modal] Email not found, rendering signup form for: ${email}`);
//           renderSignupForm(email);
//         }
//       } catch (error) {
//         console.error('Error checking email:', error);
//         alert('Error checking email. Please try again.');
//       }
//     });
//   }

//   // Function to render login form
//   function renderLoginForm(email) {
//     const authFormContent = document.getElementById('auth-form-content');
//     if (!authFormContent) {
//       console.error('auth-form-content element not found');
//       return;
//     }
    
//     authFormContent.innerHTML = `
//       <h2>Login</h2>
//       <form id="login-form">
//         <input type="email" id="login-email" value="${email}" readonly />
//         <input type="password" id="login-password" placeholder="Password" required />
//         <button type="submit">Login</button>
//       </form>
//       <button id="back-to-email">Back</button>
//     `;
    
//     const loginForm = document.getElementById('login-form');
//     console.log('loginForm', loginForm);
    
//     if (loginForm) {
//       loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('login-email').value;
//         const password = document.getElementById('login-password').value;
        
//         try {
//           console.log(`[modal] Attempting to login with email: ${email}`);
//           const result = await login(email, password);
//           console.log('[modal] Login successful:', result);
          
//           // Close modal
//           const modal = document.getElementById('auth-modal');
//           if (modal) modal.style.display = 'none';
          
//           // Redirect or refresh
//           window.location.reload();
//         } catch (error) {
//           console.error('Login error:', error);
//           alert('Login failed. Please check your credentials and try again.');
//         }
//       });
//     } else {
//       console.error('login-form element not found after rendering');
//     }
    
//     const backBtn = document.getElementById('back-to-email');
//     if (backBtn) {
//       backBtn.addEventListener('click', () => {
//         // Go back to email check form
//         renderEmailCheckForm();
//       });
//     }
//   }

//   // Function to render signup form
//   function renderSignupForm(email) {
//     const authFormContent = document.getElementById('auth-form-content');
//     if (!authFormContent) {
//       console.error('auth-form-content element not found');
//       return;
//     }
    
//     authFormContent.innerHTML = `
//       <h2>Sign Up</h2>
//       <form id="signup-form">
//         <input type="email" id="signup-email" value="${email}" readonly />
//         <input type="password" id="signup-password" placeholder="Password" required />
//         <input type="password" id="signup-confirm-password" placeholder="Confirm Password" required />
//         <button type="submit">Sign Up</button>
//       </form>
//       <button id="back-to-email">Back</button>
//     `;
    
//     const signupForm = document.getElementById('signup-form');
//     console.log('signupForm', signupForm);
    
//     if (signupForm) {
//       signupForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('signup-email').value;
//         const password = document.getElementById('signup-password').value;
//         const confirmPassword = document.getElementById('signup-confirm-password').value;
        
//         if (password !== confirmPassword) {
//           alert('Passwords do not match');
//           return;
//         }
        
//         try {
//           console.log(`[modal] Attempting to signup with email: ${email}`);
//           const result = await signup(email, password);
//           console.log('[modal] Signup successful:', result);
          
//           // Close modal
//           const modal = document.getElementById('auth-modal');
//           if (modal) modal.style.display = 'none';
          
//           // Redirect or refresh
//           window.location.reload();
//         } catch (error) {
//           console.error('Signup error:', error);
//           alert('Signup failed. Please try again.');
//         }
//       });
//     } else {
//       console.error('signup-form element not found after rendering');
//     }
    
//     const backBtn = document.getElementById('back-to-email');
//     if (backBtn) {
//       backBtn.addEventListener('click', () => {
//         // Go back to email check form
//         renderEmailCheckForm();
//       });
//     }
//   }

//   // Function to render email check form
//   function renderEmailCheckForm() {
//     const authFormContent = document.getElementById('auth-form-content');
//     if (!authFormContent) {
//       console.error('auth-form-content element not found');
//       return;
//     }
    
//     authFormContent.innerHTML = `
//       <h2>Enter Your Email</h2>
//       <form id="email-check-form">
//         <input type="email" id="email-check" placeholder="Email" required />
//         <button type="submit">Next</button>
//       </form>
//     `;
    
//     const emailCheckForm = document.getElementById('email-check-form');
//     if (emailCheckForm) {
//       emailCheckForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('email-check').value;
//         console.log(`[modal] Checking email: ${email}`);
        
//         try {
//           // Check if email exists
//           const response = await fetch(`http://localhost:4000/auth`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email }),
//           });
          
//           const data = await response.json();
          
//           if (data.userExists) {
//             console.log(`[modal] Email found, rendering login form for: ${email}`);
//             renderLoginForm(email);
//           } else {
//             console.log(`[modal] Email not found, rendering signup form for: ${email}`);
//             renderSignupForm(email);
//           }
//         } catch (error) {
//           console.error('Error checking email:', error);
//           alert('Error checking email. Please try again.');
//         }
//       });
//     }
//   }
// }













// //   const after_render = async () => {
// //     const accountForm = document.getElementById('account-form');
// //     if (accountForm) {
// //       console.log('account-form element found');
// //       accountForm.addEventListener('next', async (event) => {
// //         event.preventDefault(); // This will prevent the form from submitting normally

// //         const email = document.getElementById('email').value;

// //         try {
// //           const response = await fetch('http://localhost:4500/account', {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json'
// //             },
// //             body: JSON.stringify({ email })
// //           });

// //           if (!response.ok) throw new Error('Check user failed');

// //           const data = await response.json();

// //           if (data.userExists) {
// //             accountForm.innerHTML = `
// //               <button id="edit-email-btn">Edit Email</button>
// //               <form id="login-form">
// //                 <input type="password" id="password" placeholder="Password" required />
// //                 <button type="submit">Login</button>
// //               </form>
// //             `;
// //           } else {
// //             accountForm.innerHTML = `
// //               <button id="edit-email-btn">Edit Email</button>
// //               <form id="signup-form">
// //                 <input type="password" id="password" placeholder="Password" required />
// //                 <button type="submit">Sign Up</button>
// //               </form>
// //             `;
// //           }
// //         } catch (error) {
// //           console.error(error);
// //         }
// //       });
// //     } else {
// //       console.log('account-form element not found');
// //     }

// //     document.addEventListener('click', (event) => {
// //       if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
// //         document.getElementById('myModalAccount').style.display = 'none';
// //       } else if (event.target.matches('#account-btn')) {
// //         document.getElementById('myModalAccount').style.display = 'block';
// //       }
// //     });
// //   });

// //   return {
// //     modalAccount: modalAccount,
// //     after_render: after_render
// //   };
// // };








// //   const after_render = async () => {
// //     const accountForm = document.getElementById('account-form');
// //     const emailInput = document.getElementById('email');
// //     const nextButton = document.getElementById('next');
// //     if (accountForm) {
// //       console.log('account-form element found');

// //       nextButton.addEventListener('click', async (event) => {
// //         event.preventDefault();
      
// //         const email = emailInput.value;
// //         try {
// //           const userExists = await User.findOne({username: req.body.username});
// //           const emailExists = await User.findOne({email: req.body.email});
// //           if (usernameExists && emailExists) return res.status(400).send("Username and email already taken");
// //           if (emailExists) return res.status(400).send("Email already taken");
  
// //           const response = await fetch('http://localhost:6000/account', {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json'
// //             },
// //             body: JSON.stringify({ email })
// //           });

// //           if (!response.ok) throw new Error('Check user failed');

// //           const data = await response.json();

// //           if (data.userExists) {
// //             accountForm.innerHTML = `
// //               <button id="edit-email-btn">Edit Email</button>
// //               <form id="login-form">
// //                 <input type="password" id="password" placeholder="Password" required />
// //                 <button type="submit">Login</button>
// //               </form>
// //             `;
// //           } else {
// //             accountForm.innerHTML = `
// //               <button id="edit-email-btn">Edit Email</button>
// //               <form id="signup-form">
// //                 <input type="password" id="password" placeholder="Password" required />
// //                 <button type="submit">Sign Up</button>
// //               </form>
// //             `;
// //           }
// //         } catch (error) {
// //           console.error(error);
// //         }
// //       });
// //     } else {
// //       console.log('account-form element not found');
// //     }

// //     document.addEventListener('click', (event) => {
// //       if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
// //         document.getElementById('myModalAccount').style.display = 'none';
// //       } else if (event.target.matches('#account-btn')) {
// //         document.getElementById('myModalAccount').style.display = 'block';
// //       }
// //     });
// //   });

// //   return {
// //     modalAccount: modalAccount,
// //     after_render: after_render
// //   };
// // };












//   // const after_render = async () => {
//   //   const accountForm = document.getElementById('account-form');
//   //   const emailInput = document.getElementById('email');
//   //   const nextButton = document.getElementById('next');
//   //   if (accountForm) {
//   //     console.log('account-form element found');

//   //     nextButton.addEventListener('click', async (event) => {
//   //       event.preventDefault();
      
//   //       const email = emailInput.value;
//   //       try {
//   //         const response = await fetch('http://localhost:6000/check-email', {
//   //           method: 'GET', // Change this to a GET request
//   //           headers: {
//   //             'Content-Type': 'application/json'
//   //           },
//   //           body: JSON.stringify({ email })
//   //         });
      
//   //         if (!response.ok) throw new Error('Check email failed');
      
//   //         const { emailExists } = await response.json();
      
//   //         if (emailExists) {
//   //           // Implement the logic from loginscreen file here
//   //           accountForm.innerHTML = `
//   //             <p>Email already taken</p>
//   //             <button id="edit-email-btn">Edit Email</button>
//   //             <form id="login-form">
//   //               <input type="password" id="password" placeholder="Password" required />
//   //               <button type="submit">Login</button>
//   //             </form>
//   //           `;
//   //         } else {
//   //           // Implement the logic from signupscreen file here
//   //           accountForm.innerHTML = `
//   //             <button id="edit-email-btn">Edit Email</button>
//   //             <form id="signup-form">
//   //               <input type="password" id="password" placeholder="Password" required />
//   //               <button type="submit">Sign Up</button>
//   //             </form>
//   //           `;
//   //         }
//   //       } catch (error) {
//   //         console.error(error);
//   //       }
//   //     });
      
      









// // export const modalAccount = () => {
// //   const modalAccountHTML = () => `
// //     <div class="account-header">
// //       <div class="account-headline">
// //         <fieldset class="step-hide">
// //           <div class="title">
// //             <span class="header06">
// //               Log in or create an account
// //             </span>
// //           </div>
// //           <div class="form-container">
// //             <span class="text02 medium">
// //               Enter your email
// //             </span>
// //              <form id="account-form">
             
// //               <input type="email" id="email" name="email" placeholder="Email" required>
// //               <button type="next" id="next" name="next">Next</button>
// //             </form>
// //           </div>
// //         </fieldset>
// //       </div>
// //     </div>
// //   `;

// //   const modalAccountDom = modalAccountHTML();

// //   const modalAccount = `
// //   <button id="account-btn">Account</button>
// //   <div id="myModalAccount" class="modal">
// //     <div class="modal-content">
// //       <span class="modal-close">&times;</span>
// //       <div class="gallery mediaGallery">
// //         ${modalAccountDom}
// //       </div>
// //     </div>
// //   </div>
// // `;

// //   const after_render = async () => {
// //     const accountForm = document.getElementById('account-form');
// //     if (accountForm) {
// //       console.log('account-form element found');
// //       accountForm.addEventListener('submit', async (event) => {
// //         event.preventDefault(); // Add this line

// //         const email = document.getElementById('email').value;

// //         try {
// //           const response = await fetch('http://localhost:6000/account', {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json'
// //             },
// //             body: JSON.stringify({ email })
// //           });

// //           if (!response.ok) throw new Error('Check user failed');

// //           const data = await response.json();

// //           if (data.userExists) {
// //             accountForm.innerHTML = `
// //               <button id="edit-email-btn">Edit Email</button>
// //               <form id="login-form">
// //                 <input type="password" id="password" placeholder="Password" required />
// //                 <button type="submit">Login</button>
// //               </form>
// //             `;
// //           } else {
// //             accountForm.innerHTML = `
// //               <button id="edit-email-btn">Edit Email</button>
// //               <form id="signup-form">
// //                 <input type="password" id="password" placeholder="Password" required />
// //                 <button type="submit">Sign Up</button>
// //               </form>
// //             `;
// //           }
// //         } catch (error) {
// //           console.error(error);
// //         }
// //       });
// //     } else {
// //       console.log('account-form element not found');
// //     }

// //     document.addEventListener('click', (event) => {
// //       if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
// //         document.getElementById('myModalAccount').style.display = 'none';
// //       } else if (event.target.matches('#account-btn')) {
// //         document.getElementById('myModalAccount').style.display = 'block';
// //       }
// //     });
// //   };

// //   return {
// //     modalAccount: modalAccount,
// //     after_render: after_render
// //   };
// // }












// window.addEventListener('user-logged-in', (e) => {
//   // You can re-render the header or just update the relevant DOM
//   // For example, reload the page or call your header render logic
//   location.reload(); // simplest way, or call your header update function
// });