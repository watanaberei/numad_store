export const media = `

  .media-container {
    position: relative;
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: grid;
    grid-column: span 1;
    grid-row: span 1;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    overflow: hidden;
  }

  .media-container .primary,
  .media-container .secondary,
  .media-container .tertiary {
      display: grid;
      grid-column: span 1;
      grid-row: span 1;
  }
  
  .media-container .primary {
    // position: absolute;
    top: var(--spacing-3);
    left: var(--spacing-3);
    z-index: 2;
  }
  .media-container .tertiary {
    // position: absolute;
        margin:0;
         place-content: center;
    padding:0;
    bottom: var(--spacing-3);
    // left: var(--spacing-3);
    z-index: 2;
  }
  .media-container .secondary {
    // position: absolute;
    margin:0;
    padding:0;
   
    left: var(--spacing-3);
    z-index: 2;
  }
  
  .media-container:hover .media-overlay {
    opacity: 1;
  }
  
  .media-container:hover .primary {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  
  .media-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .media-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7));
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--spacing-3);    
  }
  
  .media-container:hover .media-overlay {
    opacity: 1;
  }
  
  .media-gallery-container:hover .media-overlay {
    opacity: 1;
  }
  
  .source-badge {
    align-self: flex-end;
  }
  
  .media-description {
    color: var(--bg-white-00);
    background: rgba(0,0,0,0.7);
    padding: var(--s02);
    border-radius: var(--s02);
  }
  `;


  
  export const mediaThumbnail = `
  .media-thumbnail {
    aspect-ratio: var(--aspect-ratio-2x2);
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }
    
  .media-thumbnail img {
    display: grid;
    background-size: cover;
    background-position: center;
    aspect-ratio: var(--aspect-ratio-5x2);
    gap: var(--s02);
  }
  `;



  export const mediaGallery = `
  .media-gallery-container {
    border-radius: var(--r04);
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }
    
  .media-gallery {
    display: grid;
    aspect-ratio: var(--aspect-ratio-5x2);
    gap: var(--s02);
  }
  `;
  // Apply hero styles to the document
const mediaStyle = document.createElement('style');
mediaStyle.textContent = media + mediaGallery;
document.head.appendChild(mediaStyle);