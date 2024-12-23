export const carouselStyles = `
  
  // .content {
  //   position: relative;
  //   z-index: 1;
  //   display: flex;
  //   flex-direction: column;
  //   justify-content: space-between;
  //   height: 100%;
  //   padding: var(--s07);
  // }
  
  // .pill {
  //   background: var(--ink-primary-06);
  //   border-radius: var(--s07);
  //   padding: var(--s04) var(--s07);
  //   display: inline-flex;
  //   align-items: center;
  //   gap: var(--s04);
  // }
  
  // .items-container {
  //   flex-grow: 1;
  //   display: flex;
  //   flex-direction: column;
  //   justify-content: flex-end;
  // }
  
  // .item-content {
  //   display: none;
  //   animation: fadeIn 0.3s ease-in-out;
  // }
  
  // .item-content.active {
  //   display: block;
  // }
  
  // .item-pill {
  //   background: var(--bg-white-03);
  //   border-radius: var(--s07);
  //   padding: var(--s04) var(--s07);
  //   margin-bottom: var(--s04);
  //   display: flex;
  //   align-items: center;
  //   gap: var(--s04);
  // }
  
  // .item-controls {
  //   display: flex;
  //   justify-content: center;
  //   padding-top: var(--s07);
  // }
  
  // .item-indicators {
  //   display: flex;
  //   gap: var(--s04);
  // }
  
  // .item-dot {
  //   width: 6px;
  //   height: 6px;
  //   border-radius: 50%;
  //   background: var(--bg-white-03);
  //   opacity: 0.45;
  //   cursor: pointer;
  //   transition: opacity 0.3s ease;
  // }
  
  // .item-dot.active {
  //   opacity: 1;
  // }
  
  // @keyframes fadeIn {
  //   from { opacity: 0; transform: translateY(10px); }
  //   to { opacity: 1; transform: translateY(0); }
  // }
  // .card-category {
  //   position: relative;
  // }

  // .category-item {
  //   display: none;
  // }

  // .category-item.active {
  //   display: flex;
  //   animation: fadeIn 0.3s ease-in-out;
  // }

  // .controls {
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: center;
  //   padding: var(--s04) 0;
  // }

  // .indicators {
  //   display: flex;
  //   gap: var(--s02);
  // }

  // .indicator {
  //   width: 6px;
  //   height: 6px;
  //   border-radius: 50%;
  //   background: var(--ink-primary-06);
  //   opacity: 0.45;
  //   cursor: pointer;
  // }

  // .indicator.active {
  //   opacity: 1;
  // }

  // @keyframes fadeIn {
  //   from { opacity: 0; }
  //   to { opacity: 1; }
  // }
`;



// Add to existing styles
const carousel = document.createElement('style');
carousel.textContent = carouselStyles;
document.head.appendChild(carousel);