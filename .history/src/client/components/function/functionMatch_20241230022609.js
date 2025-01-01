import * as YelpApi from "../../../server/data/yelp/yelpApi.js";

export const matchBusiness = async (storeName, storeLocation) => {
  try {
    console.log("debug log: match01 - Matching business:", { 
      name: storeName, 
      location: storeLocation 
    });

    // Validate inputs
    if (!storeName || !storeLocation?.city) {
      console.warn("debug log: match02 - Invalid input parameters");
      return null;
    }

    // Format location string
    const locationString = storeLocation.state ? 
      `${storeLocation.city}, ${storeLocation.state}` : 
      storeLocation.city;

    // Search request
    const searchRequest = {
      term: storeName,
      location: locationString,
      limit: 1
    };

    // Get initial search results
    const searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest);
    console.log("debug log: match03 - Search results:", searchResults);

    if (!searchResults?.businesses?.[0]) {
      console.warn("debug log: match04 - No matching business found");
      return null;
    }

    // Get detailed business data
    const businessId = searchResults.businesses[0].id;
    const businessData = await YelpApi.yelpApi.getBusinessDetails(businessId);
    console.log("debug log: match05 - Business details:", businessData);

    // Transform the data
    const matchedData = {
      id: businessId,
      basic: YelpApi.yelpApi.transformBusinessData(businessData),
      details: businessData,
      hours: YelpApi.yelpApi.transformYelpHours(businessData),
      location: YelpApi.yelpApi.transformLocationAttributes(businessData),
      gallery: YelpApi.yelpApi.transformGalleryData(businessData),
      status: YelpApi.yelpApi.getBusinessStatus(businessData)
    };

    console.log("debug log: match06 - Transformed data:", matchedData);
    return matchedData;

  } catch (error) {
    console.error("Error in matchBusiness:", error);
    return null;
  }
};
//   Location Section
 