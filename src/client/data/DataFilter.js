// src/components/DataFilter.js
export default class DataFilter {
  constructor(tags, activeTags, setActiveTags, renderContent) {
    this.tags = tags;
    this.activeTags = activeTags;
    this.setActiveTags = setActiveTags;
    this.renderContent = renderContent;
  }

  get element() {
    const tagElements = this.tags.map(tag => `
      <div class="tag metadata-tag" data-tag="${tag}">
          <span class="metadata-tag-text text01 bold" id="metatag">
              ${tag}
          </span>
      </div>
    `).join('');

    const element = document.createElement('div');
    element.className = 'post-data';
    element.innerHTML = tagElements;

    element.querySelectorAll('.tag').forEach(tagElement => {
      tagElement.addEventListener('click', async () => {
        const tag = tagElement.dataset.tag;
        if (this.activeTags.includes(tag)) {
          this.activeTags.includes(tag) ? 'tag-active' : ''
          this.activeTags = this.activeTags.filter(activeTag => activeTag !== tag);
        } else {
          this.activeTags.push(tag);
        }
        this.setActiveTags(this.activeTags);

        this.renderContent();
      });
    });

    return element;
  }
}












// src/components/DataFilter.js
// const DataFilter = (tags, activeTags, setTags) => {
//     const tagElements = tags.map(tag => `
//         <div class="tag ${activeTags.includes(tag) ? 'tag-active' : ''}" data-tag="${tag}">
//             ${tag}
//         </div>
//     `).join('');

//     return `
//       <div class="tag-filter">
//         ${tagElements}
//       </div>
//     `;
//   };

//   export default DataFilter;