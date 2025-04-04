// src/server/data/data.js
import { Yelp } from "./yelp/yelp.js";
import * as contentfulApi from "./contentful/contentfulApi.js";
import ContentfulData from "./contentful/contentful.js";
import DataPost from "../../client/data/DataPost.js";
import * as address from "../../client/components/map/geo/address.js";
import { io } from "socket.io-client";

// Debug logging helper
const debugLog = (location, message, data) => {
  console.log(`[DEBUG][${location}]`, message, data ? data : "");
};

// Initialize global objects
// let store = null;

export class StoreData {
  constructor() {
    this.activeTags = [];
    this.yelp = Yelp;
    // this.yelpData = Yelp.getStoreData(slug);
    this.socket = io("http://localhost:4000");
  }

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

        // Get Yelp data
        const yelpData = await this.yelp.getStoreData(storesParams);
        // debugLog("!05:getAllStores", "Yelp data for store:", store.slug, yelpData);

        // Combine store and Yelp data
        return {
          ...store,
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

      // 4. If no matching store, try to match with partial slug
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

      const storeParams = {
        storeName: matchedStore.headline?.text,
        storeAddress: matchedStore.location?.address,
        storeCity: address.city(matchedStore.location?.address),
        storeState: address.state(matchedStore.location?.address),
        storeLongitude: matchedStore.location?.geolocation?.lon,
        storeLatitude: matchedStore.location?.geolocation?.lat
      };
      console.log("!04:[StoreData.getStoreBySlug] storeParams:", storeParams);

      // 3. Get Yelp data using store details
      const yelpData = await this.yelp.getStoreData(storeParams);
      // debugLog("05:getStoreBySlug", "Yelp data:", yelpData);

      // const contentfulData = matchedStore;

      // 4. Combine the data and make store data globally available
      // const combinedStore = {
      //   ...matchedStore,
      //   ...yelpStore,
      // };
      const combinedStore = {
        ...matchedStore,
        yelpData: yelpData
          ? {
              ...yelpData,
              hours: this.transformYelpHours(yelpData),
              data: this.heroData(yelpData)
            }
          : null
      };

      

      // // Make store data globally available
      // store = combinedStore;
      // debugLog("%%%%combined store", store);

      // Update heroData with the new store data
      this.heroData();

      // debugLog("getStoreBySlug", "Combined store data:", contentfulData);

    
      return combinedStore;
    } catch (error) {
      console.error(`[data.js] Error in getStoreBySlug: ${error.message}`);
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

 categoryData() {
    try {
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
        storeLatitude: matchedStore.location?.geolocation?.lat
      };
      console.log("^06:[StoreData.getStoreBySlug] storeParams:", storeParams);

      // 3. Get Yelp data using store details
      const yelpData = await this.yelp.getStoreData(storeParams);
      // debugLog("^08:getStoreBySlug", "Yelp data:", yelpData);

      
      // Use the global store object's first item as template
      // const storeTemplate = store.item[0];
      
      // Create store object combining template with Yelp data
      const store = {
        hero: this.hero(yelpData),
        overview: this.overview(yelpData),
        experience: this.experience(yelpData),
        service: this.service(),
        business: this.business(yelpData),
        location: this.location(yelpData),
        categoryData: this.categoryData(yelpData),
        mapRadiusData: this.mapRadiusData(yelpData),
        yelpData // Store original Yelp data
      };

      // console.log("^09:[StoreData.store] Created store object:", store);
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
  

  // Helper function to update heroData with Yelp data
  // heroData(storeData) {
  //   debugLog('heroData', 'Starting update with store:', storeData);

  //   const heroData = {
  //     // Fields used by storeDetail component
  //     rating: store?.yelpData?.rating || "0.00",
  //     review_count: store?.yelpData?.review_count || "0",
  //     price: store?.yelpData?.price || "$$",
  //     costEstimate: store?.yelpData?.price?.length?.toString() || "3-6",
  //     storeType: store?.yelpData?.categories?.[0]?.title || "Coffee Shop",
  //     distance: store?.yelpData?.distance
  //       ? `${(store.yelpData.distance / 1609.34).toFixed(1)}mi`
  //       : "1.5mi",
  //     city: store?.yelpData?.location?.city || "Cerritos",
  //     state: store?.yelpData?.location?.state || "CA",

  //     // Fields used by storeHeadline component
  //     storeName: store?.yelpData?.name || "Smoking Tiger Bread Factory",
  //     distanceMiles: store?.yelpData?.distance
  //       ? (store.yelpData.distance / 1609.34).toFixed(1)
  //       : "1.1",
  //     status: store?.yelpData?.hours?.[0]?.is_open_now ? "Open" : "Closed",

  //     // Fields used by heroGallery component
  //     galleryImages: [
  //       store?.yelpData?.image_url,
  //       ...(store?.yelpData?.photos || []),
  //       "https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png"
  //     ].filter(Boolean)
  //   };

  //   debugLog('heroData', 'Final heroData:', heroData);
  // }


// const img01 = "U-GfASZ4XZogkRBDW9-V8g/o.jpg";
// const img02 = "s5XFXRnTc59CWYNE3oaX_Q/o.jpg";
// const img03 = "6RpQGw8xKEUpTu4u1VKBaQ/o.jpg";
// const img04 = "A3Zg_SVzUOGmNldZP6ejqA/o.jpg";
// const img05 = "YAt__uoyAbrxIzsNQf_fgA/o.jpg";
// const img06 = "OKPVWA90EuEFqUJz48jT-w/o.jpg";
// const img07 = "dKB-Ii9OfutdyneoTmKcVA/o.jpg";
// const img08 = "coUrKqZBdU0NjEwa1jtLtw/o.jpg";
// const img09 = "6I0fcLpnc0fh9p4LNxTs-w/o.jpg";

// let yelp = "null";
// // const socket = io('http://localhost:4000');

// let contentfulData = new ContentfulData();
// // const yelpData = YelpData.YelpData;

// // console.log("[data.js] Initializing with yelp module:", yelp);

// // export const storeData = new StoreData();

// // async fetchStores() {
// //   try {
// //     console.log("[StoreData.fetchStores] Starting fetch");

// //     const contentfulStores = await this.contentfulData.getStores();
// //     console.log("[StoreData.fetchStores] Contentful stores:", contentfulStores?.length);
// //     // Combine and format store data
// //     const stores = this.store.item.map(store => ({
// //       ...store,
// //       hero: [{
// //         rating: store.rating || '3.33',
// //         costEstimate: store.costEstimate || '3-6',
// //         storeType: store.category?.categoryType || 'Coffee Shop',
// //         distance: store.distance || '1.5mi',
// //         city: store.location?.city || 'Cerritos',
// //         state: store.location?.state || 'CA',
// //         storeName: store.name || 'Store Name',
// //         distanceMiles: store.distanceMiles || '1.1',
// //         status: store.status || 'Busy until 6pm',
// //         galleryImages: store.media?.gallery || heroData.galleryImages
// //       }],
// //       overview: [{
// //         // ... overview data structure
// //       }],
// //       service: [{
// //         categories: serviceCategoryData
// //       }],
// //       experience: [{
// //         // ... experience data structure
// //       }],
// //       location: {
// //         ...store.location,
// //         attributes: location.locations[0].attrtagss
// //       },
// //       business: [{
// //         // ... business data structure
// //       }]
// //     }));
// //     console.log("stores", stores);

// //     // Get store data from different sources
// //     const storeData = await this.YelpData.getStoreData(searchRequest);
// //     console.log("[StoreData.fetchStores] Store data:", storeData?.length);

// //     console.log("[StoreData.fetchStores] Formatted stores:", stores?.length);
// //     return stores;

// //   } catch (error) {
// //     console.error("[StoreData.fetchStores] Error:", error);
// //     return [];
// //   }
// // }

// // export const contentful = {
// //   render: async () => {
// //     const request = parseRequestUrl();
// //     const storeData = await dataBlog.getData();
// //     console.log("data.js storeData", storeData);

// //     const validStores = storeData.filter((store) => store.slug);
// //     console.log("data.js Valid stores:", validStores);

// //     store = validStores.find((store) => store.slug === request.slug);
// //     console.log("data.js slug", store.slug);
// //     console.log("data.js store", store);
// //   }
// // };

// // export async function initializeData() {
// //   try {
// //     console.log("Initializing application data");

// //     const businessId = "0fGRTbEhBNDUP7AfUFqvPQ"; // Smoking Tiger ID
// //     const yelpData = await yelp.getStoreData(businessId);
// //     console.log("Yelp data received:", yelpData);

// //     const searchParams = {
// //       term: "Smoking Tiger Bread Factory",
// //       location: "Cerritos, CA",
// //       limit: 1
// //     };

// //     // First search for the business
// //     const searchResults = await yelp.searchBusinesses(search);
// //     console.log("Search results:", searchResults);

// //     //BUSINESS NAME AND LOCATION MUST be DYNAMIC
// //     const businessName = "Smoking Tiger Bread Factory";
// //     const location = "cerritos, ca";

// //     console.log("Initializing data for:", businessName);
// //     const yelp = yelp.yelp;
// //     // const yelpData = await yelp.getStoreData('0fGRTbEhBNDUP7AfUFqvPQ'); // Using direct business ID
// //     // console.log('Raw Yelp data:', yelpData);
// //     if (yelpData?.hours) {
// //       const hours = yelp.businessData(yelpData);
// //       const hoursData = hours.transformData.hours;
// //       console.log("Transformed hours data:", hoursData);

// //       // Update store hours
// //       store.item[0] = {
// //         ...store.item[0],
// //         name: YelpData.name,
// //         hours: YelpData.hours
// //       };
// //     }
// //     if (searchResults?.businesses?.[0]?.id) {
// //       // Then get business details using the ID
// //       const businessId = searchResults.businesses[0].id;
// //       const storeData = await yelp.businessData(businessId);
// //       console.log("!!!Store details:", storeData);
// //       if (yelpData.photos?.length) {
// //         const newGalleryImages = [
// //           yelpData.image_url,
// //           ...yelpData.photos,
// //           ...heroData.galleryImages.slice(-1)
// //         ].filter(Boolean);
// //         updateField('galleryImages', newGalleryImages, heroData.galleryImages);
// //       }
// //     } else {
// //       debugLog('heroData', 'No store data available, using default values');
// //     }

// //     debugLog('heroData', 'Final heroData:', heroData);
// //   }
// // }

// // Export heroData with store-based values
// export const heroData = {
//   // Fields used by storeDetail component
//   rating: store?.yelpData?.rating || "0.00",
//   review_count: store?.yelpData?.review_count || "0",
//   price: store?.yelpData?.price || "$$",
//   costEstimate: store?.yelpData?.price?.length?.toString() || "3-6",
//   storeType: store?.yelpData?.categories?.[0]?.title || "Coffee Shop",
//   distance: store?.yelpData?.distance
//     ? `${(store.yelpData.distance / 1609.34).toFixed(1)}mi`
//     : "1.5mi",
//   city: store?.yelpData?.location?.city || "Cerritos",
//   state: store?.yelpData?.location?.state || "CA",

//   // Fields used by storeHeadline component
//   storeName: store?.yelpData?.name || "Smoking Tiger Bread Factory",
//   distanceMiles: store?.yelpData?.distance
//     ? (store.yelpData.distance / 1609.34).toFixed(1)
//     : "1.1",
//   status: store?.yelpData?.hours?.[0]?.is_open_now ? "Open" : "Closed",

//   // Fields used by heroGallery component
//   galleryImages: [
//     store?.yelpData?.image_url,
//     ...(store?.yelpData?.photos || []),
//     "https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png"
//   ].filter(Boolean)
// };

// export async function getFooterData() {
//   const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
//   return response.json();
// }

// export const headerData = {
//   overview: "Overview",
//   experience: "Experience",
//   service: "Service",
//   business: "Business"
// };

// export const textBlockData = {
//   title: "Summary",
//   content:
//     "The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.fdsfsdfd"
// };

// export const footerData = {
//   overview: {
//     contributionsCount: 333,
//     modifiedDate: "06/06/24",
//     modifiedTime: 3,
//     commentsCount: 333,
//     reviewsCount: 333,
//     likesCount: 333,
//     dislikesCount: 333
//   },
//   experience: {
//     contributionsCount: 333,
//     modifiedDate: "06/06/24",
//     modifiedTime: 3,
//     commentsCount: 333,
//     reviewsCount: 333,
//     likesCount: 333,
//     dislikesCount: 333
//   },
//   service: {
//     contributionsCount: 333,
//     modifiedDate: "06/06/24",
//     modifiedTime: 3,
//     commentsCount: 333,
//     reviewsCount: 333,
//     likesCount: 333,
//     dislikesCount: 333
//   },
//   business: {
//     contributionsCount: 333,
//     modifiedDate: "06/06/24",
//     modifiedTime: 3,
//     commentsCount: 333,
//     reviewsCount: 333,
//     likesCount: 333,
//     dislikesCount: 333
//   },
//   location: {
//     contributionsCount: 333,
//     modifiedDate: "06/06/24",
//     modifiedTime: 3,
//     commentsCount: 333,
//     reviewsCount: 333,
//     likesCount: 333,
//     dislikesCount: 333
//   }
// };

// export const subStoreData = {
//   distance: "0.3",

//   imageUrl:
//     "https://eu-images.contentstack.com/v3/assets/blt58a1f8f560a1ab0e/bltbd88badeb5de1e1f/669ef3ecfd135f78652397fc/sprouts-logo_1598024112.png?width=1280&auto=webp&quality=95&format=jpg&disable=upscale", // placeholder image
//   storeName: "Sprouts"
// };

// export const amenitiesItemData = {
//   contributionsCount: 333,
//   modifiedDate: "06/06/24",
//   modifiedTime: 3,
//   commentsCount: 333,
//   reviewsCount: 333,
//   likesCount: 333,
//   dislikesCount: 333
// };

// // export const serviceCategoryData = {
// //   label: 'Coffee',
// //   rank: 1,
// //   itemName: 'Strawberry Matcha Latte',
// //   imageUrl: 'placeholder',
// //   itemCount: 333
// // };

// // serviceCategoryData[0].links.image
// // serviceCategoryData[0].items[0].source.links.source
// // serviceCategoryData[0].items[0].source.thumbnail.post.poster.links.profile
// export const serviceCategoryData = {
//   matcha: {
//     rank: 1,
//     category: "Matcha", // this is cardCategoryItem's amtagCategory's data.category's data.category
//     links: {
//       //update link to trigger gallery modal + anchor link to the category
//       image: "/gallery/${category}" //this is the href of the amtagCategory
//     },
//     items: {
//       first: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "1", // this is amtagItem's data.rank
//         name: "Matcha Pistaccio Crossiant", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/Jh0zD8Wj5F4Ex2rnxY8zlg/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       second: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "2", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/tECvZwf-IowgzeCv8lzAmQ/o.jpg"
//           },
//           post: {
//             description: "Bannana Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       third: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "3", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       }
//     }
//   },

//   coffee: {
//     rank: 2,
//     category: "Coffee", // this is cardCategoryItem's amtagCategory's data.category's data.category
//     links: {
//       //update link to trigger gallery modal + anchor link to the category
//       image: "/gallery/${category}" //this is the href of the amtagCategory
//     },
//     items: {
//       first: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "1", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/nD2wrwvKI_DMG0NvqYszzA/348s.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       second: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "2", // this is amtagItem's data.rank
//         name: "Iced Vanilla Latte", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       third: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "3", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       }
//     }
//   },

//   pastries: {
//     rank: 3,
//     category: "Pastries", // this is cardCategoryItem's amtagCategory's data.category's data.category
//     links: {
//       //update link to trigger gallery modal + anchor link to the category
//       image: "/gallery/${category}" //this is the href of the amtagCategory
//     },
//     items: {
//       first: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "1", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       second: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "2", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       third: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "3", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       }
//     }
//   },

//   teas: {
//     rank: 4,
//     category: "Teas", // this is cardCategoryItem's amtagCategory's data.category's data.category
//     links: {
//       //update link to trigger gallery modal + anchor link to the category
//       image: "/gallery/${category}" //this is the href of the amtagCategory
//     },
//     items: {
//       first: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "1", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       second: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "2", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       third: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "3", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       }
//     }
//   },

//   beverages: {
//     rank: 5,
//     category: "Beverages", // this is cardCategoryItem's amtagCategory's data.category's data.category
//     links: {
//       //update link to trigger gallery modal + anchor link to the category
//       image: "/gallery/${category}" //this is the href of the amtagCategory
//     },
//     items: {
//       first: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "1", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       second: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "2", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       third: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "3", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       }
//     }
//   },

//   lunch: {
//     rank: 6,
//     category: "Lunch", // this is cardCategoryItem's amtagCategory's data.category's data.category
//     links: {
//       //update link to trigger gallery modal + anchor link to the category
//       image: "/gallery/${category}" //this is the href of the amtagCategory
//     },
//     items: {
//       first: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "1", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       second: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "2", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       },
//       third: {
//         //update with id generator in a new id file id.js as generateId()
//         id: "1",
//         rank: "3", // this is amtagItem's data.rank
//         name: "Strawberry Matcha", // this is amtagItem's data.name
//         links: {
//           //update link to trigger gallery modal + anchor link to the category
//           image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//         },
//         source: {
//           name: "Yelp",
//           logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             source: "https://www.yelp.com" // this amtagItem's href url
//           }
//         },
//         thumbnail: {
//           media: {
//             thumbnail:
//               "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//           },
//           post: {
//             description: "Tasty Strawberry Matcha Latte",
//             poster: {
//               username: "evabear",
//               link: {
//                 profile:
//                   "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//               }
//             }
//           }
//         }
//       }
//     }
//   }
//   // This is just the data from cardPopularData
//   // I just took the gallery images from each and made them into
//   // its own item and ranked from top being 1, bottom being 2
//   // 'https://s3-media0.fl.yelpcdn.com/bphoto/A3Zg_SVzUOGmNldZP6ejqA/o.jpg',
//   // 'https://s3-media0.fl.yelpcdn.com/bphoto/YAt__uoyAbrxIzsNQf_fgA/o.jpg',
//   // 'https://s3-media0.fl.yelpcdn.com/bphoto/6RpQGw8xKEUpTu4u1VKBaQ/o.jpg',
//   // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//   // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//   // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//   // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//   // title: 'Yelp',
//   //     description: 'Pineapple Express',
//   //     logo: 'https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos',
//   //     url: 'https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos',
//   //     credit: 'Yelp',
//   //     creditUrl: 'https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos',

//   // please use the rank 1 as reference and any data you can get from the internet
//   // about smoking tiger bread factory coffee shop in cerritos
//   // also, when getting references, update all data and source, details, user, etc

//   // here are the categories after rank: 1
//   // rank 2: pastries
//   // rank 3: coffee
//   // rank 4: lunch
//   // rank 5: tea
// };

// export const cardPopularyData = {
//   first: {
//     rank: "1",
//     name: "Strawberry Matcha Latte",
//     type: "Matcha",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg",
//         "https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg"
//       ]
//     },
//     source: {
//       title: "Yelp",
//       description: "Strawberry Matcha Latte",
//       logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//       url: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//     }
//   },
//   second: {
//     rank: "2",
//     name: "Pineapple Express",
//     type: "Specialty Drink",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/A3Zg_SVzUOGmNldZP6ejqA/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/A3Zg_SVzUOGmNldZP6ejqA/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/YAt__uoyAbrxIzsNQf_fgA/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/6RpQGw8xKEUpTu4u1VKBaQ/o.jpg",
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07
//       ]
//     },
//     source: {
//       title: "Yelp",
//       description: "Pineapple Express",
//       logo: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       url: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     }
//   },
//   third: {
//     rank: "3",
//     name: "Jeju Matcha Latte",
//     type: "Matcha",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/OKPVWA90EuEFqUJz48jT-w/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/OKPVWA90EuEFqUJz48jT-w/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/dKB-Ii9OfutdyneoTmKcVA/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/coUrKqZBdU0NjEwa1jtLtw/o.jpg",
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04
//       ]
//     },
//     description:
//       "JEJU MATCHA LATTE WITH ALMOND MILK (ICED) - Picture ain't great, but oh well. Still delicious!",
//     source: {
//       title: "Yelp",
//       description: "Jeju Matcha Latte",
//       logo: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       url: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     }
//   },
//   fourth: {
//     rank: "4",
//     name: "Hojicha Latte",
//     type: "Latte",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/6I0fcLpnc0fh9p4LNxTs-w/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/6I0fcLpnc0fh9p4LNxTs-w/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/zQaZcJ2rgevwCkQTQmpcLw/o.jpg",
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img03
//       ]
//     },
//     description:
//       "Smoking Spaniard & Hojicha Latte. JEJU MATCHA LATTE WITH ALMOND MILK (ICED) - Picture ain't great, but oh well. Still delicious!",
//     source: {
//       title: "Yelp",
//       description: "Hojicha Latte",
//       logo: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       url: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     }
//   },
//   fifth: {
//     rank: "5",
//     name: "Choco Mugwort Latte",
//     type: "Latte",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//         "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//       ]
//     },
//     description:
//       "Mugwort Latte and Black Coffee. Tiger Latte (ice only) and Mugwort Latte. Earthy and delish on right, Jeju Tangerine on left.",
//     source: {
//       title: "Yelp",
//       description: "Choco Mugwort Latte",
//       logo: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       url: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     }
//   },
//   ssixth: {
//     rank: "6",
//     name: "Kho Latte",
//     type: "Latte",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/sWaHfm74D4YBOfq8oZQjwg/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/sWaHfm74D4YBOfq8oZQjwg/o.jpg",
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img02, // Placeholder for generated images
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img03,
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04
//       ]
//     },
//     description: "Cold Brew and Hot Kho Latte.",
//     source: {
//       title: "Yelp",
//       description: "Kho Latte",
//       logo: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       url: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     }
//   },
//   seventh: {
//     rank: "7",
//     name: "Baby Latte",
//     type: "Latte",
//     thumbnail:
//       "https://s3-media0.fl.yelpcdn.com/bphoto/ElbNRb-HF6vWH4DERhli_Q/o.jpg",
//     url: {
//       gallery: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     },
//     media: {
//       url: "/gallery",
//       gallery: [
//         "https://s3-media0.fl.yelpcdn.com/bphoto/ElbNRb-HF6vWH4DERhli_Q/o.jpg",
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img02, // Placeholder for generated images
//         `https://s3-media0.fl.yelpcdn.com/bphoto/` + img03
//       ]
//     },
//     description: "Baby Latte.",
//     source: {
//       title: "Yelp",
//       description: "Baby Latte",
//       logo: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       url: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos",
//       credit: "Yelp",
//       creditUrl: "https://www.yelp.com/biz/smoking-tiger-bread-factory-cerritos"
//     }
//   }
// };

// export const overviewSummaryData = {
//   experienceScore: "93",
//   experience: [
//     { label: "Large Space", score: 9, user: 333 },
//     { label: "Crowded", score: 2, user: 333 },
//     { label: "Youthful", score: 2, user: 333 },
//     { label: "Students", score: 2, user: 333 },
//     { label: "Friends", score: 2, user: 333 },
//     { label: "Multicultural", score: 2, user: 333 },
//     { label: "Bright", score: 2, user: 333 },
//     { label: "Friendly", score: 2, user: 333 },
//     { label: "Casual", score: 2, user: 333 }
//   ],
//   serviceScore: "93",
//   service: [
//     { label: "Tea & Matcha", score: 2, user: 333 },
//     { label: "Pastries", score: 2, user: 333 },
//     { label: "Coffee", score: 2, user: 333 },
//     { label: "Quality", score: 2, user: 333 },
//     { label: "Original", score: 2, user: 333 },
//     { label: "Seasonal", score: 2, user: 333 },
//     { label: "Korean", score: 2, user: 333 },
//     { label: "Craft", score: 2, user: 333 },
//     { label: "Artisian", score: 2, user: 333 }
//   ],
//   businessScore: "93",
//   business: [
//     { label: "Large Space", score: 2, user: 333 },
//     { label: "Crowded", score: 2, user: 333 },
//     { label: "Youthful", score: 2, user: 333 },
//     { label: "Students", score: 2, user: 333 },
//     { label: "Friends", score: 2, user: 333 },
//     { label: "Multicultural", score: 2, user: 333 },
//     { label: "Bright", score: 2, user: 333 },
//     { label: "Friendly", score: 2, user: 333 },
//     { label: "Casual", score: 2, user: 333 }
//   ],
//   locationScore: "93",
//   location: [
//     { label: "Busy", score: 2, user: 333 },
//     { label: "Hidden", score: 2, user: 333 },
//     { label: "Safe", score: 2, user: 333 },
//     { label: "Clustered", score: 2, user: 333 },
//     { label: "Popular", score: 2, user: 333 },
//     { label: "Parking", score: 2, user: 333 },
//     { label: "Clean", score: 2, user: 333 },
//     { label: "Spaced Out", score: 2, user: 333 },
//     { label: "Residential", score: 2, user: 333 }
//   ]
// };

// export const attributesData = {
//   bestfor: [
//     { label: "Remote Work", score: 2, count: 2 },
//     { label: "Socializing", score: 2, count: 2 },
//     { label: "Zoom Calls", score: 2, count: 2 },
//     { label: "Studying", score: 2, count: 2 },
//     { label: "Group Study", score: 2, count: 2 },
//     { label: "Reading", score: 2, count: 2 },
//     { label: "Label", score: 2, count: 2 },
//     { label: "Label", score: 2, count: 2 },
//     { label: "Label", count: 2 }
//   ],
//   working: [
//     { label: "Tables", score: 2, count: 2 },
//     { label: "Outlets", score: 2, count: 2 },
//     { label: "Password", score: 2, count: 2 },
//     { label: "Protected Wifi", score: 2, count: 2 },
//     { label: "Wifi", score: 2, count: 2 },
//     { label: "Single Tables", score: 2, count: 2 },
//     { label: "Opens Late", score: 2, count: 2 },
//     { label: "Coffee & Pastries", score: 2, count: 2 },
//     { label: "Label", count: 2 }
//   ],
//   environment: [
//     { label: "Hipster", score: 2, count: 9 },
//     { label: "Modern", score: 2, count: 2 },
//     { label: "Board Games", score: 2, count: 2 },
//     { label: "Alternative", score: 2, count: 2 },
//     { label: "Youthful", score: 2, count: 9 },
//     { label: "Korean", score: 2, count: 2 },
//     { label: "Friendly", score: 2, count: 2 },
//     { label: "Label", score: 2, count: 2 },
//     { label: "Label", count: 2 }
//   ],
//   facility: [
//     { label: "Cool", score: 2, count: 9 },
//     { label: "Clean", score: 2, count: 2 },
//     { label: "Outdoor Seating", score: 2, count: 2 },
//     { label: "Spacious", score: 9, count: 2 },
//     { label: "New", score: 2, count: 2 },
//     { label: "Plaza", score: 2, count: 9 },
//     { label: "Coffee & Pastries", score: 3, count: 2 },
//     { label: "Label", score: 1, count: 2 },
//     { label: "Label", count: 1 }
//   ]
// };

// export const storeLocationData = {};

// // Render components
// // document.addEventListener('DOMContentLoaded', () => {
// //   const footerContainer = document.getElementById('footer-container');
// //   if (footerContainer) {
// //     footerContainer.innerHTML = footerItem.render(footerData);
// //   }

// //   const subStoreContainer = document.getElementById('sub-store-container');
// //   if (subStoreContainer) {
// //     subStoreContainer.innerHTML = cardSubStore.render(subStoreData);
// //   }
// // });

// export const mapRadiusData = {
//   address: "11900 South St Ste 134 Cerritos, CA 90703",
//   stores: [
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.034084142948, 38.909671288923]
//       },
//       properties: {
//         id: 1,
//         phoneFormatted: "(202) 234-7336",
//         phone: "2022347336",
//         address: "1471 P St NW",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "at 15th St NW",
//         postalCode: "20005",
//         state: "D.C."
//       }
//     },
//     // Additional stores...
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.034084142948, 38.909671288923]
//       },
//       properties: {
//         phoneFormatted: "(202) 234-7336",
//         phone: "2022347336",
//         address: "1471 P St NW",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "at 15th St NW",
//         postalCode: "20005",
//         state: "D.C."
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.049766, 38.900772]
//       },
//       properties: {
//         phoneFormatted: "(202) 507-8357",
//         phone: "2025078357",
//         address: "2221 I St NW",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "at 22nd St NW",
//         postalCode: "20037",
//         state: "D.C."
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.043929, 38.910525]
//       },
//       properties: {
//         phoneFormatted: "(202) 387-9338",
//         phone: "2023879338",
//         address: "1512 Connecticut Ave NW",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "at Dupont Circle",
//         postalCode: "20036",
//         state: "D.C."
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.0672, 38.90516896]
//       },
//       properties: {
//         phoneFormatted: "(202) 337-9338",
//         phone: "2023379338",
//         address: "3333 M St NW",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "at 34th St NW",
//         postalCode: "20007",
//         state: "D.C."
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.002583742142, 38.887041080933]
//       },
//       properties: {
//         phoneFormatted: "(202) 547-9338",
//         phone: "2025479338",
//         address: "221 Pennsylvania Ave SE",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "btwn 2nd & 3rd Sts. SE",
//         postalCode: "20003",
//         state: "D.C."
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-76.933492720127, 38.99225245786]
//       },
//       properties: {
//         address: "8204 Baltimore Ave",
//         city: "College Park",
//         country: "United States",
//         postalCode: "20740",
//         state: "MD"
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.097083330154, 38.980979]
//       },
//       properties: {
//         phoneFormatted: "(301) 654-7336",
//         phone: "3016547336",
//         address: "4831 Bethesda Ave",
//         cc: "US",
//         city: "Bethesda",
//         country: "United States",
//         postalCode: "20814",
//         state: "MD"
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.359425054188, 38.958058116661]
//       },
//       properties: {
//         phoneFormatted: "(571) 203-0082",
//         phone: "5712030082",
//         address: "11935 Democracy Dr",
//         city: "Reston",
//         country: "United States",
//         crossStreet: "btw Explorer & Library",
//         postalCode: "20190",
//         state: "VA"
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.10853099823, 38.880100922392]
//       },
//       properties: {
//         phoneFormatted: "(703) 522-2016",
//         phone: "7035222016",
//         address: "4075 Wilson Blvd",
//         city: "Arlington",
//         country: "United States",
//         crossStreet: "at N Randolph St.",
//         postalCode: "22203",
//         state: "VA"
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-75.28784, 40.008008]
//       },
//       properties: {
//         phoneFormatted: "(610) 642-9400",
//         phone: "6106429400",
//         address: "68 Coulter Ave",
//         city: "Ardmore",
//         country: "United States",
//         postalCode: "19003",
//         state: "PA"
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-75.20121216774, 39.954030175164]
//       },
//       properties: {
//         phoneFormatted: "(215) 386-1365",
//         phone: "2153861365",
//         address: "3925 Walnut St",
//         city: "Philadelphia",
//         country: "United States",
//         postalCode: "19104",
//         state: "PA"
//       }
//     },
//     {
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [-77.043959498405, 38.903883387232]
//       },
//       properties: {
//         phoneFormatted: "(202) 331-3355",
//         phone: "2023313355",
//         address: "1901 L St. NW",
//         city: "Washington DC",
//         country: "United States",
//         crossStreet: "at 19th St",
//         postalCode: "20036",
//         state: "D.C."
//       }
//     }
//   ]
// };

// export const titleData = {
//   title: "Spaces"
// };

// export const areaData = {
//   item: [
//     {
//       area: "Outside",
//       links: {
//         //update link to trigger gallery modal + anchor link to the category
//         gallery: "/gallery/${category}" //this is the href of the amtagCategory
//       },
//       images: [
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "1",
//           impressions: {
//             users: 333,
//             likes: 36,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/5s3-S9Itb9iA9H6wmVGSgA/o.jpg"
//             },
//             post: {
//               description: "Smoking Tiger Bread Factory",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "2",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "3",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         }
//       ]
//     },
//     {
//       area: "Entrance",
//       links: {
//         //update link to trigger gallery modal + anchor link to the category
//         gallery: "/gallery/${category}" //this is the href of the amtagCategory
//       },
//       images: [
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "1",
//           impressions: {
//             users: 333,
//             likes: 30,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "2",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "3",
//           impressions: {
//             users: 333,
//             likes: 36,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/kpabkywqhqFXcSJNnXSz5w/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         }
//       ]
//     },
//     {
//       area: "Main Room",
//       links: {
//         //update link to trigger gallery modal + anchor link to the category
//         gallery: "/gallery/${category}" //this is the href of the amtagCategory
//       },
//       images: [
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "1",
//           impressions: {
//             users: 334,
//             likes: 36,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/ZUiuW64ttEYuO8Gy7J8-uw/o.jpg"
//             },
//             post: {
//               description:
//                 "Alot of seating lined up throughout the windows and walls",
//               poster: {
//                 username: "evabeareview",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "2",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "3",
//           impressions: {
//             users: 333,
//             likes: 36,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description:
//                 "This should be number two but same comment as number one!",
//               poster: {
//                 username: "evabeareview02",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         }
//       ]
//     },
//     {
//       area: "Corner Room",
//       links: {
//         //update link to trigger gallery modal + anchor link to the category
//         gallery: "/gallery/${category}" //this is the href of the amtagCategory
//       },
//       images: [
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "1",
//           impressions: {
//             users: 333,
//             likes: 30,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "2",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "3",
//           impressions: {
//             users: 333,
//             likes: 36,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/K27xLUuY_zAjcrfXLiNZKA/o.jpg"
//             },
//             post: {
//               description: "Good work gets done in this corner",
//               poster: {
//                 username: "evabearsfavoritespot",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         }
//       ]
//     },
//     {
//       area: "Outside Patio",
//       links: {
//         //update link to trigger gallery modal + anchor link to the category
//         gallery: "/gallery/${category}" //this is the href of the amtagCategory
//       },
//       images: [
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "1",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/6MJAiRhCy5A7Y7qmp9WERw/o.jpg"
//             },
//             post: {
//               description: "Nice quiet outdoor patio, perfect for meetings",
//               poster: {
//                 username: "outdoor-evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "2",
//           impressions: {
//             users: 333,
//             likes: 30,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "3",
//           impressions: {
//             users: 333,
//             likes: 27,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         }
//       ]
//     },
//     {
//       area: "Bathroom",
//       links: {
//         //update link to trigger gallery modal + anchor link to the category
//         gallery: "/gallery/${category}" //this is the href of the amtagCategory
//       },
//       images: [
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "1",
//           impressions: {
//             users: 333,
//             likes: 31,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "2",
//           impressions: {
//             users: 333,
//             likes: 33,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/62i3iAQ6ygYF_BZ_YMGbqw/o.jpg"
//             },
//             post: {
//               description: "Popular bathroom selfie spot",
//               poster: {
//                 username: "evabear_bathroom",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         },
//         {
//           //update with id generator in a new id file id.js as generateId()
//           id: "3",
//           impressions: {
//             users: 333,
//             likes: 30,
//             dislikes: 3
//           },
//           links: {
//             //update link to trigger gallery modal + anchor link to the category
//             image: "/gallery/${category}/${category.item.id}" // this amtagItem's href url
//           },
//           source: {
//             name: "Yelp",
//             logo: "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2",
//             links: {
//               //update link to trigger gallery modal + anchor link to the category
//               source: "https://www.yelp.com" // this amtagItem's href url
//             }
//           },
//           thumbnail: {
//             media: {
//               thumbnail:
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg"
//             },
//             post: {
//               description: "Tasty Strawberry Matcha Latte",
//               poster: {
//                 username: "evabear",
//                 link: {
//                   profile:
//                     "https://www.yelp.com/biz/smoking-tiger-cerritos-cerritos-2"
//                 }
//               }
//             }
//           }
//         }
//       ]
//     }
//   ]
// };

// export const cardGalleryData = {
//   category: "Coffee",
//   partnerLogo: "https://www.svgrepo.com/show/30758/yelp-logo.svg",
//   // partnerLogo: "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-1/359227055_1129311967983066_3332065457673756995_n.png?stp=dst-png_s480x480&_nc_cat=105&ccb=1-7&_nc_sid=f4b9fd&_nc_ohc=cO7uZVTpkMkQ7kNvgGEHbMA&_nc_ht=scontent-lax3-1.xx&_nc_gid=AZBqoqUf4cZOZTI5D-nEmrh&oh=00_AYA3E_ITT2e71I-BXpR9Ldr10PLYvvfkR5ZZIISff12yNA&oe=670FB6E4",
//   comment: "Front entrance of Smoking Tiger Bread Factory"
//   // userPicture: "path/to/user-picture.png"
// };

// export const location = {
//   locations: [
//     {
//       city: "Cerritos",
//       // city: store?.item?.[0]?.location?.city,
//       attrtags: [
//         {
//           title: "Location",
//           attributes: [
//             { label: "Safe", score: 4, count: 9 },
//             { label: "Busy", score: 6, count: 3 },
//             { label: "Popular", score: 3, count: 9 },
//             { label: "High End", score: 4, count: 12 },
//             { label: "Clean", score: 6, count: 2 }
//           ]
//         },
//         {
//           title: "Surrounding",
//           attributes: [
//             { label: "Shopping", score: 6, count: 2 },
//             { label: "Eatery", score: 2, count: 12 },
//             { label: "Hotspot", score: 1, count: 9 },
//             { label: "Nightlife", count: 15 }
//           ]
//         },
//         {
//           title: "Transportation",
//           attributes: [
//             { label: "Bus", score: 4, count: 3 },
//             { label: "Parking Lots", score: 9, count: 9 },
//             { label: "Paid Parking", score: 4, count: 2 },
//             { label: "Parking lot", count: 15 }
//           ]
//         },
//         {
//           title: "Environment",
//           attributes: [
//             { label: "Inspirational", score: 6, count: 9 },
//             { label: "Busy", score: 1, count: 2 },
//             { label: "Lively", score: 2, count: 3 },
//             { label: "Loud", score: 3, count: 1 },
//             { label: "Clean", score: 1, count: 2 }
//           ]
//         },
//         {
//           title: "Demographic",
//           attributes: [
//             { label: "Young", score: 4, count: 9 },
//             { label: "Busy", score: 1, count: 12 },
//             { label: "Popular", score: 4, count: 6 },
//             { label: "College Students", score: 9, count: 2 },
//             { label: "College Students", score: 9, count: 2 },
//             { label: "Couples", score: 6, count: 2 }
//           ]
//         }
//       ]
//     },
//     {
//       city: "Orange County",
//       attrtagss: [
//         {
//           title: "Location",
//           attributes: [
//             { label: "Busy", score: 6, count: 3 },
//             { label: "Popular", score: 3, count: 9 },
//             { label: "High End", score: 4, count: 12 },
//             { label: "Clean", score: 6, count: 2 },
//             { label: "Clean", score: 6, count: 2 }
//           ]
//         },
//         {
//           title: "Surrounding",
//           attributes: [
//             { label: "Shopping", score: 6, count: 2 },
//             { label: "Hotspot", score: 1, count: 9 },
//             { label: "Nightlife", count: 15 }
//           ]
//         },
//         {
//           title: "Transportation",
//           attributes: [
//             { label: "Bus", score: 4, count: 3 },
//             { label: "Parking Lots", score: 9, count: 9 },
//             { label: "Paid Parking", score: 4, count: 2 },
//             { label: "Paid Parking", score: 4, count: 2 },
//             { label: "Parking lot", count: 15 }
//           ]
//         },
//         {
//           title: "Environment",
//           attributes: [
//             { label: "Inspirational", score: 6, count: 9 },
//             { label: "Busy", score: 1, count: 2 },
//             { label: "Lively", score: 2, count: 3 },
//             { label: "Loud", score: 3, count: 1 },
//             { label: "Clean", score: 1, count: 2 }
//           ]
//         },
//         {
//           title: "Demographic",
//           attributes: [
//             { label: "Young", score: 4, count: 9 },
//             { label: "Busy", score: 1, count: 12 },
//             { label: "Popular", score: 4, count: 6 },
//             { label: "College Students", score: 9, count: 2 },
//             { label: "Couples", score: 6, count: 2 }
//           ]
//         }
//       ]
//     },
//     // {
//     //   city: 'Orange County',
//     //   attrLocation: [
//     //     { label: 'Safe', score: 4,count: 9 },
//     //     { label: 'Busy', score: 6,count: 3 },
//     //     { label: 'Popular', score: 3,count: 9 },
//     //     { label: 'High End', score: 4,count: 12 },
//     //     { label: 'Clean', score: 6, count: 2 },
//     //   ],
//     //   attrSurrounding: [
//     //     { label: 'Shopping', score: 6, count: 2 },
//     //     { label: 'Eatery', score: 2,count: 12 },
//     //     { label: 'Hotspot', score: 1,count: 9 },
//     //     { label: 'Nightlife',count: 15 }
//     //   ],
//     //   attrTransportation: [
//     //     { label: 'Bus', score: 4,count: 3 },
//     //     { label: 'Parking Lots', score: 9,count: 9 },
//     //     { label: 'Paid Parking', score: 4, count: 2 },
//     //     { label: 'Parking lot',count: 15 }
//     //   ],
//     //   attrEnvironment: [
//     //     { label: 'Inspirational', score: 6,count: 9 },
//     //     { label: 'Busy', score: 1, count: 2 },
//     //     { label: 'Lively', score: 2,count: 3 },
//     //     { label: 'Loud', score: 3,count: 1 },
//     //     { label: 'Clean', score: 1, count: 2 },
//     //   ],
//     //   attrDemographic: [
//     //     { label: 'Young', score: 4,count: 9 },
//     //     { label: 'Busy', score: 1,count: 12 },
//     //     { label: 'Popular', score: 4,count: 6 },
//     //     { label: 'College Students', score: 9, count: 2 },
//     //     { label: 'Couples', score: 6, count: 2 },
//     //   ],
//     // },
//     {
//       city: "Placentia",
//       attrtagss: [
//         {
//           title: "Location",
//           attributes: [
//             { label: "Safe", score: 4, count: 9 },
//             { label: "Busy", score: 6, count: 3 },
//             { label: "Popular", score: 3, count: 9 },
//             { label: "High End", score: 4, count: 12 },
//             { label: "Clean", score: 6, count: 2 }
//           ]
//         },
//         {
//           title: "Surrounding",
//           attributes: [
//             { label: "Shopping", score: 6, count: 2 },
//             { label: "Eatery", score: 2, count: 12 },
//             { label: "Hotspot", score: 1, count: 9 },
//             { label: "Nightlife", count: 15 }
//           ]
//         },
//         {
//           title: "Transportation",
//           attributes: [
//             { label: "Bus", score: 4, count: 3 },
//             { label: "Parking Lots", score: 9, count: 9 },
//             { label: "Paid Parking", score: 4, count: 2 },
//             { label: "Parking lot", count: 15 }
//           ]
//         },
//         {
//           title: "Environment",
//           attributes: [
//             { label: "Inspirational", score: 6, count: 9 },
//             { label: "Busy", score: 1, count: 2 },
//             { label: "Lively", score: 2, count: 3 },
//             { label: "Loud", score: 3, count: 1 },
//             { label: "Clean", score: 1, count: 2 }
//           ]
//         },
//         {
//           title: "Demographic",
//           attributes: [
//             { label: "Young", score: 4, count: 9 },
//             { label: "Busy", score: 1, count: 12 },
//             { label: "Popular", score: 4, count: 6 },
//             { label: "College Students", score: 9, count: 2 },
//             { label: "Couples", score: 6, count: 2 }
//           ]
//         }
//       ]
//     }
//   ]
// };

// export const store = {
//   item: [
//     {
//       name: "Smoking Tiger Bread Factory",
//       location: {
//         address: yelp?.location?.address1 || "12345 Main St.",
//         city: yelp?.location?.city || "Cerritos",
//         area: "Lincoln Station",
//         state: yelp?.location?.state || "CA",
//         zip: yelp?.location?.zip_code || "90703",
//         geolocation: {
//           lat: yelp?.coordinates?.latitude,
//           lon: yelp?.coordinates?.longitude
//         },
//         attribute: {
//           city: yelp?.location?.city || "Cerritos",
//           attrtags: [
//             {
//               title: "Location",
//               attributes: [
//                 { label: "Safe", score: 4, count: 9 },
//                 { label: "Busy", score: 6, count: 3 },
//                 { label: "Popular", score: 3, count: 9 },
//                 { label: "High End", score: 4, count: 12 },
//                 { label: "Clean", score: 6, count: 2 }
//               ]
//             },
//             {
//               title: "Surrounding",
//               attributes: location.locations[0]?.attrtags?.[1]?.attributes || []
//             },
//             {
//               title: "Transportation",
//               attributes: location.locations[0]?.attrtags?.[2]?.attributes || []
//             }
//           ]
//         },
//         stats: {
//           contributions: yelp?.review_count || 0,
//           reviews: yelp?.review_count || 0,
//           comments: 0,
//           likes: 0,
//           dislikes: 0
//         },
//         modified: {
//           date: new Date().toLocaleDateString(),
//           time: new Date().getTime()
//         }
//       },
//       details: {
//         rating: "3.33",
//         costEstimate: "3-6",
//         storeType: "Coffee Shop",
//         distance: "1.5mi",
//         distanceMiles: "1.1",
//         status: "Busy until 6pm"
//       },
//       gallery: [
//         {
//           hero: {
//             url: "/gallery",
//             gallery: [
//               "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//             ]
//           },
//           area: {
//             outside: {
//               title: "Outside",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             entrance: {
//               title: "Entrance",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             main: {
//               title: "Main Room",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             corner: {
//               title: "Corner Room",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             outdoor: {
//               title: "Outdoor Patio",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             restroom: {
//               title: "Restroom",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             }
//           },
//           hero: {
//             url: "/gallery",
//             gallery: [
//               "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//             ]
//           }
//         }
//       ],
//       hero: [
//         {
//           hero: heroData ? heroData : null
//         }
//       ],
//       overview: [
//         {
//           header: headerData?.overview ? headerData?.overview : null,

//           // Ensure overviewSummaryData is provided or fallback to null
           

//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.overview || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ],
//       service: [
//         {
//           header: headerData?.service ? headerData?.service : null,

//           // Ensure overviewSummaryData is provided or fallback to null
//           attributes: attributesData ? attributesData : null,
//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.service || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ],
//       experience: [
//         {
//           header: headerData?.experience ? headerData?.experience : null,

//           area: areaData ? areaData : null,
//           attribute: attributesData ? attributesData : null,
//           // experience:
//           // Ensure overviewSummaryData is provided or fallback to null

//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.experience || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//           //   },
//           //     header: "experience",
//           //     summary: {
//           //       card: overviewSummaryData ? overviewSummaryData : null,
//           //       text: textBlockData ? textBlockData : null,
//           //       footer: footerData?.experience || { contributionsCount: 0, modifiedDate: '00/00/00', modifiedTime: 0 },
//           //     },
//           //   },
//         }
//       ],
//       business: [
//         {
//           header: headerData?.business ? headerData?.business : null,
//           timeline: yelp,
//           // area: areaData ? areaData : null,
//           // attribute: attributesData ? attributesData : null,
//           footer: footerData?.business || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ]
//     },
//     {
//       name: "Golden State Coffee",
//       Location: {
//         address: "12345 Main St.",
//         city: "Placentia",
//         area: "Old Town", //town, neighborhood, or district
//         state: "CA",
//         zip: "92369",
//         attribute: location.locations[2].attrtags
//           ? location.locations[2].attrtags
//           : null
//       },
//       details: {
//         rating: "3.33",
//         costEstimate: "3-6",
//         storeType: "Coffee Shop",
//         distance: "1.5mi",
//         distanceMiles: "1.1",
//         status: "Busy until 6pm"
//       },
//       gallery: [
//         {
//           hero: {
//             url: "/gallery",
//             gallery: [
//               "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//             ]
//           },
//           area: {
//             outside: {
//               title: "Outside",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             entrance: {
//               title: "Entrance",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             main: {
//               title: "Main Room",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             corner: {
//               title: "Corner Room",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             outdoor: {
//               title: "Outdoor Patio",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             },
//             restroom: {
//               title: "Restroom",
//               url: "/gallery",
//               gallery: [
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//                 "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//                 `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//               ]
//             }
//           },
//           hero: {
//             url: "/gallery",
//             gallery: [
//               "https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg",
//               "https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg",
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
//               `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09
//             ]
//           }
//         }
//       ],
//       hero: [
//         {
//           hero: heroData ? heroData : null
//         }
//       ],
//       overview: [
//         {
//           header: headerData?.overview ? headerData?.overview : null,

//           // Ensure overviewSummaryData is provided or fallback to null
//           summary: overviewSummaryData ? overviewSummaryData : null,

//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.overview || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ],
//       service: [
//         {
//           header: headerData?.service ? headerData?.service : null,

//           // Ensure overviewSummaryData is provided or fallback to null
//           attributes: attributesData ? attributesData : null,
//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.service || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ],
//       experience: [
//         {
//           header: headerData?.experience ? headerData?.experience : null,

//           area: areaData ? areaData : null,
//           attribute: attributesData ? attributesData : null,
//           // experience:
//           // Ensure overviewSummaryData is provided or fallback to null

//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.experience || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//           //   },
//           //     header: "experience",
//           //     summary: {
//           //       card: overviewSummaryData ? overviewSummaryData : null,
//           //       text: textBlockData ? textBlockData : null,
//           //       footer: footerData?.experience || { contributionsCount: 0, modifiedDate: '00/00/00', modifiedTime: 0 },
//           //     },
//           //   },
//         }
//       ],
//       business: [
//         {
//           header: headerData?.business ? headerData?.business : null,

//           area: areaData ? areaData : null,
//           attribute: attributesData ? attributesData : null,
//           // experience:
//           // Ensure overviewSummaryData is provided or fallback to null

//           // Ensure textBlockData is provided or fallback to null
//           text: textBlockData ? textBlockData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.business || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ],
//       location: [
//         {
//           header: headerData?.location ? headerData?.location : null,

//           area: areaData ? areaData : null,
//           attribute: location.locations[0] ? location.locations[0] : null,
//           // experience:
//           // Ensure overviewSummaryData is provided or fallback to null

//           // Ensure textBlockData is provided or fallback to null
//           // text: locationData ? locationData : null,

//           // Ensure footerData.overview exists, otherwise use default object
//           footer: footerData?.location || {
//             contributionsCount: null,
//             modifiedDate: null,
//             modifiedTime: null,
//             commentsCount: null,
//             reviewsCount: null,
//             likesCount: null,
//             dislikesCount: null
//           }
//         }
//       ]
//     }
//   ]
// };
