///////////////////////// START COMPLETE CONFIGURABLE SETTING SCREEN /////////////////////////
// src/screens/User/SettingScreen.js - Complete configurable settings with MongoDB storage

import { parseRequestUrl } from '../../utils/utils.js';

// API Configuration - Using correct server port
const AUTHSERVER_URL = 'http://localhost:4500';  // Main server port

const SettingScreen = {
  render: async () => {
    console.log('[SettingScreen.js line 9] Starting render...');
    
    // Get username from request or localStorage
    const username = SettingScreen.request?.username || localStorage.getItem('username');
    
    console.log('[SettingScreen.js line 14] Username:', username);
    
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('[SettingScreen.js line 19] No access token, redirecting to login');
      window.location.href = '/login';
      return '<div>Please log in to access settings</div>';
    }
    
    // Check if user is accessing their own settings
    const currentUsername = localStorage.getItem('username');
    if (username !== currentUsername) {
      console.log('[SettingScreen.js line 27] User trying to access another user\'s settings, redirecting');
      window.location.href = `/@${currentUsername}/setting`;
      return '<div>Redirecting to your settings...</div>';
    }
    
    console.log('[SettingScreen.js line 32] Loading settings for user:', username);
    
    // Try to get user settings from auth server
    let settings = {};
    try {
      console.log('[SettingScreen.js line 37] Fetching user settings from auth server...');
      
      const response = await fetch(`${AUTHSERVER_URL}/api/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        settings = await response.json();
        console.log('[SettingScreen.js line 48] Settings loaded successfully:', Object.keys(settings));
      } else {
        console.error('[SettingScreen.js line 50] Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('[SettingScreen.js line 53] Error fetching user settings:', error);
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
                  
                  <!-- Personal Information Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Personal Information</h3>
                    <form id="update-profile-form" class="form-container">
                      <div class="input-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" placeholder="Enter your first name" value="${settings.firstName || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" placeholder="Enter your last name" value="${settings.lastName || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="additionalName">Full Name / Display Name</label>
                        <input type="text" id="additionalName" placeholder="Enter your full display name" value="${settings.additionalName || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="birthdate">Birth Date</label>
                        <input type="date" id="birthdate" value="${settings.birthdate ? settings.birthdate.split('T')[0] : ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="gender">Gender</label>
                        <select id="gender">
                          <option value="">Select Gender</option>
                          <option value="male" ${settings.gender === 'male' ? 'selected' : ''}>Male</option>
                          <option value="female" ${settings.gender === 'female' ? 'selected' : ''}>Female</option>
                          <option value="other" ${settings.gender === 'other' ? 'selected' : ''}>Other</option>
                          <option value="prefer_not_to_say" ${settings.gender === 'prefer_not_to_say' ? 'selected' : ''}>Prefer not to say</option>
                        </select>
                      </div>
                      
                      <div class="input-group">
                        <label for="overview">Bio / About</label>
                        <textarea id="overview" placeholder="Tell us about yourself..." rows="4">${settings.overview || ''}</textarea>
                      </div>
                      
                      <div class="input-group">
                        <label for="headline">Headline</label>
                        <input type="text" id="headline" placeholder="Your professional headline" value="${settings.headline || ''}" />
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Personal Info</button>
                    </form>
                  </div>
                  
                  <!-- Professional Information Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Professional Information</h3>
                    <form id="update-professional-form" class="form-container">
                      <div class="input-group">
                        <label for="profession">Profession</label>
                        <input type="text" id="profession" placeholder="Your profession/job title" value="${settings.profession || ''}" />
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
                        <label for="website">Website</label>
                        <input type="url" id="website" placeholder="https://example.com" value="${settings.website || ''}" />
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Professional Info</button>
                    </form>
                  </div>
                  
                  <!-- Contact Information Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Contact Information</h3>
                    <form id="update-contact-form" class="form-container">
                      <div class="input-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" placeholder="+1 (555) 123-4567" value="${settings.phoneNumber || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="country">Country</label>
                        <input type="text" id="country" placeholder="Country" value="${settings.country || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="state">State/Province</label>
                        <input type="text" id="state" placeholder="State or Province" value="${settings.state || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="city">City</label>
                        <input type="text" id="city" placeholder="City" value="${settings.city || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="postalCode">Postal Code</label>
                        <input type="text" id="postalCode" placeholder="Postal Code" value="${settings.postalCode || ''}" />
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Contact Info</button>
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
                        <p class="help-text text01">Make your profile visible to everyone</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="showActivity" ${settings.profileVisibility?.activity !== 'private' ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Show Activity</span>
                        </label>
                        <p class="help-text text01">Display your recent activity on your profile</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="showPosts" ${settings.profileVisibility?.posts !== 'private' ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Show Posts</span>
                        </label>
                        <p class="help-text text01">Display your blog posts on your profile</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="showPlaces" ${settings.profileVisibility?.places !== 'private' ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Show Places</span>
                        </label>
                        <p class="help-text text01">Display your saved places on your profile</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="showReviews" ${settings.profileVisibility?.reviews !== 'private' ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Show Reviews</span>
                        </label>
                        <p class="help-text text01">Display your reviews on your profile</p>
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Privacy Settings</button>
                    </form>
                  </div>
                  
                  <!-- Notification Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Notification Settings</h3>
                    <form id="update-notification-form" class="form-container">
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="emailNotifications" ${settings.notifications?.email !== false ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Email Notifications</span>
                        </label>
                        <p class="help-text text01">Receive email updates about your account</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="pushNotifications" ${settings.notifications?.push !== false ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Push Notifications</span>
                        </label>
                        <p class="help-text text01">Receive push notifications on your device</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="followNotifications" ${settings.notifications?.follows !== false ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Follow Notifications</span>
                        </label>
                        <p class="help-text text01">Get notified when someone follows you</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="commentNotifications" ${settings.notifications?.comments !== false ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Comment Notifications</span>
                        </label>
                        <p class="help-text text01">Get notified when someone comments on your posts</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="likeNotifications" ${settings.notifications?.likes !== false ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Like Notifications</span>
                        </label>
                        <p class="help-text text01">Get notified when someone likes your content</p>
                      </div>
                      
                      <div class="toggle-group">
                        <label class="toggle">
                          <input type="checkbox" id="marketingNotifications" ${settings.notifications?.marketing === true ? 'checked' : ''}>
                          <span class="toggle-slider"></span>
                          <span class="toggle-label">Marketing Notifications</span>
                        </label>
                        <p class="help-text text01">Receive promotional emails and updates</p>
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Notification Settings</button>
                    </form>
                  </div>
                  
                  <!-- Social Media Settings -->
                  <div class="settings-section">
                    <h3 class="section-title text03">Social Media Links</h3>
                    <form id="update-social-form" class="form-container">
                      <div class="input-group">
                        <label for="twitterUrl">Twitter/X</label>
                        <input type="url" id="twitterUrl" placeholder="https://twitter.com/username" value="${settings.socialMedia?.twitter || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="linkedinUrl">LinkedIn</label>
                        <input type="url" id="linkedinUrl" placeholder="https://linkedin.com/in/username" value="${settings.socialMedia?.linkedin || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="instagramUrl">Instagram</label>
                        <input type="url" id="instagramUrl" placeholder="https://instagram.com/username" value="${settings.socialMedia?.instagram || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="facebookUrl">Facebook</label>
                        <input type="url" id="facebookUrl" placeholder="https://facebook.com/username" value="${settings.socialMedia?.facebook || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="youtubeUrl">YouTube</label>
                        <input type="url" id="youtubeUrl" placeholder="https://youtube.com/channel/..." value="${settings.socialMedia?.youtube || ''}" />
                      </div>
                      
                      <div class="input-group">
                        <label for="githubUrl">GitHub</label>
                        <input type="url" id="githubUrl" placeholder="https://github.com/username" value="${settings.socialMedia?.github || ''}" />
                      </div>
                      
                      <button type="submit" class="btn-primary">Update Social Media</button>
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
    console.log('[SettingScreen.js line 309] Starting after_render...');
    
    // Get username and token
    const username = SettingScreen.request?.username || localStorage.getItem('username');
    const accessToken = localStorage.getItem('accessToken');
    
    console.log('[SettingScreen.js line 315] Setting up form handlers for:', username);
    
    ///////////////////////// START PERSONAL INFORMATION FORM HANDLER /////////////////////////
    const updateProfileForm = document.getElementById('update-profile-form');
    if (updateProfileForm) {
      updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 323] Personal info form submitted');
        
        const profileData = {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          additionalName: document.getElementById('additionalName').value,
          birthdate: document.getElementById('birthdate').value,
          gender: document.getElementById('gender').value,
          overview: document.getElementById('overview').value,
          headline: document.getElementById('headline').value
        };

        console.log('[SettingScreen.js line 334] Updating personal info with:', Object.keys(profileData));

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/personal`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(profileData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 347] Personal info updated successfully:', result);
            showNotification('Personal information updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 351] Personal info update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update personal information');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 355] Error updating personal info:', error);
          showNotification('Failed to update personal information: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END PERSONAL INFORMATION FORM HANDLER /////////////////////////
    
    ///////////////////////// START PROFESSIONAL INFORMATION FORM HANDLER /////////////////////////
    const updateProfessionalForm = document.getElementById('update-professional-form');
    if (updateProfessionalForm) {
      updateProfessionalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 367] Professional info form submitted');
        
        const professionalData = {
          profession: document.getElementById('profession').value,
          industry: document.getElementById('industry').value,
          company: document.getElementById('company').value,
          website: document.getElementById('website').value
        };

        console.log('[SettingScreen.js line 376] Updating professional info with:', Object.keys(professionalData));

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/professional`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(professionalData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 389] Professional info updated successfully:', result);
            showNotification('Professional information updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 393] Professional info update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update professional information');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 397] Error updating professional info:', error);
          showNotification('Failed to update professional information: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END PROFESSIONAL INFORMATION FORM HANDLER /////////////////////////
    
    ///////////////////////// START CONTACT INFORMATION FORM HANDLER /////////////////////////
    const updateContactForm = document.getElementById('update-contact-form');
    if (updateContactForm) {
      updateContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 409] Contact info form submitted');
        
        const contactData = {
          phoneNumber: document.getElementById('phoneNumber').value,
          country: document.getElementById('country').value,
          state: document.getElementById('state').value,
          city: document.getElementById('city').value,
          postalCode: document.getElementById('postalCode').value
        };

        console.log('[SettingScreen.js line 419] Updating contact info with:', Object.keys(contactData));

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(contactData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 432] Contact info updated successfully:', result);
            showNotification('Contact information updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 436] Contact info update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update contact information');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 440] Error updating contact info:', error);
          showNotification('Failed to update contact information: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END CONTACT INFORMATION FORM HANDLER /////////////////////////
    
    ///////////////////////// START ACCOUNT FORM HANDLER /////////////////////////
    const updateAccountForm = document.getElementById('update-account-form');
    if (updateAccountForm) {
      updateAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 452] Account form submitted');
        
        const accountData = {
          email: document.getElementById('email').value
        };

        console.log('[SettingScreen.js line 458] Updating account with:', Object.keys(accountData));

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/account`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(accountData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 471] Account updated successfully:', result);
            showNotification('Account updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 475] Account update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update account');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 479] Error updating account:', error);
          showNotification('Failed to update account: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END ACCOUNT FORM HANDLER /////////////////////////
    
    ///////////////////////// START PRIVACY FORM HANDLER /////////////////////////
    const updatePrivacyForm = document.getElementById('update-privacy-form');
    if (updatePrivacyForm) {
      updatePrivacyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 491] Privacy form submitted');
        
        const privacyData = {
          profilePrivacy: document.getElementById('profilePublic').checked ? 'public' : 'private',
          profileVisibility: {
            activity: document.getElementById('showActivity').checked ? 'public' : 'private',
            posts: document.getElementById('showPosts').checked ? 'public' : 'private',
            places: document.getElementById('showPlaces').checked ? 'public' : 'private',
            reviews: document.getElementById('showReviews').checked ? 'public' : 'private'
          }
        };

        console.log('[SettingScreen.js line 502] Updating privacy with:', privacyData);

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/privacy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(privacyData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 515] Privacy updated successfully:', result);
            showNotification('Privacy settings updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 519] Privacy update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update privacy settings');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 523] Error updating privacy settings:', error);
          showNotification('Failed to update privacy settings: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END PRIVACY FORM HANDLER /////////////////////////
    
    ///////////////////////// START NOTIFICATION FORM HANDLER /////////////////////////
    const updateNotificationForm = document.getElementById('update-notification-form');
    if (updateNotificationForm) {
      updateNotificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 535] Notification form submitted');
        
        const notificationData = {
          notifications: {
            email: document.getElementById('emailNotifications').checked,
            push: document.getElementById('pushNotifications').checked,
            follows: document.getElementById('followNotifications').checked,
            comments: document.getElementById('commentNotifications').checked,
            likes: document.getElementById('likeNotifications').checked,
            marketing: document.getElementById('marketingNotifications').checked
          }
        };

        console.log('[SettingScreen.js line 547] Updating notifications with:', notificationData);

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(notificationData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 560] Notifications updated successfully:', result);
            showNotification('Notification settings updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 564] Notifications update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update notification settings');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 568] Error updating notifications:', error);
          showNotification('Failed to update notification settings: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END NOTIFICATION FORM HANDLER /////////////////////////
    
    ///////////////////////// START SOCIAL MEDIA FORM HANDLER /////////////////////////
    const updateSocialForm = document.getElementById('update-social-form');
    if (updateSocialForm) {
      updateSocialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('[SettingScreen.js line 580] Social media form submitted');
        
        const socialData = {
          socialMedia: {
            twitter: document.getElementById('twitterUrl').value,
            linkedin: document.getElementById('linkedinUrl').value,
            instagram: document.getElementById('instagramUrl').value,
            facebook: document.getElementById('facebookUrl').value,
            youtube: document.getElementById('youtubeUrl').value,
            github: document.getElementById('githubUrl').value
          }
        };

        console.log('[SettingScreen.js line 592] Updating social media with:', socialData);

        try {
          const response = await fetch(`${AUTHSERVER_URL}/api/settings/social`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(socialData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('[SettingScreen.js line 605] Social media updated successfully:', result);
            showNotification('Social media links updated successfully', 'success');
          } else {
            const errorData = await response.json();
            console.error('[SettingScreen.js line 609] Social media update failed:', errorData);
            throw new Error(errorData.message || 'Failed to update social media links');
          }
        } catch (error) {
          console.error('[SettingScreen.js line 613] Error updating social media:', error);
          showNotification('Failed to update social media links: ' + error.message, 'error');
        }
      });
    }
    ///////////////////////// END SOCIAL MEDIA FORM HANDLER /////////////////////////
    
    ///////////////////////// START DELETE ACCOUNT HANDLER /////////////////////////
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', async () => {
        console.log('[SettingScreen.js line 625] Delete account button clicked');
        
        const confirmed = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
        
        if (confirmed) {
          const doubleConfirmed = confirm(`This will permanently delete all your data, including:\n- Your profile\n- All your blog posts\n- All your comments\n- All your saved stores\n\nType your username (${username}) to confirm.`);
          
          if (doubleConfirmed) {
            const enteredUsername = prompt(`Please type your username (${username}) to confirm deletion:`);
            
            if (enteredUsername === username) {
              try {
                console.log('[SettingScreen.js line 639] Attempting to delete account...');
                
                const response = await fetch(`${AUTHSERVER_URL}/api/settings/delete-account`, {
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
                console.error('[SettingScreen.js line 656] Error deleting account:', error);
                showNotification('Failed to delete account: ' + error.message, 'error');
              }
            } else {
              showNotification('Username did not match. Account deletion cancelled.', 'warning');
            }
          }
        }
      });
    }
    ///////////////////////// END DELETE ACCOUNT HANDLER /////////////////////////
    
    console.log('[SettingScreen.js line 667] All form handlers set up successfully');
    
    ///////////////////////// START NOTIFICATION HELPER FUNCTION /////////////////////////
    function showNotification(message, type = 'info') {
      console.log(`[SettingScreen.js line 671] Showing notification: ${type} - ${message}`);
      
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
    ///////////////////////// END NOTIFICATION HELPER FUNCTION /////////////////////////
  }
}

export default SettingScreen;

///////////////////////// END COMPLETE CONFIGURABLE SETTING SCREEN /////////////////////////