import { yelpApi } from "./yelpApi.js";

export const yelp = {
  async getStoreData(businessId) {
    try {
      console.log(`Fetching store data for business ID: ${businessId}`);
      const data = await yelpApi.getBusinessDetails(businessId);
      const transformedData = this.transformBusinessData(data);
      console.log("Transformed store data:", transformedData);
      return transformedData;
    } catch (error) {
      console.error("Error getting store data:", error);
      return null;
    }
  },

  transformYelpHours(yelpData) {
    console.log("Processing Yelp hours data:", yelpData?.hours?.[0]?.open);

    if (!yelpData?.hours?.[0]?.open) {
      console.warn("No hours data available");
      return null;
    }

    const hoursData = yelpData.hours[0].open;
    const isCurrentlyOpen = yelpData.hours[0].is_open_now;

    // Get current time for comparison
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}${currentMinute}`;
    const currentDay = now.getDay();

    return {
      storeName: yelpData.name,
      isOpen: isCurrentlyOpen,
      currentTime: currentTime,
      schedule: hoursData.map((slot) => ({
        day: slot.day,
        start: slot.start,
        end: slot.end,
        isCurrent: slot.day === currentDay,
        isWithinHours:
          slot.day === currentDay &&
          currentTime >= slot.start &&
          currentTime <= slot.end
      }))
    };
  },

  transformBusinessData(yelpData) {
    console.log("Transforming business data:", yelpData);
    if (!yelpData) return null;

    return {
      name: yelpData.name,
      hours: [
        {
          is_open_now: yelpData.hours?.[0]?.is_open_now || false,
          open: yelpData.hours?.[0]?.open || []
        }
      ],
      location: {
        address: yelpData.location?.address1,
        city: yelpData.location?.city,
        state: yelpData.location?.state,
        area: yelpData.location?.neighborhood || "",
        geolocation: {
          lat: yelpData.coordinates?.latitude,
          lon: yelpData.coordinates?.longitude
        }
      },
      // Match StoreScreen_original.js mediaGallery structure
      mediaGallery: yelpData.photos?.map(photo => ({
        url: photo,
        description: `${yelpData.name} gallery image`
      })) || [],
      // Match hero.js headline structure
      headline: {
        text: yelpData.name,
        locationRegion: yelpData.location?.city || "",
        attributesArrays: this.transformAttributesArray(yelpData),
        storeURL: yelpData.url || ""
      }
    };
  },

  // Helper function to transform attributes into the expected format
  transformAttributesArray(yelpData) {
    let attributesArray = "";
    const attributes = yelpData.categories?.slice(0, 3) || [];
    
    attributes.forEach((category) => {
      attributesArray += `
        <div class="item">
            <div class="text">
              <span class="ink03 bold text03">${category.title}</span>
              <i class="glyph glyph-check-15"></i>
            </div>
        </div>`;
    });
    
    return attributesArray;
  },

  transformLocationAttributes(yelpData) {
    console.log("Transforming location attributes:", yelpData);
    if (!yelpData) return null;
    return {
      geotags: [
        {
          title: "Location",
          attributes: [
            {
              label: "Rating",
              score: yelpData.rating || 0,
              count: yelpData.review_count || 0
            },
            {
              label: "Price",
              score: yelpData.price?.length || 1,
              count: yelpData.review_count || 0
            }
          ]
        }
      ]
    };
  },

  transformGalleryData(yelpData) {
    console.log("Transforming gallery data:", yelpData);
    if (!yelpData) return null;
    return {
      hero: {
        url: "/gallery",
        gallery: yelpData.photos || []
      }
    };
  },

  getBusinessStatus(yelpData) {
    console.log("Checking business status:", yelpData);
    if (!yelpData?.hours?.[0]) return "Status unavailable";
    return yelpData.hours[0].is_open_now ? "Open" : "Closed";
  }
};
