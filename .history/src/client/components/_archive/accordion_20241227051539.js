import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import * as media from "./media.js";

export const accordion = {
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
