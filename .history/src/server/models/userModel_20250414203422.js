import mongoose from "mongoose";
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
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
    savedStores: {
      type: [String],
      default: []
    },
    checkedInStores: [
      {
        storeId: [String],
        impression: {
          type: [String],
          enum: ["like", "dislike", null],
          default: null
        }
      }
    ],
    // likedStores: {
    //   type: [String],
    //   default: []
    // },
    // dislikedStores: {
    //   type: [String],
    //   default: []
    // },
    // savedStores: {
    //   type: [String],
    //   default: [],
    // },
    visitHistory: {
      type: [
        {
          storeId: String,
          timestamp: Date
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "User",

    // This is critical - allow any fields not defined in the schema
    strict: false
  }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  try {
    // Generate Salt for the password encryption
    const salt = await bcrypt.genSalt(15);
    // Generate a hashed password using Salt
    const passwordHash = await bcrypt.hash(this.password, salt);
    // Re-assign the hashed password to the user's acuatl password
    this.password = passwordHash;
    next();
    console.log("Salt: " + salt);
    console.log("Original password: " + this.password);
    console.log("Hashed Password: " + passwordHash);
  } catch (error) {
    next(error);
  }
});
// isValidPassword
// Compare hashedpassword vs password stored in db
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Create the model with the correct collection name
const UserModel = mongoose.model("User", userSchema);

// Export using the original format
export { UserModel };
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
