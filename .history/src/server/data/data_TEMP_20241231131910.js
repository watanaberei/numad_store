

// src/server/data/data.js
// import { title } from "../../client/components/text/text.js";
import { Yelp } from "./yelp/yelp.js";
// import * as contentfulApi from "./contentful/contentfulApi.js";
// import * as contentful from "./contentful/contentful.js";
// import ContentfulData from "./contentful/contentful.js";
console.log('Loading data.js, yelp:', Yelp);
import { io } from "socket.io-client";


// let store = "";
// let contentfulData = new ContentfulData();
// console.log('contentfulData:', contentfulData);
// const socket = io('http://localhost:4000');


// export const contentful = {
//   render: async () => {
//     const request = parseRequestUrl();
//     const storeData = await dataBlog.getData();
//     console.log("data.js storeData", storeData);

//     const validStores = storeData.filter((store) => store.slug);
//     console.log("data.js Valid stores:", validStores);
    
//     store = validStores.find((store) => store.slug === request.slug);
//     console.log("data.js slug", store.slug);
//     console.log("data.js store", store);

//   }
// }

// Add a mapping for business hours data from Yelp
export function transformYelpHours(Yelp) {
  console.log('Processing Yelp hours data:', Yelp?.hours?.[0]?.open);

  if (!Yelp?.hours?.[0]?.open) {
    console.warn('No hours data available in Yelp response');
    return null;
  }

  const hoursData = Yelp.hours[0].open;
  const isCurrentlyOpen = Yelp.hours[0].is_open_now;
  
  // Get current time in military format for comparison
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}${currentMinute}`;
  const currentDay = now.getDay();

  console.log('Current time:', currentTime, 'Current day:', currentDay);

  return {
    storeName: Yelp.name,
    isOpen: isCurrentlyOpen,
    currentTime: currentTime,
    schedule: hoursData.map(slot => ({
      day: slot.day,
      start: slot.start,
      end: slot.end,
      isCurrent: slot.day === currentDay,
      isWithinHours: slot.day === currentDay && 
                     currentTime >= slot.start && 
                     currentTime <= slot.end
    }))
  };
}

export async function initializeData() {
  try {
    console.log('Initializing application data');
    
    const businessId = '0fGRTbEhBNDUP7AfUFqvPQ'; // Smoking Tiger ID
    const Yelp = await Yelp.getStoreData(businessId);
    console.log('Yelp data received:', Yelp);

    const searchParams = {
      term: 'Smoking Tiger Bread Factory',
      location: 'Cerritos, CA',
      limit: 1
    };

    // First search for the business
    const searchResults = await Yelp.searchBusinesses(searchParams);
    console.log('Search results:', searchResults);
    
    //BUSINESS NAME AND LOCATION MUST be DYNAMIC
    const businessName = 'Smoking Tiger Bread Factory';
    const location = 'cerritos, ca';

    console.log('Initializing data for:', businessName);
    
    // const Yelp = await Yelp.getStoreData('0fGRTbEhBNDUP7AfUFqvPQ'); // Using direct business ID
    // console.log('Raw Yelp data:', Yelp);
    if (Yelp?.hours) {
      const hoursData = Yelp.transformYelpHours(Yelp);
      console.log('Transformed hours data:', hoursData);

      // Update store hours
      store.item[0] = {
        ...store.item[0],
        name: Yelp.name,
        hours: Yelp.hours
      };
    }
    if (searchResults?.businesses?.[0]?.id) {
      // Then get business details using the ID
      const businessId = searchResults.businesses[0].id;
      const storeData = await Yelp.getBusinessDetails(businessId);
      console.log('!!!Store details:', storeData);

      if (storeData?.hours) {
        store.item[0] = {
          ...store.item[0],
          hours: storeData.hours,
          name: storeData.name
        };
      }
    }
    return {
      storeData: store.item[0],
      searchResults: []
    };
  } catch (error) {
    console.error('Data initialization error:', error);
    return {
      storeData: store.item[0],
      searchResults: []
    };
  }
}
//     }
//     if (Yelp) {
//       // Transform the hours data
//       const hoursData = transformYelpHours(Yelp);
//       console.log('____Transformed hours data:', hoursData);

//       // Update the store data
//       store.item[0].business.hours[0] = hoursData;
//     }
//     return {
//       storeData: store.item[0],
//       searchResults: []
//     };
//   } catch (error) {
//     console.error('Error:', error);
//     return { storeData: store.item[0], searchResults: [] };
//   }
//     // return {
//     //   storeData: store.item[0], // Now includes formatted hours
//     //   // storeData: storeData || store.item[0], // Fallback to mock data if needed
//     //   searchResults: searchResults?.businesses || []
//     // };
//   // } catch (error) {
//     // console.error('Error initializing data:', error);
//     // return {
//     //   storeData: store.item[0], // Falls back to default hours
//     //   searchResults: []
//     // };
// }


const test = async () => {
  const data = await Yelp.getStoreData('Smoking Tiger Bread Factory', 'cerritos, ca');
  console.log('Test result:', data);
};

test().catch(console.error);


// const businessData = await Yelp.getStoreData(storeYelp.name);
// const searchResults = await Yelp.searchBusinesses({
//   term: 'coffee',
//   location: 'Cerritos, CA'
// });

// console.log('Business data:', businessData, 'search results: ', searchResults);







const img01 = 'U-GfASZ4XZogkRBDW9-V8g/o.jpg';
const img02 = 's5XFXRnTc59CWYNE3oaX_Q/o.jpg';
const img03 = '6RpQGw8xKEUpTu4u1VKBaQ/o.jpg';
const img04 = 'A3Zg_SVzUOGmNldZP6ejqA/o.jpg';
const img05 = 'YAt__uoyAbrxIzsNQf_fgA/o.jpg';
const img06 = 'OKPVWA90EuEFqUJz48jT-w/o.jpg';
const img07 = 'dKB-Ii9OfutdyneoTmKcVA/o.jpg';
const img08 = 'coUrKqZBdU0NjEwa1jtLtw/o.jpg';
const img09 = '6I0fcLpnc0fh9p4LNxTs-w/o.jpg';










// import * as f from '../../client/assets/media/images/store/smokingTigerBreadFactory/cerritos/gallery/image01.png';
export async function getFooterData() {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    return response.json();
  }

  export const headerData = {
    overview: 'Overview',
    experience: 'Experience',
    service: 'Service',
    business: 'Business',
  };
  
  export const textBlockData = {
    title: "Summary",
    content: "The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.fdsfsdfd",
  };
  
  
  export const footerData = {
    overview: {
      contributionsCount: 333,
      modifiedDate: '06/06/24',
      modifiedTime: 3,
      commentsCount: 333,
      reviewsCount: 333,
      likesCount: 333,
      dislikesCount: 333
    },
    experience: {
      contributionsCount: 333,
      modifiedDate: '06/06/24',
      modifiedTime: 3,
      commentsCount: 333,
      reviewsCount: 333,
      likesCount: 333,
      dislikesCount: 333
    },
    service: {
      contributionsCount: 333,
      modifiedDate: '06/06/24',
      modifiedTime: 3,
      commentsCount: 333,
      reviewsCount: 333,
      likesCount: 333,
      dislikesCount: 333
    },
    business: {
      contributionsCount: 333,
      modifiedDate: '06/06/24',
      modifiedTime: 3,
      commentsCount: 333,
      reviewsCount: 333,
      likesCount: 333,
      dislikesCount: 333
    },
    location: {
      contributionsCount: 333,
      modifiedDate: '06/06/24',
      modifiedTime: 3,
      commentsCount: 333,
      reviewsCount: 333,
      likesCount: 333,
      dislikesCount: 333
    },
  };
  
export const subStoreData = {
    distance: '0.3',
    
    imageUrl: 'https://eu-images.contentstack.com/v3/assets/blt58a1f8f560a1ab0e/bltbd88badeb5de1e1f/669ef3ecfd135f78652397fc/sprouts-logo_1598024112.png?width=1280&auto=webp&quality=95&format=jpg&disable=upscale',  // placeholder image
    storeName: 'Sprouts'
  };

export const heroData = {
  rating: '3.33',
  costEstimate: '3-6',
  storeType: 'Coffee Shop',
  distance: '1.5mi',
  city: 'Cerritos',
  state: 'CA',
  storeName: 'Smoking Tiger Bread Factory',
  distanceMiles: '1.1',
  status: 'Busy until 6pm',
  galleryImages: [
    'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
    'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
    'https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png',
    'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
    'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdoaimP%2Fbtr42yq2g3Z%2FIKjzyJcFiRfOFH6dahNFl0%2Fimg.jpg'
  ]
};
  


export const amenitiesItemData = {
  contributionsCount: 333,
  modifiedDate: '06/06/24',
  modifiedTime: 3,
  commentsCount: 333,
  reviewsCount: 333,
  likesCount: 333,
  dislikesCount: 333
};

// export const serviceCategoryData = {
//   label: 'Coffee',
//   rank: 1,
//   itemName: 'Strawberry Matcha Latte',
//   imageUrl: 'placeholder',
//   itemCount: 333
// };

// serviceCategoryData[0].links.image
// serviceCategoryData[0].items[0].source.links.source
// serviceCategoryData[0].items[0].source.thumbnail.post.poster.links.profile
export const serviceCategoryData = {
  matcha: {
    rank : 1,
    category: 'Matcha',// this is cardCategoryItem's amtagCategory's data.category's data.category
    links:{
      //update link to trigger gallery modal + anchor link to the category
      image:'/gallery/${category}', //this is the href of the amtagCategory
    },
    items: {
      first: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '1',// this is amtagItem's data.rank
        name: 'Matcha Pistaccio Crossiant',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/Jh0zD8Wj5F4Ex2rnxY8zlg/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      second: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '2',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/tECvZwf-IowgzeCv8lzAmQ/o.jpg',
          },
          post: {
            description: 'Bannana Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      third: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '3',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
    },
  },


  coffee: {
    rank : 2,
    category: 'Coffee',// this is cardCategoryItem's amtagCategory's data.category's data.category
    links:{
      //update link to trigger gallery modal + anchor link to the category
      image:'/gallery/${category}', //this is the href of the amtagCategory
    },
    items: {
      first: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '1',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/nD2wrwvKI_DMG0NvqYszzA/348s.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      second: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '2',// this is amtagItem's data.rank
        name: 'Iced Vanilla Latte',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      third: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '3',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
    },
  },

  pastries: {
    rank : 3,
    category: 'Pastries',// this is cardCategoryItem's amtagCategory's data.category's data.category
    links:{
      //update link to trigger gallery modal + anchor link to the category
      image:'/gallery/${category}', //this is the href of the amtagCategory
    },
    items: {
      first: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '1',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      second: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '2',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      third: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '3',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
    },
  },

  teas: {
    rank : 4,
    category: 'Teas',// this is cardCategoryItem's amtagCategory's data.category's data.category
    links:{
      //update link to trigger gallery modal + anchor link to the category
      image:'/gallery/${category}', //this is the href of the amtagCategory
    },
    items: {
      first: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '1',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      second: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '2',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      third: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '3',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
    },
  },

  beverages: {
    rank : 5,
    category: 'Beverages',// this is cardCategoryItem's amtagCategory's data.category's data.category
    links:{
      //update link to trigger gallery modal + anchor link to the category
      image:'/gallery/${category}', //this is the href of the amtagCategory
    },
    items: {
      first: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '1',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      second: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '2',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      third: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '3',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
    },
  },
  
  lunch: {
    rank : 6,
    category: 'Lunch',// this is cardCategoryItem's amtagCategory's data.category's data.category
    links:{
      //update link to trigger gallery modal + anchor link to the category
      image:'/gallery/${category}', //this is the href of the amtagCategory
    },
    items: {
      first: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '1',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      second: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '2',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
      third: {
        //update with id generator in a new id file id.js as generateId() 
        id:  '1',
        rank: '3',// this is amtagItem's data.rank
        name: 'Strawberry Matcha',// this is amtagItem's data.name
        links:{
          //update link to trigger gallery modal + anchor link to the category
          image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
        },
        source: {
          name: 'Yelp',
          logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
          links:{
            //update link to trigger gallery modal + anchor link to the category
            source:'https://www.Yelp.com', // this amtagItem's href url
          },
        },
        thumbnail: {
          media: {
            thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
          },
          post: {
            description: 'Tasty Strawberry Matcha Latte',
            poster: {
              username: 'evabear', 
              link: {
                profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
              }
            }
          },
        },
      },
    },
  },
  // This is just the data from cardPopularData
  // I just took the gallery images from each and made them into
  // its own item and ranked from top being 1, bottom being 2
  // 'https://s3-media0.fl.yelpcdn.com/bphoto/A3Zg_SVzUOGmNldZP6ejqA/o.jpg',
  // 'https://s3-media0.fl.yelpcdn.com/bphoto/YAt__uoyAbrxIzsNQf_fgA/o.jpg',
  // 'https://s3-media0.fl.yelpcdn.com/bphoto/6RpQGw8xKEUpTu4u1VKBaQ/o.jpg',
  // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
  // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
  // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
  // `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
  // title: 'Yelp',
  //     description: 'Pineapple Express',
  //     logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
  //     url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
  //     credit: 'Yelp',
  //     creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',


  // please use the rank 1 as reference and any data you can get from the internet 
  // about smoking tiger bread factory coffee shop in cerritos
  // also, when getting references, update all data and source, details, user, etc

  // here are the categories after rank: 1
  // rank 2: pastries
  // rank 3: coffee
  // rank 4: lunch
  // rank 5: tea
};


export const cardPopularyData = {
  first: {
    rank: '1',
    name: 'Strawberry Matcha Latte',
    type: "Matcha",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/U-GfASZ4XZogkRBDW9-V8g/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg',
        'https://mo.tomasglobal.com/wp-content/uploads/2022/12/Smoking-Tiger-Cerritos-1.png',
        'https://s3-media0.fl.yelpcdn.com/bphoto/s5XFXRnTc59CWYNE3oaX_Q/o.jpg'
      ],
    },
    source: {
      title: 'Yelp',
      description: 'Strawberry Matcha Latte',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
      url: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
    }
  },
  second: {
    rank: '2',
    name: 'Pineapple Express',
    type: "Specialty Drink",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/A3Zg_SVzUOGmNldZP6ejqA/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/A3Zg_SVzUOGmNldZP6ejqA/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/YAt__uoyAbrxIzsNQf_fgA/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/6RpQGw8xKEUpTu4u1VKBaQ/o.jpg',
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
      ],
    },
    source: {
      title: 'Yelp',
      description: 'Pineapple Express',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
  },
  third: {
    rank: '3',
    name: 'Jeju Matcha Latte',
    type: "Matcha",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/OKPVWA90EuEFqUJz48jT-w/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/OKPVWA90EuEFqUJz48jT-w/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/dKB-Ii9OfutdyneoTmKcVA/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/coUrKqZBdU0NjEwa1jtLtw/o.jpg',
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
      ],
    },
    description: 'JEJU MATCHA LATTE WITH ALMOND MILK (ICED) - Picture ain\'t great, but oh well. Still delicious!',
    source: {
      title: 'Yelp',
      description: 'Jeju Matcha Latte',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
  },
  fourth: {
    rank: '4',
    name: 'Hojicha Latte',
    type: "Latte",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/6I0fcLpnc0fh9p4LNxTs-w/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/6I0fcLpnc0fh9p4LNxTs-w/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/zQaZcJ2rgevwCkQTQmpcLw/o.jpg',
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img03,
      ],
    },
    description: 'Smoking Spaniard & Hojicha Latte. JEJU MATCHA LATTE WITH ALMOND MILK (ICED) - Picture ain\'t great, but oh well. Still delicious!',
    source: {
      title: 'Yelp',
      description: 'Hojicha Latte',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
  },
  fifth: {
    rank: '5',
    name: 'Choco Mugwort Latte',
    type: "Latte",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
        'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
      ],
    },
    description: 'Mugwort Latte and Black Coffee. Tiger Latte (ice only) and Mugwort Latte. Earthy and delish on right, Jeju Tangerine on left.',
    source: {
      title: 'Yelp',
      description: 'Choco Mugwort Latte',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
  },
  ssixth: {
    rank: '6',
    name: 'Kho Latte',
    type: "Latte",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/sWaHfm74D4YBOfq8oZQjwg/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/sWaHfm74D4YBOfq8oZQjwg/o.jpg',
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img02, // Placeholder for generated images
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img03,
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
      ],
    },
    description: 'Cold Brew and Hot Kho Latte.',
    source: {
      title: 'Yelp',
      description: 'Kho Latte',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
  }, 
  seventh: {
    rank: '7',
    name: 'Baby Latte',
    type: "Latte",
    thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/ElbNRb-HF6vWH4DERhli_Q/o.jpg',
    url: {
      gallery: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
    media: {
      url: '/gallery',
      gallery: [
        'https://s3-media0.fl.yelpcdn.com/bphoto/ElbNRb-HF6vWH4DERhli_Q/o.jpg',
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img02, // Placeholder for generated images
        `https://s3-media0.fl.yelpcdn.com/bphoto/` + img03,
      ],
    },
    description: 'Baby Latte.',
    source: {
      title: 'Yelp',
      description: 'Baby Latte',
      logo: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      url: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
      credit: 'Yelp',
      creditUrl: 'https://www.Yelp.com/biz/smoking-tiger-bread-factory-cerritos',
    },
  }
};



export const overviewSummaryData = {
  experienceScore: '93',
  experience: [
    { label: 'Large Space', score: 9, user: 333 },
    { label: 'Crowded', score: 2, user: 333 },
    { label: 'Youthful', score: 2, user: 333 },
    { label: 'Students', score: 2, user: 333 },
    { label: 'Friends', score: 2, user: 333 },
    { label: 'Multicultural', score: 2, user: 333 },
    { label: 'Bright', score: 2, user: 333 },
    { label: 'Friendly', score: 2, user: 333 },
    { label: 'Casual', score: 2, user: 333 }
  ],
  serviceScore: '93',
  service: [
    { label: 'Tea & Matcha', score: 2, user: 333 },
    { label: 'Pastries', score: 2, user: 333 },
    { label: 'Coffee', score: 2, user: 333 },
    { label: 'Quality', score: 2, user: 333 },
    { label: 'Original', score: 2, user: 333 },
    { label: 'Seasonal', score: 2, user: 333 },
    { label: 'Korean', score: 2, user: 333 },
    { label: 'Craft', score: 2, user: 333 },
    { label: 'Artisian', score: 2, user: 333 }
  ],
  businessScore: '93',
  business: [
    { label: 'Large Space', score: 2, user: 333 },
    { label: 'Crowded', score: 2, user: 333 },
    { label: 'Youthful', score: 2, user: 333 },
    { label: 'Students', score: 2, user: 333 },
    { label: 'Friends', score: 2, user: 333 },
    { label: 'Multicultural', score: 2, user: 333 },
    { label: 'Bright', score: 2, user: 333 },
    { label: 'Friendly', score: 2, user: 333 },
    { label: 'Casual', score: 2, user: 333 }
  ],
  locationScore: '93',
  location: [
    { label: 'Busy', score: 2, user: 333 },
    { label: 'Hidden', score: 2, user: 333 },
    { label: 'Safe', score: 2, user: 333 },
    { label: 'Clustered', score: 2, user: 333 },
    { label: 'Popular', score: 2, user: 333 },
    { label: 'Parking', score: 2, user: 333 },
    { label: 'Clean', score: 2, user: 333 },
    { label: 'Spaced Out', score: 2, user: 333 },
    { label: 'Residential', score: 2, user: 333 }
  ], 
};



export const attributesData = {
  bestfor: [
    { label: 'Remote Work', score: 2, count: 2 },
    { label: 'Socializing', score: 2, count: 2 },
    { label: 'Zoom Calls', score: 2, count: 2 },
    { label: 'Studying', score: 2, count: 2 },
    { label: 'Group Study', score: 2, count: 2 },
    { label: 'Reading', score: 2, count: 2 },
    { label: 'Label', score: 2, count: 2 },
    { label: 'Label', score: 2, count: 2 },
    { label: 'Label', count: 2 }
  ],
  working: [
    { label: 'Tables', score: 2, count: 2 },
    { label: 'Outlets', score: 2, count: 2 },
    { label: 'Password', score: 2, count: 2 },
    { label: 'Protected Wifi', score: 2, count: 2 },
    { label: 'Wifi', score: 2, count: 2 },
    { label: 'Single Tables', score: 2, count: 2 },
    { label: 'Opens Late', score: 2, count: 2 },
    { label: 'Coffee & Pastries', score: 2, count: 2 },
    { label: 'Label', count: 2 }
  ],
  environment: [
    { label: 'Hipster', score: 2,count: 9 },
    { label: 'Modern', score: 2, count: 2 },
    { label: 'Board Games', score: 2, count: 2 },
    { label: 'Alternative', score: 2, count: 2 },
    { label: 'Youthful', score: 2,count: 9 },
    { label: 'Korean', score: 2, count: 2 },
    { label: 'Friendly', score: 2, count: 2 },
    { label: 'Label', score: 2, count: 2 },
    { label: 'Label', count: 2 }
  ],
  facility: [
    { label: 'Cool', score: 2,count: 9 },
    { label: 'Clean', score: 2, count: 2 },
    { label: 'Outdoor Seating', score: 2, count: 2 },
    { label: 'Spacious', score: 9, count: 2 },
    { label: 'New', score: 2, count: 2 },
    { label: 'Plaza', score: 2,count: 9 },
    { label: 'Coffee & Pastries', score: 3, count: 2 },
    { label: 'Label', score: 1, count: 2 },
    { label: 'Label',count: 1 }
  ],
};



export const storeLocationData = {

}



  // Render components
  // document.addEventListener('DOMContentLoaded', () => {
  //   const footerContainer = document.getElementById('footer-container');
  //   if (footerContainer) {
  //     footerContainer.innerHTML = footerItem.render(footerData);
  //   }
  
  //   const subStoreContainer = document.getElementById('sub-store-container');
  //   if (subStoreContainer) {
  //     subStoreContainer.innerHTML = cardSubStore.render(subStoreData);
  //   }
  // });








  


  export const mapRadiusData = {
    address: '11900 South St Ste 134 Cerritos, CA 90703',
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









export const titleData = {
  title: "Spaces"
};


 
export const areaData = {
  item: [
    {
      area: 'Outside',
      links:{
        //update link to trigger gallery modal + anchor link to the category
        gallery:'/gallery/${category}', //this is the href of the amtagCategory
      },
      images: [
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '1',
          impressions: {
            users: 333,
            likes: 36,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/5s3-S9Itb9iA9H6wmVGSgA/o.jpg',
            },
            post: {
              description: 'Smoking Tiger Bread Factory',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '2',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '3',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
      ],
    },
    {
      area: 'Entrance',
      links:{
        //update link to trigger gallery modal + anchor link to the category
        gallery:'/gallery/${category}', //this is the href of the amtagCategory
      },
      images: [
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '1',
          impressions: {
            users: 333,
            likes: 30,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '2',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '3',
          impressions: {
            users: 333,
            likes: 36,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/kpabkywqhqFXcSJNnXSz5w/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
      ],
    },
    {
      area: 'Main Room',
      links:{
        //update link to trigger gallery modal + anchor link to the category
        gallery:'/gallery/${category}', //this is the href of the amtagCategory
      },
      images: [
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '1',
          impressions: {
            users: 334,
            likes: 36,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/ZUiuW64ttEYuO8Gy7J8-uw/o.jpg',
            },
            post: {
              description: 'Alot of seating lined up throughout the windows and walls',
              poster: {
                username: 'evabeareview', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '2',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '3',
          impressions: {
            users: 333,
            likes: 36,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'This should be number two but same comment as number one!',
              poster: {
                username: 'evabeareview02', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
      ],
    },
    {
      area: 'Corner Room',
      links:{
        //update link to trigger gallery modal + anchor link to the category
        gallery:'/gallery/${category}', //this is the href of the amtagCategory
      },
      images: [
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '1',
          impressions: {
            users: 333,
            likes: 30,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '2',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '3',
          impressions: {
            users: 333,
            likes: 36,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/K27xLUuY_zAjcrfXLiNZKA/o.jpg',
            },
            post: {
              description: 'Good work gets done in this corner',
              poster: {
                username: 'evabearsfavoritespot', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
      ],
    },
    {
      area: 'Outside Patio',
      links:{
        //update link to trigger gallery modal + anchor link to the category
        gallery:'/gallery/${category}', //this is the href of the amtagCategory
      },
      images: [
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '1',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/6MJAiRhCy5A7Y7qmp9WERw/o.jpg',
            },
            post: {
              description: 'Nice quiet outdoor patio, perfect for meetings',
              poster: {
                username: 'outdoor-evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '2',
          impressions: {
            users: 333,
            likes: 30,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '3',
          impressions: {
            users: 333,
            likes: 27,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
      ],
    },
    {
      area: 'Bathroom',
      links:{
        //update link to trigger gallery modal + anchor link to the category
        gallery:'/gallery/${category}', //this is the href of the amtagCategory
      },
      images: [
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '1',
          impressions: {
            users: 333,
            likes: 31,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '2',
          impressions: {
            users: 333,
            likes: 33,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/62i3iAQ6ygYF_BZ_YMGbqw/o.jpg',
            },
            post: {
              description: 'Popular bathroom selfie spot',
              poster: {
                username: 'evabear_bathroom', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
        {
          //update with id generator in a new id file id.js as generateId() 
          id:  '3',
          impressions: {
            users: 333,
            likes: 30,
            dislikes: 3,
          },
          links:{
            //update link to trigger gallery modal + anchor link to the category
            image:'/gallery/${category}/${category.item.id}', // this amtagItem's href url
          },
          source: {
            name: 'Yelp',
            logo: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
            links:{
              //update link to trigger gallery modal + anchor link to the category
              source:'https://www.Yelp.com', // this amtagItem's href url
            },
          },
          thumbnail: {
            media: {
              thumbnail: 'https://s3-media0.fl.yelpcdn.com/bphoto/M7a8P6wZoK0rGCeWJ6NwzQ/o.jpg',
            },
            post: {
              description: 'Tasty Strawberry Matcha Latte',
              poster: {
                username: 'evabear', 
                link: {
                  profile: 'https://www.Yelp.com/biz/smoking-tiger-cerritos-cerritos-2',
                }
              }
            },
          },
        },
      ],
    },
  ],
};








export const cardGalleryData = {
  category: "Coffee",
  partnerLogo: "https://www.svgrepo.com/show/30758/yelp-logo.svg",
  // partnerLogo: "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-1/359227055_1129311967983066_3332065457673756995_n.png?stp=dst-png_s480x480&_nc_cat=105&ccb=1-7&_nc_sid=f4b9fd&_nc_ohc=cO7uZVTpkMkQ7kNvgGEHbMA&_nc_ht=scontent-lax3-1.xx&_nc_gid=AZBqoqUf4cZOZTI5D-nEmrh&oh=00_AYA3E_ITT2e71I-BXpR9Ldr10PLYvvfkR5ZZIISff12yNA&oe=670FB6E4",
  comment: "Front entrance of Smoking Tiger Bread Factory",
  // userPicture: "path/to/user-picture.png"
};





export const location = {
  locations:  [
    {
      city: 'Cerritos',
      // city: store?.item?.[0]?.location?.city,
      attrtags: [
        {
          title: 'Location',
          attributes: [
            { label: 'Safe', score: 4,count: 9 },
            { label: 'Busy', score: 6,count: 3 },
            { label: 'Popular', score: 3,count: 9 },
            { label: 'High End', score: 4,count: 12 },
            { label: 'Clean', score: 6, count: 2 },
          ],
        },
        {
          title: 'Surrounding',
          attributes: [
            { label: 'Shopping', score: 6, count: 2 },
            { label: 'Eatery', score: 2,count: 12 },
            { label: 'Hotspot', score: 1,count: 9 },
            { label: 'Nightlife',count: 15 }
          ],
        },
        {
          title: 'Transportation',
          attributes: [
            { label: 'Bus', score: 4,count: 3 },
            { label: 'Parking Lots', score: 9,count: 9 },
            { label: 'Paid Parking', score: 4, count: 2 },
            { label: 'Parking lot',count: 15 }
          ],
        },
        {
          title: 'Environment',
          attributes: [
            { label: 'Inspirational', score: 6,count: 9 },
            { label: 'Busy', score: 1, count: 2 },
            { label: 'Lively', score: 2,count: 3 },
            { label: 'Loud', score: 3,count: 1 },
            { label: 'Clean', score: 1, count: 2 },
          ],
        },
        {
          title: 'Demographic',
          attributes: [
            { label: 'Young', score: 4,count: 9 },
            { label: 'Busy', score: 1,count: 12 },
            { label: 'Popular', score: 4,count: 6 },
            { label: 'College Students', score: 9, count: 2 },
            { label: 'College Students', score: 9, count: 2 },
            { label: 'Couples', score: 6, count: 2 },
          ],
        }
      ]
    },
    {
      city: 'Orange County',
      attrtagss: [
        {
          title: 'Location',
          attributes: [ 
            { label: 'Busy', score: 6,count: 3 },
            { label: 'Popular', score: 3,count: 9 },
            { label: 'High End', score: 4,count: 12 },
            { label: 'Clean', score: 6, count: 2 },
            { label: 'Clean', score: 6, count: 2 },
          ],
        },
        {
          title: 'Surrounding',
          attributes: [
            { label: 'Shopping', score: 6, count: 2 }, 
            { label: 'Hotspot', score: 1,count: 9 },
            { label: 'Nightlife',count: 15 }
          ],
        },
        {
          title: 'Transportation',
          attributes: [
            { label: 'Bus', score: 4,count: 3 },
            { label: 'Parking Lots', score: 9,count: 9 },
            { label: 'Paid Parking', score: 4, count: 2 },
            { label: 'Paid Parking', score: 4, count: 2 },
            { label: 'Parking lot',count: 15 }
          ],
        },
        {
          title: 'Environment',
          attributes: [
            { label: 'Inspirational', score: 6,count: 9 },
            { label: 'Busy', score: 1, count: 2 },
            { label: 'Lively', score: 2,count: 3 },
            { label: 'Loud', score: 3,count: 1 },
            { label: 'Clean', score: 1, count: 2 },
          ],
        },
        {
          title: 'Demographic',
          attributes: [
            { label: 'Young', score: 4,count: 9 },
            { label: 'Busy', score: 1,count: 12 },
            { label: 'Popular', score: 4,count: 6 },
            { label: 'College Students', score: 9, count: 2 },
            { label: 'Couples', score: 6, count: 2 },
          ],
        }
      ]
    },
    // {
    //   city: 'Orange County',
    //   attrLocation: [
    //     { label: 'Safe', score: 4,count: 9 },
    //     { label: 'Busy', score: 6,count: 3 },
    //     { label: 'Popular', score: 3,count: 9 },
    //     { label: 'High End', score: 4,count: 12 },
    //     { label: 'Clean', score: 6, count: 2 },
    //   ],
    //   attrSurrounding: [
    //     { label: 'Shopping', score: 6, count: 2 },
    //     { label: 'Eatery', score: 2,count: 12 },
    //     { label: 'Hotspot', score: 1,count: 9 },
    //     { label: 'Nightlife',count: 15 }
    //   ],
    //   attrTransportation: [
    //     { label: 'Bus', score: 4,count: 3 },
    //     { label: 'Parking Lots', score: 9,count: 9 },
    //     { label: 'Paid Parking', score: 4, count: 2 },
    //     { label: 'Parking lot',count: 15 }
    //   ],
    //   attrEnvironment: [
    //     { label: 'Inspirational', score: 6,count: 9 },
    //     { label: 'Busy', score: 1, count: 2 },
    //     { label: 'Lively', score: 2,count: 3 },
    //     { label: 'Loud', score: 3,count: 1 },
    //     { label: 'Clean', score: 1, count: 2 },
    //   ],
    //   attrDemographic: [
    //     { label: 'Young', score: 4,count: 9 },
    //     { label: 'Busy', score: 1,count: 12 },
    //     { label: 'Popular', score: 4,count: 6 },
    //     { label: 'College Students', score: 9, count: 2 },
    //     { label: 'Couples', score: 6, count: 2 },
    //   ],
    // },
    {
      city: 'Placentia',
      attrtagss: [
        {
          title: 'Location',
          attributes: [
            { label: 'Safe', score: 4,count: 9 },
            { label: 'Busy', score: 6,count: 3 },
            { label: 'Popular', score: 3,count: 9 },
            { label: 'High End', score: 4,count: 12 },
            { label: 'Clean', score: 6, count: 2 },
          ],
        },
        {
          title: 'Surrounding',
          attributes: [
            { label: 'Shopping', score: 6, count: 2 },
            { label: 'Eatery', score: 2,count: 12 },
            { label: 'Hotspot', score: 1,count: 9 },
            { label: 'Nightlife',count: 15 }
          ],
        },
        {
          title: 'Transportation',
          attributes: [
            { label: 'Bus', score: 4,count: 3 },
            { label: 'Parking Lots', score: 9,count: 9 },
            { label: 'Paid Parking', score: 4, count: 2 },
            { label: 'Parking lot',count: 15 }
          ],
        },
        {
          title: 'Environment',
          attributes: [
            { label: 'Inspirational', score: 6,count: 9 },
            { label: 'Busy', score: 1, count: 2 },
            { label: 'Lively', score: 2,count: 3 },
            { label: 'Loud', score: 3,count: 1 },
            { label: 'Clean', score: 1, count: 2 },
          ],
        },
        {
          title: 'Demographic',
          attributes: [
            { label: 'Young', score: 4,count: 9 },
            { label: 'Busy', score: 1,count: 12 },
            { label: 'Popular', score: 4,count: 6 },
            { label: 'College Students', score: 9, count: 2 },
            { label: 'Couples', score: 6, count: 2 },
          ],
        }
      ]
    },
  ],
};



export const store = {
    
      name: 'Smoking Tiger Bread Factory', 
      location: {
        address: Yelp?.location?.address1 || '12345 Main St.',
        city: Yelp?.location?.city || 'Cerritos',
        area: 'Lincoln Station',
        state: Yelp?.location?.state || 'CA',
        zip: Yelp?.location?.zip_code || '90703',
        geolocation: {
          lat: Yelp?.coordinates?.latitude,
          lon: Yelp?.coordinates?.longitude
        },
        attribute: {
          city: Yelp?.location?.city || 'Cerritos',
          attrtags: [
            {
              title: 'Location',
              attributes: [
                { label: 'Safe', score: 4, count: 9 },
                { label: 'Busy', score: 6, count: 3 },
                { label: 'Popular', score: 3, count: 9 },
                { label: 'High End', score: 4, count: 12 },
                { label: 'Clean', score: 6, count: 2 }
              ]
            },
            {
              title: 'Surrounding',
              attributes: location.locations[0]?.attrtags?.[1]?.attributes || []
            },
            {
              title: 'Transportation',
              attributes: location.locations[0]?.attrtags?.[2]?.attributes || []
            }
          ]
        },
        stats: {
          contributions: Yelp?.review_count || 0,
          reviews: Yelp?.review_count || 0,
          comments: 0,
          likes: 0,
          dislikes: 0
        },
        modified: {
          date: new Date().toLocaleDateString(),
          time: new Date().getTime()
        }
      },
      details: { 
        rating: '3.33',
        costEstimate: '3-6',
        storeType: 'Coffee Shop',
        distance: '1.5mi',
        distanceMiles: '1.1',
        status: 'Busy until 6pm',
      },
      gallery:[
          { hero: {
                url: '/gallery',
                gallery: [
                  'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                ],
              },
              area: {
                outside: {
                  title: 'Outside',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                entrance: {
                  title: 'Entrance',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                main: {
                  title: 'Main Room',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                corner: {
                  title: 'Corner Room',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                outdoor: {
                  title: 'Outdoor Patio',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                restroom: {
                  title: 'Restroom',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
              },
              hero: {
                url: '/gallery',
                gallery: [
                  'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                ],
              },
            },

      ],
      hero: [
        {
          hero: heroData ? heroData : null,
        },
      ],
      overview: [
        {
          header: headerData?.overview ? headerData?.overview : null,

          // Ensure overviewSummaryData is provided or fallback to null
          summary: overviewSummaryData ? overviewSummaryData : null,
          
          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,
          
          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.overview || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ],
      service: [
        {
          header: headerData?.service ? headerData?.service : null,

          
          // Ensure overviewSummaryData is provided or fallback to null
          attributes: attributesData ? attributesData : null,
          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.service || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ],
      experience: [
        {
          headerData: headerData?.experience ? headerData?.experience : null,

          areaData: areaData ? areaData : null,
          attributeData: attributesData ? attributesData : null,
          // experience:
          // Ensure overviewSummaryData is provided or fallback to null

          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footerData: footerData?.experience || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
      //   },
      //     header: "experience",
      //     summary: {
      //       card: overviewSummaryData ? overviewSummaryData : null,
      //       text: textBlockData ? textBlockData : null,
      //       footer: footerData?.experience || { contributionsCount: 0, modifiedDate: '00/00/00', modifiedTime: 0 },
      //     },
      //   },
        },
      ],
      business: [
        {
          header: headerData?.business ? headerData?.business : null,

          area: areaData ? areaData : null,
          attribute: attributesData ? attributesData : null,
          // experience:
          // Ensure overviewSummaryData is provided or fallback to null

          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.business || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ],
      name: 'Golden State Coffee', 
      Location: {
        address: '12345 Main St.',
        city: 'Placentia',
        area: 'Old Town', //town, neighborhood, or district
        state: 'CA',
        zip: '92369',
        attribute: location.locations[2].attrtags ? location.locations[2].attrtags : null,
      },
      details: { 
        rating: '3.33',
        costEstimate: '3-6',
        storeType: 'Coffee Shop',
        distance: '1.5mi',
        distanceMiles: '1.1',
        status: 'Busy until 6pm',
      },
      gallery:[
          { heroData: {
                url: '/gallery',
                gallery: [
                  'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                ],
              },
              area: {
                outside: {
                  title: 'Outside',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                entrance: {
                  title: 'Entrance',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                main: {
                  title: 'Main Room',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                corner: {
                  title: 'Corner Room',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                outdoor: {
                  title: 'Outdoor Patio',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
                restroom: {
                  title: 'Restroom',
                  url: '/gallery',
                  gallery: [
                    'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                    'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                    `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                  ],
                },
              },
              hero: {
                url: '/gallery',
                gallery: [
                  'https://s3-media0.fl.yelpcdn.com/bphoto/iPZ0-KAcKHG6sxoavkXlHQ/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/EOwGvQKZlNGCmUGNl3zvwg/o.jpg',
                  'https://s3-media0.fl.yelpcdn.com/bphoto/q16x4ttPFBZ3KaFDhfZd2g/o.jpg',
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img04,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img05,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img06,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img07,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img08,
                  `https://s3-media0.fl.yelpcdn.com/bphoto/` + img09,
                ],
              },
            },

      ],
      hero:[
        {
          hero: heroData ? heroData : null,
        },
      ],
      overview: [
        {
          header: headerData?.overview ? headerData?.overview : null,

          // Ensure overviewSummaryData is provided or fallback to null
          summary: overviewSummaryData ? overviewSummaryData : null,
          
          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,
          
          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.overview || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ],
      service: [
        {
          header: headerData?.service ? headerData?.service : null,

          
          // Ensure overviewSummaryData is provided or fallback to null
          attributes: attributesData ? attributesData : null,
          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.service || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ],
      experience: [
        {
          header: headerData?.experience ? headerData?.experience : null,

          area: areaData ? areaData : null,
          attribute: attributesData ? attributesData : null,
          // experience:
          // Ensure overviewSummaryData is provided or fallback to null

          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.experience || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
      //   },
      //     header: "experience",
      //     summary: {
      //       card: overviewSummaryData ? overviewSummaryData : null,
      //       text: textBlockData ? textBlockData : null,
      //       footer: footerData?.experience || { contributionsCount: 0, modifiedDate: '00/00/00', modifiedTime: 0 },
      //     },
      //   },
        },
      ],
      business: [
        {
          header: headerData?.business ? headerData?.business : null,

          area: areaData ? areaData : null,
          attribute: attributesData ? attributesData : null,
          // experience:
          // Ensure overviewSummaryData is provided or fallback to null

          // Ensure textBlockData is provided or fallback to null
          text: textBlockData ? textBlockData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.business || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ],
      location: [
        {
          header: headerData?.location ? headerData?.location : null,

          area: areaData ? areaData : null,
          attribute: location.locations[0] ? location.locations[0] : null,
          // experience:
          // Ensure overviewSummaryData is provided or fallback to null

          // Ensure textBlockData is provided or fallback to null
          // text: locationData ? locationData : null,

          // Ensure footerData.overview exists, otherwise use default object
          footer: footerData?.location || {
            contributionsCount: null,
            modifiedDate: null,
            modifiedTime: null,
            commentsCount: null,
            reviewsCount: null,
            likesCount: null,
            dislikesCount:  null,
          },
        },
      ]
    
  
};