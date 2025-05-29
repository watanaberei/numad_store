// src/client/styles/cmsStyle.js

export const cmsStyle = `
.store-search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
  }
  
  .store-result {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }
  
  .store-result:hover {
    background-color: #f5f5f5;
  }
  
  .store-name {
    font-weight: bold;
    display: block;
  }
  
  .store-location {
    font-size: 0.9em;
    color: #666;
  }
  
  .store-preview {
    margin-top: 15px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .linked-store {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .btn-remove-store {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #888;
  }
  
  /* Modal */
  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 100;
    overflow: auto;
  }
  
  .modal-content {
    background-color: white;
    margin: 10% auto;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    position: relative;
  }
  
  .modal-close {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 24px;
    cursor: pointer;
    color: #888;
  }
  
  .block-types-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-top: 20px;
  }
  
  .block-type {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .block-type:hover {
    background-color: #f5f5f5;
    transform: translateY(-2px);
  }
  
  .block-type-icon {
    font-size: 24px;
    margin-bottom: 10px;
    color: #0056b3;
  }
  
  /* Helper classes */
  .hidden {
    display: none;
  }
  
  /* Auto-save indicator */
  .autosave-indicator {
    background-color: #4CAF50;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 14px;
    position: absolute;
    bottom: -30px;
    right: 0;
    animation: fadeOut 3s ease-in-out;
  }
  
  @keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
    
`;

const cmsStyleElement = document.createElement('style');
cmsStyleElement.textContent = cmsStyle + TempBlogStyle;
document.head.appendChild(cmsStyleElement);
