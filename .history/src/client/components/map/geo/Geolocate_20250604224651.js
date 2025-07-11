// Geolocate.js

let userCoordinates = null;

export const coordinateUser = async () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userCoordinates = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          console.log("User coordinates obtained:", userCoordinates);
          resolve(userCoordinates);
        },
        (error) => {
          console.error("Error getting user coordinates:", error);
          reject(error);
        }
      );
    } else {
      console.error("Geolocation not available");
      reject(new Error("Geolocation not available"));
    }
  });
};

console.log("DOES NOT WORK userCoordinates geolocate", userCoordinates);

coordinateUser().then((coordinates) => {
    userCoordinates = coordinates;
    console.log("User coordinates are: ", userCoordinates);
}).catch((error) => {
    console.error("Failed to get user coordinates: ", error);
});

export const coordinateStore = (store) => {
    if (store && store.location && store.location.geolocation) {
        console.log("!!!!!store geolocate", store);
        console.log("!!!!!geometry geolocate", store.location.geolocation);
        return [store.location.geolocation.lon, store.location.geolocation.lat];
    } else {
        console.log("Store location not available");
        return null;
    }
}

console.log("coordinateStore geolocate", coordinateStore);

export function storeDistance(pointA, pointB) {
    if (!pointA || !pointB) {
        console.warn("Invalid points provided to storeDistance");
        return null;
    }

    const R = 3958.8; // Radius of the Earth in miles
    const lat1 = pointA[1] * Math.PI / 180; // Convert degrees to radians
    const lat2 = pointB[1] * Math.PI / 180;
    const dLon = (pointB[0] - pointA[0]) * Math.PI / 180;

    const a = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2); // Distance in miles, rounded to 2 decimal places
}

export const GeolocateToStore = async (store) => {
    try {
        const pointA = await coordinateUser();
        const pointB = coordinateStore(store);
        
        if (pointA && pointB) {
            const distance = storeDistance(pointA, pointB);
            console.log("Store distance calculated:", distance);
            return distance;
        } else {
            console.warn("Could not calculate store distance - missing coordinates");
            return null;
        }
    } catch (error) {
        console.error("Error in GeolocateToStore:", error);
        return null;
    }
}

// export const GeolocateToStore = (store) => {
//     const pointA = coordinateUser();
//     const pointB = coordinateStore(store);
//     if (pointA && pointB) {
//           return storeDistance(pointA, pointB);
//     } else {
//         console.log("User location or store location not available");
//         return null;
//     }
// }

