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
    console.log("[cardBlog.js:18] Card Blog Data:", data); // Debug log

    // Extract data with default values following cardStore.js conventions
    const {
      thumbnail,
      title,
      category,
      snippet,
      tag = [],
      publishedAt,
      variant,
      slug,
      tagLimit = 3,
      headline,
      text,
      gallery = [],
      galleryHTML = '',
      galleryURL = '',
      galleryLimit = 3,
      metaTagLabel = [],
      metaTagLimit = 3,
    } = data;

    console.log("[cardBlog.js:40] Processing blog card data for:", title || text); // Line 40

    // Format date string if it exists
    const formattedDate = publishedAt ? format(parseISO(publishedAt), 'MMM d, yyyy') : '';
    
    // Handle gallery/thumbnail following cardStore.js pattern
    let mediaThumbnail = '';
    if (gallery && gallery.length > 0) {
      console.log("[cardBlog.js:48] Using gallery image:", gallery[0]); // Line 48
      mediaThumbnail = media.mediaThumbnail.render(gallery[0]);
    } else if (thumbnail) {
      console.log("[cardBlog.js:51] Using thumbnail:", thumbnail); // Line 51
      mediaThumbnail = media.mediaThumbnail.render(thumbnail);
    }

    // Generate attributes pills (max 3) following cardStore.js pattern
    const attributes = (tag || []).slice(0, tagLimit).map(item => ({
      text: item,
      icon: 'glyph-check-15'
    }));

    const attrTagData = {
      data: attributes,
      limit: tagLimit
    };

    const tag = data.tag;
    const attrTag = tag.attrTag.render(attrTagData);

    

    // Construct tag HTML
    let tagsHTML = '';
    if (tag && tag.length > 0) {
      const limitedTags = tag.slice(0, tagLimit);
      limitedTags.forEach(tagItem => {
        tagsHTML += `
          <div class="metadata-tag">
            <span class="metadata-tag-text text01 bold">${tagItem}</span>
          </div>`;
      });
    }
    
    console.log("[cardBlog.js:78] Generating blog card HTML"); // Line 78
    
    return `
    <a href="/@Neumad/${data.title?.toLowerCase().replace(/\s+/g, '-')}" class="store card col01">
      <div class="card-blog col01">
        <div class="blog-content">
          <div class="blog-thumbnail">
            ${data.mediaThumbnail}
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
      </div>
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
