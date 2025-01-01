import * as YelpApi from "../../../server/data/yelp/yelpApi.js";

export const matchBusiness = async (storeName, storeLocation) => {
    try {
        // Clean up store name - remove descriptive text after comma
        const cleanStoreName = storeName.split(',')[0].trim();
        
        console.log("debug log: match01 - Starting business match with data:", { 
          originalName: storeName,
          cleanName: cleanStoreName,
          location: storeLocation 
        });

    // Method 1: Direct search with name and city/state
    const searchRequest1 = {
        term: cleanStoreName,
        location: storeLocation?.city ? 
          `${storeLocation.city}, ${storeLocation.state}` : 
          storeLocation?.state || 'CA',
        limit: 3
      };
    
    let searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest1);
    console.log("debug log: match02 - Method 1 results:", searchResults);
    // Method 2: Try with address if available
    if (!searchResults?.businesses?.[0] && storeLocation?.address) {
        const cleanAddress = storeLocation.address.split(',')[0].trim(); // Get first line of address
        const searchRequest2 = {
          term: cleanStoreName,
          location: cleanAddress,
          limit: 3
        };
        searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest2);
        console.log("debug log: match03 - Method 2 results:", searchResults);
      }

    // Method 3: Try with coordinates if available
    if (!searchResults?.businesses?.[0] && storeLocation?.geolocation) {
      const searchRequest3 = {
        term: storeName,
        latitude: storeLocation.geolocation.lat,
        longitude: storeLocation.geolocation.lon,
        radius: 1000, // 1km radius
        limit: 3
      };
      searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest3);
      console.log("debug log: match04 - Method 3 results:", searchResults);
    }

    // Method 4: Try broader search with business category
    if (!searchResults?.businesses?.[0]) {
      const searchRequest4 = {
        term: "coworking space",
        location: `${storeLocation?.city}, ${storeLocation?.state}`,
        limit: 10
      };
      searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest4);
      console.log("debug log: match05 - Method 4 results:", searchResults);

      // Filter results to find closest match to our store name
      if (searchResults?.businesses) {
        searchResults.businesses = searchResults.businesses.filter(business => 
          business.name.toLowerCase().includes('wework') ||
          business.name.toLowerCase().includes('we work')
        );
      }
    }

    if (!searchResults?.businesses?.[0]) {
      console.warn("debug log: match06 - No matching business found after all attempts");
      return null;
    }

    // Get the best match
    const bestMatch = searchResults.businesses[0];
    console.log("debug log: match07 - Best match found:", bestMatch);

    // Get detailed business data
    const businessData = await YelpApi.yelpApi.getBusinessDetails(bestMatch.id);
    console.log("debug log: match08 - Detailed business data:", businessData);

    // Transform and return the data
    const matchedData = {
      id: bestMatch.id,
      basic: YelpApi.yelpApi.transformBusinessData(businessData),
      details: businessData,
      hours: YelpApi.yelpApi.transformYelpHours(businessData),
      location: YelpApi.yelpApi.transformLocationAttributes(businessData),
      gallery: YelpApi.yelpApi.transformGalleryData(businessData),
      status: YelpApi.yelpApi.getBusinessStatus(businessData),
      matchMethod: businessData.matchMethod
    };

    console.log("debug log: match09 - Final transformed data:", matchedData);
    return matchedData;

  } catch (error) {
    console.error("Error in matchBusiness:", error);
    return null;
  }
};