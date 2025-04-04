import * as icon from '../icon/icon.js';

const geoTag = {
    render:(data) => {
        const tags = data;
    
        
        const score = tags.score;
        console.log("____",tags);
        function getStatsScore(score) {
            // const stats = document.createElement('div');
            const iconScoreFull = icon.iconScoreFull;
            const iconScoreHalf = icon.iconScoreHalf;
            const iconScoreNone = icon.iconScoreNone; 
            // stats.classList.add('status');
            if (score == 0) {
                return iconScoreNone;
            } else if (score == 1) {
                return iconScoreHalf;
            } else if (score == 2) {
                return iconScoreFull;
            } else {
                return iconScoreNone;
            }
        }
    return `
        <div class="tag-array">
            ${data.tags.map(tag => `
                ${geoTag(tag)}
                <button class="geo-tag" id="geoTag" data-name="value">
                    ${getStatsScore(tag.score)}
                    <div class="label">
                        <span class="text" id="text02">${tag.label}</span>
                    </div>
                </button>    
                `).join('')}
                ${data.moreTags ? `
                <div class="more">
                    <div class="text-underline text02">
                        <div class="count">
                            ${data.moreTagsIcon}
                            <div class="more-text">${data.moreTags}</div>
                        </div>
                        <div class="more-text">more</div>
                        </div>
                    </div>
            ` : ''}
        </div>
        `;
    },
};


export default geoTag;




function getStatsScore(score) {
    // const stats = document.createElement('div');
    const iconScoreFull = icon.iconScoreFull;
      const iconScoreHalf = icon.iconScoreHalf;
      const iconScoreNone = icon.iconScoreNone; 
    // stats.classList.add('status');
    if (score == 0) {
      return iconScoreNone;
    } else if (score == 1) {
      return iconScoreHalf;
    } else if (score == 2) {
      return iconScoreFull;
    } else {
      return iconScoreNone;
    }
  }