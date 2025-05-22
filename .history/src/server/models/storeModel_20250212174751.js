// models/storeModel.js
import mongoose from 'mongoose';

const SectionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
  timestamp: { type: Date, default: Date.now },
  content: mongoose.Schema.Types.Mixed,
  requestId: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

const SectionInteractionSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
    rating: { type: Number, min: 1, max: 3 },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const StoreSchema = new mongoose.Schema({
  // Core store info
  storeId: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  title: String,
  
  // Validation tracking
  validations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User03' },
    timestamp: { type: Date, default: Date.now }
  }],
  isValidated: {
    type: Boolean,
    default: false
  },

  // Source data
  contentful: {
    lastSync: Date,
    data: mongoose.Schema.Types.Mixed
  },
  yelp: {
    lastSync: Date, 
    data: mongoose.Schema.Types.Mixed
  },

  // Sections with history and interactions
  sections: {
    service: {
      content: mongoose.Schema.Types.Mixed,
      history: [SectionHistorySchema],
      interactions: SectionInteractionSchema
    },
    summary: {
      content: mongoose.Schema.Types.Mixed, 
      history: [SectionHistorySchema],
      interactions: SectionInteractionSchema
    },
    // Add other sections...
  },

  // Aggregate metrics
  metrics: {
    neustar: Number,
    totalLikes: { type: Number, default: 0 },
    totalDislikes: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    weightedScore: { type: Number, default: 0 }
  },

  // Timestamps
  lastModified: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Pre-save hook to check validation status
StoreSchema.pre('save', function(next) {
  if (this.validations.length >= 15 && !this.isValidated) {
    this.isValidated = true;
  }
  next();
});

// Method to calculate weighted scores
StoreSchema.methods.calculateWeightedScore = function() {
  // Implement 3:1 weighting of user:base scores
  // Update this.metrics.weightedScore
};

const StoreModel = mongoose.model('Store Collection', StoreSchema);
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