// card-default.js
const createDefaultCard = {
  render: (variant, title, region, tagsHTML) => {
    const card = document.createElement('a');
    card.href = '/' + variant + '/' + slug;
    card.rel = 'noopener noreferrer nofollow';
    card.target = categoryType + '-${storeId}';
    card.onclick = function() {
        mapRouteFunction(userCoords, storeCoords);
    };

    card.className = 'default-item card-postListing-item listingPosts card-mid-item';
    card.innerHTML = `
      <div class="c1col2-p2 card-postListing-item-content">
        <div class="card-content-header">
          <div class="content-title">
            <span class="header04">${title}</span>
            <span class="text03">${subtitle}</span>
            <span class="text03">${region}</span>
          </div>
          <div class="data-current">
            <span class="data-time-text text01">2m Read</span>
          </div>
        </div>
        <div class="post-data">
          <div class="tag-collection">
            <div class="nav-list-divider">
              <div class="lineV"></div>
            </div>
            <div class="post-data">
              ${tagsHTML}
            </div>
          </div>
          <div class="lineH"></div>
        </div>
      </div>`;
    return card;
  }
};

export default createDefaultCard;
