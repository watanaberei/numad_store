import * as MapDistance from "./MapDistance.js";




export const storeDistance = {
    render: (location) => {
      const userLocation = location.find(loc => loc.name === 'userLocation').coordinates || [];
      const storeLocation = location.find(loc => loc.name === 'storeLocation').coordinates || [];
  
      const calculateDistance = MapDistance.calculateDistance(
        userLocation,
        storeLocation   
      );
      const storeRange = getStoreRange(calculateDistance);
  
      return calculateDistance;
    },
  };


export const storeRange = {
    render: (location) => {
      const userLocation = location.find(loc => loc.name === 'userLocation').coordinates || [];
      const storeLocation = location.find(loc => loc.name === 'storeLocation').coordinates || [];
  
      const calculateDistance = MapDistance.calculateDistance(
        userLocation,
        storeLocation
      );
      const storeRange = getStoreRange(calculateDistance);
  
      return storeRange;
    },
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
    } else if (currentRange > 12 && currentRange <= 21) {
      return "1hr+ Drive";
    } else {
      return "PACKED";
    }
  }
