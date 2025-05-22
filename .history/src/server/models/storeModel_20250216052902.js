// models/storeModel.js
import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  sys: {
    id: String
  },
  title: String,
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  storeAttributes: [mongoose.Schema.Types.Mixed],
  featured: Boolean,
  storeNickname: String,
  hours: [mongoose.Schema.Types.Mixed],
  storeWebsite: [String],
  storeChain: Boolean,
  neustar: Number,
  googleRatings: [mongoose.Schema.Types.Mixed],
  yelpRatings: [mongoose.Schema.Types.Mixed],
  storeRatings: [mongoose.Schema.Types.Mixed],
  recommendation: [mongoose.Schema.Types.Mixed],
  overviewTitle: String,
  popularTimes: [[mongoose.Schema.Types.Mixed]],
  storeServices: [mongoose.Schema.Types.Mixed],
  handles: [mongoose.Schema.Types.Mixed],
  contact: [mongoose.Schema.Types.Mixed],
  storeChainStoresCollection: {
    items: [mongoose.Schema.Types.Mixed]
  },
  headline: {
    text: String,
    subtext: String,
    eyebrow: String
  },
  attributes: {
    experiences: [mongoose.Schema.Types.Mixed],
    services: mongoose.Schema.Types.Mixed,
    facility: mongoose.Schema.Types.Mixed,
    location: mongoose.Schema.Types.Mixed
  },
  category: {
    categoryType: String,
    genre: String
  },
  location: {
    type: String,
    geolocation: {
      lon: Number,
      lat: Number
    },
    address: String,
    region: String,
    locatedIn: String
  },
  snippet: {
    title: String,
    text: String,
    overview: String,
    foundations: String,
    facility: String,
    experience: String,
    service: String,
    location: String,
    hours: String
  },
  content: {
    overview: String
  },
  media: {
    logo: String,
    hero: String,
    thumbnail: String,
    gallery: [mongoose.Schema.Types.Mixed],
    service: [mongoose.Schema.Types.Mixed],
    area: [mongoose.Schema.Types.Mixed],
    arrangement: mongoose.Schema.Types.Mixed
  },
  variant: String
}, {
  timestamps: true,
  collection: 'store new' // Changed collection name
});

const StoreModel = mongoose.model('Store', StoreSchema);
export { StoreModel };














// const storeModel = {
//   rating: { type: Number, default: null },
//   review_count: { type: Number, default: null },
//   price: { type: String, default: null },
//   costEstimate: { type: String, default: null },
//   storeType: {
//     type: Array,
//     default: [],
//     schema: {
//       alias: { type: String, default: null },
//       title: { type: String, default: null }
//     }
//   },
//   distance: { type: String, default: null },
//   city: { type: String, default: null },
//   state: { type: String, default: null },
//   storeName: { type: String, default: null },
//   distanceMiles: { type: String, default: null },
//   status: { type: String, default: null },
//   gallery: { type: Array, default: [] },
//   overview: {
//     type: Array,
//     default: [],
//     schema: {
//       header: { type: String, default: null },
//       footer: {
//         contributionsCount: { type: Number, default: null },
//         modifiedDate: { type: String, default: null },
//         modifiedTime: { type: String, default: null },
//         commentsCount: { type: Number, default: null },
//         reviewsCount: { type: Number, default: null },
//         likesCount: { type: Number, default: null },
//         dislikesCount: { type: Number, default: null }
//       }
//     }
//   },
//   service: {
//     type: Array,
//     default: [],
//     schema: {
//       header: { type: String, default: null },
//       footer: {
//         contributionsCount: { type: Number, default: null },
//         modifiedDate: { type: String, default: null },
//         modifiedTime: { type: String, default: null },
//         commentsCount: { type: Number, default: null },
//         reviewsCount: { type: Number, default: null },
//         likesCount: { type: Number, default: null },
//         dislikesCount: { type: Number, default: null }
//       }
//     }
//   },
//   experience: {
//     type: Object,
//     default: {},
//     schema: {
//       header: { type: String, default: null },
//       footer: {
//         contributionsCount: { type: Number, default: null },
//         modifiedDate: { type: String, default: null },
//         modifiedTime: { type: String, default: null },
//         commentsCount: { type: Number, default: null },
//         reviewsCount: { type: Number, default: null },
//         likesCount: { type: Number, default: null },
//         dislikesCount: { type: Number, default: null }
//       }
//     }
//   },
//   location: {
//     type: Object,
//     default: {},
//     schema: {
//       header: { type: String, default: null },
//       attribute: { type: String, default: null },
//       footer: {
//         contributionsCount: { type: Number, default: null },
//         modifiedDate: { type: String, default: null },
//         modifiedTime: { type: String, default: null },
//         commentsCount: { type: Number, default: null },
//         reviewsCount: { type: Number, default: null },
//         likesCount: { type: Number, default: null },
//         dislikesCount: { type: Number, default: null }
//       }
//     }
//   },
//   business: {
//     type: Object,
//     default: {},
//     schema: {
//       header: { type: String, default: null },
//       timeline: {
//         id: { type: String, default: null },
//         alias: { type: String, default: null },
//         name: { type: String, default: null },
//         image_url: { type: String, default: null },
//         is_claimed: { type: Boolean, default: null },
//         is_closed: { type: Boolean, default: null },
//         url: { type: String, default: null },
//         phone: { type: String, default: null },
//         display_phone: { type: String, default: null },
//         review_count: { type: Number, default: null },
//         categories: {
//           type: Array,
//           default: [],
//           schema: {
//             alias: { type: String, default: null },
//             title: { type: String, default: null }
//           }
//         },
//         rating: { type: Number, default: null },
//         location: {
//           type: Object,
//           default: {},
//           schema: {
//             address1: { type: String, default: null },
//             address2: { type: String, default: null },
//             address3: { type: String, default: null },
//             city: { type: String, default: null },
//             zip_code: { type: String, default: null },
//             country: { type: String, default: null },
//             state: { type: String, default: null },
//             display_address: { type: Array, default: [] },
//             cross_streets: { type: String, default: null }
//           }
//         },
//         coordinates: {
//           type: Object,
//           default: {},
//           schema: {
//             latitude: { type: Number, default: null },
//             longitude: { type: Number, default: null }
//           }
//         },
//         photos: { type: Array, default: [] },
//         price: { type: String, default: null },
//         hours: {
//           type: Array,
//           default: [],
//           schema: {
//             open: {
//               type: Array,
//               default: [],
//               schema: {
//                 is_overnight: { type: Boolean, default: null },
//                 start: { type: String, default: null },
//                 end: { type: String, default: null },
//                 day: { type: Number, default: null }
//               }
//             },
//             hours_type: { type: String, default: null },
//             is_open_now: { type: Boolean, default: null }
//           }
//         },
//         attributes: {
//           type: Object,
//           default: {},
//           schema: {
//             business_url: { type: String, default: null }
//           }
//         },
//         transactions: { type: Array, default: [] },
//         messaging: {
//           type: Object,
//           default: {},
//           schema: {
//             url: { type: String, default: null },
//             use_case_text: { type: String, default: null },
//             response_rate: { type: Number, default: null },
//             response_time: { type: Number, default: null }
//           }
//         }
//       },
//       footer: {
//         contributionsCount: { type: Number, default: null },
//         modifiedDate: { type: String, default: null },
//         modifiedTime: { type: String, default: null },
//         commentsCount: { type: Number, default: null },
//         reviewsCount: { type: Number, default: null },
//         likesCount: { type: Number, default: null },
//         dislikesCount: { type: Number, default: null }
//       }
//     }
//   },
//   serviceCategoryData: {
//     type: Object,
//     default: {},
//     schema: {
//       matcha: {
//         type: Object,
//         default: {},
//         schema: {
//           rank: { type: Number, default: null },
//           category: { type: String, default: null },
//           links: {
//             type: Object,
//             default: {},
//             schema: {
//               image: { type: String, default: null }
//             }
//           },
//           items: {
//             type: Object,
//             default: {},
//             schema: {
//               first: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               second: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               third: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       coffee: {
//         type: Object,
//         default: {},
//         schema: {
//           rank: { type: Number, default: null },
//           category: { type: String, default: null },
//           links: {
//             type: Object,
//             default: {},
//             schema: {
//               image: { type: String, default: null }
//             }
//           },
//           items: {
//             type: Object,
//             default: {},
//             schema: {
//               first: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               second: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               third: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       coffee: {
//         type: Object,
//         default: {},
//         schema: {
//           rank: { type: Number, default: null },
//           category: { type: String, default: null },
//           links: {
//             type: Object,
//             default: {},
//             schema: {
//               image: { type: String, default: null }
//             }
//           },
//           items: {
//             type: Object,
//             default: {},
//             schema: {
//               first: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               second: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               third: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       coffee: {
//         type: Object,
//         default: {},
//         schema: {
//           rank: { type: Number, default: null },
//           category: { type: String, default: null },
//           links: {
//             type: Object,
//             default: {},
//             schema: {
//               image: { type: String, default: null }
//             }
//           },
//           items: {
//             type: Object,
//             default: {},
//             schema: {
//               first: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               second: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               third: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   },
//   serviceCategoryData: {
//     type: Object,
//     default: {},
//     schema: {
//       matcha: {
//         type: Object,
//         default: {},
//         schema: {
//           rank: { type: Number, default: null },
//           category: { type: String, default: null },
//           links: {
//             type: Object,
//             default: {},
//             schema: {
//               image: { type: String, default: null }
//             }
//           },
//           items: {
//             type: Object,
//             default: {},
//             schema: {
//               first: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               second: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               third: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       coffee: {
//         type: Object,
//         default: {},
//         schema: {
//           rank: { type: Number, default: null },
//           category: { type: String, default: null },
//           links: {
//             type: Object,
//             default: {},
//             schema: {
//               image: { type: String, default: null }
//             }
//           },
//           items: {
//             type: Object,
//             default: {},
//             schema: {
//               first: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               second: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               },
//               third: {
//                 type: Object,
//                 default: {},
//                 schema: {
//                   id: { type: String, default: null },
//                   rank: { type: String, default: null },
//                   name: { type: String, default: null },
//                   links: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       image: { type: String, default: null }
//                     }
//                   },
//                   source: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       name: { type: String, default: null },
//                       logo: { type: String, default: null },
//                       links: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           source: { type: String, default: null }
//                         }
//                       }
//                     }
//                   },
//                   thumbnail: {
//                     type: Object,
//                     default: {},
//                     schema: {
//                       media: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           thumbnail: { type: String, default: null }
//                         }
//                       },
//                       post: {
//                         type: Object,
//                         default: {},
//                         schema: {
//                           description: { type: String, default: null },
//                           poster: {
//                             type: Object,
//                             default: {},
//                             schema: {
//                               username: { type: String, default: null },
//                               link: {
//                                 type: Object,
//                                 default: {},
//                                 schema: {
//                                   profile: { type: String, default: null }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }