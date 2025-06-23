import { accordion } from '../accordionStyle.js';


export const userProfile = `
/* Loading and Error States */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    min-height: 300px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    min-height: 300px;
    text-align: center;
  }
  
  .error-message h2 {
    color: #dc3545;
    margin-bottom: 1rem;
  }
  
  .btn-back {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    margin-top: 1rem;
    transition: background-color 0.2s;
  }
  
  .btn-back:hover {
    background-color: #0056b3;
  }
  
  /* Profile Container */
  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Profile Header Section */
  .profile-header-section {
    position: relative;
    margin-bottom: 2rem;
  }
  
  .profile-cover {
    position: relative;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: -60px;
  }
  
  .cover-image {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .cover-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .profile-header-content {
    position: relative;
    z-index: 2;
    padding: 0 2rem;
  }
  
  /* Profile Avatar */
  .profile-avatar {
    position: relative;
    margin-bottom: 1rem;
  }
  
  .avatar-container {
    position: relative;
    display: inline-block;
  }
  
  .avatar-placeholder,
  .avatar-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid white;
    background-color: #007bff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  
  .avatar-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-text {
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
  }
  
  .avatar-edit-btn {
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #007bff;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .avatar-edit-btn:hover {
    background-color: #0056b3;
  }
  
  /* Profile Info */
  .profile-info {
    flex: 1;
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .profile-identity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .profile-username {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: #333;
  }
  
  .verified-badge {
    color: #007bff;
    font-size: 1.2rem;
  }
  
  .profile-fullname {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.5rem 0;
    color: #555;
  }
  
  .profile-headline {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0.5rem 0;
    color: #666;
  }
  
  .profile-description {
    font-size: 1rem;
    line-height: 1.5;
    margin: 1rem 0;
    color: #666;
  }
  
  /* Professional Info */
  .profile-professional {
    margin: 1rem 0;
  }
  
  .professional-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
    color: #666;
  }
  
  .professional-item i {
    width: 16px;
    color: #007bff;
  }
  
  /* Profile Meta */
  .profile-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.9rem;
  }
  
  .meta-item i {
    width: 14px;
    color: #007bff;
  }
  
  .meta-item a {
    color: #007bff;
    text-decoration: none;
  }
  
  .meta-item a:hover {
    text-decoration: underline;
  }
  
  /* Profile Actions */
  .profile-actions {
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }
  
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #0056b3;
  }
  
  .btn-secondary {
    background-color: white;
    color: #007bff;
    border: 1px solid #007bff;
  }
  
  .btn-secondary:hover {
    background-color: #f8f9fa;
  }
  
  /* Stats Section */
  .profile-stats-section {
    background-color: white;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 2rem;
  }
  
  .stat-item {
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .stat-item:hover {
    transform: translateY(-2px);
  }
  
  .stat-number {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #007bff;
  }
  
  .stat-label {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.25rem;
  }
  
  /* Profile Edit Section */
  .profile-edit-section {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
    overflow: hidden;
  }
  
  .edit-container {
    padding: 2rem;
  }
  
  .edit-header {
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .edit-header h3 {
    margin: 0;
    color: #333;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .btn-close:hover {
    background-color: #f8f9fa;
    color: #333;
  }
  
  .profile-edit-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  }
  
  .form-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  /* Tabs Section */
  .profile-tabs-section {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
    overflow: hidden;
  }
  
  .tabs-container {
    padding: 0;
  }
  
  .profile-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
  }
  
  .tab-btn {
    flex: 1;
    padding: 1rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #666;
    font-weight: 500;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
  }
  
  .tab-btn:hover {
    background-color: #f8f9fa;
    color: #333;
  }
  
  .tab-btn.active {
    color: #007bff;
    border-bottom-color: #007bff;
    background-color: #f8f9fa;
  }
  
  .tab-btn i {
    width: 16px;
  }
  
  .tab-filters {
    padding: 1rem 1.5rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eee;
  }
  
  .filter-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
  }
  
  .btn-clear {
    padding: 0.5rem 1rem;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-clear:hover {
    background-color: #545b62;
  }
  
  /* Content Section */
  .profile-content-section {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .tab-content {
    display: none;
    padding: 2rem;
  }
  
  .tab-content.active {
    display: block;
  }
  
  .content-container {
    max-width: 100%;
  }
  
  /* Places Categories */
  .places-categories {
    margin-bottom: 2rem;
  }
  
  .category-nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  
  .category-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background-color: white;
    color: #666;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }
  
  .category-btn:hover {
    background-color: #f8f9fa;
    color: #333;
  }
  
  .category-btn.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  /* Activity Feed */
  .activity-feed {
    space-y: 1rem;
  }
  
  .activity-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 1rem;
    transition: box-shadow 0.2s;
  }
  
  .activity-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .activity-item.current-checkin {
    border-color: #007bff;
    background-color: #f8f9ff;
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #007bff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .activity-content {
    flex: 1;
  }
  
  .activity-content h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
    font-size: 1rem;
  }
  
  .activity-content p {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .activity-time {
    color: #999;
    font-size: 0.8rem;
  }
  
  /* Places Grid */
  .places-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  /* Posts Grid */
  .posts-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
  
  /* Empty and Error States */
  .empty-state,
  .error-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }
  
  .error-state {
    color: #dc3545;
  }
  
  .loading-placeholder {
    text-align: center;
    padding: 2rem 1rem;
    color: #666;
  }
  
  /* Store Card Fallback */
  .store-card-fallback {
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #f8f9fa;
  }
  
  .store-card-fallback h5 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
  
  .store-card-fallback p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .profile-container {
      padding: 0 0.5rem;
    }
    
    .profile-header-content {
      padding: 0 1rem;
    }
    
    .profile-tabs {
      flex-direction: column;
    }
    
    .tab-btn {
      justify-content: flex-start;
      padding: 0.75rem 1rem;
    }
    
    .stats-container {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    
    .profile-edit-form {
      grid-template-columns: 1fr;
    }
    
    .filter-group {
      flex-direction: column;
      align-items: stretch;
    }
    
    .places-grid {
      grid-template-columns: 1fr;
    }
    
    .posts-content {
      grid-template-columns: 1fr;
    }
    
    .profile-actions {
      flex-direction: column;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
  
  @media (max-width: 480px) {
    .avatar-placeholder,
    .avatar-image {
      width: 80px;
      height: 80px;
    }
    
    .avatar-text {
      font-size: 1.8rem;
    }
    
    .profile-username {
      font-size: 1.5rem;
    }
    
    .profile-fullname {
      font-size: 1.2rem;
    }
    
    .stats-container {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .stat-number {
      font-size: 1.5rem;
    }
    
    .profile-meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  
  ///////////////////////// END PROFILE SCREEN STYLES /////////////////////////
  `


// Apply hero styles to the document
const profileStyle = document.createElement("style");
profileStyle.textContent = userProfile;
document.head.appendChild(profileStyle);