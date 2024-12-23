
//'./src/client/components/control.js'

import * as glyph from "../icon/glyph.js";
import * as icon from "../icon/icon.js";
import * as components from "../components/components.js";

export const datavisControl = {
  render: (data) => {
    console.log("Rendering datavis controls with:", data);

    return `
    <div class="tool col04">
      <div class="detail col04">
        <span class="status-text text02">
          ${
            data.isCurrentlyActive ? "Currently Active" : "Currently Inactive"
          } 
        </span>
        ${components.seperatorStatus.render()} 
        <span class="text02 detail-conditions sentence">
          <span class="temp">
            ${data.temperature || "75"}°F
          </span>
            ${seperatorWord}
          <span class="condition">
            ${data.periodLabel || "Light Rain"}
          </span>
        </span>
      </div>
      <div class=" datavis-controls-container col04">
        <div class="datavis-navigation array">
          <button class="datavis-nav-button control-prev" aria-label="Previous hour">
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M5 0.5L1 4.5L5 8.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          
          <div class="datavis-indicator">
            <div class="current-time-marker"></div>
            <div class="datavis-items">
              ${Array(24)
                .fill()
                .map(
                  (_, i) => `
                <div class="datavis-item ${
                  i === new Date().getHours() ? "current" : ""
                }" 
                     data-hour="${i}">
                  <span class="hour-label">${i}:00</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <button class="datavis-nav-button control-next" aria-label="Next hour">
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M1 0.5L5 4.5L1 8.5" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
        
      </div>
    </div>
    `;
  },

  initialize: (container, options = {}) => {
    console.log("Initializing datavis controls:", container);

    const datavis = container.querySelector(".datavis");
    const items = container.querySelectorAll(".datavis-item");
    const tools = container.querySelector(".tools");
    const prevButton = container.querySelector(".control-prev");
    const nextButton = container.querySelector(".control-next");
    const marker = container.querySelector(".current");

    let currentViewStart = 0;
    const itemsPerView = options.itemsPerView || 8;
    const totalSlots = items.length;

    const updateTimelineView = (newStart) => {
      console.log("Updating datavis view to start at:", newStart);

      currentViewStart = Math.max(
        0,
        Math.min(newStart, totalSlots - itemsPerView)
      );

      datavis.style.transform = `translateX(-${
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
