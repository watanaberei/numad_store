import { yelpApi } from "./yelpApi.js";

export const yelp = {
  async getStoreData(businessId) {
    try {
      console.log(`[yelp.getStoreData] Starting fetch for business ID: ${businessId}`);
      const data = await yelpApi.getBusinessDetails(businessId);
      console.log("[yelp.getStoreData] Raw Yelp data received:", data);
      
      const transformedData = this.businessData(data);
      console.log("[yelp.getStoreData] Final transformed data:", transformedData);
      return transformedData;
    } catch (error) {
      console.error("[yelp.getStoreData] Error:", error);
      return null;
    }
  },

  businessData(yelpData) {
    console.log("[yelp.businessData] Starting transformation of:", yelpData);
    if (!yelpData) {
      console.warn("[yelp.businessData] No data provided");
      return null;
    }

    const transformedData = {
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
      mediaGallery: this.transformMediaGallery(yelpData),
      headline: this.transformHeadline(yelpData),
      storeIntro: this.transformStoreIntro(yelpData),
      storeServices: this.transformStoreServices(yelpData)
    };

    console.log("[yelp.businessData] Transformed data:", transformedData);
    return transformedData;
  },

  mediaGallery(yelpData) {
    console.log("[yelp.transformMediaGallery] Processing photos:", yelpData.photos);
    const gallery = yelpData.photos?.map(photo => ({
      url: photo,
      description: `${yelpData.name} gallery image`
    })) || [];
    console.log("[yelp.transformMediaGallery] Transformed gallery:", gallery);
    return gallery;
  },

  headline(yelpData) {
    console.log("[yelp.transformHeadline] Creating headline from:", yelpData.name);
    const headline = {
      text: yelpData.name,
      locationRegion: yelpData.location?.city || "",
      attributesArrays: this.transformAttributesArray(yelpData),
      storeURL: yelpData.url || ""
    };
    console.log("[yelp.transformHeadline] Transformed headline:", headline);
    return headline;
  },

  attributesArray(yelpData) {
    console.log("[yelp.transformAttributesArray] Processing categories:", yelpData.categories);
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
    
    console.log("[yelp.transformAttributesArray] Generated HTML:", attributesArray);
    return attributesArray;
  },

  storeIntro(yelpData) {
    console.log("[yelp.transformStoreIntro] Creating store intro from:", yelpData);
    const storeIntro = {
      recommendFacilityText: this.getRecommendFacilityText(),
      recommendFacilityPictogram: this.getRecommendFacilityPictogram(),
      recommendValue: "90%",
      snippetOverview: yelpData.snippet || "",
      title: yelpData.name,
      neustar: null, // Add if available from Yelp
      buttonFloating: "labelButton",
      headlineText: yelpData.name,
      locationRegion: yelpData.location?.city || "",
      attributesArrays: this.transformAttributesArray(yelpData),
      storeType: yelpData.categories?.[0]?.title || "",
      storeCategory: yelpData.categories?.[0]?.alias || ""
    };
    console.log("[yelp.transformStoreIntro] Transformed store intro:", storeIntro);
    return storeIntro;
  },

  storeServices(yelpData) {
    console.log("[yelp.transformStoreServices] Creating store services from:", yelpData);
    const storeServices = {
      recommendFacilityText: this.getRecommendFacilityText(),
      recommendFacilityPictogram: this.getRecommendFacilityPictogram(),
      recommendValue: "90%",
      snippetOverview: yelpData.snippet || "",
      title: yelpData.name,
      neustar: null,
      buttonFloating: "labelButton",
      headlineText: yelpData.name,
      locationRegion: yelpData.location?.city || "",
      attributesArrays: this.transformAttributesArray(yelpData),
      attributeService: [],
      snippetService: [],
      mediaTopThree: yelpData.photos?.slice(0, 3).map(photo => ({
        url: photo,
        description: `${yelpData.name} service image`
      })) || [],
      mediaGallery: this.transformMediaGallery(yelpData),
      storeType: yelpData.categories?.[0]?.title || "",
      storeCategory: yelpData.categories?.[0]?.alias || ""
    };
    console.log("[yelp.transformStoreServices] Transformed store services:", storeServices);
    return storeServices;
  },

  getRecommendFacilityText() {
    const text = `
      <div class="item">
          <a class="coffee-bar">Coffee Bar</a>
          <span class="div">,</span>
      </div>
      <div class="item">
          <a class="main-room">Main Room</a>
          <span class="div">,</span>
      </div>
      <div class="item">
          <a class="back-corner-room">Back Corner Room</a>
          <span class="div">,</span>
      </div>
      <div class="item">
          <a class="outdoor-patio">Outdoor Patio</a>
          <span class="div">,</span>
      </div>
      <div class="item">
          <a class="bathroom">Bathroom</a>
      </div>`;
    console.log("[yelp.getRecommendFacilityText] Generated facility text");
    return text;
  },

  getRecommendFacilityPictogram() {
    const pictogram = `
      <div class="pictogram">
          <i class="pictogram-facility-indoor-30"></i>
      </div>
      <div class="pictogram">
        <i class="pictogram-facility-outdoor-30"></i>
      </div>`;
    console.log("[yelp.getRecommendFacilityPictogram] Generated facility pictogram");
    return pictogram;
  }
};
