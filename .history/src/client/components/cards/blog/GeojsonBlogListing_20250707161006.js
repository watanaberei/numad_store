// src/client/components/map/geo/GeojsonBlogListing.js - FIXED VERSION

import { cardBlog } from './cardBlog.js';

// FIXED: Create GeoJSON blog listing element with proper error handling
export const createGeojsonBlogListing = (feature, map, userCoordinates = null) => {
  try {
    console.log('[GeojsonBlogListing] Creating blog listing for:', feature.properties.title);
    
    // Validate feature data
    if (!feature || !feature.properties) {
      console.warn('[GeojsonBlogListing] Invalid feature data:', feature);
      return null;
    }
    
    const properties = feature.properties;
    
    // FIXED: Map the GeoJSON properties to the expected blog card data format
    const blogData = {
      slug: properties.slug || properties.id,
      title: properties.title || 'Untitled Blog',
      variant: 'blogs', // Ensure this is set for proper styling
      
      // Handle snippet/description
      snippet: properties.snippet || properties.description || '',
      
      // Handle category
      category: properties.categoryType || properties.category || 'dine',
      
      // Handle thumbnail/media
      thumbnail: properties.thumbnail || properties.hero || properties.image || '',
      
      // Handle author
      author: {
        name: properties.author || 'Anonymous',
        username: properties.authorUsername || '',
        email: properties.authorEmail || ''
      },
      
      // Handle publish date
      publishedAt: properties.publishedAt || properties.createdAt || new Date().toISOString(),
      
      // Handle tags
      tag: properties.tags ? [{ tags: Array.isArray(properties.tags) ? properties.tags : [properties.tags] }] : [],
      
      // Handle location data if available
      location: feature.geometry ? {
        coordinates: feature.geometry.coordinates,
        address: properties.address || ''
      } : null,
      
      // Add distance if user coordinates are provided
      distance: userCoordinates && feature.geometry ? 
        calculateDistance(userCoordinates, feature.geometry.coordinates) : null
    };
    
    // FIXED: Create the DOM element using the blog card component
    const cardElement = document.createElement('div');
    cardElement.className = 'geojson-blog-listing';
    
    // Use the cardBlog component to render the content
    cardElement.innerHTML = cardBlog.render(blogData);
    
    // FIXED: Add click handler to navigate to blog
    cardElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('[GeojsonBlogListing] Blog clicked:', blogData.slug);
      
      // Navigate to blog page
      const blogUrl = `/blog/${blogData.slug}`;
      
      // Update URL and navigate
      window.history.pushState(null, null, blogUrl);
      
      // Trigger router update (if using custom router)
      if (window.router) {
        window.router();
      } else {
        // Fallback: reload page with new URL
        window.location.href = blogUrl;
      }
    });
    
    // FIXED: Add hover effects for map interaction
    if (map && feature.geometry) {
      cardElement.addEventListener('mouseenter', () => {
        // Highlight the corresponding map marker
        highlightMapMarker(map, feature, true);
      });
      
      cardElement.addEventListener('mouseleave', () => {
        // Remove highlight from map marker
        highlightMapMarker(map, feature, false);
      });
    }
    
    // FIXED: Add data attributes for easier debugging and testing
    cardElement.setAttribute('data-blog-slug', blogData.slug);
    cardElement.setAttribute('data-blog-category', blogData.category);
    cardElement.setAttribute('data-variant', 'blogs');
    
    console.log('[GeojsonBlogListing] Blog listing created successfully for:', blogData.title);
    
    return cardElement;
    
  } catch (error) {
    console.error('[GeojsonBlogListing] Error creating blog listing:', error);
    console.error('[GeojsonBlogListing] Feature data:', feature);
    
    // FIXED: Return a fallback element instead of null to prevent rendering issues
    const fallbackElement = document.createElement('div');
    fallbackElement.className = 'geojson-blog-listing error-state';
    fallbackElement.innerHTML = `
      <div class="blog-card error">
        <div class="blog-info">
          <div class="blog-title">
            <span class="text03">Error loading blog</span>
          </div>
          <div class="blog-snippet">
            <span class="text02">Unable to display blog information</span>
          </div>
        </div>
      </div>
    `;
    
    return fallbackElement;
  }
};

// FIXED: Helper function to calculate distance between coordinates
function calculateDistance(userCoordinates, blogCoordinates) {
  if (!userCoordinates || !blogCoordinates || 
      !Array.isArray(userCoordinates) || !Array.isArray(blogCoordinates) ||
      userCoordinates.length !== 2 || blogCoordinates.length !== 2) {
    return null;
  }
  
  const [userLon, userLat] = userCoordinates;
  const [blogLon, blogLat] = blogCoordinates;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = userLat * Math.PI/180; // φ, λ in radians
  const φ2 = blogLat * Math.PI/180;
  const Δφ = (blogLat - userLat) * Math.PI/180;
  const Δλ = (blogLon - userLon) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c; // Distance in meters
  
  // Return distance in kilometers, rounded to 1 decimal place
  return Math.round(distance / 100) / 10;
}

// FIXED: Helper function to highlight map markers
function highlightMapMarker(map, feature, highlight) {
  try {
    if (!map || !feature || !feature.geometry) return;
    
    const coordinates = feature.geometry.coordinates;
    const markerElements = document.querySelectorAll('.marker');
    
    // Find the marker that corresponds to this feature
    markerElements.forEach(marker => {
      const popup = marker._popup;
      if (popup && popup._content && popup._content.includes(feature.properties.title)) {
        if (highlight) {
          marker.classList.add('marker-highlighted');
          marker.style.transform = 'scale(1.2)';
          marker.style.zIndex = '1000';
        } else {
          marker.classList.remove('marker-highlighted');
          marker.style.transform = 'scale(1)';
          marker.style.zIndex = 'auto';
        }
      }
    });
  } catch (error) {
    console.warn('[GeojsonBlogListing] Error highlighting marker:', error);
  }
}

// FIXED: Export for use in other components
export default createGeojsonBlogListing;

///////////////////////// END FIXED GEOJSON BLOG LISTING /////////////////////////