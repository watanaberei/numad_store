import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Changed require to import
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 4
    },
    username: {
      type: String,
      required: true, // NOW REQUIRED
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_-]+$/ // Only allow alphanumeric, underscore, and dash
    },
    id_user: {
      type: Number,
      required: false,
      unique: false
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: [String],
      required: false
    },
    birthdate: {
      type: [Date],
      required: false
    },
    description: {
      type: String,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    website: {
      type: String,
      required: false
    },
    phoneNumber: {
      type: String,
      required: false
    },



    // USERACTIVITY
    savedStores: {
      type: [String],
      default: []
    },
    // Simple check-in tracking
    checkedInStore: {
      type: String,
      default: null,
      unique: true
    },
    // Keep the more detailed checkedInStores array for historical data
    checkedInStores: [
      {
        storeId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        checkedInAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    impressionsLiked: 
    [
      {
        storeId: {
          type: String
        },
        sectionId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        ImpressionAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    impressionsDisliked: 
    [
      {
        storeId: {
          type: String
        },
        sectionId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        ImpressionAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    //   type: [String],
    //   default: []
      
    // },
    // impressionsDisliked: {
    //   type: [String],
    //   default: []
    // },
    visitHistory: {
      type: [
        {
          storeId: String,
          timestamp: Date
        }
      ],
      default: []
    },
    // Sync metadata
    lastSynced: { type: Date, default: Date.now },
    syncSource: String,

    // Track when it was last updated
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "User",

    // This is critical - allow any fields not defined in the schema
    strict: false
  }
);




const UserActivity = new Schema(
    {
    savedStores: {
      type: [String],
      default: []
    },
    // Simple check-in tracking
    checkedInStore: {
      type: String,
      default: null,
      unique: true
    },
    // Keep the more detailed checkedInStores array for historical data
    checkedInStores: [
      {
        storeId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        checkedInAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    impressionsLiked: 
    [
      {
        storeId: {
          type: String
        },
        sectionId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        ImpressionAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    impressionsDisliked: 
    [
      {
        storeId: {
          type: String
        },
        sectionId: {
          type: String
        },
        impression: {
          type: String,
          enum: ["like", "dislike", null],
          default: null
        },
        ImpressionAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    visitHistory: {
      type: [
        {
          storeId: String,
          timestamp: Date
        }
      ],
      default: []
    },
    // Sync metadata
    lastSynced: { type: Date, default: Date.now },
    syncSource: String,

    // Track when it was last updated
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "User",

    // This is critical - allow any fields not defined in the schema
    strict: false
  }
);


// Pre-save middleware to validate username
UserSchema.pre('save', function(next) {
  if (this.username) {
    // Convert to lowercase for consistency
    this.username = this.username.toLowerCase();
    
    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(this.username)) {
      const error = new Error('Username can only contain letters, numbers, underscores, and dashes');
      return next(error);
    }
  }
  next();
});

// Password validation method
UserSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to get user's public profile info
UserSchema.methods.getPublicProfile = function() {
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    description: this.description,
    location: this.location,
    website: this.website
  };
};

// Static method to find user by username or email
UserSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { username: identifier.toLowerCase() }
    ]
  });
};

// Create and export the model
const UserModel = mongoose.model('User', UserSchema);
export { UserModel };




// // Password validation method
// UserSchema.methods.isValidPassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// };

// export const UserModel = mongoose.model('User', UserSchema);

// // Hash password before saving the user
// UserSchema.pre("save", async function (next) {
//   try {
//     // Generate Salt for the password encryption
//     const salt = await bcrypt.genSalt(15);
//     // Generate a hashed password using Salt
//     const passwordHash = await bcrypt.hash(this.password, salt);
//     // Re-assign the hashed password to the user's acuatl password
//     this.password = passwordHash;
//     next();
//     console.log("Salt: " + salt);
//     console.log("Original password: " + this.password);
//     console.log("Hashed Password: " + passwordHash);
//   } catch (error) {
//     next(error);
//   }
// });
// // isValidPassword
// // Compare hashedpassword vs password stored in db
// UserSchema.methods.isValidPassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// // Create the model with the correct collection name
// const UserModel = mongoose.model("User", UserSchema);

// // Export using the original format
// export { UserModel };
// Password validation method
// Password validation method








// Create Module
// const UserModel = mongoose.model('user',userSchema);
// Export Module
// module.exports = UserModel;

// // Password validation method
// userSchema.methods.isValidPassword = async function(password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw new Error (error);
//   }
// };

// export const UserModel = mongoose.model('User', userSchema);

// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   firstName: {
//     type: String,
//     required: false
//   },
//   lastName: {
//     type: [String],
//     required: false
//   },
//   birthdate: {
//     type: [Date],
//     required: false
//   },
//   savedStores: {
//     type: [String],
//     default: []
//   },
//   checkedInStores: [{
//     storeId: [String],
//     impression: {
//       type: [String],
//       enum: ['like', 'dislike', null],
//       default: null
//     },
//     checkedInAt: {
//   import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   firstName: {
//     type: String,
//     default: '',
//   },
//   lastName: {
//     type: String,
//     default: '',
//   },
//   birthdate: {
//     type: Date,
//   },
//   likedStores: {
//     type: [String],
//     default: [],
//   },
//   dislikedStores: {
//     type: [String],
//     default: [],
//   },
//   savedStores: {
//     type: [String],
//     default: [],
//   },
//   // Add this field to track the current checked-in store
//   checkedInStore: {
//     type: String,
//     default: null,
//   },
//   visitHistory: {
//     type: [{
//       storeId: String,
//       timestamp: Date,
//     }],
//     default: [],
//   },
// }, { timestamps: true });

// // Password validation method
// userSchema.methods.isValidPassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// };

// export const UserModel = mongoose.model('User', userSchema);
