import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import * as media from "./media.js";
import * as carousel from "./carousel.js";










export const experiences = {
  render: (store) => {
    
    // const snippet = store.snippetOverview;
    const mediaArea = store.mediaArea || [];
    const limit = 9; // replace with your desired limit

    // const mediaCarouselHTML = carousel.generateMediaCarouselSmall.render(mediaArea, limit);

    const carouselArea = generateMediaCarouselHTML(mediaArea, limit);
    // const carouselArea = media.generateMediaCarouselHTML(mediaArea);
    // console.log("carouselArea", carouselArea);
    // FACILITY


    const summaryFacility = store.attributesFacility || [];
    console.log("summaryFacility", summaryFacility);
    const limitedSummaryFacility06 = summaryFacility.slice(0, 6);
    // console.log("limitedstoreAttributes04",limitedSummaryFacility06);
    let summaryFacilityHTML = '';
    limitedSummaryFacility06.forEach(summaryFacility => {
        let iconString = summaryFacility.key.trim();
        iconString = iconString.charAt(0).toLowerCase() + iconString.slice(1).replace(/\s/g, '');

        summaryFacilityHTML += `
        <div class="item2">
          <i class="icon store-attributes-icon icon-attributes-${iconString}"></i>
          <div class="bullets2">
            <div class="title5">
              <div class="text03 bold">
                ${summaryFacility.key}
              </div>
            </div>
            <div class="subtitle">
            ${summaryFacility.value}
            </div>
          </div>
        </div>
        `;
    });



    return `

    <section class="section store-experience experience">

  
      
        <div class="header">
          <div class="headline">
            <span class="header03">Experience</span>
          </div>
        </div>
          ${element.lineH.render(30)}
        
        <div class="media-carousel">
          <div class="subsection-title">
            <div class="area">Area</div>
            <div class="see-all-0">See all (0)</div>
          </div>
          <div class="array-overflow">
            ${ carouselArea }
            <!--$ { carousel.generateMediaCarouselSmall.render(mediaArea, 9) }-->
          </div>
        </div>
        <div class="overview">
          <div class="title2">
            <span class="what-to-expect">What to Expect</span>
          </div>
          <div class="body-collapsable">
            <div class="body">
              <span
                class="the-seating-arrangement-of-the-facility-is-thoughtfully-arranged-to-embraced-the-shared-space-in-order-to-create-an-environment-similar-to-a-school-yard-during-lunch-break-the-seating-arrangement-of-the-facility-is-thoughtfully-arranged-to-embraced-the-shared-space-in-order-to-create-an-environment-similar-to-a-school-yard-during-lunch-break-fdsfsdfd"
              >
                ${store.snippetFacility}
                <br />
                fdsfsdfd
              </span>
            </div>
            <div class="button-more">
              <img class="show-more" src="show-more0.png" />
            </div>
          </div>
        </div>
        ${element.lineH.render(30)}
        
        
        <div class="summary">
          <div class="list">
            <div class="title4">
              <div class="body2">
                <span class="title3">Title</span>
              </div>
            </div>
            <div class="bullets">
              ${summaryFacilityHTML}
              <!--
              <div class="item2">
                <div class="icon"></div>
                <div class="bullets2">
                  <div class="title5">
                    <div class="title6">Title</div>
                  </div>
                  <div class="subtitle">subtitle</div>
                </div>
              </div>
              <div class="item2">
                <div class="icon"></div>
                <div class="bullets2">
                  <div class="title5">
                    <div class="title6">Title</div>
                  </div>
                  <div class="subtitle">subtitle</div>
                </div>
              </div>
              <div class="item2">
                <div class="icon"></div>
                <div class="bullets2">
                  <div class="title5">
                    <div class="title6">Title</div>
                  </div>
                  <div class="subtitle">subtitle</div>
                </div>
              </div>
              <div class="item2">
                <div class="icon"></div>
                <div class="bullets2">
                  <div class="title5">
                    <div class="title6">Title</div>
                  </div>
                  <div class="subtitle">subtitle</div>
                </div>
              </div>
              <div class="item2">
                <div class="icon"></div>
                <div class="bullets2">
                  <div class="title5">
                    <div class="title6">Title</div>
                  </div>
                  <div class="subtitle">subtitle</div>
                </div>
              </div>
              -->
            </div>
          </div>
          <div class="button">
            <div class="button-anchor">
              <button class="container">
                <div class="label-glyph">
                  <div class="text3">
                    <div class="button2">button</div>
                  </div>
                  <div class="glyph">
                    <div class="glyph-temp"></div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

      ${element.lineH.render(30)}
    </section>
   `;
  },
};



// FACILITY
function generateMediaCarouselHTML(mediaGallery, limit) {
  let mediaGalleryHTML = '';
  mediaGallery.slice(0, limit).forEach((mediaGalleryItem, index) => {
    const opacityClass = index >= 4 ? 'low-opacity' : '';
    mediaGalleryHTML += `
    <div class="media-img-s ${opacityClass}">
      <div class="media-img-container-s">
        <img src="${mediaGalleryItem.url}" class="gallery-item-img media-img-1-x-hx-s-container" alt="" />
      </div>
      <div class="caption-default">
        <div class="caption-container">
          <div class="glyph-inline">
            <div class="glyph-inline-12">
              <div class="glyph-text">
                <div class="ellipse-328"></div>
              </div>
            </div>
          </div>
          <div class="text-line">
            <div class="text-line-12">
              <div class="title">
                <span class="text03 bold">
                  ${mediaGalleryItem.description}
                </span>
              </div>                   
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  });
  return mediaGalleryHTML;
}

const generateMediaCarouselSmall = {
  render: (mediaArea, limit) => {
    let mediaGalleryHTML = '';
    mediaArea.slice(0, limit).forEach((mediaGalleryItem, index) => {
      const opacityClass = index >= 3 ? 'low-opacity' : '';
      const opacityPeakClass = index >= 3 ? 'low-opacity' : '';
      const opacityOuterClass = index >= 4 ? 'low-opacity' : '';

      checkImagesHasLoaded([mediaGalleryItem.url]).then(resolvedImages => {
        imageHasLoaded = true;
        const element = document.createElement("div");
        element.classList.add("item");
        element.style.transform = `matrix(1, 0, 0, 1, 0, 0)`;
        element.style.height = `${36 *
          resolvedImages[0].naturalHeight /
          resolvedImages[0].naturalWidth}vw`;
        const elementImage = document.createElement("div");
        elementImage.style.backgroundImage = `url(${mediaGalleryItem.url})`;
        element.appendChild(elementImage);

        imagesElement = [element];

        mediaGalleryHTML += `
        <div class="media-img-s ${opacityClass}">
          <div class="media-img-container-s">
            ${element.outerHTML}
          </div>
          <div class="caption-default">
            <div class="caption-container">
              <div class="glyph-inline">
                <div class="glyph-inline-12">
                  <div class="glyph-text">
                    <div class="ellipse-328"></div>
                  </div>
                </div>
              </div>
              <div class="text-line">
                <div class="text-line-12">
                  <div class="title">
                    <span class="text03 bold">
                      ${mediaGalleryItem.description}
                    </span>
                  </div>                   
                </div>
              </div>
            </div>
          </div>
        </div>`;
      });
    });
    return mediaGalleryHTML;
  }
};












