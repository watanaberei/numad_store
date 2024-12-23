// scoreFunction.js
export function getStatsScore(score) {
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