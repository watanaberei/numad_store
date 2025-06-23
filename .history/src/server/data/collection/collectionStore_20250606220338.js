import { Yelp } from "../yelp/yelp.js";


// Debug logging helper
const debugLog = (location, message, data) => {
  console.log(`[DEBUG][${location}]`, message, data ? data : "");
};

export class StoreData {
  constructor() {
    this.activeTags = [];
    this.yelp = Yelp;
    // this.yelpData = Yelp.getStoreData(slug);
    this.socket = io("http://localhost:4000");
    // this.socket = io("http://localhost:6000");
  }

  // async getAllStores() {
  //   try {
  //     debugLog("!00:getAllStores", "Starting fetch for all stores");

  //     // 1. Get all data from DataPost
  //     const dataBlog = new DataPost();
  //     const allData = await dataBlog.getData();
  //     // debugLog("!01:getAllStores", "All data items:", allData?.length);

  //     // 2. Filter for stores
  //     const storeData = allData.filter(item => item.variant === 'stores');
  //     // debugLog("!02:getAllStores", "Store items:", storeData?.length);

  //     if (!storeData?.length) {
  //       console.error("!03:getAllStores", "No stores found");
  //       return [];
  //     }

  //     // 3. Get Yelp data and combine for each store
  //     const combinedStores = await Promise.all(storeData.map(async (store) => {
  //       const storesParams = {
  //         storeName: store.headline?.text,
  //         storeAddress: store.location?.address,
  //         storeCity: address.city(store.location?.address),
  //         storeState: address.state(store.location?.address),
  //         storeLongitude: store.location?.geolocation?.lon,
  //         storeLatitude: store.location?.geolocation?.lat
  //       };
  //       console.log("!04:[StoreData.getAllStores] storeParams:", storesParams);

  //       // Get Yelp data
  //       const yelpData = await this.yelp.getStoreData(storesParams);
  //       const yelpFoodData = await this.yelp.getFoodData(yelpData);
  //       // const yelpFoodData = await this.yelp.getFoodData(storesParams);
  //       // debugLog("!05:getAllStores", "Yelp data for store:", store.slug, yelpData);

  //       // Combine store and Yelp data
  //       return {
  //         ...store,
  //         yelpFoodData: yelpFoodData,
  //         yelpData: yelpData
  //           ? {
  //               ...yelpData,
  //               hours: this.transformYelpHours(yelpData),
  //               data: this.heroData(yelpData)
  //             }
  //           : null,
  //           // yelpFoodData: yelpFoodData
  //           // ? {
  //           //     ...yelpFoodData,
  //           //     food: this.serviceData(yelpFoodData)
  //           //   }
  //           // : null
  //       };
  //     }));

  //     // debugLog("!06:getAllStores", "Combined stores:", combinedStores?.length);
  //     return combinedStores;

  //   } catch (error) {
  //     console.error("getAllStores", "Error:", error);
  //     return [];
  //   }
  // }
  async getAllStores() {
    try {
      debugLog("!00:getAllStores", "Starting fetch for all stores");
  
      // 1. Get all data from DataPost
      const dataBlog = new DataPost();
      const allData = await dataBlog.getData();
      // debugLog("!01:getAllStores", "All data items:", allData?.length);
  
      // 2. Filter for stores
      const storeData = allData.filter(item => item.variant === 'stores');
      // debugLog("!02:getAllStores", "Store items:", storeData?.length);
  
      if (!storeData?.length) {
        console.error("!03:getAllStores", "No stores found");
        return [];
      }
  
      // 3. Get Yelp data and combine for each store
      const combinedStores = await Promise.all(storeData.map(async (store) => {
        const storesParams = {
          storeName: store.headline?.text,
          storeAddress: store.location?.address,
          storeCity: address.city(store.location?.address),
          storeState: address.state(store.location?.address),
          storeLongitude: store.location?.geolocation?.lon,
          storeLatitude: store.location?.geolocation?.lat
        };
        console.log("!04:[StoreData.getAllStores] storeParams:", storesParams);
  
        // Get basic Yelp data first
        const yelpData = await this.yelp.getStoreData(storesParams);
        
        // Add a delay before fetching food data to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Then get food data if we have a valid business
        let yelpFoodData = null;
        if (yelpData && yelpData.id) {
          // Use the ID from the first request
          const foodParams = { ...storesParams, yelpId: yelpData.id };
          yelpFoodData = await this.yelp.getFoodData(foodParams);
        }
  
        // Combine store and Yelp data
        return {
          ...store,
          yelpFoodData: yelpFoodData ? {
            ...yelpFoodData,
            food: this.serviceData(yelpFoodData)
          } : null,
          yelpData: yelpData
            ? {
                ...yelpData,
                hours: this.transformYelpHours(yelpData),
                data: this.heroData(yelpData)
              }
            : null
        };
      }));
  
      // debugLog("!06:getAllStores", "Combined stores:", combinedStores?.length);
      return combinedStores;
  
    } catch (error) {
      console.error("getAllStores", "Error:", error);
      return [];
    }
  }

  async getStoreBySlug(slug) {
    try {
      // debugLog("!00:getStoreBySlug", "Starting fetch for slug:", slug);
      console.log(`[data.js] Looking for store with slug: ${slug}`);

      // 1. Get store data from DataPost
      const dataBlog = new DataPost();
      const storeData = await dataBlog.getData();
      console.log(`[data.js] Got ${storeData?.length || 0} stores from DataPost`);
      // debugLog("!01:getStoreBySlug", "All stores:", storeData?.length);

      // 2. Filter for valid q22stores and find matching store
      if (!storeData || storeData.length === 0) {
        console.warn(`[data.js] No store data available from DataPost`);
        return this.createDefaultStore(slug);
      }
      
      const validStores = storeData.filter((store) => store.slug);
      console.log(`[data.js] Found ${validStores?.length || 0} valid stores with slugs`);
      // debugLog("!02:getStoreBySlug", "Valid stores:", validStores?.length);
 
      // const matchedStore = validStores.find((s) => s.slug === slug);
      let matchedStore = validStores.find((s) => s.slug === slug);
      // debugLog("!03:getStoreBySlug", "Found matching store:", matchedStore);

      // 3. If no matching store, try to match with partial slug
      if (!matchedStore) {
        console.warn(`[data.js] No exact match found for slug: ${slug}`);
        
        // Try to find a partial match
        matchedStore = validStores.find((s) => slug.includes(s.slug) || s.slug.includes(slug));
        
        if (matchedStore) {
          console.log(`[data.js] Found partial match: ${matchedStore.slug}`);
        } else {
          console.error(`[data.js] No match found for slug: ${slug}`);
          return this.createDefaultStore(slug);
        }
      }

      // 4. Prepare store parameters for Yelp API calls
      const storeParams = {
        storeName: matchedStore.headline?.text,
        storeAlias: matchedStore.alias,
        storeId: matchedStore.id,
        storeAddress: matchedStore.location?.address,
        storeCity: address.city(matchedStore.location?.address),
        storeState: address.state(matchedStore.location?.address),
        storeLongitude: matchedStore.location?.geolocation?.lon,
        storeLatitude: matchedStore.location?.geolocation?.lat
      };
      console.log("[StoreData.getStoreBySlug] Store parameters:", storeParams);

      // 5. Get all Yelp data using different endpoints
      const yelpData = await this.yelp.getStoreData(storeParams);
      const yelpFoodData = await this.yelp.getFoodData(storeParams);
      const yelpFusionData = await this.yelp.getFusionData(storeParams);
      const yelpSearchData = await this.yelp.getSearchData(storeParams);
      const yelpPhoneData = await this.yelp.getPhoneSearchData(storeParams);
      const yelpMatchData = await this.yelp.getBusinessMatchData(storeParams);
      const yelpDetailsData = await this.yelp.getBusinessDetailsData(storeParams);
      const yelpDeliveryData = await this.yelp.getFoodDeliverySearchData(storeParams);
      const yelpServiceData = await this.yelp.getServiceOfferingsData(storeParams);
      const yelpInsightData = await this.yelp.getBusinessInsightsData(storeParams);

      // 6. Log all Yelp API responses
      console.log("[StoreData.getStoreBySlug] Yelp API Responses:", {
        "Basic Store Data": yelpData,
        "Food & Menu Data": yelpFoodData,
        "Fusion Search Data": yelpFusionData,
        "General Search Data": yelpSearchData,
        "Phone Search Data": yelpPhoneData,
        "Business Match Data": yelpMatchData,
        "Business Details": yelpDetailsData,
        "Delivery Search Data": yelpDeliveryData,
        "Service Offerings": yelpServiceData,
        "Business Insights": yelpInsightData
      });

      // 7. Combine store data
      const combinedStore = {
        ...matchedStore,
        yelpData: yelpData
          ? {
              ...yelpData,
              hours: this.transformYelpHours(yelpData),
              data: this.heroData(yelpData)
            }
          : null,
        yelpFoodData: yelpFoodData
          ? {
              ...yelpFoodData,
              food: this.serviceData(yelpFoodData)
            }
          : null,
        yelpFusionData,
        yelpSearchData,
        yelpPhoneData,
        yelpMatchData,
        yelpDetailsData,
        yelpDeliveryData,
        yelpServiceData,
        yelpInsightData
      };

      console.log("[StoreData.getStoreBySlug] Final combined store data:", combinedStore);

      // 8. Update heroData with the new store data
      this.heroData();
      
      return combinedStore;

    } catch (error) {
      console.error(`[data.js] Error in getStoreBySlug:`, error);
      return this.createDefaultStore(slug);
    }
  }
  
  // Add this new method to create a default store when needed
  createDefaultStore(slug) {
    console.log(`[data.js] Creating default store for slug: ${slug}`);
    
    // Extract parts from the slug
    const parts = slug.split('_');
    const location = parts.length > 1 ? parts[1].replace(/-/g, ' ') : 'Unknown Location';
    const storeName = parts.length > 2 ? parts[2].replace(/-/g, ' ') : 'Unknown Store';
    
    // Create a basic store structure with the minimal required fields
    return {
      slug: slug,
      hero: {
        storeName: storeName.charAt(0).toUpperCase() + storeName.slice(1),
        storeType: "Coffee Shop",
        rating: "3.5",
        price: "$$",
        costEstimate: "5-10",
        distance: "1.5mi",
        city: location.charAt(0).toUpperCase() + location.slice(1),
        state: parts[0] === 'ca' ? 'CA' : 'Unknown',
        gallery: []
      },
      overview: [
        {
          header: "Overview",
          text: { 
            title: "Summary", 
            content: `Information about ${storeName} is currently being collected.` 
          },
          footer: { 
            contributionsCount: 0, 
            modifiedDate: new Date().toLocaleDateString(),
            modifiedTime: "0",
            commentsCount: 0,
            reviewsCount: 0,
            likesCount: 0,
            dislikedCount: 0  
          }
        }
      ],
      experience: {
        header: "Experience",
        area: [],
        attribute: {
          bestfor: [],
          working: [],
          environment: [],
          facility: []
        },
        text: { 
          title: "Experience", 
          content: "Experience details coming soon." 
        },
        footer: { 
          contributionsCount: 0, 
          modifiedDate: new Date().toLocaleDateString() 
        }
      },
      service: {
        header: "Service",
        category: {},
        text: { 
          title: "Service", 
          content: "Service details coming soon." 
        },
        footer: { 
          contributionsCount: 0, 
          modifiedDate: new Date().toLocaleDateString() 
        }
      },
      business: {
        header: "Business",
        footer: { 
          contributionsCount: 0, 
          modifiedDate: new Date().toLocaleDateString() 
        }
      },
      location: {
        header: location.charAt(0).toUpperCase() + location.slice(1),
        address: "Address information coming soon",
        geolocation: { lat: 33.6, lon: -117.9 }, // Default to Southern California
        neighborhood: {
          city: location.charAt(0).toUpperCase() + location.slice(1)
        },
        mapRadius: {},
        footer: { 
          contributionsCount: 0, 
          modifiedDate: new Date().toLocaleDateString() 
        }
      }
    };
  }

  getFoodData(getStoreBySlug) {
    try {
      const yelpData = getStoreBySlug;
      // console.log("getFoodData", yelpData);
      console.log("[getFoodData]");
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }
  // Helper function to transform Yelp hours data
  transformYelpHours(getStoreBySlug) {
    try {
      const yelpData = getStoreBySlug;
      // console.log(
      //   "?????transformYelpHours!!!!![StoreData.getStoreBySlug] yelpData:",
      //   yelpData
      // );
      console.log("[transformYelpHours]");
      if (!yelpData?.hours?.[0]?.open) {
        console.warn("[StoreData.transformYelpHours] No hours data available");
        return null;
      }

      const hoursData = yelpData.hours[0].open;
      const isCurrentlyOpen = yelpData.hours[0].is_open_now;

      // Get current time in military format
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
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

 categoryData(yelpFoodData) {
  try {
    // console.log("000: mapRadiusData", yelpData);
    const YelpFoodData =yelpFoodData;
    console.log("!00:[StoreData.categoryData] YelpFoodData:", YelpFoodData);

       const serviceCategoryData = {
          matcha: {
            rank: 1,
            category: "Matcha", // this is cardCategoryItem's amtagCategory's data.category's data.category
            links: {
              //update link to trigger gallery modal + anchor link to the category
              image: "/gallery/${category}" //this is the href of the amtagCategory
            },
            items: {
              first: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "1", // this is amtagItem's data.rank
                name: "Matcha Pistaccio Crossiant", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/Jh0zD8Wj5F4Ex2rnxY8zlg/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              second: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "2", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/tECvZwf-IowgzeCv8lzAmQ/o.jpg"
                  },
                  post: {
                    description: "Bannana Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              third: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "3", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              }
            }
          },

          coffee: {
            rank: 2,
            category: "Coffee", // this is cardCategoryItem's amtagCategory's data.category's data.category
            links: {
              //update link to trigger gallery modal + anchor link to the category
              image: "/gallery/${category}" //this is the href of the amtagCategory
            },
            items: {
              first: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "1", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/nD2wrwvKI_DMG0NvqYszzA/348s.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              second: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "2", // this is amtagItem's data.rank
                name: "Iced Vanilla Latte", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              third: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "3", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              }
            }
          },

          pastries: {
            rank: 3,
            category: "Pastries", // this is cardCategoryItem's amtagCategory's data.category's data.category
            links: {
              //update link to trigger gallery modal + anchor link to the category
              image: "/gallery/${category}" //this is the href of the amtagCategory
            },
            items: {
              first: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "1", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              second: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "2", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              third: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "3", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              }
            }
          },

          teas: {
            rank: 4,
            category: "Teas", // this is cardCategoryItem's amtagCategory's data.category's data.category
            links: {
              //update link to trigger gallery modal + anchor link to the category
              image: "/gallery/${category}" //this is the href of the amtagCategory
            },
            items: {
              first: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "1", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              second: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "2", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              third: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "3", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              }
            }
          },

          beverages: {
            rank: 5,
            category: "Beverages", // this is cardCategoryItem's amtagCategory's data.category's data.category
            links: {
              //update link to trigger gallery modal + anchor link to the category
              image: "/gallery/${category}" //this is the href of the amtagCategory
            },
            items: {
              first: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "1", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              second: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "2", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              third: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "3", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              }
            }
          },

          lunch: {
            rank: 6,
            category: "Lunch", // this is cardCategoryItem's amtagCategory's data.category's data.category
            links: {
              //update link to trigger gallery modal + anchor link to the category
              image: "/gallery/${category}" //this is the href of the amtagCategory
            },
            items: {
              first: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "1", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              second: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "2", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              },
              third: {
                //update with id generator in a new id file id.js as generateId()
                id: "1",
                rank: "3", // this is amtagItem's data.rank
                name: "Strawberry Matcha", // this is amtagItem's data.name
                links: {
                  //update link to trigger gallery modal + anchor link to the category
                  image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                },
                source: {
                  name: "Yelp",
                  logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    source: "https://www.yelp.com" // this amtagItem's href url
                  }
                },
                thumbnail: {
                  media: {
                    thumbnail:
                      "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
                  },
                  post: {
                    description: "Tasty Strawberry Matcha Latte",
                    poster: {
                      username: "evabear",
                      link: {
                        profile:
                          "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                      }
                    }
                  }
                }
              }
            }
          }
      };
      return serviceCategoryData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  overviewSummaryData() {
    try {
      const overviewSummaryData = {
        experienceScore: "93",
        experience: [
          { label: "Large Space", score: 9, user: 333 },
          { label: "Crowded", score: 2, user: 333 },
          { label: "Youthful", score: 2, user: 333 },
          { label: "Students", score: 2, user: 333 },
          { label: "Friends", score: 2, user: 333 },
          { label: "Multicultural", score: 2, user: 333 },
          { label: "Bright", score: 2, user: 333 },
          { label: "Friendly", score: 2, user: 333 },
          { label: "Casual", score: 2, user: 333 }
        ],
        serviceScore: "93",
        service: [
          { label: "Tea & Matcha", score: 2, user: 333 },
          { label: "Pastries", score: 2, user: 333 },
          { label: "Coffee", score: 2, user: 333 },
          { label: "Quality", score: 2, user: 333 },
          { label: "Original", score: 2, user: 333 },
          { label: "Seasonal", score: 2, user: 333 },
          { label: "Korean", score: 2, user: 333 },
          { label: "Craft", score: 2, user: 333 },
          { label: "Artisian", score: 2, user: 333 }
        ],
        businessScore: "93",
        business: [
          { label: "Large Space", score: 2, user: 333 },
          { label: "Crowded", score: 2, user: 333 },
          { label: "Youthful", score: 2, user: 333 },
          { label: "Students", score: 2, user: 333 },
          { label: "Friends", score: 2, user: 333 },
          { label: "Multicultural", score: 2, user: 333 },
          { label: "Bright", score: 2, user: 333 },
          { label: "Friendly", score: 2, user: 333 },
          { label: "Casual", score: 2, user: 333 }
        ],
        locationScore: "93",
        location: [
          { label: "Busy", score: 2, user: 333 },
          { label: "Hidden", score: 2, user: 333 },
          { label: "Safe", score: 2, user: 333 },
          { label: "Clustered", score: 2, user: 333 },
          { label: "Popular", score: 2, user: 333 },
          { label: "Parking", score: 2, user: 333 },
          { label: "Clean", score: 2, user: 333 },
          { label: "Spaced Out", score: 2, user: 333 },
          { label: "Residential", score: 2, user: 333 }
        ]
      };

      return overviewSummaryData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }


  mapRadiusData(yelpData) {
    try {
      // console.log("000: mapRadiusData", yelpData);
      const YelpData = yelpData;
      // console.log("001: YelpData", YelpData);
      const location = YelpData.location;
      // console.log("002: location", location);
      const addressStreet = YelpData.location.address1;
      // console.log("003: addressStreet", addressStreet);
      const addressThumbnail = YelpData.location.address2;
      // console.log("004: addressThumbnail", addressThumbnail); 
      const city = YelpData.location.city;
      // console.log("005: city", city);
      const state = YelpData.location.state;
      // console.log("006: state", state);
      const City = city + ', ' + state;
      // console.log("007: City", City);
      const zip_code = YelpData.location.zip;
      // console.log("008: zip_code", zip_code);
      const country = YelpData.location.country;
      // console.log("009: country", country);
      const address = YelpData.location.display_address;
      // console.log("010: address", address);
      const longitude = YelpData.coordinates.longitude;
      // console.log("011: longitude", longitude);
      const latitude = YelpData.coordinates.latitude;
      // console.log("012: latitude", latitude);
      const coordinates = [longitude, latitude];
      // console.log("013: coordinates", coordinates);
      const phone = YelpData.phone;
      // console.log("014: phone", phone);
      const phoneFormatted = YelpData.display_phone;
      // console.log("015: phoneFormatted", phoneFormatted);
      const id = YelpData.id;
      // console.log("016: id", id);
      const name = YelpData.name;
      // console.log("017: name", name);
      const imageUrl = YelpData.image_url;
      // console.log("018: imageUrl", imageUrl);
      const url = YelpData.url;
      // console.log("019: url", url);
      const rating = YelpData.rating;
      // console.log("020: rating", rating);
      const reviewCount = YelpData.review_count;
      // console.log("021: reviewCount", reviewCount);
      const mapRadiusData = {
          address: address,
          stores: 
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coordinates
              },
              properties: {
                id: 1,
                phoneFormatted: phoneFormatted,
                phone: phone,
                address: addressStreet,
                city: City,
                country: country,
                crossStreet: addressThumbnail,
                postalCode: zip_code,
                state: state
              }
            }, 
            
        };
        // console.log("022: mapRadiusData", mapRadiusData); 

        const mapRadiusDataOLD = {
            address: "11900 South St Ste 134 Cerritos, CA 90703",
            stores: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.034084142948, 38.909671288923]
                },
                properties: {
                  id: 1,
                  phoneFormatted: "(202) 234-7336",
                  phone: "2022347336",
                  address: "1471 P St NW",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "at 15th St NW",
                  postalCode: "20005",
                  state: "D.C."
                }
              },
              // Additional stores...
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.034084142948, 38.909671288923]
                },
                properties: {
                  phoneFormatted: "(202) 234-7336",
                  phone: "2022347336",
                  address: "1471 P St NW",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "at 15th St NW",
                  postalCode: "20005",
                  state: "D.C."
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.049766, 38.900772]
                },
                properties: {
                  phoneFormatted: "(202) 507-8357",
                  phone: "2025078357",
                  address: "2221 I St NW",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "at 22nd St NW",
                  postalCode: "20037",
                  state: "D.C."
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.043929, 38.910525]
                },
                properties: {
                  phoneFormatted: "(202) 387-9338",
                  phone: "2023879338",
                  address: "1512 Connecticut Ave NW",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "at Dupont Circle",
                  postalCode: "20036",
                  state: "D.C."
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.0672, 38.90516896]
                },
                properties: {
                  phoneFormatted: "(202) 337-9338",
                  phone: "2023379338",
                  address: "3333 M St NW",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "at 34th St NW",
                  postalCode: "20007",
                  state: "D.C."
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.002583742142, 38.887041080933]
                },
                properties: {
                  phoneFormatted: "(202) 547-9338",
                  phone: "2025479338",
                  address: "221 Pennsylvania Ave SE",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "btwn 2nd & 3rd Sts. SE",
                  postalCode: "20003",
                  state: "D.C."
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-76.933492720127, 38.99225245786]
                },
                properties: {
                  address: "8204 Baltimore Ave",
                  city: "College Park",
                  country: "United States",
                  postalCode: "20740",
                  state: "MD"
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.097083330154, 38.980979]
                },
                properties: {
                  phoneFormatted: "(301) 654-7336",
                  phone: "3016547336",
                  address: "4831 Bethesda Ave",
                  cc: "US",
                  city: "Bethesda",
                  country: "United States",
                  postalCode: "20814",
                  state: "MD"
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.359425054188, 38.958058116661]
                },
                properties: {
                  phoneFormatted: "(571) 203-0082",
                  phone: "5712030082",
                  address: "11935 Democracy Dr",
                  city: "Reston",
                  country: "United States",
                  crossStreet: "btw Explorer & Library",
                  postalCode: "20190",
                  state: "VA"
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.10853099823, 38.880100922392]
                },
                properties: {
                  phoneFormatted: "(703) 522-2016",
                  phone: "7035222016",
                  address: "4075 Wilson Blvd",
                  city: "Arlington",
                  country: "United States",
                  crossStreet: "at N Randolph St.",
                  postalCode: "22203",
                  state: "VA"
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-75.28784, 40.008008]
                },
                properties: {
                  phoneFormatted: "(610) 642-9400",
                  phone: "6106429400",
                  address: "68 Coulter Ave",
                  city: "Ardmore",
                  country: "United States",
                  postalCode: "19003",
                  state: "PA"
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-75.20121216774, 39.954030175164]
                },
                properties: {
                  phoneFormatted: "(215) 386-1365",
                  phone: "2153861365",
                  address: "3925 Walnut St",
                  city: "Philadelphia",
                  country: "United States",
                  postalCode: "19104",
                  state: "PA"
                }
              },
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [-77.043959498405, 38.903883387232]
                },
                properties: {
                  phoneFormatted: "(202) 331-3355",
                  phone: "2023313355",
                  address: "1901 L St. NW",
                  city: "Washington DC",
                  country: "United States",
                  crossStreet: "at 19th St",
                  postalCode: "20036",
                  state: "D.C."
                }
              }
            ]
          };
          // console.log("023: mapRadiusDataOLD", mapRadiusDataOLD);
      return mapRadiusDataOLD;
    } catch (error) {
      console.error("000: getStoreBySlug", "Error:", error);
      return null;
    }
  }

  footerData() {
    try {
    // const mongodbData = data;
      const footerData = {
        overview: {
          contributionsCount: 333,
          modifiedDate: "06/06/24",
          modifiedTime: 3,
          commentsCount: 333,
          reviewsCount: 333,
          likesCount: 333,
          dislikesCount: 333
        },
        experience: {
          contributionsCount: 333,
          modifiedDate: "06/06/24",
          modifiedTime: 3,
          commentsCount: 333,
          reviewsCount: 333,
          likesCount: 333,
          dislikesCount: 333
        },
        service: {
          contributionsCount: 333,
          modifiedDate: "06/06/24",
          modifiedTime: 3,
          commentsCount: 333,
          reviewsCount: 333,
          likesCount: 333,
          dislikesCount: 333
        },
        business: {
          contributionsCount: 333,
          modifiedDate: "06/06/24",
          modifiedTime: 3,
          commentsCount: 333,
          reviewsCount: 333,
          likesCount: 333,
          dislikesCount: 333
        },
        location: {
          contributionsCount: 333,
          modifiedDate: "06/06/24",
          modifiedTime: 3,
          commentsCount: 333,
          reviewsCount: 333,
          likesCount: 333,
          dislikesCount: 333
        }
      };
      return footerData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }
  
  detailsData() {
    try {
      const details = {
        rating: "3.33",
        costEstimate: "3-6",
        storeType: "Coffee Shop",
        distance: "1.5mi",
        distanceMiles: "1.1",
        status: "Busy until 6pm"
      }

      return details;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

    
  galleryData() {
    try {
      const galleryData = [
        {
        hero: {
            url: '',
            gallery: {
              area: {
                outside: {
                  title: '',
                  url: '',
                  gallery: []
                },
                entrance: {
                  title: '',
                  url: '',
                  gallery: []
                },
                main: {
                  title: '',
                  url: '',
                  gallery: []
                },
                corner: {
                  title: '',
                  url: '',
                  gallery: []
                },
                outdoor: {
                  title: '',
                  url: '',
                  gallery: []
                },
                restroom: {
                  title: '',
                  url: '',
                  gallery: []
                }
              },
              hero: {
                url: '',
                gallery: []
              }
            }
          }
        }
      ];
      
      return galleryData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  locationData() {
    try {
      const locationData = {
        
          city: "Cerritos",
          // city: store?.item?.[0]?.location?.city,
          attrtags: [
            {
              title: "Location",
              attributes: [
                { label: "Safe", score: 4, count: 9 },
                { label: "Busy", score: 6, count: 3 },
                { label: "Popular", score: 3, count: 9 },
                { label: "High End", score: 4, count: 12 },
                { label: "Clean", score: 6, count: 2 }
              ]
            },
            {
              title: "Surrounding",
              attributes: [
                { label: "Shopping", score: 6, count: 2 },
                { label: "Eatery", score: 2, count: 12 },
                { label: "Hotspot", score: 1, count: 9 },
                { label: "Nightlife", count: 15 }
              ]
            },
            {
              title: "Transportation",
              attributes: [
                { label: "Bus", score: 4, count: 3 },
                { label: "Parking Lots", score: 9, count: 9 },
                { label: "Paid Parking", score: 4, count: 2 },
                { label: "Parking lot", count: 15 }
              ]
            },
            {
              title: "Environment",
              attributes: [
                { label: "Inspirational", score: 6, count: 9 },
                { label: "Busy", score: 1, count: 2 },
                { label: "Lively", score: 2, count: 3 },
                { label: "Loud", score: 3, count: 1 },
                { label: "Clean", score: 1, count: 2 }
              ]
            },
            {
              title: "Demographic",
              attributes: [
                { label: "Young", score: 4, count: 9 },
                { label: "Busy", score: 1, count: 12 },
                { label: "Popular", score: 4, count: 6 },
                { label: "College Students", score: 9, count: 2 },
                { label: "College Students", score: 9, count: 2 },
                { label: "Couples", score: 6, count: 2 }
              ]
            }
          ]
        }

      return locationData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  headerData() {
    try {
      const headerData = {
        overview: "Overview",
        experience: "Experience",
        service: "Service",
        business: "Business",
        location: "TEMP"
      };
      return headerData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  details() {
    try {
      const details = {
          address: yelp?.location?.address1 || "12345 Main St.",
          city: yelp?.location?.city || "Cerritos",
          area: "Lincoln Station",
          state: yelp?.location?.state || "CA",
          zip: yelp?.location?.zip_code || "90703",
          geolocation: {
            lat: yelp?.coordinates?.latitude,
            lon: yelp?.coordinates?.longitude
          },
          attribute: {
            city: yelp?.location?.city || "Cerritos",
            attrtags: [
              {
                title: "Location",
                attributes: [
                  { label: "Safe", score: 4, count: 9 },
                  { label: "Busy", score: 6, count: 3 },
                  { label: "Popular", score: 3, count: 9 },
                  { label: "High End", score: 4, count: 12 },
                  { label: "Clean", score: 6, count: 2 }
                ]
              },
              {
                title: "Surrounding",
                attributes: location.locations[0]?.attrtags?.[1]?.attributes || []
              },
              {
                title: "Transportation",
                attributes: location.locations[0]?.attrtags?.[2]?.attributes || []
              }
            ]
          },
          stats: {
            contributions: yelp?.review_count || 0,
            reviews: yelp?.review_count || 0,
            comments: 0,
            likes: 0,
            dislikes: 0
          },
          modified: {
            date: new Date().toLocaleDateString(),
            time: new Date().getTime()
          }
      }

      return details;
      
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  textBlockData() {
    try {
      const textBlockData = {
        title: "Summary",
        content:
          "The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.fdsfsdfd"
      };
      return textBlockData;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  attributesData() {
    try {
      console.log(
        "****attributesData[StoreData.getStoreBySlug] yelpData:"
      );
      const attributesData = {
      bestfor: [
        { label: "Remote Work", score: 2, count: 2 },
        { label: "Socializing", score: 2, count: 2 },
        { label: "Zoom Calls", score: 2, count: 2 },
        { label: "Studying", score: 2, count: 2 },
        { label: "Group Study", score: 2, count: 2 },
        { label: "Reading", score: 2, count: 2 },
        { label: "Label", score: 2, count: 2 },
        { label: "Label", score: 2, count: 2 },
        { label: "Label", count: 2 }
      ],
      working: [
        { label: "Tables", score: 2, count: 2 },
        { label: "Outlets", score: 2, count: 2 },
        { label: "Password", score: 2, count: 2 },
        { label: "Protected Wifi", score: 2, count: 2 },
        { label: "Wifi", score: 2, count: 2 },
        { label: "Single Tables", score: 2, count: 2 },
        { label: "Opens Late", score: 2, count: 2 },
        { label: "Coffee & Pastries", score: 2, count: 2 },
        { label: "Label", count: 2 }
      ],
      environment: [
        { label: "Hipster", score: 2, count: 9 },
        { label: "Modern", score: 2, count: 2 },
        { label: "Board Games", score: 2, count: 2 },
        { label: "Alternative", score: 2, count: 2 },
        { label: "Youthful", score: 2, count: 9 },
        { label: "Korean", score: 2, count: 2 },
        { label: "Friendly", score: 2, count: 2 },
        { label: "Label", score: 2, count: 2 },
        { label: "Label", count: 2 }
      ],
      facility: [
        { label: "Cool", score: 2, count: 9 },
        { label: "Clean", score: 2, count: 2 },
        { label: "Outdoor Seating", score: 2, count: 2 },
        { label: "Spacious", score: 9, count: 2 },
        { label: "New", score: 2, count: 2 },
        { label: "Plaza", score: 2, count: 9 },
        { label: "Coffee & Pastries", score: 3, count: 2 },
        { label: "Label", score: 1, count: 2 },
        { label: "Label", count: 1 }
      ]
    };
    // console.log("attributesData end ", attributesData);
    return attributesData;
    } catch (error) {
      console.error("attributesData", "Error:", error);
      return null;
    }
  }

  areaData(yelpData) {
    try {
      console.log("areaData start");
      const YelpData = yelpData;
      console.log(
        "****areaData[StoreData.getStoreBySlug] yelpData:",
        YelpData
      );

      const areaData = {
          item: [
            {
              area: "Outside",
              links: {
                //update link to trigger gallery modal + anchor link to the category
                gallery: "/gallery/${category}" //this is the href of the amtagCategory
              },
              images: [
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "1",
                  impressions: {
                    users: 333,
                    likes: 36,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/5s3-S9Itb9iA9H6wmVGSgA/o.jpg"
                    },
                    post: {
                      description: "Smoking Tiger Bread Factory",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "2",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "3",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              area: "Entrance",
              links: {
                //update link to trigger gallery modal + anchor link to the category
                gallery: "/gallery/${category}" //this is the href of the amtagCategory
              },
              images: [
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "1",
                  impressions: {
                    users: 333,
                    likes: 30,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "2",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "3",
                  impressions: {
                    users: 333,
                    likes: 36,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/kpabkywqhqFXcSJNnXSz5w/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              area: "Main Room",
              links: {
                //update link to trigger gallery modal + anchor link to the category
                gallery: "/gallery/${category}" //this is the href of the amtagCategory
              },
              images: [
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "1",
                  impressions: {
                    users: 334,
                    likes: 36,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/ZUiuW64ttEYuO8Gy7J8-uw/o.jpg"
                    },
                    post: {
                      description:
                        "Alot of seating lined up throughout the windows and walls",
                      poster: {
                        username: "evabeareview",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "2",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "3",
                  impressions: {
                    users: 333,
                    likes: 36,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description:
                        "This should be number two but same comment as number one!",
                      poster: {
                        username: "evabeareview02",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              area: "Corner Room",
              links: {
                //update link to trigger gallery modal + anchor link to the category
                gallery: "/gallery/${category}" //this is the href of the amtagCategory
              },
              images: [
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "1",
                  impressions: {
                    users: 333,
                    likes: 30,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "2",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "3",
                  impressions: {
                    users: 333,
                    likes: 36,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/K27xLUuY_zAjcrfXLiNZKA/o.jpg"
                    },
                    post: {
                      description: "Good work gets done in this corner",
                      poster: {
                        username: "evabearsfavoritespot",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              area: "Outside Patio",
              links: {
                //update link to trigger gallery modal + anchor link to the category
                gallery: "/gallery/${category}" //this is the href of the amtagCategory
              },
              images: [
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "1",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/6MJAiRhCy5A7Y7qmp9WERw/o.jpg"
                    },
                    post: {
                      description: "Nice quiet outdoor patio, perfect for meetings",
                      poster: {
                        username: "outdoor-evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "2",
                  impressions: {
                    users: 333,
                    likes: 30,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "3",
                  impressions: {
                    users: 333,
                    likes: 27,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              area: "Bathroom",
              links: {
                //update link to trigger gallery modal + anchor link to the category
                gallery: "/gallery/${category}" //this is the href of the amtagCategory
              },
              images: [
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "1",
                  impressions: {
                    users: 333,
                    likes: 31,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "2",
                  impressions: {
                    users: 333,
                    likes: 33,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/62i3iAQ6ygYF_BZ_YMGbqw/o.jpg"
                    },
                    post: {
                      description: "Popular bathroom selfie spot",
                      poster: {
                        username: "evabear_bathroom",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                },
                {
                  //update with id generator in a new id file id.js as generateId()
                  id: "3",
                  impressions: {
                    users: 333,
                    likes: 30,
                    dislikes: 3
                  },
                  links: {
                    //update link to trigger gallery modal + anchor link to the category
                    image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
                  },
                  source: {
                    name: "Yelp",
                    logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
                    links: {
                      //update link to trigger gallery modal + anchor link to the category
                      source: "https://www.yelp.com" // this amtagItem's href url
                    }
                  },
                  thumbnail: {
                    media: {
                      thumbnail:
                        "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
                    },
                    post: {
                      description: "Tasty Strawberry Matcha Latte",
                      poster: {
                        username: "evabear",
                        link: {
                          profile:
                            "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        };

      if (!YelpData) {
        console.warn("[(*****areaData.heroData] No hours data available");
        return [];
      }
      const gallery = YelpData.photos || [];

      const imageModal = [
        {
          id:'',
          impressions: {
            users:'',
            likes:'',
            dislikes:''
          },
          links: {
            image: ''
          },
          source: {
            name: '',
            logo: '',
            links: {
              source: ''
            }
          },
          thumbnail: {
            media: {
              thumbnail: ''
            },
            post: {
              description: '',
              poster: {
                username: '',
                link: {
                  profile: ''
                }
              }
            }
          }
        },
      ];

      

      // const areaData = [
      //   {
      //     area: "Outside",
      //     links: {
      //       gallery: "/gallery/${category}", // this is the href of the amtagCategory
      //     },
      //     images: imageModal,
      //   },
      //   {
      //     area: "Entrance",
      //     links: {
      //       gallery: "/gallery/${category}", // this is the href of the amtagCategory
      //     },
      //     images: imageModal,
      //   },
      //   {
      //     area: "Main Room",
      //     links: {
      //       gallery: "/gallery/${category}", // this is the href of the amtagCategory
      //     },
      //     images: imageModal,
      //   },
      //   {
      //     area: "Corner Room",
      //     links: {
      //       gallery: "/gallery/${category}", // this is the href of the amtagCategory
      //     },
      //     images: imageModal,
      //   },
      //   {
      //     area: "Restroom",
      //     links: {
      //       gallery: "/gallery/${category}", // this is the href of the amtagCategory
      //     },
      //     images: imageModal,
      //   },
      //   {
      //     area: "Outdoor",
      //     links: {
      //       gallery: gallery, // this is the href of the amtagCategory
      //     },
      //     images: imageModal,
      //   }
      // ];
      // console.log("areaData end:", areaData);
      return areaData;
    } catch (error) {
      console.error("areaData", "Error:", error);
      return [];
    }
  }

  timeline() {
    try {
      const timeline = '';

      return timeline;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  neighborhood(yelpData) {
    try {
      console.log("areaData start");
      const YelpData = yelpData;
      // console.log(
      //   "****areaData[StoreData.getStoreBySlug] yelpData:",
      //   YelpData
      // );
      console.log("area start");
      // const YelpData = yelpData;
      // console.log(
      //   "****areaData[StoreData.getStoreBySlug] yelpData:",
      //   YelpData
      // );
const neighborhoodAttributes =
    {
      city: "Cerritos",
      // city: store?.item?.[0]?.location?.city,
      attrtags: [
          {
          title: "Location",
          attributes: [
            { label: "Safe", score: 4, count: 9 },
            { label: "Busy", score: 6, count: 3 },
            { label: "Popular", score: 3, count: 9 },
            { label: "High End", score: 4, count: 12 },
            { label: "Clean", score: 6, count: 2 }
          ]
        },
        {
          title: "Surrounding",
          attributes: [
            { label: "Shopping", score: 6, count: 2 },
            { label: "Eatery", score: 2, count: 12 },
            { label: "Hotspot", score: 1, count: 9 },
            { label: "Nightlife", count: 15 }
          ]
        },
        {
          title: "Transportation",
          attributes: [
            { label: "Bus", score: 4, count: 3 },
            { label: "Parking Lots", score: 9, count: 9 },
            { label: "Paid Parking", score: 4, count: 2 },
            { label: "Parking lot", count: 15 }
          ]
        },
        {
          title: "Environment",
          attributes: [
            { label: "Inspirational", score: 6, count: 9 },
            { label: "Busy", score: 1, count: 2 },
            { label: "Lively", score: 2, count: 3 },
            { label: "Loud", score: 3, count: 1 },
            { label: "Clean", score: 1, count: 2 }
          ]
        },
        {
          title: "Demographic",
          attributes: [
            { label: "Young", score: 4, count: 9 },
            { label: "Busy", score: 1, count: 12 },
            { label: "Popular", score: 4, count: 6 },
            { label: "College Students", score: 9, count: 2 },
            { label: "College Students", score: 9, count: 2 },
            { label: "Couples", score: 6, count: 2 }
          ]
        }
      ]
    }
    
    const neighborhoodData = {
      address: YelpData?.location?.address1 || "NA",
      city: YelpData?.location?.city || "NA",
      area: "Lincoln Station",
      state: YelpData?.location?.state || "NA",
      zip: YelpData?.location?.zip_code || "NA",
      geolocation: {
        lat: YelpData?.coordinates?.latitude,
        lon: YelpData?.coordinates?.longitude
      },
      attribute: neighborhoodAttributes || [],
      stats: {
        contributions: YelpData?.review_count || 0,
        reviews: YelpData?.review_count || 0,
        comments: 0,
        likes: 0,
        dislikes: 0
      },
      modified: {
        date: new Date().toLocaleDateString(),
        time: new Date().getTime()
      }
    }

    // console.log("neighborhoodData end:", neighborhoodData);
    return neighborhoodData;
  } catch (error) {
    console.error("neighborhoodData", "Error:", error);
    return [];
  }
  }

  // Helper function to transform Yelp hours data
  hero(yelpData) {
    try {
      const YelpData = yelpData;
      // console.log(
      //   "****hero[StoreData.getStoreBySlug] yelpData:",
      //   YelpData
      // );
      if (!YelpData) {
        console.warn("[(*****StoreData.heroData] No hours data available");
        return null;
      }

      function getCostEstimate(price) {
        const lowRange = "$3-6";
        const midRange = "$9-12";
        const highRange = "$15-20";
        const premiumRange = "$20+";
        if (price === "$") {
          return lowRange;
        } else if (price === "$$") {
          return midRange;
        } else if (price === "$$$") {
          return highRange;
        } else if (price === "$$$$") {
          return premiumRange;
        } else {
          return "NA";
        }
      }

      const name = YelpData?.name || "N/A";
      const rating = YelpData?.rating || "N/A";
      const reviewCount = YelpData?.review_count || "N/A";
      const price = YelpData?.price || "N/A";
      const costEstimate = getCostEstimate(price) || "N/A";
      const storeType = YelpData?.categories || [];
      const location = YelpData?.location || "N/A";
      const city = location.city || "N/A";
      const state = location.state || "N/A";
      const photos = YelpData.photos || [];
      const image = YelpData.image_url;
      const gallery = [image, ...photos];

      // Get current time in military format
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}${currentMinute}`;
      const currentDay = now.getDay();

      const heroData = {
        // Fields used by storeDetail component
        rating: rating || "NA",
        review_count: reviewCount || "NA",
        price: price || "NA",
        costEstimate: costEstimate || "NA",
        storeType: storeType || "NA",
        // distance: store?.distance
        //   ? `${(store.yelpData.distance / 1609.34).toFixed(1)}mi`
        //   : "NA",
        distance: '3.3mi',
        city: city || "NA",
        state: state || "NA",

        // Fields used by storeHeadline component
        storeName: name || "NA",
        // distanceMiles: store?.distance
        //   ? (store.yelpData.distance / 1609.34).toFixed(1)
        //   : "NA",
        distanceMiles: '3.3',
        // status: store?.hours?.[0]?.is_open_now ? "NA" : "NA",
        status: 'Open',

        // Fields used by heroGallery component
        // galleryImages: [
        //   store?.image_url,
        //   ...(store?.photos || []),
        //   "https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png"
        // ].filter(Boolean)
        gallery: gallery,
      };
    return heroData;
  } catch (error) {
    console.error("getStoreBySlug", "Error:", error);
    return null;
  }
  }
  // heroData(yelpData) {
  //   try {
  //     console.log("****heroData!!!!![StoreData.getStoreBySlug] yelpData:", yelpData);
      
  //     // Use template data from global store as fallback
  //     // const template = store.item[0].details;
      
  //     if (!yelpData) {
  //       console.warn("[(*****StoreData.heroData] No Yelp data available, using template");
  //       return template;
  //     }

  //     function getCostEstimate(price) {
  //       const lowRange = "$3-6";
  //       const midRange = "$9-12";
  //       const highRange = "$15-20";
  //       const premiumRange = "$20+";
        
  //       switch(price) {
  //         case "$": return lowRange;
  //         case "$$": return midRange;
  //         case "$$$": return highRange;
  //         case "$$$$": return premiumRange;
  //         // default: return template.costEstimate || "NA";
  //       }
  //     }

  //     const heroData = {
  //       rating: yelpData?.rating || template.rating,
  //       review_count: yelpData?.review_count || template.review_count,
  //       price: yelpData?.price || template.price,
  //       costEstimate: getCostEstimate(yelpData.price),
  //       storeType: yelpData.categories || template.storeType,
  //       distance: yelpData.distance 
  //         ? `${(yelpData.distance / 1609.34).toFixed(1)}mi` 
  //         : template.distance,
  //       city: yelpData.location?.city || template.city,
  //       state: yelpData.location?.state || template.state,
  //       storeName: yelpData.name || template.storeName,
  //       distanceMiles: yelpData.distance 
  //         ? (yelpData.distance / 1609.34).toFixed(1) 
  //         : template.distanceMiles,
  //       status: yelpData.hours?.[0]?.is_open_now ? "Open" : "Closed",
  //       gallery: yelpData.photos || template.gallery
  //     };

  //     console.log("*****heroData", heroData);
  //     return heroData;
  //   } catch (error) {
  //     console.error("getStoreBySlug", "Error:", error);
  //     return null;
  //   }
  // }
  overview() {
    try {
      const overview = [
        {
          header: this.headerData()?.overview ? this.headerData()?.overview : null,

          // Ensure overviewSummaryData is provided or fallback to null
          summary: this.overviewSummaryData ? this.overviewSummaryData() : null,

          // Ensure textBlockData is provided or fallback to null
          text: this.textBlockData ? this.textBlockData() : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: this.footerData()?.overview || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount: null
          }
        }
      ];
      
      return overview;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  experience(yelpData) {
    try {
      console.log("experience start")
      const YelpData = yelpData;
      if (!YelpData) {
        console.warn("[(*****experience] No yelp data available");
        return null;
      }
      const areaData = this.areaData(YelpData);
      // console.log("experience areaData", areaData);
     
      const experience =
        {
          header: this.headerData()?.experience ? this.headerData()?.experience : null,
          
          area: this.areaData || [] ? this.areaData(YelpData) || [] : null,
          
          attribute: this.attributesData() ? this.attributesData() : null,

          // Ensure textBlockData is provided or fallback to null
          text: this.textBlockData ? this.textBlockData() : null,
          
          // Ensure footerData.overview exists, otherwise use default object
          footer: this.footerData()?.experience || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount: null
          }
        }

      
      // console.log(")00:experience", experience);
      return experience;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  business(yelpData) {
    try {
      console.log("business start")
      const YelpData = yelpData;
      if (!YelpData) {
        console.warn("[(business] No yelp data available");
        return null;
      }
      // console.log("business YelpData", YelpData);
      const business = 
        {
          header: this.headerData()?.business ? this.headerData()?.business : null,

          timeline: YelpData ? YelpData : null,

          // attribute: attributesData ? attributesData : null,
          footer: this.footerData()?.business || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount: null
          }
        }
      // console.log("business end", business);
      return business;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  location(yelpData) {
    try {
      const YelpData = yelpData;
      // console.log("+00:location YelpData", YelpData);
      const storeLocation = {
        addressStreet: YelpData.location?.address1,
        addressThumbnail: YelpData.location?.address2,
        city: YelpData.location?.city,
        state: YelpData.location?.state,
        address: YelpData.location?.display_address,
      };
      // console.log("+01:location storeLocation", storeLocation);
      const neighborhoodData = this.neighborhood(YelpData);
      // console.log("+02:location neighborhoodData", neighborhoodData);
      // if user is in the same city, use addressThumbnail, else if, use address  
      const header = storeLocation.storeCity + ', ' + storeLocation.storeState;
      // console.log("+03:location header", header);
      const location =
        {
          header: header,

          neighborhood: neighborhoodData ? neighborhoodData : null,
          attribute: neighborhoodData?.attribute.attrtags ? neighborhoodData?.attribute.attrtags : null,

          footer: this.footerData?.location || {
              contributionsCount: null,
              modifiedDate: null,
              modifiedTime: null,
              commentsCount: null,
              reviewsCount: null,
              likesCount: null,
              dislikesCount: null
            }
        }
        // console.log("+04:location location", location);
      return location;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  }

  service() { 
    try {
      const service =
        {
          header: this.headerData()?.service ? this.headerData()?.service : null, 
          
          category: this.categoryData() ? this.categoryData() : null,

          // Ensure textBlockData is provided or fallback to null
          text: this.textBlockData ? this.textBlockData() : null,
          
          // Ensure footerData.overview exists, otherwise use default object
          footer: this.footerData()?.service || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount: null
          }
        }
   
    return service;
    } catch (error) {
      console.error("getStoreBySlug", "Error:", error);
      return null;
    }
  };

  async store(slug) {
    try {
      // debugLog("^01:getStoreBySlug", "Starting fetch for slug:", slug);

      // 1. Get store data from DataPost
      const dataBlog = new DataPost();
      const storeData = await dataBlog.getData();
      // debugLog("^02:getStoreBySlug", "All stores:", storeData?.length);

      // 2. Filter for valid stores and find matching store
      const validStores = storeData.filter((store) => store.slug);
      // debugLog("^03:getStoreBySlug", "Valid stores:", validStores?.length);

      const matchedStore = validStores.find((s) => s.slug === slug);
      // debugLog("^04:getStoreBySlug", "Found matching store:", matchedStore);

      if (!matchedStore) {
        console.error("^05:getStoreBySlug", "Store not found for slug:", slug);
        return null;
      }

      const storeParams = {
        storeName: matchedStore.headline?.text,
        storeAddress: matchedStore.location?.address,
        storeCity: address.city(matchedStore.location?.address),
        storeState: address.state(matchedStore.location?.address),
        storeLongitude: matchedStore.location?.geolocation?.lon,
        storeLatitude: matchedStore.location?.geolocation?.lat,
        storeId: matchedStore.id,
        storeAlias: matchedStore.alias,
      };
      console.log("^06:[StoreData.getStoreBySlug] storeParams:", storeParams);

      // Get all Yelp data using different endpoints
      const yelpData = await this.yelp.getStoreData(storeParams);
      // const yelpFoodData = await this.yelp.getFoodData(yelpData);
      // const yelpFusionData = await this.yelp.getFusionData(yelpData);
      // const yelpSearchData = await this.yelp.getSearchData(yelpData);
      // const yelpPhoneData = await this.yelp.getPhoneSearchData(yelpData);
      // const yelpMatchData = await this.yelp.getBusinessMatchData(yelpData);
      // const yelpDetailsData = await this.yelp.getBusinessDetailsData(yelpData);
      // const yelpDeliveryData = await this.yelp.getFoodDeliverySearchData(yelpData);
      // const yelpServiceData = await this.yelp.getServiceOfferingsData(yelpData);
      // const yelpInsightData = await this.yelp.getBusinessInsightsData(yelpData);

      // Log all Yelp data for debugging
      console.log("[StoreData.store] Yelp Data:", {
        basic: yelpData,
        // food: yelpFoodData,
        // fusion: yelpFusionData,
        // search: yelpSearchData,
        // phone: yelpPhoneData,
        // match: yelpMatchData,
        // details: yelpDetailsData,
        // delivery: yelpDeliveryData,
        // services: yelpServiceData,
        // insights: yelpInsightData
      });

      // Create store object combining all data
      const store = {
        hero: this.hero(yelpData),
        overview: this.overview(yelpData),
        experience: this.experience(yelpData),
        service: this.service(),
        business: this.business(yelpData),
        location: this.location(yelpData),
        categoryData: this.categoryData(yelpFoodData),
        mapRadiusData: this.mapRadiusData(yelpData),
        // Add new Yelp data
        yelpData,
        // yelpFoodData,
        // yelpFusionData,
        // yelpSearchData,
        // yelpPhoneData,
        // yelpMatchData,
        // yelpDetailsData,
        // yelpDeliveryData,
        // yelpServiceData,
        // yelpInsightData
      };
      const yelpFoodData = await this.yelp.getFoodData(store);
      // const yelpFusionData = await this.yelp.getFusionData(store);
      // const yelpSearchData = await this.yelp.getSearchData(store);
      // const yelpPhoneData = await this.yelp.getPhoneSearchData(store);
      // const yelpMatchData = await this.yelp.getBusinessMatchData(store);
      // const yelpDetailsData = await this.yelp.getBusinessDetailsData(store);
      // const yelpDeliveryData = await this.yelp.getFoodDeliverySearchData(store);
      // const yelpServiceData = await this.yelp.getServiceOfferingsData(store);

      return store;
    
    } catch (error) {
      console.error("^10:getStoreBySlug", "Error:", error);
      return null;
    }
  }

    // async getAllStores(slug) {
  //   try {
  //     debugLog("!00:getAllStores", "Starting fetch for all stores");

  //     // 1. Get all data from DataPost
  //     const dataBlog = new DataPost();
  //     const allData = await dataBlog.getData();
  //     debugLog("!01:getAllStores", "All data items:", allData?.length);

  //     // 2. Filter for stores
  //     const storeData = allData.filter(item => item.variant === 'stores');
  //     debugLog("!02:getAllStores", "Store items:", storeData?.length);

  //     if (!storeData?.length) {
  //       console.error("!03:getAllStores", "No stores found");
  //       return [];
  //     }

  //     // 3. Get Yelp data and combine for each store
  //     const combinedStores = await Promise.all(storeData.map(async (store) => {
  //       const storesParams = {
  //         storeName: store.headline?.text,
  //         storeAddress: store.location?.address,
  //         storeCity: address.city(store.location?.address),
  //         storeState: address.state(store.location?.address),
  //         storeLongitude: store.location?.geolocation?.lon,
  //         storeLatitude: store.location?.geolocation?.lat
  //       };
  //       console.log("!04:[StoreData.getAllStores] storeParams:", storesParams);

  //       // Get Yelp data
  //       const yelpData = await this.yelp.getStoreData(storesParams);
  //       debugLog("!05:getAllStores", "Yelp data for store:", store.slug, yelpData);

  //       // Combine store and Yelp data
  //       return {
  //         ...store,
  //         yelpData: yelpData
  //           ? {
  //               ...yelpData,
  //               hours: this.transformYelpHours(yelpData),
  //               data: this.heroData(yelpData)
  //             }
  //           : null
  //       };
  //     }));

  //     debugLog("!06:getAllStores", "Combined stores:", combinedStores?.length);
  //     return combinedStores;

  //   } catch (error) {
  //     console.error("getAllStores", "Error:", error);
  //     return [];
  //   }
  // }
  // async store(yelpData) {
  //   try {
  //     console.log("[StoreData.store] Creating store with yelpData:", yelpData);
      
  //     // Use the global store object's first item as template
  //     const storeTemplate = store.item[0];
      
  //     // Create store object combining template with Yelp data
  //     const combinedStore = {
  //       hero: this.heroData(yelpData) || storeTemplate.details,
  //       overview: storeTemplate.overview || [],
  //       experience: storeTemplate.experience || [],
  //       service: storeTemplate.service || [],
  //       business: storeTemplate.business || [],
  //       location: storeTemplate.location || {},
  //       yelpData: yelpData // Store original Yelp data
  //     };

  //     console.log("[StoreData.store] Created store object:", combinedStore);
  //     return combinedStore;
    
  // } catch (error) {
  //   console.error("getStoreBySlug", "Error:", error);
  //   return null;
  // }
  // }

  // Add this function back

  // async store(slug) {
  //   try {
  //     // Get store data from DataPost
  //     const dataBlog = new DataPost();
  //     const storeData = await dataBlog.getData();
  //     const validStores = storeData.filter((store) => store.slug);
  //     let matchedStore = validStores.find((s) => s.slug === slug);
  
  //     if (!matchedStore) {
  //       console.error("^05:getStoreBySlug", "Store not found for slug:", slug);
  //       return this.createDefaultStore(slug);
  //     }
  
  //     const storeParams = {
  //       storeName: matchedStore.headline?.text,
  //       storeAddress: matchedStore.location?.address,
  //       storeCity: address.city(matchedStore.location?.address),
  //       storeState: address.state(matchedStore.location?.address),
  //       storeLongitude: matchedStore.location?.geolocation?.lon,
  //       storeLatitude: matchedStore.location?.geolocation?.lat,
  //       storeId: matchedStore.id,
  //       storeAlias: matchedStore.alias,
  //     };
      
  //     // Use a single function to get all Yelp data with proper rate limiting
  //     const yelpData = await this.getYelpDataWithRateLimiting(storeParams);
      
  //     // Create store object combining all data
  //     const store = {
  //       hero: this.hero(yelpData.basic),
  //       overview: this.overview(yelpData.basic),
  //       experience: this.experience(yelpData.basic),
  //       service: this.service(),
  //       business: this.business(yelpData.basic),
  //       location: this.location(yelpData.basic),
  //       categoryData: this.categoryData(yelpData.food),
  //       mapRadiusData: this.mapRadiusData(yelpData.basic),
  //       yelpData: yelpData.basic,
  //       yelpFoodData: yelpData.food,
  //       yelpSearchData: yelpData.search
  //     };
  
  //     return store;
  //   } catch (error) {
  //     console.error("^10:getStoreBySlug", "Error:", error);
  //     return this.createDefaultStore(slug);
  //   }
  // }
  
  // New helper method to get all Yelp data with rate limiting
  async getYelpDataWithRateLimiting(storeParams) {
    // First, get the basic business data
    const basicData = await this.yelp.getStoreData(storeParams);
    console.log("Got basic Yelp data:", basicData ? "Yes" : "No");
    
    // Add a delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get food data if we have a valid business ID
    let foodData = null;
    if (basicData && basicData.id) {
      try {
        const foodParams = {
          ...storeParams,
          yelpId: basicData.id
        };
        foodData = await this.yelp.getFoodData(foodParams);
        console.log("Got food data:", foodData ? "Yes" : "No");
      } catch (error) {
        console.error("Error getting food data:", error);
      }
    }
    
    // Add another delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get search data if needed
    let searchData = null;
    try {
      searchData = await this.yelp.getSearchData(storeParams);
      console.log("Got search data:", searchData ? "Yes" : "No");
    } catch (error) {
      console.error("Error getting search data:", error);
    }
    
    // Return all the data
    return {
      basic: basicData,
      food: foodData,
      search: searchData
    };
  }

  heroData(yelpData) {
    try {
      if (!yelpData) {
        return null;
      }

      function getCostEstimate(price) {
        switch(price) {
          case "$": return "3-6";
          case "$$": return "9-12";
          case "$$$": return "15-20";
          case "$$$$": return "20+";
          default: return "NA";
        }
      }

      return {
        rating: yelpData.rating || 0,
        review_count: yelpData.review_count || 0,
        price: yelpData.price || "$$",
        costEstimate: getCostEstimate(yelpData.price),
        storeType: yelpData.categories || [],
        distance: yelpData.distance 
          ? `${(yelpData.distance / 1609.34).toFixed(1)}mi` 
          : "0.0mi",
        city: yelpData.location?.city || "",
        state: yelpData.location?.state || "",
        storeName: yelpData.name || "",
        distanceMiles: yelpData.distance 
          ? (yelpData.distance / 1609.34).toFixed(1) 
          : "0.0",
        status: yelpData.hours?.[0]?.is_open_now ? "Open" : "Closed",
        gallery: yelpData.photos || []
      };
    } catch (error) {
      console.error("[StoreData.heroData] Error:", error);
      return null;
    }
  }
};