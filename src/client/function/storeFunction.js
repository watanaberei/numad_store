// src/components/store/storeFunction.js
import userApi from '../API/userApi.js';

// Store interaction component
export const storeOperations = {
  
  // Check in to a store
  async checkIn(storeId) {
    console.log('[StoreOps] Checking in to store:', storeId);
    
    try {
      // Check if user is authenticated
      if (!userApi.isAuthenticated()) {
        console.log('[StoreOps] User not authenticated, opening login modal');
        // Open login modal
        if (window.auth) {
          window.auth.openAuthModal('login');
        }
        return false;
      }
      
      // Perform check-in
      const result = await userApi.checkInToStore(storeId);
      console.log('[StoreOps] Check-in successful:', result);
      
      // Update UI
      updateCheckInButton(storeId, true);
      
      // Show success message
      if (result.storeInfo) {
        showNotification(`Checked in to ${result.storeInfo.storeName}!`);
      }
      
      return true;
      
    } catch (error) {
      console.error('[StoreOps] Check-in error:', error);
      showNotification('Error checking in. Please try again.', 'error');
      return false;
    }
  },
  
  // Check out from a store
  async checkOut(storeId) {
    console.log('[StoreOps] Checking out from store:', storeId);
    
    try {
      const result = await userApi.checkOutFromStore(storeId);
      console.log('[StoreOps] Check-out successful:', result);
      
      // Update UI
      updateCheckInButton(storeId, false);
      
      // Show success message
      showNotification('Checked out successfully!');
      
      return true;
      
    } catch (error) {
      console.error('[StoreOps] Check-out error:', error);
      showNotification('Error checking out. Please try again.', 'error');
      return false;
    }
  },
  
  // Get current check-in status
  async getStatus() {
    try {
      const status = await userApi.getCheckinStatus();
      console.log('[StoreOps] Current check-in status:', status);
      return status;
    } catch (error) {
      console.error('[StoreOps] Error getting status:', error);
      return null;
    }
  },
  
  // Add impression (like/dislike)
  async addImpression(storeId, sectionId, action) {
    console.log('[StoreOps] Adding impression:', { storeId, sectionId, action });
    
    try {
      if (!userApi.isAuthenticated()) {
        console.log('[StoreOps] User not authenticated, opening login modal');
        if (window.auth) {
          window.auth.openAuthModal('login');
        }
        return false;
      }
      
      const result = await userApi.addStoreImpression(storeId, sectionId, action);
      console.log('[StoreOps] Impression added:', result);
      
      // Update UI with new counts
      updateImpressionUI(sectionId, result.likes, result.dislikes, action);
      
      return true;
      
    } catch (error) {
      console.error('[StoreOps] Impression error:', error);
      showNotification('Error adding reaction. Please try again.', 'error');
      return false;
    }
  },
  
  // Initialize store interaction buttons
  initializeButtons(storeId) {
    console.log('[StoreOps] Initializing buttons for store:', storeId);
    
    // Check-in button
    const checkInBtn = document.querySelector(`[data-checkin-store="${storeId}"]`);
    if (checkInBtn) {
      checkInBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const isCheckedIn = checkInBtn.classList.contains('checked-in');
        if (isCheckedIn) {
          await this.checkOut(storeId);
        } else {
          await this.checkIn(storeId);
        }
      });
    }
    
    // Like/Dislike buttons
    const impressionBtns = document.querySelectorAll(`[data-impression-store="${storeId}"]`);
    impressionBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const sectionId = btn.getAttribute('data-section-id');
        const action = btn.getAttribute('data-action'); // 'like' or 'dislike'
        
        await this.addImpression(storeId, sectionId, action);
      });
    });
    
    // Check current status on load
    this.updateCurrentStatus(storeId);
  },
  
  // Update UI based on current check-in status
  async updateCurrentStatus(storeId) {
    try {
      const status = await this.getStatus();
      if (status && status.checkedInStore === storeId) {
        updateCheckInButton(storeId, true);
      }
    } catch (error) {
      console.error('[StoreOps] Error updating status:', error);
    }
  }
};

// UI Helper functions
function updateCheckInButton(storeId, isCheckedIn) {
  const btn = document.querySelector(`[data-checkin-store="${storeId}"]`);
  if (btn) {
    if (isCheckedIn) {
      btn.classList.add('checked-in');
      btn.textContent = 'Check Out';
      btn.innerHTML = '<i class="icon-check"></i> Checked In';
    } else {
      btn.classList.remove('checked-in');
      btn.textContent = 'Check In';
      btn.innerHTML = '<i class="icon-location"></i> Check In';
    }
  }
}

function updateImpressionUI(sectionId, likes, dislikes, userAction) {
  const likeBtn = document.querySelector(`[data-section-id="${sectionId}"][data-action="like"]`);
  const dislikeBtn = document.querySelector(`[data-section-id="${sectionId}"][data-action="dislike"]`);
  
  if (likeBtn) {
    const likeCount = likeBtn.querySelector('.count');
    if (likeCount) likeCount.textContent = likes;
    
    // Update active state
    if (userAction === 'like') {
      likeBtn.classList.add('active');
      dislikeBtn?.classList.remove('active');
    }
  }
  
  if (dislikeBtn) {
    const dislikeCount = dislikeBtn.querySelector('.count');
    if (dislikeCount) dislikeCount.textContent = dislikes;
    
    // Update active state
    if (userAction === 'dislike') {
      dislikeBtn.classList.add('active');
      likeBtn?.classList.remove('active');
    }
  }
}

function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Export for use in store screens
export default storeOperations;