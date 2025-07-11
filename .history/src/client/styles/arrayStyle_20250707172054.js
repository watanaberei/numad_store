export const carouselStyles = `
.carousel-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 3 * var(--s07)) / 4);
  gap: var(--s07);
  transition: transform 0.3s ease-in-out;
}

.carousel-item {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.carousel-controls {
  z-index: 3 !important;
}

.carousel-item.active {
  opacity: 1;
}

.card-collection .content {
  transition: opacity 0.15s ease-in-out;
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--ink-primary-04);
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.indicator-dot.inactive {
  opacity: 0.45;
}

.value.pill.array {
  transition: opacity 0.15s ease;
}



.card-item {
  aspect-ratio: 1/1;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  transition: background-image 0.3s ease-in-out;
}

.card-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.6)
  );
}

.card-collection .content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  // flex-direction: column;
  justify-content: space-between;
  height:-webkit-fill-available; !important;
  width: -webkit-fill-available; !important;
  padding: 0;
}


.items-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.item-content {
  display: none;
  animation: fadeIn 0.3s ease-in-out;
}

.item-content.active {
  display: block;
}

.item-pill {
  background: var(--bg-white-03);
  border-radius: var(--s07);
  padding: var(--s04) var(--s07);
  margin-bottom: var(--s04);
  display: flex;
  align-items: center;
  gap: var(--s04);
}

.item-controls {
  display: flex;
  justify-content: center;
  padding-top: var(--s07);
}

.item-indicators {
  display: flex;
  gap: var(--s04);
}

.item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bg-white-03);
  opacity: 0.45;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.item-dot.active {
  opacity: 1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.card-item {
  aspect-ratio: 1/1;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: opacity 0.3s ease;
}

.card-item::before {
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

.card-ite4m .content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: var(--s07);
}


.card-item .value {
  background: var(--bg-white-03);
  border-radius: var(--s07);
  // padding: var(--s04) var(--s07);
  margin-top: auto;
}
.card-collection {
  position: relative;
  aspect-ratio: 1/1;
}

.card-collection .content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: none;
  grid-template-rows: auto 1fr auto;
  transition: opacity 0.3s ease;
}

.card-collection .content.active {
  display: grid;
  opacity: 1;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--ink-primary-04);
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.indicator-dot.inactive {
  opacity: 0.45;
}

.card-collection .content {
  transition: background-image 0.3s ease-in-out;
}

.indicator-dot {
  transition: opacity 0.3s ease;
}

.value {
  transition: opacity 0.3s ease-in-out;
}

.badge {
  transition: opacity 0.3s ease-in-out;
}
`;



// Add to existing styles
const carousel = document.createElement('style');
carousel.textContent = carouselStyles;
document.head.appendChild(carousel);