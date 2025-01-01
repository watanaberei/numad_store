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
    if (!searchResults?.businesses?.[0] && storeLocation?.geolocation?.lat) {
      const searchRequest3 = {
        term: cleanStoreName,
        latitude: storeLocation.geolocation.lat,
        longitude: storeLocation.geolocation.lon,
        radius: 2000, // Increased radius to 2km
        limit: 3
      };
      searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest3);
      console.log("debug log: match04 - Method 3 results:", searchResults);
    }

    // If no results found, return null
    if (!searchResults?.businesses?.[0]) {
      console.log("debug log: match05 - No matching business found");
      return {
        success: false,
        matchData: null,
        error: "No matching business found"
      };
    }

    // Get the best match
    const bestMatch = searchResults.businesses[0];
    console.log("debug log: match06 - Best match found:", bestMatch);

    // Get detailed business data
    const businessData = await YelpApi.yelpApi.getBusinessDetails(bestMatch.id);
    
    if (!businessData) {
      console.log("debug log: match07 - Failed to get business details");
      return {
        success: false,
        matchData: null,
        error: "Failed to get business details"
      };
    }

    // Transform and return the data
    const matchedData = {
      id: bestMatch.id,
      basic: YelpApi.yelpApi.transformBusinessData(businessData),
      details: businessData,
      hours: YelpApi.yelpApi.transformYelpHours(businessData),
      location: YelpApi.yelpApi.transformLocationAttributes(businessData),
      gallery: YelpApi.yelpApi.transformGalleryData(businessData),
      status: YelpApi.yelpApi.getBusinessStatus(businessData)
    };

    console.log("debug log: match08 - Final transformed data:", matchedData);
    return {
      success: true,
      matchData: matchedData,
      error: null
    };

  } catch (error) {
    console.error("Error in matchBusiness:", error);
    return {
      success: false,
      matchData: null,
      error: error.message
    };
  }
};