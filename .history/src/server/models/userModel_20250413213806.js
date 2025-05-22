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
  likedStores: {
    type: [String],
    default: [],
  },
  dislikedStores: {
    type: [String],
    default: [],
  },
  savedStores: {
    type: [String],
    default: [],
  },
  checkedInStores: [{
    storeId: [String],
    impression: {
      type: [String],
      enum: ['like', 'dislike', null],
      default: null
    },
    checkedInAt: {
      type: Date,
      default: Date.now
    },
    // Store snapshot data
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
  timestamps: true,
  collection: 'User'
});

const UserModel = mongoose.model('user new', UserSchema);
export { UserModel };