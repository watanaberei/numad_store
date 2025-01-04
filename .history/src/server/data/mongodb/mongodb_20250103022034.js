import mongoose from 'mongoose'; 
import { Store, storeSchema } from '../../models/storeModel.js';

mongoose.connect("mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/")
.then(() => {
    console.log("MongoDB connected");
})  
.catch(() => {
  console.log("MongoDB connection failed");
})



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
    gallery: [String],
    // Add any other fields from the Contentful store data
  }]
});

const User = mongoose.model('User03', UserSchema);

export { User, Store };