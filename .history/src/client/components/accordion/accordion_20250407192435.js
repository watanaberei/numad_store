import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import * as media from "../media/media.js";

export const Accordion = {
  render: (store) => {
    // In the render method of experiences
    const mediaTopThree = store.mediaTopThree;
    const mediaGallery = store.mediaGallery;
    const mediaGalleryCount = mediaGallery.length;
    const snippetService = store.snippetService;
    const attributeService = store.attributeService || [];
    // console.log("attributeService", attributeService, "// snippetService", snippetService, "// mediaGallery", mediaGallery);

    const limitedAttributesService04 = attributeService.slice(0, 5);

    // BEST
    // limitedstoreAttributes06.forEach(storeAttributes => {
    //         let iconString = storeAttributes.key.trim();
    //         iconString = iconString.charAt(0).toLowerCase() + iconString.slice(1).replace(/\s/g, '');

    //         storeAttributesHTML += `
    let attributeServiceHTML = "";
    limitedAttributesService04.forEach((attributeService) => {
      let iconString = attributeService.key.trim();
      iconString =
        iconString.charAt(0).toLowerCase() +
        iconString.slice(1).replace(/\s/g, "");

      attributeServiceHTML += `
        <div class="item">
            <i class="icon icon-service-${iconString}-21"></i>
            <span class="text inkw03">
                    <span class="title inkw03 text03 bold">${attributeService.key}</span>
                    <span class="subtitle inkw03 text03">${attributeService.value}</span>
            </span>
        </div>
       
        `;
    });
    // console.log("attributeServiceHTML", attributeServiceHTML);

    return `
 

`;
  },
};



export const Details = {
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
    console.log("[accordion] accordion.Details afterRender");
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        console.log("[accordion] accordion.Details onClick");
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

