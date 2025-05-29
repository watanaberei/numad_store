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

export const cmsPageStyle = `
  /* src/client/styles/blog-cms.css */

/* General Styles */
.post-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.post-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* Toolbar */
.post-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e1e4e8;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
}

.btn-toolbar {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e4e8;
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.btn-toolbar:hover {
  background-color: #eaeef2;
}

.btn-primary {
  background-color: #0366d6;
  color: white;
  border-color: #0366d6;
}

.btn-primary:hover {
  background-color: #0256b9;
  border-color: #0256b9;
}

/* Template Selection */
.template-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin: 1rem auto;
  max-width: 1000px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-options {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.template-option {
  width: 300px;
  border: 2px solid #e1e4e8;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.template-option:hover {
  border-color: #0366d6;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-preview {
  height: 180px;
  border-radius: 6px;
  margin-bottom: 1rem;
  background-color: #f6f8fa;
}

.freestyle-preview {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="100%" height="100%" fill="%23f6f8fa"/><rect x="20" y="20" width="260" height="30" rx="4" fill="%23e1e4e8"/><rect x="20" y="60" width="260" height="10" rx="2" fill="%23e1e4e8"/><rect x="20" y="80" width="260" height="10" rx="2" fill="%23e1e4e8"/><rect x="20" y="100" width="180" height="10" rx="2" fill="%23e1e4e8"/><rect x="20" y="130" width="100" height="30" rx="4" fill="%23e1e4e8"/><rect x="130" y="130" width="150" height="30" rx="4" fill="%23e1e4e8"/></svg>');
}

.top3-preview {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="100%" height="100%" fill="%23f6f8fa"/><rect x="20" y="20" width="260" height="30" rx="4" fill="%23e1e4e8"/><rect x="20" y="60" width="50" height="20" rx="2" fill="%230366d6"/><rect x="80" y="60" width="200" height="20" rx="2" fill="%23e1e4e8"/><rect x="20" y="90" width="50" height="20" rx="2" fill="%230366d6"/><rect x="80" y="90" width="200" height="20" rx="2" fill="%23e1e4e8"/><rect x="20" y="120" width="50" height="20" rx="2" fill="%230366d6"/><rect x="80" y="120" width="200" height="20" rx="2" fill="%23e1e4e8"/><rect x="20" y="150" width="260" height="10" rx="2" fill="%23e1e4e8"/></svg>');
}

.template-name {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.template-desc {
  color: #586069;
  font-size: 0.9rem;
}

/* CMS Container */
.cms-container {
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 1rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cms-container[data-template="top3"] .freestyle-content {
  display: none;
}

.cms-container[data-template="freestyle"] .top3-content {
  display: none;
}

/* Section Styles */
.section-title {
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 0.5rem;
  margin: 2rem 0 1rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #0366d6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.3);
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Media Upload */
.media-upload-container {
  display: flex;
  flex-direction: column;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  background-color: #eaeef2;
}

.input-file {
  display: none;
}

.image-preview {
  margin-top: 1rem;
  position: relative;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #e1e4e8;
}

.btn-remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e1e4e8;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-remove-image:hover {
  background-color: #d1d5da;
}

/* Toggle Switch */
.toggle-group {
  display: flex;
  flex-direction: column;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: #ccc;
  border-radius: 20px;
  transition: .4s;
  margin-right: 10px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .toggle-slider {
  background-color: #0366d6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-label {
  font-weight: 500;
}

.toggle-group p {
  margin-top: 0.25rem;
  margin-left: 50px;
  color: #586069;
  font-size: 0.9rem;
}

/* Editor Toolbar */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.btn-add-section {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-section:hover {
  background-color: #eaeef2;
}

/* Content Sections */
.content-container {
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  min-height: 300px;
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #586069;
  text-align: center;
}

.content-section {
  position: relative;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background-color: #fff;
}

.section-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.btn-move-up, .btn-move-down, .btn-remove-section {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-move-up:hover, .btn-move-down:hover {
  background-color: #eaeef2;
}

.btn-remove-section:hover {
  background-color: #ffdce0;
  border-color: #cb2431;
}

.section-content {
  width: 100%;
  margin-top: 0.5rem;
}

/* Top 3 List Template */
.top3-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background-color: #f8f9fa;
}

.top3-item h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e1e4e8;
}

/* Store Linker */
.store-linker {
  position: relative;
}

.store-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.store-result {
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.store-result:hover {
  background-color: #f6f8fa;
}

.store-name {
  display: block;
  font-weight: 500;
}

.store-location {
  display: block;
  font-size: 0.9rem;
  color: #586069;
}

.linked-store-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background-color: #f6f8fa;
}

.linked-store {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-info {
  flex-grow: 1;
}

.btn-remove-store {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e1e4e8;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-remove-store:hover {
  background-color: #d1d5da;
}

/* Video Section */
.video-url {
  width: 75%;
  margin-right: 1rem;
}

.btn-embed-video {
  padding: 0.75rem 1rem;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  cursor: pointer;
}

.video-preview {
  margin-top: 1rem;
}

/* Quote Section */
.quote-text {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.quote-attribution {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 1rem;
}

/* Autosave Indicator */
.autosave-indicator {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #586069;
}

/* Utility Classes */
.hidden {
  display: none !important;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .cms-container {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .template-options {
    flex-direction: column;
  }
  
  .two-columns {
    grid-template-columns: 1fr;
  }
  
  .toolbar-center {
    display: none;
  }
}
`;



const cmsStyleElement = document.createElement('style');
cmsStyleElement.textContent = cmsStyle;
document.head.appendChild(cmsStyleElement);
