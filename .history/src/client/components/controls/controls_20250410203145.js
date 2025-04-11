
//'./src/client/components/control.js'

import * as glyph from "../icon/glyph.js";
import * as icon from "../icon/icon.js";
import * as components from "../components.js";
import * as element from "../elements.js";

export const controlTimeline = {
  render: (data) => {
    console.log("Rendering timeline controls with:", data);
    return `
        <div class="tools timeline-control col04">
          <div class="detail">
            <div class="status">
              <span class="label text02">Currently Packed</span>
            </div>
            ${components.seperatorStatus.render()}
            <span class="text02 detail-conditions sentance">
              <span class="temp">60°F</span>
              ${components.seperatorWords.render()}
              <span class="text02">Light Rain</span>
            </span>
          </div>
          <div class="control">
            <button class="control-jump">
              <div class="label">
                <span class="text02">Today</span>
              </div>
            </button>
            <div class="navigation">
              <button class="control-previous">
                <i class="icon-action-prev">${icon.iconActionPrev}</i>
              </button>
              <button class="control-next">
                <i class="icon-action-next">${icon.iconActionNext}</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    <!--
      <div class="timeline-tools timeline col04">
        <div class="timeline-detail">
          <div class="status">
            <span class="label text02">Currently Packed</span>
          </div>
          ${components.seperatorStatus.render()}
          <span class="text02 detail-conditions sentance">
            <span class="temp">60°F</span>
            ${components.seperatorWords.render()}
            <span class="text02">Light Rain</span>
          </span>
        </div>
        <div class="timeline-control">
          <button class="control-jump">
            <div class="label">
              <span class="text02">Today</span>
            </div>
          </button>
          <div class="navigation">
            <button class="control-previous">
              <i class="icon-action-prev">${icon.iconActionPrev}</i>
            </button>
            <button class="control-next">
              <i class="icon-action-next">${icon.iconActionNext}</i>
            </button>
          </div>
        </div>
      </div>-->
      `;
    },
    // return `
    //     <div class="tool col04">
    //   <div class="detail col04">
    //     <span class="status-text text02">
    //       ${
    //         data.isCurrentlyActive ? "Currently Active" : "Currently Inactive"
    //       } 
    //     </span>
    //     ${components.seperatorStatus.render()} 
    //     <span class="text02 detail-conditions sentence">
    //       <span class="temp">
    //         ${data.temperature || "75"}°F
    //       </span>
    //         ${components.seperatorWords.render()}
    //       <span class="condition">
    //         ${data.periodLabel || "Light Rain"}
    //       </span>
    //     </span>
    //   </div>
    //   <div class="control timeline-control col04">
    //     <button class="control-jump">
    //       <div class="label">
    //         <span class="text02">Today</span>
    //       </div>
    //     </button>

    //     <div class="navigation">
    //       <button class="control-previous">
    //         <i class="icon-action-prev"></i>
    //       </button>
    //       <button class="control-next">
    //         <i class="icon-action-next"></i>
    //       </button>
    //     </div>

    //   </div>
        
    // `;
  // },

    // return `
      // <div class="timeline-indicator">
      //   <div class="current-time-marker"></div>
      //   <div class="timeline-items">
      //     ${Array(24)
      //       .fill()
      //       .map(
      //         (_, i) => `
      //       <div class="timeline-item ${
      //         i === new Date().getHours() ? "current" : ""
      //       }" 
      //             data-hour="${i}">
      //         <span class="hour-label">${i}:00</span>
      //       </div>
      //     `
      //       )
      //       .join("")}
      //   </div>
      // </div>
  //   `;
  // },

  initializetimelineControl: (container, options = {}) => {
    console.log("Initializing timeline controls:", container);

    const timeline = container.querySelector(".timeline");
    const items = container.querySelectorAll(".timeline-item");
    const tools = container.querySelector(".timeline-tools");
    const prevButton = container.querySelector(".control-prev");
    const nextButton = container.querySelector(".control-next");
    const marker = container.querySelector(".current");

    console.log("_______", timeline, items, tools, prevButton, nextButton, marker);

    let currentViewStart = 0;
    const itemsPerView = options.itemsPerView || 8;
    const totalSlots = items.length;

    const updateTimelineView = (newStart) => {
      console.log("Updating timeline view to start at:", newStart);

      currentViewStart = Math.max(
        0,
        Math.min(newStart, totalSlots - itemsPerView)
      );

      timeline.style.transform = `translateX(-${
        (currentViewStart / totalSlots) * 100
      }%)`;

      items.forEach((item, index) => {
        const isVisible =
          index >= currentViewStart && index < currentViewStart + itemsPerView;
        item.classList.toggle("visible", isVisible);
      });

      prevButton.disabled = currentViewStart === 0;
      nextButton.disabled = currentViewStart >= totalSlots - itemsPerView;
    };

    const updateCurrentTimeMarker = () => {
      const now = new Date();
      const percent =
        ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;
      marker.style.left = `${percent}%`;
    };

    updateTimelineView(0);
    updateCurrentTimeMarker();

    prevButton.addEventListener("click", () => {
      updateTimelineView(currentViewStart - itemsPerView);
    });

    nextButton.addEventListener("click", () => {
      updateTimelineView(currentViewStart + itemsPerView);
    });

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const hour = item.dataset.hour;
        item.setAttribute("title", `${hour}:00`);
        item.classList.add("hover");
      });

      item.addEventListener("mouseleave", () => {
        item.classList.remove("hover");
      });
    });

    setInterval(updateCurrentTimeMarker, 60000);

    return {
      updateTimelineView,
      updateCurrentTimeMarker,
    };
  },
};


export const controlUser = {
  render: (data) => {
    const user = icon.iconUserRating;
    const comment = icon.iconUserComment;
    const review = icon.iconUserReview;
    const like = icon.iconUserImpressionsLike;
    const dislike = icon.iconUserImpressionsDislike;
    const store = data;




    const dividerH = element.dividerH.render();
    const dividerV = element.dividerV.render();
    const modifiedDateData = '03/03/2024';
    const userCount = 333;
    const dateModified = element.timestamp.render(modifiedDateData);
    let count = {
        countRating: data?.contributionsCount || 0,
        countReview: data?.reviewsCount || 0,
        countComment: data?.commentsCount || 0,
        countLike: data?.likesCount || 0,
        countDislike: data?.dislikesCount || 0
    }
    const countDefault = element.countDefault;
    const countParenthesis = element.countDefault;


    return `
    
    <div class="content col04">
      <div class="user-controls   info sentance alignV-center text02 col02">


        <div class="stamp   info  alignV-center text02 col02">



          <!--<div class="contributions   text02 glyph">-->

            <span class="contributions   text02 glyph sentance">
              ${user}
              ${countDefault.render(count.countRating)}
            </span>

          <!--</div> -->
          
          ${dividerV}

          <div class="modified   sentance">

            <!--<span class="sentance">-->
              Modified 
              ${data?.modifiedDate || "N/A"}, ${data?.modifiedTime || 0} min
            <!--</span>-->

          </div>



        </div>




        <div class="actions   controls col02 array  alignH-right">

        
          <div class="score   col02">

            <button class="comments   label impression-item text02 glyph">
              ${comment}
              <span class="text02">
                Comments
              </span>
              <span class="count">
              ${countParenthesis.render(count.countComment)}
              </span>
            </button>

            <button class="reviews   label impression-item text02 glyph">
                ${review}
                <span class="text02">
                  Reviews
                </span>
                <span class="count">
                  ${countParenthesis.render(count.countReview)}
                </span>
            </button>



          </div>



          ${dividerV}



          <div id="userImpression" class="impression disabled pair">



            <button class="impression-button like active   impression-item text02 glyph" onclick="storeActions.toggleImpression('${store.storeId}', 'like')">
              ${like}
              <span class="label">${countDefault.render(count.countLike)}</span>
            </button>

            <button class="impression-button dislike   impression-item text02 glyph" onclick="storeActions.toggleImpression('${store.storeId}', 'dislike')">
              ${dislike}
              <span class="label">${countDefault.render(count.countDislike)}</span>
            </button> 



          </div>



        </div>



      </div>
    </div>          
    `;
  },
};