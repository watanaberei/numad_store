import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  birthdate: {
    type: Date,
  },
  checkedInStores: {
    type: [String],
    default: []
  },
  likedStores: {
    type: [String],
    default: []
  },
  dislikedStores: {
    type: [String],
    default: []
  },
  savedStores: {
    type: [String],
    default: [],
  },
  visitHistory: {
    type: [{
      storeId: String,
      timestamp: Date,
    }],
    default: [],
  },
}, { timestamps: true });

// Password validation method
userSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error (error);
  }
};

export const UserModel = mongoose.model('User', userSchema);




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