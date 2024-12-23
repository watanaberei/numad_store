export const carouselStyles = `
  .card-category {
    position: relative;
  }

  .category-item {
    display: none;
  }

  .category-item.active {
    display: flex;
    animation: fadeIn 0.3s ease-in-out;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--s04) 0;
  }

  .indicators {
    display: flex;
    gap: var(--s02);
  }

  .indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--ink-primary-06);
    opacity: 0.45;
    cursor: pointer;
  }

  .indicator.active {
    opacity: 1;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;



// Add to existing styles
const carousel = document.createElement('style');
carousel.textContent = carouselStyles + /* other existing styles */;
document.head.appendChild(carousel);