// handle.js

export function getYelpLink(storeHandle) {
    let ratingYelpLink;
  
    storeHandle.forEach((storeHandle) => {
      if (storeHandle.key.toLowerCase() === 'yelp') {
        ratingYelpLink = storeHandle.value;
      }
    });
  
    return ratingYelpLink;
  }