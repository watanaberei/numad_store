export const carouselStyles = `

.card-collection {
  aspect-ratio: 1/1;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: opacity 0.3s ease;
}

.card-collection::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.6)
  );
}

.card-collection .content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: var(--s07);
}

.card-collection .pill {
  background: var(--ink-primary-06);
  border-radius: var(--s07);
  padding: var(--s04) var(--s07);
  display: flex;
  align-items: center;
  gap: var(--s04);
}

.card-collection .value {
  background: var(--bg-white-03);
  border-radius: var(--s07);
  padding: var(--s04) var(--s07);
  margin-top: auto;
}

`;



// Add to existing styles
const carousel = document.createElement('style');
carousel.textContent = carouselStyles;
document.head.appendChild(carousel);