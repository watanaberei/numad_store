import { format, parseISO } from "date-fns";
import * as element from "../elements.js";
import * as media from "../media/media.js";
import * as geotag from "../tags/geotag.js";

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
  }
};

// export const Details = {
//   render: (data) => {
//     const { sections = [] } = data;
//     const Geotag = geotag.geotagStatus.render();

//     let accordionHTML = `<div class="accordion-container">`;

//     sections.forEach((section, index) => {
//       const { section: sectionData } = section;
//       const SectionData = sectionData || {};
//       accordionHTML += `
//         <div class="accordion-section" data-index="${index}">
//           <div class="title">
//             <button class="accordion-header ${SectionData.isOpen ? 'active' : ''}" aria-expanded="${section.isOpen}">
//               <span class="label" data-class="text02">${SectionData.title}</span>
//               <div class="sectondary sentance">
//                 <span class="label" data-class="text02">${SectionData.subtitle}</span>
//                 <span class="label" data-class="text02">${Geotag.render(SectionData.status)}</span>
//               </div>
//               <div class="button2">
//                 <svg class="expand" width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path fill-rule="evenodd" clip-rule="evenodd" d="M4.23123 5.81806L-0.179688 1.40739L1.05771 0.169922L4.84991 3.96191L8.64188 0.169939L9.87932 1.40738L5.46865 5.81805L4.84995 6.43675L4.23123 5.81806Z" fill="#272727"/>
//                 </svg>
//               </div>
//             </button>
//           </div>
//           <div class="accordion-content" ${SectionData.isOpen ? '' : 'hidden'}>
//             ${SectionData.content}
//           </div>
//           <div class="divider-component" data-class="dividerComponent">
//             <div class="rule-h"></div>
//           </div>
//         </div>
//       `;
//     });

//     accordionHTML += `</div>`;

//     return accordionHTML;
//   },

//   afterRender: () => {
//     console.log("[accordion] accordion.Details afterRender");
//     const accordionHeaders = document.querySelectorAll('.accordion-header');
//     accordionHeaders.forEach(header => {
//       header.addEventListener('click', () => {
//         console.log("[accordion] accordion.Details onClick");
//         const section = header.parentElement.parentElement;
//         const content = section.querySelector('.accordion-content');
//         const button = header.querySelector('.button2');

//         // Close all sections first
//         accordionHeaders.forEach(otherHeader => {
//           otherHeader.classList.remove('active');
//           otherHeader.setAttribute('aria-expanded', 'false');
//           otherHeader.parentElement.parentElement.querySelector('.accordion-content').hidden = true;
//           const otherButton = otherHeader.querySelector('.button2');
//           if (otherButton) {
//             otherButton.style.transform = 'rotate(0deg)';
//           }
//         });

//         // Open clicked section
//         header.classList.add('active');
//         header.setAttribute('aria-expanded', 'true');
//         content.hidden = false;
//         if (button) {
//           button.style.transform = 'rotate(180deg)';
//         }
//       });
//     });
//   }
// };
export const Details = {
  render: (data) => {
    const { sections = [] } = data;
    // const Geotag = geotag.geotagStatus.render();

    let accordionHTML = `<div class="accordion-container">`;

    sections.forEach((section, index) => {
      const { section: sectionData } = section;
      const SectionData = sectionData || {};

      // Add null checks for content
      const content = SectionData.content?.content || "";
      const title = SectionData.content?.title || "";
      const sectionTag = geotag.geotagStatus.render(SectionData.status);

      accordionHTML += `
        <div class="accordion-section" data-index="${index}">
          <div class="title">
            <button class="accordion-header ${
              SectionData.isOpen ? "active" : ""
            }" aria-expanded="${SectionData.isOpen ? "true" : "false"}">
              <span class="label" data-class="text02">${
                SectionData.section || ""
              }</span>
              <div class="secondary sentance">
                <span class="label" data-class="text02">${
                  SectionData.subtitle || ""
                }</span>
                ${
                  
                    sectionTag
                //     `
                //   <button class="tag" data-class="tag geoclass">
                //     <div class="key" data-class="geoclass">
                //       <span class="text2" data-class="text02">${SectionData.tag}</span>
                //     </div>
                //   </button>
                // `
              
                }
              </div>
              <div class="button2">
                <svg class="expand" width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.23123 5.81806L-0.179688 1.40739L1.05771 0.169922L4.84991 3.96191L8.64188 0.169939L9.87932 1.40738L5.46865 5.81805L4.84995 6.43675L4.23123 5.81806Z" fill="#272727"/>
                </svg>
              </div>
            </button>
          </div>
          <div class="accordion-content" ${SectionData.isOpen ? "" : "hidden"}>
            <div class="content-title">${title}</div>
            <div class="content-body">${content}</div>
          </div>
          <div class="divider-component" data-class="dividerComponent">
            <div class="rule-h"></div>
          </div>
        </div>
      `;
    });

    accordionHTML += `</div>`;

    return accordionHTML;
  },

  afterRender: () => {
    console.log("[accordion] accordion.Details afterRender");
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        console.log("[accordion] accordion.Details onClick");

        // Get section elements with null checks
        
        // const section = header.closest('.accordion-section');
        const section = header.parentElement.parentElement;
        if (!section) return;

        const content = section.querySelector(".accordion-content");
        if (!content) return;

        const button = header.querySelector(".button2");
        const isExpanded = header.getAttribute("aria-expanded") === "true";

        // Close all sections first
        accordionHeaders.forEach((otherHeader) => {
          const otherSection = otherHeader.closest(".accordion-section");
          if (!otherSection) return;

          const otherContent = otherSection.querySelector(".accordion-content");
          if (!otherContent) return;

          otherHeader.classList.remove("active");
          otherHeader.setAttribute("aria-expanded", "false");
          // otherHeader.parentElement.parentElement.querySelector(
          //   ".accordion-content"
          // ).hidden = true;
          // // otherContent.hidden = true;
          otherContent.hidden = true;

          const otherButton = otherHeader.querySelector(".button2");
          if (otherButton) {
            otherButton.style.transform = "rotate(0deg)";
          }
        });

        // Toggle clicked section
        // Open clicked section
        header.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        content.hidden = false;

        // header.classList.toggle('active');
        // header.setAttribute('aria-expanded', !isExpanded);
        // content.hidden = isExpanded;

        if (button) {
          // button.style.transform = 'rotate(180deg)';
          // button.style.transform = isExpanded
          //   ? "rotate(0deg)"
          //   : "rotate(180deg)";
          button.style.transform = "rotate(180deg)";
        }
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
