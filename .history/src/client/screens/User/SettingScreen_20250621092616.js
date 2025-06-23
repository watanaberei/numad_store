///////////////////////// START FIXED SETTING SCREEN /////////////////////////
// src/screens/User/SettingScreen.js - FIXED with proper auth server integration

import { parseRequestUrl } from '../../utils/utils.js';

// API Configuration - FIXED: Using correct auth server port
const AUTHSERVER_URL = 'http://localhost:4000';  // Authentication server

const SettingScreen = {
  render: async () => {
    console.log('[SettingScreen] Starting render...');
    
    // Get username from request or localStorage
    const username = SettingScreen.request?.username || localStorage.getItem('username');
    
    console.log('[SettingScreen] Username:', username);
    
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('[SettingScreen] No access token, redirecting to login');
      window.location.href = '/login';
      return '<div>Please log in to access settings</div>';
    }
    
    // Check if user is accessing their own settings
    const currentUsername = localStorage.getItem('username');
    if (username !== currentUsername) {
      console.log('[SettingScreen] User trying to access another user\'s settings, redirecting');
      window.location.href = `/@${currentUsername}/setting`;
      return '<div>Redirecting to your settings...</div>';
    }
    
    console.log('[SettingScreen] Loading settings for user:', username);
    
    // Try to get user settings from auth server
    let settings = {};
    try {
      console.log('[SettingScreen] Fetching user settings from auth server...');
      
      const response = await fetch(`${AUTHSERVER_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        settings = await response.json();
        console.log('[SettingScreen] Settings loaded successfully:', Object.keys(settings));
      } else {
        console.error('[SettingScreen] Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('[SettingScreen] Error fetching user settings:', error);
    }
    
    return `
    <div class="main">
      <div class="auth-container settings-detail">
        <div class="settings-container">
          <section class="settings-hero">
            <div class="settings-headline">
              <div class="settings-header">
                <div class="title">
                  <span class="header06">Settings</span>
                  <a href="/@${username}" class="btn-back-to-profile">
                    <i class="icon-arrow-left"></i> Back to Profile
                  </a>
                </div>
                <div class="settings-sections">
                  <!-- Profile Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Profile Information</h3>
                    <form id="update-profile-form" class="form-container">
                      <div class="form-row">
                        <div class="input-group">
                          <label for="firstName">First Name</label>
                          <input type="text" id="firstName" placeholder="First Name" value="${settings.firstName || ''}" />
                        </div>
                        <div class="input-group">
                          <label for="lastName">Last Name</label>
                          <input type="text" id="lastName" placeholder="Last Name" value="${settings.lastName || ''}" />
                        </div>
                      </div>
                      
                      <div class="input-group">
                        <label for="fullName">Display Name</label>
                        <input type="text" id="fullName" placeholder="Full Name" value="${settings.fullName || settings.additionalName || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="birthdate">Birthdate</label>
                        <input type="date" id="birthdate" value="${settings.birthdate ? new Date(settings.birthdate).toISOString().split('T')[0] : ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="description">Bio</label>
                        <textarea id="description" placeholder="Tell us about yourself" rows="4">${settings.description || settings.overview || ''}</textarea>
                      </div>
                      
                      <div class="input-group">
                        <label for="headline">Headline</label>
                        <input type="text" id="headline" placeholder="Professional headline" value="${settings.headline || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="profession">Profession</label>
                        <input type="text" id="profession" placeholder="Your profession" value="${settings.profession || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="industry">Industry</label>
                        <input type="text" id="industry" placeholder="Your industry" value="${settings.industry || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" placeholder="Company name" value="${settings.company || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="location">Location</label>
                        <input type="text" id="location" placeholder="City, Country" value="${settings.location || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="website">Website</label>
                        <input type="url" id="website" placeholder="https://example.com" value="${settings.website || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" placeholder="+1 (555) 123-4567" value="${settings.phoneNumber || ''}" />
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Profile</button>
                    </form>
                  </div>
                  
                  <!-- Account Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Account Settings</h3>
                    <form id="update-account-form" class="form-container">
                      <div class="input-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" value="${settings.username || ''}" disabled />
                        <p class="help-text text01">Username cannot be changed</p>
                      </div>
                      
                      <div class="input-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" value="${settings.email || ''}" />
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Account</button>
                    </form>
                  </div>
                  
                  <!-- Privacy Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Privacy Settings</h3>
                    <form id="update-privacy-form" class="form-container">
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="profilePublic" ${(settings.profilePrivacy !== 'private') ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Public Profile</span>
                        </label>
                        <p class="help-text text01">Allow others to view your profile</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="showActivity" ${(settings.profileVisibility?.activity !== 'private') ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Show Activity</span>
                        </label>
                        <p class="help-text text01">Display your recent activity on your profile</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="emailNotifications" ${settings.emailNotifications !== false ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Email Notifications</span>
                        </label>
                        <p class="help-text text01">Receive email updates about your account</p>
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Privacy Settings</button>
                    </form>
                  </div>
                  
                  <!-- Danger Zone -->
                  <div class="settings-section danger-zone">
                    <h3 class="section-title text03 danger">Danger Zone</h3>
                    <div class="danger-actions">
                      <button id="delete-account-btn" class="btn-danger">Delete Account</button>
                      <p class="help-text text01">Once you delete your account, there is no going back.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    `;
  },
  
  after_render: async () => {
    console.log('[SettingScreen] Starting after_render...');
    
    // Get username and token
    const username = SettingScreen.request?.username || localStorage.getItem('username');
    const accessToken = localStorage.getItem('accessToken');
    
    console.log('[SettingScreen] Setting up form handlers for:', username);
    
    // FIXED: Profile form handler using auth server
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {
      updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen] Profile form submitted');
        
        const profileData = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          fullName: document.getElementById('fullName').value,
          birthdate: document.getElementById('birthdate').value,
          description: document.getElementById('description').value,
          headline: document.getElementById('headline').value,
          profession: document.getElementById('profession').value,
          industry: document.getElementById('industry').value,
          company: document.getElementById('company').value,
          location: document.getElementById('location').value,
          website: document.getElementById('website').value,
          phoneNumber: document.getElementById('phoneNumber').value
        };

        console.log('[SettingScreen] Updating profile with:', Object.keys(profileData));

        try {
          const response = await fetch(`${AUTHSERVER_URL}/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(profileData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen] Profile updated successfully:', result);
            showNotification('Profile updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen] Profile update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update profile');
          }
        } catch (error) {
          console.error('[SettingScreen] Error updating profile:', error);
          showNotification('Failed to update profile: ' + error.message, 'error');
        }
      });
    }
    
    // FIXED: Account form handler using auth server  
    const updateAccountForm = document.getElementById('update-account-form');
    if (updateAccountForm) {
      updateAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen] Account form submitted');
        
        const accountData = {
          email: document.getElementById('email').value
        };

        console.log('[SettingScreen] Updating account with:', Object.keys(accountData));

        try {
          const response = await fetch(`${AUTHSERVER_URL}/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(accountData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen] Account updated successfully:', result);
            showNotification('Account updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen] Account update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update account');
          }
        } catch (error) {
          console.error('[SettingScreen] Error updating account:', error);
          showNotification('Failed to update account: ' + error.message, 'error');
        }
      });
    }
    
    // FIXED: Privacy form handler using auth server
    const updatePrivacyForm = document.getElementById('update-privacy-form');
    if (updatePrivacyForm) {
      updatePrivacyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen] Privacy form submitted');
        
        const privacyData = {
          profilePrivacy: document.getElementById('profilePublic').checked ? 'public' : 'private',
          profileVisibility: {
            activity: document.getElementById('showActivity').checked ? 'public' : 'private',
            places: document.getElementById('showActivity').checked ? 'public' : 'private',
            posts: document.getElementById('showActivity').checked ? 'public' : 'private'
          },
          emailNotifications: document.getElementById('emailNotifications').checked
        };

        console.log('[SettingScreen] Updating privacy with:', privacyData);

        try {
          const response = await fetch(`${AUTHSERVER_URL}/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(privacyData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen] Privacy updated successfully:', result);
            showNotification('Privacy settings updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen] Privacy update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update privacy settings');
          }
        } catch (error) {
          console.error('[SettingScreen] Error updating privacy settings:', error);
          showNotification('Failed to update privacy settings: ' + error.message, 'error');
        }
      });
    }
    
    // Delete account handler
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', async () => {
        console.log('[SettingScreen] Delete account button clicked');
        
        const confirmed = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
        
        if (confirmed) {
          const doubleConfirmed = confirm(`This will permanently delete all your data, including:\n- Your profile\n- All your blog posts\n- All your comments\n- All your saved stores\n\nType your username (${username}) to confirm.`);
          
          if (doubleConfirmed) {
            const enteredUsername = prompt(`Please type your username (${username}) to confirm deletion:`);
            
            if (enteredUsername === username) {
              try {
                console.log('[SettingScreen] Attempting to delete account...');
                
                // TODO: Implement delete account endpoint in auth server
                const response = await fetch(`${AUTHSERVER_URL}/delete-account`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  }
                });
                
                if (response.ok) {
                  alert('Your account has been deleted.');
                  localStorage.clear();
                  window.location.href = '/';
                } else {
                  throw new Error('Failed to delete account');
                }
              } catch (error) {
                console.error('[SettingScreen] Error deleting account:', error);
                showNotification('Failed to delete account: ' + error.message, 'error');
              }
            } else {
              showNotification('Username did not match. Account deletion cancelled.', 'warning');
            }
          }
        }
      });
    }
    
    console.log('[SettingScreen] All form handlers set up successfully');
    
    // Notification helper
    function showNotification(message, type = 'info') {
      console.log(`[SettingScreen] Showing notification: ${type} - ${message}`);
      
      // Remove any existing notifications
      const existingNotification = document.querySelector('.notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      
      // Create new notification
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      
      // Add to page
      document.body.appendChild(notification);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }
}

export default SettingScreen;

///////////////////////// END FIXED SETTING SCREEN /////////////////////////