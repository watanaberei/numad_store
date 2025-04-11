import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import * as media from "../media/media.js";

export const accordion = {
  render: (data) => {
    const { sections = [] } = data;

    let accordionHTML = `<div class="accordion">`;

    sections.forEach((section, index) => {
      const { title, content, isOpen = false } = section;
      
      accordionHTML += `
        <div class="accordion-section" data-index="${index}">
          <button class="accordion-header ${isOpen ? 'active' : ''}" aria-expanded="${isOpen}">
            <span class="accordion-title">${title}</span>
            <i class="icon icon-chevron"></i>
          </button>
          <div class="accordion-content" ${isOpen ? '' : 'hidden'}>
            ${content}
          </div>
        </div>
      `;
    });

    accordionHTML += `</div>`;

    return accordionHTML;
  },

  afterRender: () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        const content = section.querySelector('.accordion-content');
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        // Toggle current section
        header.classList.toggle('active');
        header.setAttribute('aria-expanded', !isExpanded);
        content.hidden = isExpanded;
      });
    });
  }
};

// Example implementation:
/*
const accordionData = {
  sections: [
    {
      title: "Section 1",
      content: "<p>Content for section 1</p>",
      isOpen: true
    },
    {
      title: "Section 2", 
      content: "<p>Content for section 2</p>"
    },
    {
      title: "Section 3",
      content: "<p>Content for section 3</p>"
    }
  ]
};

const accordionHTML = accordion.render(accordionData);
document.querySelector('#accordion-container').innerHTML = accordionHTML;
accordion.afterRender();
*/
