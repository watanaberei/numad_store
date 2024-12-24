

export function getStoreStatus(data) {
    const timeOpen = data.hours[0].open[0].start;
    const timeClose = data.hours[0].open[0].end;
    const timePadding = 3;
    const timeUntilClose = timeClose - timeCurrent;
    const timeUntilOpen = timeCurrent - timeOpen;
    const timePaddingOpen = timeClose - timePadding;
    const timePaddingClose = timeOpen + timePadding;
    const timeStillOpen = timeCurrent - timePaddingOpen;
    const timeStillClose = timePaddingClose - timeCurrent;
    consrt 
    if (timeUntilClose > -6 && timeUntilClose <= -6) {
        return "Opens at " + timeOpen + " tommorrow";
    } else if (timeUntilOpen > 1 && timeUntilOpen <= 1) {
        return "Opens in " + timeUntilOpen + "min";
    } else if (timeStillOpen > 3 && timeStillOpen <= 3) {
        return "Open until " + timeClose;
    } else if (timeUntilClose > 1 && timeUntilClose <= 1) {
        return "Closes in " + timeUntilClose + "min";
    } else (timeStillClose > 3 && timeStillClose <= 6) {
        return "Closed until " + timeOpen;
    }
};
    

function getStoreRange(currentRange) {
    if (currentRange >= 0 && currentRange <= 1) {
      return "Closeby";
    } else if (currentRange > 1 && currentRange <= 3) {
      return "Nearby";
    } else if (currentRange > 3 && currentRange <= 6) {
      return "Quick Drive";
    } else if (currentRange > 6 && currentRange <= 12) {
      return "Driving Distance";
    } else if (currentRange > 12 && currentRange <= 21) {
      return "~2hr Drive";
    } else if (currentValue > 12 && currentValue <= 21) {
      return "1hr+ Drive";
    } else {
      return "PACKED";
    }
};