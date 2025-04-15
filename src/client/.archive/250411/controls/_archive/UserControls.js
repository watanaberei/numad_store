import { format, parseISO } from "date-fns";
import * as element from "../../elements.js";
import { count } from "d3";

export const userControl = {
    render: (store, userData = {}) => {
      const dividerH = element.dividerH.render();
      const dividerV = element.dividerV.render();
      const modifiedDateData = '03/03/2024';
      const userCount = 333;
      const dateModified = element.timestamp.render(modifiedDateData);
      let count = {
          countRating: userData.rating || 0,
          countReview: userData.review || 0,
          countComment: userData.comment || 0,
          countLike: userData.totalLikes || 0,
          countDislike: userData.totalDislikes || 0
      }
    const countDefault = element.countDefault;
    const countParenthesis = element.countDefault;

    return `
    <div class="user-controls">
      ${dividerH}
      <div class="content">


      
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
            <button class="impression-button like active" onclick="storeActions.toggleImpression('${store.storeId}', 'like')">
              <i class="icon-user-rating-like-12px"></i>
              <span class="label">${countDefault.render(count.countLike)}</span>
            </button>

            <button class="impression-button dislike" onclick="storeActions.toggleImpression('${store.storeId}', 'dislike')">
              <i class="icon-user-rating-dislike-12px"></i>
              <span class="label">${countDefault.render(count.countDislike)}</span>
            </button> 
          </div>
        </div>
      </div>
    </div>
    `;
  },
};