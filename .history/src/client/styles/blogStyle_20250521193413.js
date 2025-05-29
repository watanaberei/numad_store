// src/client/styles/blogStyle.js

export const blogStyle = `

/* Main layout */
.post-screen {
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
  
  .post-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 20px;
  }
  
  .btn-toolbar {
    padding: 8px 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  
  .btn-primary {
    background: #0056b3;
    color: white;
    border-color: #0056b3;
  }
  
  /* Template selection */
  .template-selector {
    text-align: center;
    padding: 30px 0;
  }
  
  .template-options {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 20px;
  }
  
  .template-option {
    width: 250px;
    cursor: pointer;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    transition: all 0.3s ease;
  }
  
  .template-option:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .template-preview {
    height: 150px;
    border: 1px solid #eee;
    margin-bottom: 15px;
    border-radius: 4px;
    background-color: #f7f7f7;
  }
  
  .freestyle-preview {
    background-image: url('/images/templates/freestyle.jpg');
    background-size: cover;
    background-position: center;
  }
  
  .top3-preview {
    background-image: url('/images/templates/top3.jpg');
    background-size: cover;
    background-position: center;
  }
  
  /* Form elements */
  .blog-metadata-section,
  .blog-content-builder,
  .blog-settings-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .section-title {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .input-group {
    margin-bottom: 20px;
  }
  
  .input-field {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  textarea.input-field {
    min-height: 100px;
  }
  
  .two-columns {
    display: flex;
    gap: 20px;
  }
  
  .two-columns > .input-group {
    flex: 1;
  }
  
  /* Media upload */
  .media-upload-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-upload {
    padding: 10px 15px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .input-file {
    display: none;
  }
  
  .image-preview {
    margin-top: 10px;
    max-width: 300px;
    position: relative;
  }
  
  .image-preview img {
    width: 100%;
    border-radius: 4px;
  }
  
  .btn-remove-image {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background-color: rgba(0,0,0,0.5);
    color: white;
    border: none;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Toggle switch */
  .toggle-group {
    display: flex;
    align-items: center;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
    margin-right: 10px;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: #2196F3;
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(26px);
  }
  
  /* Content blocks */
  .content-blocks-container {
    min-height: 200px;
    border: 1px dashed #ccc;
    padding: 20px;
    border-radius: 8px;
    background-color: white;
  }
  
  .empty-content-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
    color: #888;
  }
  
  .empty-state-icon {
    font-size: 40px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  .add-block-container {
    text-align: center;
    margin-top: 20px;
  }
  
  .btn-add-block {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #0056b3;
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Content blocks */
  .content-block {
    position: relative;
    margin-bottom: 15px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: white;
    cursor: move;
  }
  
  .content-block.dragging {
    opacity: 0.5;
  }
  
  .block-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
  }
  
  .block-controls button {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .block-content {
    margin-top: 15px;
  }
  
  /* Specific block styles */
  .text-editor {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .heading-block .block-content {
    display: flex;
    gap: 10px;
  }
  
  .heading-level {
    width: 120px;
    padding: 8px;
  }
  
  .heading-text {
    flex: 1;
    padding: 8px;
  }
  
  .image-upload-area,
  .gallery-upload-area {
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    margin-bottom: 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .upload-placeholder {
    color: #888;
  }
  
  .upload-placeholder i {
    font-size: 30px;
    margin-bottom: 10px;
  }
  
  .gallery-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  
  .gallery-image-container {
    position: relative;
    width: 100px;
    height: 100px;
  }
  
  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .quote-text {
    width: 100%;
    min-height: 80px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .quote-attribution {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  /* Store search */
  .store-search-container {
    position: relative;
  }
  
  .store-search-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
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
}
`;

export const  TempBlogStyle = `
/* src/client/styles/blog.css */

/* ===== BLOG CMS STYLES ===== */

/* Main layout */
.post-screen {
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.post-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 30px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
}

.btn-toolbar {
  padding: 8px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-toolbar:hover {
  background-color: #f5f5f5;
}

.btn-primary {
  background: #0056b3;
  color: white;
  border-color: #0056b3;
}

.btn-primary:hover {
  background: #004494;
}

/* Template selection */
.template-selector {
  text-align: center;
  padding: 40px 0;
}

.template-options {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 30px;
}

.template-option {
  width: 280px;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  background: white;
}

.template-option:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-color: #0056b3;
}

.template-preview {
  height: 180px;
  border: 1px solid #eee;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  position: relative;
  overflow: hidden;
}

.preview-content {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-title {
  height: 12px;
  background: linear-gradient(90deg, #ddd 25%, #eee 50%, #ddd 75%);
  border-radius: 4px;
  width: 80%;
}

.preview-text {
  height: 8px;
  background: linear-gradient(90deg, #eee 25%, #f0f0f0 50%, #eee 75%);
  border-radius: 4px;
  width: 100%;
}

.preview-image {
  height: 40px;
  background: linear-gradient(90deg, #ddd 25%, #eee 50%, #ddd 75%);
  border-radius: 4px;
  width: 100%;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item {
  height: 20px;
  background: linear-gradient(90deg, #ddd 25%, #eee 50%, #ddd 75%);
  border-radius: 4px;
  width: 90%;
}

.template-name {
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}

.template-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

/* Form elements */
.blog-metadata-section,
.blog-content-builder,
.blog-settings-section {
  margin-bottom: 30px;
  padding: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fafafa;
}

.section-title {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #0056b3;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
}

textarea.input-field {
  min-height: 100px;
  resize: vertical;
}

.two-columns {
  display: flex;
  gap: 20px;
}

.two-columns > .input-group {
  flex: 1;
}

/* Media upload */
.media-upload-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-upload {
  padding: 12px 20px;
  background-color: #f8f9fa;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-upload:hover {
  background-color: #e9ecef;
  border-color: #0056b3;
}

.input-file {
  display: none;
}

.image-preview {
  margin-top: 15px;
  max-width: 300px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-preview img {
  width: 100%;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.9);
  color: #dc3545;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Toggle switch */
.toggle-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .toggle-slider {
  background-color: #0056b3;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  font-weight: 600;
  color: #333;
}

/* Content blocks */
.content-blocks-container {
  min-height: 200px;
  border: 2px dashed #ddd;
  padding: 20px;
  border-radius: 12px;
  background-color: white;
}

.empty-content-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #888;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
  color: #0056b3;
}

.add-block-container {
  text-align: center;
  margin-top: 20px;
}

.btn-add-block {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0056b3;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
  transition: all 0.2s ease;
}

.btn-add-block:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 86, 179, 0.4);
}

/* Content blocks */
.content-block {
  position: relative;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  cursor: move;
  transition: all 0.2s ease;
}

.content-block:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #0056b3;
}

.content-block.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.block-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  background: rgba(255,255,255,0.95);
  padding: 5px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.drag-handle {
  cursor: grab;
  padding: 5px;
  color: #666;
  font-weight: bold;
}

.drag-handle:active {
  cursor: grabbing;
}

.block-controls button {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.block-controls button:hover {
  background-color: #e9ecef;
}

.btn-delete-block:hover {
  background-color: #dc3545;
  color: white;
}

.block-content {
  margin-top: 40px;
}

/* Specific block styles */
.text-editor {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  line-height: 1.6;
  resize: vertical;
}

.heading-block .block-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.heading-controls {
  display: flex;
  gap: 10px;
}

.heading-level {
  width: 140px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.heading-text {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
}

.image-upload-area {
  border: 2px dashed #ddd;
  padding: 30px;
  text-align: center;
  margin-bottom: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-upload-area:hover {
  border-color: #0056b3;
  background-color: #f8f9fa;
}

.upload-placeholder {
  color: #888;
}

.upload-placeholder i {
  font-size: 36px;
  margin-bottom: 15px;
  color: #0056b3;
}

.quote-text {
  width: 100%;
  min-height: 80px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 10px;
  font-style: italic;
  resize: vertical;
}

.quote-attribution {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.content-divider {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 20px 0;
}

.divider-note {
  text-align: center;
  color: #888;
  font-size: 12px;
  margin: 10px 0;
}

/* Store search */
.store-search-container {
  position: relative;
}

.store-search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.store-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 0 0 6px 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.store-result {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.store-result:hover {
  background-color: #f8f9fa;
}

.store-result:last-child {
  border-bottom: none;
}

.store-name {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.store-location {
  font-size: 14px;
  color: #666;
}

.store-preview {
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f9fa;
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
  color: #dc3545;
  padding: 5px;
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
  z-index: 1000;
  overflow: auto;
}

.modal-content {
  background-color: white;
  margin: 5% auto;
  padding: 30px;
  border-radius: 12px;
  max-width: 700px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-close {
  position: absolute;
  right: 20px;
  top: 15px;
  font-size: 28px;
  cursor: pointer;
  color: #888;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #333;
}

.block-types-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 25px;
}

.block-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.block-type:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #0056b3;
}

.block-type-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #0056b3;
}

.block-type-label {
  font-weight: 600;
  color: #333;
}

/* Auto-save indicator */
.autosave-indicator {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 14px;
  position: absolute;
  bottom: -40px;
  right: 0;
  animation: fadeOut 3s ease-in-out;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

/* ===== BLOG VIEWING STYLES ===== */

/* Blog Screen */
.blog-screen {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.blog-breadcrumb {
  margin-bottom: 20px;
}

.breadcrumb-link {
  color: #0056b3;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #004494;
}

.blog-header {
  margin-bottom: 40px;
  text-align: center;
}

.blog-category {
  margin-bottom: 15px;
}

.blog-category-link {
  background-color: #f0f8ff;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  color: #0056b3;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.blog-category-link:hover {
  background-color: #0056b3;
  color: white;
}

.blog-title {
  margin-bottom: 20px;
  color: #333;
  line-height: 1.2;
}

.blog-subtitle {
  margin-bottom: 25px;
  color: #666;
  font-size: 18px;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
  color: #888;
}

.blog-author-date {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background-color: #0056b3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.blog-author {
  font-weight: 600;
  color: #333;
}

.blog-date {
  font-size: 14px;
  color: #888;
}

.btn-edit-blog {
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-edit-blog:hover {
  background-color: #e9ecef;
}

.blog-hero {
  margin-bottom: 40px;
}

.blog-hero-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.blog-content {
  margin-bottom: 40px;
  font-size: 18px;
  line-height: 1.8;
}

.blog-content-block {
  margin-bottom: 30px;
}

.blog-content-block p {
  margin-bottom: 1.5em;
  color: #333;
}

.blog-content-block h2,
.blog-content-block h3,
.blog-content-block h4 {
  margin: 2em 0 1em;
  color: #333;
  line-height: 1.3;
}

.blog-content-block img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.blog-content-block figure {
  margin: 2em 0;
  text-align: center;
}

.blog-content-block figcaption {
  margin-top: 12px;
  color: #666;
  font-style: italic;
  font-size: 16px;
}

.blog-content-block blockquote {
  border-left: 4px solid #0056b3;
  padding-left: 24px;
  margin: 2em 0;
  font-style: italic;
  color: #555;
  font-size: 20px;
  background: #f8f9fa;
  padding: 20px 24px;
  border-radius: 0 8px 8px 0;
}

.blog-content-block blockquote cite {
  display: block;
  margin-top: 12px;
  font-style: normal;
  font-weight: 600;
  color: #0056b3;
}

.blog-content-block hr {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 40px 0;
}

.store-link {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.store-link:hover {
  background-color: #e9ecef;
  border-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.store-link-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-name {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: #333;
}

.store-address {
  color: #666;
  font-size: 16px;
}

.btn-view-store {
  padding: 8px 16px;
  background-color: #0056b3;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.blog-tags {
  margin-bottom: 40px;
  padding: 20px 0;
  border-top: 1px solid #e0e0e0;
}

.tags-label {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.blog-tag {
  background-color: #f0f8ff;
  padding: 6px 12px;
  border-radius: 16px;
  text-decoration: none;
  color: #0056b3;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.blog-tag:hover {
  background-color: #0056b3;
  color: white;
}

.blog-author-info {
  display: flex;
  align-items: center;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 40px;
  background: #f8f9fa;
}

.author-avatar-large {
  margin-right: 20px;
}

.author-avatar-large .default-avatar {
  width: 80px;
  height: 80px;
  font-size: 32px;
}

.author-name {
  margin-bottom: 8px;
  color: #333;
}

.author-bio {
  color: #666;
  margin-bottom: 4px;
}

.author-contact {
  color: #0056b3;
  font-size: 14px;
}

.blog-comments {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.comments-title {
  margin-bottom: 25px;
  color: #333;
}

.no-comments {
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.comments-list {
  margin-bottom: 40px;
}

.comment {
  display: flex;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-avatar {
  margin-right: 15px;
}

.comment-avatar .default-avatar {
  width: 50px;
  height: 50px;
  font-size: 20px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #333;
}

.comment-date {
  color: #888;
  font-size: 14px;
}

.comment-text {
  color: #555;
  line-height: 1.6;
}

.comment-form {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.form-title {
  margin-bottom: 15px;
  color: #333;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: 1px solid #ddd
  border-radius: 8px;
  resize: vertical;
  font-size: 16px;
  font-family: inherit;
  margin-bottom: 15px;
}

.comment-textarea:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
}

.btn-submit-comment {
  padding: 12px 24px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-submit-comment:hover {
  background-color: #004494;
}

.login-to-comment {
  text-align: center;
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 30px;
}

.login-link {
  color: #0056b3;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

.related-blogs {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.related-title {
  margin-bottom: 25px;
  color: #333;
}

.related-blogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.related-blog-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.related-blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.related-blog-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.related-blog-image {
  height: 160px;
  position: relative;
  overflow: hidden;
}

.related-blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-blog-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(0, 86, 179, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.related-blog-content {
  padding: 15px;
}

.related-blog-title {
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.related-blog-date {
  font-size: 14px;
  color: #888;
}

.blog-stats {
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid #e0e0e0;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #0056b3;
}

.stat-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

/* ===== BLOG LIST STYLES ===== */

.blog-list-screen {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.blog-header {
  margin-bottom: 30px;
  text-align: center;
}

.blog-title h1 {
  margin-bottom: 10px;
  color: #333;
}

.blog-count {
  color: #666;
  margin-bottom: 20px;
}

.blog-filters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 150px;
  font-size: 14px;
  background: white;
}

.filter-actions {
  margin-left: auto;
}

.btn-create-blog {
  padding: 10px 20px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-create-blog:hover {
  background-color: #004494;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.blog-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  height: fit-content;
}

.blog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.1);
  border-color: #0056b3;
}

.blog-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.blog-card-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.blog-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blog-card:hover .blog-card-image img {
  transform: scale(1.05);
}

.blog-category-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: rgba(0, 86, 179, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.blog-card-content {
  padding: 25px;
}

.blog-card-title {
  margin-bottom: 12px;
  color: #333;
  font-weight: 700;
  line-height: 1.3;
}

.blog-card-snippet {
  color: #666;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.blog-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.blog-meta-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blog-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar-small {
  width: 30px;
  height: 30px;
}

.author-avatar-small .default-avatar {
  width: 100%;
  height: 100%;
  font-size: 12px;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.blog-date {
  font-size: 14px;
  color: #888;
}

.blog-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.blog-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.blog-card-tags .blog-tag {
  background-color: #f0f8ff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #0056b3;
  font-weight: 600;
}

.no-blogs {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-blogs-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #ddd;
}

.btn-create-first {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #0056b3;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-create-first:hover {
  background-color: #004494;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 10px;
}

.pagination-btn {
  padding: 10px 16px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #e9ecef;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  color: #333;
  font-weight: 600;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background-color: #f8f9fa;
}

.pagination-number.active {
  background-color: #0056b3;
  color: white;
  border-color: #0056b3;
}

.pagination-info {
  text-align: center;
  margin-top: 15px;
  color: #666;
}

.loading-indicator {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
}

.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.btn-reload,
.btn-back {
  display: inline-block;
  padding: 12px 24px;
  background-color: #0056b3;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-reload:hover,
.btn-back:hover {
  background-color: #004494;
}

/* Helper classes */
.hidden {
  display: none !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .post-screen {
    padding: 15px;
  }
  
  .template-options {
    flex-direction: column;
    align-items: center;
  }
  
  .two-columns {
    flex-direction: column;
  }
  
  .block-types-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .blog-grid {
    grid-template-columns: 1fr;
  }
  
  .blog-filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .related-blogs-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-container {
    gap: 20px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
`

const blogStyleElement = document.createElement('style');
blogStyleElement.textContent = blogStyle + TempBlogStyle; 
document.head.appendChild(blogStyleElement);
