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

const blogStyleElement = document.createElement('style');
blogStyleElement.textContent = blogStyle;
document.head.appendChild(blogStyleElement);
