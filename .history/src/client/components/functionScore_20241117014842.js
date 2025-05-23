// scoreFunction.js
import * as icon from '../icon/icon.js';

// export function getStatsScore(score) {
//   const iconScoreFull = icon.iconScoreFull;
//   const iconScoreHalf = icon.iconScoreHalf;
//   const iconScoreNone = icon.iconScoreNone;

//   let result = {
//     icon: iconScoreNone,
//     tooltip: "No score",
//     score: score
//   };

//   if (score === 0) {
//     result.icon = iconScoreNone;
//     result.tooltip = "Not rated";
//   } else if (score === 1) {
//     result.icon = iconScoreHalf;
//     result.tooltip = "Average";
//   } else if (score === 2) {
//     result.icon = iconScoreFull;
//     result.tooltip = "Excellent";
//   }

//   return result;
// }

export function getStatsScore(score) {
  console.log('getStatsScore called with:', score);
  
  const scoreResult = {
    icons: [
      { icon: icon.iconScoreNone, tooltip: "Not rated", score: 0 },
      { icon: icon.iconScoreHalf, tooltip: "Average", score: 1 },
      { icon: icon.iconScoreFull, tooltip: "Excellent", score: 2 }
    ],
    currentScore: Math.min(Math.max(0, score || 0), 2)
  };

  console.log('Score result:', scoreResult);
  return scoreResult;
}