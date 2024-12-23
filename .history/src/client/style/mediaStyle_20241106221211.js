export const mediaStyle = `
.media-gallery-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }

  .media-container {
    position: relative;
    width: 100%;
    height: 100%;
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
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    padding: var(--spacing-3);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .media-container:hover .media-overlay {
    opacity: 1;
  }
  
  .media-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--s04);
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
  // Apply hero styles to the document
const media = document.createElement('style');
media.textContent = mediaStyle;
document.head.appendChild(media);