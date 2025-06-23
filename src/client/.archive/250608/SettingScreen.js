// src/screens/SettingScreen.js
import { getUserSettings, updateUserSettings } from '../../API/api.js';

const SettingScreen = {
  render: async () => {
    let settings = {};
    try {
      settings = await getUserSettings();
    } catch (error) {
      console.error('Error fetching user settings:', error);
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
                </div>
                <div class="form-container">
                  <span class="text02 medium">User details</span>
                  <form id="update-settings-form">
                    <input type="text" id="firstName" placeholder="First Name" value="${settings.firstName || ''}" required />
                    <input type="text" id="lastName" placeholder="Last Name" value="${settings.lastName || ''}" required />
                    <input type="date" id="birthdate" value="${settings.birthdate || ''}" required />
                    <button type="submit">Update Settings</button>
                  </form>
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
    const updateSettingsForm = document.getElementById('update-settings-form');
    updateSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const birthdate = document.getElementById('birthdate').value;

      try {
        await updateUserSettings({ firstName, lastName, birthdate });
        alert('Settings updated successfully');
      } catch (error) {
        console.error('Error updating settings:', error);
        alert('Failed to update settings');
      }
    });
  }
};

export default SettingScreen;