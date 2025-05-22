// src/client/screens/PostScreen.js
import { getStore } from "../api.js";
import { parseRequestUrl } from "../utils.js";
import HeaderHome from "../components/header/HeaderHome.js";

const PostScreen = {
  render: async () => {
    const request = parseRequestUrl();
    const blogId = request.id;
    let blogData = {};
    
    // If we have a blog ID, try to fetch existing blog data
    if (blogId) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          window.location.href = '/login';
          return '<div>Please log in to edit blogs</div>';
        }
        
        const response = await fetch(`/api/blog/${blogId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          blogData = await response.json();
        } else {
          console.error('Failed to fetch blog data');
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
              <span class="text03 bold">${blogId ? 'Edit Post' : 'New Post'}</span>
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
          <div class="template-selector col05 ${blogId ? 'hidden' : ''}">
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
          <div class="cms-container col05 ${blogId ? '' : 'hidden'}" data-template="${blogData.template || 'freestyle'}">
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
            
            <!-- Blog content sections -->
            <div class="blog-content-section col05">
              <h3 class="section-title text03">Blog Content</h3>
              
              <!-- Freestyle template content -->
              <div class="freestyle-content template-content ${blogData.template === 'freestyle' || !blogData.template ? '' : 'hidden'}">
                <div class="editor-toolbar">
                  <button type="button" class="btn-add-section" data-section-type="text">
                    <i class="icon-text"></i> Add Text
                  </button>
                  <button type="button" class="btn-add-section" data-section-type="heading">
                    <i class="icon-heading"></i> Add Heading
                  </button>
                  <button type="button" class="btn-add-section" data-section-type="image">
                    <i class="icon-image"></i> Add Image
                  </button>
                  <button type="button" class="btn-add-section" data-section-type="video">
                    <i class="icon-video"></i> Add Video
                  </button>
                  <button type="button" class="btn-add-section" data-section-type="store">
                    <i class="icon-store"></i> Link Store
                  </button>
                  <button type="button" class="btn-add-section" data-section-type="quote">
                    <i class="icon-quote"></i> Add Quote
                  </button>
                </div>
                
                <div id="freestyle-content-container" class="content-container">
                  <!-- Sections will be added dynamically -->
                  <div class="empty-state ${blogData.content?.body ? 'hidden' : ''}">
                    <p class="text03">Your blog content will appear here</p>
                    <p class="text02">Use the buttons above to add content sections</p>
                  </div>
                </div>
              </div>
              
              <!-- Top 3 List template content -->
              <div class="top3-content template-content ${blogData.template === 'top3' ? '' : 'hidden'}">
                <div class="input-group">
                  <label for="top3-intro" class="text03">Introduction</label>
                  <textarea id="top3-intro" name="top3Intro" class="input-field textarea" placeholder="Introduce your list...">${blogData.content?.introduction || ''}</textarea>
                </div>
                
                <div id="top3-items">
                  <!-- Top 3 items will be added here -->
                  <div class="top3-item" data-item-index="0">
                    <h4 class="text03">Item #1</h4>
                    <div class="input-group">
                      <label for="item1-title" class="text03">Title</label>
                      <input type="text" id="item1-title" name="item1Title" class="input-field" placeholder="Place name">
                    </div>
                    
                    <div class="input-group">
                      <label for="item1-store" class="text03">Link to Store</label>
                      <div class="store-linker">
                        <input type="text" id="item1-store" name="item1Store" class="input-field" placeholder="Search for a store...">
                        <div class="store-search-results"></div>
                      </div>
                    </div>
                    
                    <div class="input-group">
                      <label for="item1-description" class="text03">Description</label>
                      <textarea id="item1-description" name="item1Description" class="input-field textarea" placeholder="Describe why you recommend this place..."></textarea>
                    </div>
                    
                    <div class="input-group">
                      <label for="item1-image" class="text03">Image</label>
                      <div class="media-upload-container">
                        <button type="button" class="btn-upload item-image-button">
                          <i class="icon-upload"></i> Upload Image
                        </button>
                        <input type="file" class="input-file item-image-input" accept="image/*">
                        <div class="image-preview item-image-preview hidden">
                          <img src="" alt="Item image preview">
                          <button type="button" class="btn-remove-image" data-target="item1-image">×</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="input-group">
                  <label for="top3-conclusion" class="text03">Conclusion</label>
                  <textarea id="top3-conclusion" name="top3Conclusion" class="input-field textarea" placeholder="Wrap up your list...">${blogData.content?.conclusion || ''}</textarea>
                </div>
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
      </div>
    `;
  },
  
  after_render: async () => {
    // Initialize template selection
    const templateOptions = document.querySelectorAll('.template-option');
    const templateSelector = document.querySelector('.template-selector');
    const cmsContainer = document.querySelector('.cms-container');
    
    templateOptions.forEach(option => {
      option.addEventListener('click', () => {
        const template = option.getAttribute('data-template');
        cmsContainer.setAttribute('data-template', template);
        
        // Hide template selector and show CMS
        templateSelector.classList.add('hidden');
        cmsContainer.classList.remove('hidden');
        
        // Show appropriate template content
        document.querySelectorAll('.template-content').forEach(content => {
          content.classList.add('hidden');
        });
        document.querySelector(`.${template}-content`).classList.remove('hidden');
      });
    });
    
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
        } else {
          // Handle item images
          const itemIndex = target.split('-')[1];
          const itemPreview = document.querySelector(`.item${itemIndex}-image-preview`);
          if (itemPreview) {
            itemPreview.classList.add('hidden');
            document.querySelector(`.item${itemIndex}-image-input`).value = '';
          }
        }
      });
    });
    
    // Freestyle section adding functionality
    const addSectionButtons = document.querySelectorAll('.btn-add-section');
    const freestyleContainer = document.getElementById('freestyle-content-container');
    const emptyState = freestyleContainer.querySelector('.empty-state');
    
    let sectionCounter = 0;
    
    addSectionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const sectionType = button.getAttribute('data-section-type');
        const sectionId = `section-${sectionType}-${sectionCounter++}`;
        
        let sectionHTML = '';
        
        switch (sectionType) {
          case 'text':
            sectionHTML = `
              <div class="content-section text-section" id="${sectionId}">
                <div class="section-controls">
                  <button type="button" class="btn-move-up" title="Move up">▲</button>
                  <button type="button" class="btn-move-down" title="Move down">▼</button>
                  <button type="button" class="btn-remove-section" title="Remove section">×</button>
                </div>
                <textarea class="section-content text-editor" placeholder="Enter your text here..."></textarea>
              </div>
            `;
            break;
            
          case 'heading':
            sectionHTML = `
              <div class="content-section heading-section" id="${sectionId}">
                <div class="section-controls">
                  <button type="button" class="btn-move-up" title="Move up">▲</button>
                  <button type="button" class="btn-move-down" title="Move down">▼</button>
                  <button type="button" class="btn-remove-section" title="Remove section">×</button>
                </div>
                <div class="heading-type-selector">
                  <select class="heading-type">
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                  </select>
                </div>
                <input type="text" class="section-content heading-editor" placeholder="Enter heading text...">
              </div>
            `;
            break;
            
          case 'image':
            sectionHTML = `
              <div class="content-section image-section" id="${sectionId}">
                <div class="section-controls">
                  <button type="button" class="btn-move-up" title="Move up">▲</button>
                  <button type="button" class="btn-move-down" title="Move down">▼</button>
                  <button type="button" class="btn-remove-section" title="Remove section">×</button>
                </div>
                <div class="media-upload-container">
                  <button type="button" class="btn-upload section-image-button">
                    <i class="icon-upload"></i> Upload Image
                  </button>
                  <input type="file" class="input-file section-image-input" accept="image/*">
                  <div class="image-preview section-image-preview hidden">
                    <img src="" alt="Section image preview">
                    <button type="button" class="btn-remove-image" data-target="${sectionId}-image">×</button>
                  </div>
                </div>
                <input type="text" class="section-caption" placeholder="Image caption (optional)">
              </div>
            `;
            break;
            
          case 'video':
            sectionHTML = `
              <div class="content-section video-section" id="${sectionId}">
                <div class="section-controls">
                  <button type="button" class="btn-move-up" title="Move up">▲</button>
                  <button type="button" class="btn-move-down" title="Move down">▼</button>
                  <button type="button" class="btn-remove-section" title="Remove section">×</button>
                </div>
                <input type="text" class="video-url" placeholder="Enter YouTube or Vimeo URL">
                <button type="button" class="btn-embed-video">Embed Video</button>
                <div class="video-preview hidden"></div>
                <input type="text" class="section-caption" placeholder="Video caption (optional)">
              </div>
            `;
            break;
            
          case 'store':
            sectionHTML = `
              <div class="content-section store-section" id="${sectionId}">
                <div class="section-controls">
                  <button type="button" class="btn-move-up" title="Move up">▲</button>
                  <button type="button" class="btn-move-down" title="Move down">▼</button>
                  <button type="button" class="btn-remove-section" title="Remove section">×</button>
                </div>
                <div class="store-linker">
                  <input type="text" class="store-search" placeholder="Search for a store...">
                  <div class="store-search-results"></div>
                </div>
                <div class="linked-store-preview hidden"></div>
              </div>
            `;
            break;
            
          case 'quote':
            sectionHTML = `
              <div class="content-section quote-section" id="${sectionId}">
                <div class="section-controls">
                  <button type="button" class="btn-move-up" title="Move up">▲</button>
                  <button type="button" class="btn-move-down" title="Move down">▼</button>
                  <button type="button" class="btn-remove-section" title="Remove section">×</button>
                </div>
                <textarea class="quote-text" placeholder="Enter quote text..."></textarea>
                <input type="text" class="quote-attribution" placeholder="Quote attribution (optional)">
              </div>
            `;
            break;
        }
        
        // Hide empty state if it's visible
        if (!emptyState.classList.contains('hidden')) {
          emptyState.classList.add('hidden');
        }
        
        // Add section to container
        freestyleContainer.insertAdjacentHTML('beforeend', sectionHTML);
        
        // Set up event listeners for the new section
        const newSection = document.getElementById(sectionId);
        
        // Move up button
        newSection.querySelector('.btn-move-up').addEventListener('click', () => {
          const prevSection = newSection.previousElementSibling;
          if (prevSection && !prevSection.classList.contains('empty-state')) {
            freestyleContainer.insertBefore(newSection, prevSection);
          }
        });
        
        // Move down button
        newSection.querySelector('.btn-move-down').addEventListener('click', () => {
          const nextSection = newSection.nextElementSibling;
          if (nextSection) {
            freestyleContainer.insertBefore(nextSection, newSection);
          }
        });
        
        // Remove section button
        newSection.querySelector('.btn-remove-section').addEventListener('click', () => {
          if (confirm('Are you sure you want to remove this section?')) {
            newSection.remove();
            
            // Show empty state if no sections are left
            if (freestyleContainer.querySelectorAll('.content-section').length === 0) {
              emptyState.classList.remove('hidden');
            }
          }
        });
        
        // Set up type-specific event listeners
        if (sectionType === 'image') {
          const imageButton = newSection.querySelector('.section-image-button');
          const imageInput = newSection.querySelector('.section-image-input');
          const imagePreview = newSection.querySelector('.section-image-preview');
          
          imageButton.addEventListener('click', () => {
            imageInput.click();
          });
          
          imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
              const reader = new FileReader();
              
              reader.onload = (e) => {
                const img = imagePreview.querySelector('img');
                img.src = e.target.result;
                imagePreview.classList.remove('hidden');
              };
              
              reader.readAsDataURL(e.target.files[0]);
            }
          });
          
          const removeButton = newSection.querySelector('.btn-remove-image');
          removeButton.addEventListener('click', () => {
            imagePreview.classList.add('hidden');
            imageInput.value = '';
          });
        } else if (sectionType === 'video') {
          const embedButton = newSection.querySelector('.btn-embed-video');
          const videoUrl = newSection.querySelector('.video-url');
          const videoPreview = newSection.querySelector('.video-preview');
          
          embedButton.addEventListener('click', () => {
            const url = videoUrl.value.trim();
            if (!url) return;
            
            let embedCode = '';
            
            // YouTube
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              const videoId = url.includes('v=') 
                ? url.split('v=')[1].split('&')[0]
                : url.split('/').pop();
                
              embedCode = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            }
            // Vimeo
            else if (url.includes('vimeo.com')) {
              const videoId = url.split('/').pop();
              embedCode = `<iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
            }
            
            if (embedCode) {
              videoPreview.innerHTML = embedCode;
              videoPreview.classList.remove('hidden');
            } else {
              alert('Invalid video URL. Please enter a YouTube or Vimeo URL.');
            }
          });
        } else if (sectionType === 'store') {
          const storeSearch = newSection.querySelector('.store-search');
          const storeResults = newSection.querySelector('.store-search-results');
          const storePreview = newSection.querySelector('.linked-store-preview');
          
          let debounceTimeout;
          
          storeSearch.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            
            debounceTimeout = setTimeout(async () => {
              const searchTerm = storeSearch.value.trim();
              if (searchTerm.length < 2) {
                storeResults.innerHTML = '';
                return;
              }
              
              try {
                const response = await fetch(`/api/stores/search?q=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                  const data = await response.json();
                  
                  if (data.stores && data.stores.length > 0) {
                    storeResults.innerHTML = data.stores.map(store => `
                      <div class="store-result" data-store-id="${store._id}" data-store-slug="${store.slug}">
                        <span class="store-name">${store.title}</span>
                        <span class="store-location">${store.location?.address || ''}</span>
                      </div>
                    `).join('');
                    
                    // Add click listeners to results
                    document.querySelectorAll('.store-result').forEach(result => {
                      result.addEventListener('click', () => {
                        const storeId = result.getAttribute('data-store-id');
                        const storeSlug = result.getAttribute('data-store-slug');
                        const storeName = result.querySelector('.store-name').textContent;
                        const storeLocation = result.querySelector('.store-location').textContent;
                        
                        // Set linked store
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
                        storeSearch.value = '';
                        storeResults.innerHTML = '';
                        
                        // Add remove button listener
                        storePreview.querySelector('.btn-remove-store').addEventListener('click', () => {
                          storePreview.innerHTML = '';
                          storePreview.classList.add('hidden');
                        });
                      });
                    });
                  } else {
                    storeResults.innerHTML = '<div class="no-results">No stores found</div>';
                  }
                }
              } catch (error) {
                console.error('Error searching stores:', error);
                storeResults.innerHTML = '<div class="error">Error searching stores</div>';
              }
            }, 300);
          });
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
    
    // Initialize Top 3 List template
    initializeTop3Template();
    
    // Helper function to save post
    async function savePost(status, isAutosave = false) {
      try {
        const blogTitle = document.getElementById('blog-title').value;
        if (!blogTitle) {
          if (!isAutosave) {
            alert('Please enter a blog title');
          }
          return;
        }
        
        // Get form data
        const formData = new FormData();
        
        // Add metadata
        formData.append('title', blogTitle);
        formData.append('snippet', document.getElementById('blog-snippet').value);
        formData.append('category', document.getElementById('blog-category').value);
        
        // Tags - split by comma
        const tagsInput = document.getElementById('blog-tags').value;
        if (tagsInput) {
          const tags = tagsInput.split(',').map(tag => tag.trim());
          formData.append('tags', JSON.stringify(tags));
        }
        
        // Template type
        const template = document.querySelector('.cms-container').getAttribute('data-template');
        formData.append('template', template);
        
        // Handle cover image
        const coverImageFile = document.getElementById('cover-image-input').files[0];
        if (coverImageFile) {
          formData.append('coverImage', coverImageFile);
        }
        
        // Status
        formData.append('status', status);
        
        // Settings
        formData.append('settings[public]', document.getElementById('setting-public').checked);
        formData.append('settings[comments]', document.getElementById('setting-comments').checked);
        formData.append('settings[autosave]', document.getElementById('setting-autosave').checked);
        
        // Template-specific content
        if (template === 'freestyle') {
          const sections = [];
          
          document.querySelectorAll('.content-section').forEach(section => {
            const sectionType = section.id.split('-')[1];
            const sectionData = {
              type: sectionType
            };
            
            switch (sectionType) {
              case 'text':
                sectionData.content = section.querySelector('.text-editor').value;
                break;
              case 'heading':
                sectionData.headingType = section.querySelector('.heading-type').value;
                sectionData.content = section.querySelector('.heading-editor').value;
                break;
              case 'image':
                const imageFile = section.querySelector('.section-image-input').files[0];
                if (imageFile) {
                  // For simplicity, we'll handle image uploads separately
                  // In a real implementation, you'd add these to FormData
                  sectionData.hasNewImage = true;
                  sectionData.imageIndex = sections.length;
                  formData.append(`image-${sections.length}`, imageFile);
                }
                sectionData.caption = section.querySelector('.section-caption').value;
                break;
              case 'video':
                sectionData.videoUrl = section.querySelector('.video-url').value;
                sectionData.caption = section.querySelector('.section-caption').value;
                break;
              case 'store':
                const linkedStore = section.querySelector('.linked-store');
                if (linkedStore) {
                  sectionData.storeId = linkedStore.getAttribute('data-store-id');
                  sectionData.storeSlug = linkedStore.getAttribute('data-store-slug');
                }
                break;
              case 'quote':
                sectionData.quoteText = section.querySelector('.quote-text').value;
                sectionData.attribution = section.querySelector('.quote-attribution').value;
                break;
            }
            
            sections.push(sectionData);
          });
          
          formData.append('content', JSON.stringify({ sections }));
        } else if (template === 'top3') {
          // Handle Top 3 List content
          const intro = document.getElementById('top3-intro').value;
          const conclusion = document.getElementById('top3-conclusion').value;
          
          const items = [];
          
          document.querySelectorAll('.top3-item').forEach((item, index) => {
            const itemData = {
              title: document.getElementById(`item${index+1}-title`).value,
              description: document.getElementById(`item${index+1}-description`).value
            };
            
            // Store link
            const storeInput = document.getElementById(`item${index+1}-store`);
            if (storeInput.dataset.storeId) {
              itemData.storeId = storeInput.dataset.storeId;
              itemData.storeSlug = storeInput.dataset.storeSlug;
            }
            
            // Image
            const imageFile = item.querySelector('.item-image-input').files[0];
            if (imageFile) {
              itemData.hasNewImage = true;
              itemData.imageIndex = index;
              formData.append(`item-image-${index}`, imageFile);
            }
            
            items.push(itemData);
          });
          
          formData.append('content', JSON.stringify({
            introduction: intro,
            items,
            conclusion
          }));
        }
        
        // Get access token
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          if (!isAutosave) {
            alert('You must be logged in to save a post');
          }
          return;
        }
        
        // Determine endpoint (create or update)
        const request = parseRequestUrl();
        const endpoint = request.id 
          ? `/api/blog/${request.id}` 
          : '/api/blog';
        
        // Make API request
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (!isAutosave) {
            // Show success message
            alert(status === 'published' 
              ? 'Post published successfully!' 
              : 'Draft saved successfully!');
            
            // Redirect to blog page if published, or return to blog dashboard
            if (status === 'published') {
              window.location.href = `/blog/${data.slug}`;
            } else if (!request.id) {
              // If this was a new post, update URL to include new blog ID
              window.history.replaceState(
                null, 
                '', 
                `/post/${data.slug}`
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
        } else {
          if (!isAutosave) {
            const error = await response.json();
            alert(`Error saving post: ${error.message}`);
          }
        }
      } catch (error) {
        console.error('Error saving post:', error);
        if (!isAutosave) {
          alert('An error occurred while saving the post');
        }
      }
    }
    
    // Helper function to initialize Top 3 List template
    function initializeTop3Template() {
      // Add items 2 and 3
      const top3Items = document.getElementById('top3-items');
      
      for (let i = 1; i < 3; i++) {
        const itemHTML = `
          <div class="top3-item" data-item-index="${i}">
            <h4 class="text03">Item #${i+1}</h4>
            <div class="input-group">
              <label for="item${i+1}-title" class="text03">Title</label>
              <input type="text" id="item${i+1}-title" name="item${i+1}Title" class="input-field" placeholder="Place name">
            </div>
            
            <div class="input-group">
              <label for="item${i+1}-store" class="text03">Link to Store</label>
              <div class="store-linker">
                <input type="text" id="item${i+1}-store" name="item${i+1}Store" class="input-field" placeholder="Search for a store...">
                <div class="store-search-results"></div>
              </div>
            </div>
            
            <div class="input-group">
              <label for="item${i+1}-description" class="text03">Description</label>
              <textarea id="item${i+1}-description" name="item${i+1}Description" class="input-field textarea" placeholder="Describe why you recommend this place..."></textarea>
            </div>
            
            <div class="input-group">
              <label for="item${i+1}-image" class="text03">Image</label>
              <div class="media-upload-container">
                <button type="button" class="btn-upload item-image-button">
                  <i class="icon-upload"></i> Upload Image
                </button>
                <input type="file" class="input-file item-image-input" accept="image/*">
                <div class="image-preview item-image-preview hidden">
                  <img src="" alt="Item image preview">
                  <button type="button" class="btn-remove-image" data-target="item${i+1}-image">×</button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        top3Items.insertAdjacentHTML('beforeend', itemHTML);
      }
      
      // Set up store search functionality for all items
      document.querySelectorAll('.top3-item').forEach(item => {
        const index = parseInt(item.getAttribute('data-item-index'));
        const storeInput = document.getElementById(`item${index+1}-store`);
        const storeResults = item.querySelector('.store-search-results');
        
        let debounceTimeout;
        
        storeInput.addEventListener('input', () => {
          clearTimeout(debounceTimeout);
          
          debounceTimeout = setTimeout(async () => {
            const searchTerm = storeInput.value.trim();
            if (searchTerm.length < 2) {
              storeResults.innerHTML = '';
              return;
            }
            
            try {
              const response = await fetch(`/api/stores/search?q=${encodeURIComponent(searchTerm)}`);
              if (response.ok) {
                const data = await response.json();
                
                if (data.stores && data.stores.length > 0) {
                  storeResults.innerHTML = data.stores.map(store => `
                    <div class="store-result" data-store-id="${store._id}" data-store-slug="${store.slug}">
                      <span class="store-name">${store.title}</span>
                      <span class="store-location">${store.location?.address || ''}</span>
                    </div>
                  `).join('');
                  
                  // Add click listeners to results
                  storeResults.querySelectorAll('.store-result').forEach(result => {
                    result.addEventListener('click', () => {
                      const storeId = result.getAttribute('data-store-id');
                      const storeSlug = result.getAttribute('data-store-slug');
                      const storeName = result.querySelector('.store-name').textContent;
                      
                      // Set input value and data attributes
                      storeInput.value = storeName;
                      storeInput.dataset.storeId = storeId;
                      storeInput.dataset.storeSlug = storeSlug;
                      
                      // Clear results
                      storeResults.innerHTML = '';
                    });
                  });
                } else {
                  storeResults.innerHTML = '<div class="no-results">No stores found</div>';
                }
              }
            } catch (error) {
              console.error('Error searching stores:', error);
              storeResults.innerHTML = '<div class="error">Error searching stores</div>';
            }
          }, 300);
        });
        
        // Set up image upload
        const imageButton = item.querySelector('.item-image-button');
        const imageInput = item.querySelector('.item-image-input');
        const imagePreview = item.querySelector('.item-image-preview');
        
        imageButton.addEventListener('click', () => {
          imageInput.click();
        });
        
        imageInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
              const img = imagePreview.querySelector('img');
              img.src = e.target.result;
              imagePreview.classList.remove('hidden');
            };
            
            reader.readAsDataURL(e.target.files[0]);
          }
        });
        
        // Set up remove image button
        const removeButton = item.querySelector('.btn-remove-image');
        removeButton.addEventListener('click', () => {
          imagePreview.classList.add('hidden');
          imageInput.value = '';
        });
      });
    }
  }
};

export default PostScreen;