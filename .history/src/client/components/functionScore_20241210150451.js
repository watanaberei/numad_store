// scoreFunction.js
import * as icon from '../icon/icon.js';

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