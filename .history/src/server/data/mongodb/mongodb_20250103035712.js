import mongoose from 'mongoose';
import { Store } from '../../models/storeModel.js';
import { User } from '../../models/userModel.js';

let db;

export async function getDatabase() {
  if (db) return db;
  
  try {
    // Use the existing mongoose connection
    db = mongoose.connection.db;
    return db;
  } catch (error) {
    console.error("MongoDB database access error:", error);
    throw error;
  }
}

// Keep existing mongoose connection code
mongoose.connect("mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/")
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch((err) => {
  console.error("MongoDB connection failed:", err);
});

// Keep existing connection monitoring
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Export the models
export { User, Store };










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
//     type: String,
//     required: false
//   },
//   birthdate: {
//     type: Date,
//     required: false
//   },
//   savedStores: {
//     type: [String],
//     default: []
//   },
//   checkedInStores: [{
//     storeId: String,
//     impression: {
//       type: String,
//       enum: ['like', 'dislike', null],
//       default: null
//     },
//     checkedInAt: {
//       type: Date,
//       default: Date.now
//     },
//     // Include all store fields here
//     title: String,
//     address: String,
//     city: String,
//     storeCurrentStatus: String,
//     storeRange: String,
//     neustar: Number,
//     ratings: [{
//       key: String,
//       value: String
//     }],
//     genre: String,
//     storeAttributes: [String],
//     best: [String],
//     gallery: [String],
//     // Add any other fields from the Contentful store data
//   }]
// });

// const StoreSchema = new mongoose.Schema({
//   storeId: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   name: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   address: {
//     type: String,
//     required: true
//   },

//   streetNumber: {
//     type: String,
//     required: true
//   },
//   streetName: {
//     type: String,
//     required: true
//   },
//   state: {
//     type: String,
//     required: true
//   },
//   zip: {
//     type: String,
//     required: true
//   },
//   city: {
//     type: String,
//     required: true
//   },
//   designator: {
//     type: String,
//     required: true
//   },
//   storeCurrentStatus: String,
//   storeRange: String,
//   neustar: Number,
//   ratings: [{
//     key: String,
//     value: String
//   }],
//   genre: String,
//   storeAttributes: [String],
//   best: [String],
//   gallery: [String],
//   likes: {
//     type: Number,
//     default: 0
//   },
//   dislikes: {
//     type: Number,
//     default: 0
//   }
// });