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
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  birthdate: {
    type: Date,
    required: false
  },
  savedStores: {
    type: [String],
    default: []
  },
  checkedInStores: [{
    storeId: String,
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
});

const UserModel = mongoose.model('User', UserSchema);
export { UserModel };