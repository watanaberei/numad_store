import * as YelpApi from "../../../server/data/yelp/yelpApi.js";

export const matchBusiness = async (storeName, storeLocation) => {
  try {
    // Clean up store name
    const cleanStoreName = storeName.split(',')[0].trim();
    
    console.log("Starting business match:", {
      originalName: storeName,
      cleanName: cleanStoreName,
      location: storeLocation
    });

    let searchResults;
    let matchMethod;

    // Try exact name match first
    const searchRequest1 = {
      term: cleanStoreName,
      location: `${storeLocation?.city}, ${storeLocation?.state}`,
      limit: 1
    };
    
    searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest1);
    console.log("Exact match results:", searchResults?.businesses?.length);
    
    if (searchResults?.businesses?.[0]) {
      matchMethod = 'exact';
    } else {
      // Try fuzzy name match
      const searchRequest2 = {
        term: cleanStoreName,
        location: `${storeLocation?.city}, ${storeLocation?.state}`,
        limit: 3
      };
      searchResults = await YelpApi.yelpApi.searchBusinesses(searchRequest2);
      console.log("Fuzzy match results:", searchResults?.businesses?.length);
      
      if (searchResults?.businesses?.[0]) {
        matchMethod = 'fuzzy';
      }
    }

    // Transform and return matched data
    if (searchResults?.businesses?.[0]) {
      const businessData = searchResults.businesses[0];
      console.log("Match found:", {
        method: matchMethod,
        yelpId: businessData.id,
        name: businessData.name
      });
      
      return {
        yelpId: businessData.id,
        matchMethod,
        confidence: matchMethod === 'exact' ? 1 : 0.8
      };
    }

    console.log("No match found");
    return null;

  } catch (error) {
    console.error("Error in matchBusiness:", error);
    throw error;
  }
};