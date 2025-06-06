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

    console.log(
      "_______",
      timeline,
      items,
      tools,
      prevButton,
      nextButton,
      marker
    );

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
      updateCurrentTimeMarker
    };
  }
};

export const controlUser = {
  render: (data) => {
    const user = icon.iconUserRating;
    const comment = icon.iconUserComment;
    const review = icon.iconUserReview;
    const like = icon.iconUserImpressionsLike;
    const dislike = icon.iconUserImpressionsDislike;
    const store = data;
    // const controlUser = controls.controlUser.render(data);

    const dividerH = element.dividerH.render();
    const dividerV = element.dividerV.render();
    const modifiedDateData = "03/03/2024";
    const userCount = 333;
    const dateModified = element.timestamp.render(modifiedDateData);
    let count = {
      countRating: 0,
      countReview: 0,
      countComment: 0,
      countLike: 0,
      countDislike: 0
    };
    const countDefault = element.countDefault;
    const countParenthesis = element.countDefault;

    return `
    <div class="user-controls">
  

      ${dividerH}
      
      <div class="content info sentance alignV-center text02 col02">


      
        <div class="stamp">
          <div class="contributions">
              <i class="icon icon-user-rating-rating-12px"></i>
              ${countDefault.render(count.countRating)}
          </div>

          ${dividerV}

          <div class="modified">
            <span class="label">
              <span class="text02">Modified</span>
            </span>
            ${dateModified}
            <div class="count">
              <span class="text02 date">
                <span class="text02">06</span>
                <span class="text02 divider-h">/</span>
                <span class="text02">06</span>
                <span class="text02 divider-h">/</span>
                <span class="text02">24</span>
                <span class="text02 divider-h">,</span>
              </span>
              <div class="time">
                <div class="count">
                  <div class="text02">3</div>
                </div>
                <div class="text02 min">min</div>
              </div>
            </div>
          </div>



        </div>




        <div class="actions">
          <div class="score">



          <button class="comments">
            <i class="icon-user-rating-comment-12px"></i>
            <span class="label">
              <span class="text02">Comments</span>
              ${countParenthesis.render(count.countComment)}
            </span>
          </button>


          <button class="reviews">
            <i class="icon-user-rating-review-12px"></i>
            <span class="label">
              <span class="text02">Reviews</span>
              ${countParenthesis.render(count.countReview)}
            </span>
          </button>


        </div>



        ${dividerV}

          <div id="userImpression" class="impression disabled">
            <button class="impression-button like active" onclick="storeActions.toggleImpression('${
              data.storeId
            }', 'like')">
              <i class="icon-user-rating-like-12px"></i>
              <span class="label">${countDefault.render(count.countLike)}</span>
            </button>

            <button class="impression-button dislike" onclick="storeActions.toggleImpression('${
              data.storeId
            }', 'dislike')">
              <i class="icon-user-rating-dislike-12px"></i>
              <span class="label">${countDefault.render(
                count.countDislike
              )}</span>
            </button> 
          </div>
        </div>
      </div>
    </div>
    `;
  }
};
