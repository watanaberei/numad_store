// src/client/components/cards/cardBlog.js
import * as glyph from '../../icon/glyph.js';
import * as style from '../../../styles/style.js';
import * as icon from '../../icon/icon.js';
import * as Pictogram from '../../icon/pictogram.js';
import * as Tag from '../../tags/tag.js';
import * as geotag from '../../tags/geotag.js';
import * as objtag from '../../tags/objtag.js';
import * as amtag from '../../tags/amtag.js';
import * as attrtag from '../../tags/attrtag.js';
import { getStatsScore } from '../../function/function.js';
import * as media from '../../media/media.js';
import { format, parseISO } from "date-fns";

// Blog card for geolocation listing
export const cardBlog = {
  render: (data) => {
    // Format date string if it exists
    const formattedDate = data.publishedAt ? format(parseISO(data.publishedAt), 'MMM d, yyyy') : '';
    
    // Construct tag HTML
    let tagsHTML = '';
    if (data.tag && data.tag.length > 0) {
      const limitedTags = data.tag.slice(0, 3);
      limitedTags.forEach(tag => {
        tagsHTML += `
          <div class="metadata-tag">
            <span class="metadata-tag-text text01 bold">${tag}</span>
          </div>`;
      });
    }
    
    return `
      <a href="/@Neumad/${data.title || ''}"  class="card-blog col01"  >
        <div class="blog-content">
          <div class="blog-thumbnail">
            <img src="${data.thumbnail || ''}" alt="${data.title || 'Blog post'}" class="thumbnail-img" />
          </div>
          
          <div class="blog-info">
            <div class="blog-category">
              <i class="icon-${data.category || 'dine'}"></i>
              <span class="blog-category-text text01">${data.category || 'Article'}</span>
            </div>
            
            <div class="blog-title">
              <span class="text03 bold">${data.title || ''}</span>
            </div>
            
            <div class="blog-snippet">
              <span class="text02">${data.snippet || ''}</span>
            </div>
            
            <div class="blog-metadata">
              <div class="blog-tags">
                ${tagsHTML}
              </div>
              
              <div class="blog-date">
                <span class="text01">${formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
  }
};

// Blog card for user profile page (with status variants)
export const cardBlogUser = {
  render: (data) => {
    // Format date string if it exists
    const formattedDate = data.publishedAt ? format(parseISO(data.publishedAt), 'MMM d, yyyy') : '';
    
    // Determine CSS class based on variant
    let statusClass = '';
    switch(data.variant) {
      case 'draft':
        statusClass = 'blog-draft';
        break;
      case 'archive':
        statusClass = 'blog-archived';
        break;
      default:
        statusClass = 'blog-published';
    }
    
    return `
      <div class="card-blog card-blog-user col01 ${statusClass}">
        <div class="blog-content">
          <div class="blog-thumbnail">
            <img src="${data.thumbnail || ''}" alt="${data.title || 'Blog post'}" class="thumbnail-img" />
            ${data.variant === 'draft' ? '<div class="draft-label"><span class="text01 bold">Draft</span></div>' : ''}
            ${data.variant === 'archive' ? '<div class="archive-label"><span class="text01 bold">Archived</span></div>' : ''}
          </div>
          
          <div class="blog-info">
            <div class="blog-category">
              <i class="icon-${data.category || 'dine'}"></i>
              <span class="blog-category-text text01">${data.category || 'Article'}</span>
            </div>
            
            <div class="blog-title">
              <span class="text03 bold">${data.title || ''}</span>
            </div>
            
            <div class="blog-snippet">
              <span class="text02">${data.snippet || ''}</span>
            </div>
            
            <div class="blog-metadata">
              <div class="blog-date">
                <span class="text01">${formattedDate}</span>
              </div>
              
              <div class="blog-actions">
                <button class="blog-edit-btn" data-blog-id="${data.slug}">
                  ${icon.iconActionEdit || '<i class="icon-edit"></i>'}
                </button>
                
                ${data.variant === 'draft' ? `
                  <button class="blog-publish-btn" data-blog-id="${data.slug}">
                    ${icon.iconActionPublish || '<i class="icon-publish"></i>'}
                  </button>
                ` : ''}
                
                ${data.variant !== 'archive' ? `
                  <button class="blog-archive-btn" data-blog-id="${data.slug}">
                    ${icon.iconActionArchive || '<i class="icon-archive"></i>'}
                  </button>
                ` : `
                  <button class="blog-restore-btn" data-blog-id="${data.slug}">
                    ${icon.iconActionRestore || '<i class="icon-restore"></i>'}
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  afterRender: () => {
    // Initialize event listeners for action buttons
    const editButtons = document.querySelectorAll('.blog-edit-btn');
    const publishButtons = document.querySelectorAll('.blog-publish-btn');
    const archiveButtons = document.querySelectorAll('.blog-archive-btn');
    const restoreButtons = document.querySelectorAll('.blog-restore-btn');
    
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const blogId = button.getAttribute('data-blog-id');
        window.location.href = `/post/${blogId}`;
      });
    });
    
    publishButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const blogId = button.getAttribute('data-blog-id');
        updateBlogStatus(blogId, 'published');
      });
    });
    
    archiveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const blogId = button.getAttribute('data-blog-id');
        updateBlogStatus(blogId, 'archived');
      });
    });
    
    restoreButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const blogId = button.getAttribute('data-blog-id');
        updateBlogStatus(blogId, 'published');
      });
    });
  }
};

// Helper function to update blog status
async function updateBlogStatus(blogId, status) {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('You must be logged in to perform this action');
      return;
    }
    
    const response = await fetch(`/api/blog/${blogId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      // Refresh the current page to show updated status
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Failed to update blog status: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating blog status:', error);
    alert('An error occurred while updating the blog');
  }
}

export default { cardBlog, cardBlogUser };






// // card-blog.js

// import { format, parseISO } from "date-fns";


// const createBlogCard = {

//   render: (blogData) => {
//     return `
//     <div class="ratio1x2 overlay-top-text overlay-full-gradient">
//       <div class="p1-c2col1 ratio1x2 card-blogListing-img">
//           <img class="item-img blogs-item-img" src="${blogData.thumbnail}" alt="" />
//       </div>
//       <div class="blog-content content card-blogs-item-content ratio1x2 overlay-full-text overlay-full-gradient">
//         <div class="content blog-content-container p1-c2col1 overlay-img-text">
//             <div class="content-container">
//                 <div class="content-main">
//                     <div class="content-header">
//                         <div class="content-label">
//                             <div class="content-label-eyebrow">
//                                 <span class="text02">
//                                     ${blogData.seriesName}
//                                 </span>
//                             </div>
//                             <div class="content-label-date">
//                                 <span class="text02">
//                                     2w ago
//                                     <!--$ {blogData.publishedAt}-->
//                                 </span>
//                             </div>
//                         </div>
//                     </div> 
                
//                 </div>    
//                 <div class="content-secondary">
//                     <div class="content-title">

//                         <span class="text03 bold">${blogData.title}</span>
//                         <div class="content-details-item" id="storeDetails">
//                             <span class="text02">
//                                 ${blogData.genre}
//                             </span>
//                             <span class="text02 filler">
//                                 in 
//                             </span>
//                             <span class="text02">
//                                 ${blogData.region}
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>
//     `;
//     },
// };

// export default createBlogCard;
