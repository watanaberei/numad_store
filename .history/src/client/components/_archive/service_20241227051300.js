import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import * as media from "./media.js";

export const services = {
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
        iconString = iconString.charAt(0).toLowerCase() + iconString.slice(1).replace(/\s/g, '');

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
    <section class="section store-service service">
        <div class="container">
            <div class="header">
                <div class="headline">
                    <span class="header03 inkw03">Service</span>
                </div>
            </div>
            ${element.lineDarkH.render(30)}
            <div class="media-lineup">
               
                    <div class="eyebrow">
                        <div class="text">
                            <span class="text03 Bold inkw03">Area</span>
                        </div>
                        <div class="button-more">
                            <span class="text03 Bold inkw03">See all (${mediaGalleryCount})</span>
                        </div>
                    </div>
                    <div class="top">
                        ${ media.generateMediaCarouselLineup.render(mediaTopThree, 3) }
                        <!-- 
                        <div class="media-img-m">
                            <div class="media-img">
                                <div class="media-img-1-x-1-x-m"></div>
                            </div>
                            <div class="text2">
                                <div class="caption-container">
                                    <div class="icon-container">
                                        <div class="icon-container2"></div>
                                    </div>
                                    <div class="text3">
                                        <div class="title">
                                            <div class="text-line">01</div>
                                        </div>
                                        <span class="subtitle">
                                            <div class="text-line-copy-here">Outside</div>
                                        </span> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="media-img-m">
                            <div class="media-img">
                                <div class="media-img-1-x-1-x-m"></div>
                            </div>
                            <div class="text2">
                                <div class="caption-container">
                                    <div class="icon-container">
                                        <div class="icon-container2"></div>
                                    </div>
                                    <span class="text3">
                                    
                                            <span class="title text-line">01</span>

                                
                                            <span class="subtitle text-line-copy-here">Outside</span>
                                    
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="media-img-m">
                            <div class="media-img">
                                <div class="media-img-1-x-1-x-m"></div>
                            </div>
                            <div class="text2">
                                <div class="caption-container">
                                    <div class="icon-container">
                                        <div class="icon-container2"></div>
                                    </div>
                                    <div class="text3">
                                        <div class="title">
                                            <div class="text-line">01</div>
                                        </div>
                                        <div class="subtitle">
                                            <div class="text-line-copy-here">Outside</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        -->
                    </div>
             
            </div>
            ${element.lineDarkH.render(30)}
            <div class="overview">
                <div class="title2">
                    <span class="text03 inkw03">Services and Offerings</span>
                </div>
                <div class="body-collapsable">
                    <div class="body">
                        <span class="text03 inkw03">${snippetService}</span>
                    </div>
                    <div class="button-more2">
                        <div class="show-more" />
                    </div>
                </div>
            </div>
            ${element.lineDarkH.render(30)}
            <div class="summary-one-col">
                <div class="summary-container">
                    <div class="title3">
                        <div class="frame-1321321852">
                            
                            <span class="summary">Summary</span>
                        </div>
                    </div>
                    <div class="bullets">
                        ${attributeServiceHTML}
                        <!--
                        <div class="item">
                            <div class="icon"></div>
                            <div class="bullets">
                                <div class="title4">
                                    <z class="title5">Title</div>
                                </div>
                                <div class="subtitle2">
                                    <div class="subtitle3">subtitle</div>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="icon"></div>
                            <div class="bullets">
                                <div class="title4">
                                    <div class="title5">Title</div>
                                </div>
                                <div class="subtitle2">
                                    <div class="subtitle3">subtitle</div>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="icon"></div>
                            <div class="bullets">
                                <div class="title4">
                                    <div class="title5">Title</div>
                                </div>
                                <div class="subtitle2">
                                    <div class="subtitle3">subtitle</div>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="icon"></div>
                            <div class="bullets">
                                <div class="title4">
                                    <div class="title5">Title</div>
                                </div>
                                <div class="subtitle2">
                                    <div class="subtitle3">subtitle</div>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="icon"></div>
                            <div class="bullets">
                                <div class="title4">
                                    <div class="title5">Title</div>
                                </div>
                                <div class="subtitle2">
                                    <div class="subtitle3">subtitle</div>
                                </div>
                            </div>
                        </div>
                        -->
                    </div>
                    <button class="cta">
                        <div class="cta-popup">
                            <span class="search-field">
                                <span class="cta-popup2">cta-popup</span>
                                <i class="glyph-container"></i>
                            </span>
                        </div>
                    </button>
                </div>  
            </div> 
        </div> 
    </section>


   `;
  },
};
