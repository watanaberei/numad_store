import * as icon from '../icon/icon.js';

export const geoTag = {
    render:(data) => {
        const tags = data.tags || [];
      
        const score = tags.score;
        console.log(tags);
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
    `;
  },
};





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