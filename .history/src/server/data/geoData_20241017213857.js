
// Sample data (replace with actual data from your database)
import * as f from '../../client/assets/media/images/store/smokingTigerBreadFactory/cerritos/gallery/image01.png';
export async function getFooterData() {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    return response.json();
  }
  
export const footerData = {
    contributionsCount: 333,
    modifiedDate: '06/06/24',
    modifiedTime: 3,
    commentsCount: 333,
    reviewsCount: 333,
    likesCount: 333,
    dislikesCount: 333
  };
  
export const subStoreData = {
    distance: '0.3',
    imageUrl: 'https://eu-images.contentstack.com/v3/assets/blt58a1f8f560a1ab0e/bltbd88badeb5de1e1f/669ef3ecfd135f78652397fc/sprouts-logo_1598024112.png?width=1280&auto=webp&quality=95&format=jpg&disable=upscale',  // placeholder image
    storeName: 'BCD Tofu House'
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

export const cardCategoryData = {
  label: 'Coffee',
  rank: 1,
  itemName: 'Strawberry Matcha Latte',
  imageUrl: 'placeholder',
  itemCount: 333
};

export const summaryData = {
  experienceScore: '93',
  experience: [
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

export const textBlockData = {
  title: "Summary",
  content: "The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break. The seating arrangement of the facility is thoughtfully arranged to embraced the shared space in order to create an environment similar to a school yard during lunch break.",
};

export const textHeaderData = { 

};



export const cardAttributesData = {
  bestfor: [
    { label: 'Remote Work', count: 2 },
    { label: 'Socializing', count: 2 },
    { label: 'Zoom Calls', count: 2 },
    { label: 'Studying', count: 2 },
    { label: 'Group Study', count: 2 },
    { label: 'Reading', count: 2 },
    { label: 'Label', count: 2 },
    { label: 'Label', count: 2 },
    { label: 'Label', count: 2 }
  ],
  working: [
    { label: 'Tables', count: 2 },
    { label: 'Outlets', count: 2 },
    { label: 'Password', count: 2 },
    { label: 'Protected Wifi', count: 2 },
    { label: 'Wifi', count: 2 },
    { label: 'Single Tables', count: 2 },
    { label: 'Opens Late', count: 2 },
    { label: 'Coffee & Pastries', count: 2 },
    { label: 'Label', count: 2 }
  ],
  environment: [
    { label: 'Hipster', count: 2 },
    { label: 'Modern', count: 2 },
    { label: 'Board Games', count: 2 },
    { label: 'Alternative', count: 2 },
    { label: 'Youthful', count: 2 },
    { label: 'Korean', count: 2 },
    { label: 'Friendly', count: 2 },
    { label: 'Label', count: 2 },
    { label: 'Label', count: 2 }
  ],
  facility: [
    { label: 'Cool', count: 2 },
    { label: 'Clean', count: 2 },
    { label: 'Outdoor Seating', count: 2 },
    { label: 'Spacious', count: 2 },
    { label: 'New', count: 2 },
    { label: 'Plaza', count: 2 },
    { label: 'Coffee & Pastries', count: 2 },
    { label: 'Label', count: 2 },
    { label: 'Label', count: 2 }
  ],
};




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

export const cardGalleryData = {
  category: "Coffee",
  partnerLogo: "https://www.svgrepo.com/show/30758/yelp-logo.svg",
  // partnerLogo: "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-1/359227055_1129311967983066_3332065457673756995_n.png?stp=dst-png_s480x480&_nc_cat=105&ccb=1-7&_nc_sid=f4b9fd&_nc_ohc=cO7uZVTpkMkQ7kNvgGEHbMA&_nc_ht=scontent-lax3-1.xx&_nc_gid=AZBqoqUf4cZOZTI5D-nEmrh&oh=00_AYA3E_ITT2e71I-BXpR9Ldr10PLYvvfkR5ZZIISff12yNA&oe=670FB6E4",
  comment: "Front entrance of Smoking Tiger Bread Factory",
  userPicture: "path/to/user-picture.png"
};
