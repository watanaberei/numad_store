// src/client/screens/BlogCmsScreen.js
import { getStore } from "../../API/apiContentful.js";
import { parseRequestUrl } from "../../utils/utils.js";
import HeaderHome from "../../components/header/HeaderHome.js";

const PostScreen = {
  render: async () => {
    // Check if this is an edit or new post
    const isEditMode = PostScreen.request?.action === 'edit';
    const username = PostScreen.request?.username || localStorage.getItem('username');
    const blogSlug = PostScreen.request?.slug;
    
    let blogData = {};
    
    // If we're in edit mode, fetch existing blog data
    if (isEditMode && username && blogSlug) {
      try {
        console.log("[BlogCMS] Getting blog for edit:", username, blogSlug);
        
        const mongoResponse = await fetch(`http://localhost:4500/api/@${username}/blog/${blogSlug}`);
        
        if (mongoResponse.ok) {
          const mongoData = await mongoResponse.json();
          if (mongoData.success && mongoData.blog) {
            console.log("[BlogCMS] Found blog in MongoDB:", mongoData.blog.title);
            blogData = mongoData.blog;
          }
        } else {
          console.log("[BlogCMS] Blog not found in MongoDB");
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
      }
    }
    
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      window.location.href = '/login';
      return '<div>Please log in to create or edit blogs</div>';
    }
    
    return `
      <div class="post-screen col05">
        <form id="post-form" class="post-form col05">
          <!-- Top toolbar -->
          <div class="post-toolbar col05">
            <div class="toolbar-left">
              <button type="button" id="back-button" class="btn-toolbar">
                <i class="icon-back"></i> Back
              </button>
            </div>
            
            <div class="toolbar-center">
              <span class="text03 bold">${isEditMode ? 'Edit Post' : 'New Post'}</span>
            </div>
            
            <div class="toolbar-right">
              <button type="button" id="save-draft-button" class="btn-toolbar">
                Save Draft
              </button>
              
              <button type="button" id="publish-button" class="btn-toolbar btn-primary">
                Publish
              </button>
            </div>
          </div>
          
          <!-- Blog Post Template Selection -->
          <div class="template-selector col05 ${isEditMode ? 'hidden' : ''}">
            <h2 class="text04">Choose a Template</h2>
            
            <div class="template-options">
              <div class="template-option" data-template="freestyle">
                <div class="template-preview freestyle-preview"></div>
                <span class="template-name text03">Freestyle</span>
                <p class="template-desc text02">Complete creative freedom with unlimited sections and layouts.</p>
              </div>
              
              <div class="template-option" data-template="top3">
                <div class="template-preview top3-preview"></div>
                <span class="template-name text03">Top 3 List</span>
                <p class="template-desc text02">Perfect for highlighting your favorite spots or recommendations.</p>
              </div>
            </div>
          </div>
          
          <!-- Main CMS interface -->
          <div class="cms-container col05 ${isEditMode ? '' : 'hidden'}" data-template="${blogData.template || 'freestyle'}">
            <!-- Blog post metadata -->
            <div class="blog-metadata-section col05">
              <div class="input-group">
                <label for="blog-title" class="text03">Title</label>
                <input type="text" id="blog-title" name="title" class="input-field" placeholder="Enter an attention-grabbing title" value="${blogData.title || ''}" required>
              </div>
              
              <div class="input-group">
                <label for="blog-snippet" class="text03">Snippet/Subtitle</label>
                <input type="text" id="blog-snippet" name="snippet" class="input-field" placeholder="A brief description or teaser" value="${blogData.snippet?.text || ''}">
              </div>
              
              <div class="two-columns">
                <div class="input-group">
                  <label for="blog-category" class="text03">Category</label>
                  <select id="blog-category" name="category" class="input-field">
                    <option value="dine" ${blogData.category?.category === 'dine' ? 'selected' : ''}>Dine</option>
                    <option value="work" ${blogData.category?.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="stay" ${blogData.category?.category === 'stay' ? 'selected' : ''}>Stay</option>
                    <option value="play" ${blogData.category?.category === 'play' ? 'selected' : ''}>Play</option>
                  </select>
                </div>
                
                <div class="input-group">
                  <label for="blog-tags" class="text03">Tags (comma separated)</label>
                  <input type="text" id="blog-tags" name="tags" class="input-field" placeholder="coffee, wifi, ambiance" value="${blogData.tag && blogData.tag[0] ? blogData.tag[0].tags.join(', ') : ''}">
                </div>
              </div>
              
              <div class="input-group">
                <label for="blog-cover-image" class="text03">Cover Image</label>
                <div class="media-upload-container">
                  <button type="button" id="cover-image-button" class="btn-upload">
                    <i class="icon-upload"></i> Upload Cover Image
                  </button>
                  <input type="file" id="cover-image-input" name="coverImage" class="input-file" accept="image/*">
                  <div id="cover-image-preview" class="image-preview ${blogData.media?.hero ? '' : 'hidden'}">
                    <img src="${blogData.media?.hero || ''}" alt="Cover image preview">
                    <button type="button" class="btn-remove-image" data-target="cover-image">×</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Blog content builder - Squarespace-like UI -->
            <div class="blog-content-builder col05">
              <h3 class="section-title text03">Content</h3>
              
              <div class="content-blocks-container" id="content-blocks">
                <!-- Empty state -->
                <div class="empty-content-state" id="empty-content-state" ${blogData.content?.blocks && blogData.content.blocks.length > 0 ? 'style="display: none;"' : ''}>
                  <div class="empty-state-icon">
                    <i class="icon-plus"></i>
                  </div>
                  <p class="text03">Add content blocks to build your page</p>
                  <p class="text02">Click the "+" button below to add your first block</p>
                </div>
                
                <!-- Load existing content blocks if they exist -->
                ${blogData.content?.blocks ? blogData.content.blocks.map((block, index) => 
                  generateBlockHTML(block, index)
                ).join('') : ''}
              </div>
              
              <!-- Add block button -->
              <div class="add-block-container">
                <button type="button" id="add-block-button" class="btn-add-block">
                  <i class="icon-plus"></i>
                </button>
              </div>
            </div>
            
            <!-- Blog settings -->
            <div class="blog-settings-section col05">
              <h3 class="section-title text03">Settings</h3>
              
              <div class="input-group">
                <label class="text03">Privacy</label>
                <div class="toggle-group">
                  <label class="toggle">
                    <input type="checkbox" id="setting-public" name="settingPublic" ${blogData.settings?.public ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label text02">Public</span>
                  </label>
                  <p class="text01">Make this post visible on the home screen</p>
                </div>
              </div>
              
              <div class="input-group">
                <div class="toggle-group">
                  <label class="toggle">
                    <input type="checkbox" id="setting-comments" name="settingComments" ${blogData.settings?.comments ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label text02">Comments</span>
                  </label>
                  <p class="text01">Allow other users to comment on this post</p>
                </div>
              </div>
              
              <div class="input-group">
                <div class="toggle-group">
                  <label class="toggle">
                    <input type="checkbox" id="setting-autosave" name="settingAutosave" ${blogData.settings?.autosave ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                    <span class="toggle-label text02">Auto-save drafts</span>
                  </label>
                  <p class="text01">Automatically save your changes as you type</p>
                </div>
              </div>
            </div>
          </div>
        </form>
        
        <!-- Block picker modal -->
        <div id="block-picker-modal" class="modal">
          <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h3 class="text03">Add Content Block</h3>
            
            <div class="block-types-grid">
              <div class="block-type" data-type="text">
                <div class="block-type-icon"><i class="icon-text"></i></div>
                <span class="block-type-label">Text</span>
              </div>
              
              <div class="block-type" data-type="heading">
                <div class="block-type-icon"><i class="icon-heading"></i></div>
                <span class="block-type-label">Heading</span>
              </div>
              
              <div class="block-type" data-type="image">
                <div class="block-type-icon"><i class="icon-image"></i></div>
                <span class="block-type-label">Image</span>
              </div>
              
              <div class="block-type" data-type="gallery">
                <div class="block-type-icon"><i class="icon-gallery"></i></div>
                <span class="block-type-label">Gallery</span>
              </div>
              
              <div class="block-type" data-type="quote">
                <div class="block-type-icon"><i class="icon-quote"></i></div>
                <span class="block-type-label">Quote</span>
              </div>
              
              <div class="block-type" data-type="divider">
                <div class="block-type-icon"><i class="icon-divider"></i></div>
                <span class="block-type-label">Divider</span>
              </div>
              
              <div class="block-type" data-type="button">
                <div class="block-type-icon"><i class="icon-button"></i></div>
                <span class="block-type-label">Button</span>
              </div>
              
              <div class="block-type" data-type="video">
                <div class="block-type-icon"><i class="icon-video"></i></div>
                <span class="block-type-label">Video</span>
              </div>
              
              <div class="block-type" data-type="store-link">
                <div class="block-type-icon"><i class="icon-store"></i></div>
                <span class="block-type-label">Store Link</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
 
  after_render: async () => {
    // Check if this is an edit or new post
    const isEditMode = PostScreen.request?.action === 'edit';
    const username = PostScreen.request?.username || localStorage.getItem('username');
    const blogSlug = PostScreen.request?.slug;
    
    // Initialize template selection
    const templateOptions = document.querySelectorAll('.template-option');
    const templateSelector = document.querySelector('.template-selector');
    const cmsContainer = document.querySelector('.cms-container');
    
    // If editing, show CMS container immediately
    if (isEditMode) {
      templateSelector.classList.add('hidden');
      cmsContainer.classList.remove('hidden');
    }
    
    templateOptions.forEach(option => {
      option.addEventListener('click', () => {
        const template = option.getAttribute('data-template');
        cmsContainer.setAttribute('data-template', template);
        
        // Hide template selector and show CMS
        templateSelector.classList.add('hidden');
        cmsContainer.classList.remove('hidden');
      });
    });
    
    // Initialize modals
    const blockPickerModal = document.getElementById('block-picker-modal');
    const addBlockButton = document.getElementById('add-block-button');
    const modalClose = document.querySelector('.modal-close');
    
    addBlockButton.addEventListener('click', () => {
      blockPickerModal.style.display = 'block';
    });
    
    modalClose.addEventListener('click', () => {
      blockPickerModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
      if (event.target === blockPickerModal) {
        blockPickerModal.style.display = 'none';
      }
    });
    
    // Block type selection
    const blockTypes = document.querySelectorAll('.block-type');
    const contentBlocks = document.getElementById('content-blocks');
    const emptyState = document.getElementById('empty-content-state');
    
    let blockCounter = document.querySelectorAll('.content-block').length || 0;
    
    blockTypes.forEach(blockType => {
      blockType.addEventListener('click', () => {
        const type = blockType.getAttribute('data-type');
        addContentBlock(type);
        blockPickerModal.style.display = 'none';
      });
    });
    
    function addContentBlock(type) {
      // Hide empty state if visible
      if (!emptyState.classList.contains('hidden')) {
        emptyState.style.display = 'none';
      }
      
      const blockId = `block-${type}-${blockCounter++}`;
      let blockHTML = '';
      
      switch (type) {
        case 'text':
          blockHTML = `
            <div class="content-block text-block" id="${blockId}" draggable="true">
              <div class="block-controls">
                <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
                <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
                <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
              </div>
              <div class="block-content">
                <textarea class="text-editor" placeholder="Start writing..."></textarea>
              </div>
            </div>
          `;
          break;
          
        case 'heading':
          blockHTML = `
            <div class="content-block heading-block" id="${blockId}" draggable="true">
              <div class="block-controls">
                <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
                <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
                <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
              </div>
              <div class="block-content">
                <select class="heading-level">
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                </select>
                <input type="text" class="heading-text" placeholder="Heading text">
              </div>
            </div>
          `;
          break;
          
        case 'image':
          blockHTML = `
            <div class="content-block image-block" id="${blockId}" draggable="true">
              <div class="block-controls">
                <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
                <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
                <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
              </div>
              <div class="block-content">
                <div class="image-upload-area">
                  <div class="upload-placeholder">
                    <i class="icon-image"></i>
                    <p>Click to upload an image</p>
                  </div>
                  <input type="file" class="image-upload-input" accept="image/*">
                  <div class="image-preview hidden">
                    <img src="" alt="Image preview">
                  </div>
                </div>
                <input type="text" class="image-caption" placeholder="Image caption (optional)">
              </div>
            </div>
          `;
          break;
          
        case 'gallery':
          blockHTML = `
            <div class="content-block gallery-block" id="${blockId}" draggable="true">
              <div class="block-controls">
                <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
                <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
                <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
              </div>
              <div class="block-content">
                <div class="gallery-upload-area">
                  <div class="upload-placeholder">
                    <i class="icon-gallery"></i>
                    <p>Click to upload images</p>
                  </div>
                  <input type="file" class="gallery-upload-input" accept="image/*" multiple>
                  <div class="gallery-preview">
                    <!-- Images will be added here -->
                  </div>
                </div>
                <select class="gallery-layout">
                  <option value="grid">Grid</option>
                  <option value="slideshow">Slideshow</option>
                  <option value="masonry">Masonry</option>
                </select>
              </div>
            </div>
          `;
          break;
          
        case 'quote':
          blockHTML = `
            <div class="content-block quote-block" id="${blockId}" draggable="true">
              <div class="block-controls">
                <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
                <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
                <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
              </div>
              <div class="block-content">
                <textarea class="quote-text" placeholder="Enter quote text..."></textarea>
                <input type="text" class="quote-attribution" placeholder="Attribution (optional)">
              </div>
            </div>
          `;
          break;
          
        case 'store-link':
          blockHTML = `
            <div class="content-block store-link-block" id="${blockId}" draggable="true">
              <div class="block-controls">
                <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
                <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
                <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
              </div>
              <div class="block-content">
                <div class="store-search-container">
                  <input type="text" class="store-search-input" placeholder="Search for a store...">
                  <div class="store-search-results"></div>
                </div>
                <div class="store-preview hidden">
                  <!-- Store preview will be added here -->
                </div>
              </div>
            </div>
          `;
          break;
      // Add more block types as needed
    }
      
    // Add block to container
    contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
    
    // Initialize block functionality
    initializeBlock(blockId, type);
    }
    
    function initializeBlock(blockId, type) {
      const block = document.getElementById(blockId);
      
      // Set up control buttons
      const moveUpButton = block.querySelector('.btn-move-up');
      const moveDownButton = block.querySelector('.btn-move-down');
      const deleteButton = block.querySelector('.btn-delete-block');
      
      moveUpButton.addEventListener('click', () => {
        const prevBlock = block.previousElementSibling;
        if (prevBlock && prevBlock !== emptyState) {
          contentBlocks.insertBefore(block, prevBlock);
        }
      });
      
      moveDownButton.addEventListener('click', () => {
        const nextBlock = block.nextElementSibling;
        if (nextBlock) {
          contentBlocks.insertBefore(nextBlock, block);
        }
      });
      
      deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this block?')) {
          block.remove();
          
          // Show empty state if no blocks left
          if (contentBlocks.querySelectorAll('.content-block').length === 0) {
            emptyState.style.display = 'block';
          }
        }
      });
      
      // Initialize block-specific functionality
      switch (type) {
        case 'image':
          const imageUploadInput = block.querySelector('.image-upload-input');
          const uploadPlaceholder = block.querySelector('.upload-placeholder');
          const imagePreview = block.querySelector('.image-preview');
          
          uploadPlaceholder.addEventListener('click', () => {
            imageUploadInput.click();
          });
          
          imageUploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
              const reader = new FileReader();
              
              reader.onload = (e) => {
                const img = imagePreview.querySelector('img');
                img.src = e.target.result;
                uploadPlaceholder.classList.add('hidden');
                imagePreview.classList.remove('hidden');
              };
              
              reader.readAsDataURL(e.target.files[0]);
            }
          });
          break;
          
        case 'gallery':
          const galleryUploadInput = block.querySelector('.gallery-upload-input');
          const galleryPlaceholder = block.querySelector('.upload-placeholder');
          const galleryPreview = block.querySelector('.gallery-preview');
          
          galleryPlaceholder.addEventListener('click', () => {
            galleryUploadInput.click();
          });
          
          galleryUploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
              galleryPreview.innerHTML = '';
              galleryPlaceholder.classList.add('hidden');
              
              Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                  const imgContainer = document.createElement('div');
                  imgContainer.className = 'gallery-image-container';
                  
                  const img = document.createElement('img');
                  img.src = e.target.result;
                  img.className = 'gallery-image';
                  
                  const removeBtn = document.createElement('button');
                  removeBtn.className = 'btn-remove-image';
                  removeBtn.innerHTML = '×';
                  removeBtn.addEventListener('click', () => {
                    imgContainer.remove();
                    if (galleryPreview.querySelectorAll('.gallery-image-container').length === 0) {
                      galleryPlaceholder.classList.remove('hidden');
                    }
                  });
                  
                  imgContainer.appendChild(img);
                  imgContainer.appendChild(removeBtn);
                  galleryPreview.appendChild(imgContainer);
                };
                
                reader.readAsDataURL(file);
              });
            }
          });
          break;
          
          case 'store-link':
            const storeSearchInput = block.querySelector('.store-search-input');
            const storeSearchResults = block.querySelector('.store-search-results');
            const storePreview = block.querySelector('.store-preview');
            
            let debounceTimeout;
            
            storeSearchInput.addEventListener('input', () => {
              clearTimeout(debounceTimeout);
              
              debounceTimeout = setTimeout(async () => {
                const searchTerm = storeSearchInput.value.trim();
                if (searchTerm.length < 2) {
                  storeSearchResults.innerHTML = '';
                  return;
                }
                
                try {
                  const response = await fetch(`/api/stores/search?q=${encodeURIComponent(searchTerm)}`);
                  if (response.ok) {
                    const data = await response.json();
                    
                    if (data.stores && data.stores.length > 0) {
                      storeSearchResults.innerHTML = data.stores.map(store => `
                        <div class="store-result" data-store-id="${store._id}" data-store-slug="${store.slug}">
                          <div class="store-result-info">
                            <span class="store-name">${store.title}</span>
                            <span class="store-location">${store.location?.address || ''}</span>
                          </div>
                        </div>
                      `).join('');
                      
                      // Add click listeners to results
                      document.querySelectorAll('.store-result').forEach(result => {
                        result.addEventListener('click', () => {
                          const storeId = result.getAttribute('data-store-id');
                          const storeSlug = result.getAttribute('data-store-slug');
                          const storeName = result.querySelector('.store-name').textContent;
                          const storeLocation = result.querySelector('.store-location').textContent;
                          
                          // Set store preview
                          storePreview.innerHTML = `
                            <div class="linked-store" data-store-id="${storeId}" data-store-slug="${storeSlug}">
                              <div class="store-info">
                                <span class="store-name">${storeName}</span>
                                <span class="store-location">${storeLocation}</span>
                              </div>
                              <button type="button" class="btn-remove-store">×</button>
                            </div>
                          `;
                          
                          storePreview.classList.remove('hidden');
                          storeSearchInput.value = '';
                          storeSearchResults.innerHTML = '';
                          
                          // Add remove button listener
                          storePreview.querySelector('.btn-remove-store').addEventListener('click', () => {
                            storePreview.innerHTML = '';
                            storePreview.classList.add('hidden');
                          });
                        });
                      });
                    } else {
                      storeSearchResults.innerHTML = '<div class="no-results">No stores found</div>';
                    }
                  }
                } catch (error) {
                  console.error('Error searching stores:', error);
                  storeSearchResults.innerHTML = '<div class="error">Error searching stores</div>';
                }
              }, 300);
            });
            break;
        }
      
      // Setup drag and drop functionality
      block.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', blockId);
        block.classList.add('dragging');
      });
      
      block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
      });
    }
    
    // Initialize existing blocks if we loaded blog data
    document.querySelectorAll('.content-block').forEach(block => {
      const blockId = block.id;
      const blockType = blockId.split('-')[1];
      initializeBlock(blockId, blockType);
    });
    
    // Set up drag and drop for the content blocks container
    contentBlocks.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dragging = document.querySelector('.dragging');
      if (!dragging) return;
      
      const afterElement = getDragAfterElement(contentBlocks, e.clientY);
      if (afterElement) {
        contentBlocks.insertBefore(dragging, afterElement);
      } else {
        contentBlocks.appendChild(dragging);
      }
    });
    
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.content-block:not(.dragging)')];
      
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    // Back button functionality
    document.getElementById('back-button').addEventListener('click', () => {
      if (confirm('Are you sure you want to leave? Unsaved changes will be lost.')) {
        window.history.back();
      }
    });
    
    // Cover image upload functionality
    const coverImageButton = document.getElementById('cover-image-button');
    const coverImageInput = document.getElementById('cover-image-input');
    const coverImagePreview = document.getElementById('cover-image-preview');
    
    coverImageButton.addEventListener('click', () => {
      coverImageInput.click();
    });
    
    coverImageInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = coverImagePreview.querySelector('img');
          img.src = e.target.result;
          coverImagePreview.classList.remove('hidden');
        };
        
        reader.readAsDataURL(e.target.files[0]);
      }
    });
    
    // Remove image functionality
    document.querySelectorAll('.btn-remove-image').forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');
        
        if (target === 'cover-image') {
          coverImagePreview.classList.add('hidden');
          coverImageInput.value = '';
        }
      });
    });
    
    // Save draft button functionality
    document.getElementById('save-draft-button').addEventListener('click', async () => {
      await savePost('draft');
    });
    
    // Publish button functionality
    document.getElementById('publish-button').addEventListener('click', async () => {
      await savePost('published');
    });
    
    // Auto-save functionality
    const autosaveCheckbox = document.getElementById('setting-autosave');
    let autosaveInterval;
    
    autosaveCheckbox.addEventListener('change', () => {
      if (autosaveCheckbox.checked) {
        // Set up auto-save interval (every 30 seconds)
        autosaveInterval = setInterval(async () => {
          await savePost('draft', true);
        }, 30000);
      } else {
        // Clear auto-save interval
        clearInterval(autosaveInterval);
      }
    });
    
    // Set up auto-save if option is checked
    if (autosaveCheckbox.checked) {
      autosaveInterval = setInterval(async () => {
        await savePost('draft', true);
      }, 30000);
    }
    
    // Helper function to save post - UPDATED TO GET REAL USER INFO
    async function savePost(status, isAutosave = false) {
      try {
        const blogTitle = document.getElementById('blog-title').value;
        if (!blogTitle) {
          if (!isAutosave) {
            alert('Please enter a blog title');
          }
          return;
        }
        
        console.log(`[BlogCMS] Processing blog data for: ${blogTitle}`);
    
        // Get current user info from localStorage or fetch from server
        let currentUser = null;
        try {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            currentUser = JSON.parse(userInfo);
          }
        } catch (error) {
          console.warn('[BlogCMS] Could not parse user info from localStorage');
        }
        

        // If no user info in localStorage, fetch from server
        if (!currentUser) {
          try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:4000/profile', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });
            
            if (response.ok) {
              currentUser = await response.json();
              // Store for future use
              localStorage.setItem('userInfo', JSON.stringify(currentUser));
            } else {
              throw new Error('Failed to fetch user profile');
            }
          } catch (error) {
            console.error('[BlogCMS] Error fetching user profile:', error);
            if (!isAutosave) {
              alert('Error: Could not verify user identity. Please log in again.');
            }
            return;
          }
        }
        
        if (!currentUser || !currentUser.id) {
          if (!isAutosave) {
            alert('Error: User information not available. Please log in again.');
          }
          return;
        }
        
        // Generate slug from title if new post (not in edit mode)
        const blogSlug = isEditMode ? PostScreen.request.slug : generateSlug(blogTitle);
        
        // Create completeBlogData object with real user info
        const completeBlogData = {
          // Generate slug from title if new post
          slug: blogSlug,
          title: blogTitle,
          variant: 'blogs',
          
          // Handle snippet
          snippet: {
            text: document.getElementById('blog-snippet').value || ''
          },
          
          // Handle category
          category: {
            category: document.getElementById('blog-category').value || 'dine'
          },
          
          // Handle tags
          tag: [],
          
          // Template
          template: document.querySelector('.cms-container').getAttribute('data-template') || 'freestyle',
          
          // Handle cover image (store as base64 or URL)
          media: {
            hero: '',
            thumbnail: '',
            gallery: []
          },
          
          
          // Status
          status: status,
          
          // Settings
          settings: {
            public: document.getElementById('setting-public').checked,
            comments: document.getElementById('setting-comments').checked,
            autosave: document.getElementById('setting-autosave').checked
          },
          
          // Content blocks
          content: {
            blocks: []
          },
          
          // Author info - NOW WITH REAL USER DATA
          author: {
            id: currentUser.id, // Real MongoDB ObjectId
            name: currentUser.firstName 
              ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
              : currentUser.username,
            email: currentUser.email,
            username: currentUser.username
          },
          
          // Timestamps
          publishedAt: status === 'published' ? new Date() : null,
          createdAt: isEditMode ? undefined : new Date(), // Don't overwrite creation date on edit
          updatedAt: new Date(),
          lastUpdated: new Date()
        };
        
        // Process tags
        const tagsInput = document.getElementById('blog-tags').value;
        if (tagsInput) {
          const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
          completeBlogData.tag = [{ tags: tags }];
        }
        
        // Process cover image
        const coverImageFile = document.getElementById('cover-image-input').files[0];
        if (coverImageFile) {
          // For now, just store the file name. In production, you'd upload to a file server
          completeBlogData.media.hero = `/uploads/blogs/${coverImageFile.name}`;
          completeBlogData.media.thumbnail = `/uploads/blogs/${coverImageFile.name}`;
        }
        
        // Process content blocks
        const contentBlocks = [];
        document.querySelectorAll('.content-block').forEach((block, index) => {
          const blockType = block.id.split('-')[1];
          const blockData = {
            id: block.id,
            type: blockType,
            order: index
          };
          
          switch (blockType) {
            case 'text':
              blockData.content = block.querySelector('.text-editor').value;
              break;
              
            case 'heading':
              blockData.level = block.querySelector('.heading-level').value;
              blockData.text = block.querySelector('.heading-text').value;
              break;
              
            case 'image':
              blockData.caption = block.querySelector('.image-caption').value;
              blockData.src = block.querySelector('.image-preview img')?.src || '';
              break;
              
            case 'quote':
              blockData.text = block.querySelector('.quote-text').value;
              blockData.attribution = block.querySelector('.quote-attribution').value;
              break;
              
            case 'store-link':
              const linkedStore = block.querySelector('.linked-store');
              if (linkedStore) {
                blockData.storeId = linkedStore.getAttribute('data-store-id');
                blockData.storeSlug = linkedStore.getAttribute('data-store-slug');
              }
              break;
          }
          
          contentBlocks.push(blockData);
        });

        // Then update the completeBlogData object to use the processed blocks
        completeBlogData.content.blocks = contentBlocks;
        
        console.log('[BlogCMS] Complete blog data to save:', completeBlogData);
    
        // Get access token
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          if (!isAutosave) {
            alert('You must be logged in to save a post');
          }
          return;
        }
        
        // Determine endpoint
        const endpoint = `http://localhost:4500/api/@${currentUser.username}/post/sync/${completeBlogData.slug}`;
        
        console.log(`[BlogCMS] Saving blog data to MongoDB via: ${endpoint}`);
        
        // Send to server
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(completeBlogData)
        });
        
        console.log(`[BlogCMS] Server response status:`, response.status);
    
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[BlogCMS] Server error response:', errorData);
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('[BlogCMS] MongoDB save response:', responseData);
        
        
        if (!isAutosave) {
          // Show success message
          alert(status === 'published' 
            ? 'Post published successfully!' 
            : 'Draft saved successfully!');
          
          // Redirect to blog page if published, or update URL if new post
          if (status === 'published') {
            // Redirect to the blog page with username in URL
            window.location.href = `/@${currentUser.username}/${responseData.blog.slug}`;
          } else if (!isEditMode) {
            // If this was a new post, update URL to include new blog slug for editing
            window.history.replaceState(
              null, 
              '', 
              `/@${currentUser.username}/${responseData.blog.slug}/edit`
            );
          }
        } else {
          // Show auto-save indicator
          const toolbar = document.querySelector('.post-toolbar');
          
          // Remove existing indicator if present
          const existingIndicator = document.querySelector('.autosave-indicator');
          if (existingIndicator) {
            existingIndicator.remove();
          }
          
          // Add new indicator
          const indicator = document.createElement('div');
          indicator.className = 'autosave-indicator';
          indicator.textContent = 'Saved automatically';
          toolbar.appendChild(indicator);
          
          // Remove indicator after 3 seconds
          setTimeout(() => {
            indicator.remove();
          }, 3000);
        }
        
      } catch (error) {
        console.error('[BlogCMS] Error saving blog:', error);
        if (!isAutosave) {
          alert(`An error occurred while saving the post: ${error.message}`);
        }
      }
    }
  }
};

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

// Helper function to generate block HTML for existing blocks
function generateBlockHTML(block, index) {
  const blockId = block.id || `block-${block.type}-${index}`;
  
  switch (block.type) {
    case 'text':
      return `
        <div class="content-block text-block" id="${blockId}" draggable="true">
          <div class="block-controls">
            <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
            <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
            <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
          </div>
          <div class="block-content">
            <textarea class="text-editor" placeholder="Start writing...">${block.content || ''}</textarea>
          </div>
        </div>
      `;
      
    case 'heading':
      return `
        <div class="content-block heading-block" id="${blockId}" draggable="true">
          <div class="block-controls">
            <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
            <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
            <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
          </div>
          <div class="block-content">
            <select class="heading-level">
              <option value="h2" ${block.level === 'h2' ? 'selected' : ''}>Heading 2</option>
              <option value="h3" ${block.level === 'h3' ? 'selected' : ''}>Heading 3</option>
              <option value="h4" ${block.level === 'h4' ? 'selected' : ''}>Heading 4</option>
            </select>
            <input type="text" class="heading-text" placeholder="Heading text" value="${block.text || ''}">
          </div>
        </div>
      `;
      
    case 'quote':
      return `
        <div class="content-block quote-block" id="${blockId}" draggable="true">
          <div class="block-controls">
            <button type="button" class="btn-move-up" title="Move up"><i class="icon-arrow-up"></i></button>
            <button type="button" class="btn-move-down" title="Move down"><i class="icon-arrow-down"></i></button>
            <button type="button" class="btn-delete-block" title="Remove block"><i class="icon-trash"></i></button>
          </div>
          <div class="block-content">
            <textarea class="quote-text" placeholder="Enter quote text...">${block.text || ''}</textarea>
            <input type="text" class="quote-attribution" placeholder="Attribution (optional)" value="${block.attribution || ''}">
          </div>
        </div>
      `;
      
    // Add more cases as needed
    default:
      return `<div class="content-block" id="${blockId}">Unsupported block type: ${block.type}</div>`;
  }
}

export default PostScreen;