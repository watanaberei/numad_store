export const arrayCarousel = (component) => ({
  render: (dataArray, { limit = 6 } = {}) => {
    const items = dataArray.slice(0, limit)
      .map((item, i) => `<div class="carousel-item">${component.render(item)}</div>`)
      .join('');
    return `<div class="carousel">${items}</div>`;
  }
});