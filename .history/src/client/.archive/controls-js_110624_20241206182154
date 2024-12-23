import * as glyph from '../icon/glyph.js';
import * as icon from '../icon/icon.js';

export const controls = {
  render: (data) => {
    return `
      <div class="controls-container">
        <div class="navigation array">
          <button class="nav-button prev">
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M5 0.5L1 4.5L5 8.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <div class="indicator">
            ${Array(data.totalPages || 3).fill().map((_, i) => `
              <div class="indicator-dot ${i === 0 ? 'active' : 'inactive'}"></div>
            `).join('')}
          </div>
          <button class="nav-button next">
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M1 0.5L5 4.5L1 8.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  initialize: (container) => {
    const track = container.querySelector('.carousel-track');
    const items = container.querySelectorAll('.carousel-item');
    const dots = container.querySelectorAll('.indicator-dot');
    const prevBtn = container.querySelector('.nav-button.prev');
    const nextBtn = container.querySelector('.nav-button.next');
    let currentIndex = 0;

    const updateCarousel = (index) => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      currentIndex = index;
    };

    prevBtn?.addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + items.length) % items.length;
      updateCarousel(newIndex);
    });

    nextBtn?.addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % items.length;
      updateCarousel(newIndex);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateCarousel(index));
    });
  }
};