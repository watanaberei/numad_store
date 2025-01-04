// models/userModel.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  birthdate: Date,
  likedStores: [String],  // Array of store IDs
  dislikedStores: [String],  // Array of store IDs
  checkedInStores: [{
    storeId: { type: String, required: true },
    impression: {
      type: String,
      enum: ['like', 'dislike', null],
      default: null
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    // Include all store fields here
    title: String,
    address: String,
    city: String,
    storeCurrentStatus: String,
    storeRange: String,
    neustar: Number,
    ratings: [{
      key: String,
      value: String
    }],
    genre: String,
    storeAttributes: [String],
    best: [String],
    gallery: [String]
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User03', UserSchema);
export { User };