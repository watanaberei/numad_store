import * as icon from '../icon/icon.js';

export const geoTag = {
    render:(data) => {
        const score = data.score;
        const icon = data.icon;
        const label = data.label;
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
            <button class="geo-tag" id="geoTag" data-name="value">
                ${getStatsScore(score)}
                <div class="label">
                    <span class="text" id="text02">${label}</span>
                </div>
            </button>    
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